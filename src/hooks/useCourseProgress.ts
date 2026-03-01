'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CourseProgress } from '@/types'

export function useCourseProgress(courseId: string, totalLessons: number) {
  const [progress, setProgress] = useState<CourseProgress | null>(null)
  const [loading, setLoading]   = useState(true)

  const supabase = createClient()

  // Load progress on mount
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

      setProgress(data)
      setLoading(false)
    }
    load()
  }, [courseId])

  // Mark a lesson complete
  const markComplete = useCallback(async (lessonId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const current = progress?.completed_lessons ?? []
    if (current.includes(lessonId)) return   // already done

    const updated     = [...current, lessonId]
    const pct         = Math.round((updated.length / totalLessons) * 100)
    const completedAt = pct === 100 ? new Date().toISOString() : null

    const payload = {
      user_id:           user.id,
      course_id:         courseId,
      completed_lessons: updated,
      progress_percent:  pct,
      completed_at:      completedAt,
      updated_at:        new Date().toISOString(),
    }

    const { data } = await supabase
      .from('course_progress')
      .upsert(payload, { onConflict: 'user_id,course_id' })
      .select()
      .single()

    if (data) setProgress(data)
  }, [progress, courseId, totalLessons])

  const isComplete = (lessonId: string) =>
    progress?.completed_lessons?.includes(lessonId) ?? false

  const percentDone = progress?.progress_percent ?? 0
  const completedIds = progress?.completed_lessons ?? []

  return { progress, loading, markComplete, isComplete, percentDone, completedIds }
}
