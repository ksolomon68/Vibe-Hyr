// lib/stripe/config.ts
// Central source of truth for all Stripe pricing config.
// Matches the pricing matrix from your institutional pricing doc.

export type Tier = 'seeker' | 'architect' | 'reality-master'
export type BillingCycle = 'monthly' | 'annual'
export type Segment = 'individual' | 'corporate' | 'university' | 'k12' | 'small-business'
export type Vertical = 'education' | 'business' | 'leadership'

// Stripe/pricing tier names ('seeker' | 'architect' | 'reality-master') vs. the
// DB's profiles.membership_tier values ('free' | 'architect' | 'elite') used by
// COURSE_ACCESS_MATRIX and every *_TIER_ACCESS gate in the app. These must be
// converted at every write site — admin/users/actions.ts previously copied
// organizations.tier straight into membership_tier with no conversion, which
// silently locked out every Seeker- and Reality-Master-tier org member (only
// 'architect' matched both naming schemes by coincidence).
export const TIER_TO_DB_TIER: Record<Tier, 'free' | 'architect' | 'elite'> = {
  seeker: 'free',
  architect: 'architect',
  'reality-master': 'elite',
}

export interface TierConfig {
  name: string
  sub: string
  perSeatPricing: Record<Segment, { monthly: number; annual: number }>
  minSeats: Record<Segment, number>
  annualFloor: Record<Segment, number>
  courses: string[]
  features: string[]
  popular?: boolean
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  seeker: {
    name: 'SEEKER',
    sub: 'Foundational',
    perSeatPricing: {
      individual:     { monthly: 0,     annual: 0 },
      corporate:      { monthly: 2.90,  annual: 29 },
      university:     { monthly: 1.90,  annual: 19 },
      k12:            { monthly: 1.40,  annual: 12 },
      'small-business': { monthly: 4.20, annual: 35 },
    },
    minSeats: { individual: 1, corporate: 25, university: 50, k12: 30, 'small-business': 5 },
    annualFloor: { individual: 0, corporate: 725, university: 950, k12: 360, 'small-business': 175 },
    courses: [
      'programming-the-gatekeeper',
      'the-educator-reset',
      't1'
    ],
    features: [
      'Course 1: Programming the Gatekeeper (RAS)',
      'Program 1: The Educator Reset',
      'Track 1: Common Sense in the Workplace',
      'Mini Identity Audit',
      'Core Content Library',
      'Basic Progress Tracking',
    ],
  },

  architect: {
    name: 'ARCHITECT',
    sub: 'Comprehensive',
    popular: true,
    perSeatPricing: {
      individual:     { monthly: 19,    annual: 205 },
      corporate:      { monthly: 3.90,  annual: 39 },
      university:     { monthly: 3.90,  annual: 39 },
      k12:            { monthly: 2.40,  annual: 24 },
      'small-business': { monthly: 6.50, annual: 65 },
    },
    minSeats: { individual: 1, corporate: 25, university: 50, k12: 30, 'small-business': 5 },
    annualFloor: { individual: 205, corporate: 975, university: 1950, k12: 720, 'small-business': 325 },
    courses: [
      'programming-the-gatekeeper',
      'mastery-law-of-assumption',
      'subconscious-reprogramming-sats',
      'the-educator-reset',
      'vibrational-leadership',
      'co-regulation-mastery',
      't1', 't2', 't3'
    ],
    features: [
      'Everything in Seeker',
      'Personal Courses 2–3 (Law of Assumption, SATS)',
      'Educator Programs 2–3 (Vibrational Leadership, Co-Regulation)',
      'Business Tracks 2–3 (Reaction to Response, Lead Yourself)',
      'Full Revision Journal',
      'SATS Diagnostics Engine',
      'Core Community Access',
    ],
  },

  'reality-master': {
    name: 'REALITY MASTER',
    sub: 'Elite',
    perSeatPricing: {
      individual:     { monthly: 29,    annual: 313 },
      corporate:      { monthly: 4.90,  annual: 49 },
      university:     { monthly: 4.90,  annual: 49 },
      k12:            { monthly: 4.50,  annual: 45 },
      'small-business': { monthly: 11.00, annual: 110 },
    },
    minSeats: { individual: 1, corporate: 25, university: 50, k12: 50, 'small-business': 10 },
    annualFloor: { individual: 313, corporate: 1225, university: 2450, k12: 2250, 'small-business': 1100 },
    courses: [
      'programming-the-gatekeeper',
      'mastery-law-of-assumption',
      'subconscious-reprogramming-sats',
      'navigating-echo-theory-delay',
      'the-educator-reset',
      'vibrational-leadership',
      'co-regulation-mastery',
      'the-retained-educator',
      't1', 't2', 't3', 't4'
    ],
    features: [
      'Everything in Architect',
      'Personal Course 4: Echo Theory Delay',
      'Educator Program 4: The Retained Educator',
      'Business Track 4: Vibing as a Unit',
      'Full Assumption Lab',
      'Live Weekly Q&As',
      'Full Audio SATS Library',
      'Dedicated Reality Architect (coach)',
    ],
  },
}

// Matches the "Volume Pricing" table shown on /pricing for business/education:
// two sequential 5% drops (1 - 0.95*0.95 = 0.0975, shown there as "~10%").
export function getVolumeDiscount(seats: number, segment: Segment): number {
  if (segment === 'corporate' || segment === 'small-business') {
    if (seats >= 500) return 1 - 0.9025
    if (seats >= 100) return 0.05
    return 0
  }
  if (segment === 'university' || segment === 'k12') {
    if (seats >= 500) return 1 - 0.9025
    if (seats >= 250) return 0.05
    return 0
  }
  return 0
}

export function calculatePrice(
  tier: Tier,
  segment: Segment,
  cycle: BillingCycle,
  seats: number
): { perSeat: number; subtotal: number; discount: number; total: number; annualEquivalent: number } {
  const config = TIER_CONFIG[tier]
  const basePricePerSeat = config.perSeatPricing[segment][cycle]
  const minSeats = config.minSeats[segment]
  const floor = config.annualFloor[segment]
  const effectiveSeats = Math.max(seats, minSeats)
  const volumeDiscount = getVolumeDiscount(effectiveSeats, segment)

  const perSeat = basePricePerSeat * (1 - volumeDiscount)
  const subtotal = basePricePerSeat * effectiveSeats
  const total = Math.max(perSeat * effectiveSeats, cycle === 'annual' ? floor : floor / 12)
  const discount = subtotal - total
  const annualEquivalent = cycle === 'annual' ? total : total * 12

  return { perSeat, subtotal, discount, total, annualEquivalent }
}
