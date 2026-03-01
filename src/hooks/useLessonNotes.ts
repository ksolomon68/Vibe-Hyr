'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLessonNotes(lessonId: string) {
  const [content, setContent]   = useState('')
  const [saving,  setSaving]    = useState(false)
  const [saved,   setSaved]     = useState(false)
  const [loaded,  setLoaded]    = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()

  // Load notes on mount
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoaded(true); return }

      const { data } = await supabase
        .from('lesson_notes')
        .select('content')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single()

      if (data) setContent(data.content)
      setLoaded(true)
    }
    load()
  }, [lessonId])

  // Save to Supabase
  const persist = useCallback(async (text: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setSaving(true)
    await supabase
      .from('lesson_notes')
      .upsert(
        { user_id: user.id, lesson_id: lessonId, content: text, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,lesson_id' }
      )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [lessonId])

  // Debounce saves — 1.5s after last keystroke
  const handleChange = useCallback((text: string) => {
    setContent(text)
    setSaved(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => persist(text), 1500)
  }, [persist])

  return { content, handleChange, saving, saved, loaded }
}
