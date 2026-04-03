// app/leadership/[courseId]/[lessonId]/page.tsx
// Dynamic lesson route for the Leadership vertical.

import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { LeadershipLessonPlayerWrapper } from '@/components/leadership/LeadershipLessonPlayerWrapper'
import { CourseLockedScreen } from '@/components/CourseLockedScreen'
import { COURSES } from '@/lib/leadership/curriculum'

interface PageProps {
  params: { courseId: string; lessonId: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = COURSES.find(c => c.id === params.courseId)
  const lesson = course?.lessons.find(l => l.id === params.lessonId)
  if (!course || !lesson) return { title: 'Leadership | Vibe Hyr' }
  return {
    title: `${lesson.title} — ${course.title} | Vibe Hyr Leadership`,
    description: lesson.description,
  }
}

export default async function LessonPage({ params }: PageProps) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirect=/leadership/${params.courseId}/${params.lessonId}`)

  const course = COURSES.find(c => c.id === params.courseId)
  if (!course) return notFound()

  const lesson = course.lessons.find(l => l.id === params.lessonId)
  if (!lesson) return notFound()

  // ── Tier gate: check profile membership tier ────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('membership_tier')
    .eq('id', user.id)
    .single()

  const tier = profile?.membership_tier ?? 'seeker'

  const TIER_ACCESS: Record<string, string[]> = {
    seeker:         ['leadership_course_1'],
    architect:      ['leadership_course_1', 'leadership_course_2', 'leadership_course_3'],
    reality_master: ['leadership_course_1', 'leadership_course_2', 'leadership_course_3', 'leadership_course_4'],
  }

  const allowed = TIER_ACCESS[tier] ?? ['leadership_course_1']

  if (!allowed.includes(params.courseId)) {
    return (
      <CourseLockedScreen
        reason="tier_required"
        courseSlug={params.courseId}
        sectionLabel="LEADERSHIP"
        backHref="/leadership"
        backLabel="Back to Leadership"
      />
    )
  }

  return (
    <LeadershipLessonPlayerWrapper
      initialCourseId={params.courseId}
      initialLessonId={params.lessonId}
    />
  )
}
