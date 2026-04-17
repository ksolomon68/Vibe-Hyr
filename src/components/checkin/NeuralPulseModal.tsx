'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { CheckinStateLabel } from '@/types'

// ── State definitions ─────────────────────────────────────────────────────────

interface StateOption {
  label:       CheckinStateLabel
  displayLabel: string
  score:       number
  headline:    string
  copy:        string
  icon:        React.ReactNode
  prompt:      string
}

function BetaIcon() {
  return (
    <svg width="36" height="20" viewBox="0 0 36 20" fill="none" aria-hidden="true">
      <polyline
        points="0,10 4,4 8,16 12,2 16,18 20,6 24,14 28,3 32,17 36,10"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"
      />
    </svg>
  )
}

function AlphaIcon() {
  return (
    <svg width="36" height="20" viewBox="0 0 36 20" fill="none" aria-hidden="true">
      <path
        d="M0,10 Q4,2 9,10 Q14,18 18,10 Q23,2 27,10 Q31,18 36,10"
        stroke="currentColor" strokeWidth="1.5" fill="none"
      />
    </svg>
  )
}

function ThetaIcon() {
  return (
    <svg width="36" height="20" viewBox="0 0 36 20" fill="none" aria-hidden="true">
      <path
        d="M0,10 C6,2 12,2 18,10 C24,18 30,18 36,10"
        stroke="#F97316" strokeWidth="2" fill="none" strokeLinecap="round"
      />
    </svg>
  )
}

function LockedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5"  stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <line x1="12" y1="2"  x2="12" y2="7"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2"  y1="12" x2="7"  y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const STATE_OPTIONS: StateOption[] = [
  {
    label:       'beta_resistance',
    displayLabel: 'BETA — Resistance',
    score:       1,
    headline:    'BETA',
    copy:        'Analytical, skeptical, pushing against',
    icon:        <BetaIcon />,
    prompt:      'What assumption is creating this resistance right now? Write it as a fact that no longer serves you.',
  },
  {
    label:       'alpha_aware',
    displayLabel: 'ALPHA — Aware',
    score:       2,
    headline:    'ALPHA',
    copy:        'Relaxed, open, bridging the gap',
    icon:        <AlphaIcon />,
    prompt:      'What does the version of you who already has this feel like in this moment?',
  },
  {
    label:       'theta_receptive',
    displayLabel: 'THETA — Receptive',
    score:       3,
    headline:    'THETA',
    copy:        'Deep receptivity, ready to imprint',
    icon:        <ThetaIcon />,
    prompt:      'Describe your desired reality in first person, present tense, as if it already exists.',
  },
  {
    label:       'identity_locked',
    displayLabel: 'LOCKED IN — Identity',
    score:       4,
    headline:    'LOCKED IN',
    copy:        'Assuming the state. It is done.',
    icon:        <LockedIcon />,
    prompt:      'What is one piece of evidence from today that confirms your new identity is real?',
  },
]

// ── Milestone helper ──────────────────────────────────────────────────────────

const MILESTONES = [7, 14, 30, 60, 90]

function isMilestone(n: number) {
  return MILESTONES.includes(n)
}

// ── Component props ───────────────────────────────────────────────────────────

interface NeuralPulseModalProps {
  open:         boolean
  onClose:      () => void
  onCheckedIn:  (streak: number, stateLabel: CheckinStateLabel) => void
  initialStreak: number
}

// ── Main component ────────────────────────────────────────────────────────────

export function NeuralPulseModal({
  open,
  onClose,
  onCheckedIn,
  initialStreak,
}: NeuralPulseModalProps) {
  const [step,             setStep]             = useState<1 | 2 | 3>(1)
  const [selected,         setSelected]         = useState<StateOption | null>(null)
  const [journalResponse,  setJournalResponse]  = useState('')
  const [submitting,       setSubmitting]       = useState(false)
  const [error,            setError]            = useState<string | null>(null)
  const [newStreak,        setNewStreak]        = useState(initialStreak)

  // Reset state when re-opened
  useEffect(() => {
    if (open) {
      setStep(1)
      setSelected(null)
      setJournalResponse('')
      setError(null)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleStateSelect = useCallback((opt: StateOption) => {
    setSelected(opt)
    setStep(2)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!selected || submitting) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stateLabel:      selected.label,
          stateScore:      selected.score,
          journalPrompt:   selected.prompt,
          journalResponse: journalResponse.trim() || null,
        }),
      })

      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({}))
        throw new Error(msg ?? 'Check-in failed')
      }

      const { streak } = await res.json()
      setNewStreak(streak)
      setStep(3)
      onCheckedIn(streak, selected.label)

      // Auto-close after 2.5 s
      setTimeout(onClose, 2500)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [selected, submitting, journalResponse, onCheckedIn, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="neural-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-label="Neural Pulse Daily Check-In"
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            key="neural-card"
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="
              w-full max-w-lg
              bg-[#111111] border border-[#F97316]/30
              rounded-2xl p-8
              relative overflow-hidden
              sm:max-h-[90vh] overflow-y-auto
            "
          >
            {/* Close button */}
            {step !== 3 && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors p-1"
                aria-label="Close check-in modal"
              >
                <X size={18} />
              </button>
            )}

            {/* Header */}
            <div className="mb-6">
              <h2
                className="font-display text-[2.2rem] leading-none tracking-widest text-[#F97316] mb-1"
                style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)' }}
              >
                NEURAL PULSE
              </h2>
              <p className="text-sm text-white/60" style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}>
                Set your state before you build your reality.
              </p>
            </div>

            <AnimatePresence mode="wait">

              {/* ── STEP 1: State Selector ──────────────────────────────── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <p
                    className="text-xs text-white/40 uppercase tracking-widest mb-4"
                    style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
                  >
                    Select your current state
                  </p>
                  <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Brainwave state selection">
                    {STATE_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleStateSelect(opt)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStateSelect(opt) } }}
                        className={`
                          bg-[#1a1a1a] border rounded-xl p-4 text-left
                          transition-all duration-200 cursor-pointer min-h-[100px]
                          flex flex-col gap-2 group
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]
                          ${selected?.label === opt.label
                            ? 'border-[#F97316] bg-[#F97316]/10'
                            : 'border-white/10 hover:border-[#F97316]/50'}
                        `}
                        role="radio"
                        aria-checked={selected?.label === opt.label}
                        tabIndex={0}
                      >
                        <div className="text-white/60 group-hover:text-[#F97316] transition-colors">
                          {opt.icon}
                        </div>
                        <div>
                          <p
                            className="text-[0.65rem] font-bold tracking-widest text-white leading-tight mb-0.5"
                            style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)', fontSize: '0.85rem' }}
                          >
                            {opt.displayLabel}
                          </p>
                          <p
                            className="text-[0.65rem] text-white/50 leading-snug"
                            style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
                          >
                            {opt.copy}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Journal Prompt ──────────────────────────────── */}
              {step === 2 && selected && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Selected state badge */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className="text-[#F97316]">{selected.icon}</div>
                    <span
                      className="text-[#F97316] text-sm tracking-widest"
                      style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)', fontSize: '1rem' }}
                    >
                      {selected.displayLabel}
                    </span>
                  </div>

                  <p
                    className="text-sm text-white/80 leading-relaxed mb-4"
                    style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
                  >
                    {selected.prompt}
                  </p>

                  <textarea
                    value={journalResponse}
                    onChange={(e) => setJournalResponse(e.target.value)}
                    placeholder="Write freely. This is your mental diet."
                    rows={5}
                    className="
                      w-full bg-[#0a0a0a] border border-white/10
                      rounded-xl p-4 text-white/80 text-sm
                      placeholder:text-white/25
                      resize-none focus:outline-none focus:border-[#F97316]/40
                      transition-colors
                    "
                    style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
                    aria-label="Journal response (optional)"
                  />

                  {error && (
                    <p className="text-red-400 text-xs mt-2">{error}</p>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="
                        flex-1 py-3 rounded-xl border border-white/10
                        text-white/50 text-xs tracking-widest uppercase
                        hover:border-white/30 hover:text-white/70 transition-all
                      "
                      style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="
                        flex-[2] py-3 rounded-xl
                        bg-[#F97316] text-black font-bold text-xs tracking-widest uppercase
                        hover:bg-[#F97316]/90 active:scale-[0.98]
                        transition-all disabled:opacity-60
                      "
                      style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
                    >
                      {submitting ? 'Locking in…' : journalResponse.trim() ? 'Lock In State' : 'Lock In (Skip Journal)'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Completion ─────────────────────────────────── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: 'backOut' }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
                    className="w-16 h-16 rounded-full bg-[#F97316]/20 border border-[#F97316]/40 flex items-center justify-center mx-auto mb-5"
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>

                  <h3
                    className="text-[2rem] tracking-widest text-[#F97316] mb-2 leading-none"
                    style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)' }}
                  >
                    STATE LOCKED IN.
                  </h3>

                  <div
                    className="text-2xl mb-4"
                    aria-live="polite"
                    aria-label={`${newStreak} day streak`}
                  >
                    🔥
                    <span
                      className="ml-1 text-white"
                      style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)' }}
                    >
                      {newStreak} DAY STREAK
                    </span>
                  </div>

                  {isMilestone(newStreak) && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-[#F97316]/10 border border-[#F97316]/30 rounded-xl px-5 py-3 mb-4 inline-block"
                    >
                      <p
                        className="text-[#F97316] text-sm tracking-widest"
                        style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)' }}
                        aria-live="polite"
                      >
                        🏆 {newStreak}-DAY MILESTONE UNLOCKED
                      </p>
                    </motion.div>
                  )}

                  <p
                    className="text-white/40 text-xs"
                    style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
                  >
                    Closing in a moment…
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
