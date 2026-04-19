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
    role: 'member',
    access: ['programming-the-gatekeeper'],
  },
  {
    label: 'Architect',
    vertical: 'personal',
    membership_type: 'personal',
    membership_tier: 'architect',
    role: 'member',
    access: ['programming-the-gatekeeper', 'mastery-of-the-law-of-assumption', 'subconscious-reprogramming-sats'],
  },
  {
    label: 'Reality Master (Elite)',
    vertical: 'personal',
    membership_type: 'personal',
    membership_tier: 'elite',
    role: 'member',
    access: ['programming-the-gatekeeper', 'mastery-of-the-law-of-assumption', 'subconscious-reprogramming-sats', 'navigating-the-echo-theory-delay'],
  },

  // ── EDUCATION ─────────────────────────────
  {
    label: 'Educator (Architect)',
    vertical: 'education',
    membership_type: 'education',
    membership_tier: 'architect',
    role: 'member',
    access: ['ed01', 'ed02', 'ed03'],
  },
  {
    label: 'Educator (Elite)',
    vertical: 'education',
    membership_type: 'education',
    membership_tier: 'elite',
    role: 'member',
    access: ['ed01', 'ed02', 'ed03', 'ed04'],
  },
  {
    label: 'Education Admin',
    vertical: 'education',
    membership_type: 'education',
    membership_tier: 'elite',
    role: 'admin',
    access: ['ed01', 'ed02', 'ed03', 'ed04'],
  },

  // ── BUSINESS ──────────────────────────────
  {
    label: 'Business (Architect)',
    vertical: 'business',
    membership_type: 'business',
    membership_tier: 'architect',
    role: 'member',
    access: ['common-sense-in-the-workplace', 'from-reaction-to-response', 'know-yourself-lead-yourself'],
  },
  {
    label: 'Business (Elite)',
    vertical: 'business',
    membership_type: 'business',
    membership_tier: 'elite',
    role: 'member',
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
    access: ['leadership_course_1', 'leadership_course_2', 'leadership_course_3'],
  },
  {
    label: 'Leader (Elite)',
    vertical: 'leadership',
    membership_type: 'leadership',
    membership_tier: 'elite',
    role: 'leader',
    access: ['leadership_course_1', 'leadership_course_2', 'leadership_course_3', 'leadership_course_4'],
  }
]
