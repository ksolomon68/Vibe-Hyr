// lib/courseAccess.ts
// Server-side course access matrix — checks BOTH membership tier AND institution type.
// All access logic must run server-side only. Never trust client-side tier checks.

import { createClient } from '@/lib/supabase/server'

export type VerticalType = 'individual' | 'education' | 'educator' | 'business' | 'leadership'
export type AccessDeniedReason = 'institution_blocked' | 'tier_required' | 'wrong_vertical'

/**
 * Resolves which vertical a course belongs to.
 */
export function getCourseVertical(courseId: string): string {
  // Educator
  if (courseId.startsWith('educator') || 
      courseId.includes('classroom') ||
      courseId.includes('pedagogy') ||
      courseId.includes('curriculum-design') ||
      ['the-educator-reset', 'vibrational-leadership', 'co-regulation-mastery', 'the-retained-educator', 'classroom-reality-management', 'pedagogy-of-the-gatekeeper', 'conscious-curriculum-design', 'educator-reality-mastery'].includes(courseId)) {
    return 'educator'
  }
  
  // Business
  if (courseId.startsWith('business') || 
      courseId.includes('workplace') ||
      courseId.includes('problem-solving') ||
      courseId.includes('communication-at-work') ||
      courseId.includes('team') ||
      ['common-sense-in-the-workplace', 'from-reaction-to-response', 'know-yourself-lead-yourself', 'the-high-frequency-team', 'critical-thinking-problem-solving', 'effective-communication-at-work', 'high-frequency-team'].includes(courseId)) {
    return 'business'
  }
  
  // Leadership
  if (courseId.startsWith('leadership_')) return 'leadership'
  
  // Personal (default)
  return 'personal'
}

interface AccessRule {
  /** DB tier values that can access this course. */
  tiers: string[]
  /** Vertical types allowed to access this course. */
  verticals: VerticalType[]
}

/**
 * Course access matrix using actual DB tier values:
 *   free      = Seeker tier
 *   architect = Architect tier
 *   elite     = Reality Master tier
 */
const COURSE_ACCESS_MATRIX: Record<string, AccessRule> = {
  // ── Personal ───────────────────────────────────────────────────────────
  'programming-the-gatekeeper': {
    tiers: ['free', 'architect', 'elite'],
    verticals: ['individual', 'education', 'educator', 'business', 'leadership'],
  },
  'mastery-of-the-law-of-assumption': {
    tiers: ['architect', 'elite'],
    verticals: ['individual', 'education', 'educator', 'business', 'leadership'],
  },
  'subconscious-reprogramming-sats': {
    tiers: ['architect', 'elite'],
    verticals: ['individual', 'business', 'leadership'],
  },
  'navigating-the-echo-theory-delay': {
    tiers: ['elite'],
    verticals: ['individual', 'education', 'educator', 'business', 'leadership'],
  },
  
  // ── Business ───────────────────────────────────────────────────────────
  'common-sense-in-the-workplace': {
    tiers: ['free', 'architect', 'elite'],
    verticals: ['business', 'leadership', 'individual'],
  },
  'critical-thinking-problem-solving': {
    tiers: ['architect', 'elite'],
    verticals: ['business', 'leadership', 'individual'],
  },
  'effective-communication-at-work': {
    tiers: ['architect', 'elite'],
    verticals: ['business', 'leadership', 'individual'],
  },
  'high-frequency-team': {
    tiers: ['elite'],
    verticals: ['business', 'leadership', 'individual'],
  },

  // ── Educator ───────────────────────────────────────────────────────────
  'classroom-reality-management': {
    tiers: ['free', 'architect', 'elite'],
    verticals: ['educator', 'individual'],
  },
  'pedagogy-of-the-gatekeeper': {
    tiers: ['architect', 'elite'],
    verticals: ['educator', 'individual'],
  },
  'conscious-curriculum-design': {
    tiers: ['architect', 'elite'],
    verticals: ['educator', 'individual'],
  },
  'educator-reality-mastery': {
    tiers: ['elite'],
    verticals: ['educator', 'individual'],
  },

  // ── Leadership ──────────────────────────────────────────────────────────
  'leadership_course_1': {
    tiers: ['free', 'architect', 'elite'],
    verticals: ['leadership'],
  },
  'leadership_course_2': {
    tiers: ['architect', 'elite'],
    verticals: ['leadership'],
  },
  'leadership_course_3': {
    tiers: ['architect', 'elite'],
    verticals: ['leadership'],
  },
  'leadership_course_4': {
    tiers: ['elite'],
    verticals: ['leadership'],
  },
}

/**
 * Returns whether a user can access a course given their tier and vertical.
 *
 * Checks in order:
 * 1. Explicit course_access grants (Bypasses matrix)
 * 2. Institution vertical isolation
 * 3. Matrix rules (Tiers + Allowed Verticals)
 */
export async function canAccessCourse(
  courseSlug: string,
  tier: string,
  vertical: string,
  profile?: { id: string; org_id?: string | null; vertical?: string | null }
): Promise<{ allowed: boolean; reason?: AccessDeniedReason }> {
  const supabase = createClient()

  // 1. Resolve column aliasing (now standardized)
  const effectiveOrgId = profile?.org_id || null
  const effectiveVertical = profile?.vertical || vertical || 'individual'
  const userId = profile?.id

  // 1. Check for manual course_access grant (high priority)
  if (userId) {
    const { data: grant } = await supabase
      .from('course_access')
      .select('id')
      .eq('user_id', userId)
      .eq('course_slug', courseSlug)
      .maybeSingle()
    
    if (grant) return { allowed: true }

    // Also check if the entire organization has a grant
    if (effectiveOrgId) {
      const { data: orgGrant } = await supabase
        .from('course_access')
        .select('id')
        .eq('org_id', effectiveOrgId)
        .eq('course_slug', courseSlug)
        .maybeSingle()
      
      if (orgGrant) return { allowed: true }
    }
  }

  // 2. Vertical Isolation check
  let orgVertical: string | null = null
  if (userId && effectiveOrgId) {
    const { data } = await supabase.rpc('get_org_vertical', { p_user_id: userId })
    orgVertical = data as string | null
  }
  
  // Fallback to profile vertical if RPC returns null (likely individual or migration in progress)
  const resolvedUserVertical = orgVertical || effectiveVertical

  const courseVertical = getCourseVertical(courseSlug)

  if (resolvedUserVertical && resolvedUserVertical !== 'personal' && resolvedUserVertical !== 'individual') {
    // Standard isolation: Vertical-specific courses (business, leadership, educator) 
    // are locked to their own vertical. Public/Personal courses are allowed for all.
    const allowedForVertical =
      courseVertical === resolvedUserVertical ||
      courseVertical === 'personal' ||
      (resolvedUserVertical === 'business' && courseVertical === 'business') ||
      (resolvedUserVertical === 'leadership' && courseVertical === 'leadership') ||
      (resolvedUserVertical === 'educator' && courseVertical === 'educator')

    if (!allowedForVertical) {
      return { allowed: false, reason: 'wrong_vertical' }
    }
  }

  // 3. Matrix Check (Standard Tier/Type checks)
  const rule = COURSE_ACCESS_MATRIX[courseSlug]

  // Course not in matrix? Default to allowed if it didn't fail vertical isolation
  if (!rule) return { allowed: true }

  // Institution type check (normalized)
  let normalizedType = (resolvedUserVertical === 'education' ? 'educator' : resolvedUserVertical) as VerticalType
  // Treat 'personal' and 'individual' as equivalent for matrix purposes
  if ((normalizedType as string) === 'personal') normalizedType = 'individual'

  if (!rule.verticals.includes(normalizedType)) {
    return {
      allowed: false,
      reason: 'institution_blocked',
    }
  }

  // Tier check (case-insensitive)
  const normalizedTier = (tier || 'free').toLowerCase().trim()
  if (!rule.tiers.includes(normalizedTier)) {
    return {
      allowed: false,
      reason: 'tier_required',
    }
  }

  return { allowed: true }
}
