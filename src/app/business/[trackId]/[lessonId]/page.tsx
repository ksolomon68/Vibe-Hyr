// app/business/[trackId]/[lessonId]/page.tsx
// Dynamic lesson route for Vibe Hyr Business Training Series.
// Access is enforced server-side via course_catalog RLS policies.

import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { WorkplaceLessonPlayerWrapper } from '@/components/business/WorkplaceLessonPlayerWrapper'
import { CourseLockedScreen } from '@/components/CourseLockedScreen'
import { TRACKS } from '@/lib/business/curriculum'

const TRACK_COURSE_ID: Record<string, number> = {
  'common-sense-in-the-workplace': 5,
  'from-reaction-to-response':     6,
  'know-yourself-lead-yourself':   7,
  'the-high-frequency-team':       8,
}

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

  // ── Load rich lesson content from DB (course_lessons) ────────────────────────
  const courseId = TRACK_COURSE_ID[params.trackId]
  let dbLessonContent: string | null = null
  if (courseId) {
    const lesson = track.lessons.find(l => l.id === params.lessonId)
    if (lesson) {
      const admin = createAdminClient()
      const { data } = await admin
        .from('course_lessons')
        .select('content')
        .eq('course_id', courseId)
        .eq('title', lesson.title)
        .eq('is_published', true)
        .maybeSingle()
      dbLessonContent = data?.content ?? null
    }
  }

  // ── Access gate: profile-based tier + institution_type check ────────────────
  const BUSINESS_TIER_ACCESS: Record<string, string[]> = {
    free:      ['common-sense-in-the-workplace'],
    architect: ['common-sense-in-the-workplace', 'from-reaction-to-response', 'know-yourself-lead-yourself'],
    elite:     ['common-sense-in-the-workplace', 'from-reaction-to-response', 'know-yourself-lead-yourself', 'the-high-frequency-team'],
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('membership_tier, institution_type, is_super_admin, is_bypassed')
    .eq('id', user.id)
    .single()

  const tier         = profile?.membership_tier ?? 'free'
  const isSuperAdmin = !!profile?.is_super_admin
  const isBypassed   = !!profile?.is_bypassed
  const instType     = profile?.institution_type ?? 'personal'
  const allowed      = (isSuperAdmin || isBypassed)
    ? Object.values(BUSINESS_TIER_ACCESS).at(-1)!
    : (BUSINESS_TIER_ACCESS[tier] ?? BUSINESS_TIER_ACCESS['free'])

  const canAccess = isSuperAdmin || isBypassed || (instType === 'business' && allowed.includes(params.trackId))

  if (!canAccess) {
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
      dbLessonContent={dbLessonContent}
    />
  )
}
