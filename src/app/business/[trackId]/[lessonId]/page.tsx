// app/business/[trackId]/[lessonId]/page.tsx
//
// Dynamic lesson route for Vibe Hyr Business Training Series.
// URL pattern: /business/[trackId]/[lessonId]

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { WorkplaceLessonPlayerWrapper } from '@/components/business/WorkplaceLessonPlayerWrapper'
import { TRACKS } from '@/lib/business/curriculum'

interface PageProps {
  params: {
    trackId: string
    lessonId: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const track = TRACKS.find(t => t.id === params.trackId)
  const lesson = track?.lessons.find(l => l.id === params.lessonId)
  
  if (!track || !lesson) {
    return { title: 'Business Training | Vibe Hyr' }
  }

  return {
    title: `${lesson.title} — ${track.title} | Vibe Hyr`,
    description: `Vibe Hyr Business Training: ${lesson.title}`,
  }
}

export default async function LessonPage({ params }: PageProps) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/business/${params.trackId}/${params.lessonId}`)
  }

  const track = TRACKS.find(t => t.id === params.trackId)
  if (!track) return notFound()

  // --- ACCESS GATING ---
  const [
    { data: profile },
    { data: courseAccessData }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('membership_tier, is_super_admin')
      .eq('id', user.id)
      .single(),
    supabase
      .from('course_access')
      .select('course_slug')
      .eq('user_id', user.id)
      .eq('course_slug', params.trackId)
  ])

  const userTier = (profile?.membership_tier as any) ?? 'seeker'
  const hasDirectAccess = (courseAccessData ?? []).length > 0

  // Tier access rules (matching WorkplaceLessonPlayerWrapper):
  //   seeker    → common-sense-in-the-workplace
  //   architect → 1-3
  //   reality_master → all
  const TIER_ACCESS: Record<string, string[]> = {
    seeker:         ["common-sense-in-the-workplace"],
    architect:      ["common-sense-in-the-workplace", "from-reaction-to-response", "know-yourself-lead-yourself"],
    reality_master: ["common-sense-in-the-workplace", "from-reaction-to-response", "know-yourself-lead-yourself", "the-high-frequency-team"],
  }
  
  const allowedTracks = TIER_ACCESS[userTier] ?? ["common-sense-in-the-workplace"]
  const canAccess = profile?.is_super_admin || allowedTracks.includes(params.trackId) || hasDirectAccess

  if (!canAccess) {
    redirect('/business?error=upgrade_required')
  }

  return (
    <WorkplaceLessonPlayerWrapper
      initialTrackId={params.trackId}
      initialLessonId={params.lessonId}
    />
  )
}
