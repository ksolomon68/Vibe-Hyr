'use client'

import Link from 'next/link'
import { Lock, FileText, ChevronRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatDuration } from '@/lib/utils'
import { useLessonNotes } from '@/hooks/useLessonNotes'
import type { Lesson, Course } from '@/types'

interface LessonSidebarProps {
  course:            Course
  lessons:           Lesson[]
  currentLesson:     Lesson
  completedIds:      string[]
  hasAccess:         boolean
  loading?:          boolean
  isLoggedIn?:       boolean
  onMarkComplete?:   (lessonId: string) => void
  onMarkIncomplete?: (lessonId: string) => void
  notesPreview?:     string
  notesSaved?:       boolean
  onOpenNotes?:      () => void
}

// ── Green checkmark circle ─────────────────────────────────────────────────────
function GreenCheck() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center flex-shrink-0"
      aria-label="Completed"
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  )
}

// ── Empty circle ───────────────────────────────────────────────────────────────
function EmptyCircle({ active }: { active?: boolean }) {
  return (
    <div
      className={cn(
        'w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors',
        active ? 'border-[#E8621A]' : 'border-[#444444]'
      )}
      aria-label="Not completed"
    />
  )
}

export function LessonSidebar({
  course,
  lessons,
  currentLesson,
  completedIds,
  hasAccess,
  loading = false,
  isLoggedIn = true,
  onMarkComplete,
  onMarkIncomplete,
  notesPreview = '',
  notesSaved = false,
  onOpenNotes,
}: LessonSidebarProps) {
  // Count non-header lessons for progress percentage (all lessons for now since no type field)
  const trackedLessons = lessons.length
  const completedCount = completedIds.length
  const pct = trackedLessons > 0 ? Math.round((completedCount / trackedLessons) * 100) : 0

  return (
    <aside className="flex flex-col h-full bg-black-2 border-l border-white/8 overflow-hidden">

      {/* Course title header + progress */}
      <div className="px-5 py-4 border-b border-white/8 flex-shrink-0">
        <Link
          href={`/personal/${course.slug}`}
          className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-orange-DEFAULT hover:text-orange-light transition-colors flex items-center gap-1"
        >
          ← {course.title}
        </Link>

        {/* Animated progress bar */}
        <div className="mt-2 h-px bg-black-4 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#F97316] rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <p className="font-mono text-[0.52rem] tracking-widest text-grey-dark mt-1">
          {completedCount}/{trackedLessons} lessons ·{' '}
          <span className="text-[#F97316]">{pct}%</span>
        </p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">

        {/* ── LESSON LIST ── */}
        <div className="flex-shrink-0">
          <div className="px-5 py-3 border-b border-white/8">
            <span className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-grey-dark">
              Lessons
            </span>
          </div>

          {/* Skeleton while progress is loading */}
          {loading && (
            <ul className="py-1">
              {lessons.slice(0, 6).map((_, i) => (
                <li key={i} className="flex items-start gap-3 px-5 py-3">
                  <div className="w-5 h-5 rounded-full bg-white/8 animate-pulse flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-white/8 animate-pulse rounded w-3/4" />
                    <div className="h-2 bg-white/5 animate-pulse rounded w-1/3" />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Sign-in nudge */}
          {!isLoggedIn && !loading && (
            <div className="px-5 py-4 text-center">
              <p className="font-mono text-[0.5rem] tracking-widest uppercase text-grey-dark leading-relaxed">
                <a href="/auth/login" className="text-orange-DEFAULT hover:underline">Sign in</a> to track your progress
              </p>
            </div>
          )}

          {!loading && <ul className="py-1">
            {lessons.map((lesson) => {
              const done    = completedIds.includes(lesson.id)
              const current = lesson.id === currentLesson.id
              const locked  = !hasAccess && !lesson.is_preview

              return (
                <li key={lesson.id}>
                  {locked ? (
                    <div className="flex items-start gap-3 px-5 py-3 opacity-40 cursor-not-allowed">
                      {/* Reserve space for circle */}
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5">
                        <Lock size={13} className="text-grey-dark" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-xs text-grey-dark leading-snug truncate">
                          {lesson.title}
                        </p>
                        <p className="font-mono text-[0.5rem] tracking-widest text-grey-dark mt-0.5">
                          {formatDuration(lesson.duration_seconds)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'group flex items-start gap-3 px-5 py-3 transition-colors',
                        current ? 'bg-orange-DEFAULT/10 border-r-2 border-orange-DEFAULT' : 'hover:bg-black-3'
                      )}
                    >
                      {/* — Circle (always reserves space, no layout shift) — */}
                      <div className="mt-0.5 flex-shrink-0">
                        <AnimatePresence mode="wait" initial={false}>
                          {done ? (
                            <GreenCheck key="check" />
                          ) : (
                            <motion.div
                              key="empty"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <EmptyCircle active={current} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* — Lesson info — */}
                      <Link
                        href={`/personal/${course.slug}/${lesson.id}`}
                        className="min-w-0 flex-1"
                      >
                        <p className={cn(
                          'font-body text-xs leading-snug',
                          current ? 'text-white font-semibold' : 'text-grey-DEFAULT'
                        )}>
                          {lesson.title}
                        </p>
                        <p className="font-mono text-[0.5rem] tracking-widest text-grey-dark mt-0.5">
                          {formatDuration(lesson.duration_seconds)}
                          {lesson.is_preview && (
                            <span className="ml-2 text-green-400">Preview</span>
                          )}
                        </p>
                      </Link>

                      {/* — Right side controls — */}
                      <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                        {current && !done && (
                          <ChevronRight size={11} className="text-orange-DEFAULT" />
                        )}

                        {/* Mark Complete / Mark Incomplete button */}
                        {(onMarkComplete || onMarkIncomplete) && (
                          <button
                            onClick={() =>
                              done
                                ? onMarkIncomplete?.(lesson.id)
                                : onMarkComplete?.(lesson.id)
                            }
                            className={cn(
                              // Always show on mobile, show on hover on desktop
                              'font-mono text-[0.48rem] tracking-widest uppercase px-2 py-0.5 rounded border transition-colors',
                              'sm:opacity-0 sm:group-hover:opacity-100',
                              done
                                ? 'border-[#22c55e]/40 text-[#22c55e]/70 hover:border-[#22c55e] hover:text-[#22c55e]'
                                : 'border-white/10 text-grey-dark hover:border-orange-DEFAULT/50 hover:text-orange-DEFAULT'
                            )}
                            title={done ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {done ? '✓ Done' : 'Complete'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>}
        </div>

        {/* ── NOTES PREVIEW (Unified single source of truth with 03. My Notes tab) ── */}
        <div className="flex-shrink-0 border-t border-white/8 p-5 bg-black/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText size={12} className="text-orange-DEFAULT" />
              <span className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-grey-dark">
                My Notes
              </span>
            </div>
            {notesSaved && (
              <span className="font-mono text-[0.5rem] tracking-widest text-orange-DEFAULT">Saved ✓</span>
            )}
          </div>
          <p className="font-body text-xs text-white/50 italic line-clamp-3 mb-3 leading-relaxed">
            {notesPreview?.trim()
              ? notesPreview
              : `No notes saved yet for "${currentLesson.title}".`}
          </p>
          {onOpenNotes && (
            <button
              onClick={onOpenNotes}
              className="w-full py-2 px-3 border border-orange-DEFAULT/40 text-orange-DEFAULT hover:bg-orange-DEFAULT/10 font-mono text-[0.52rem] tracking-[0.18em] uppercase transition-colors flex items-center justify-center gap-1.5"
            >
              Open Notes Workspace <ChevronRight size={11} />
            </button>
          )}
        </div>

      </div>
    </aside>
  )
}
