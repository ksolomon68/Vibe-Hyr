// lib/stripe/config.ts
// Central source of truth for all Stripe pricing config.
// Matches the pricing matrix from your institutional pricing doc.

export type Tier = 'seeker' | 'architect' | 'reality-master'
export type BillingCycle = 'monthly' | 'annual'
export type Segment = 'individual' | 'corporate' | 'university' | 'k12' | 'small-business'

export interface TierConfig {
  name: string
  sub: string
  stripePriceIds: Record<BillingCycle, string>
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
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_SEEKER_MONTHLY!,
      annual: process.env.STRIPE_PRICE_SEEKER_ANNUAL!,
    },
    perSeatPricing: {
      individual:     { monthly: 0,     annual: 0 },
      corporate:      { monthly: 3.50,  annual: 29 },
      university:     { monthly: 2.25,  annual: 19 },
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
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_ARCHITECT_MONTHLY!,
      annual: process.env.STRIPE_PRICE_ARCHITECT_ANNUAL!,
    },
    perSeatPricing: {
      individual:     { monthly: 27,    annual: 270 },
      corporate:      { monthly: 5.90,  annual: 59 },
      university:     { monthly: 3.90,  annual: 39 },
      k12:            { monthly: 2.40,  annual: 24 },
      'small-business': { monthly: 6.50, annual: 65 },
    },
    minSeats: { individual: 1, corporate: 25, university: 50, k12: 30, 'small-business': 5 },
    annualFloor: { individual: 270, corporate: 1475, university: 1950, k12: 720, 'small-business': 325 },
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
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_REALITYMASTER_MONTHLY!,
      annual: process.env.STRIPE_PRICE_REALITYMASTER_ANNUAL!,
    },
    perSeatPricing: {
      individual:     { monthly: 67,    annual: 670 },
      corporate:      { monthly: 9.90,  annual: 99 },
      university:     { monthly: 6.90,  annual: 69 },
      k12:            { monthly: 4.50,  annual: 45 },
      'small-business': { monthly: 11.00, annual: 110 },
    },
    minSeats: { individual: 1, corporate: 50, university: 100, k12: 50, 'small-business': 10 },
    annualFloor: { individual: 670, corporate: 4950, university: 6900, k12: 2250, 'small-business': 1100 },
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

export const VOLUME_DISCOUNTS: { minSeats: number; discount: number }[] = [
  { minSeats: 500, discount: 0.25 },
  { minSeats: 250, discount: 0.18 },
  { minSeats: 100, discount: 0.10 },
  { minSeats: 0,   discount: 0 },
]

export function getVolumeDiscount(seats: number): number {
  return VOLUME_DISCOUNTS.find(d => seats >= d.minSeats)?.discount ?? 0
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
  const volumeDiscount = getVolumeDiscount(effectiveSeats)

  const perSeat = basePricePerSeat * (1 - volumeDiscount)
  const subtotal = basePricePerSeat * effectiveSeats
  const total = Math.max(perSeat * effectiveSeats, cycle === 'annual' ? floor : floor / 12)
  const discount = subtotal - total
  const annualEquivalent = cycle === 'annual' ? total : total * 12

  return { perSeat, subtotal, discount, total, annualEquivalent }
}
