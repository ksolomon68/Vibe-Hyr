// app/leadership/[courseId]/page.tsx
// Course detail page for the Leadership vertical.

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, FileText } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { COURSES } from '@/lib/leadership/curriculum'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: { courseId: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = COURSES.find(c => c.id === params.courseId)
  if (!course) return { title: 'Leadership | Vibe Hyr' }
  return {
    title: `${course.title} — Leadership | Vibe Hyr`,
    description: course.description,
  }
}

const LEADERSHIP_PREV: Record<string, string | null> = {
  leadership_course_1: null,
  leadership_course_2: 'leadership_course_1',
  leadership_course_3: 'leadership_course_2',
  leadership_course_4: 'leadership_course_3',
}

const TIER_ACCESS: Record<string, string[]> = {
  free:      ['leadership_course_1'],
  architect: ['leadership_course_1', 'leadership_course_2', 'leadership_course_3'],
  elite:     ['leadership_course_1', 'leadership_course_2', 'leadership_course_3', 'leadership_course_4'],
}

const TIER_LABELS: Record<string, string> = {
  free:      'Seeker',
  architect: 'Architect',
  elite:     'Reality Master',
}

export default async function CourseDetailPage({ params }: PageProps) {
  const course = COURSES.find(c => c.id === params.courseId)
  if (!course) return notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let completedLessons: string[] = []
  let isSuperAdmin = false
  let isBypassed   = false
  let userTier     = 'free'
  let prevCourseComplete = true

  const prereqId = LEADERSHIP_PREV[params.courseId] ?? null

  if (user) {
    const [progressRes, profileRes] = await Promise.all([
      supabase
        .from('leadership_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('course_id', params.courseId),
      supabase
        .from('profiles')
        .select('membership_tier, is_super_admin, is_bypassed')
        .eq('id', user.id)
        .single(),
    ])

    completedLessons = (progressRes.data ?? []).map((r: { lesson_id: string }) => r.lesson_id)
    isSuperAdmin     = !!profileRes.data?.is_super_admin
    isBypassed       = !!profileRes.data?.is_bypassed
    userTier         = profileRes.data?.membership_tier ?? 'free'

    // Check prerequisite completion (skip for admins/bypassed)
    if (prereqId && !isSuperAdmin && !isBypassed) {
      const { data: prevProg } = await supabase
        .from('course_progress')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('course_id', prereqId)
        .maybeSingle()
      prevCourseComplete = !!prevProg?.completed_at
    }
  }

  const nextLesson  = course.lessons.find(l => !completedLessons.includes(l.id)) ?? course.lessons[0]
  const hasStarted  = completedLessons.length > 0
  const isComplete  = completedLessons.length >= course.lessons.length
  const tierGrant   = (TIER_ACCESS[userTier] ?? []).includes(params.courseId) || isSuperAdmin || isBypassed
  const canAccess   = tierGrant && prevCourseComplete
  const prevCourse  = prereqId ? COURSES.find(c => c.id === prereqId) : null

  return (
    <>
      <Navbar />

      <main className="bg-[#0E0C08] text-[#F7F2EA] min-h-screen px-6 md:px-16 pt-24 pb-24">
        <div className="max-w-[900px] mx-auto">

          {/* Back link */}
          <Link
            href="/leadership"
            className="inline-flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-white/30 hover:text-[#E8621A] transition-colors mb-10"
          >
            <ChevronLeft size={12} /> Leadership
          </Link>

          {/* Course header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span
                className="font-mono text-[0.5rem] tracking-[0.25em] uppercase px-2 py-0.5 border"
                style={{ color: course.color, borderColor: `${course.color}40` }}
              >
                {TIER_LABELS[course.tierRequired] ?? course.tierRequired}
              </span>
              <span className="font-mono text-[0.5rem] tracking-widest text-white/30">
                {course.durationEstimate} · {course.lessons.length} lessons
              </span>
            </div>

            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-display text-2xl mb-6"
              style={{ backgroundColor: `${course.color}18`, color: course.color, border: `1px solid ${course.color}40` }}
            >
              {String(course.num).padStart(2, '0')}
            </div>

            <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] text-white mb-2">
              {course.title}
            </h1>
            <p className="font-mono text-[0.7rem] tracking-[0.15em] uppercase mb-6" style={{ color: course.color }}>
              {course.subtitle}
            </p>
            <p className="font-body text-lg text-white/60 leading-relaxed max-w-2xl mb-8">
              {course.description}
            </p>

            {canAccess ? (
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/leadership/${course.id}/${nextLesson.id}`}
                  className="btn-orange inline-flex items-center gap-2"
                >
                  {isComplete ? 'Review Course' : hasStarted ? 'Continue Course' : 'Begin Course'}{' '}
                  <ArrowRight size={14} />
                </Link>
                {isComplete && (
                  <Link
                    href="/dashboard/certificates"
                    className="btn-outline-orange inline-flex items-center gap-2"
                  >
                    <FileText size={14} /> Download Certificate
                  </Link>
                )}
              </div>
            ) : tierGrant && !prevCourseComplete && prevCourse ? (
              <div className="flex flex-col gap-3">
                <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-[#C9A84C]">
                  Complete Course {prevCourse.num} to unlock this course
                </p>
                <Link
                  href={`/leadership/${prevCourse.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#C9A84C]/40 text-[#C9A84C] font-mono text-[0.6rem] tracking-widest uppercase hover:bg-[#C9A84C]/10 transition-colors"
                >
                  Go to {prevCourse.title} <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-white/30">
                Upgrade your membership to access this course
              </p>
            )}
          </div>

          {/* Lessons list */}
          <div className="border-t border-white/8 pt-10">
            <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-[#C9A84C] mb-6">
              Lessons
            </p>
            <div className="space-y-3">
              {course.lessons.map((lesson, i) =>
                canAccess ? (
                  <Link
                    key={lesson.id}
                    href={`/leadership/${course.id}/${lesson.id}`}
                    className="flex items-start gap-5 p-5 border border-white/8 bg-[#141008] hover:border-[#E8621A]/40 transition-colors group"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold font-mono"
                      style={{ backgroundColor: `${course.color}14`, color: course.color, border: `1px solid ${course.color}30` }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-xl text-white group-hover:text-[#E8621A] transition-colors mb-1">
                        {lesson.title}
                      </h3>
                      <p className="font-body text-sm text-white/40 leading-relaxed line-clamp-2">
                        {lesson.description}
                      </p>
                      {lesson.keyConcepts.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {lesson.keyConcepts.map((c, j) => (
                            <span
                              key={j}
                              className="font-mono text-[0.48rem] tracking-[0.15em] uppercase px-2 py-0.5 border border-white/10 text-white/30"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={14} className="text-white/20 group-hover:text-[#E8621A] transition-colors flex-shrink-0 mt-1" />
                  </Link>
                ) : (
                  <div
                    key={lesson.id}
                    className="flex items-start gap-5 p-5 border border-white/4 bg-[#141008]/50 opacity-40 cursor-not-allowed select-none"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-mono border border-white/10 text-white/20">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-xl text-white/30 mb-1">{lesson.title}</h3>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Quiz preview */}
          <div className="mt-10 p-6 border border-[#C9A84C]/30 bg-[#C9A84C]/5">
            <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-[#C9A84C] mb-2">
              Course Quiz — {course.quiz.title}
            </p>
            <p className="font-body text-sm text-white/50 mb-1">
              {course.quiz.questions.length} questions · {course.quiz.passingScore}% to pass
            </p>
            <p className="font-body text-xs italic text-white/30">
              Available after completing all lessons. Passing unlocks the next course.
            </p>
          </div>

          {/* Assumption Lab preview */}
          <div className="mt-6 p-6 border border-[#E8621A]/20 bg-[#E8621A]/5">
            <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-[#E8621A] mb-2">
              Assumption Lab — {course.assumptionLab.title}
            </p>
            <p className="font-body text-sm text-white/50 leading-relaxed">
              {course.assumptionLab.prompt}
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  )
}
