/**
 * /api/members/[id]
 * ─────────────────────────────────────────────────────────────────────────────
 * PUT    — update a member's name, role, or status
 * DELETE — remove a member from the organization
 *
 * Security invariants enforced here (not solely by RLS):
 *   - Target member must belong to the caller's org (cross-tenant guard)
 *   - Admin cannot demote themselves
 *   - Last admin in an org cannot be demoted or deleted
 *   - Admin cannot delete themselves
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { requireOrgAdmin }           from '@/lib/supabase/requireOrgAdmin'

type RouteContext = { params: { id: string } }

// ── Shared: fetch + cross-tenant verify ──────────────────────────────────────

async function fetchMember(
  admin:    ReturnType<typeof createAdminClient>,
  memberId: string,
  orgId:    string
) {
  const { data, error } = await admin
    .from('organization_members')
    .select('id, user_id, email, full_name, role, status, org_id')
    .eq('id', memberId)
    .single()

  if (error || !data) {
    return { member: null, routeError: NextResponse.json({ error: 'Member not found' }, { status: 404 }) }
  }
  if (data.org_id !== orgId) {
    return { member: null, routeError: NextResponse.json({ error: 'Forbidden: cross-tenant access denied' }, { status: 403 }) }
  }
  return { member: data, routeError: null }
}

async function countActiveAdmins(
  admin:  ReturnType<typeof createAdminClient>,
  orgId:  string
): Promise<number> {
  const { count } = await admin
    .from('organization_members')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('role',   'admin')
    .eq('status', 'active')
  return count ?? 0
}

// ── PUT /api/members/[id] ─────────────────────────────────────────────────────

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { ctx, error } = await requireOrgAdmin()
  if (error) return error

  const admin = createAdminClient()
  const { member, routeError } = await fetchMember(admin, params.id, ctx.orgId)
  if (routeError) return routeError

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { full_name, role, status } = body

  // ── Self-demotion guard ───────────────────────────────────────────────────
  if (member.user_id === ctx.userId && role === 'member') {
    return NextResponse.json(
      { error: 'You cannot remove your own admin role. Assign another admin first.' },
      { status: 400 }
    )
  }

  // ── Last-admin demotion guard ─────────────────────────────────────────────
  if (member.role === 'admin' && role === 'member') {
    const adminCount = await countActiveAdmins(admin, ctx.orgId)
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot demote the last admin. Assign another admin first.' },
        { status: 400 }
      )
    }
  }

  // ── Validate role / status values ─────────────────────────────────────────
  if (role   !== undefined && !['admin', 'member'].includes(String(role))) {
    return NextResponse.json({ error: 'role must be "admin" or "member"' }, { status: 400 })
  }
  if (status !== undefined && !['active', 'invited', 'inactive'].includes(String(status))) {
    return NextResponse.json({ error: 'status must be "active", "invited", or "inactive"' }, { status: 400 })
  }

  // ── Build update payload (only include provided fields) ───────────────────
  const updates: Record<string, unknown> = {}
  if (full_name !== undefined) updates.full_name = typeof full_name === 'string' ? full_name.trim() : null
  if (role      !== undefined) updates.role      = role
  if (status    !== undefined) updates.status    = status
  // When activating an invited member, record joined_at
  if (status === 'active' && member.status === 'invited') {
    updates.joined_at = new Date().toISOString()
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
  }

  const { data: updated, error: updateErr } = await admin
    .from('organization_members')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // ── Sync profile row ───────────────────────────────────────────────────────
  if (member.user_id) {
    const profileUpdates: Record<string, unknown> = {}
    if (role      !== undefined) profileUpdates.role      = role
    if (full_name !== undefined) profileUpdates.full_name = updates.full_name
    if (Object.keys(profileUpdates).length > 0) {
      await admin.from('profiles').update(profileUpdates).eq('id', member.user_id)
    }
  }

  // ── Audit log ─────────────────────────────────────────────────────────────
  await admin.from('admin_audit_log').insert({
    admin_id:    ctx.userId,
    admin_email: '',
    action:      'MEMBER_UPDATED',
    target_type: 'user',
    target_id:   member.user_id,
    target_name: member.email,
    details:     JSON.stringify(updates),
  })

  return NextResponse.json({ member: updated })
}

// ── DELETE /api/members/[id] ──────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { ctx, error } = await requireOrgAdmin()
  if (error) return error

  const admin = createAdminClient()
  const { member, routeError } = await fetchMember(admin, params.id, ctx.orgId)
  if (routeError) return routeError

  // ── Self-delete guard ──────────────────────────────────────────────────────
  if (member.user_id === ctx.userId) {
    return NextResponse.json(
      { error: 'You cannot remove yourself from the organization.' },
      { status: 400 }
    )
  }

  // ── Last-admin delete guard ───────────────────────────────────────────────
  if (member.role === 'admin') {
    const adminCount = await countActiveAdmins(admin, ctx.orgId)
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot remove the last admin. Assign another admin first.' },
        { status: 400 }
      )
    }
  }

  // ── Delete the membership row ─────────────────────────────────────────────
  const { error: delErr } = await admin
    .from('organization_members')
    .delete()
    .eq('id', params.id)

  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 })
  }

  // ── Side-effects ───────────────────────────────────────────────────────────
  // Clear institution link on profile
  if (member.user_id) {
    await admin
      .from('profiles')
      .update({ institution_id: null })
      .eq('id', member.user_id)
  }

  // Decrement seats_used (floor at 0)
  await admin
    .from('organizations')
    .update({ seats_used: Math.max(0, ctx.seatsUsed - 1) })
    .eq('id', ctx.orgId)

  // Audit log
  await admin.from('admin_audit_log').insert({
    admin_id:    ctx.userId,
    admin_email: '',
    action:      'MEMBER_DELETED',
    target_type: 'user',
    target_id:   member.user_id,
    target_name: member.email,
    details:     `Removed from org ${ctx.orgName}`,
  })

  return NextResponse.json({ success: true })
}

// ── PATCH /api/members/[id] — resend invite ───────────────────────────────────

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { ctx, error } = await requireOrgAdmin()
  if (error) return error

  let body: Record<string, unknown>
  try { body = await req.json() } catch { body = {} }

  if (body.action !== 'resend_invite') {
    return NextResponse.json({ error: 'Unknown patch action' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { member, routeError } = await fetchMember(admin, params.id, ctx.orgId)
  if (routeError) return routeError

  if (member.status !== 'invited') {
    return NextResponse.json({ error: 'Can only resend invite for pending members' }, { status: 400 })
  }

  let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
  // Bulletproof sanitization: remove quotes, remove ALL existing protocol prefixes, and trailing slashes
  appUrl = appUrl.replace(/["]/g, '').replace(/https?:\/+/gi, '').replace(/\/+$/, '')
  if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
  // Re-apply protocol
  appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`

  // Supabase generates a fresh magic-link / invite when called again
  const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(member.email, {
    redirectTo: `${appUrl}/auth/callback?next=/dashboard`,
    data: {
      org_id:           ctx.orgId,
      institution_type: ctx.orgType,
      role:             member.role,
    },
  })

  if (inviteErr && !inviteErr.message.toLowerCase().includes('already registered')) {
    return NextResponse.json({ error: inviteErr.message }, { status: 500 })
  }

  // Update invited_at timestamp
  await admin
    .from('organization_members')
    .update({ invited_at: new Date().toISOString() })
    .eq('id', params.id)

  await admin.from('admin_audit_log').insert({
    admin_id:    ctx.userId,
    admin_email: '',
    action:      'MEMBER_INVITE_RESENT',
    target_type: 'user',
    target_id:   member.user_id,
    target_name: member.email,
    details:     null,
  })

  return NextResponse.json({ success: true })
}
