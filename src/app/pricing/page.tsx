'use client'

import React, { useState } from 'react'
import { Check, X, Diamond } from 'lucide-react'
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
    seeker:          { prices: [29,  2.90], minSeats: 25, floor: 725  },
    architect:       { prices: [39,  3.90], minSeats: 25, floor: 975  },
    'reality-master':{ prices: [49,  4.90], minSeats: 25, floor: 1225 },
  },
  university: {
    seeker:          { prices: [19,  1.90], minSeats: 50, floor: 950  },
    architect:       { prices: [39,  3.90], minSeats: 50, floor: 1950 },
    'reality-master':{ prices: [49,  4.90], minSeats: 50, floor: 2450 },
  },
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
    monthly:  19,
    annual:   205,
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
    monthly:  29,
    annual:   313,
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

type Track = 'individuals' | 'education' | 'business' | 'leadership'

export default function PricingPage() {
  const [track, setTrack] = useState<Track>('individuals')

  const getTrackButtonStyle = (active: boolean) => ({
    borderColor: active ? '#E8621A' : 'rgba(255,255,255,0.25)',
    background: active ? '#E8621A' : 'rgba(255,255,255,0.12)',
    color: active ? '#fff' : '#0f172a',
  })

  // ── Individual state ────────────────────────────────────────────────────
  const [personalBilling, setPersonalBilling] = useState<PersonalBilling>('monthly')
  const [modalOpen,       setModalOpen]       = useState(false)
  const [modalTier,       setModalTier]       = useState<PersonalTier>('architect')

  // ── Institutional state ─────────────────────────────────────────────────
  const [billing,  setBilling]  = useState<Billing>('annual')
  const [panelOpen,    setPanelOpen]    = useState(false)
  const [panelTier,    setPanelTier]    = useState<Tier>('architect')
  const [panelBilling, setPanelBilling] = useState<Billing>('annual')
  const [panelSegment, setPanelSegment] = useState<Segment>('corporate')
  const [panelVertical, setPanelVertical] = useState<'education' | 'business' | 'leadership'>('business')

  // Individual handlers
  const handlePersonalPlan = (tier: PersonalTier) => {
    setModalTier(tier)
    setModalOpen(true)
  }

  // Org handlers
  const handleOpenPanel = (tier: Tier, segment: Segment, vertical: 'education' | 'business' | 'leadership') => {
    setPanelTier(tier)
    setPanelSegment(segment)
    setPanelBilling(billing)
    setPanelVertical(vertical)
    setPanelOpen(true)
  }

  const billIdx    = billing === 'annual' ? 0 : 1
  const cycleLabel = billing === 'annual' ? 'year' : 'month'
  const orgPricingKey = track === 'education' ? 'university' : 'corporate'
  const curPricing = ORG_PRICING[orgPricingKey]

  // Leadership uses same pricing/volume structure as corporate
  const leaderPricing = ORG_PRICING.corporate

  return (
    <>
      <Navbar />

      <main id="pricing" className="page active pt-0">

        {/* ── Track switcher ───────────────────────────────────────────────── */}
        <div className="pricing-hero fade-up" style={{ paddingBottom: '2.5rem' }}>
          <div className="eyebrow">✦ Vibe Hyr Membership</div>
          <h1>INVEST IN YOUR<br /><em>REALITY</em></h1>
          <p>Choose your path — solo practitioner or entire organization.</p>

          <div className="track-switcher-wrap">
            <div className="track-switcher">
              <button
                onClick={() => setTrack('individuals')}
                className="track-switcher-btn transition-all"
                style={getTrackButtonStyle(track === 'individuals')}
              >
                Individuals
              </button>
              <button
                onClick={() => setTrack('education')}
                className="track-switcher-btn transition-all"
                style={getTrackButtonStyle(track === 'education')}
              >
                Education
              </button>
              <button
                onClick={() => setTrack('business')}
                className="track-switcher-btn transition-all"
                style={getTrackButtonStyle(track === 'business')}
              >
                Business
              </button>
              <button
                onClick={() => setTrack('leadership')}
                className="track-switcher-btn transition-all"
                style={getTrackButtonStyle(track === 'leadership')}
              >
                Leadership
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            INDIVIDUAL TRACK
        ════════════════════════════════════════════════════════════════════ */}
        {track === 'individuals' && (
          <div className="px-6 md:px-16 pb-24">
            <div className="max-w-[1000px] mx-auto">

              {/* Billing toggle */}
              <div className="flex justify-center mb-10">
                <div className="billing-toggle">
                  <button
                    className={`toggle-opt ${personalBilling === 'annual' ? 'active' : ''}`}
                    onClick={() => setPersonalBilling('annual')}
                  >
                    ANNUAL <span className="toggle-badge">SAVE 15%</span>
                  </button>
                  <button
                    className={`toggle-opt ${personalBilling === 'monthly' ? 'active' : ''}`}
                    onClick={() => setPersonalBilling('monthly')}
                  >
                    MONTHLY
                  </button>
                </div>
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
                        plan.id === 'free' && 'border-b md:border-b-0 md:border-r border-white/10',
                        plan.id === 'architect' && 'featured',
                        plan.id === 'elite' && 'border-t md:border-t-0 md:border-l border-white/10',
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
                              ? <Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />
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
                    onClick={() => setTrack('business')}
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
        {(track === 'education' || track === 'business') && (
          <>
            <div className="pricing-hero fade-up" style={{ paddingTop: 0 }}>
              <div className="eyebrow">✦ {track === 'education' ? 'Education' : 'Business'} Institutional Pricing</div>
              <p>The Architecture of Reality — where cognitive neuroscience meets peak {track === 'education' ? 'educational' : 'organizational'} performance.</p>


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
                  <div className="price-floor">{billing === 'annual' ? 'Annual' : 'Monthly'} floor ${(billing === 'annual' ? curPricing.seeker.floor : Math.round(curPricing.seeker.minSeats * curPricing.seeker.prices[1])).toLocaleString()}</div>
                  <hr className="tier-divider my-6" />
                  <ul className="feature-list">
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Course 1: Programming the Gatekeeper (RAS)</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Mini Identity Audit</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Core Content Library</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Basic Progress Tracking</li>
                  </ul>
                  <button className="btn-outline-orange w-full text-center mt-6" onClick={() => handleOpenPanel('seeker', track === 'education' ? 'university' : 'corporate', track === 'education' ? 'education' : 'business')}>
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
                  <div className="price-floor">{billing === 'annual' ? 'Annual' : 'Monthly'} floor ${(billing === 'annual' ? curPricing.architect.floor : Math.round(curPricing.architect.minSeats * curPricing.architect.prices[1])).toLocaleString()}</div>
                  <hr className="tier-divider my-6" />
                  <ul className="feature-list">
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />The Educator Reset, Vibrational Leadership, Co-Regulation Mastery</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Full Revision Journal</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />SATS Diagnostics Engine</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Core Community Access</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Academic / Leadership Tracker</li>
                  </ul>
                  <button className="btn-orange w-full text-center mt-6" onClick={() => handleOpenPanel('architect', track === 'education' ? 'university' : 'corporate', track === 'education' ? 'education' : 'business')}>
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
                  <div className="price-floor">{billing === 'annual' ? 'Annual' : 'Monthly'} floor ${(billing === 'annual' ? curPricing['reality-master'].floor : Math.round(curPricing['reality-master'].minSeats * curPricing['reality-master'].prices[1])).toLocaleString()}</div>
                  <hr className="tier-divider my-6" />
                  <ul className="feature-list">
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />All 4 Courses incl. Echo Theory Delay</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Full Assumption Lab</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Live Weekly Q&amp;As</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Full Audio SATS Library</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Dedicated Reality Architect</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Custom Institutional Onboarding</li>
                  </ul>
                  <button className="btn-outline-orange w-full text-center mt-6" onClick={() => handleOpenPanel('reality-master', track === 'education' ? 'university' : 'corporate', track === 'education' ? 'education' : 'business')}>
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
                {(() => {
                  const archBase = curPricing.architect.prices[billIdx]
                  const rmBase   = curPricing['reality-master'].prices[billIdx]
                  const label    = billing === 'annual' ? 'seat / yr' : 'seat / mo'
                  const trackLabel = track === 'education' ? 'Edu' : 'Corp'
                  const TIERS = track === 'education'
                    ? [
                        { range: '50–249 seats',  discount: null,   mult: 1      },
                        { range: '250–499 seats', discount: '5%',   mult: 0.95   },
                        { range: '500+ seats',    discount: '~10%', mult: 0.9025 },
                      ]
                    : [
                        { range: '25–99 seats',   discount: null,   mult: 1      },
                        { range: '100–499 seats', discount: '5%',   mult: 0.95   },
                        { range: '500+ seats',    discount: '~10%', mult: 0.9025 },
                      ]
                  return (
                    <table className="volume-table min-w-[700px]">
                      <thead>
                        <tr>
                          <th>Seat Range</th>
                          <th>Discount</th>
                          <th>Architect / {trackLabel} (effective)</th>
                          <th>Reality Master / {trackLabel}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TIERS.map(({ range, discount, mult }) => (
                          <tr key={range}>
                            <td>{range}</td>
                            <td>{discount ? <span className="discount-pill">{discount} off</span> : '—'}</td>
                            <td>${(archBase * mult).toFixed(2)} / {label}</td>
                            <td>${(rmBase   * mult).toFixed(2)} / {label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                })()}
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

        {/* ════════════════════════════════════════════════════════════════════
            LEADERSHIP TRACK
        ════════════════════════════════════════════════════════════════════ */}
        {track === 'leadership' && (
          <>
            <div className="pricing-hero fade-up" style={{ paddingTop: 0 }}>
              <div className="eyebrow">✦ Leadership Institutional Pricing</div>
              <p>The Architecture of Impact — community leadership programs built on identity-level neuroscience.</p>

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
            </div>

            {/* Leadership tier cards */}
            <div className="px-6 md:px-16">
              <div className="tier-grid fade-up delay-2 max-w-[1000px] mx-auto w-full grid-cols-1 md:grid-cols-3">

                {/* SEEKER */}
                <div className="tier-card border-b md:border-b-0 md:border-r border-white/10">
                  <div className="tier-name">SEEKER</div>
                  <div className="tier-sub">Internal Authority</div>
                  <div className="price-display mt-4">
                    <div className="price-amount">${leaderPricing.seeker.prices[billIdx]}</div>
                  </div>
                  <div className="price-unit">per seat / {cycleLabel} · min {leaderPricing.seeker.minSeats} seats</div>
                  <div className="price-floor">{billing === 'annual' ? 'Annual' : 'Monthly'} floor ${(billing === 'annual' ? leaderPricing.seeker.floor : Math.round(leaderPricing.seeker.minSeats * leaderPricing.seeker.prices[1])).toLocaleString()}</div>
                  <hr className="tier-divider my-6" />
                  <ul className="feature-list">
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Course 1: The Internal Authority (RAS)</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />The Responsibility Formula</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Ownership Audit Quiz</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Community Blueprint Lab</li>
                  </ul>
                  <button className="btn-outline-orange w-full text-center mt-6" onClick={() => handleOpenPanel('seeker', 'corporate', 'leadership')}>
                    GET STARTED
                  </button>
                </div>

                {/* ARCHITECT */}
                <div className="tier-card featured">
                  <div className="popular-badge">MOST POPULAR</div>
                  <div className="tier-name">ARCHITECT</div>
                  <div className="tier-sub">Visionary Leader</div>
                  <div className="price-display mt-4">
                    <div className="price-amount">${leaderPricing.architect.prices[billIdx]}</div>
                  </div>
                  <div className="price-unit">per seat / {cycleLabel} · min {leaderPricing.architect.minSeats} seats</div>
                  <div className="price-floor">{billing === 'annual' ? 'Annual' : 'Monthly'} floor ${(billing === 'annual' ? leaderPricing.architect.floor : Math.round(leaderPricing.architect.minSeats * leaderPricing.architect.prices[1])).toLocaleString()}</div>
                  <hr className="tier-divider my-6" />
                  <ul className="feature-list">
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Courses 1–3 (RAS, SATS, Bridge of Incidents)</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Hypnagogic Scripting Lab</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Synchronicity Tracker</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Private Consistency Protocol</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Bridge Forum — Leadership Cohort</li>
                  </ul>
                  <button className="btn-orange w-full text-center mt-6" onClick={() => handleOpenPanel('architect', 'corporate', 'leadership')}>
                    GET STARTED
                  </button>
                </div>

                {/* REALITY MASTER */}
                <div className="tier-card border-t md:border-t-0 md:border-l border-white/10">
                  <div className="tier-name">REALITY MASTER</div>
                  <div className="tier-sub">Echo Theory Mastery</div>
                  <div className="price-display mt-4">
                    <div className="price-amount">${leaderPricing['reality-master'].prices[billIdx]}</div>
                  </div>
                  <div className="price-unit">per seat / {cycleLabel} · min {leaderPricing['reality-master'].minSeats} seats</div>
                  <div className="price-floor">{billing === 'annual' ? 'Annual' : 'Monthly'} floor ${(billing === 'annual' ? leaderPricing['reality-master'].floor : Math.round(leaderPricing['reality-master'].minSeats * leaderPricing['reality-master'].prices[1])).toLocaleString()}</div>
                  <hr className="tier-divider my-6" />
                  <ul className="feature-list">
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />All 4 Courses incl. Echo Theory Mastery</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Identity Audit 2.0 (25-question deep dive)</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Custom Neural Script (nightly Revision Journal)</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />30-Day Private Consistency Protocol</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Dedicated Reality Architect</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Diamond size={12} style={{ color: '#E8621A', flexShrink: 0 }} />Custom Institutional Onboarding</li>
                  </ul>
                  <button className="btn-outline-orange w-full text-center mt-6" onClick={() => handleOpenPanel('reality-master', 'corporate', 'leadership')}>
                    GET STARTED
                  </button>
                </div>

              </div>
            </div>

            {/* Volume Discounts */}
            <div className="volume-section">
              <div className="section-eyebrow">Volume Pricing</div>
              <div className="section-title">The more leaders trained, the greater the multiplier</div>

              <div className="overflow-x-auto">
                {(() => {
                  const archBase = leaderPricing.architect.prices[billIdx]
                  const rmBase   = leaderPricing['reality-master'].prices[billIdx]
                  const label    = billing === 'annual' ? 'seat / yr' : 'seat / mo'
                  const TIERS = [
                    { range: '25–99 seats',   discount: null,   mult: 1      },
                    { range: '100–499 seats', discount: '5%',   mult: 0.95   },
                    { range: '500+ seats',    discount: '~10%', mult: 0.9025 },
                  ]
                  return (
                    <table className="volume-table min-w-[700px]">
                      <thead>
                        <tr>
                          <th>Seat Range</th>
                          <th>Discount</th>
                          <th>Architect / Leadership (effective)</th>
                          <th>Reality Master / Leadership</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TIERS.map(({ range, discount, mult }) => (
                          <tr key={range}>
                            <td>{range}</td>
                            <td>{discount ? <span className="discount-pill">{discount} off</span> : '—'}</td>
                            <td>${(archBase * mult).toFixed(2)} / {label}</td>
                            <td>${(rmBase   * mult).toFixed(2)} / {label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                })()}
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
        initialBilling={panelBilling}
        initialSegment={panelSegment}
        vertical={panelVertical}
      />
    </>
  )
}
