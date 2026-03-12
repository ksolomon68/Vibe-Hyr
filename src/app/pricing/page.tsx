'use client'

import React, { useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartPanel } from '@/components/pricing/CartPanel'
import { PersonalCheckoutModal } from '@/components/pricing/PersonalCheckoutModal'
import type { Tier, Segment, Billing } from '@/components/pricing/CartPanel'
import type { PersonalTier, PersonalBilling } from '@/components/pricing/PersonalCheckoutModal'
import Link from 'next/link'
import './pricing.css'

// ─── Institutional pricing data ────────────────────────────────────────────
const ORG_PRICING = {
  corporate: {
    seeker:          { prices: [29,  3.5],  minSeats: 25,  floor: 725  },
    architect:       { prices: [59,  5.9],  minSeats: 25,  floor: 1475 },
    'reality-master':{ prices: [99,  9.9],  minSeats: 50,  floor: 4950 },
  },
  university: {
    seeker:          { prices: [19,  2.25], minSeats: 50,  floor: 950  },
    architect:       { prices: [39,  3.9],  minSeats: 50,  floor: 1950 },
    'reality-master':{ prices: [69,  6.9],  minSeats: 100, floor: 6900 },
  },
  k12: {
    seeker:          { prices: [12,  1.4],  minSeats: 30,  floor: 360  },
    architect:       { prices: [24,  2.4],  minSeats: 30,  floor: 720  },
    'reality-master':{ prices: [45,  4.5],  minSeats: 50,  floor: 2250 },
  },
  'small-business': {
    seeker:          { prices: [35,  4.2],  minSeats: 5,   floor: 175  },
    architect:       { prices: [65,  6.5],  minSeats: 5,   floor: 325  },
    'reality-master':{ prices: [110, 11.0], minSeats: 10,  floor: 1100 },
  },
}

const SEG_LABELS: Record<Segment, string> = {
  corporate:       'Corporate / Enterprise',
  university:      'University',
  k12:             'K-12 School',
  'small-business':'Small Business',
}

// ─── Individual pricing data ────────────────────────────────────────────────
const PERSONAL_PLANS = [
  {
    id:       'free',
    tier:     'seeker' as const,
    name:     'SEEKER',
    monthly:  0,
    annual:   0,
    tagline:  'Enough to feel the transformation. Not enough to complete it.',
    featured: false,
    cta:      'Join Free',
    features: [
      { text: 'Course 1: Programming the Gatekeeper', included: true  },
      { text: 'Identity Audit Mini (3 questions)',    included: true  },
      { text: 'Blog & YouTube content hub',           included: true  },
      { text: '1 free SATS guided audio session',     included: true  },
      { text: 'Community read-only access',           included: true  },
      { text: 'Full course library (Courses 2–4)',    included: false },
      { text: 'Daily Revision Journal',               included: false },
    ],
  },
  {
    id:       'architect',
    tier:     'architect' as PersonalTier,
    name:     'ARCHITECT',
    monthly:  27,
    annual:   270,
    tagline:  'The serious practitioner. Full curriculum, daily tools, and community.',
    featured: true,
    cta:      'Become an Architect',
    features: [
      { text: 'Everything in Seeker',                    included: true  },
      { text: 'Courses 1, 2 & 3 (full access)',          included: true  },
      { text: 'Daily Revision Journal (full)',           included: true  },
      { text: 'Identity Audit (full 25 questions)',      included: true  },
      { text: 'SATS Mastery Diagnostic',                 included: true  },
      { text: 'Community full posting + DMs',            included: true  },
      { text: 'Course 4 & Elite features',               included: false },
    ],
  },
  {
    id:       'elite',
    tier:     'reality-master' as PersonalTier,
    name:     'REALITY MASTER',
    monthly:  67,
    annual:   670,
    tagline:  'The complete system. Every course, every tool, every month.',
    featured: false,
    cta:      'Claim Mastery',
    features: [
      { text: 'Everything in Architect',                     included: true },
      { text: 'Course 4: Echo Theory (Elite only)',          included: true },
      { text: 'Full Assumption Lab simulator',               included: true },
      { text: 'Monthly Life Mastery Score + roadmap',        included: true },
      { text: 'Full SATS audio library (7 nights)',          included: true },
      { text: 'Monthly live Q&A with host',                  included: true },
      { text: 'Priority community badge',                    included: true },
    ],
  },
]

type Track = 'individuals' | 'organizations'

export default function PricingPage() {
  const [track, setTrack] = useState<Track>('individuals')

  // ── Individual state ────────────────────────────────────────────────────
  const [personalBilling, setPersonalBilling] = useState<PersonalBilling>('monthly')
  const [modalOpen,       setModalOpen]       = useState(false)
  const [modalTier,       setModalTier]       = useState<PersonalTier>('architect')

  // ── Institutional state ─────────────────────────────────────────────────
  const [billing,  setBilling]  = useState<Billing>('annual')
  const [segment,  setSegment]  = useState<Segment>('corporate')
  const [panelOpen,    setPanelOpen]    = useState(false)
  const [panelTier,    setPanelTier]    = useState<Tier>('architect')
  const [panelBilling, setPanelBilling] = useState<Billing>('annual')
  const [panelSegment, setPanelSegment] = useState<Segment>('corporate')

  // Individual handlers
  const handlePersonalPlan = (tier: PersonalTier) => {
    setModalTier(tier)
    setModalOpen(true)
  }

  // Org handlers
  const handleOpenPanel = (tier: Tier) => {
    setPanelTier(tier)
    setPanelBilling(billing)
    setPanelSegment(segment)
    setPanelOpen(true)
  }

  const billIdx    = billing === 'annual' ? 0 : 1
  const cycleLabel = billing === 'annual' ? 'year' : 'month'
  const curPricing = ORG_PRICING[segment]

  return (
    <>
      <Navbar />

      <main id="pricing" className="page active pt-0">

        {/* ── Track switcher ───────────────────────────────────────────────── */}
        <div className="pricing-hero fade-up" style={{ paddingBottom: '2.5rem' }}>
          <div className="eyebrow">✦ Vibe Hyr Membership</div>
          <h1>INVEST IN YOUR<br /><em>REALITY</em></h1>
          <p>Choose your path — solo practitioner or entire organization.</p>

          <div className="flex items-center justify-center gap-0 mt-8">
            <button
              onClick={() => setTrack('individuals')}
              className="transition-all"
              style={{
                padding: '14px 36px',
                fontFamily: 'var(--font-dm, "DM Sans", sans-serif)',
                fontSize: '0.75rem', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                background: track === 'individuals' ? '#E8621A' : 'transparent',
                color:      track === 'individuals' ? '#fff' : 'rgba(247,242,234,0.45)',
                border: '2px solid #E8621A',
                borderRight: 'none',
              }}
            >
              For Individuals
            </button>
            <button
              onClick={() => setTrack('organizations')}
              className="transition-all"
              style={{
                padding: '14px 36px',
                fontFamily: 'var(--font-dm, "DM Sans", sans-serif)',
                fontSize: '0.75rem', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                background: track === 'organizations' ? '#E8621A' : 'transparent',
                color:      track === 'organizations' ? '#fff' : 'rgba(247,242,234,0.45)',
                border: '2px solid #E8621A',
              }}
            >
              For Organizations
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            INDIVIDUAL TRACK
        ════════════════════════════════════════════════════════════════════ */}
        {track === 'individuals' && (
          <div className="px-6 md:px-16 pb-24">
            <div className="max-w-[1000px] mx-auto">

              {/* Billing toggle */}
              <div className="flex items-center gap-2 mb-10">
                <button
                  onClick={() => setPersonalBilling('monthly')}
                  className="transition-all"
                  style={{
                    padding: '10px 24px',
                    fontFamily: 'var(--font-dm, "DM Sans", sans-serif)',
                    fontSize: '0.7rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    border: '1.5px solid',
                    borderColor: personalBilling === 'monthly' ? '#E8621A' : 'rgba(247,242,234,0.2)',
                    background:  personalBilling === 'monthly' ? '#E8621A' : 'transparent',
                    color:       personalBilling === 'monthly' ? '#fff' : 'rgba(247,242,234,0.5)',
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPersonalBilling('annual')}
                  className="transition-all flex items-center gap-2"
                  style={{
                    padding: '10px 24px',
                    fontFamily: 'var(--font-dm, "DM Sans", sans-serif)',
                    fontSize: '0.7rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    border: '1.5px solid',
                    borderColor: personalBilling === 'annual' ? '#E8621A' : 'rgba(247,242,234,0.2)',
                    background:  personalBilling === 'annual' ? '#E8621A' : 'transparent',
                    color:       personalBilling === 'annual' ? '#fff' : 'rgba(247,242,234,0.5)',
                  }}
                >
                  Annual
                  <span style={{
                    fontSize: '0.5rem', fontWeight: 800,
                    padding: '2px 8px', borderRadius: '20px',
                    background: personalBilling === 'annual' ? 'rgba(255,255,255,0.25)' : '#E8621A',
                    color: '#fff',
                  }}>
                    SAVE 15%
                  </span>
                </button>
              </div>

              {/* Individual plan cards */}
              <div className="tier-grid fade-up grid-cols-1 md:grid-cols-3">

                {PERSONAL_PLANS.map((plan) => {
                  const price = plan.id === 'free'
                    ? 'Free'
                    : personalBilling === 'monthly'
                    ? `$${plan.monthly}`
                    : `$${plan.annual}`

                  const sub = plan.id === 'free'
                    ? 'No card required'
                    : personalBilling === 'monthly'
                    ? 'per month'
                    : 'per year'

                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        'tier-card',
                        plan.featured && 'featured',
                        !plan.featured && 'border-b md:border-b-0',
                        plan.id === 'elite' && 'md:border-l border-white/10',
                        plan.id === 'free' && 'md:border-r border-white/10',
                      )}
                    >
                      {plan.featured && (
                        <div className="popular-badge">MOST POPULAR</div>
                      )}
                      <div className="tier-name">{plan.name}</div>
                      <div className="tier-sub">{plan.tagline}</div>
                      <div className="price-display mt-4">
                        <div className="price-amount">{price}</div>
                      </div>
                      <div className="price-unit">{sub}</div>

                      <hr className="tier-divider my-6" />

                      <ul className="feature-list">
                        {plan.features.map((f, i) => (
                          <li
                            key={i}
                            style={{ opacity: f.included ? 1 : 0.35, display: 'flex', alignItems: 'center', gap: '8px' }}
                          >
                            {f.included
                              ? <Check size={12} style={{ color: '#E8621A', flexShrink: 0 }} />
                              : <X size={12} style={{ color: 'currentColor', flexShrink: 0 }} />
                            }
                            {f.text}
                          </li>
                        ))}
                      </ul>

                      {plan.id === 'free' ? (
                        <Link
                          href="/auth/signup"
                          className="btn-outline-orange w-full text-center mt-6"
                        >
                          {plan.cta}
                        </Link>
                      ) : (
                        <button
                          onClick={() => handlePersonalPlan(plan.tier as PersonalTier)}
                          className={cn(
                            'w-full text-center mt-6',
                            plan.featured ? 'btn-orange' : 'btn-outline-orange'
                          )}
                        >
                          {plan.cta}
                        </button>
                      )}
                    </div>
                  )
                })}

              </div>

              <p className="text-center mt-8" style={{
                fontFamily: 'var(--font-ibm-mono, monospace)',
                fontSize: '0.6rem', letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'rgba(247,242,234,0.3)',
              }}>
                ✦ 7-Day money-back guarantee · No questions asked · Cancel anytime ✦
              </p>

              <div className="mt-10 text-center">
                <p style={{ fontSize: '0.75rem', color: 'rgba(247,242,234,0.45)', fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}>
                  Purchasing for a team or institution?{' '}
                  <button
                    onClick={() => setTrack('organizations')}
                    style={{ color: '#E8621A', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                  >
                    View organization plans →
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            ORGANIZATION TRACK
        ════════════════════════════════════════════════════════════════════ */}
        {track === 'organizations' && (
          <>
            <div className="pricing-hero fade-up" style={{ paddingTop: 0 }}>
              <div className="eyebrow">✦ Institutional & Enterprise Pricing</div>
              <p>The Architecture of Reality — where cognitive neuroscience meets peak organizational performance.</p>

              <div className="billing-toggle">
                <button
                  className={`toggle-opt ${billing === 'annual' ? 'active' : ''}`}
                  onClick={() => setBilling('annual')}
                >
                  ANNUAL <span className="toggle-badge">SAVE 15%</span>
                </button>
                <button
                  className={`toggle-opt ${billing === 'monthly' ? 'active' : ''}`}
                  onClick={() => setBilling('monthly')}
                >
                  MONTHLY
                </button>
              </div>

              <div className="segment-row">
                {(Object.keys(SEG_LABELS) as Segment[]).map(seg => (
                  <button
                    key={seg}
                    className={`seg-btn ${segment === seg ? 'active' : ''}`}
                    onClick={() => setSegment(seg)}
                  >
                    {SEG_LABELS[seg]}
                  </button>
                ))}
              </div>
            </div>

            {/* Org tier cards */}
            <div className="px-6 md:px-16">
              <div className="tier-grid fade-up delay-2 max-w-[1000px] mx-auto w-full grid-cols-1 md:grid-cols-3">

                {/* SEEKER */}
                <div className="tier-card border-b md:border-b-0 md:border-r border-white/10">
                  <div className="tier-name">SEEKER</div>
                  <div className="tier-sub">Foundational</div>
                  <div className="price-display mt-4">
                    <div className="price-amount">${curPricing.seeker.prices[billIdx]}</div>
                  </div>
                  <div className="price-unit">per seat / {cycleLabel} · min {curPricing.seeker.minSeats} seats</div>
                  <div className="price-floor">{billing === 'annual' ? 'Annual' : 'Monthly'} floor ${curPricing.seeker.floor.toLocaleString()}</div>
                  <hr className="tier-divider my-6" />
                  <ul className="feature-list">
                    <li>Course 1: Programming the Gatekeeper (RAS)</li>
                    <li>Mini Identity Audit</li>
                    <li>Core Content Library</li>
                    <li>Basic Progress Tracking</li>
                  </ul>
                  <button className="btn-outline-orange w-full text-center mt-6" onClick={() => handleOpenPanel('seeker')}>
                    GET STARTED
                  </button>
                </div>

                {/* ARCHITECT */}
                <div className="tier-card featured">
                  <div className="popular-badge">MOST POPULAR</div>
                  <div className="tier-name">ARCHITECT</div>
                  <div className="tier-sub">Comprehensive</div>
                  <div className="price-display mt-4">
                    <div className="price-amount">${curPricing.architect.prices[billIdx]}</div>
                  </div>
                  <div className="price-unit">per seat / {cycleLabel} · min {curPricing.architect.minSeats} seats</div>
                  <div className="price-floor">{billing === 'annual' ? 'Annual' : 'Monthly'} floor ${curPricing.architect.floor.toLocaleString()}</div>
                  <hr className="tier-divider my-6" />
                  <ul className="feature-list">
                    <li>Courses 1–3 (RAS, Law of Assumption, SATS)</li>
                    <li>Full Revision Journal</li>
                    <li>SATS Diagnostics Engine</li>
                    <li>Core Community Access</li>
                    <li>Academic / Leadership Tracker</li>
                  </ul>
                  <button className="btn-orange w-full text-center mt-6" onClick={() => handleOpenPanel('architect')}>
                    GET STARTED
                  </button>
                </div>

                {/* REALITY MASTER */}
                <div className="tier-card border-t md:border-t-0 md:border-l border-white/10">
                  <div className="tier-name">REALITY MASTER</div>
                  <div className="tier-sub">Elite</div>
                  <div className="price-display mt-4">
                    <div className="price-amount">${curPricing['reality-master'].prices[billIdx]}</div>
                  </div>
                  <div className="price-unit">per seat / {cycleLabel} · min {curPricing['reality-master'].minSeats} seats</div>
                  <div className="price-floor">{billing === 'annual' ? 'Annual' : 'Monthly'} floor ${curPricing['reality-master'].floor.toLocaleString()}</div>
                  <hr className="tier-divider my-6" />
                  <ul className="feature-list">
                    <li>All 4 Courses incl. Echo Theory Delay</li>
                    <li>Full Assumption Lab</li>
                    <li>Live Weekly Q&amp;As</li>
                    <li>Full Audio SATS Library</li>
                    <li>Dedicated Reality Architect</li>
                    <li>Custom Institutional Onboarding</li>
                  </ul>
                  <button className="btn-outline-orange w-full text-center mt-6" onClick={() => handleOpenPanel('reality-master')}>
                    GET STARTED
                  </button>
                </div>

              </div>
            </div>

            {/* Volume Discounts */}
            <div className="volume-section">
              <div className="section-eyebrow">Volume Pricing</div>
              <div className="section-title">The more seats, the greater the impact</div>

              <div className="overflow-x-auto">
                <table className="volume-table min-w-[700px]">
                  <thead>
                    <tr>
                      <th>Seat Range</th>
                      <th>Discount</th>
                      <th>Architect / Corp (effective)</th>
                      <th>Reality Master / Corp</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>25–99 seats</td>
                      <td>—</td>
                      <td>$59 / seat</td>
                      <td>$99 / seat</td>
                    </tr>
                    <tr>
                      <td>100–249 seats</td>
                      <td><span className="discount-pill">10% off</span></td>
                      <td>$53.10 / seat</td>
                      <td>$89.10 / seat</td>
                    </tr>
                    <tr>
                      <td>250–499 seats</td>
                      <td><span className="discount-pill">18% off</span></td>
                      <td>$48.38 / seat</td>
                      <td>$81.18 / seat</td>
                    </tr>
                    <tr>
                      <td>500+ seats</td>
                      <td><span className="discount-pill">25% off</span></td>
                      <td>$44.25 / seat</td>
                      <td>$74.25 / seat</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pb-12 text-center px-6">
              <p style={{ fontSize: '0.75rem', color: 'rgba(247,242,234,0.45)', fontFamily: 'var(--font-dm, "DM Sans", sans-serif)' }}>
                Individual subscriber?{' '}
                <button
                  onClick={() => setTrack('individuals')}
                  style={{ color: '#E8621A', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                >
                  View personal plans →
                </button>
              </p>
            </div>
          </>
        )}

      </main>

      <Footer />

      {/* Personal checkout modal (individual track) */}
      <PersonalCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTier={modalTier}
        initialBilling={personalBilling}
      />

      {/* Org slideout cart panel (institutional track) */}
      <CartPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        initialTier={panelTier}
        initialSegment={panelSegment}
        initialBilling={panelBilling}
      />
    </>
  )
}
