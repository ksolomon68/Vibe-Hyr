// lib/courseAccess.ts
// Server-side course access matrix — checks BOTH membership tier AND institution type.
// All access logic must run server-side only. Never trust client-side tier checks.

import { createClient } from '@/lib/supabase/server'

export type InstitutionType = 'individual' | 'education' | 'business' | 'leadership'
export type AccessDeniedReason = 'institution_blocked' | 'tier_required' | 'wrong_vertical'

export function getCourseVertical(courseId: string): string {
  if (courseId.startsWith('education_')) return 'education'
  if (courseId.startsWith('business_') || 
      courseId.startsWith('track_')) return 'business'
  if (courseId.startsWith('leadership_')) return 'leadership'
  return 'personal'
}

interface AccessRule {
  /** DB tier values that can access this course. */
  tiers: string[]
  /** Institution types allowed to access this course. */
  institutionTypes: InstitutionType[]
}

/**
 * Course access matrix using actual DB tier values:
 *   free      = Seeker tier
 *   architect = Architect tier
 *   elite     = Reality Master tier
 *
 * Rules:
 *  - programming-the-gatekeeper:      all tiers, all institution types
 *  - mastery-of-the-law-of-assumption: architect+, all institution types
 *  - subconscious-reprogramming-sats: architect+, individual + business ONLY
 *  - navigating-the-echo-theory-delay: elite only, all institution types
 */
const COURSE_ACCESS_MATRIX: Record<string, AccessRule> = {
  'programming-the-gatekeeper': {
    tiers: ['free', 'architect', 'elite'],
    institutionTypes: ['individual', 'education', 'business', 'leadership'],
  },
  'mastery-of-the-law-of-assumption': {
    tiers: ['architect', 'elite'],
    institutionTypes: ['individual', 'education', 'business', 'leadership'],
  },
  'subconscious-reprogramming-sats': {
    tiers: ['architect', 'elite'],
    institutionTypes: ['individual', 'business', 'leadership'],
  },
  'navigating-the-echo-theory-delay': {
    tiers: ['elite'],
    institutionTypes: ['individual', 'education', 'business', 'leadership'],
  },
}

/**
 * Returns whether a user can access a course given their tier and institution type.
 *
 * Institution check runs FIRST — if the institution type is blocked, it returns
 * `institution_blocked` even if the tier is sufficient, because institution
 * restrictions are policy-level and cannot be bypassed by upgrading.
 *
 * Course slugs not in the matrix are passed through (allowed = true) so that
 * educator/business routes are unaffected.
 */
export async function canAccessCourse(
  courseSlug: string,
  tier: string,
  institutionType: string,
  profile?: { id: string; org_id: string | null }
): Promise<{ allowed: boolean; reason?: AccessDeniedReason }> {
  const rule = COURSE_ACCESS_MATRIX[courseSlug]

  // Course not in matrix — no restriction defined, pass through
  if (!rule) return { allowed: true }

  // Institution type check (policy-level, cannot be upgraded past)
  if (!rule.institutionTypes.includes(institutionType as InstitutionType)) {
    return {
      allowed: false,
      reason: 'institution_blocked',
    }
  }

  // Vertical isolation — org members can only access 
  // their own vertical's content
  let orgVertical: string | null = null
  if (profile?.org_id) {
    const supabase = createClient()
    const { data } = await supabase.rpc('get_org_vertical', { p_user_id: profile.id })
    orgVertical = data as string | null
  }

  if (orgVertical) {
    const courseVertical = getCourseVertical(courseSlug)
    if (courseVertical !== orgVertical) {
      return { allowed: false, reason: 'wrong_vertical' }
    }
  }

  // Tier check
  if (!rule.tiers.includes(tier)) {
    return {
      allowed: false,
      reason: 'tier_required',
    }
  }

  return { allowed: true }
}
