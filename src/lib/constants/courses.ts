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
  'programming-the-gatekeeper':        'personal_course_1',
  'mastery-of-the-law-of-assumption': 'personal_course_2',
  'subconscious-reprogramming-sats':  'personal_course_3',
  'navigating-the-echo-theory-delay': 'personal_course_4',

  // Business (slug or short ID → course_id)
  'common-sense-in-the-workplace': 'business_course_1',
  'from-reaction-to-response':     'business_course_2',
  'know-yourself-lead-yourself':   'business_course_3',
  'the-high-frequency-team':       'business_course_4',
  'b01': 'business_course_1',
  'b02': 'business_course_2',
  'b03': 'business_course_3',
  'b04': 'business_course_4',

  // Education (slug, id-style, or numeric → course_id)
  'the-educator-reset':       'education_course_1',
  'vibrational-leadership':   'education_course_2',
  'co-regulation-mastery':    'education_course_3',
  'echo-theory-for-educators':'education_course_4',
  'ed01': 'education_course_1',
  'ed02': 'education_course_2',
  'ed03': 'education_course_3',
  'ed04': 'education_course_4',
  '9':  'education_course_1',
  '10': 'education_course_2',
  '11': 'education_course_3',
  '12': 'education_course_4',

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
    base: '/business',
  },
  education: {
    slugs: ['ed01', 'ed02', 'ed03', 'ed04'],
    base: '/educators',
  },
  leadership: {
    slugs: [
      'leadership_course_1',
      'leadership_course_2',
      'leadership_course_3',
      'leadership_course_4',
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

// ─────────────────────────────────────────────────────────────────────────────
// Direct-to-Lesson-01 paths (for post-completion auto-transition)
// ─────────────────────────────────────────────────────────────────────────────

const FIRST_LESSON_PATH: Record<string, string> = {
  // Personal — /personal/[slug]/[lessonId]
  'programming-the-gatekeeper':       '/personal/programming-the-gatekeeper/c01-l01',
  'mastery-of-the-law-of-assumption':  '/personal/mastery-of-the-law-of-assumption/c02-l01',
  'subconscious-reprogramming-sats':   '/personal/subconscious-reprogramming-sats/c03-l01',
  'navigating-the-echo-theory-delay':  '/personal/navigating-the-echo-theory-delay/c04-l01',

  // Business — /business/[trackId]/[lessonId]
  'common-sense-in-the-workplace': '/business/common-sense-in-the-workplace/b01-l01',
  'from-reaction-to-response':     '/business/from-reaction-to-response/b02-l01',
  'know-yourself-lead-yourself':   '/business/know-yourself-lead-yourself/b03-l01',
  'the-high-frequency-team':       '/business/the-high-frequency-team/b04-l01',

  // Education — /educators/[programId]/[moduleId]
  'ed01': '/educators/ed01/ed01-m01',
  'ed02': '/educators/ed02/ed02-m01',
  'ed03': '/educators/ed03/ed03-m01',
  'ed04': '/educators/ed04/ed04-m01',

  // Leadership — /leadership/[courseId]/[lessonId]
  'leadership_course_1': '/leadership/leadership_course_1/the-responsibility-formula',
  'leadership_course_2': '/leadership/leadership_course_2/the-neuroscience-of-sats',
  'leadership_course_3': '/leadership/leadership_course_3/walking-the-bridge',
  'leadership_course_4': '/leadership/leadership_course_4/echo-theory-defined',
}

/**
 * Returns the direct URL to Lesson 01 of the next course in sequence.
 * Preferred over getNextCoursePath for post-completion CTAs.
 */
export function getNextCourseLesson01Path(currentSlug: string, vertical: string): string | null {
  const seq = VERTICAL_SEQUENCE[vertical]
  if (!seq) return null
  const idx = seq.slugs.indexOf(currentSlug)
  if (idx === -1 || idx >= seq.slugs.length - 1) return null
  const nextSlug = seq.slugs[idx + 1]
  return FIRST_LESSON_PATH[nextSlug] ?? `${seq.base}/${nextSlug}`
}

/** Returns the direct URL to Lesson 01 for a given course slug (any vertical). */
export function getLesson01Path(courseSlug: string): string | null {
  return FIRST_LESSON_PATH[courseSlug] ?? null
}
