// app/business/[trackId]/[lessonId]/page.tsx
// Dynamic lesson route for Vibe Hyr Business Training Series.
// Access is enforced server-side via course_catalog RLS policies.

import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { WorkplaceLessonPlayerWrapper } from '@/components/business/WorkplaceLessonPlayerWrapper'
import { CourseLockedScreen } from '@/components/CourseLockedScreen'
import { TRACKS } from '@/lib/business/curriculum'

interface PageProps {
  params: { trackId: string; lessonId: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const track  = TRACKS.find(t => t.id === params.trackId)
  const lesson = track?.lessons.find(l => l.id === params.lessonId)
  if (!track || !lesson) return { title: 'Business Training | Vibe Hyr' }
  return {
    title: `${lesson.title} — ${track.title} | Vibe Hyr`,
    description: `Vibe Hyr Business Training: ${lesson.title}`,
  }
}

export default async function LessonPage({ params }: PageProps) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirect=/business/${params.trackId}/${params.lessonId}`)

  const track = TRACKS.find(t => t.id === params.trackId)
  if (!track) return notFound()

  // ── DB-level access gate (RLS enforces membership_type + sub_tier) ──────────
  // course_catalog query returns null if the user's entitlements don't match —
  // this is the authoritative security check, not a client-side UI hint.
  const { data: catalogEntry } = await supabase
    .from('course_catalog')
    .select('id')
    .eq('slug', params.trackId)
    .maybeSingle()

  if (!catalogEntry) {
    return (
      <CourseLockedScreen
        reason="tier_required"
        courseSlug={params.trackId}
        sectionLabel="BUSINESS"
        backHref="/business"
        backLabel="Back to Training"
      />
    )
  }

  return (
    <WorkplaceLessonPlayerWrapper
      initialTrackId={params.trackId}
      initialLessonId={params.lessonId}
    />
  )
}
