/**
 * requireOrgAdmin
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-side auth guard for the Manage Members API routes.
 *
 * Verifies that the calling user:
 *   1. Is authenticated (valid Supabase JWT)
 *   2. Has an active 'admin' row in organization_members
 *   3. Belongs to an organization with type 'education' | 'business'
 *
 * Uses the service-role admin client for the membership lookup so the result
 * is never influenced by RLS on the calling user's session.
 *
 * Usage:
 *   const { ctx, error } = await requireOrgAdmin()
 *   if (error) return error   // NextResponse 401/403
 *   // ctx.orgId, ctx.userId, ctx.orgType, etc. are guaranteed
 */

import { NextResponse } from 'next/server'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Types ────────────────────────────────────────────────────────────────────

export type OrgAdminContext = {
  /** Authenticated user's UUID */
  userId:     string
  /** Organization the admin manages */
  orgId:      string
  orgName:    string
  orgType:    'education' | 'business' | 'leadership'
  orgPlan:    string
  seatLimit:  number
  seatsUsed:  number
}

type OrgAdminResult =
  | { ctx: OrgAdminContext; error: null }
  | { ctx: null;            error: NextResponse }

// ── Guard ────────────────────────────────────────────────────────────────────

export async function requireOrgAdmin(): Promise<OrgAdminResult> {
  // 1. Verify JWT — createClient() reads the session cookie
  const supabase = createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return {
      ctx:   null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // 2. Resolve org ID — always via service-role to bypass RLS
  const admin = createAdminClient()

  let resolvedOrgId: string | null = null

  // 2a. New flow: active admin row in organization_members
  const { data: membership } = await admin
    .from('organization_members')
    .select('org_id')
    .eq('user_id', user.id)
    .eq('role',    'admin')
    .eq('status',  'active')
    .limit(1)
    .maybeSingle()

  if (membership?.org_id) {
    resolvedOrgId = membership.org_id
  } else {
    // 2b. Legacy flow: profiles.role = 'admin' with org_id set directly
    const { data: profile } = await admin
      .from('profiles')
      .select('role, org_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role === 'admin' && profile?.org_id) {
      resolvedOrgId = profile.org_id
    }
  }

  if (!resolvedOrgId) {
    return {
      ctx:   null,
      error: NextResponse.json(
        { error: 'Forbidden: you must be an active organization admin' },
        { status: 403 }
      ),
    }
  }

  // 3. Fetch organization record
  const { data: org, error: orgErr } = await admin
    .from('organizations')
    .select('id, name, vertical, tier, seats_purchased, seats_used')
    .eq('id', resolvedOrgId)
    .single()

  if (orgErr || !org) {
    return {
      ctx:   null,
      error: NextResponse.json({ error: 'Organization not found' }, { status: 404 }),
    }
  }

  // Map the vertical column to the org type used for course assignment.
  const orgType: 'education' | 'business' | 'leadership' =
    (org.vertical === 'education' || org.vertical === 'educator') ? 'education'
    : org.vertical === 'leadership' ? 'leadership'
    : 'business'

  return {
    ctx: {
      userId:    user.id,
      orgId:     org.id,
      orgName:   org.name,
      orgType: orgType,
      orgPlan:   org.tier,
      seatLimit: org.seats_purchased ?? 50,
      seatsUsed: org.seats_used ?? 0,
    },
    error: null,
  }
}
