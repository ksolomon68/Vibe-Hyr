// app/leadership/[courseId]/page.tsx
// Course detail page for the Leadership vertical.

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Lock, Play, CheckCircle, Clock, BookOpen, FileText, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { COURSES } from '@/lib/leadership/curriculum'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { CourseLockedScreen } from '@/components/CourseLockedScreen'

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

  let isLeadership = false

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
        .select('membership_tier, membership_type, vertical, is_super_admin, is_bypassed')
        .eq('id', user.id)
        .single(),
    ])

    completedLessons = (progressRes.data ?? []).map((r: { lesson_id: string }) => r.lesson_id)
    isSuperAdmin     = !!profileRes.data?.is_super_admin
    isBypassed       = !!profileRes.data?.is_bypassed
    userTier         = profileRes.data?.membership_tier ?? 'free'
    isLeadership     = profileRes.data?.membership_type === 'leadership' || profileRes.data?.vertical === 'leadership'

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

  // Must require `user` explicitly — userTier defaults to 'free' whether or
  // not anyone is logged in, so without this guard a guest was treated
  // identically to a logged-in free-tier member (unlocked Course 1),
  // inconsistent with /educators and /business which require login here.
  const tierGrant   = !!user && (isSuperAdmin || isBypassed || (isLeadership && (TIER_ACCESS[userTier] ?? []).includes(params.courseId)))
  const canAccess   = tierGrant && prevCourseComplete
  const prevCourse  = prereqId ? COURSES.find(c => c.id === prereqId) : null

  // Mirrors /educators/[programSlug]: a logged-in user without tier access gets
  // the shared full-page locked screen instead of an inline message.
  if (user && !tierGrant) {
    return (
      <CourseLockedScreen
        reason={isLeadership ? 'tier_required' : 'wrong_vertical'}
        courseSlug={course.id}
        sectionLabel="LEADERSHIP"
        backHref="/leadership"
        backLabel="Back to Leadership"
      />
    )
  }

  const pct = course.lessons.length > 0
    ? Math.round((completedLessons.length / course.lessons.length) * 100)
    : 0
  const hasStarted  = completedLessons.length > 0
  const isComplete  = completedLessons.length >= course.lessons.length
  const nextLesson  = course.lessons.find(l => !completedLessons.includes(l.id)) ?? course.lessons[0]

  return (
    <>
      <Navbar />
      <main className="pt-[68px]">

        {/* ── HERO ── */}
        <section className="relative border-b-2 border-orange-DEFAULT/20 overflow-hidden bg-[#0E0C08]">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 font-display text-[14rem] md:text-[22rem] leading-none text-white select-none pointer-events-none pr-8 opacity-10 md:opacity-5">
            {String(course.num).padStart(2, '0')}
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-14 py-16 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/leadership" className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors">
                ← Leadership
              </Link>
              <span className="text-grey-dark">/</span>
              <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase px-2.5 py-1 border border-orange-DEFAULT text-orange-DEFAULT">
                {TIER_LABELS[course.tierRequired] ?? course.tierRequired}
              </span>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 items-start">
              {/* Left: title + description */}
              <div className="lg:col-span-2">
                <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-orange-DEFAULT mb-3">
                  Course {String(course.num).padStart(2, '0')} of 04
                </p>
                <h1 className="font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.93] tracking-[0.02em] mb-4 text-white">
                  {course.title.split(' ').map((word, i) => (
                    <span key={i} className={i === course.title.split(' ').length - 1 ? 'text-orange-DEFAULT' : ''}>
                      {word}{' '}
                    </span>
                  ))}
                </h1>
                <p className="font-body text-xl italic text-grey-DEFAULT mb-5 leading-relaxed max-w-2xl">
                  {course.subtitle}
                </p>
                <p className="font-body text-lg text-grey-DEFAULT leading-relaxed max-w-2xl">
                  {course.description}
                </p>
              </div>

              {/* Right: action card */}
              <div className="bg-black-2 border-2 border-orange-DEFAULT p-7">
                {user && pct > 0 && (
                  <div className="mb-6 pb-6 border-b border-white/8">
                    <div className="flex justify-between mb-2">
                      <span className="font-mono text-[0.55rem] tracking-widest uppercase text-grey-dark">Progress</span>
                      <span className="font-mono text-[0.55rem] tracking-widest text-orange-DEFAULT">{pct}%</span>
                    </div>
                    <div className="h-1 bg-black-4 rounded-full">
                      <div className="h-1 bg-orange-DEFAULT rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="font-mono text-[0.52rem] tracking-widest text-grey-dark mt-1.5">
                      {completedLessons.length} of {course.lessons.length} lessons complete
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: BookOpen, val: course.lessons.length, label: 'Lessons' },
                    { icon: Clock,    val: course.durationEstimate, label: 'Est. time' },
                    { icon: CheckCircle, val: course.quiz.questions.length, label: 'Quiz Qs' },
                  ].map(({ icon: Icon, val, label }) => (
                    <div key={label} className="text-center">
                      <Icon size={14} className="text-orange-DEFAULT mx-auto mb-1" />
                      <span className="font-display text-xl text-white block leading-none">{val}</span>
                      <span className="font-mono text-[0.5rem] tracking-widest text-grey-dark uppercase">{label}</span>
                    </div>
                  ))}
                </div>

                {canAccess ? (
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/leadership/${course.id}/${nextLesson?.id}`}
                      className="btn-orange w-full text-center flex items-center justify-center gap-2"
                    >
                      <Play size={13} />
                      {isComplete ? 'Review Course' : hasStarted ? 'Continue Course' : 'Begin Course'}
                    </Link>
                    {isComplete && (
                      <Link
                        href="/dashboard/certificates"
                        className="btn-outline-orange w-full text-center flex items-center justify-center gap-2"
                      >
                        <FileText size={14} /> Download Certificate
                      </Link>
                    )}
                  </div>
                ) : tierGrant && !prevCourseComplete && prevCourse ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3 text-[#C9A84C]">
                      <Lock size={13} />
                      <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase">Complete Course {prevCourse.num} First</span>
                    </div>
                    <Link
                      href={`/leadership/${prevCourse.id}`}
                      className="w-full text-center flex items-center justify-center gap-2 px-4 py-2.5 border border-[#C9A84C]/40 text-[#C9A84C] font-mono text-[0.6rem] tracking-widest uppercase hover:bg-[#C9A84C]/10 transition-colors"
                    >
                      <ArrowRight size={12} />
                      Go to Course {prevCourse.num}
                    </Link>
                  </div>
                ) : (
                  <Link href={`/auth/login?redirect=/leadership/${course.id}`} className="btn-outline w-full text-center block">
                    Log In to Access
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── LESSON LIST ── */}
        <section className="py-16 px-6 md:px-14 bg-black">
          <div className="max-w-4xl mx-auto">
            <div className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-grey-dark mb-6">Lessons</div>

            <div className="flex flex-col gap-[2px] bg-orange-DEFAULT border-2 border-orange-DEFAULT">
              {course.lessons.map((lesson, idx) => {
                const done       = completedLessons.includes(lesson.id)
                const locked     = !canAccess
                const isCurrent  = nextLesson?.id === lesson.id && pct > 0 && pct < 100

                return (
                  <div key={lesson.id} className={cn('bg-black-2 transition-colors', locked ? 'opacity-60' : 'hover:bg-black-3', isCurrent && 'border-l-4 border-orange-DEFAULT bg-orange-DEFAULT/5')}>
                    {locked ? (
                      <div className="flex items-start gap-5 px-7 py-5 cursor-not-allowed">
                        <span className="font-display text-2xl text-white/20 leading-none min-w-[36px] mt-0.5">
                          {lesson.num}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-lg text-grey-dark">{lesson.title}</p>
                          <p className="font-body text-sm italic text-grey-dark mt-1 line-clamp-1">
                            {lesson.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Lock size={13} className="text-grey-dark" />
                        </div>
                      </div>
                    ) : (
                      <Link href={`/leadership/${course.id}/${lesson.id}`} className="flex items-start gap-5 px-7 py-5 group">
                        <span className="font-display text-2xl text-white/40 leading-none min-w-[36px] mt-0.5 group-hover:text-orange-DEFAULT transition-colors">
                          {lesson.num}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={cn('font-body text-lg transition-colors', done ? 'text-white' : 'text-white/80 group-hover:text-white')}>
                            {lesson.title}
                          </p>
                          <p className="font-body text-sm italic text-grey-DEFAULT mt-1 line-clamp-2">
                            {lesson.description}
                          </p>
                          {lesson.keyConcepts.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {lesson.keyConcepts.slice(0, 3).map((c, j) => (
                                <span key={j} className="font-mono text-[0.48rem] tracking-[0.15em] uppercase px-2 py-0.5 border border-white/10 text-white/30">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {done ? <CheckCircle size={15} className="text-orange-DEFAULT" /> : <Play size={13} className="text-grey-dark/50 group-hover:text-orange-DEFAULT transition-colors" />}
                        </div>
                      </Link>
                    )}
                  </div>
                )
              })}
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
            <div className="mt-6 p-6 border border-orange-DEFAULT/20 bg-orange-DEFAULT/5">
              <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-orange-DEFAULT mb-2">
                Assumption Lab — {course.assumptionLab.title}
              </p>
              <p className="font-body text-sm text-white/50 leading-relaxed">
                {course.assumptionLab.prompt}
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
