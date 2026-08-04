'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ArrowRight, ShieldCheck, Loader2, X, Plus, Minus } from 'lucide-react'
import { useCheckout } from '@/hooks/useCheckout'
import { createClient } from '@/lib/supabase/client'

export type Tier = 'seeker' | 'architect' | 'reality-master'
export type Segment = 'corporate' | 'university'
export type Billing = 'annual' | 'monthly'

const PRICING: Record<Segment, Record<Tier, { prices: [number, number]; minSeats: number; floor: number }>> = {
  corporate: {
    seeker:          { prices: [29, 2.90], minSeats: 25, floor: 725  },
    architect:       { prices: [39, 3.90], minSeats: 25, floor: 975  },
    'reality-master':{ prices: [49, 4.90], minSeats: 25, floor: 1225 },
  },
  university: {
    seeker:          { prices: [19, 1.90], minSeats: 50, floor: 950  },
    architect:       { prices: [39, 3.90], minSeats: 50, floor: 1950 },
    'reality-master':{ prices: [49, 4.90], minSeats: 50, floor: 2450 },
  },
}

const SEG_LABELS: Record<Segment, string> = {
  corporate:  'Business',
  university: 'Education',
}

const TIER_LABELS: Record<Tier, string> = {
  seeker:          'Seeker',
  architect:       'Architect',
  'reality-master':'Reality Master',
}

const TIER_DESCRIPTIONS: Record<Tier, string> = {
  seeker:          "Foundational access to Vibe Hyr's core curriculum and self-mastery tools.",
  architect:       "Comprehensive training with diagnostics, journaling, and community access.",
  'reality-master':"Elite, full-platform access with live sessions and dedicated coaching.",
}

function getVolumeDiscount(n: number, segment: Segment): number {
  if (n >= 500) return 1 - 0.9025           // Level 3: two sequential 5% drops
  if (segment === 'university' && n >= 250) return 0.05  // Level 2 Edu: 250+
  if (segment === 'corporate'  && n >= 100) return 0.05  // Level 2 Biz: 100+
  return 0
}

// ─── Shared style tokens ───────────────────────────────────────────────────
const INK    = '#1A1208'
const CREAM  = '#FAF9F6'
const ORANGE = '#E8621A'
const GOLD   = '#C9A84C'

interface CartPanelProps {
  isOpen:          boolean
  onClose:         () => void
  initialTier?:    Tier
  initialSegment?: Segment
  initialBilling?: Billing
  vertical:        'education' | 'business' | 'leadership'
}

export function CartPanel({
  isOpen,
  onClose,
  initialTier    = 'architect',
  initialSegment = 'corporate',
  initialBilling = 'annual',
  vertical,
}: CartPanelProps) {
  // Normalize tier (e.g., 'elite' -> 'reality-master')
  const activeTier = useMemo(() => {
    if ((initialTier as string) === 'elite') return 'reality-master' as Tier
    return initialTier
  }, [initialTier])

  // Panel controls — reset whenever the panel opens with new defaults
  const [panelBilling,  setPanelBilling]  = useState<Billing>(initialBilling)
  const [panelSegment,  setPanelSegment]  = useState<Segment>(initialSegment)
  const [panelSeats,    setPanelSeats]    = useState<number>(
    PRICING[initialSegment][activeTier].minSeats
  )

  // Org fields
  const [orgName,    setOrgName]    = useState('')
  const [orgDomain,  setOrgDomain]  = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [userId,     setUserId]     = useState<string | null>(null)

  const { startCheckout, loading, error } = useCheckout()

  // Reset internal state each time the panel opens
  useEffect(() => {
    if (isOpen) {
      setPanelBilling(initialBilling)
      setPanelSegment(initialSegment)
      setPanelSeats(PRICING[initialSegment][activeTier].minSeats)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTier])

  // Fetch auth user once
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        setAdminEmail(user.email ?? '')
        if (user.email) {
          const domain = user.email.split('@')[1]
          if (domain && !['gmail.com', 'yahoo.com', 'hotmail.com', 'live.com'].includes(domain)) {
            setOrgDomain(domain)
          }
        }
      }
    })
  }, [])

  // Lock scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const minSeats   = PRICING[panelSegment][activeTier].minSeats
  const clamp      = (v: number) => Math.max(minSeats, Math.min(1000, v))

  const handleSegmentChange = (seg: Segment) => {
    setPanelSegment(seg)
    setPanelSeats(s => Math.max(PRICING[seg][activeTier].minSeats, s))
  }

  // Live order summary
  const summary = useMemo(() => {
    const idx       = panelBilling === 'annual' ? 0 : 1
    const data      = PRICING[panelSegment][activeTier]
    const base      = data.prices[idx]
    const disc      = getVolumeDiscount(panelSeats, panelSegment)
    const effective = base * (1 - disc)
    const total     = Math.round(effective * panelSeats)
    const savings   = Math.round((base - effective) * panelSeats)
    const annualEq  = panelBilling === 'monthly'
      ? Math.round(effective * panelSeats * 12)
      : total
    const floor = panelBilling === 'annual'
      ? data.floor
      : Math.round(data.minSeats * data.prices[1])
    return { base, disc, effective, total, savings, annualEq, floor }
  }, [panelSegment, initialTier, panelBilling, panelSeats])

  const cycleLabel = panelBilling === 'annual' ? 'year' : 'month'

  const handleCheckout = () => {
    if (!orgName || !orgDomain || !adminEmail) {
      alert('Please fill out all organization details.')
      return
    }
    startCheckout({
      tier: activeTier,
      segment: panelSegment,
      billingCycle: panelBilling,
      seats: panelSeats,
      orgName,
      orgDomain,
      adminEmail,
      userId: userId ?? undefined,
      vertical,
    })
  }

  // ─── Shared sub-component styles ───────────────────────────────────────
  const labelStyle: React.CSSProperties = {
    fontSize: '0.6rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.2em',
    color: `${INK}66`, display: 'block', marginBottom: '10px',
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '2px',
    border: `1.5px solid ${INK}22`,
    background: 'rgba(255,255,255,0.7)',
    color: INK, fontSize: '14px', outline: 'none',
    fontFamily: 'var(--font-dm, "DM Sans", sans-serif)',
  }
  const rowBorder = `1px solid ${INK}10`

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ───────────────────────────────────── */}
          <motion.div
            key="cart-backdrop"
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(14,12,8,0.68)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* ── Panel ──────────────────────────────────────── */}
          <motion.div
            key="cart-panel"
            className="fixed top-0 right-0 h-full z-50 flex flex-col w-full"
            style={{
              maxWidth: '480px',
              background: CREAM,
              boxShadow: `-10px 0 60px rgba(14,12,8,0.28)`,
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >

            {/* ── Header ──────────────────────────────────── */}
            <div
              className="flex items-start justify-between px-8 py-6 flex-shrink-0"
              style={{ borderBottom: rowBorder }}
            >
              <div className="flex-1 min-w-0 pr-4">
                <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: ORANGE, marginBottom: '4px' }}>
                  {TIER_LABELS[activeTier]} Plan
                </p>
                <h2 style={{
                  fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)',
                  fontSize: 'clamp(28px, 5vw, 40px)',
                  letterSpacing: '2px', lineHeight: 1, color: INK,
                }}>
                  {activeTier === 'reality-master' ? 'REALITY MASTER' : activeTier.toUpperCase()}
                </h2>
                <p style={{ fontSize: '13px', color: `${INK}80`, marginTop: '8px', lineHeight: 1.6, maxWidth: '300px' }}>
                  {TIER_DESCRIPTIONS[activeTier]}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
                style={{ background: `${INK}12`, color: INK }}
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Scrollable body ─────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-7">

              {/* Billing toggle */}
              <div>
                <p style={labelStyle}>Billing Schedule</p>
                <div
                  className="inline-flex rounded-sm overflow-hidden"
                  style={{ border: `1.5px solid ${INK}18` }}
                >
                  {(['annual', 'monthly'] as Billing[]).map((b, i) => (
                    <button
                      key={b}
                      onClick={() => setPanelBilling(b)}
                      className="px-5 py-3 transition-all flex items-center gap-2"
                      style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        fontFamily: 'var(--font-dm, "DM Sans", sans-serif)',
                        background: panelBilling === b ? INK : 'transparent',
                        color:      panelBilling === b ? '#fff' : `${INK}55`,
                        borderRight: i === 0 ? `1.5px solid ${INK}18` : 'none',
                      }}
                    >
                      {b === 'annual' ? 'Annual' : 'Monthly'}
                      {b === 'annual' && (
                        <span style={{
                          fontSize: '0.5rem', fontWeight: 800, lineHeight: 1,
                          padding: '2px 7px', borderRadius: '20px',
                          background: ORANGE, color: '#fff', letterSpacing: '0.08em',
                        }}>
                          SAVE 15%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Organization type (fixed based on category) */}
              <div>
                <p style={labelStyle}>Organization Type</p>
                <p style={{ fontSize: '0.75rem', color: `${INK}80`, marginTop: 4 }}>
                  {SEG_LABELS[panelSegment]}
                </p>
              </div>

              {/* Seat stepper */}
              <div>
                <p style={labelStyle}>Number of Seats</p>
                <p style={{ fontSize: '0.65rem', color: `${INK}50`, marginBottom: '10px' }}>
                  Min {minSeats} for {TIER_LABELS[activeTier]} · {SEG_LABELS[panelSegment]}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPanelSeats(s => clamp(s - 1))}
                    aria-label="Decrease seats"
                    className="flex-shrink-0 w-11 h-11 rounded-sm flex items-center justify-center transition-colors"
                    style={{ border: `1.5px solid ${INK}22`, color: INK, background: 'rgba(255,255,255,0.6)' }}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={panelSeats}
                    min={minSeats}
                    max={1000}
                    onChange={e => setPanelSeats(clamp(Number(e.target.value) || minSeats))}
                    className="flex-1 text-center rounded-sm outline-none"
                    style={{
                      border: `1.5px solid ${INK}22`,
                      background: 'rgba(255,255,255,0.7)',
                      color: INK,
                      fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)',
                      fontSize: '32px', letterSpacing: '2px',
                      padding: '8px 12px', lineHeight: '1',
                      /* hide spin buttons via inline — CSS in globals.css handles webkit */
                      MozAppearance: 'textfield',
                    } as React.CSSProperties}
                  />
                  <button
                    onClick={() => setPanelSeats(s => clamp(s + 1))}
                    aria-label="Increase seats"
                    className="flex-shrink-0 w-11 h-11 rounded-sm flex items-center justify-center transition-colors"
                    style={{ border: `1.5px solid ${INK}22`, color: INK, background: 'rgba(255,255,255,0.6)' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Live order summary */}
              <div className="rounded-sm p-5" style={{ background: '#fff', border: `1px solid ${INK}12` }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', color: `${INK}50`, marginBottom: '16px' }}>
                  Live Order Summary
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>

                  {/* Per seat */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: `${INK}70` }}>Per seat / {cycleLabel}</span>
                    <span style={{ fontWeight: 600, color: INK }}>
                      {summary.disc > 0 ? (
                        <>
                          <span style={{ textDecoration: 'line-through', opacity: 0.35, marginRight: '6px' }}>${summary.base}</span>
                          ${summary.effective.toFixed(2)}
                        </>
                      ) : `$${summary.base}`}
                    </span>
                  </div>

                  {/* × seats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: `${INK}70` }}>× {panelSeats} seats</span>
                    <span style={{ fontWeight: 600, color: INK }}>
                      ${Math.round(summary.base * panelSeats).toLocaleString()}
                    </span>
                  </div>

                  {/* Volume discount */}
                  {summary.disc > 0 && (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px', borderRadius: '2px',
                      background: `${ORANGE}0C`, border: `1px solid ${ORANGE}33`,
                      fontSize: '12px', fontWeight: 700, color: ORANGE,
                    }}>
                      <span>Volume discount ({Math.round(summary.disc * 100)}% off)</span>
                      <span>−${summary.savings.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Divider */}
                  <div style={{ height: '1px', background: `${INK}10` }} />

                  {/* Total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '13px', color: `${INK}80` }}>Total / {cycleLabel}</span>
                    <span style={{
                      fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)',
                      fontSize: '32px', letterSpacing: '1px', lineHeight: 1,
                      color: ORANGE,
                    }}>
                      ${summary.total.toLocaleString()}
                    </span>
                  </div>

                  {/* Floor note */}
                  <p style={{ fontSize: '0.6rem', fontStyle: 'italic', color: `${INK}40` }}>
                    {panelBilling === 'annual' ? 'Annual' : 'Monthly'} floor ${summary.floor.toLocaleString()}
                    {panelBilling === 'monthly' && ` · Annual equivalent $${summary.annualEq.toLocaleString()}`}
                  </p>

                </div>
              </div>

              {/* Organization details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ ...labelStyle, marginBottom: 0 }}>Organization Details</p>

                {[
                  { label: 'Organization Name',   type: 'text',  ph: 'Acme Corporation',  val: orgName,    set: setOrgName,    hint: '' },
                  { label: 'Organization Domain', type: 'text',  ph: 'acme.com',          val: orgDomain,  set: setOrgDomain,  hint: 'Users with this domain are auto-assigned to your org' },
                  { label: 'Admin Email',         type: 'email', ph: 'admin@acme.com',    val: adminEmail, set: setAdminEmail, hint: '' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={labelStyle}>{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.ph}
                      value={f.val}
                      onChange={e => f.set(e.target.value)}
                      style={inputStyle}
                    />
                    {f.hint && (
                      <p style={{ fontSize: '0.6rem', color: `${INK}45`, marginTop: '4px' }}>{f.hint}</p>
                    )}
                  </div>
                ))}
              </div>

            </div>

            {/* ── Sticky footer ────────────────────────────── */}
            <div
              className="flex-shrink-0 px-8 py-6"
              style={{ borderTop: rowBorder, background: CREAM }}
            >
              {error && (
                <div style={{
                  marginBottom: '12px', padding: '10px 14px', borderRadius: '2px',
                  background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.25)',
                  fontSize: '12px', color: '#dc2626',
                }}>
                  {error}
                </div>
              )}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-4 flex items-center justify-center gap-2 rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: ORANGE, color: '#fff',
                  fontFamily: 'var(--font-dm, "DM Sans", sans-serif)',
                  fontSize: '0.75rem', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={14} />}
                {loading ? 'PROCESSING...' : 'PROCEED TO CHECKOUT'}
                {!loading && <ArrowRight size={14} />}
              </button>
              <div
                className="mt-3 flex items-center justify-center gap-1.5"
                style={{ fontSize: '0.6rem', color: `${INK}45` }}
              >
                <ShieldCheck size={13} />
                Secured by Stripe · Instant access after payment
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
