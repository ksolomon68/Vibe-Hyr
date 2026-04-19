export type BypassRole = {
  label: string
  vertical: string
  membership_type: string
  membership_tier: string
  role: string
  access: string[]
  note?: string
}

export const BYPASS_ROLES: BypassRole[] = [

  // ── PERSONAL ──────────────────────────────
  {
    label: 'Seeker (Free)',
    vertical: 'personal',
    membership_type: 'personal',
    membership_tier: 'free',
    role: 'personal',
    access: ['programming-the-gatekeeper'],
  },
  {
    label: 'Architect',
    vertical: 'personal',
    membership_type: 'personal',
    membership_tier: 'architect',
    role: 'personal',
    access: ['programming-the-gatekeeper', 'law-of-assumption', 'sats-reprogramming'],
  },
  {
    label: 'Reality Master (Elite)',
    vertical: 'personal',
    membership_type: 'personal',
    membership_tier: 'elite',
    role: 'personal',
    access: ['programming-the-gatekeeper', 'law-of-assumption', 'sats-reprogramming', 'echo-theory-delay'],
  },

  // ── EDUCATION ─────────────────────────────
  {
    label: 'Educator (Architect)',
    vertical: 'education',
    membership_type: 'education',
    membership_tier: 'architect',
    role: 'educator',
    access: ['the-educator-reset', 'vibrational-leadership', 'co-regulation-mastery'],
  },
  {
    label: 'Educator (Elite)',
    vertical: 'education',
    membership_type: 'education',
    membership_tier: 'elite',
    role: 'educator',
    access: [
      'the-educator-reset', 
      'vibrational-leadership', 
      'co-regulation-mastery', 
      'the-retained-educator'
    ],
  },
  {
    label: 'Education Admin',
    vertical: 'education',
    membership_type: 'education',
    membership_tier: 'elite',
    role: 'admin',
    access: [
      'the-educator-reset', 
      'vibrational-leadership', 
      'co-regulation-mastery', 
      'the-retained-educator'
    ],
  },

  // ── BUSINESS ──────────────────────────────
  {
    label: 'Business (Architect)',
    vertical: 'business',
    membership_type: 'business',
    membership_tier: 'architect',
    role: 'business',
    access: ['common-sense-in-the-workplace', 'from-reaction-to-response', 'know-yourself-lead-yourself'],
  },
  {
    label: 'Business (Elite)',
    vertical: 'business',
    membership_type: 'business',
    membership_tier: 'elite',
    role: 'business',
    access: ['common-sense-in-the-workplace', 'from-reaction-to-response', 'know-yourself-lead-yourself', 'the-high-frequency-team'],
  },
  {
    label: 'Business Admin',
    vertical: 'business',
    membership_type: 'business',
    membership_tier: 'elite',
    role: 'admin',
    access: ['common-sense-in-the-workplace', 'from-reaction-to-response', 'know-yourself-lead-yourself', 'the-high-frequency-team'],
  },

  // ── LEADERSHIP ────────────────────────────
  {
    label: 'Leader (Architect)',
    vertical: 'leadership',
    membership_type: 'leadership',
    membership_tier: 'architect',
    role: 'leader',
    access: ['leadership-the-internal-authority', 'leadership-visionary-architecture', 'leadership-bridge-of-incidents'],
  },
  {
    label: 'Leader (Elite)',
    vertical: 'leadership',
    membership_type: 'leadership',
    membership_tier: 'elite',
    role: 'leader',
    access: ['leadership-the-internal-authority', 'leadership-visionary-architecture', 'leadership-bridge-of-incidents', 'leadership-echo-theory-mastery'],
  }
]
