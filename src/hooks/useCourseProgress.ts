'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCourseProgress(courseId: string, totalLessons: number) {
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set())
  const [loading, setLoading]           = useState(true)

  const supabase = createClient()

  // Load progress on mount — one row per completed lesson
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('course_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)

      const ids = (data ?? []).map((r: { lesson_id: string }) => r.lesson_id)
      setCompletedSet(new Set(ids))
      setLoading(false)
    }
    load()
  }, [courseId])

  // Mark a lesson complete — upsert a single row
  const markComplete = useCallback(async (lessonId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (completedSet.has(lessonId)) return   // already done

    await supabase.from('course_progress').upsert(
      {
        user_id:      user.id,
        course_id:    courseId,
        lesson_id:    lessonId,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,course_id,lesson_id' }
    )

    setCompletedSet(prev => new Set(Array.from(prev).concat([lessonId])))
  }, [completedSet, courseId])

  const isComplete  = (lessonId: string) => completedSet.has(lessonId)
  const percentDone = totalLessons > 0 ? Math.round((completedSet.size / totalLessons) * 100) : 0
  const completedIds = Array.from(completedSet)

  return { loading, markComplete, isComplete, percentDone, completedIds }
}
