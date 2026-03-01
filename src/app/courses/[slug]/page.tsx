import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { COURSES } from '@/lib/data/courses'
import { getLessonsForCourse } from '@/lib/data/lessons'
import { hasAccess, formatDuration, cn } from '@/lib/utils'
import {
  Lock, Play, CheckCircle, Clock, BookOpen,
  ChevronRight, Crown, ArrowRight
} from 'lucide-react'
import type { MembershipTier } from '@/types'

export async function generateStaticParams() {
  return COURSES.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const course = COURSES.find(c => c.slug === params.slug)
  if (!course) return {}
  return { title: `${course.title} — Vibe Hyr`, description: course.description }
}

const TIER_GATE_COPY: Record<string, { label: string; price: string; desc: string }> = {
  architect: { label: 'Architect',     price: '$27/mo', desc: 'Unlock Courses 2 & 3, the full Revision Journal, SATS audio library, and community access.' },
  elite:     { label: 'Reality Master', price: '$67/mo', desc: 'The complete system — all 4 courses, monthly Life Mastery Score, live Q&As, and every tool.' },
}

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const course = COURSES.find(c => c.slug === params.slug)
  if (!course) notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userTier: MembershipTier = 'free'
  let completedLessons: string[] = []

  if (user) {
    const [{ data: profile }, { data: progress }] = await Promise.all([
      supabase.from('profiles').select('membership_tier').eq('id', user.id).single(),
      supabase.from('course_progress').select('completed_lessons')
        .eq('user_id', user.id).eq('course_id', course.id).single(),
    ])
    userTier        = profile?.membership_tier ?? 'free'
    completedLessons = progress?.completed_lessons ?? []
  }

  const lessons    = getLessonsForCourse(course.id)
  const canAccess  = hasAccess(userTier, course.tier)
  const totalMins  = lessons.reduce((s, l) => s + Math.ceil(l.duration_seconds / 60), 0)
  const pct        = lessons.length
    ? Math.round((completedLessons.length / lessons.length) * 100)
    : 0

  // Find first uncompleted lesson (or first lesson if none started)
  const nextLesson = lessons.find(l => !completedLessons.includes(l.id)) ?? lessons[0]

  const gateInfo = TIER_GATE_COPY[course.tier]

  return (
    <>
      <Navbar />
      <main className="pt-[68px]">

        {/* ── HERO ── */}
        <section className="relative border-b-2 border-orange-DEFAULT/20 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          {/* Big background number */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 font-display text-[22rem] leading-none
                          text-orange-DEFAULT/5 select-none pointer-events-none pr-8">
            {String(course.order_index).padStart(2, '0')}
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-14 py-16 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Link
                href="/courses"
                className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors"
              >
                ← Courses
              </Link>
              <span className="text-grey-dark">/</span>
              <span className={cn('font-mono text-[0.55rem] tracking-[0.2em] uppercase px-2.5 py-1 border',
                course.tier === 'free'
                  ? 'border-green-400 text-green-400'
                  : course.tier === 'architect'
                  ? 'border-orange-DEFAULT text-orange-DEFAULT'
                  : 'border-white text-white'
              )}>
                {course.tier === 'free' ? 'Free' : course.tier === 'architect' ? 'Architect' : 'Elite'}
              </span>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 items-start">
              {/* Left: title + description */}
              <div className="lg:col-span-2">
                <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-orange-DEFAULT mb-3">
                  Course {String(course.order_index).padStart(2, '0')} of 04
                </p>
                <h1 className="font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.93] tracking-[0.02em] mb-4">
                  {course.title.split(' ').map((word, i) => (
                    <span key={i} className={i === course.title.split(' ').length - 1 ? 'text-orange-DEFAULT' : ''}>
                      {word}{' '}
                    </span>
                  ))}
                </h1>
                <p className="font-body text-lg italic text-grey-DEFAULT mb-5 leading-relaxed max-w-2xl">
                  {course.subtitle}
                </p>
                <p className="font-body text-base text-grey-DEFAULT leading-relaxed max-w-2xl">
                  {course.description}
                </p>
              </div>

              {/* Right: action card */}
              <div className="bg-black-2 border-2 border-orange-DEFAULT p-7">
                {/* Progress (if started) */}
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
                      {completedLessons.length} of {lessons.length} lessons complete
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: BookOpen, val: lessons.length, label: 'Lessons' },
                    { icon: Clock,    val: `${course.estimated_hours}h`, label: 'Est. time' },
                    { icon: CheckCircle, val: course.total_quizzes, label: 'Quizzes' },
                  ].map(({ icon: Icon, val, label }) => (
                    <div key={label} className="text-center">
                      <Icon size={14} className="text-orange-DEFAULT mx-auto mb-1" />
                      <span className="font-display text-xl text-white block leading-none">{val}</span>
                      <span className="font-mono text-[0.5rem] tracking-widest text-grey-dark uppercase">{label}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {canAccess ? (
                  <Link
                    href={`/courses/${course.slug}/${nextLesson?.id}`}
                    className="btn-orange w-full text-center flex items-center justify-center gap-2"
                  >
                    <Play size={13} />
                    {pct === 0 ? 'Start Course' : pct === 100 ? 'Review Course' : 'Continue'}
                  </Link>
                ) : (
                  <Link
                    href={`/pricing`}
                    className="btn-orange w-full text-center flex items-center justify-center gap-2"
                  >
                    <Crown size={13} />
                    Upgrade to Unlock
                  </Link>
                )}

                {!user && (
                  <p className="text-center font-mono text-[0.52rem] tracking-widest text-grey-dark uppercase mt-3">
                    <Link href="/auth/signup" className="text-orange-DEFAULT hover:underline">Create a free account</Link>{' '}
                    to track progress
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── PAYWALL (if no access) ── */}
        {!canAccess && gateInfo && (
          <section className="py-12 px-6 md:px-14 bg-black-2 border-b border-orange-DEFAULT/20">
            <div className="max-w-2xl mx-auto text-center">
              <Lock size={28} className="text-orange-DEFAULT mx-auto mb-4" />
              <h2 className="font-display text-3xl tracking-widest text-white mb-3">
                {gateInfo.label.toUpperCase()} REQUIRED
              </h2>
              <p className="font-body italic text-grey-DEFAULT mb-6 leading-relaxed">
                {gateInfo.desc}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/pricing" className="btn-orange flex items-center gap-2">
                  <Crown size={13} /> Upgrade — {gateInfo.price}
                </Link>
                <Link href="/courses/programming-the-gatekeeper" className="btn-outline">
                  Start Free Course →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── LESSON LIST ── */}
        <section className="py-16 px-6 md:px-14">
          <div className="max-w-4xl mx-auto">
            <div className="label mb-6">Curriculum</div>

            <div className="flex flex-col gap-[2px] bg-orange-DEFAULT border-2 border-orange-DEFAULT">
              {lessons.map((lesson, idx) => {
                const done    = completedLessons.includes(lesson.id)
                const locked  = !canAccess && !lesson.is_preview
                const isCurrent = nextLesson?.id === lesson.id && pct > 0 && pct < 100

                return (
                  <div
                    key={lesson.id}
                    className={cn(
                      'bg-black-2 transition-colors',
                      locked  ? 'opacity-60' : 'hover:bg-black-3'
                    )}
                  >
                    {locked ? (
                      <div className="flex items-start gap-5 px-7 py-5 cursor-not-allowed">
                        <span className="font-display text-2xl text-white/20 leading-none min-w-[36px] mt-0.5">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-base text-grey-dark">{lesson.title}</p>
                          {lesson.description && (
                            <p className="font-body text-xs italic text-grey-dark mt-1 line-clamp-1">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-mono text-[0.55rem] tracking-widest text-grey-dark">
                            {formatDuration(lesson.duration_seconds)}
                          </span>
                          <Lock size={13} className="text-grey-dark" />
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={`/courses/${course.slug}/${lesson.id}`}
                        className="flex items-start gap-5 px-7 py-5 group"
                      >
                        <span className={cn(
                          'font-display text-2xl leading-none min-w-[36px] mt-0.5 transition-colors',
                          done      ? 'text-orange-DEFAULT' :
                          isCurrent ? 'text-orange-DEFAULT' :
                                      'text-white/20 group-hover:text-orange-DEFAULT/60'
                        )}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={cn(
                              'font-body text-base transition-colors',
                              done ? 'text-white' : 'text-white group-hover:text-white'
                            )}>
                              {lesson.title}
                            </p>
                            {lesson.is_preview && !done && (
                              <span className="font-mono text-[0.5rem] tracking-widest uppercase px-2 py-0.5 border border-green-400 text-green-400">
                                Preview
                              </span>
                            )}
                            {isCurrent && (
                              <span className="font-mono text-[0.5rem] tracking-widest uppercase px-2 py-0.5 border border-orange-DEFAULT text-orange-DEFAULT">
                                Continue
                              </span>
                            )}
                          </div>
                          {lesson.description && (
                            <p className="font-body text-xs italic text-grey-dark mt-1 line-clamp-1">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-mono text-[0.55rem] tracking-widest text-grey-dark">
                            {formatDuration(lesson.duration_seconds)}
                          </span>
                          {done
                            ? <CheckCircle size={15} className="text-orange-DEFAULT" />
                            : <ChevronRight size={15} className="text-grey-dark group-hover:text-orange-DEFAULT transition-colors" />
                          }
                        </div>
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Next course teaser */}
            {(() => {
              const next = COURSES.find(c => c.order_index === course.order_index + 1)
              return next ? (
                <div className="mt-10 flex items-center justify-between p-6 bg-black-2 border border-white/8">
                  <div>
                    <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-dark mb-1">
                      Up Next
                    </p>
                    <p className="font-body text-base text-white">{next.title}</p>
                  </div>
                  <Link
                    href={`/courses/${next.slug}`}
                    className="btn-outline-orange flex items-center gap-2 text-[0.62rem]"
                  >
                    Preview <ArrowRight size={12} />
                  </Link>
                </div>
              ) : null
            })()}
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
