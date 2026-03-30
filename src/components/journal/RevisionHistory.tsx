'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, BookOpen, Calendar, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { EMOTION_LABELS, formatDate, cn } from '@/lib/utils'
import type { EmotionTag } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface JournalEntry {
  id:               string
  date:             string
  event_raw:        string
  event_revised:    string
  emotion_before:   string
  emotion_after:    string
  active_assumption: string | null
  created_at:       string
}

interface Props {
  initialEntries: JournalEntry[]
  initialTotal:   number
}

// ── Emotion pill ──────────────────────────────────────────────────────────────

function EmotionPill({ label, variant }: { label: string; variant: 'before' | 'after' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 font-mono text-[0.5rem] tracking-[0.15em] uppercase border',
        variant === 'before'
          ? 'border-grey-dark text-grey-DEFAULT bg-black-3'
          : 'border-orange/40 text-orange bg-orange/10'
      )}
    >
      {label}
    </span>
  )
}

// ── Single entry card ─────────────────────────────────────────────────────────

function EntryCard({ entry }: { entry: JournalEntry }) {
  const [open, setOpen] = useState(false)

  const beforeLabel = EMOTION_LABELS[entry.emotion_before as EmotionTag] ?? entry.emotion_before
  const afterLabel  = EMOTION_LABELS[entry.emotion_after  as EmotionTag] ?? entry.emotion_after

  return (
    <div
      className={cn(
        'border transition-colors duration-150',
        open ? 'border-orange/40 bg-black-3' : 'border-white/8 bg-black-3 hover:border-orange/20'
      )}
    >
      {/* Collapsed row — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 group"
      >
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[0.5rem] tracking-[0.18em] text-orange mb-1">
            {formatDate(entry.date)}
          </p>
          <p className="font-body text-xs text-grey-DEFAULT line-clamp-2 leading-relaxed">
            {entry.event_raw}
          </p>
        </div>
        <span className="flex-shrink-0 text-grey-dark group-hover:text-grey-DEFAULT transition-colors mt-0.5">
          {open
            ? <ChevronUp  size={14} />
            : <ChevronDown size={14} />}
        </span>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-4 pb-4 border-t border-white/8 pt-3 flex flex-col gap-4">

          {/* Emotions */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[0.45rem] tracking-widest text-grey-dark uppercase">Before:</span>
            <EmotionPill label={beforeLabel} variant="before" />
            <span className="font-mono text-[0.45rem] tracking-widest text-grey-dark uppercase ml-1">After:</span>
            <EmotionPill label={afterLabel} variant="after" />
          </div>

          {/* What happened */}
          <div>
            <p className="font-mono text-[0.48rem] tracking-[0.2em] uppercase text-grey-dark mb-1.5">
              What happened
            </p>
            <p className="font-body text-xs text-grey-DEFAULT leading-relaxed whitespace-pre-wrap">
              {entry.event_raw}
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 font-mono text-[0.48rem] tracking-[0.22em] uppercase text-orange/70">
            <div className="flex-1 h-px bg-orange/20" />
            ✦ revised
            <div className="flex-1 h-px bg-orange/20" />
          </div>

          {/* Revised version */}
          <div>
            <p className="font-mono text-[0.48rem] tracking-[0.2em] uppercase text-grey-dark mb-1.5">
              Revised version
            </p>
            <p className="font-body text-xs text-orange/90 leading-relaxed whitespace-pre-wrap italic">
              {entry.event_revised}
            </p>
          </div>

          {/* Active assumption */}
          {entry.active_assumption && (
            <div className="bg-black-2 border border-orange/20 px-3 py-2">
              <p className="font-mono text-[0.45rem] tracking-[0.2em] uppercase text-grey-dark mb-1">
                Active assumption
              </p>
              <p className="font-body text-xs italic text-grey-DEFAULT">
                "{entry.active_assumption}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export function RevisionHistory({ initialEntries, initialTotal }: Props) {
  const [entries,  setEntries]  = useState<JournalEntry[]>(initialEntries)
  const [total,    setTotal]    = useState(initialTotal)
  const [loading,  setLoading]  = useState(false)
  const [page,     setPage]     = useState(1)

  const hasMore = entries.length < total

  const loadMore = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const nextPage = page + 1
    const { data } = await supabase
      .from('journal_entries')
      .select('id, date, event_raw, event_revised, emotion_before, emotion_after, active_assumption, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(nextPage * PAGE_SIZE - PAGE_SIZE, nextPage * PAGE_SIZE - 1)

    if (data) {
      setEntries(prev => [...prev, ...data])
      setPage(nextPage)
    }
    setLoading(false)
  }, [page])

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen size={24} className="text-grey-dark mx-auto mb-3" />
        <p className="font-mono text-[0.6rem] tracking-widest text-grey-dark uppercase">
          No entries yet
        </p>
        <p className="font-body text-xs italic text-grey-dark mt-1">
          Your first revision starts tonight.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map(entry => (
        <EntryCard key={entry.id} entry={entry} />
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className={cn(
            'w-full mt-1 py-2.5 border border-white/8 font-mono text-[0.55rem] tracking-[0.2em] uppercase',
            'text-grey-dark hover:text-grey-DEFAULT hover:border-orange/20 transition-colors',
            'flex items-center justify-center gap-2',
            loading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {loading
            ? <><RefreshCw size={11} className="animate-spin" /> Loading…</>
            : `Load more  ·  ${total - entries.length} remaining`}
        </button>
      )}

      <p className="text-center font-mono text-[0.48rem] tracking-widest text-grey-dark/50 uppercase mt-1">
        {entries.length} of {total} revision{total !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
