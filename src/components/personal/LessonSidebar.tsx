'use client'

import Link from 'next/link'
import { CheckCircle, Circle, Lock, FileText, ChevronRight, Save, Loader2 } from 'lucide-react'
import { cn, formatDuration } from '@/lib/utils'
import { useLessonNotes } from '@/hooks/useLessonNotes'
import type { Lesson, Course } from '@/types'

interface LessonSidebarProps {
  course:         Course
  lessons:        Lesson[]
  currentLesson:  Lesson
  completedIds:   string[]
  hasAccess:      boolean
}

export function LessonSidebar({
  course,
  lessons,
  currentLesson,
  completedIds,
  hasAccess,
}: LessonSidebarProps) {
  const { content, handleChange, saving, saved, loaded } = useLessonNotes(currentLesson.id)

  return (
    <aside className="flex flex-col h-full bg-black-2 border-l border-white/8 overflow-hidden">

      {/* Course title header */}
      <div className="px-5 py-4 border-b border-white/8 flex-shrink-0">
        <Link
          href={`/courses/${course.slug}`}
          className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-orange-DEFAULT hover:text-orange-light transition-colors flex items-center gap-1"
        >
          ← {course.title}
        </Link>
        <div className="mt-2 h-px bg-black-4">
          <div
            className="h-px bg-orange-DEFAULT transition-all duration-700"
            style={{ width: `${Math.round((completedIds.length / lessons.length) * 100)}%` }}
          />
        </div>
        <p className="font-mono text-[0.52rem] tracking-widest text-grey-dark mt-1">
          {completedIds.length}/{lessons.length} lessons · {Math.round((completedIds.length / lessons.length) * 100)}%
        </p>
      </div>

      {/* Scrollable body — split 50/50 between lesson list and notes */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">

        {/* ── LESSON LIST ── */}
        <div className="flex-shrink-0">
          <div className="px-5 py-3 border-b border-white/8">
            <span className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-grey-dark">
              Lessons
            </span>
          </div>

          <ul className="py-1">
            {lessons.map((lesson, idx) => {
              const done    = completedIds.includes(lesson.id)
              const current = lesson.id === currentLesson.id
              const locked  = !hasAccess && !lesson.is_preview

              return (
                <li key={lesson.id}>
                  {locked ? (
                    <div className="flex items-start gap-3 px-5 py-3 opacity-40 cursor-not-allowed">
                      <Lock size={13} className="text-grey-dark mt-0.5 flex-shrink-0" />
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
                    <Link
                      href={`/courses/${course.slug}/${lesson.id}`}
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
                          {formatDuration(lesson.duration_seconds)}
                          {lesson.is_preview && (
                            <span className="ml-2 text-green-400">Preview</span>
                          )}
                        </p>
                      </div>
                      {current && (
                        <ChevronRight size={11} className="text-orange-DEFAULT mt-0.5 flex-shrink-0" />
                      )}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {/* ── NOTES ── */}
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
              placeholder={`Notes for "${currentLesson.title}"…\n\nWhat resonated? What will you implement tonight?`}
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
