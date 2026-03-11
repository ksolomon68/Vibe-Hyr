// app/workplace/learn/[trackId]/[lessonId]/page.tsx
//
// Dynamic lesson route for Vibe Hyr Workplace Training Series.
// URL pattern: /workplace/learn/t1/t1l1
//
// Auth gate is handled by middleware.ts — this page assumes an
// authenticated, authorized user.

import type { Metadata } from "next";
import { WorkplaceLessonPlayerWrapper } from "@/components/workplace/WorkplaceLessonPlayerWrapper";

interface PageProps {
  params: {
    trackId: string;
    lessonId: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const trackTitles: Record<string, string> = {
    t1: "Common Sense in the Workplace",
    t2: "From Reaction to Response",
    t3: "Know Yourself, Lead Yourself",
    t4: "Vibing as a Unit",
  };
  const title = trackTitles[params.trackId] ?? "Workplace Training";
  return {
    title: `${title} | Vibe Hyr Workplace`,
    description: "Vibe Hyr Workplace Training Series — neuroscience-grounded professional development.",
  };
}

export default function LessonPage({ params }: PageProps) {
  return (
    <WorkplaceLessonPlayerWrapper
      initialTrackId={params.trackId}
      initialLessonId={params.lessonId}
    />
  );
}
