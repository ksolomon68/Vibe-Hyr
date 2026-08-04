// app/educators/[programSlug]/[moduleId]/page.tsx
// Access is enforced server-side via course_catalog RLS policies.

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PROGRAMS } from '@/lib/education/curriculum'
import { CourseLockedScreen } from '@/components/CourseLockedScreen'
import EducationPageClient from './client'

const PROGRAM_COURSE_ID: Record<string, number> = {
  'ed01': 9,
  'ed02': 10,
  'ed03': 11,
  'ed04': 12,
}

const PREVIEW_LESSON = { programSlug: 'the-educator-reset', moduleId: 'ed01-m01' }

// Mirrors TIER_CONFIG in lib/stripe/config.ts — which educator programs each
// paid tier unlocks. Institutional Seeker is paid (unlike individual Seeker,
// which is free); there is no free tier for the educator vertical.
const EDUCATOR_TIER_ACCESS: Record<string, string[]> = {
  free:      ['the-educator-reset'],
  architect: ['the-educator-reset', 'vibrational-leadership', 'co-regulation-mastery'],
  elite:     ['the-educator-reset', 'vibrational-leadership', 'co-regulation-mastery', 'the-retained-educator'],
}

export default async function EducationModulePage({
  params,
}: {
  params: { programSlug: string; moduleId: string }
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const isPreview = params.programSlug === PREVIEW_LESSON.programSlug && params.moduleId === PREVIEW_LESSON.moduleId

  if (!user && !isPreview) {
    redirect('/auth/login?redirect=/educators/' + params.programSlug + '/' + params.moduleId)
  }

  const pIdx = PROGRAMS.findIndex(p => p.slug === params.programSlug)
  if (pIdx === -1) redirect('/educators')

  const program = PROGRAMS[pIdx]
  const mIdx    = program.modules.findIndex(m => m.id === params.moduleId)
  if (mIdx === -1) redirect(`/educators/${program.slug}/${program.modules[0].id}`)

  const module = program.modules[mIdx]

  // ── Fetch video URL ─────────────────────────────────────────────────────────
  const courseId = PROGRAM_COURSE_ID[program.id]
  let videoUrl: string | null = null
  if (courseId) {
    const admin = createAdminClient()
    const { data: lessonRow } = await admin
      .from('course_lessons')
      .select('youtube_url')
      .eq('course_id', courseId)
      .eq('title', module.title)
      .maybeSingle()
    videoUrl = lessonRow?.youtube_url ?? null
  }

  // ── Access gate + progress (authenticated users only) ──────────────────────
  if (user) {
    const [{ data: profile }, { data: progressData }, { data: directGrant }] = await Promise.all([
      supabase
        .from('profiles')
        .select('membership_tier, vertical, is_super_admin, is_bypassed')
        .eq('id', user.id)
        .single(),
      supabase
        .from('education_progress')
        .select('module_id')
        .eq('user_id', user.id),
      supabase
        .from('course_access')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_slug', program.slug)
        .maybeSingle(),
    ])

    const isSuperAdmin   = profile?.is_super_admin ?? false
    const isBypassed     = profile?.is_bypassed ?? false
    const hasDirectGrant = !!directGrant
    const tier           = profile?.membership_tier ?? 'free'
    const isEducator     = profile?.vertical === 'education'
    const tierUnlocked   = isEducator && (EDUCATOR_TIER_ACCESS[tier] ?? EDUCATOR_TIER_ACCESS['free']).includes(program.slug)
    const canAccess       = isSuperAdmin || isBypassed || hasDirectGrant || tierUnlocked

    if (!canAccess && !isPreview) {
      return (
        <CourseLockedScreen
          reason={isEducator ? 'tier_required' : 'wrong_vertical'}
          courseSlug={params.programSlug}
          sectionLabel="EDUCATOR"
          backHref="/educators"
          backLabel="Back to Programs"
        />
      )
    }

    const initialCompleted = progressData?.map(p => p.module_id) ?? []

    return (
      <EducationPageClient
        initialProgramIdx={pIdx}
        initialModuleIdx={mIdx}
        program={program}
        module={module}
        userId={user.id}
        initialCompleted={initialCompleted}
        videoUrl={videoUrl}
      />
    )
  }

  // Guest preview
  return (
    <EducationPageClient
      initialProgramIdx={pIdx}
      initialModuleIdx={mIdx}
      program={program}
      module={module}
      userId={null}
      initialCompleted={[]}
      videoUrl={videoUrl}
    />
  )
}
