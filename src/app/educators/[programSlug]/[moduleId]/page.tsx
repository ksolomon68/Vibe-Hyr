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
    redirect('/auth/login?redirect=/education/' + params.programSlug + '/' + params.moduleId)
  }

  const pIdx = PROGRAMS.findIndex(p => p.slug === params.programSlug)
  if (pIdx === -1) redirect('/education')
  
  const program = PROGRAMS[pIdx]
  const mIdx = program.modules.findIndex(m => m.id === params.moduleId)
  if (mIdx === -1) redirect(`/education/${program.slug}/${program.modules[0].id}`)
  
  const module = program.modules[mIdx]

  // Fetch completed modules for this user
  const { data: progressData } = await supabase
    .from('education_progress')
    .select('module_id')
    .eq('user_id', user.id)

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
