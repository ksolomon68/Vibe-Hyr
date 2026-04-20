// src/lib/constants/courses.ts
// ─────────────────────────────────────────────────────────────────────────────
// Canonical course_id → { title, vertical } mapping.
// Used for certificate issuance, completion triggers, and course metadata.
// course_id values match the DB columns in certificates.course_id and
// progress tables: personal_course_1 … leadership_course_4.
// ─────────────────────────────────────────────────────────────────────────────

export const COURSE_TITLES: Record<string, { title: string; vertical: string }> = {
  // ── Personal ────────────────────────────────────────────────────────────────
  personal_course_1: { title: 'RAS Programming',              vertical: 'personal' },
  personal_course_2: { title: 'Law of Assumption',            vertical: 'personal' },
  personal_course_3: { title: 'Subconscious Reprogramming',   vertical: 'personal' },
  personal_course_4: { title: 'Echo Theory Mastery',          vertical: 'personal' },

  // ── Business ────────────────────────────────────────────────────────────────
  business_course_1: { title: 'RAS Programming for Business',             vertical: 'business' },
  business_course_2: { title: 'Law of Assumption for Business',           vertical: 'business' },
  business_course_3: { title: 'Subconscious Reprogramming for Business',  vertical: 'business' },
  business_course_4: { title: 'Echo Theory for Business',                 vertical: 'business' },

  // ── Education ───────────────────────────────────────────────────────────────
  education_course_1: { title: 'The Educator Reset',       vertical: 'education' },
  education_course_2: { title: 'Vibrational Leadership',   vertical: 'education' },
  education_course_3: { title: 'Co-Regulation Mastery',    vertical: 'education' },
  education_course_4: { title: 'Echo Theory for Educators',vertical: 'education' },

  // ── Leadership ──────────────────────────────────────────────────────────────
  leadership_course_1: { title: 'RAS Programming for Leaders',             vertical: 'leadership' },
  leadership_course_2: { title: 'Law of Assumption for Leaders',           vertical: 'leadership' },
  leadership_course_3: { title: 'Subconscious Reprogramming for Leaders',  vertical: 'leadership' },
  leadership_course_4: { title: 'Echo Theory for Leaders',                 vertical: 'leadership' },
}

/**
 * Derive the canonical course_id from a slug-style course ID.
 * e.g. 'programming-the-gatekeeper' → 'personal_course_1'
 * Falls back to the value unchanged if not found in the slug map.
 */
export const SLUG_TO_COURSE_ID: Record<string, string> = {
  // Personal (slug → course_id)
  'programming-the-gatekeeper': 'personal_course_1',
  'law-of-assumption':          'personal_course_2',
  'sats-reprogramming':         'personal_course_3',
  'echo-theory-delay':          'personal_course_4',

  // Business (slug → course_id)
  'common-sense-in-the-workplace': 'business_course_1',
  'from-reaction-to-response':     'business_course_2',
  'know-yourself-lead-yourself':   'business_course_3',
  'the-high-frequency-team':       'business_course_4',

  // Education (id-style → course_id)
  'ed01': 'education_course_1',
  'ed02': 'education_course_2',
  'ed03': 'education_course_3',
  'ed04': 'education_course_4',

  // Leadership (already canonical)
  'leadership_course_1': 'leadership_course_1',
  'leadership_course_2': 'leadership_course_2',
  'leadership_course_3': 'leadership_course_3',
  'leadership_course_4': 'leadership_course_4',
}

// ─────────────────────────────────────────────────────────────────────────────
// Next-course navigation
// ─────────────────────────────────────────────────────────────────────────────

// Slugs must match actual page-route params used in each vertical's URL.
// Personal uses long-form slugs from lib/data/courses.ts → /personal/[slug]
// Others use short-form IDs consistent with their routing conventions.
const VERTICAL_SEQUENCE: Record<string, { slugs: string[]; base: string }> = {
  individual: {
    slugs: [
      'programming-the-gatekeeper',
      'mastery-of-the-law-of-assumption',
      'subconscious-reprogramming-sats',
      'navigating-the-echo-theory-delay',
    ],
    base: '/personal',
  },
  business: {
    slugs: [
      'common-sense-in-the-workplace',
      'from-reaction-to-response',
      'know-yourself-lead-yourself',
      'the-high-frequency-team',
    ],
    base: '/workplace',
  },
  education: {
    slugs: ['ed01', 'ed02', 'ed03', 'ed04'],
    base: '/educators',
  },
  leadership: {
    slugs: [
      'leadership-the-internal-authority',
      'leadership-visionary-architecture',
      'leadership-bridge-of-incidents',
      'leadership-echo-theory-mastery',
    ],
    base: '/leadership',
  },
}

/**
 * Returns the path for the next course in sequence, or null if this is the
 * last course (caller should fall back to the vertical overview page).
 */
export function getNextCoursePath(currentSlug: string, vertical: string): string | null {
  const seq = VERTICAL_SEQUENCE[vertical]
  if (!seq) return null
  const idx = seq.slugs.indexOf(currentSlug)
  if (idx === -1 || idx >= seq.slugs.length - 1) return null
  return `${seq.base}/${seq.slugs[idx + 1]}`
}

/** Returns the vertical overview path (fallback when no next course exists). */
export function getVerticalOverviewPath(vertical: string): string {
  return VERTICAL_SEQUENCE[vertical]?.base ?? '/dashboard'
}
