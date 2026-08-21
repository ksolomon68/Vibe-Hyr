// app/leadership/[courseId]/[lessonId]/page.tsx
// Dynamic lesson route for the Leadership vertical.

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { LeadershipLessonPlayerWrapper } from '@/components/leadership/LeadershipLessonPlayerWrapper'
import { CourseLockedScreen } from '@/components/CourseLockedScreen'
import { COURSES } from '@/lib/leadership/curriculum'
import { getLessonsWithDBFallback } from '@/lib/data/courseContent'

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

  if (!user) {
    redirect(`/auth/login?redirect=/leadership/${params.courseId}/${params.lessonId}`)
  }

  const course = COURSES.find(c => c.id === params.courseId)
  if (!course) return notFound()

  const lesson = course.lessons.find(l => l.id === params.lessonId)
  if (!lesson) return notFound()

  // ── Tier gate (authenticated users only) ───────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('membership_tier, membership_type, vertical, is_super_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_super_admin) {
    const isLeadership = profile?.membership_type === 'leadership' || profile?.vertical === 'leadership'
    const tier = profile?.membership_tier ?? 'free'

    const TIER_ACCESS: Record<string, string[]> = {
      free:      ['leadership_course_1'],
      architect: ['leadership_course_1', 'leadership_course_2', 'leadership_course_3'],
      elite:     ['leadership_course_1', 'leadership_course_2', 'leadership_course_3', 'leadership_course_4'],
    }

    const allowed = isLeadership ? (TIER_ACCESS[tier] ?? ['leadership_course_1']) : []

    if (!allowed.includes(params.courseId)) {
      return (
        <CourseLockedScreen
          reason={isLeadership ? 'tier_required' : 'wrong_vertical'}
          courseSlug={params.courseId}
          sectionLabel="LEADERSHIP"
          backHref="/leadership"
          backLabel="Back to Leadership"
        />
      )
    }
  }

  const COURSE_ID_MAP: Record<string, number> = {
    leadership_course_1: 13,
    leadership_course_2: 14,
    leadership_course_3: 15,
    leadership_course_4: 16,
  }
  const numericId = COURSE_ID_MAP[params.courseId] ?? 0
  const dbLessons = await getLessonsWithDBFallback(params.courseId, numericId)

  return (
    <LeadershipLessonPlayerWrapper
      initialCourseId={params.courseId}
      initialLessonId={params.lessonId}
      initialLessons={dbLessons}
      isGuest={false}
    />
  )
}
