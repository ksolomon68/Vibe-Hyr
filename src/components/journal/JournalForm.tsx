'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Flame, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { EMOTION_LABELS, getStreakMessage, cn } from '@/lib/utils'
import type { EmotionTag } from '@/types'

const EMOTIONS: EmotionTag[] = [
  'peaceful','grateful','confident','joyful',
  'anxious','frustrated','neutral','powerful','loving','abundant',
]

interface JournalFormProps {
  streak?: number
  onSaved?: () => void
}

export function JournalForm({ streak = 0, onSaved }: JournalFormProps) {
  const [eventRaw,     setEventRaw]     = useState('')
  const [eventRevised, setEventRevised] = useState('')
  const [emotionBefore, setEmotionBefore] = useState<EmotionTag | ''>('')
  const [emotionAfter,  setEmotionAfter]  = useState<EmotionTag | ''>('')
  const [assumption,   setAssumption]   = useState('')
  const [saving,       setSaving]       = useState(false)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).toUpperCase()

  async function handleSave() {
    if (!eventRaw || !eventRevised) {
      toast.error('Complete both fields before saving.')
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) { toast.error('Please log in first.'); setSaving(false); return }

    const { error } = await supabase.from('journal_entries').insert({
      user_id:        user.id,
      date:           new Date().toISOString().split('T')[0],
      event_raw:      eventRaw,
      event_revised:  eventRevised,
      emotion_before: emotionBefore || 'neutral',
      emotion_after:  emotionAfter  || 'neutral',
      active_assumption: assumption || null,
    })

    if (error) {
      toast.error('Failed to save. Try again.')
    } else {
      toast.success('Revision saved. ✦')
      setEventRaw('')
      setEventRevised('')
      setEmotionBefore('')
      setEmotionAfter('')
      setAssumption('')
      onSaved?.()
    }
    setSaving(false)
  }

  return (
    <div className="bg-black-2 border border-white/8">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/8">
        <div>
          <span className="font-mono text-[0.58rem] tracking-[0.15em] text-grey-DEFAULT block">
            {today}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <Clock size={11} className="text-orange-DEFAULT" />
            <span className="font-mono text-[0.55rem] tracking-widest text-grey-dark uppercase">
              Nightly Revision Journal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black-3 border border-orange-DEFAULT/40 px-3 py-1.5">
          <Flame size={13} className="text-orange-DEFAULT" />
          <span className="font-mono text-[0.6rem] tracking-[0.12em] text-orange-DEFAULT">
            {getStreakMessage(streak)}
          </span>
        </div>
      </div>

      <div className="p-8">
        {/* Step 1 */}
        <div className="mb-7">
          <div className="label mb-3">Step 1 — What happened today?</div>
          <p className="font-body text-sm italic text-grey-DEFAULT mb-3">
            Describe an event that didn't go as you wished — hold nothing back.
          </p>

          {/* Emotion before */}
          <div className="mb-3">
            <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-dark mb-2">
              Emotion before revision:
            </p>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmotionBefore(e)}
                  className={cn(
                    'font-mono text-[0.55rem] tracking-widest px-2.5 py-1 border transition-all',
                    emotionBefore === e
                      ? 'border-orange-DEFAULT bg-orange-DEFAULT/10 text-orange-DEFAULT'
                      : 'border-grey-dark text-grey-dark hover:border-grey-DEFAULT'
                  )}
                >
                  {EMOTION_LABELS[e]}
                </button>
              ))}
            </div>
          </div>

          <textarea
            className="input-dark"
            placeholder="Today, I noticed resistance around… / What happened was…"
            value={eventRaw}
            onChange={e => setEventRaw(e.target.value)}
            rows={4}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-7 font-mono text-[0.6rem] tracking-[0.25em] uppercase text-orange-DEFAULT">
          <div className="flex-1 h-px bg-orange-DEFAULT/20" />
          ✦ Now Revise It ✦
          <div className="flex-1 h-px bg-orange-DEFAULT/20" />
        </div>

        {/* Step 2 */}
        <div className="mb-7">
          <div className="label mb-3">Step 2 — Rewrite from the wish fulfilled</div>
          <p className="font-body text-sm italic text-grey-DEFAULT mb-3">
            First-person. Present tense. Feel it as if it already happened perfectly.
          </p>

          {/* Emotion after */}
          <div className="mb-3">
            <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-dark mb-2">
              Emotion after revision:
            </p>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmotionAfter(e)}
                  className={cn(
                    'font-mono text-[0.55rem] tracking-widest px-2.5 py-1 border transition-all',
                    emotionAfter === e
                      ? 'border-orange-DEFAULT bg-orange-DEFAULT/10 text-orange-DEFAULT'
                      : 'border-grey-dark text-grey-dark hover:border-grey-DEFAULT'
                  )}
                >
                  {EMOTION_LABELS[e]}
                </button>
              ))}
            </div>
          </div>

          <textarea
            className="input-dark"
            placeholder="In the revised version, what unfolded was… / I felt…"
            value={eventRevised}
            onChange={e => setEventRevised(e.target.value)}
            rows={4}
          />
        </div>

        {/* Active assumption */}
        <div className="mb-8">
          <div className="label mb-3">Active Assumption (optional)</div>
          <input
            type="text"
            className="input-dark"
            placeholder="e.g. I am loved and chosen. / My finances are abundant and growing."
            value={assumption}
            onChange={e => setAssumption(e.target.value)}
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'btn-orange flex items-center gap-2 w-full justify-center',
            saving && 'opacity-60 cursor-not-allowed'
          )}
        >
          <Save size={14} />
          {saving ? 'Saving…' : 'Save Tonight\'s Revision'}
        </button>
      </div>
    </div>
  )
}
