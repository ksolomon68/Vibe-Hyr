'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, PanelRight, CheckCircle, Circle, Lock,
  Menu, X, FileText, Loader2, ArrowRight,
} from 'lucide-react'
import { VideoPlayer } from '@/components/personal/VideoPlayer'
import { AssumptionLab } from '@/components/shared/AssumptionLab'
import { useLessonNotes } from '@/hooks/useLessonNotes'
import { cn } from '@/lib/utils'
import { TRACKS } from '@/lib/business/curriculum'
import type { QuizQuestion } from '@/lib/business/curriculum'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface WorkplaceLessonPlayerProps {
  initialTrackId?:   string
  initialLessonId?:  string
  externalProgress?: Record<string, string[]>
  allowedTracks?:    string[]
  onLessonComplete?: (trackId: string, lessonId: string) => void
  onNavigate?:       (trackId: string, lessonId: string) => void
  userTier?:         string
}

type Tab = 'lesson' | 'quiz' | 'notes'

// ─── Main player ──────────────────────────────────────────────────────────────

export default function WorkplaceLessonPlayer({
  initialTrackId  = 'common-sense-in-the-workplace',
  initialLessonId = 'the-awareness-gap',
  externalProgress = {},
  allowedTracks   = ['common-sense-in-the-workplace'],
  onLessonComplete,
  onNavigate,
  userTier = 'seeker',
}: WorkplaceLessonPlayerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab]     = useState<Tab>('lesson')
  const [completedMap, setCompletedMap] = useState<Record<string, string[]>>(externalProgress)
  const [quizPassed, setQuizPassed]   = useState<Record<string, boolean>>({})

  // Sync external progress
  useEffect(() => { setCompletedMap(externalProgress) }, [externalProgress])

  const track  = TRACKS.find(t => t.id === initialTrackId) ?? TRACKS[0]
  const lesson = track.lessons.find(l => l.id === initialLessonId) ?? track.lessons[0]

  const lessonIdx  = track.lessons.findIndex(l => l.id === lesson.id)
  const prevLesson = lessonIdx > 0 ? track.lessons[lessonIdx - 1] : null
  const nextLesson = lessonIdx < track.lessons.length - 1 ? track.lessons[lessonIdx + 1] : null

  const isLessonDone = completedMap[track.id]?.includes(lesson.id) ?? false
  const isQuizPassed = quizPassed[lesson.id] ?? false
  const hasQuiz      = lesson.quiz.length > 0

  const trackCompleted = completedMap[track.id]?.length ?? 0
  const percentDone    = track.lessons.length
    ? Math.round((trackCompleted / track.lessons.length) * 100)
    : 0

  const { content: lessonNotes, handleChange: handleNotesChange, saving: notesSaving, saved: notesSaved } =
    useLessonNotes(lesson.id)

  function handleComplete() {
    if (isLessonDone) return
    setCompletedMap(prev => ({
      ...prev,
      [track.id]: [...(prev[track.id] ?? []), lesson.id],
    }))
    onLessonComplete?.(track.id, lesson.id)
  }

  function handleQuizPass() {
    setQuizPassed(prev => ({ ...prev, [lesson.id]: true }))
    handleComplete()
    setActiveTab('lesson')
  }

  function navigate(trackId: string, lessonId: string) {
    onNavigate?.(trackId, lessonId)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* ─── TOP BAR ─────────────────────────────────────────────── */}
      <div className="h-[64px] bg-[#0E0C08] border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 relative z-30">
        {/* Left: breadcrumb */}
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="font-display text-xl tracking-widest text-[#E8621A] hover:opacity-80 transition-opacity hidden sm:block">
            VIBE<span className="text-white">HYR</span>
          </Link>
          <span className="text-white/10 text-xs flex-shrink-0 hidden sm:block">/</span>
          <Link
            href={`/business/${track.id}`}
            className="flex items-center gap-2 text-white/40 hover:text-[#E8621A] transition-colors flex-shrink-0"
          >
            <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase hidden md:block">
              {track.title}
            </span>
            <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase md:hidden">
              Training
            </span>
          </Link>
          <span className="text-white/10 text-xs flex-shrink-0">/</span>
          <span className="font-mono text-[0.65rem] tracking-[0.15em] text-white/90 truncate max-w-[200px] md:max-w-none uppercase">
            {lesson.num} — {lesson.title}
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

        {/* Right: nav arrows + sidebar toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {prevLesson && (
            <Link
              href={`/business/${track.id}/${prevLesson.id}`}
              onClick={() => navigate(track.id, prevLesson.id)}
              className="text-white/40 hover:text-[#E8621A] transition-colors p-2 hover:bg-white/5 rounded-lg"
              title="Previous lesson"
            >
              <ChevronLeft size={18} />
            </Link>
          )}
          {nextLesson && (
            <Link
              href={`/business/${track.id}/${nextLesson.id}`}
              onClick={() => navigate(track.id, nextLesson.id)}
              className="text-white/40 hover:text-[#E8621A] transition-colors p-2 hover:bg-white/5 rounded-lg"
              title="Next lesson"
            >
              <ChevronRight size={18} />
            </Link>
          )}
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
                <BizSidebar
                  track={track}
                  currentLessonId={lesson.id}
                  completedIds={completedMap[track.id] ?? []}
                  allowedTracks={allowedTracks}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0 bg-[#0E0C08]">

          {/* Video player */}
          <VideoPlayer
            videoUrl={null}
            lessonId={lesson.id}
            title={lesson.title}
          />

          <div className="flex-1 max-w-3xl w-full mx-auto px-6 md:px-10 py-10 lg:py-16">

            {/* Lesson header */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-full border-2 border-[#E8621A] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-[#E8621A] uppercase tracking-tighter">
                    {lesson.num}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-orange-DEFAULT/60">
                      Module {lesson.num} · {lesson.duration}
                    </span>
                    {lesson.isLive && (
                      <span className="font-mono text-[0.5rem] tracking-widest uppercase px-2 py-0.5 border border-orange-DEFAULT text-orange-DEFAULT">
                        ⚡ Live Session
                      </span>
                    )}
                    {isLessonDone && (
                      <span className="font-mono text-[0.5rem] tracking-widest uppercase px-2 py-0.5 border border-orange-DEFAULT text-orange-DEFAULT flex items-center gap-1">
                        <CheckCircle size={9} /> Complete
                      </span>
                    )}
                  </div>
                  <h1 className="font-display text-[clamp(1.8rem,4vw,3.5rem)] leading-[0.95] tracking-[0.02em] text-white">
                    {lesson.title}
                  </h1>
                </div>
              </div>
              <p className="font-body text-base italic text-grey-DEFAULT leading-relaxed max-w-2xl">
                {lesson.description}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-white/5 mb-8">
              <BizTab id="lesson" active={activeTab} setActive={setActiveTab} label="01. Lesson" />
              {hasQuiz && (
                <BizTab id="quiz" active={activeTab} setActive={setActiveTab} label="02. Quiz" />
              )}
              <BizTab
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
                  {/* Learning objectives */}
                  {lesson.objectives.length > 0 && (
                    <div className="mb-8 p-5 bg-white/[0.03] border border-white/8">
                      <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-orange-DEFAULT mb-3">
                        Learning Objectives
                      </p>
                      <ul className="space-y-2">
                        {lesson.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="text-orange-DEFAULT text-xs mt-0.5 flex-shrink-0">◈</span>
                            <span className="font-body text-sm text-grey-DEFAULT leading-relaxed">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Content blocks */}
                  <div className="space-y-5 mb-10">
                    {lesson.content.map((block, i) => (
                      <p
                        key={i}
                        className={cn(
                          'font-body text-lg leading-relaxed text-grey-DEFAULT',
                          i === 0 && 'italic border-l-2 border-orange-DEFAULT pl-5'
                        )}
                      >
                        {block}
                      </p>
                    ))}
                  </div>

                  {/* Tool badge */}
                  {lesson.tool && (
                    <div className="mb-8 p-4 bg-white/[0.03] border border-orange-DEFAULT/30">
                      <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-orange-DEFAULT mb-1">
                        Module Tool
                      </p>
                      <p className="font-body text-sm text-white font-semibold">{lesson.tool}</p>
                      <p className="font-body text-xs italic text-grey-dark mt-1">
                        Download or access in your workbook.
                      </p>
                    </div>
                  )}

                  {/* Assumption Labs — lesson-specific */}
                  {lesson.id === 'the-awareness-gap' && (
                    <div className="my-12">
                      <AssumptionLab
                        title="Awareness Gap Audit"
                        subtitle="Impact vs. Intent"
                        scenario="You gave 'direct feedback' to a subordinate, intending to be helpful. The subordinate seems crushed and has withdrawn for the rest of the day."
                        prompt="What 'threat signal' were you potentially broadcasting (tone, pace, posture) that you weren't aware of in the moment?"
                        accentColor="#E8621A"
                      />
                    </div>
                  )}

                  {lesson.id === 'the-reactivity-spectrum' && (
                    <div className="my-12">
                      <AssumptionLab
                        title="Reactivity Spectrum"
                        subtitle="The Sovereign Interrupt"
                        scenario="A disrespectful or accusatory email from a client or peer just arrived in your inbox. You feel your face heat up and your jaw tighten."
                        prompt="What is your pre-programmed (reactive) response sequence, and what is the 'Sovereign' interrupt you will apply right now?"
                        accentColor="#C9A84C"
                      />
                    </div>
                  )}

                  {track.id === 'know-yourself-lead-yourself' && lesson.tool && lesson.id !== 'the-awareness-gap' && lesson.id !== 'the-reactivity-spectrum' && (
                    <div className="my-12">
                      <AssumptionLab
                        title="Assumption Audit"
                        subtitle={lesson.tool}
                        prompt={`In the context of ${lesson.title}, examine your current assumption: "${lesson.objectives[0]}". How would your behavior shift if you assumed the opposite were true?`}
                        accentColor="#A855F7"
                      />
                    </div>
                  )}

                  {/* Live session booking */}
                  {lesson.isLive && (
                    <div className="mb-8 p-6 bg-orange-DEFAULT/10 border border-orange-DEFAULT/40">
                      <p className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-orange-DEFAULT mb-2">
                        ⚡ Live Session Required
                      </p>
                      <p className="font-body text-sm text-grey-DEFAULT leading-relaxed mb-4">
                        This module is a live facilitated session. Book your spot to complete this track.
                      </p>
                      <button
                        onClick={() => window.open('#book-live-session', '_blank')}
                        className="btn-orange text-[0.62rem] px-5 py-2.5 flex items-center gap-2"
                      >
                        Book Session <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'quiz' && hasQuiz && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <BizQuiz
                    questions={lesson.quiz}
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
                      Your workplace insights for this module…
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
                    placeholder="Capture your thoughts here…"
                    value={lessonNotes || ''}
                    onChange={e => handleNotesChange(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quiz gate prompt */}
            {activeTab === 'lesson' && hasQuiz && !isLessonDone && !isQuizPassed && (
              <div className="mt-10 flex items-center gap-5 p-5 bg-black-2 border border-orange-DEFAULT/40">
                <Lock size={18} className="text-orange-DEFAULT flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-orange-DEFAULT mb-1">
                    Quiz Required to Complete
                  </p>
                  <p className="font-body text-sm text-grey-DEFAULT italic">
                    Pass the knowledge check to mark this module complete.
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

            {/* Footer navigation */}
            <div className="mt-12 pt-8 border-t border-white/8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  {prevLesson ? (
                    <Link
                      href={`/business/${track.id}/${prevLesson.id}`}
                      onClick={() => navigate(track.id, prevLesson.id)}
                      className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.15em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors"
                    >
                      <ChevronLeft size={14} />
                      <span className="hidden sm:inline">Previous:</span> {prevLesson.title}
                    </Link>
                  ) : (
                    <Link
                      href={`/business/${track.id}`}
                      className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.15em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors"
                    >
                      <ChevronLeft size={14} /> Track Overview
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {isLessonDone ? (
                    nextLesson ? (
                      <Link
                        href={`/business/${track.id}/${nextLesson.id}`}
                        onClick={() => navigate(track.id, nextLesson.id)}
                        className="btn-orange flex items-center gap-2"
                      >
                        Next Module <ChevronRight size={14} />
                      </Link>
                    ) : (
                      <Link
                        href={`/business/${track.id}`}
                        className="btn-orange flex items-center gap-2"
                      >
                        <CheckCircle size={14} /> Track Complete
                      </Link>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        if (hasQuiz && !isQuizPassed) {
                          setActiveTab('quiz')
                          return
                        }
                        handleComplete()
                        if (nextLesson) navigate(track.id, nextLesson.id)
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

      {/* ─── MOBILE DRAWER ─────────────────────────────────────── */}
      <BizMobileDrawer
        track={track}
        currentLessonId={lesson.id}
        completedIds={completedMap[track.id] ?? []}
        allowedTracks={allowedTracks}
      />

    </div>
  )
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function BizTab({
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
          layoutId="biz-tab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8621A]"
        />
      )}
    </button>
  )
}

// ─── Business sidebar ─────────────────────────────────────────────────────────

function BizSidebar({
  track,
  currentLessonId,
  completedIds,
  allowedTracks,
}: {
  track:          typeof TRACKS[0]
  currentLessonId: string
  completedIds:    string[]
  allowedTracks:   string[]
}) {
  const { content, handleChange, saving, saved, loaded } = useLessonNotes(currentLessonId)
  const pct = track.lessons.length
    ? Math.round((completedIds.length / track.lessons.length) * 100)
    : 0

  return (
    <aside className="flex flex-col h-full bg-black-2 border-l border-white/8 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/8 flex-shrink-0">
        <Link
          href={`/business/${track.id}`}
          className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-orange-DEFAULT hover:text-orange-light transition-colors"
        >
          ← {track.title}
        </Link>
        <div className="mt-2 h-px bg-black-4">
          <div
            className="h-px bg-orange-DEFAULT transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="font-mono text-[0.52rem] tracking-widest text-grey-dark mt-1">
          {completedIds.length}/{track.lessons.length} modules · {pct}%
        </p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        {/* Lesson list */}
        <div className="flex-shrink-0">
          <div className="px-5 py-3 border-b border-white/8">
            <span className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-grey-dark">
              Modules
            </span>
          </div>
          <ul className="py-1">
            {track.lessons.map((lesson, idx) => {
              const done    = completedIds.includes(lesson.id)
              const current = lesson.id === currentLessonId
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/business/${track.id}/${lesson.id}`}
                    className={cn(
                      'flex items-start gap-3 px-5 py-3 transition-colors group',
                      current
                        ? 'bg-orange-DEFAULT/10 border-r-2 border-orange-DEFAULT'
                        : 'hover:bg-black-3'
                    )}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {done ? (
                        <CheckCircle size={13} className="text-orange-DEFAULT" />
                      ) : (
                        <Circle
                          size={13}
                          className={cn(
                            'transition-colors',
                            current ? 'text-orange-DEFAULT' : 'text-grey-dark group-hover:text-grey-DEFAULT'
                          )}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        'font-body text-xs leading-snug',
                        current ? 'text-white font-semibold' : 'text-grey-DEFAULT'
                      )}>
                        {String(idx + 1).padStart(2, '0')}. {lesson.title}
                      </p>
                      <p className="font-mono text-[0.5rem] tracking-widest text-grey-dark mt-0.5">
                        {lesson.duration}
                        {lesson.isLive && <span className="ml-2 text-orange-DEFAULT">⚡ Live</span>}
                      </p>
                    </div>
                    {current && (
                      <ChevronRight size={11} className="text-orange-DEFAULT mt-0.5 flex-shrink-0" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Other tracks */}
        <div className="flex-shrink-0 border-t border-white/8 px-5 py-3">
          <span className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-grey-dark">
            All Tracks
          </span>
          <div className="mt-2 space-y-1">
            {TRACKS.map(t => {
              const isActive  = t.id === track.id
              const isAllowed = allowedTracks.includes(t.id)
              return (
                <div key={t.id}>
                  {isAllowed ? (
                    <Link
                      href={`/business/${t.id}/${t.lessons[0].id}`}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 transition-colors text-xs font-body',
                        isActive ? 'text-orange-DEFAULT bg-orange-DEFAULT/10' : 'text-grey-dark hover:text-white hover:bg-black-3'
                      )}
                    >
                      <span>{t.num}. {t.title}</span>
                      {isActive && <ChevronRight size={10} className="text-orange-DEFAULT" />}
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between px-3 py-2 text-xs font-body text-grey-dark/40 cursor-not-allowed">
                      <span>{t.num}. {t.title}</span>
                      <Lock size={10} className="text-grey-dark/40" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="flex-1 flex flex-col border-t border-white/8 min-h-[200px]">
          <div className="px-5 py-3 flex items-center justify-between border-b border-white/8 flex-shrink-0">
            <div className="flex items-center gap-2">
              <FileText size={12} className="text-orange-DEFAULT" />
              <span className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-grey-dark">
                My Notes
              </span>
            </div>
            <div className="flex items-center gap-1.5 h-4">
              {saving && <Loader2 size={10} className="text-grey-dark animate-spin" />}
              {saved  && <span className="font-mono text-[0.5rem] tracking-widest text-orange-DEFAULT">Saved ✓</span>}
            </div>
          </div>
          {loaded ? (
            <textarea
              className="flex-1 bg-transparent text-white text-xs font-body leading-relaxed
                         p-4 resize-none outline-none placeholder:text-white/15
                         focus:bg-black-3 transition-colors"
              placeholder={`Notes for "${currentLessonId}"…`}
              value={content}
              onChange={e => handleChange(e.target.value)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={16} className="text-grey-dark animate-spin" />
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

// ─── Business quiz ────────────────────────────────────────────────────────────

function BizQuiz({
  questions,
  onPass,
  alreadyPassed,
}: {
  questions:    QuizQuestion[]
  onPass:       () => void
  alreadyPassed: boolean
}) {
  const [answers,   setAnswers]   = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(alreadyPassed)
  const [score,     setScore]     = useState(alreadyPassed ? questions.length : 0)

  if (alreadyPassed || (submitted && score === questions.length)) {
    return (
      <div className="p-8 bg-black-2 border-2 border-orange-DEFAULT text-center">
        <CheckCircle size={32} className="text-orange-DEFAULT mx-auto mb-4" />
        <p className="font-display text-2xl text-white mb-2">Module Complete</p>
        <p className="font-body text-sm italic text-grey-DEFAULT">
          You&apos;ve passed this module&apos;s knowledge check.
        </p>
      </div>
    )
  }

  function handleSubmit() {
    let s = 0
    questions.forEach((q, i) => { if (answers[i] === q.correct) s++ })
    setScore(s)
    setSubmitted(true)
    if (s === questions.length) setTimeout(onPass, 1200)
  }

  return (
    <div className="space-y-8">
      <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-orange-DEFAULT">
        Knowledge Check · {questions.length} {questions.length === 1 ? 'question' : 'questions'} · Pass to Complete
      </p>

      {questions.map((q, qi) => (
        <div key={qi} className="space-y-3">
          <p className="font-body text-base text-white leading-relaxed">
            <span className="text-orange-DEFAULT font-mono text-[0.65rem] mr-2">Q{qi + 1}.</span>
            {q.q}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi
              const correct  = submitted && oi === q.correct
              const wrong    = submitted && selected && oi !== q.correct
              return (
                <button
                  key={oi}
                  onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                  disabled={submitted}
                  className={cn(
                    'w-full text-left px-5 py-3 border text-sm font-body transition-all flex items-center gap-3',
                    correct  ? 'border-green-500 bg-green-500/10 text-green-400' :
                    wrong    ? 'border-red-500 bg-red-500/10 text-red-400' :
                    selected ? 'border-orange-DEFAULT bg-orange-DEFAULT/10 text-white' :
                               'border-white/10 text-grey-DEFAULT hover:border-white/30 hover:text-white'
                  )}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] flex-shrink-0 font-bold">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          className={cn(
            'btn-orange flex items-center gap-2',
            Object.keys(answers).length < questions.length && 'opacity-40 cursor-not-allowed'
          )}
        >
          Submit Answers <ArrowRight size={14} />
        </button>
      ) : score < questions.length ? (
        <div className="space-y-3">
          <p className="font-mono text-[0.6rem] tracking-widest text-orange-DEFAULT uppercase">
            {score}/{questions.length} correct — review and try again
          </p>
          <button
            onClick={() => { setAnswers({}); setSubmitted(false); setScore(0) }}
            className="btn-outline text-[0.62rem] px-5 py-2.5"
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  )
}

// ─── Mobile bottom-sheet drawer ───────────────────────────────────────────────

function BizMobileDrawer({
  track,
  currentLessonId,
  completedIds,
  allowedTracks,
}: {
  track:           typeof TRACKS[0]
  currentLessonId: string
  completedIds:    string[]
  allowedTracks:   string[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="lg:hidden fixed bottom-5 right-5 z-40 w-12 h-12 bg-orange-DEFAULT text-black flex items-center justify-center shadow-xl"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

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
              <BizSidebar
                track={track}
                currentLessonId={currentLessonId}
                completedIds={completedIds}
                allowedTracks={allowedTracks}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
