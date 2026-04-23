'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, PanelRight, CheckCircle, Circle, Lock,
  Menu, X, Loader2, ArrowRight, FileText,
} from 'lucide-react'
import { VideoPlayer } from '@/components/personal/VideoPlayer'
import { LessonContent } from '@/components/personal/LessonContent'
import { AssumptionLab } from '@/components/shared/AssumptionLab'
import { useLessonNotes } from '@/hooks/useLessonNotes'
import { cn } from '@/lib/utils'
import { COURSES } from '@/lib/leadership/curriculum'
import type { QuizQuestion } from '@/lib/leadership/curriculum'
import type { Lesson as DbLesson } from '@/types'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LeadershipLessonPlayerProps {
  initialCourseId?:  string
  initialLessonId?:  string
  initialLessons?:   DbLesson[]
  externalProgress?: Record<string, string[]>
  allowedCourses?:   string[]
  onLessonComplete?: (courseId: string, lessonId: string) => void
  onNavigate?:       (courseId: string, lessonId: string) => void
  userTier?:         string // reserved for future tier-gating UI
}

type Tab = 'lesson' | 'interact' | 'notes'

// ─── Main player ──────────────────────────────────────────────────────────────

export default function LeadershipLessonPlayer({
  initialCourseId  = 'leadership_course_1',
  initialLessonId  = 'the-responsibility-formula',
  initialLessons   = [],
  externalProgress = {},
  allowedCourses   = ['leadership_course_1'],
  onLessonComplete,
  onNavigate,
  userTier: _userTier = 'seeker',
}: LeadershipLessonPlayerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab]     = useState<Tab>('lesson')
  const [completedMap, setCompletedMap] = useState<Record<string, string[]>>(externalProgress)
  const [quizPassed, setQuizPassed]   = useState<Record<string, boolean>>({})
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  useEffect(() => { setCompletedMap(externalProgress) }, [externalProgress])

  // Prefer initialLessons (from DB) if they belong to this course
  const lessons = (initialLessons && initialLessons.length > 0 && initialLessons[0].course_id === initialCourseId)
    ? initialLessons
    : (COURSES.find(c => c.id === initialCourseId) ?? COURSES[0]).lessons as unknown as DbLesson[]

  const course  = COURSES.find(c => c.id === initialCourseId) ?? COURSES[0]
  const lesson  = lessons.find(l => l.id === initialLessonId) ?? lessons[0]

  const lessonIdx  = lessons.findIndex(l => l.id === lesson.id)
  const prevLesson = lessonIdx > 0 ? lessons[lessonIdx - 1] : null
  const nextLesson = lessonIdx < lessons.length - 1 ? lessons[lessonIdx + 1] : null

  const isLessonDone = completedMap[course.id]?.includes(lesson.id) ?? false
  const isQuizPassed = quizPassed[lesson.id] ?? false

  // Quiz belongs to the course, shown on the last lesson
  const isLastLesson = lessonIdx === lessons.length - 1
  const hasQuiz      = isLastLesson && course.quiz.questions.length > 0

  const trackCompleted = completedMap[course.id]?.length ?? 0
  const percentDone    = lessons.length
    ? Math.round((trackCompleted / lessons.length) * 100)
    : 0

  const { content: lessonNotes, handleChange: handleNotesChange, saving: notesSaving, saved: notesSaved } =
    useLessonNotes(lesson.id)

  function handleComplete() {
    if (isLessonDone) return
    setCompletedMap(prev => ({
      ...prev,
      [course.id]: [...(prev[course.id] ?? []), lesson.id],
    }))
    onLessonComplete?.(course.id, lesson.id)
  }

  function handleQuizPass() {
    setQuizPassed(prev => ({ ...prev, [lesson.id]: true }))
    handleComplete()
    setActiveTab('lesson')
  }

  function navigate(courseId: string, lessonId: string) {
    onNavigate?.(courseId, lessonId)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* ─── TOP BAR ────────────────────────────────────────────── */}
      <div className="h-[64px] bg-[#0E0C08] border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 relative z-30">
        {/* Left: breadcrumb */}
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="font-display text-xl tracking-widest text-[#E8621A] hover:opacity-80 transition-opacity hidden sm:block">
            VIBE<span className="text-white">HYR</span>
          </Link>
          <span className="text-white/10 text-xs flex-shrink-0 hidden sm:block">/</span>
          <Link
            href={`/leadership/${course.id}`}
            className="flex items-center gap-2 text-white/40 hover:text-[#E8621A] transition-colors flex-shrink-0"
          >
            <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase hidden md:block">
              {course.title}
            </span>
            <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase md:hidden">
              Leadership
            </span>
          </Link>
          <span className="text-white/10 text-xs flex-shrink-0">/</span>
          <span className="font-mono text-[0.65rem] tracking-[0.15em] text-white/90 truncate max-w-[200px] md:max-w-none uppercase">
             {lesson.title}
          </span>
        </div>

        {/* Center: progress bar */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-4">
          <div className="w-40 h-[2px] bg-white/5 relative rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-[#E8621A] transition-all duration-700 ease-out"
              style={{ width: `${percentDone}%` }}
            />
          </div>
          <span className="font-mono text-[0.6rem] tracking-[0.2em] text-[#E8621A] font-bold">
            {percentDone}%
          </span>
        </div>

        {/* Right: nav + sidebar toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {prevLesson && (
            <Link
              href={`/leadership/${course.id}/${prevLesson.id}`}
              onClick={() => navigate(course.id, prevLesson.id)}
              className="text-white/40 hover:text-[#E8621A] transition-colors p-2 hover:bg-white/5 rounded-lg"
              title="Previous lesson"
            >
              <ChevronLeft size={18} />
            </Link>
          )}
          {nextLesson && (
            <Link
              href={`/leadership/${course.id}/${nextLesson.id}`}
              onClick={() => navigate(course.id, nextLesson.id)}
              className="text-white/40 hover:text-[#E8621A] transition-colors p-2 hover:bg-white/5 rounded-lg"
              title="Next lesson"
            >
              <ChevronRight size={18} />
            </Link>
          )}
          {/* Mobile drawer toggle */}
          <button
            className="lg:hidden p-2 text-white/40 hover:text-[#E8621A] transition-colors"
            onClick={() => setMobileDrawerOpen(o => !o)}
          >
            {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className={cn(
              'ml-1 p-2 transition-colors hidden lg:block rounded-lg hover:bg-white/5',
              sidebarOpen ? 'text-[#E8621A]' : 'text-white/40 hover:text-[#E8621A]'
            )}
            title="Toggle sidebar"
          >
            <PanelRight size={20} />
          </button>
        </div>
      </div>

      {/* ─── BODY ───────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden flex-col lg:flex-row-reverse">

        {/* SIDEBAR (desktop) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="hidden lg:block flex-shrink-0 overflow-hidden border-l border-white/5 bg-[#0E0C08]/80 backdrop-blur-xl"
            >
              <div className="w-[320px] h-full">
                <LeaderSidebar
                  course={course}
                  currentLessonId={lesson.id}
                  completedIds={completedMap[course.id] ?? []}
                  allowedCourses={allowedCourses}
                  lessons={lessons}
                  onNavigate={onNavigate}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0 bg-[#0E0C08]">

          {/* Video Player */}
          <VideoPlayer
            videoUrl={lesson.video_url}
            lessonId={lesson.id}
            title={lesson.title}
          />

          <div className="flex-1 max-w-3xl w-full mx-auto px-6 md:px-10 py-10 lg:py-16">

            {/* Lesson Header */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="h-10 w-10 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: course.color }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: course.color }}>
                    {lessonIdx + 1}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-white/40">
                      Lesson {lessonIdx + 1} · Course {course.num}
                    </span>
                    {isLessonDone && (
                      <span className="font-mono text-[0.5rem] tracking-widest uppercase px-2 py-0.5 border border-[#E8621A] text-[#E8621A] flex items-center gap-1">
                        <CheckCircle size={9} /> Complete
                      </span>
                    )}
                  </div>
                  <h1 className="font-display text-[clamp(1.8rem,4vw,3.5rem)] leading-[0.95] tracking-[0.02em] text-white">
                    {lesson.title}
                  </h1>
                </div>
              </div>
              <p className="font-body text-base italic text-white/50 leading-relaxed max-w-2xl">
                {lesson.description}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-white/5 mb-8">
              <LeaderTab id="lesson" active={activeTab} setActive={setActiveTab} label="01. Lesson" />
              {hasQuiz && (
                <LeaderTab id="interact" active={activeTab} setActive={setActiveTab} label="02. Quiz" />
              )}
              <LeaderTab
                id="notes"
                active={activeTab}
                setActive={setActiveTab}
                label={hasQuiz ? '03. My Notes' : '02. My Notes'}
              />
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === 'lesson' && (
                <motion.div
                  key="lesson"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Main lesson content (HTML preferred) */}
                  <div className="mb-12">
                    <LessonContent content={lesson.content_md || ''} />
                  </div>

                  {/* Legacy Neuroscience/Law anchors only if using static data fallback */}
                  {(!initialLessons || initialLessons.length === 0) && (
                    <div className="mb-8 space-y-6">
                      {(lesson as any).neuroscienceAnchor && (
                        <div className="border-l-4 border-[#E8621A] pl-6 py-2 bg-[#E8621A]/5">
                          <p className="font-mono text-[0.5rem] tracking-[0.25em] uppercase text-[#E8621A] mb-2">
                            Neuroscience Anchor
                          </p>
                          <p className="font-body text-lg text-white italic leading-[1.8]">
                            {(lesson as any).neuroscienceAnchor}
                          </p>
                        </div>
                      )}
                      {(lesson as any).lawAnchor && (
                        <div className="border-l-4 border-[#C9A84C] pl-6 py-2 bg-[#C9A84C]/5">
                          <p className="font-mono text-[0.5rem] tracking-[0.25em] uppercase text-[#C9A84C] mb-2">
                            Law of Assumption
                          </p>
                          <p className="font-body text-lg text-white italic leading-[1.8]">
                            {(lesson as any).lawAnchor}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assumption Lab — per lesson */}
                  <div className="my-10">
                    <AssumptionLab
                      title={`${lesson.title} — Reflection`}
                      subtitle="Internal Authority Practice"
                      prompt={`In the context of "${lesson.title}", examine your current assumption: "${(lesson as any).keyConcepts?.[0] || 'your core leadership identity'}". How would your leadership behavior shift if you assumed this were already true about you?`}
                      accentColor={course.color}
                    />
                  </div>

                  {/* Course quiz teaser on last lesson */}
                  {isLastLesson && course.assumptionLab && (
                    <div className="mb-8 p-5 bg-white/[0.03] border border-[#C9A84C]/30">
                      <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-[#C9A84C] mb-2">
                        Course Lab — {course.assumptionLab.title}
                      </p>
                      <p className="font-body text-sm text-white/60 leading-relaxed mb-3">
                        {course.assumptionLab.prompt}
                      </p>
                      <ul className="space-y-1">
                        {course.assumptionLab.outputFormat.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#C9A84C] text-xs mt-0.5 flex-shrink-0">◈</span>
                            <span className="font-body text-xs text-white/50">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'interact' && hasQuiz && (
                <motion.div
                  key="interact"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Course Assumption Lab — full interactive version */}
                  {course.assumptionLab && (
                    <div className="mb-12">
                      <div className="mb-2">
                        <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-[#C9A84C]">
                          Course Lab · {course.assumptionLab.title}
                        </p>
                      </div>
                      <AssumptionLab
                        title={course.assumptionLab.title}
                        subtitle={course.assumptionLab.processDescription}
                        prompt={course.assumptionLab.prompt}
                        placeholder={course.assumptionLab.inputPlaceholder}
                        buttonText="Generate My Blueprint ✦"
                        accentColor={course.color}
                      />
                      {/* Output format preview */}
                      <div className="mt-4 p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                        <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-[#C9A84C] mb-3">
                          Lab Output Includes
                        </p>
                        <ul className="space-y-1.5">
                          {course.assumptionLab.outputFormat.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#C9A84C] text-xs mt-0.5 flex-shrink-0">◈</span>
                              <span className="font-body text-xs text-white/50 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-4 mb-10">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-white/20">
                      Course Quiz Gate
                    </span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>

                  <LeaderQuiz
                    title={course.quiz.title}
                    questions={course.quiz.questions}
                    passingScore={course.quiz.passingScore}
                    onPass={handleQuizPass}
                    alreadyPassed={isLessonDone || isQuizPassed}
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
                      Your leadership insights for this lesson…
                    </p>
                    <div className="flex items-center gap-2">
                      {notesSaving && <Loader2 size={12} className="text-[#E8621A] animate-spin" />}
                      {notesSaved && (
                        <span className="font-mono text-[0.6rem] tracking-widest text-[#E8621A]">
                          All changes saved
                        </span>
                      )}
                    </div>
                  </div>
                  <textarea
                    className="flex-1 w-full bg-white/5 border border-white/5 rounded-xl p-6 text-white font-body text-lg leading-relaxed
                                focus:bg-white/[0.08] focus:border-[#E8621A]/30 outline-none transition-all resize-none min-h-[400px]"
                    placeholder="Capture your insights here…"
                    value={lessonNotes || ''}
                    onChange={e => handleNotesChange(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quiz gate prompt (last lesson only) */}
            {activeTab === 'lesson' && hasQuiz && !isLessonDone && !isQuizPassed && (
              <div className="mt-10 flex items-center gap-5 p-5 bg-[#141008] border border-[#E8621A]/40">
                <Lock size={18} className="text-[#E8621A] flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-[#E8621A] mb-1">
                    Course Quiz — {course.quiz.title}
                  </p>
                  <p className="font-body text-sm text-white/50 italic">
                    Pass the knowledge check ({course.quiz.passingScore}%+) to complete this course and unlock the next.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('interact')}
                  className="btn-orange text-[0.62rem] px-5 py-2.5 flex-shrink-0 flex items-center gap-2"
                >
                  Take Quiz <ArrowRight size={12} />
                </button>
              </div>
            )}

            {/* Footer navigation */}
            <div className="mt-12 pt-8 border-t border-white/8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  {prevLesson ? (
                    <Link
                      href={`/leadership/${course.id}/${prevLesson.id}`}
                      onClick={() => navigate(course.id, prevLesson.id)}
                      className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.15em] uppercase text-white/30 hover:text-[#E8621A] transition-colors"
                    >
                      <ChevronLeft size={14} />
                      <span className="hidden sm:inline">Previous:</span> {prevLesson.title}
                    </Link>
                  ) : (
                    <Link
                      href={`/leadership/${course.id}`}
                      className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.15em] uppercase text-white/30 hover:text-[#E8621A] transition-colors"
                    >
                      <ChevronLeft size={14} /> Course Overview
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {isLessonDone ? (
                    nextLesson ? (
                      <Link
                        href={`/leadership/${course.id}/${nextLesson.id}`}
                        onClick={() => navigate(course.id, nextLesson.id)}
                        className="btn-orange flex items-center gap-2"
                      >
                        Next Lesson <ChevronRight size={14} />
                      </Link>
                    ) : (
                    <div className="flex items-center gap-3">
                      <Link
                        href="/dashboard/certificates"
                        className="btn-outline-orange flex items-center gap-2"
                      >
                        <FileText size={14} /> Download Certificate
                      </Link>
                      <Link
                        href="/leadership"
                        className="btn-orange flex items-center gap-2"
                      >
                        <CheckCircle size={14} /> Course Complete
                      </Link>
                    </div>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        if (hasQuiz && !isQuizPassed) {
                          setActiveTab('interact')
                          return
                        }
                        handleComplete()
                        if (nextLesson) navigate(course.id, nextLesson.id)
                      }}
                      className={cn(
                        'btn-orange flex items-center gap-2',
                        hasQuiz && !isQuizPassed && 'opacity-60'
                      )}
                    >
                      <CheckCircle size={14} />
                      {hasQuiz && !isQuizPassed ? 'Quiz Required First' : 'Mark Complete'}
                      {nextLesson && !(hasQuiz && !isQuizPassed) && <ChevronRight size={12} />}
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── MOBILE DRAWER ──────────────────────────────────────── */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <motion.div
            key="mobile-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-y-0 right-0 w-80 z-50 bg-[#0E0C08] border-l border-white/8 lg:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#E8621A]">Lessons</span>
              <button onClick={() => setMobileDrawerOpen(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <LeaderSidebar
              course={course}
              currentLessonId={lesson.id}
              completedIds={completedMap[course.id] ?? []}
              allowedCourses={allowedCourses}
              lessons={lessons}
              onNavigate={onNavigate}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function LeaderTab({
  id, active, setActive, label,
}: {
  id: Tab
  active: Tab
  setActive: (t: Tab) => void
  label: string
}) {
  return (
    <button
      onClick={() => setActive(id)}
      className={cn(
        'pb-4 text-[0.65rem] tracking-[0.2em] uppercase font-mono transition-all relative',
        active === id ? 'text-[#E8621A]' : 'text-white/30 hover:text-white/60'
      )}
    >
      {label}
      {active === id && (
        <motion.div
          layoutId="leader-tab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8621A]"
        />
      )}
    </button>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function LeaderSidebar({
  course,
  currentLessonId,
  completedIds,
  allowedCourses,
  lessons,
  onNavigate,
}: {
  course:          typeof COURSES[0]
  currentLessonId: string
  completedIds:    string[]
  allowedCourses:  string[]
  lessons:         DbLesson[]
  onNavigate?:     (courseId: string, lessonId: string) => void
}) {
  const pct = lessons.length
    ? Math.round((completedIds.length / lessons.length) * 100)
    : 0

  return (
    <aside className="flex flex-col h-full overflow-hidden">
      {/* Course header */}
      <div className="px-5 py-4 border-b border-white/8 flex-shrink-0">
        <Link
          href={`/leadership/${course.id}`}
          className="font-mono text-[0.55rem] tracking-[0.2em] uppercase hover:text-[#E8621A] transition-colors"
          style={{ color: course.color }}
        >
          ← {course.title}
        </Link>
        <div className="mt-2 h-px bg-white/5">
          <div
            className="h-px transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: course.color }}
          />
        </div>
        <p className="font-mono text-[0.52rem] tracking-widest text-white/30 mt-1">
          {completedIds.length}/{lessons.length} lessons · {pct}%
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {/* All courses list */}
        <div className="px-5 py-3 border-b border-white/8">
          <span className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-white/30">
            All Courses
          </span>
        </div>
        <ul className="py-1">
          {COURSES.map(c => {
            const isAllowed = allowedCourses.includes(c.id)
            const isActive  = c.id === course.id
            return (
              <li key={c.id}>
                {isAllowed ? (
                  <Link
                    href={`/leadership/${c.id}/${c.lessons[0].id}`}
                    onClick={() => onNavigate?.(c.id, c.lessons[0].id)}
                    className={cn(
                      'flex items-center gap-3 px-5 py-3 transition-colors group',
                      isActive ? 'bg-[#E8621A]/10 border-r-2 border-[#E8621A]' : 'hover:bg-white/5'
                    )}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold"
                      style={{ backgroundColor: `${isActive ? '#E8621A' : c.color}20`, color: isActive ? '#E8621A' : c.color, border: `1px solid ${isActive ? '#E8621A' : c.color}40` }}
                    >
                      {c.num}
                    </div>
                    <span className={cn(
                      'font-body text-xs leading-snug',
                      isActive ? 'text-white font-semibold' : 'text-white/50 group-hover:text-white/80'
                    )}>
                      {c.title}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-5 py-3 opacity-40 cursor-not-allowed">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                      <Lock size={8} className="text-white/40" />
                    </div>
                    <span className="font-body text-xs text-white/30">{c.title}</span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {/* Current course lessons */}
        <div className="px-5 py-3 border-t border-b border-white/8">
          <span className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-white/30">
            Lessons in This Course
          </span>
        </div>
        <ul className="py-1">
          {lessons.map((les, idx) => {
            const done    = completedIds.includes(les.id)
            const current = les.id === currentLessonId
            return (
              <li key={les.id}>
                <Link
                  href={`/leadership/${course.id}/${les.id}`}
                  onClick={() => onNavigate?.(course.id, les.id)}
                  className={cn(
                    'flex items-start gap-3 px-5 py-3 transition-colors group',
                    current
                      ? 'bg-[#E8621A]/10 border-r-2 border-[#E8621A]'
                      : 'hover:bg-white/5'
                  )}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {done ? (
                      <CheckCircle size={13} className="text-[#E8621A]" />
                    ) : (
                      <Circle
                        size={13}
                        className={cn(
                          'transition-colors',
                          current ? 'text-[#E8621A]' : 'text-white/20 group-hover:text-white/50'
                        )}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      'font-body text-xs leading-snug',
                      current ? 'text-white font-semibold' : 'text-white/50'
                    )}>
                      {String(idx + 1).padStart(2, '0')}. {les.title}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}

// ─── Quiz component ───────────────────────────────────────────────────────────

type QuizPhase = 'intro' | 'taking' | 'passed' | 'failed'

function LeaderQuiz({
  title,
  questions,
  passingScore,
  onPass,
  alreadyPassed,
}: {
  title:        string
  questions:    QuizQuestion[]
  passingScore: number
  onPass:       () => void
  alreadyPassed?: boolean
}) {
  const [phase,     setPhase]     = useState<QuizPhase>(alreadyPassed ? 'passed' : 'intro')
  const [current,   setCurrent]   = useState(0)
  const [answers,   setAnswers]   = useState<number[]>([])
  const [selected,  setSelected]  = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  function startQuiz() {
    setPhase('taking')
    setCurrent(0)
    setAnswers([])
    setSelected(null)
    setConfirmed(false)
  }

  function confirmAnswer() {
    if (selected === null) return
    setConfirmed(true)
  }

  function nextQuestion() {
    const newAnswers = [...answers, selected!]
    if (current < questions.length - 1) {
      setAnswers(newAnswers)
      setCurrent(c => c + 1)
      setSelected(null)
      setConfirmed(false)
    } else {
      // Grade
      const correct = newAnswers.filter((a, i) => a === questions[i].correct).length
      const score   = Math.round((correct / questions.length) * 100)
      setAnswers(newAnswers)
      setPhase(score >= passingScore ? 'passed' : 'failed')
      if (score >= passingScore) onPass()
    }
  }

  const q = questions[current]

  if (phase === 'intro') {
    return (
      <div className="text-center py-12">
        <p className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-[#E8621A] mb-3">
          Course Quiz
        </p>
        <h3 className="font-display text-3xl text-white mb-4">{title}</h3>
        <p className="font-body text-sm text-white/50 mb-2">
          {questions.length} questions · {passingScore}% to pass
        </p>
        <p className="font-body text-sm text-white/40 italic mb-8">
          Pass this quiz to complete the course and unlock the next one.
        </p>
        <button onClick={startQuiz} className="btn-orange">
          Begin Quiz
        </button>
      </div>
    )
  }

  if (phase === 'passed') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full border-2 border-[#E8621A] flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={28} className="text-[#E8621A]" />
        </div>
        <p className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-[#E8621A] mb-2">
          Quiz Passed
        </p>
        <h3 className="font-display text-3xl text-white mb-4">Course Complete</h3>
        <p className="font-body text-sm text-white/50">
          Well done. Your next course has been unlocked.
        </p>
      </div>
    )
  }

  if (phase === 'failed') {
    const correct = answers.filter((a, i) => a === questions[i].correct).length
    const score   = Math.round((correct / questions.length) * 100)
    return (
      <div className="text-center py-12">
        <p className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-white/40 mb-3">
          Score: {score}% — {passingScore}% required
        </p>
        <h3 className="font-display text-3xl text-white mb-4">Not quite.</h3>
        <p className="font-body text-sm text-white/50 mb-8 italic">
          Review the lesson content and retake when ready.
        </p>
        <button onClick={startQuiz} className="btn-outline-orange">
          Retake Quiz
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <span className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-white/30">
          Question {current + 1} of {questions.length}
        </span>
        <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E8621A] transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="font-display text-2xl text-white mb-8 leading-tight">
        {q.q}
      </h3>

      <div className="space-y-3 mb-10">
        {q.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect  = confirmed && i === q.correct
          const isWrong    = confirmed && isSelected && i !== q.correct

          return (
            <button
              key={i}
              disabled={confirmed}
              onClick={() => setSelected(i)}
              className={cn(
                'w-full text-left p-5 transition-all border font-body text-sm leading-relaxed',
                isSelected && !confirmed && 'bg-[#E8621A]/10 border-[#E8621A] text-white',
                !isSelected && !confirmed && 'bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/[0.05]',
                isCorrect && 'bg-green-500/10 border-green-500 text-green-400',
                isWrong && 'bg-red-500/10 border-red-500 text-red-400',
                confirmed && !isSelected && !isCorrect && 'opacity-20'
              )}
            >
              <div className="flex items-center justify-between">
                <span>{opt}</span>
                {isCorrect && <CheckCircle size={14} />}
                {isWrong && <X size={14} />}
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end">
        {!confirmed ? (
          <button
            disabled={selected === null}
            onClick={confirmAnswer}
            className="btn-orange disabled:opacity-30"
          >
            Confirm Answer
          </button>
        ) : (
          <button onClick={nextQuestion} className="btn-orange flex items-center gap-2">
            {current < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
