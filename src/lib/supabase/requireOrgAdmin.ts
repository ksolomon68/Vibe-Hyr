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
  orgType:    'education' | 'business'
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

  // 2. Look up admin membership — always via service-role to bypass RLS
  const admin = createAdminClient()

  const { data: membership, error: memberErr } = await admin
    .from('organization_members')
    .select('org_id, role, status')
    .eq('user_id', user.id)
    .eq('role',    'admin')
    .eq('status',  'active')
    .limit(1)
    .single()

  if (memberErr || !membership) {
    return {
      ctx:   null,
      error: NextResponse.json(
        { error: 'Forbidden: you must be an active organization admin' },
        { status: 403 }
      ),
    }
  }

  // 3. Verify organization type (education | business only)
  const { data: org, error: orgErr } = await admin
    .from('organizations')
    .select('id, name, type, plan, seat_limit, seats_used')
    .eq('id', membership.org_id)
    .single()

  if (orgErr || !org) {
    return {
      ctx:   null,
      error: NextResponse.json({ error: 'Organization not found' }, { status: 404 }),
    }
  }

  if (!['education', 'business'].includes(org.type)) {
    return {
      ctx:   null,
      error: NextResponse.json(
        { error: 'Forbidden: member management is only available for education and business accounts' },
        { status: 403 }
      ),
    }
  }

  return {
    ctx: {
      userId:    user.id,
      orgId:     org.id,
      orgName:   org.name,
      orgType:   org.type as 'education' | 'business',
      orgPlan:   org.plan,
      seatLimit: org.seat_limit ?? 50,
      seatsUsed: org.seats_used ?? 0,
    },
    error: null,
  }
}
