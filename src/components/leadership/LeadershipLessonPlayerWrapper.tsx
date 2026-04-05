"use client";

// components/leadership/LeadershipLessonPlayerWrapper.tsx
//
// Wraps LeadershipLessonPlayer with:
//   1. Supabase progress loading/saving
//   2. Membership tier gate
//   3. URL sync — pushes route on lesson change
//   4. Course completion tracking

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LeadershipLessonPlayer from "./LeadershipLessonPlayer";
import { PageLoader } from "@/components/shared/PageLoader";
import { TIER_ACCESS, COURSE_LESSON_COUNTS } from "@/lib/leadership/curriculum";
import type { Lesson } from "@/types";

interface WrapperProps {
  initialCourseId?: string;
  initialLessonId?: string;
  initialLessons?:  Lesson[];
}

export function LeadershipLessonPlayerWrapper({
  initialCourseId = "leadership_course_1",
  initialLessonId = "the-responsibility-formula",
  initialLessons = [],
}: WrapperProps) {
  const supabase = createClient();
  const router   = useRouter();
  const [, startTransition] = useTransition();

  const [userId,   setUserId]   = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>("seeker");
  const [progress, setProgress] = useState<Record<string, string[]>>({});
  const [loading,  setLoading]  = useState(true);

  // ── Load user + progress on mount ─────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/auth/login?redirect=/leadership/${initialCourseId}/${initialLessonId}`);
        return;
      }

      const uid = user.id;
      setUserId(uid);

      // Fetch membership tier
      const { data: profile } = await supabase
        .from("profiles")
        .select("membership_tier")
        .eq("id", uid)
        .single();
      setUserTier(profile?.membership_tier ?? "seeker");

      // Fetch leadership progress
      const { data: prog } = await supabase
        .from("leadership_progress")
        .select("course_id, lesson_id")
        .eq("user_id", uid);

      if (prog) {
        const map: Record<string, string[]> = {};
        for (const row of prog) {
          if (!map[row.course_id]) map[row.course_id] = [];
          map[row.course_id].push(row.lesson_id);
        }
        setProgress(map);
      }

      setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save completion to Supabase ────────────────────────────────────────────
  const handleComplete = useCallback(async (courseId: string, lessonId: string) => {
    if (!userId) return;

    // Optimistically update local state
    setProgress(prev => ({
      ...prev,
      [courseId]: [...(prev[courseId] ?? []), lessonId],
    }));

    // Upsert to DB
    await supabase.from("leadership_progress").upsert(
      {
        user_id:      userId,
        course_id:    courseId,
        lesson_id:    lessonId,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_id,lesson_id" }
    );

    // Check course completion
    const lessonCount = COURSE_LESSON_COUNTS[courseId] ?? 0;
    const newCount    = (progress[courseId]?.length ?? 0) + 1;
    if (newCount >= lessonCount) {
      await supabase.from("leadership_course_completions").upsert(
        {
          user_id:      userId,
          course_id:    courseId,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_id" }
      );
      // Fire-and-forget completion email
      fetch("/api/email/track-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, trackId: courseId, vertical: "leadership" }),
      }).catch((err) => console.error("[leadership course-complete email]", err));
    }
  }, [userId, progress, supabase]);

  // ── URL sync ───────────────────────────────────────────────────────────────
  const handleNavigate = useCallback((courseId: string, lessonId: string) => {
    startTransition(() => {
      router.push(`/leadership/${courseId}/${lessonId}`, { scroll: false });
    });
  }, [router]);

  if (loading) {
    return <PageLoader text="LOADING YOUR PROGRESS..." />;
  }

  const allowedCourses = TIER_ACCESS[userTier] ?? ["leadership_course_1"];

  return (
    <LeadershipLessonPlayer
      initialCourseId={initialCourseId}
      initialLessonId={initialLessonId}
      initialLessons={initialLessons}
      externalProgress={progress}
      allowedCourses={allowedCourses}
      onLessonComplete={handleComplete}
      onNavigate={handleNavigate}
      userTier={userTier}
    />
  )
}
