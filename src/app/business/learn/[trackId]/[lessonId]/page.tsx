// app/workplace/learn/[trackId]/[lessonId]/page.tsx
//
// Dynamic lesson route for Vibe Hyr Workplace Training Series.
// URL pattern: /workplace/learn/t1/t1l1
//
// Auth gate is handled by middleware.ts (src/lib/supabase/middleware.ts)
// which redirects unauthenticated users to /auth/login?redirect=...
// Membership tier gating is handled by WorkplaceLessonPlayerWrapper.

import type { Metadata } from 'next'
import { WorkplaceLessonPlayerWrapper } from '@/components/business/WorkplaceLessonPlayerWrapper'

interface PageProps {
  params: {
    trackId: string
    lessonId: string
  }
}

const TRACK_TITLES: Record<string, string> = {
  t1: 'Common Sense in the Workplace',
  t2: 'From Reaction to Response',
  t3: 'Know Yourself, Lead Yourself',
  t4: 'Vibing as a Unit',
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const title = TRACK_TITLES[params.trackId] ?? 'Business Training'
  return {
    title: `${title} | Vibe Hyr Business`,
    description:
      'Vibe Hyr Business Training Series — neuroscience-grounded professional development.',
  }
}

export default function LessonPage({ params }: PageProps) {
  return (
    <WorkplaceLessonPlayerWrapper
      initialTrackId={params.trackId}
      initialLessonId={params.lessonId}
    />
  )
}
