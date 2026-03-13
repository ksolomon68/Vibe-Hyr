'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { passwordResetTemplate } from '@/lib/email/templates'

type ActionResult = { success: boolean; error?: string }

// ── Auth helper ───────────────────────────────────────────────────────────────

async function requireSuperAdmin(): Promise<{ userId: string; email: string } | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_super_admin, email')
    .eq('id', user.id)
    .single()

  if (!profile?.is_super_admin) return null
  return { userId: user.id, email: profile.email }
}

async function logAudit(
  adminId: string, adminEmail: string,
  action: string, targetType: string,
  targetId: string | null, targetName: string | null, details: string | null
) {
  const admin = createAdminClient()
  await admin.from('admin_audit_log').insert({
    admin_id: adminId, admin_email: adminEmail,
    action, target_type: targetType,
    target_id: targetId, target_name: targetName, details,
  })
}

// ── Add User (Bypass) ─────────────────────────────────────────────────────────

export async function addBypassUser(data: {
  firstName: string; lastName: string; email: string
  institutionType: string; orgId: string | null
  membershipTier: string; courseAccess: string[]
  bypassReason: string; bypassExpiry: string | null
  bypassNotes: string; sendWelcomeEmail: boolean
}): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()

  // Create auth user (auto-confirm email)
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: data.email,
    email_confirm: true,
    user_metadata: { full_name: `${data.firstName} ${data.lastName}` },
  })
  if (authErr || !authData.user) return { success: false, error: authErr?.message ?? 'Failed to create user' }

  const userId = authData.user.id
  const expiryVal = data.bypassExpiry ? new Date(data.bypassExpiry).toISOString() : null

  // Upsert profile with bypass flags
  await admin.from('profiles').upsert({
    id: userId, email: data.email,
    full_name: `${data.firstName} ${data.lastName}`,
    membership_tier: data.membershipTier,
    institution_type: data.institutionType,
    org_id: data.orgId || null,
    is_bypassed: true,
    bypass_reason: data.bypassReason,
    bypass_expiry: expiryVal,
    bypass_notes: data.bypassNotes || null,
    bypass_added_by: sa.userId,
  })

  // Add to organization_members if org specified
  if (data.orgId) {
    await admin.from('organization_members').upsert({
      org_id: data.orgId, user_id: userId, role: 'member', is_active: true,
    }, { onConflict: 'org_id,user_id' })
  }

  // Insert explicit course access grants
  if (data.courseAccess.length > 0) {
    const grants = data.courseAccess.map(slug => ({
      user_id: userId,
      org_id: data.orgId || null,
      course_slug: slug,
      granted_by: sa.userId,
    }))
    await admin.from('course_access').upsert(grants, { onConflict: 'user_id,course_slug' })
  }

  await logAudit(sa.userId, sa.email, 'BYPASS_USER_ADDED', 'user', userId,
    `${data.firstName} ${data.lastName}`,
    `${data.membershipTier} · Reason: ${data.bypassReason} · Expiry: ${data.bypassExpiry ?? 'Never'}`
  )

  revalidatePath('/admin/super')
  return { success: true }
}

// ── Add Organization (Bypass) ─────────────────────────────────────────────────

export async function addBypassOrg(data: {
  name: string; segment: string; industry: string; website: string; domain: string
  adminFirstName: string; adminLastName: string; adminEmail: string
  tier: string; seats: number; courseAccess: string[]
  bypassReason: string; bypassExpiry: string | null; bypassNotes: string
  sendOnboarding: boolean
}): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const expiryVal = data.bypassExpiry ? new Date(data.bypassExpiry).toISOString() : null

  // Create organization
  const { data: org, error: orgErr } = await admin.from('organizations').insert({
    name: data.name,
    segment: data.segment,
    tier: data.tier,
    seats_purchased: data.seats,
    seats_used: 0,
    domain: data.domain || null,
    website: data.website || null,
    industry: data.industry || null,
    is_bypassed: true,
    bypass_reason: data.bypassReason,
    bypass_expiry: expiryVal,
    bypass_notes: data.bypassNotes || null,
    bypass_added_by: sa.userId,
    status: 'active',
    mrr: 0,
  }).select().single()

  if (orgErr || !org) return { success: false, error: orgErr?.message ?? 'Failed to create organization' }

  // Create admin user if email provided
  if (data.adminEmail) {
    const { data: authData } = await admin.auth.admin.createUser({
      email: data.adminEmail,
      email_confirm: true,
      user_metadata: { full_name: `${data.adminFirstName} ${data.adminLastName}` },
    })
    if (authData?.user) {
      const adminUserId = authData.user.id
      await admin.from('profiles').upsert({
        id: adminUserId, email: data.adminEmail,
        full_name: `${data.adminFirstName} ${data.adminLastName}`,
        membership_tier: data.tier, org_id: org.id,
        institution_type: data.segment === 'education' ? 'education' : 'business',
      })
      await admin.from('organization_members').insert({
        org_id: org.id, user_id: adminUserId, role: 'admin', is_active: true,
      })
      // Update org seats_used
      await admin.from('organizations').update({ seats_used: 1 }).eq('id', org.id)
    }
  }

  await logAudit(sa.userId, sa.email, 'BYPASS_ORG_CREATED', 'organization', org.id, data.name,
    `${data.tier} · ${data.seats} seats · Reason: ${data.bypassReason} · Expiry: ${data.bypassExpiry ?? 'Never'}`
  )

  revalidatePath('/admin/super')
  return { success: true }
}

// ── Revoke User Bypass ────────────────────────────────────────────────────────

export async function revokeUserBypass(userId: string, userEmail: string): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  await admin.from('profiles').update({
    is_bypassed: false, bypass_reason: null,
    bypass_expiry: null, bypass_notes: null, bypass_added_by: null,
  }).eq('id', userId)

  await logAudit(sa.userId, sa.email, 'BYPASS_USER_REVOKED', 'user', userId, userEmail, null)
  revalidatePath('/admin/super')
  return { success: true }
}

// ── Revoke Organization Bypass ────────────────────────────────────────────────

export async function revokeOrgBypass(orgId: string, orgName: string): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  await admin.from('organizations').update({
    is_bypassed: false, bypass_reason: null,
    bypass_expiry: null, bypass_notes: null, bypass_added_by: null,
    status: 'active',
  }).eq('id', orgId)

  await logAudit(sa.userId, sa.email, 'BYPASS_ORG_REVOKED', 'organization', orgId, orgName, 'Converted to pending payment')
  revalidatePath('/admin/super')
  return { success: true }
}

// ── Update Bypass Details ─────────────────────────────────────────────────────

export async function updateBypassDetails(
  targetType: 'user' | 'organization',
  targetId: string, targetName: string,
  data: { tier?: string; bypassReason: string; bypassExpiry: string | null }
): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const expiryVal = data.bypassExpiry ? new Date(data.bypassExpiry).toISOString() : null

  if (targetType === 'user') {
    await admin.from('profiles').update({
      membership_tier: data.tier, bypass_reason: data.bypassReason, bypass_expiry: expiryVal,
    }).eq('id', targetId)
  } else {
    await admin.from('organizations').update({
      tier: data.tier, bypass_reason: data.bypassReason, bypass_expiry: expiryVal,
    }).eq('id', targetId)
  }

  await logAudit(sa.userId, sa.email, 'BYPASS_UPDATED', targetType, targetId, targetName,
    `Reason: ${data.bypassReason} · Expiry: ${data.bypassExpiry ?? 'Never'}`
  )
  revalidatePath('/admin/super')
  return { success: true }
}

// ── Override Course Access (User) ─────────────────────────────────────────────

export async function overrideUserCourseAccess(
  userId: string, userName: string, courses: string[]
): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  await admin.from('course_access').delete().eq('user_id', userId)
  if (courses.length > 0) {
    await admin.from('course_access').insert(
      courses.map(slug => ({ user_id: userId, course_slug: slug, granted_by: sa.userId }))
    )
  }

  await logAudit(sa.userId, sa.email, 'COURSE_ACCESS_OVERRIDE', 'user', userId, userName,
    `Courses: ${courses.join(', ') || 'none'}`
  )
  revalidatePath('/admin/super')
  return { success: true }
}

// ── Override Course Access (Organization) ────────────────────────────────────

export async function overrideOrgCourseAccess(
  orgId: string, orgName: string, courses: string[]
): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  await admin.from('course_access').delete().eq('org_id', orgId)
  if (courses.length > 0) {
    await admin.from('course_access').insert(
      courses.map(slug => ({ org_id: orgId, course_slug: slug, granted_by: sa.userId }))
    )
  }

  await logAudit(sa.userId, sa.email, 'COURSE_ACCESS_OVERRIDE', 'organization', orgId, orgName,
    `Courses: ${courses.join(', ') || 'none'}`
  )
  revalidatePath('/admin/super')
  return { success: true }
}

// ── Update User Tier ──────────────────────────────────────────────────────────

export async function updateUserTier(userId: string, userName: string, tier: string): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  await admin.from('profiles').update({ membership_tier: tier }).eq('id', userId)
  await logAudit(sa.userId, sa.email, 'USER_TIER_CHANGED', 'user', userId, userName, `New tier: ${tier}`)
  revalidatePath('/admin/super')
  return { success: true }
}

// ── Deactivate User ───────────────────────────────────────────────────────────

export async function deactivateUser(userId: string, userName: string): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  // Mark as inactive in organization_members
  await admin.from('organization_members').update({ is_active: false }).eq('user_id', userId)
  // Push updated_at far back so dashboard shows as inactive
  await admin.from('profiles').update({ updated_at: new Date(0).toISOString() }).eq('id', userId)

  await logAudit(sa.userId, sa.email, 'USER_DEACTIVATED', 'user', userId, userName, null)
  revalidatePath('/admin/super')
  return { success: true }
}

// ── Update User Profile (name, email, tier, type, org) ────────────────────────

export async function updateUserProfile(
  userId: string,
  userName: string,
  data: { fullName: string; email: string; membershipTier: string; institutionType: string; orgId: string | null }
): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()

  // Update auth record (email)
  const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
    email: data.email,
    user_metadata: { full_name: data.fullName },
  })
  if (authErr) return { success: false, error: authErr.message }

  // Update profile row
  const { error: profileErr } = await admin.from('profiles').update({
    full_name: data.fullName,
    email: data.email,
    membership_tier: data.membershipTier,
    institution_type: data.institutionType,
    org_id: data.orgId || null,
  }).eq('id', userId)
  if (profileErr) return { success: false, error: profileErr.message }

  await logAudit(sa.userId, sa.email, 'USER_PROFILE_UPDATED', 'user', userId, userName,
    `Name: ${data.fullName} · Email: ${data.email} · Tier: ${data.membershipTier}`
  )
  revalidatePath('/admin/super')
  return { success: true }
}

// ── Admin: Set User Password Directly ────────────────────────────────────────

export async function adminSetUserPassword(
  userId: string, userName: string, newPassword: string
): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  if (newPassword.length < 8) return { success: false, error: 'Password must be at least 8 characters' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword })
  if (error) return { success: false, error: error.message }

  await logAudit(sa.userId, sa.email, 'USER_PASSWORD_RESET', 'user', userId, userName, 'Password set directly by super admin')
  return { success: true }
}

// ── Admin: Send Password Reset Email ─────────────────────────────────────────

export async function sendPasswordResetEmail(
  userId: string, userEmail: string, userName: string
): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com'

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: userEmail,
    options: { redirectTo: `${appUrl}/auth/callback?next=/auth/reset-password` },
  })
  if (error || !data?.properties?.action_link) {
    return { success: false, error: error?.message ?? 'Could not generate reset link' }
  }

  try {
    await sendEmail({
      to: userEmail,
      subject: 'Reset your Vibe Hyr password',
      html: passwordResetTemplate(data.properties.action_link),
    })
  } catch (e: any) {
    return { success: false, error: e.message ?? 'Failed to send email' }
  }

  await logAudit(sa.userId, sa.email, 'PASSWORD_RESET_EMAIL_SENT', 'user', userId, userName,
    `Reset link sent to ${userEmail}`)
  return { success: true }
}
