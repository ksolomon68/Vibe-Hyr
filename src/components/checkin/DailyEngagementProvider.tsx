'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { NeuralPulseModal } from './NeuralPulseModal'
import type { CheckinStateLabel, DailyCheckin } from '@/types'

// ── Props ──────────────────────────────────────────────────────────────────────

interface DailyEngagementProviderProps {
  /** Existing check-in for today, or null if user hasn't checked in */
  todayCheckin:       DailyCheckin | null
  /** User's current streak from profiles table */
  initialStreak:      number
  /** Today's mental diet compliance score (0–100) or null */
  dietScore:          number | null
  /** Today's entry count for mental diet */
  dietEntryCount:     number
  /** Bridge day number or null if bridge_start_date not set */
  bridgeDay:          number | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATE_DISPLAY: Record<CheckinStateLabel, string> = {
  beta_resistance:  'BETA — Resistance',
  alpha_aware:      'ALPHA — Aware',
  theta_receptive:  'THETA — Receptive',
  identity_locked:  'LOCKED IN — Identity',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DailyEngagementProvider({
  todayCheckin,
  initialStreak,
  dietScore,
  dietEntryCount,
  bridgeDay,
}: DailyEngagementProviderProps) {
  const [modalOpen,    setModalOpen]    = useState(!todayCheckin)
  const [checkin,      setCheckin]      = useState<DailyCheckin | null>(todayCheckin)
  const [streak,       setStreak]       = useState(initialStreak)

  const handleCheckedIn = useCallback((newStreak: number, stateLabel: CheckinStateLabel) => {
    setStreak(newStreak)
    // Mark local state as checked in so the widget updates immediately
    setCheckin({
      id:               'temp',
      user_id:          '',
      checked_in_at:    new Date().toISOString(),
      date:             new Date().toISOString().slice(0, 10),
      state_label:      stateLabel,
      state_score:      1,
      journal_prompt:   null,
      journal_response: null,
      streak_count:     newStreak,
    })
  }, [])

  const handleClose = useCallback(() => setModalOpen(false), [])
  const handleOpen  = useCallback(() => setModalOpen(true),  [])

  return (
    <>
      {/* ── Neural Pulse Widget ───────────────────────────────────────── */}
      <div className="mb-8">
        {!checkin ? (
          /* Not checked in: pulsing CTA */
          <div
            className="relative overflow-hidden bg-[#111111] border border-[#F97316]/30 rounded-none p-6"
            style={{ borderLeft: '3px solid #F97316' }}
          >
            {/* Pulse ring animation */}
            <span className="absolute top-4 right-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-60" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F97316]" />
            </span>

            <p
              className="text-[1.6rem] tracking-widest text-[#F97316] leading-none mb-1"
              style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)' }}
            >
              SET YOUR STATE
            </p>
            <p
              className="text-sm text-white/50 mb-4"
              style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
            >
              Your daily neural alignment takes 60 seconds.
            </p>
            <button
              onClick={handleOpen}
              className="
                bg-[#F97316] text-black font-bold text-xs px-6 py-3
                tracking-widest uppercase hover:bg-[#F97316]/90
                active:scale-[0.98] transition-all
              "
              style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
            >
              CHECK IN NOW →
            </button>
          </div>
        ) : (
          /* Checked in: compact status bar */
          <div className="bg-[#111111] border border-[#F97316]/20 p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F97316]" aria-hidden="true" />
              <span
                className="text-[#F97316] text-sm tracking-widest"
                style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)', fontSize: '0.9rem' }}
              >
                {STATE_DISPLAY[checkin.state_label]}
              </span>
            </div>

            {/* Streak badge */}
            <div className="flex items-center gap-1.5 bg-[#F97316]/10 border border-[#F97316]/20 px-3 py-1">
              <span aria-hidden="true">🔥</span>
              <span
                className="text-white text-xs tracking-widest"
                style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)', fontSize: '0.8rem' }}
              >
                {streak} DAY STREAK
              </span>
            </div>

            {/* Journal snippet */}
            {checkin.journal_response && (
              <p
                className="text-white/40 text-xs italic truncate max-w-[240px]"
                style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
              >
                "{checkin.journal_response.slice(0, 60)}{checkin.journal_response.length > 60 ? '…' : ''}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Mental Diet Widget ────────────────────────────────────────── */}
      <div className="bg-[#111111] border border-white/8 p-5 flex flex-wrap items-center gap-5 mb-6">

        {/* Mini compliance ring */}
        <div className="flex-shrink-0" aria-label={`Mental diet compliance: ${dietScore ?? 0}%`}>
          <MiniComplianceRing score={dietScore ?? 0} />
        </div>

        {/* Score + bridge day */}
        <div className="flex-1 min-w-0">
          <p
            className="text-[#F97316] text-xs tracking-widest uppercase mb-0.5"
            style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
          >
            Mental Diet
          </p>
          <p
            className="text-white text-lg leading-none mb-1"
            style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)', fontSize: '1.4rem' }}
          >
            {dietScore !== null ? `${Math.round(dietScore)}%` : 'No entries yet'}
          </p>
          {bridgeDay !== null && (
            <p
              className="text-white/40 text-xs"
              style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
            >
              Day {bridgeDay} of 90 · {dietEntryCount} {dietEntryCount === 1 ? 'entry' : 'entries'} today
            </p>
          )}
        </div>

        <Link
          href="/dashboard/mental-diet"
          className="
            flex-shrink-0 bg-transparent border border-[#F97316]/40
            text-[#F97316] text-xs px-4 py-2 tracking-widest uppercase
            hover:bg-[#F97316]/10 transition-all
            min-h-[44px] flex items-center
          "
          style={{ fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}
        >
          LOG ENTRY →
        </Link>
      </div>

      {/* Modal (portal-less: rendered inline, z-index handles layering) */}
      <NeuralPulseModal
        open={modalOpen}
        onClose={handleClose}
        onCheckedIn={handleCheckedIn}
        initialStreak={streak}
      />
    </>
  )
}

// ── Mini compliance ring SVG ──────────────────────────────────────────────────

function MiniComplianceRing({ score }: { score: number }) {
  const radius        = 24
  const circumference = 2 * Math.PI * radius
  const offset        = circumference * (1 - Math.max(0, Math.min(100, score)) / 100)

  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      aria-label={`Compliance: ${Math.round(score)}%`}
      role="img"
    >
      {/* Background track */}
      <circle
        cx="30" cy="30" r={radius}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="5"
        fill="none"
      />
      {/* Progress arc */}
      <circle
        cx="30" cy="30" r={radius}
        stroke="#F97316"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 30 30)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      {/* Center label */}
      <text
        x="30" y="35"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="700"
        fontFamily="var(--font-bebas, 'Bebas Neue', sans-serif)"
      >
        {Math.round(score)}%
      </text>
    </svg>
  )
}
