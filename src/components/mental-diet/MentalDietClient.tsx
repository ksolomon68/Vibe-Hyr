'use client'

import { useState, useCallback, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MentalDietLog, MentalDietCategory } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DayScore {
  date:  string
  label: string
  score: number | null
}

interface MentalDietClientProps {
  todayLogs:       MentalDietLog[]
  todayScore:      number | null
  sevenDays:       DayScore[]
  weeklyInsight:   string
  weeklyAvg:       number | null
  bridgeDay:       number | null
  bridgeStartDate: string | null
  entryCount:      number
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: { value: MentalDietCategory; label: string }[] = [
  { value: 'thoughts',      label: 'Thoughts'      },
  { value: 'media',         label: 'Media'         },
  { value: 'conversations', label: 'Conversations' },
  { value: 'reactions',     label: 'Reactions'     },
]

const CATEGORY_COLORS: Record<MentalDietCategory, string> = {
  thoughts:      'bg-purple-500/20 text-purple-300',
  media:         'bg-blue-500/20 text-blue-300',
  conversations: 'bg-teal-500/20 text-teal-300',
  reactions:     'bg-amber-500/20 text-amber-300',
}

const COMPLIANCE_OPTIONS: {
  value: 1 | 2 | 3
  label:  string
  icon:   string
  color:  string
}[] = [
  { value: 1, label: 'Broke Diet',  icon: '✗', color: 'text-red-400 border-red-400/30 hover:border-red-400/60' },
  { value: 2, label: 'Neutral',     icon: '–', color: 'text-white/50 border-white/20 hover:border-white/40'   },
  { value: 3, label: 'Maintained',  icon: '✓', color: 'text-[#F97316] border-[#F97316]/30 hover:border-[#F97316]/60' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function MentalDietClient({
  todayLogs:       initialLogs,
  todayScore:      initialScore,
  sevenDays,
  weeklyInsight,
  weeklyAvg,
  bridgeDay:       initialBridgeDay,
  bridgeStartDate: initialBridgeStartDate,
  entryCount:      initialEntryCount,
}: MentalDietClientProps) {

  // ── Form state ──────────────────────────────────────────────────────────────
  const [category,    setCategory]    = useState<MentalDietCategory>('thoughts')
  const [entryText,   setEntryText]   = useState('')
  const [compliance,  setCompliance]  = useState<1 | 2 | 3 | null>(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [formError,   setFormError]   = useState<string | null>(null)
  const [successMsg,  setSuccessMsg]  = useState<string | null>(null)

  // ── Live data state ─────────────────────────────────────────────────────────
  const [logs,        setLogs]        = useState<MentalDietLog[]>(initialLogs)
  const [score,       setScore]       = useState<number | null>(initialScore)
  const [entryCount,  setEntryCount]  = useState(initialEntryCount)
  const [bridgeDay,   setBridgeDay]   = useState<number | null>(initialBridgeDay)
  const [bridgeStart, setBridgeStart] = useState<string | null>(initialBridgeStartDate)

  const [, startTransition] = useTransition()

  // ── Bridge start ────────────────────────────────────────────────────────────
  const handleStartBridge = useCallback(async () => {
    const res = await fetch('/api/mental-diet/log', { method: 'PUT' })
    if (res.ok) {
      const { bridge_start_date } = await res.json()
      setBridgeStart(bridge_start_date)
      setBridgeDay(1)
    }
  }, [])

  // ── Log entry ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!compliance || !entryText.trim()) {
      setFormError('Please fill in all fields.')
      return
    }
    setSubmitting(true)
    setFormError(null)

    try {
      const res = await fetch('/api/mental-diet/log', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ category, entryText, complianceRating: compliance }),
      })

      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({}))
        throw new Error(msg ?? 'Failed to log entry')
      }

      const { entry, scoreToday } = await res.json()

      startTransition(() => {
        setLogs(prev => [entry as MentalDietLog, ...prev])
        setScore(Math.round(scoreToday))
        setEntryCount(prev => prev + 1)
        setEntryText('')
        setCompliance(null)
        setSuccessMsg('Entry logged.')
        setTimeout(() => setSuccessMsg(null), 2000)
      })
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }, [category, entryText, compliance])

  // ── Bridge progress ─────────────────────────────────────────────────────────
  const bridgePct = bridgeDay !== null
    ? Math.min(100, Math.round((bridgeDay / 90) * 100))
    : 0

  // ── Compliance ring math ────────────────────────────────────────────────────
  const RING_R    = 70
  const RING_CIRC = 2 * Math.PI * RING_R
  const ringOffset = score !== null
    ? RING_CIRC * (1 - score / 100)
    : RING_CIRC

  return (
    <div className="py-10 px-4 md:px-10 max-w-7xl mx-auto">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div
          className="text-xs text-white/40 uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
        >
          Daily Practice
        </div>
        <h1
          className="text-[2.5rem] tracking-widest text-white leading-none"
          style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)' }}
        >
          MENTAL DIET TRACKER
        </h1>
      </div>

      {/* ── Bridge countdown ────────────────────────────────────────────── */}
      {bridgeStart ? (
        <div className="mb-8 bg-[#111111] border border-[#F97316]/20 p-5">
          {bridgeDay !== null && bridgeDay <= 90 ? (
            <div className="flex items-center gap-6 flex-wrap">
              {/* Progress arc */}
              <div className="relative flex-shrink-0">
                <svg width="72" height="72" viewBox="0 0 72 72" aria-label={`Bridge day ${bridgeDay} of 90`} role="img">
                  <circle cx="36" cy="36" r="28" stroke="rgba(255,255,255,0.06)" strokeWidth="5" fill="none" />
                  <circle
                    cx="36" cy="36" r="28"
                    stroke="#F97316"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - bridgePct / 100)}
                    transform="rotate(-90 36 36)"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                  <text x="36" y="41" textAnchor="middle" fill="#F97316"
                    fontSize="10" fontWeight="700"
                    fontFamily="var(--font-bebas,'Bebas Neue',sans-serif)"
                  >
                    {bridgePct}%
                  </text>
                </svg>
              </div>

              <div>
                <p
                  className="text-[#F97316] text-xl tracking-widest leading-none mb-1"
                  style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)' }}
                >
                  DAY {bridgeDay} OF 90
                </p>
                <p
                  className="text-white/40 text-xs"
                  style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
                >
                  {90 - bridgeDay} days remaining in your bridge window
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p
                className="text-[#F97316] text-xl tracking-widest leading-none mb-1"
                style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)' }}
              >
                BRIDGE COMPLETE
              </p>
              <p
                className="text-white/40 text-xs mb-3"
                style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
              >
                Your 90-day bridge window is complete. Set a new intention to begin again.
              </p>
              <button
                onClick={handleStartBridge}
                className="text-xs text-[#F97316] border border-[#F97316]/40 px-4 py-2 hover:bg-[#F97316]/10 transition-all uppercase tracking-widest min-h-[44px]"
                style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
              >
                Begin New 90-Day Window
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 bg-[#111111] border border-dashed border-[#F97316]/30 p-5 text-center">
          <p
            className="text-white/60 text-sm mb-3"
            style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
          >
            Track your 60-90 day window for deep identity reprogramming.
          </p>
          <button
            onClick={handleStartBridge}
            className="text-sm bg-[#F97316] text-black font-bold px-6 py-3 uppercase tracking-widest hover:bg-[#F97316]/90 transition-all min-h-[44px]"
            style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
          >
            Begin Your 60-90 Day Window →
          </button>
        </div>
      )}

      {/* ── Main two-column layout ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-8">

        {/* ── LEFT COLUMN: Form + Entry Feed (60%) ──────────────────────── */}
        <div className="lg:col-span-3">

          {/* Log Entry Form */}
          <div className="bg-[#111111] border border-white/8 p-6 mb-6">
            <h2
              className="text-lg tracking-widest text-white mb-5"
              style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)' }}
            >
              LOG ENTRY
            </h2>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap mb-5" role="tablist" aria-label="Category">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  role="tab"
                  aria-selected={category === cat.value}
                  className={`
                    px-4 py-2 text-xs uppercase tracking-widest transition-all min-h-[44px]
                    ${category === cat.value
                      ? 'bg-[#F97316] text-black font-bold'
                      : 'bg-transparent border border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'}
                  `}
                  style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Entry textarea */}
            <textarea
              value={entryText}
              onChange={e => setEntryText(e.target.value)}
              placeholder={`Describe a ${category === 'thoughts' ? 'thought' : category === 'media' ? 'media input' : category === 'conversations' ? 'conversation' : 'reaction'} from today…`}
              rows={4}
              className="
                w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4
                text-white/80 text-sm placeholder:text-white/25
                resize-none focus:outline-none focus:border-[#F97316]/40
                transition-colors mb-4
              "
              style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
              aria-label="Entry description"
            />

            {/* Compliance rating */}
            <div className="mb-5">
              <p
                className="text-xs text-white/40 uppercase tracking-widest mb-3"
                style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
              >
                Compliance rating
              </p>
              <div className="flex gap-3" role="radiogroup" aria-label="Compliance rating">
                {COMPLIANCE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setCompliance(opt.value)}
                    role="radio"
                    aria-checked={compliance === opt.value}
                    aria-label={opt.label}
                    className={`
                      flex-1 py-3 border rounded-xl text-center transition-all min-h-[56px]
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]
                      ${opt.color}
                      ${compliance === opt.value ? 'bg-[#F97316]/10 border-[#F97316]/60' : ''}
                    `}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCompliance(opt.value) } }}
                  >
                    <div className="text-lg leading-none">{opt.icon}</div>
                    <div
                      className="text-[0.6rem] uppercase tracking-widest mt-1"
                      style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
                    >
                      {opt.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {formError && (
              <p className="text-red-400 text-xs mb-3">{formError}</p>
            )}
            {successMsg && (
              <p className="text-[#F97316] text-xs mb-3">{successMsg}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="
                w-full bg-[#F97316] text-black font-bold
                text-xs uppercase tracking-widest
                py-4 hover:bg-[#F97316]/90 active:scale-[0.98]
                transition-all disabled:opacity-60 min-h-[52px]
              "
              style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
            >
              {submitting ? 'Logging…' : 'LOG ENTRY'}
            </button>
          </div>

          {/* Entry feed */}
          <div>
            <h3
              className="text-sm tracking-widest text-white/50 uppercase mb-4"
              style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
            >
              Today's Entries
            </h3>

            {logs.length === 0 ? (
              <p
                className="text-white/30 text-sm italic"
                style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
              >
                No entries yet. Start tracking your mental diet above.
              </p>
            ) : (
              <AnimatePresence>
                {logs.map((log, i) => {
                  const comp = COMPLIANCE_OPTIONS.find(c => c.value === log.compliance_rating)
                  const catColor = CATEGORY_COLORS[log.category] ?? 'bg-white/10 text-white/60'
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, delay: i === 0 ? 0 : 0.05 * Math.min(i, 4) }}
                      className="bg-[#111111] border border-white/8 p-4 mb-3 flex gap-4 items-start"
                    >
                      {/* Compliance icon */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${log.compliance_rating === 3 ? 'bg-[#F97316]/20 text-[#F97316]'
                            : log.compliance_rating === 1 ? 'bg-red-500/20 text-red-400'
                            : 'bg-white/10 text-white/50'}`}
                        aria-label={comp?.label}
                      >
                        {comp?.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[0.6rem] px-2 py-0.5 rounded-full uppercase tracking-widest ${catColor}`}>
                            {log.category}
                          </span>
                          <span
                            className="text-white/30 text-[0.6rem]"
                            style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
                          >
                            {new Date(log.logged_at).toLocaleTimeString('en-US', {
                              hour: 'numeric', minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p
                          className="text-white/70 text-sm leading-relaxed"
                          style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
                        >
                          {log.entry_text}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Score ring + History + Insight (40%) ────────── */}
        <div className="lg:col-span-2">

          {/* Weekly insight */}
          <div
            className="bg-[#F97316]/10 border border-[#F97316]/20 rounded-xl p-4 mb-6"
            aria-live="polite"
          >
            <p
              className="text-[#F97316]/80 text-sm italic leading-relaxed"
              style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
            >
              {weeklyInsight}
            </p>
          </div>

          {/* Compliance score ring */}
          <div className="bg-[#111111] border border-white/8 p-6 mb-6 text-center">
            <div className="mb-4 flex justify-center">
              <svg
                width="180" height="180"
                viewBox="0 0 180 180"
                aria-label={`Today's mental diet compliance: ${score ?? 0}%`}
                role="img"
              >
                {/* Track */}
                <circle
                  cx="90" cy="90" r={RING_R}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="10"
                  fill="none"
                />
                {/* Progress */}
                <circle
                  cx="90" cy="90" r={RING_R}
                  stroke="#F97316"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRC}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 90 90)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                {/* Score */}
                <text
                  x="90" y="85"
                  textAnchor="middle"
                  fill="white"
                  fontSize="28"
                  fontWeight="700"
                  fontFamily="var(--font-bebas,'Bebas Neue',sans-serif)"
                >
                  {score ?? 0}
                </text>
                <text
                  x="90" y="105"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize="11"
                  fontFamily="var(--font-dm,'DM Sans',sans-serif)"
                >
                  out of 100
                </text>
              </svg>
            </div>
            <p
              className="text-xs uppercase tracking-widest text-white/50 mb-1"
              style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
            >
              TODAY'S MENTAL DIET
            </p>
            <p
              className="text-white/30 text-xs"
              style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
            >
              Entries: {entryCount}
            </p>
          </div>

          {/* 7-day history */}
          <div className="bg-[#111111] border border-white/8 p-6">
            <h3
              className="text-sm tracking-widest text-white/50 uppercase mb-5"
              style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
            >
              7-Day History
            </h3>

            <div className="flex items-end gap-2 h-24 mb-3" aria-label="7-day compliance bar chart" role="img">
              {sevenDays.map((day, i) => {
                const height = day.score !== null ? `${day.score}%` : '0%'
                const isToday = day.date === new Date().toISOString().slice(0, 10)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{
                        height: '80px',
                        display: 'flex',
                        alignItems: 'flex-end',
                      }}
                      title={`${day.label}: ${day.score ?? 'No data'}%`}
                    >
                      <div
                        className="w-full rounded-sm"
                        style={{
                          height,
                          background: day.score !== null
                            ? isToday ? '#F97316' : 'rgba(249,115,22,0.5)'
                            : 'rgba(255,255,255,0.06)',
                          transition: 'height 0.5s ease',
                          minHeight: day.score !== null ? '3px' : '0',
                        }}
                      />
                    </div>
                    <span
                      className={`text-[0.55rem] uppercase ${isToday ? 'text-[#F97316]' : 'text-white/30'}`}
                      style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
                    >
                      {day.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {weeklyAvg !== null && (
              <p
                className="text-white/40 text-xs"
                style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
              >
                Weekly Average: <span className="text-[#F97316]">{weeklyAvg}%</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
