'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, ArrowRight, ShieldCheck, Loader2, Check } from 'lucide-react'
import { useCheckout } from '@/hooks/useCheckout'
import { createClient } from '@/lib/supabase/client'

export type PersonalTier = 'architect' | 'reality-master'
export type PersonalBilling = 'monthly' | 'annual'

const PERSONAL_PRICING: Record<PersonalTier, {
  name: string
  monthly: number
  annual: number
  features: string[]
}> = {
  architect: {
    name: 'ARCHITECT',
    monthly: 19,
    annual: 205,
    features: [
      'Everything in Seeker',
      'Courses 1, 2 & 3 (full access)',
      'Daily Revision Journal (full)',
      'Identity Audit (full 25 questions)',
      'SATS Mastery Diagnostic',
      'Community full posting + DMs',
      'SATS audio library (3 sessions)',
    ],
  },
  'reality-master': {
    name: 'REALITY MASTER',
    monthly: 29,
    annual: 313,
    features: [
      'Everything in Architect',
      'Course 4: Echo Theory (Elite only)',
      'Full Assumption Lab simulator',
      'Monthly Life Mastery Score + roadmap',
      'Full SATS audio library (7 nights)',
      'Monthly live Q&A with host',
      'Priority community badge',
    ],
  },
}

const INK    = '#1A1208'
const CREAM  = '#FAF9F6'
const ORANGE = '#E8621A'

interface PersonalCheckoutModalProps {
  isOpen:          boolean
  onClose:         () => void
  initialTier?:    PersonalTier
  initialBilling?: PersonalBilling
}

export function PersonalCheckoutModal({
  isOpen,
  onClose,
  initialTier    = 'architect',
  initialBilling = 'monthly',
}: PersonalCheckoutModalProps) {
  const [billing,    setBilling]    = useState<PersonalBilling>(initialBilling)
  const [userId,     setUserId]     = useState<string | null>(null)
  const [userEmail,  setUserEmail]  = useState<string>('')
  const { startCheckout, loading, error } = useCheckout()

  // Reset billing when panel opens with a new default
  useEffect(() => {
    if (isOpen) setBilling(initialBilling)
  }, [isOpen, initialBilling])

  // Fetch auth user once
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
      setUserEmail(user?.email ?? '')
    })
  }, [])

  // Lock scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const plan       = PERSONAL_PRICING[initialTier] || PERSONAL_PRICING['architect']
  const price      = billing === 'monthly' ? plan.monthly : plan.annual
  const cycleLabel = billing === 'monthly' ? 'month' : 'year'
  const annualSavings = plan.monthly * 12 - plan.annual
  const rowBorder = `1px solid ${INK}10`

  const handleCheckout = async () => {
    await startCheckout({
      tier:         initialTier,
      billingCycle: billing,
      userId:       userId ?? undefined,
      segment:      'individual',
      seats:        1,
      adminEmail:   userEmail || undefined,
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="personal-modal-backdrop"
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(14,12,8,0.72)', backdropFilter: 'blur(5px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal container */}
          <motion.div
            key="personal-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="relative w-full max-w-md"
              style={{ background: CREAM, boxShadow: '0 25px 80px rgba(14,12,8,0.45)' }}
              initial={{ y: 20, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header */}
              <div
                className="px-8 py-6 flex items-start justify-between"
                style={{ borderBottom: rowBorder }}
              >
                <div>
                  <p style={{
                    fontSize: '0.6rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.3em',
                    color: ORANGE, marginBottom: '4px',
                  }}>
                    Personal Plan
                  </p>
                  <h2 style={{
                    fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)',
                    fontSize: '36px', letterSpacing: '2px', lineHeight: 1, color: INK,
                  }}>
                    {plan.name}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                  style={{ background: `${INK}12`, color: INK }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="px-8 py-6 space-y-6">

                {/* Billing toggle */}
                <div>
                  <p style={{
                    fontSize: '0.6rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.2em',
                    color: `${INK}66`, display: 'block', marginBottom: '10px',
                  }}>
                    Billing Cycle
                  </p>
                  <div
                    className="inline-flex rounded-sm overflow-hidden"
                    style={{ border: `1.5px solid ${INK}18` }}
                  >
                    {(['monthly', 'annual'] as PersonalBilling[]).map((b, i) => (
                      <button
                        key={b}
                        onClick={() => setBilling(b)}
                        className="px-5 py-3 transition-all flex items-center gap-2"
                        style={{
                          fontSize: '0.7rem', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                          fontFamily: 'var(--font-dm, "DM Sans", sans-serif)',
                          background: billing === b ? INK : 'transparent',
                          color:      billing === b ? '#fff' : `${INK}55`,
                          borderRight: i === 0 ? `1.5px solid ${INK}18` : 'none',
                        }}
                      >
                        {b === 'monthly' ? 'Monthly' : 'Annual'}
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

                {/* Price display */}
                <div
                  className="rounded-sm p-5"
                  style={{ background: '#fff', border: `1px solid ${INK}12` }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                    <span style={{
                      fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)',
                      fontSize: '52px', letterSpacing: '1px', lineHeight: 1, color: ORANGE,
                    }}>
                      ${price}
                    </span>
                    <span style={{ fontSize: '13px', color: `${INK}60` }}>/ {cycleLabel}</span>
                  </div>
                  {billing === 'annual' ? (
                    <p style={{ fontSize: '0.6rem', fontWeight: 700, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      ✦ Save ${annualSavings} vs monthly billing
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.6rem', color: `${INK}45`, marginTop: '2px' }}>
                      Annual plan: ${plan.annual}/yr · save ${annualSavings}
                    </p>
                  )}
                </div>

                {/* Key features */}
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {plan.features.slice(0, 5).map((f, i) => (
                    <li
                      key={i}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: `${INK}80` }}
                    >
                      <Check size={13} style={{ color: ORANGE, marginTop: '2px', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

              </div>

              {/* Footer / CTA */}
              <div className="px-8 py-6" style={{ borderTop: rowBorder }}>
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
                  {loading ? 'PROCESSING...' : 'PROCEED TO STRIPE CHECKOUT'}
                  {!loading && <ArrowRight size={14} />}
                </button>
                <div
                  className="mt-3 flex items-center justify-center gap-1.5"
                  style={{ fontSize: '0.6rem', color: `${INK}45` }}
                >
                  <ShieldCheck size={13} />
                  Secured by Stripe · 7-day money-back guarantee
                </div>
              </div>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
