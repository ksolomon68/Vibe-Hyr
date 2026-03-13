"use client";

// components/workplace/WorkplaceLessonPlayerWrapper.tsx
//
// Wraps the lesson player with:
//   1. Supabase progress loading/saving
//   2. Membership tier gate (Seeker gets Track 01 free; Architect/Reality Master get all)
//   3. URL sync — pushes route on lesson change so back/forward works
//   4. Completion webhook trigger

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import WorkplaceLessonPlayer from "./WorkplaceLessonPlayer";

interface WrapperProps {
  initialTrackId?: string;
  initialLessonId?: string;
}

// Tier access rules:
//   seeker    → Track 01 only (free beta)
//   architect → Tracks 01–03
//   reality_master → all 4 tracks
const TIER_ACCESS: Record<string, string[]> = {
  seeker:         ["common-sense-in-the-workplace"],
  architect:      ["common-sense-in-the-workplace", "from-reaction-to-response", "know-yourself-lead-yourself"],
  reality_master: ["common-sense-in-the-workplace", "from-reaction-to-response", "know-yourself-lead-yourself", "the-high-frequency-team"],
};

export function WorkplaceLessonPlayerWrapper({
  initialTrackId = "common-sense-in-the-workplace",
  initialLessonId = "the-awareness-gap",
}: WrapperProps) {
  const supabase = createClient();
  const router   = useRouter();
  const [, startTransition] = useTransition();

  const [userId,    setUserId]    = useState<string | null>(null);
  const [userTier,  setUserTier]  = useState<string>("seeker");
  const [progress,  setProgress]  = useState<Record<string, string[]>>({});
  const [loading,   setLoading]   = useState(true);

  // ── Load user + progress on mount ─────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth/login?redirect=/business"); return; }

      const uid = user.id;
      setUserId(uid);

      // Fetch membership tier
      const { data: profile } = await supabase
        .from("profiles")
        .select("membership_tier")
        .eq("id", uid)
        .single();
      setUserTier(profile?.membership_tier ?? "seeker");

      // Fetch workplace progress
      const { data: prog } = await supabase
        .from("workplace_progress")
        .select("track_id, lesson_id")
        .eq("user_id", uid);

      if (prog) {
        const map: Record<string, string[]> = {};
        for (const row of prog) {
          if (!map[row.track_id]) map[row.track_id] = [];
          map[row.track_id].push(row.lesson_id);
        }
        setProgress(map);
      }

      setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save completion to Supabase ────────────────────────────────────────────
  const handleComplete = useCallback(async (trackId: string, lessonId: string) => {
    if (!userId) return;

    // Optimistically update local state
    setProgress(prev => ({
      ...prev,
      [trackId]: [...(prev[trackId] ?? []), lessonId],
    }));

    // Upsert to DB
    await supabase.from("workplace_progress").upsert(
      { user_id: userId, track_id: trackId, lesson_id: lessonId, completed_at: new Date().toISOString() },
      { onConflict: "user_id,track_id,lesson_id" }
    );

    // Check track completion → record + send branded email
    const trackLessonCounts: Record<string, number> = { 
      "common-sense-in-the-workplace": 6, 
      "from-reaction-to-response": 6, 
      "know-yourself-lead-yourself": 3, 
      "the-high-frequency-team": 1 
    };
    const newCount = (progress[trackId]?.length ?? 0) + 1;
    if (newCount >= trackLessonCounts[trackId]) {
      await supabase.from("track_completions").upsert(
        { user_id: userId, track_id: trackId, completed_at: new Date().toISOString() },
        { onConflict: "user_id,track_id" }
      );
      // Fire-and-forget branded completion email via server route
      fetch("/api/email/track-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, trackId }),
      }).catch((err) => console.error("[track-complete email]", err));
    }
  }, [userId, progress, supabase]);

  // ── URL sync ───────────────────────────────────────────────────────────────
  const handleNavigate = useCallback((trackId: string, lessonId: string) => {
    startTransition(() => {
      router.push(`/business/${trackId}/${lessonId}`, { scroll: false });
    });
  }, [router]);

  if (loading) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0E0C08",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#E8621A",
            fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.1em", marginBottom: 12 }}>
            VIBE HYR
          </div>
          <div style={{ fontSize: 12, color: "#5A4A34", letterSpacing: "0.14em" }}>
            LOADING YOUR PROGRESS...
          </div>
        </div>
      </div>
    );
  }

  const allowedTracks = TIER_ACCESS[userTier] ?? ["common-sense-in-the-workplace"];

  return (
    <WorkplaceLessonPlayer
      initialTrackId={initialTrackId}
      initialLessonId={initialLessonId}
      externalProgress={progress}
      allowedTracks={allowedTracks}
      onLessonComplete={handleComplete}
      onNavigate={handleNavigate}
      userTier={userTier}
    />
  );
}
