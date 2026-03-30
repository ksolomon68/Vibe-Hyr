'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

/**
 * useCourseProgress
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages per-lesson completion state for the course player.
 *
 * Writes go through API routes (/api/progress/complete & /api/progress/uncomplete)
 * with optimistic updates — the UI updates instantly, rolling back on failure.
 *
 * Reads are done directly from Supabase (no API overhead for reads).
 */
export function useCourseProgress(courseId: string, totalLessons: number) {
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set())
  const [loading, setLoading]           = useState(true)

  const supabase = createClient()

  // ── Load progress on mount ─────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('course_progress')
        .select('lesson_id')
        .eq('user_id',   user.id)
        .eq('course_id', courseId)

      const ids = (data ?? []).map((r: { lesson_id: string }) => r.lesson_id)
      setCompletedSet(new Set(ids))
      setLoading(false)
    }
    load()
  }, [courseId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mark lesson complete ───────────────────────────────────────────────────
  const markComplete = useCallback(async (lessonId: string) => {
    if (completedSet.has(lessonId)) return

    // Optimistic update
    setCompletedSet(prev => new Set([...prev, lessonId]))

    try {
      const res = await fetch('/api/progress/complete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ lessonId, courseId }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Failed to save progress')
      }
    } catch (err) {
      // Roll back on failure
      setCompletedSet(prev => {
        const next = new Set(prev)
        next.delete(lessonId)
        return next
      })
      toast.error(err instanceof Error ? err.message : 'Failed to save progress')
    }
  }, [completedSet, courseId])

  // ── Mark lesson incomplete ─────────────────────────────────────────────────
  const markIncomplete = useCallback(async (lessonId: string) => {
    if (!completedSet.has(lessonId)) return

    // Optimistic update
    setCompletedSet(prev => {
      const next = new Set(prev)
      next.delete(lessonId)
      return next
    })

    try {
      const res = await fetch('/api/progress/uncomplete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ lessonId, courseId }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Failed to update progress')
      }
    } catch (err) {
      // Roll back on failure
      setCompletedSet(prev => new Set([...prev, lessonId]))
      toast.error(err instanceof Error ? err.message : 'Failed to update progress')
    }
  }, [completedSet, courseId])

  // ── Derived values ─────────────────────────────────────────────────────────
  const isComplete    = (lessonId: string) => completedSet.has(lessonId)
  const completedIds  = Array.from(completedSet)
  const percentDone   = totalLessons > 0 ? Math.round((completedSet.size / totalLessons) * 100) : 0
  const isAllComplete = totalLessons > 0 && completedSet.size >= totalLessons

  return { loading, markComplete, markIncomplete, isComplete, percentDone, completedIds, isAllComplete }
}
