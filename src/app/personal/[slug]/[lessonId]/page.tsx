import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { COURSES } from '@/lib/data/courses'
import { getLessonsForCourse, getLessonQuiz, getLessonLab } from '@/lib/data/lessons'
import { getLessonsWithDBFallback } from '@/lib/data/courseContent'
import { canAccessCourse } from '@/lib/courseAccess'
import { CourseLockedScreen } from '@/components/CourseLockedScreen'
import { LessonPlayerClient } from '@/components/personal/LessonPlayerClient'
import type { MembershipTier } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// course_catalog RLS is the authoritative security gate.
// canAccessCourse() is used only to determine the UX reason (institution vs tier).


export async function generateStaticParams() {
  const params: { slug: string; lessonId: string }[] = []
  for (const course of COURSES) {
    const lessons = getLessonsForCourse(course.id)
    for (const lesson of lessons) {
      params.push({ slug: course.slug, lessonId: lesson.id })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; lessonId: string }
}) {
  const course = COURSES.find(c => c.slug === params.slug)
  const lesson = getLessonsForCourse(course?.id ?? '').find(l => l.id === params.lessonId)
  if (!course || !lesson) return {}
  return {
    title: `${lesson.title} — ${course.title} | Vibe Hyr`,
  }
}

export default async function LessonPage({
  params,
}: {
  params: { slug: string; lessonId: string }
}) {
  const course = COURSES.find(c => c.slug === params.slug)
  if (!course) notFound()

  const lessons = await getLessonsWithDBFallback(course.id, course.order_index)
  const lesson  = lessons.find(l => l.id === params.lessonId)
  if (!lesson) notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userTier: MembershipTier   = 'free'
  let institutionType            = 'individual'
  let completedLessons: string[] = []
  let passedQuizzes: string[]    = []
  let hasDirectAccess            = false
  let membershipType: string | null = null
  let role: string | null           = null

  if (user) {
    const [
      { data: profile },
      { data: progress },
      { data: quizAttempts },
      { data: courseAccessData },
      { data: catalogEntry },
    ] = await Promise.all([
      supabase.from('profiles')
        .select('id, org_id, membership_tier, institution_type, is_super_admin, membership_type, role')
        .eq('id', user.id).single(),
      supabase.from('course_progress')
        .select('lesson_id')
        .eq('user_id', user.id).eq('course_id', course.id),
      supabase.from('course_quiz_attempts')
        .select('lesson_id')
        .eq('user_id', user.id).eq('passed', true),
      supabase.from('course_access')
        .select('course_slug')
        .eq('user_id', user.id).eq('course_slug', course.slug),
      // DB-level access gate: RLS returns null if user lacks entitlement
      supabase.from('course_catalog')
        .select('id')
        .eq('slug', course.slug)
        .maybeSingle(),
    ])

    userTier         = (profile?.membership_tier as MembershipTier) ?? 'free'
    institutionType  = profile?.institution_type ?? 'individual'
    completedLessons = (progress ?? []).map((r: { lesson_id: string }) => r.lesson_id)
    passedQuizzes    = (quizAttempts ?? []).map((r: { lesson_id: string }) => r.lesson_id)
    hasDirectAccess  = (courseAccessData ?? []).length > 0
    membershipType   = profile?.membership_type ?? null
    role             = profile?.role ?? null

    // Super admins bypass all access gates
    if (!profile?.is_super_admin) {
      // Preview lessons are always accessible regardless of tier or institution
      if (!lesson.is_preview && !hasDirectAccess) {
        // Primary gate: DB RLS (authoritative — blocks direct URL access too)
        if (!catalogEntry) {
          // Use canAccessCourse only to determine the reason for the locked screen UX
          const { reason } = await canAccessCourse(course.slug, userTier, institutionType, profile ?? undefined)
          return <CourseLockedScreen reason={reason ?? 'tier_required'} courseSlug={course.slug} sectionLabel="PERSONAL" />
        }
      }
    }
  } else if (!lesson.is_preview) {
    // Redirect unauthenticated users away from non-preview lessons
    redirect(`/auth/login?redirect=/personal/${course.slug}/${lesson.id}`)
  }

  const quiz = getLessonQuiz(lesson)
  const lab  = getLessonLab(lesson)

  // Build prev/next navigation
  const idx        = lessons.findIndex(l => l.id === lesson.id)
  const prevLesson = idx > 0 ? lessons[idx - 1] : null
  const nextLesson = idx < lessons.length - 1 ? lessons[idx + 1] : null

  return (
    <LessonPlayerClient
      course={course}
      lesson={lesson}
      lessons={lessons}
      quiz={quiz}
      assumptionLab={lab}
      completedLessons={completedLessons}
      passedQuizzes={passedQuizzes}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
      userTier={userTier}
      isLoggedIn={!!user}
      membershipType={membershipType}
      role={role}
    />
  )
}
