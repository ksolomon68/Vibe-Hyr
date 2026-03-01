'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Menu, X, PanelRight,
  CheckCircle, Lock, ArrowRight, BookOpen, Crown
} from 'lucide-react'
import { VideoPlayer }  from '@/components/courses/VideoPlayer'
import { LessonContent } from '@/components/courses/LessonContent'
import { LessonSidebar } from '@/components/courses/LessonSidebar'
import { LessonQuiz }   from '@/components/courses/LessonQuiz'
import { useCourseProgress } from '@/hooks/useCourseProgress'
import { cn, formatDuration, getTierLabel } from '@/lib/utils'
import type { Course, Lesson, Quiz, MembershipTier } from '@/types'
import toast from 'react-hot-toast'

interface LessonPlayerClientProps {
  course:           Course
  lesson:           Lesson
  lessons:          Lesson[]
  quiz:             Quiz | null
  completedLessons: string[]
  passedQuizzes:    string[]
  prevLesson:       Lesson | null
  nextLesson:       Lesson | null
  userTier:         MembershipTier
  isLoggedIn:       boolean
}

type Tab = 'lesson' | 'quiz' | 'notes'

export function LessonPlayerClient({
  course,
  lesson,
  lessons,
  quiz,
  completedLessons: initialCompleted,
  passedQuizzes:    initialPassed,
  prevLesson,
  nextLesson,
  userTier,
  isLoggedIn,
}: LessonPlayerClientProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab,   setActiveTab]   = useState<Tab>('lesson')
  const [quizPassed,  setQuizPassed]  = useState(() => initialPassed.includes(quiz?.id ?? ''))

  const { markComplete, isComplete, completedIds, percentDone } =
    useCourseProgress(course.id, lessons.length)

  // Seed from server-side data on first render
  const isLessonDone   = isComplete(lesson.id) || initialCompleted.includes(lesson.id)
  const hasQuiz        = !!quiz
  const quizRequired   = hasQuiz && !quizPassed && !isLessonDone
  const canAdvance     = !quizRequired || quizPassed || isLessonDone

  // Lesson index for breadcrumb
  const lessonIndex = lessons.findIndex(l => l.id === lesson.id) + 1

  async function handleMarkComplete() {
    if (!isLoggedIn) {
      toast.error('Log in to track your progress')
      return
    }
    await markComplete(lesson.id)
    toast.success('Lesson marked complete ✦', { icon: '✓' })
    if (nextLesson) {
      router.push(`/courses/${course.slug}/${nextLesson.id}`)
    } else {
      router.push(`/courses/${course.slug}`)
    }
  }

  async function handleQuizPass() {
    setQuizPassed(true)
    await markComplete(lesson.id)
    toast.success('Quiz passed — lesson complete! ✦')
    setActiveTab('lesson')
  }

  // Auto-open quiz tab if lesson has a quiz and it's not passed
  useEffect(() => {
    if (quizRequired) {
      // Don't force the tab — just surface the prompt
    }
  }, [quizRequired])

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* ─── TOP BAR ─────────────────────────────────────────────── */}
      <div className="h-[52px] bg-black-2 border-b-2 border-orange-DEFAULT flex items-center justify-between px-5 flex-shrink-0 relative z-30">
        {/* Left: back + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center gap-1.5 text-grey-dark hover:text-orange-DEFAULT transition-colors flex-shrink-0"
          >
            <ChevronLeft size={14} />
            <span className="font-mono text-[0.55rem] tracking-[0.15em] uppercase hidden sm:block">
              {course.title}
            </span>
          </Link>
          <span className="text-grey-dark text-xs flex-shrink-0">/</span>
          <span className="font-mono text-[0.55rem] tracking-[0.12em] text-white truncate max-w-[200px] md:max-w-none">
            {String(lessonIndex).padStart(2,'0')} — {lesson.title}
          </span>
        </div>

        {/* Center: progress bar (desktop only) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-3">
          <span className="font-mono text-[0.52rem] tracking-[0.2em] uppercase text-grey-dark">
            {lessonIndex} of {lessons.length}
          </span>
          <div className="w-32 h-px bg-black-4 relative">
            <div
              className="absolute left-0 top-0 h-px bg-orange-DEFAULT transition-all duration-500"
              style={{ width: `${percentDone}%` }}
            />
          </div>
          <span className="font-mono text-[0.52rem] tracking-[0.2em] text-orange-DEFAULT">
            {percentDone}%
          </span>
        </div>

        {/* Right: nav arrows + sidebar toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {prevLesson && (
            <Link
              href={`/courses/${course.slug}/${prevLesson.id}`}
              className="text-grey-dark hover:text-orange-DEFAULT transition-colors p-1"
              title="Previous lesson"
            >
              <ChevronLeft size={16} />
            </Link>
          )}
          {nextLesson && (
            <Link
              href={`/courses/${course.slug}/${nextLesson.id}`}
              className={cn(
                'p-1 transition-colors',
                canAdvance
                  ? 'text-grey-dark hover:text-orange-DEFAULT'
                  : 'text-grey-dark/30 cursor-not-allowed pointer-events-none'
              )}
              title={canAdvance ? 'Next lesson' : 'Complete quiz to advance'}
            >
              <ChevronRight size={16} />
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className={cn(
              'ml-1 p-1.5 transition-colors hidden lg:block',
              sidebarOpen
                ? 'text-orange-DEFAULT'
                : 'text-grey-dark hover:text-orange-DEFAULT'
            )}
            title="Toggle sidebar"
          >
            <PanelRight size={16} />
          </button>
        </div>
      </div>

      {/* ─── BODY ───────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0">

          {/* Video player */}
          <VideoPlayer
            videoUrl={lesson.video_url}
            lessonId={lesson.id}
            title={lesson.title}
            duration={lesson.duration_seconds}
            onComplete={() => !isLessonDone && !hasQuiz && handleMarkComplete()}
            initialProgress={isLessonDone ? 100 : 0}
          />

          {/* Content area */}
          <div className="flex-1 max-w-3xl w-full mx-auto px-6 md:px-10 py-10">

            {/* Lesson header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-orange-DEFAULT">
                  Lesson {String(lessonIndex).padStart(2,'0')} · {formatDuration(lesson.duration_seconds)}
                </span>
                {lesson.is_preview && (
                  <span className="font-mono text-[0.5rem] tracking-widest uppercase px-2 py-0.5 border border-green-400 text-green-400">
                    Preview
                  </span>
                )}
                {isLessonDone && (
                  <span className="font-mono text-[0.5rem] tracking-widest uppercase px-2 py-0.5 border border-orange-DEFAULT text-orange-DEFAULT flex items-center gap-1">
                    <CheckCircle size={9} /> Complete
                  </span>
                )}
              </div>
              <h1 className="font-display text-[clamp(1.8rem,4vw,3.5rem)] leading-[0.95] tracking-[0.02em] text-white mb-3">
                {lesson.title}
              </h1>
              {lesson.description && (
                <p className="font-body text-base italic text-grey-DEFAULT leading-relaxed">
                  {lesson.description}
                </p>
              )}
            </div>

            {/* Tab switcher (Lesson / Quiz) */}
            {hasQuiz && (
              <div className="flex gap-[2px] bg-orange-DEFAULT border border-orange-DEFAULT mb-10 w-fit">
                {(['lesson', 'quiz'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'font-mono text-[0.6rem] tracking-[0.2em] uppercase px-6 py-2.5 transition-colors',
                      activeTab === tab
                        ? 'bg-orange-DEFAULT text-black font-bold'
                        : 'bg-black-2 text-grey-DEFAULT hover:text-white'
                    )}
                  >
                    {tab === 'lesson' ? 'Lesson Notes' : `Quiz ${quizPassed ? '✓' : ''}`}
                  </button>
                ))}
              </div>
            )}

            {/* Lesson content */}
            <AnimatePresence mode="wait">
              {activeTab === 'lesson' && lesson.content_md && (
                <motion.div
                  key="lesson"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <LessonContent content={lesson.content_md} />
                </motion.div>
              )}

              {activeTab === 'quiz' && quiz && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <LessonQuiz
                    quiz={quiz}
                    onPass={handleQuizPass}
                    alreadyPassed={quizPassed}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quiz gate banner */}
            {activeTab === 'lesson' && hasQuiz && !quizPassed && !isLessonDone && (
              <div className="mt-10 flex items-center gap-5 p-5 bg-black-2 border border-orange-DEFAULT/40">
                <Lock size={18} className="text-orange-DEFAULT flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-orange-DEFAULT mb-1">
                    Quiz Required to Advance
                  </p>
                  <p className="font-body text-sm text-grey-DEFAULT italic">
                    Complete the knowledge check to unlock the next lesson and confirm your understanding.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className="btn-orange text-[0.62rem] px-5 py-2.5 flex-shrink-0 flex items-center gap-2"
                >
                  Take Quiz <ArrowRight size={12} />
                </button>
              </div>
            )}

            {/* ── COMPLETION / NAVIGATION FOOTER ── */}
            <div className="mt-12 pt-8 border-t border-white/8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Prev */}
                <div>
                  {prevLesson ? (
                    <Link
                      href={`/courses/${course.slug}/${prevLesson.id}`}
                      className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.15em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors"
                    >
                      <ChevronLeft size={14} />
                      <span className="hidden sm:inline">Previous:</span> {prevLesson.title}
                    </Link>
                  ) : (
                    <Link
                      href={`/courses/${course.slug}`}
                      className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.15em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors"
                    >
                      <ChevronLeft size={14} /> Course Overview
                    </Link>
                  )}
                </div>

                {/* Mark complete / next */}
                <div className="flex items-center gap-3">
                  {isLessonDone ? (
                    nextLesson ? (
                      <Link
                        href={`/courses/${course.slug}/${nextLesson.id}`}
                        className="btn-orange flex items-center gap-2"
                      >
                        Next Lesson <ChevronRight size={14} />
                      </Link>
                    ) : (
                      <Link
                        href={`/courses/${course.slug}`}
                        className="btn-orange flex items-center gap-2"
                      >
                        <CheckCircle size={14} /> Course Complete
                      </Link>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          toast.error('Log in to track progress')
                          return
                        }
                        if (quizRequired) {
                          setActiveTab('quiz')
                          toast('Complete the quiz first ↑', { icon: '↑' })
                          return
                        }
                        handleMarkComplete()
                      }}
                      className={cn(
                        'btn-orange flex items-center gap-2',
                        quizRequired && 'opacity-60'
                      )}
                    >
                      <CheckCircle size={14} />
                      {quizRequired ? 'Quiz Required First' : 'Mark Complete'}
                      {nextLesson && !quizRequired && <ChevronRight size={12} />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── NEXT COURSE TEASER (last lesson of course) ── */}
            {!nextLesson && isLessonDone && (() => {
              const nextCourse = course.order_index < 4
              if (!nextCourse) return null
              return (
                <div className="mt-10 p-7 bg-black-2 border-2 border-orange-DEFAULT text-center">
                  <div className="font-mono text-[0.58rem] tracking-[0.25em] uppercase text-orange-DEFAULT mb-3">
                    Course Complete · Up Next
                  </div>
                  <div className="font-display text-2xl text-white mb-4">
                    Course {String(course.order_index + 1).padStart(2,'0')} awaits
                  </div>
                  <Link href="/courses" className="btn-orange flex items-center gap-2 justify-center">
                    Explore Next Course <ArrowRight size={14} />
                  </Link>
                </div>
              )
            })()}

            {/* ── LOGIN NUDGE (guest) ── */}
            {!isLoggedIn && (
              <div className="mt-8 flex items-start gap-4 p-5 bg-black-2 border border-orange-DEFAULT/30">
                <BookOpen size={18} className="text-orange-DEFAULT mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-orange-DEFAULT mb-1">
                    Track Your Progress
                  </p>
                  <p className="font-body text-sm text-grey-DEFAULT italic">
                    Create a free account to save your progress, take notes, and unlock your personalized dashboard.
                  </p>
                  <div className="flex gap-3 mt-4 flex-wrap">
                    <Link href="/auth/signup" className="btn-orange text-[0.62rem] px-5 py-2.5">
                      Join Free
                    </Link>
                    <Link href="/auth/login" className="btn-outline text-[0.62rem] px-5 py-2.5">
                      Log In
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── SIDEBAR (desktop) ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="hidden lg:block flex-shrink-0 overflow-hidden"
              style={{ width: 320 }}
            >
              <div className="w-[320px] h-full">
                <LessonSidebar
                  course={course}
                  lessons={lessons}
                  currentLesson={lesson}
                  completedIds={completedIds.length > 0 ? completedIds : initialCompleted}
                  hasAccess={true}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── MOBILE SIDEBAR DRAWER ─────────────────────────────── */}
      <MobileSidebar
        course={course}
        lessons={lessons}
        currentLesson={lesson}
        completedIds={completedIds.length > 0 ? completedIds : initialCompleted}
      />
    </div>
  )
}

// ── Mobile sidebar as a bottom sheet ──────────────────────────────────────────

function MobileSidebar({
  course,
  lessons,
  currentLesson,
  completedIds,
}: {
  course: Course
  lessons: Lesson[]
  currentLesson: Lesson
  completedIds: string[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="lg:hidden fixed bottom-5 right-5 z-40 w-12 h-12 bg-orange-DEFAULT text-black flex items-center justify-center shadow-xl"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-30 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[75vh] bg-black-2 border-t-2 border-orange-DEFAULT"
            >
              <LessonSidebar
                course={course}
                lessons={lessons}
                currentLesson={currentLesson}
                completedIds={completedIds}
                hasAccess={true}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
