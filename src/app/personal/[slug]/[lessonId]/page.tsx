import { notFound, redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import { COURSES } from '@/lib/data/courses'
import { getLessonsForCourse, getLessonQuiz } from '@/lib/data/lessons'
import { canAccessCourse } from '@/lib/courseAccess'
import { CourseLockedScreen } from '@/components/CourseLockedScreen'
import { LessonPlayerClient } from '@/components/personal/LessonPlayerClient'
import type { MembershipTier } from '@/types'

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

  const lessons = getLessonsForCourse(course.id)
  const lesson  = lessons.find(l => l.id === params.lessonId)
  if (!lesson) notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userTier: MembershipTier   = 'free'
  let institutionType            = 'individual'
  let completedLessons: string[] = []
  let passedQuizzes: string[]    = []
  let hasDirectAccess            = false

  if (user) {
    const [
      { data: profile },
      { data: progress },
      { data: quizAttempts },
      { data: courseAccessData }
    ] = await Promise.all([
      // Membership tier + institution type
      supabase
        .from('profiles')
        .select('membership_tier, institution_type')
        .eq('id', user.id)
        .single(),

      // Completed lessons
      supabase
        .from('course_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('course_id', course.id),

      // Passed quizzes
      supabase
        .from('course_quiz_attempts')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('passed', true),

      // Direct course access grants (e.g. from seats or manual admin grant)
      supabase
        .from('course_access')
        .select('course_slug')
        .eq('user_id', user.id)
        .eq('course_slug', course.slug)
    ])

    userTier         = (profile?.membership_tier as MembershipTier) ?? 'free'
    institutionType  = profile?.institution_type ?? 'individual'
    completedLessons = (progress ?? []).map((r: { lesson_id: string }) => r.lesson_id)
    passedQuizzes    = (quizAttempts ?? []).map((r: { lesson_id: string }) => r.lesson_id)
    hasDirectAccess  = (courseAccessData ?? []).length > 0

    // Preview lessons are always accessible regardless of tier or institution
    if (!lesson.is_preview && !hasDirectAccess) {
      const { allowed, reason } = canAccessCourse(course.slug, userTier, institutionType)

      if (!allowed) {
        return (
          <>
            <Navbar />
            <CourseLockedScreen reason={reason!} courseSlug={course.slug} />
          </>
        )
      }
    }
  } else if (!lesson.is_preview) {
    // Redirect unauthenticated users away from non-preview lessons
    redirect(`/auth/login?redirect=/personal/${course.slug}/${lesson.id}`)
  }

  const quiz = getLessonQuiz(lesson.id)

  // Build prev/next navigation
  const idx        = lessons.findIndex(l => l.id === lesson.id)
  const prevLesson = idx > 0 ? lessons[idx - 1] : null
  const nextLesson = idx < lessons.length - 1 ? lessons[idx + 1] : null

  return (
    <>
      <Navbar />
      <LessonPlayerClient
        course={course}
        lesson={lesson}
        lessons={lessons}
        quiz={quiz}
        completedLessons={completedLessons}
        passedQuizzes={passedQuizzes}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
        userTier={userTier}
        isLoggedIn={!!user}
      />
    </>
  )
}
