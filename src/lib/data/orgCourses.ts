/**
 * Org course catalog
 * ─────────────────────────────────────────────────────────────────────────────
 * Defines the courses available to each organisation type (business / education
 * / leadership). These slugs are the values written to course_access.course_slug.
 *
 * Individual / personal courses (IDs 1–4) are handled separately by the
 * membership_tier system and are not assigned per-user by org admins.
 */

export interface OrgCourse {
  slug:        string
  name:        string
  description: string
  courseId:    number  // numeric ID used in course_lessons / RLS policies
}

export const ORG_COURSES: Record<'business' | 'education' | 'leadership', OrgCourse[]> = {
  business: [
    {
      slug: 'biz-common-sense',
      name: 'Common Sense in the Workplace',
      description: 'Professional behaviour and cognitive self-governance at work.',
      courseId: 5,
    },
    {
      slug: 'biz-reaction-response',
      name: 'From Reaction to Response',
      description: 'Emotional intelligence, cognitive reframing, and intentional action.',
      courseId: 6,
    },
    {
      slug: 'biz-know-yourself',
      name: 'Know Yourself, Lead Yourself',
      description: 'Identity-based leadership development and self-mastery.',
      courseId: 7,
    },
    {
      slug: 'biz-high-frequency-team',
      name: 'The High-Frequency Team',
      description: 'Team coherence through shared mental models and aligned vision.',
      courseId: 8,
    },
  ],

  education: [
    {
      slug: 'edu-reset',
      name: 'The Educator Reset',
      description: 'Identity and purpose reset for educators ready to lead from the inside out.',
      courseId: 9,
    },
    {
      slug: 'edu-vibrational-leadership',
      name: 'Vibrational Leadership',
      description: 'Energy management and conscious influence in educational leadership.',
      courseId: 10,
    },
    {
      slug: 'edu-co-regulation',
      name: 'Co-Regulation Mastery',
      description: 'Nervous system regulation techniques for educators and their students.',
      courseId: 11,
    },
    {
      slug: 'edu-retained-educator',
      name: 'The Retained Educator',
      description: 'Building longevity, purpose, and fulfilment in an education career.',
      courseId: 12,
    },
  ],

  leadership: [
    {
      slug: 'lead-internal-authority',
      name: 'The Internal Authority',
      description: 'Leading from a grounded, unshakeable internal state.',
      courseId: 13,
    },
    {
      slug: 'lead-visionary-architecture',
      name: 'Visionary Architecture',
      description: 'Designing futures from assumption, vision, and assumed certainty.',
      courseId: 14,
    },
    {
      slug: 'lead-bridge-incidents',
      name: 'The Bridge of Incidents',
      description: 'Trusting the unfolding process of manifestation in leadership.',
      courseId: 15,
    },
    {
      slug: 'lead-echo-theory',
      name: 'Echo Theory Mastery',
      description: 'Advanced delay navigation and persistence for high-level leaders.',
      courseId: 16,
    },
  ],
}

/** Returns the course list for a given org type, or [] for unknown types. */
export function getCoursesForOrgType(
  orgType: string
): OrgCourse[] {
  return ORG_COURSES[orgType as keyof typeof ORG_COURSES] ?? []
}
