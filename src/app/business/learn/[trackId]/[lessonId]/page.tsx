// app/workplace/learn/[trackId]/[lessonId]/page.tsx
//
// Dynamic lesson route for Vibe Hyr Workplace Training Series.
// URL pattern: /workplace/learn/t1/t1l1
//
// Auth gate is handled by middleware.ts (src/lib/supabase/middleware.ts)
// which redirects unauthenticated users to /auth/login?redirect=...
// Membership tier gating is handled by WorkplaceLessonPlayerWrapper.

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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

const TRACK_TIERS: Record<string, string> = {
  t1: 'free',
  t2: 'architect',
  t3: 'architect',
  t4: 'elite'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const title = TRACK_TITLES[params.trackId] ?? 'Business Training'
  return {
    title: `${title} | Vibe Hyr Business`,
    description:
      'Vibe Hyr Business Training Series — neuroscience-grounded professional development.',
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
    redirect(`/auth/login?redirect=/business/learn/${params.trackId}/${params.lessonId}`)
  }

  // --- ACCESS GATING ---
  const [
    { data: profile },
    { data: courseAccessData }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('membership_tier')
      .eq('id', user.id)
      .single(),
    supabase
      .from('course_access')
      .select('course_slug')
      .eq('user_id', user.id)
      .eq('course_slug', params.trackId)
  ])

  const userTier = (profile?.membership_tier as any) ?? 'free'
  const requiredTier = TRACK_TIERS[params.trackId] ?? 'free'
  const hasDirectAccess = (courseAccessData ?? []).length > 0

  const TIER_RANK: Record<string, number> = { free: 0, architect: 1, elite: 2 }
  const canAccess = TIER_RANK[userTier] >= TIER_RANK[requiredTier] || hasDirectAccess

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
