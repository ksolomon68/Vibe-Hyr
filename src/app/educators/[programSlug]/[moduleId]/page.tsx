import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { PROGRAMS } from '@/lib/education/curriculum'
import EducationPageClient from './client'
import { redirect } from 'next/navigation'

export default async function EducationModulePage({
  params
}: {
  params: { programSlug: string; moduleId: string }
}) {
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
    redirect('/auth/login?redirect=/educators/' + params.programSlug + '/' + params.moduleId)
  }

  const pIdx = PROGRAMS.findIndex(p => p.slug === params.programSlug)
  if (pIdx === -1) redirect('/educators')
  
  const program = PROGRAMS[pIdx]
  const mIdx = program.modules.findIndex(m => m.id === params.moduleId)
  if (mIdx === -1) redirect(`/educators/${program.slug}/${program.modules[0].id}`)
  
  const module = program.modules[mIdx]

  // --- ACCESS GATING ---
  const PROGRAM_TIERS: Record<string, string> = {
    'the-educator-reset': 'free',
    'vibrational-leadership': 'architect',
    'co-regulation-mastery': 'architect',
    'the-retained-educator': 'elite'
  }

  const [
    { data: profile },
    { data: progressData },
    { data: courseAccessData }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('membership_tier, is_super_admin')
      .eq('id', user.id)
      .single(),
    supabase
      .from('education_progress')
      .select('module_id')
      .eq('user_id', user.id),
    supabase
      .from('course_access')
      .select('course_slug')
      .eq('user_id', user.id)
      .eq('course_slug', params.programSlug)
  ])

  const userTier = (profile?.membership_tier as any) ?? 'free'
  const requiredTier = PROGRAM_TIERS[params.programSlug] ?? 'free'
  const hasDirectAccess = (courseAccessData ?? []).length > 0

  // Admin access (architect or elite) or direct grant
  const hasTierAccess = (userTier === 'architect' || userTier === 'elite' || userTier === 'admin')
  
  // Note: hasAccess(userTier, requiredTier) is better if hierarchy is strict
  // For Educators, seeker(free) gets Reset, Architect gets 1-3, Elite gets all.
  const TIER_RANK: Record<string, number> = { free: 0, architect: 1, elite: 2 }
  const canAccess = profile?.is_super_admin || TIER_RANK[userTier] >= TIER_RANK[requiredTier] || hasDirectAccess

  if (!canAccess) {
    redirect('/educators?error=upgrade_required')
  }

  const initialCompleted = progressData?.map(p => p.module_id) || []

  return (
    <EducationPageClient
      initialProgramIdx={pIdx}
      initialModuleIdx={mIdx}
      program={program}
      module={module}
      userId={user.id}
      initialCompleted={initialCompleted}
    />
  )
}
