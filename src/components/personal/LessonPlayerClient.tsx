'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Menu, X, PanelRight,
  CheckCircle, Lock, ArrowRight, BookOpen, Crown, Sparkles, BrainCircuit, Loader2
} from 'lucide-react'
import { VideoPlayer }  from '@/components/personal/VideoPlayer'
import { LessonContent } from '@/components/personal/LessonContent'
import { LessonSidebar } from '@/components/personal/LessonSidebar'
import { LessonQuiz }   from '@/components/personal/LessonQuiz'
import { AssumptionLab } from '@/components/shared/AssumptionLab'
import { CourseCompletionBanner } from '@/components/personal/CourseCompletionBanner'

import { useCourseProgress } from '@/hooks/useCourseProgress'
import { useLessonNotes } from '@/hooks/useLessonNotes'
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
  const [activeTab, setActiveTab] = useState<Tab>('lesson')
  const [quizPassed, setQuizPassed] = useState(() => initialPassed.includes(quiz?.id ?? ''))
  const { content: lessonNotes, handleChange: handleNotesChange, saving: notesSaving, saved: notesSaved } = useLessonNotes(lesson.id)

  const { loading: progressLoading, markComplete, markIncomplete, isComplete, completedIds, percentDone, isAllComplete } =
    useCourseProgress(course.id, lessons.length)

  // Seed from server-side data on first render
  const isLessonDone   = isComplete(lesson.id) || initialCompleted.includes(lesson.id)
  const hasQuiz        = !!quiz
  const quizRequired   = hasQuiz && !quizPassed && !isLessonDone
  const canAdvance     = !quizRequired || quizPassed || isLessonDone

  // Show completion banner when all lessons done (include server seed)
  const mergedCompletedIds = [...new Set([...completedIds, ...initialCompleted])]
  const allDone = lessons.length > 0 && mergedCompletedIds.length >= lessons.length

  // Lesson index for breadcrumb
  const lessonIndex = lessons.findIndex(l => l.id === lesson.id) + 1

  async function handleMarkComplete() {
    if (!isLoggedIn) {
      toast.error('Log in to track your progress')
      return
    }
    await markComplete(lesson.id)
    toast.success('Lesson marked complete ✓', {
      icon: '✓',
      style: { background: '#0A0804', color: '#F0EAE0', border: '1px solid #22c55e' },
    })
    if (nextLesson) {
      router.push(`/personal/${course.slug}/${nextLesson.id}`)
    } else {
      router.push(`/personal/${course.slug}`)
    }
  }

  async function handleMarkIncomplete(lessonId: string) {
    if (!isLoggedIn) return
    await markIncomplete(lessonId)
    toast('Lesson marked incomplete', {
      style: { background: '#0A0804', color: '#F0EAE0', border: '1px solid #444' },
    })
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

  // Merged completed IDs: prefer live state, fall back to server seed
  const effectiveCompletedIds = completedIds.length > 0 ? completedIds : initialCompleted

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* ─── TOP BAR ─────────────────────────────────────────────── */}
      <div className="h-[64px] bg-[#0E0C08] border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 relative z-30">
        {/* Left: back + breadcrumb */}
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="font-display text-xl tracking-widest text-[#E8621A] hover:opacity-80 transition-opacity hidden sm:block">
            VIBE<span className="text-white">HYR</span>
          </Link>
          <span className="text-white/10 text-xs flex-shrink-0 hidden sm:block">/</span>
          <Link
            href={`/personal/${course.slug}`}
            className="flex items-center gap-2 text-white/40 hover:text-[#E8621A] transition-colors flex-shrink-0"
          >
            <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase hidden md:block">
              {course.title}
            </span>
            <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase md:hidden">
              Courses
            </span>
          </Link>
          <span className="text-white/10 text-xs flex-shrink-0">/</span>
          <span className="font-mono text-[0.65rem] tracking-[0.15em] text-white/90 truncate max-w-[200px] md:max-w-none uppercase">
            {String(lessonIndex).padStart(2,'0')} — {lesson.title}
          </span>
        </div>

        {/* Center: animated progress bar (desktop only) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-4">
          <div className="w-40 h-[2px] bg-white/5 relative rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-[#F97316] rounded-full"
              animate={{ width: `${percentDone}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="font-mono text-[0.6rem] tracking-[0.2em] text-[#F97316] font-bold">
            {percentDone}%
          </span>
        </div>

        {/* Right: nav arrows + sidebar toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {prevLesson && (
            <Link
              href={`/personal/${course.slug}/${prevLesson.id}`}
              className="text-white/40 hover:text-[#E8621A] transition-colors p-2 hover:bg-white/5 rounded-lg"
              title="Previous lesson"
            >
              <ChevronLeft size={18} />
            </Link>
          )}
          {nextLesson && (
            <Link
              href={`/personal/${course.slug}/${nextLesson.id}`}
              className={cn(
                'p-2 transition-colors rounded-lg',
                canAdvance
                  ? 'text-white/40 hover:text-[#E8621A] hover:bg-white/5'
                  : 'text-white/10 cursor-not-allowed pointer-events-none'
              )}
              title={canAdvance ? 'Next lesson' : 'Complete quiz to advance'}
            >
              <ChevronRight size={18} />
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className={cn(
              'ml-1 p-2 transition-colors hidden lg:block rounded-lg hover:bg-white/5',
              sidebarOpen
                ? 'text-[#E8621A]'
                : 'text-white/40 hover:text-[#E8621A]'
            )}
            title="Toggle sidebar"
          >
            <PanelRight size={20} />
          </button>
        </div>
      </div>

      {/* ─── PROGRESS SUMMARY BAR (below top bar, full width) ──── */}
      {isLoggedIn && (
        <div className="bg-[#0E0C08] border-b border-white/5 px-6 py-2 flex items-center gap-4">
          {/* Full-width animated bar */}
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#F97316] rounded-full"
              animate={{ width: `${percentDone}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="font-mono text-[0.58rem] tracking-widest text-white/50 whitespace-nowrap flex-shrink-0">
            {effectiveCompletedIds.length} of {lessons.length} lessons complete
          </span>
          <span className="font-mono text-[0.58rem] tracking-widest text-[#F97316] font-bold flex-shrink-0">
            {percentDone}%
          </span>
        </div>
      )}

      {/* ─── BODY ───────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden flex-col lg:flex-row-reverse">
        
        {/* ── SIDEBAR (desktop) ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="hidden lg:block flex-shrink-0 overflow-hidden border-l border-white/5 bg-[#0E0C08]/80 backdrop-blur-xl"
              style={{ width: 320 }}
            >
              <div className="w-[320px] h-full">
                <LessonSidebar
                  course={course}
                  lessons={lessons}
                  currentLesson={lesson}
                  completedIds={effectiveCompletedIds}
                  hasAccess={true}
                  loading={progressLoading}
                  isLoggedIn={isLoggedIn}
                  onMarkComplete={isLoggedIn ? (id) => markComplete(id).then(() =>
                    toast.success('Lesson marked complete ✓', {
                      style: { background: '#0A0804', color: '#F0EAE0', border: '1px solid #22c55e' }
                    })
                  ) : undefined}
                  onMarkIncomplete={isLoggedIn ? (id) => handleMarkIncomplete(id) : undefined}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0 bg-[#0E0C08]">

          {/* Video player AT TOP */}
          <VideoPlayer
            videoUrl={lesson.video_url}
            lessonId={lesson.id}
            title={lesson.title}
            duration={lesson.duration_seconds}
            onComplete={() => !isLessonDone && !hasQuiz && handleMarkComplete()}
            initialProgress={isLessonDone ? 100 : 0}
          />

          {/* Content area */}
          <div className="flex-1 max-w-3xl w-full mx-auto px-6 md:px-10 py-10 lg:py-16">

            {/* Lesson header */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                 <div className="h-10 w-10 rounded-full border-2 border-[#E8621A] flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-[#E8621A] uppercase tracking-tighter">{lesson.order_index}</span>
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-orange-DEFAULT/60">
                         Module {lesson.order_index}
                      </span>
                      {lesson.is_preview && (
                        <span className="font-mono text-[0.5rem] tracking-widest uppercase px-2 py-0.5 border border-green-400 text-green-400">
                          Preview
                        </span>
                      )}
                      {isLessonDone && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="font-mono text-[0.5rem] tracking-widest uppercase px-2 py-0.5 border border-[#22c55e] text-[#22c55e] flex items-center gap-1"
                        >
                          ✓ Complete
                        </motion.span>
                      )}
                    </div>
                    <h1 className="font-display text-[clamp(1.8rem,4vw,3.5rem)] leading-[0.95] tracking-[0.02em] text-white">
                      {lesson.title}
                    </h1>
                 </div>
              </div>
              {lesson.description && (
                <p className="font-body text-base italic text-grey-DEFAULT leading-relaxed max-w-2xl">
                  {lesson.description}
                </p>
              )}
            </div>

            {/* ── ASSUMPTION LABS ── */}
            {activeTab === 'lesson' && lesson.id === 'c01-l01' && (
              <AssumptionLab 
                title="The 11 Million Bit Filter"
                subtitle="Exposing the Invisible Ceiling"
                scenario="Usually, you see 'closed stores' or 'sold out' signs in your neighborhood. Your RAS is programmed to protect you by finding evidence of lack."
                prompt="What one opportunity has your RAS been filtering out because it didn't fit your old story of 'not enough'?"
                accentColor="#E8621A"
              />
            )}

            {activeTab === 'lesson' && lesson.id === 'c02-l02' && (
              <AssumptionLab 
                title="Thinking From vs. Of"
                subtitle="The Tactile Shift"
                scenario="You are currently 'thinking of' a beach (distance/wanting). Shift to 'thinking from' the beach (possession), while remembering the old desk as a distant dream."
                prompt="Describe the tactile feeling of the sand under your feet while remembering the old 'office self' as a distant, separate character."
                accentColor="#C9A84C"
              />
            )}

            {/* ── TABS ── */}
            <div className="flex items-center gap-8 border-b border-white/5 mb-8">
              <button
                onClick={() => setActiveTab('lesson')}
                className={cn(
                  'pb-4 text-[0.65rem] tracking-[0.2em] uppercase font-mono transition-all relative',
                  activeTab === 'lesson' ? 'text-[#E8621A]' : 'text-white/30 hover:text-white/60'
                )}
              >
                01. Lesson
                {activeTab === 'lesson' && (
                  <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8621A]" />
                )}
              </button>

              {hasQuiz && (
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={cn(
                    'pb-4 text-[0.65rem] tracking-[0.2em] uppercase font-mono transition-all relative',
                    activeTab === 'quiz' ? 'text-[#E8621A]' : 'text-white/30 hover:text-white/60'
                  )}
                >
                  02. Quiz
                  {activeTab === 'quiz' && (
                    <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8621A]" />
                  )}
                </button>
              )}

              <button
                onClick={() => setActiveTab('notes')}
                className={cn(
                  'pb-4 text-[0.65rem] tracking-[0.2em] uppercase font-mono transition-all relative',
                  activeTab === 'notes' ? 'text-[#E8621A]' : 'text-white/30 hover:text-white/60'
                )}
              >
                03. My Notes
                {activeTab === 'notes' && (
                  <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8621A]" />
                )}
              </button>
            </div>

            {/* ── TAB CONTENT ── */}
            <AnimatePresence mode="wait">
              {activeTab === 'lesson' && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <LessonContent content={lesson.content_md || ''} />
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

              {activeTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-[400px] flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-body text-sm text-white/40 italic">
                      Your insights and action steps for this lesson…
                    </p>
                    <div className="flex items-center gap-2">
                       {notesSaving && <Loader2 size={12} className="text-[#E8621A] animate-spin" />}
                       {notesSaved && <span className="font-mono text-[0.6rem] tracking-widest text-[#E8621A]">All changes saved</span>}
                    </div>
                  </div>
                    <textarea
                    className="flex-1 w-full bg-white/5 border border-white/5 rounded-xl p-6 text-white font-body text-lg leading-relaxed
                               focus:bg-white/[0.08] focus:border-[#E8621A]/30 outline-none transition-all resize-none min-h-[400px]"
                    placeholder="Capture your thoughts here…"
                    value={lessonNotes || ''}
                    onChange={(e) => handleNotesChange(e.target.value)}
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

            {/* ── COURSE COMPLETION BANNER ── */}
            {allDone && (
              <CourseCompletionBanner
                courseName={course.title}
                courseOrderIndex={course.order_index}
                userTier={userTier}
                isLoggedIn={isLoggedIn}
              />
            )}

            {/* ── COMPLETION / NAVIGATION FOOTER ── */}
            <div className="mt-12 pt-8 border-t border-white/8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Prev */}
                <div>
                  {prevLesson ? (
                    <Link
                      href={`/personal/${course.slug}/${prevLesson.id}`}
                      className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.15em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors"
                    >
                      <ChevronLeft size={14} />
                      <span className="hidden sm:inline">Previous:</span> {prevLesson.title}
                    </Link>
                  ) : (
                    <Link
                      href={`/personal/${course.slug}`}
                      className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.15em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors"
                    >
                      <ChevronLeft size={14} /> Course Overview
                    </Link>
                  )}
                </div>

                {/* Mark complete / next */}
                <div className="flex items-center gap-3">
                  {isLessonDone ? (
                    <>
                      {nextLesson ? (
                        <Link
                          href={`/personal/${course.slug}/${nextLesson.id}`}
                          className="btn-orange flex items-center gap-2"
                        >
                          Next Lesson <ChevronRight size={14} />
                        </Link>
                      ) : (
                        <Link
                          href={`/personal/${course.slug}`}
                          className="btn-orange flex items-center gap-2"
                        >
                          <CheckCircle size={14} /> Course Complete
                        </Link>
                      )}
                      {/* Mark incomplete — small ghost button */}
                      {isLoggedIn && (
                        <button
                          onClick={() => handleMarkIncomplete(lesson.id)}
                          className="font-mono text-[0.52rem] tracking-widest uppercase px-3 py-1.5 rounded border border-white/10 text-grey-dark hover:border-white/30 hover:text-white/60 transition-colors"
                        >
                          Mark Incomplete
                        </button>
                      )}
                    </>
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

            {/* ── COURSE COMPLETION BANNER ── */}
            <AnimatePresence>
              {isAllComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="mt-10 relative overflow-hidden"
                >
                  {/* Animated confetti-style particles */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-3 rounded-full"
                        style={{
                          background: i % 3 === 0 ? '#F97316' : i % 3 === 1 ? '#C9A84C' : '#22c55e',
                          left: `${(i / 12) * 100}%`,
                          top: '-8px',
                        }}
                        animate={{ y: [0, 80, 160], opacity: [1, 0.6, 0], rotate: [0, 180, 360] }}
                        transition={{ duration: 1.8, delay: i * 0.08, ease: 'easeIn' }}
                      />
                    ))}
                  </motion.div>

                  <div className="p-8 bg-black-2 border-2 border-[#F97316] text-center">
                    <div className="font-mono text-[0.58rem] tracking-[0.3em] uppercase text-[#F97316] mb-3">
                      Course Complete
                    </div>
                    <h2 className="font-display text-[clamp(2.2rem,5vw,4rem)] leading-none tracking-[0.04em] text-white mb-3">
                      COURSE COMPLETE
                    </h2>
                    <p className="font-body text-base italic text-grey-DEFAULT mb-6 max-w-md mx-auto leading-relaxed">
                      You&apos;ve completed <span className="text-white not-italic">{course.title}</span>. Your reality is being architected.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      {course.order_index < 4 ? (
                        <Link href="/personal" className="btn-orange flex items-center gap-2">
                          Explore Next Course <ArrowRight size={14} />
                        </Link>
                      ) : (
                        <Link href="/personal" className="btn-orange flex items-center gap-2">
                          <Sparkles size={14} /> View All Courses
                        </Link>
                      )}

                      {/* Architect → Course 4 upsell */}
                      {course.order_index === 3 && userTier === 'architect' && (
                        <div className="flex items-center gap-3 p-4 bg-black-3 border border-orange-DEFAULT/30 text-left max-w-sm">
                          <Crown size={16} className="text-orange-DEFAULT flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-mono text-[0.55rem] tracking-widest uppercase text-orange-DEFAULT mb-0.5">
                              Unlock Course 4
                            </p>
                            <p className="font-body text-xs text-grey-DEFAULT italic leading-snug">
                              Navigating the Echo Theory Delay
                            </p>
                          </div>
                          <Link href="/personal/echo-theory-delay" className="btn-orange text-[0.58rem] px-3 py-1.5 flex-shrink-0">
                            Unlock
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

      </div>

      {/* ─── MOBILE SIDEBAR DRAWER ─────────────────────────────── */}
      <MobileSidebar
        course={course}
        lessons={lessons}
        currentLesson={lesson}
        completedIds={effectiveCompletedIds}
        onMarkComplete={isLoggedIn ? (id) => markComplete(id).then(() =>
          toast.success('Lesson marked complete ✓', {
            style: { background: '#0A0804', color: '#F0EAE0', border: '1px solid #22c55e' }
          })
        ) : undefined}
        onMarkIncomplete={isLoggedIn ? (id) => handleMarkIncomplete(id) : undefined}
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
  onMarkComplete,
  onMarkIncomplete,
}: {
  course: Course
  lessons: Lesson[]
  currentLesson: Lesson
  completedIds: string[]
  onMarkComplete?:   (lessonId: string) => void
  onMarkIncomplete?: (lessonId: string) => void
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
                onMarkComplete={onMarkComplete}
                onMarkIncomplete={onMarkIncomplete}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
