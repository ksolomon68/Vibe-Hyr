/**
 * /api/members/[id]/courses
 * ─────────────────────────────────────────────────────────────────────────────
 * GET  — returns the course slugs currently assigned to a member
 * PUT  — replaces the member's course assignments (full replace, not merge)
 *
 * Uses the course_access table: (user_id, institution_id, course_slug).
 * All operations use the service-role client and are scoped to the admin's org.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { requireOrgAdmin }           from '@/lib/supabase/requireOrgAdmin'
import { getCoursesForOrgType }      from '@/lib/data/orgCourses'

type RouteContext = { params: { id: string } }

// ── Shared: fetch member + cross-tenant guard ─────────────────────────────────

async function fetchMember(
  admin:    ReturnType<typeof createAdminClient>,
  memberId: string,
  orgId:    string
) {
  const { data, error } = await admin
    .from('organization_members')
    .select('id, user_id, email, full_name, org_id')
    .eq('id', memberId)
    .single()

  if (error || !data) {
    return { member: null, err: NextResponse.json({ error: 'Member not found' }, { status: 404 }) }
  }
  if (data.org_id !== orgId) {
    return { member: null, err: NextResponse.json({ error: 'Forbidden: cross-tenant access denied' }, { status: 403 }) }
  }
  return { member: data, err: null }
}

// ── GET /api/members/[id]/courses ─────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { ctx, error } = await requireOrgAdmin()
  if (error) return error

  const admin = createAdminClient()
  const { member, err } = await fetchMember(admin, params.id, ctx.orgId)
  if (err) return err
  if (!member.user_id) return NextResponse.json({ course_slugs: [] })

  const { data, error: fetchErr } = await admin
    .from('course_access')
    .select('course_slug')
    .eq('user_id',       member.user_id)
    .eq('institution_id', ctx.orgId)

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

  return NextResponse.json({ course_slugs: (data ?? []).map(r => r.course_slug) })
}

// ── PUT /api/members/[id]/courses ─────────────────────────────────────────────

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { ctx, error } = await requireOrgAdmin()
  if (error) return error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { course_slugs } = (body ?? {}) as { course_slugs?: unknown }
  if (!Array.isArray(course_slugs)) {
    return NextResponse.json({ error: 'course_slugs must be an array of strings' }, { status: 400 })
  }

  // Validate slugs belong to this org's type
  const validSlugs = new Set(getCoursesForOrgType(ctx.orgType).map(c => c.slug))
  const bad = course_slugs.filter(s => typeof s !== 'string' || !validSlugs.has(s))
  if (bad.length) {
    return NextResponse.json({ error: `Invalid course slugs: ${bad.join(', ')}` }, { status: 400 })
  }

  const admin = createAdminClient()
  const { member, err } = await fetchMember(admin, params.id, ctx.orgId)
  if (err) return err

  if (!member.user_id) {
    return NextResponse.json({ error: 'Member has no linked auth user yet (still pending invite)' }, { status: 400 })
  }

  // Full replace: delete existing, insert new
  await admin
    .from('course_access')
    .delete()
    .eq('user_id',       member.user_id)
    .eq('institution_id', ctx.orgId)

  if (course_slugs.length > 0) {
    const { error: insertErr } = await admin
      .from('course_access')
      .insert(
        course_slugs.map(slug => ({
          user_id:        member.user_id,
          institution_id: ctx.orgId,
          course_slug:    slug,
          granted_by:     ctx.userId,
        }))
      )
    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }
  }

  // Audit log
  await admin.from('admin_audit_log').insert({
    admin_id:    ctx.userId,
    admin_email: '',
    action:      'MEMBER_COURSES_UPDATED',
    target_type: 'user',
    target_id:   member.user_id,
    target_name: member.email,
    details:     `Assigned courses: ${course_slugs.join(', ') || 'none'}`,
  })

  return NextResponse.json({ course_slugs })
}
