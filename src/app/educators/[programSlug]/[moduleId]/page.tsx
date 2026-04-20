// app/educators/[programSlug]/[moduleId]/page.tsx
// Access is enforced server-side via course_catalog RLS policies.

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

export default async function EducationModulePage({
  params,
}: {
  params: { programSlug: string; moduleId: string }
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/educators/' + params.programSlug + '/' + params.moduleId)

  const pIdx = PROGRAMS.findIndex(p => p.slug === params.programSlug)
  if (pIdx === -1) redirect('/educators')

  const program = PROGRAMS[pIdx]
  const mIdx    = program.modules.findIndex(m => m.id === params.moduleId)
  if (mIdx === -1) redirect(`/educators/${program.slug}/${program.modules[0].id}`)

  const module = program.modules[mIdx]

  // ── DB-level access gate (RLS enforces membership_type + sub_tier) ──────────
  // Fetch video URL from course_lessons for this module
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

  const [{ data: profile }, { data: progressData }] = await Promise.all([
    supabase
      .from('profiles')
      .select('vertical, is_super_admin, is_bypassed')
      .eq('id', user.id)
      .single(),
    supabase
      .from('education_progress')
      .select('module_id')
      .eq('user_id', user.id),
  ])

  const isSuperAdmin = profile?.is_super_admin ?? false
  const isBypassed   = profile?.is_bypassed ?? false
  const isEducator   = profile?.vertical === 'education'
  const canAccess    = isSuperAdmin || isBypassed || isEducator

  if (!canAccess) {
    return (
      <CourseLockedScreen
        reason="tier_required"
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
