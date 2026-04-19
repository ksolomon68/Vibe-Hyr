/**
 * /api/members
 * ─────────────────────────────────────────────────────────────────────────────
 * GET  — list all members in the admin's organization
 * POST — invite a new member via Supabase Auth email invite
 *
 * Both routes require an active org-admin session (enforced by requireOrgAdmin).
 * All DB writes use the service-role client so they bypass RLS safely on the
 * server side — the RLS policies still protect direct client access.
 */

import { NextRequest, NextResponse }    from 'next/server'
import { createAdminClient }           from '@/lib/supabase/admin'
import { requireOrgAdmin }             from '@/lib/supabase/requireOrgAdmin'
import { sendEmail }                   from '@/lib/email/resend'
import { institutionInviteTemplate }   from '@/lib/email/templates'
import { getCoursesForOrgType }        from '@/lib/data/orgCourses'

// ── GET /api/members ──────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { ctx, error } = await requireOrgAdmin()
  if (error) return error

  const { searchParams } = req.nextUrl
  const search = searchParams.get('q')?.trim().toLowerCase() ?? ''
  const role   = searchParams.get('role') ?? ''    // '' | 'admin' | 'member'
  const status = searchParams.get('status') ?? ''  // '' | 'active' | 'invited' | 'inactive'
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit  = 20
  const offset = (page - 1) * limit

  const admin = createAdminClient()

  let query = admin
    .from('organization_members')
    .select(
      `id, email, full_name, role, status, invited_at, joined_at, created_at,
       profiles:user_id ( id, avatar_url, membership_tier )`,
      { count: 'exact' }
    )
    .eq('org_id', ctx.orgId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (role)   query = query.eq('role',   role)
  if (status) query = query.eq('status', status)
  if (search) {
    // Postgres ilike filter — safe server-side, never reaches RLS
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  const { data, error: fetchErr, count } = await query

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  }

  return NextResponse.json({
    members:     data ?? [],
    total:       count ?? 0,
    page,
    totalPages:  Math.ceil((count ?? 0) / limit),
    org: {
      id:        ctx.orgId,
      name:      ctx.orgName,
      type:      ctx.orgType,
      plan:      ctx.orgPlan,
      seatLimit: ctx.seatLimit,
      seatsUsed: ctx.seatsUsed,
    },
  })
}

// ── POST /api/members ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { ctx, error } = await requireOrgAdmin()
  if (error) return error

  // ── Parse + validate body ────────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Request body required' }, { status: 400 })
  }

  const { email, full_name, role = 'member', course_slugs = [] } =
    body as { email?: unknown; full_name?: unknown; role?: string; course_slugs?: unknown }

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email is required' }, { status: 400 })
  }
  const emailNorm = email.toLowerCase().trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }
  if (!['admin', 'member', 'educator', 'leader'].includes(String(role))) {
    return NextResponse.json({ error: 'invalid role: must be admin, member, educator, or leader' }, { status: 400 })
  }
  const nameNorm = typeof full_name === 'string' ? full_name.trim() : null

  // Validate course slugs — must belong to this org's type
  const slugArr: string[] = Array.isArray(course_slugs)
    ? course_slugs.filter((s): s is string => typeof s === 'string')
    : []
  const validSlugs = new Set(getCoursesForOrgType(ctx.orgType).map(c => c.slug))
  const badSlugs = slugArr.filter(s => !validSlugs.has(s))
  if (badSlugs.length) {
    return NextResponse.json({ error: `Invalid course slugs: ${badSlugs.join(', ')}` }, { status: 400 })
  }

  // ── Seat-limit check ──────────────────────────────────────────────────────
  if (ctx.seatsUsed >= ctx.seatLimit) {
    return NextResponse.json(
      {
        error: `Seat limit reached (${ctx.seatLimit} / ${ctx.seatLimit}). ` +
               'Upgrade your plan or contact support to increase your seat limit.',
      },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // ── Duplicate-in-org check ────────────────────────────────────────────────
  const { data: existing } = await admin
    .from('organization_members')
    .select('id, status')
    .eq('org_id', ctx.orgId)
    .eq('email',  emailNorm)
    .maybeSingle()

  if (existing) {
    const msg =
      existing.status === 'invited'
        ? 'An invite is already pending for this email. Use "Resend Invite" if needed.'
        : 'This email is already a member of your organization.'
    return NextResponse.json({ error: msg }, { status: 409 })
  }

  // ── Send Supabase invite email ─────────────────────────────────────────────
  let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
  // Bulletproof sanitization: remove quotes, remove ALL existing protocol prefixes, and trailing slashes
  appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
  if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
  // Re-apply protocol
  appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`

  const { data: inviteData, error: inviteErr } =
    await admin.auth.admin.inviteUserByEmail(emailNorm, {
      redirectTo: `${appUrl}/auth/callback?next=/dashboard`,
      data: {
        org_id:           ctx.orgId,
        institution_type: ctx.orgType,
        role,
        full_name:        nameNorm,
      },
    })

  // Handle "already registered" — the user exists in auth but isn't in this org yet.
  // We can still add them to the org without re-sending a duplicate invite.
  let userId: string | null = inviteData?.user?.id ?? null

  if (inviteErr) {
    const msg = inviteErr.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('already been registered')) {
      // Find the existing auth user by listing — acceptable for infrequent admin op
      const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const found = users.find(u => u.email === emailNorm)
      if (found) {
        userId = found.id
        // Re-check this user isn't already in the org under a different email casing
        const { data: profileCheck } = await admin
          .from('organization_members')
          .select('id')
          .eq('org_id',  ctx.orgId)
          .eq('user_id', found.id)
          .maybeSingle()
        if (profileCheck) {
          return NextResponse.json(
            { error: 'This user already belongs to your organization.' },
            { status: 409 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'This email is already registered on the platform.' },
          { status: 409 }
        )
      }
    } else {
      return NextResponse.json({ error: inviteErr.message }, { status: 500 })
    }
  }

  // ── Insert organization_members row ───────────────────────────────────────
  const { data: member, error: insertErr } = await admin
    .from('organization_members')
    .insert({
      org_id:     ctx.orgId,
      user_id:    userId,
      email:      emailNorm,
      full_name:  nameNorm,
      role,
      status:     'invited',
      invited_by: ctx.userId,
    })
    .select()
    .single()

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  // ── Side-effects ──────────────────────────────────────────────────────────
  // Increment seats_used
  await admin
    .from('organizations')
    .update({ seats_used: ctx.seatsUsed + 1 })
    .eq('id', ctx.orgId)

  // Link institution on the profile if user exists
  if (userId) {
    await admin
      .from('profiles')
      .update({
        institution_id:   ctx.orgId,
        institution_type: ctx.orgType,
        role,
      })
      .eq('id', userId)
  }

  // Grant course access
  if (slugArr.length > 0 && userId) {
    await admin
      .from('course_access')
      .upsert(
        slugArr.map(slug => ({
          user_id:        userId,
          institution_id: ctx.orgId,
          course_slug:    slug,
          granted_by:     ctx.userId,
        })),
        { onConflict: 'user_id,course_slug' }
      )
  }

  // ── Send branded onboarding email via Resend ────────────────────────────
  try {
    let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
    // Bulletproof sanitization: remove quotes, remove ALL existing protocol prefixes, and trailing slashes
    appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
    if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
    // Re-apply protocol
    appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`

    const { data: linkData } = await admin.auth.admin.generateLink({
      type: 'invite',
      email: emailNorm,
      options: { redirectTo: `${appUrl}/auth/reset-password` },
    })

    let setupUrl = `${appUrl}/auth/reset-password`
    if (linkData?.properties?.action_link) {
      setupUrl = `${appUrl}/auth/enroll?link=${encodeURIComponent(linkData.properties.action_link)}`
    }

    const courseNames = getCoursesForOrgType(ctx.orgType)
      .filter(c => slugArr.includes(c.slug))
      .map(c => c.name)

    await sendEmail({
      to:      emailNorm,
      subject: `You've been invited to join ${ctx.orgName} on Vibe Hyr`,
      html:    institutionInviteTemplate(
        nameNorm ?? emailNorm,
        ctx.orgName,
        role,
        setupUrl,
        courseNames
      ),
    })
  } catch (emailErr) {
    console.error('[api/members POST] Onboarding email failed:', emailErr)
  }

  // Audit log
  await admin.from('admin_audit_log').insert({
    admin_id:    ctx.userId,
    admin_email: '',
    action:      'MEMBER_INVITED',
    target_type: 'user',
    target_id:   userId,
    target_name: emailNorm,
    details:     `Invited as ${role} (${ctx.orgType}) to org ${ctx.orgName}; courses: ${slugArr.join(', ') || 'none'}`,
  })

  return NextResponse.json({ member }, { status: 201 })
}
