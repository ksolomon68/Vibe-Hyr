'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { bypassWelcomeTemplate, institutionInviteTemplate, passwordResetTemplate } from '@/lib/email/templates'
import { BYPASS_ROLES } from '@/lib/constants/bypassRoles'

type ActionResult = { success: boolean; error?: string; warning?: string }

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
  vertical: string; orgId: string | null
  membershipTier: string; role: string; courseAccess: string[]
  bypassReason: string; bypassExpiry: string | null
  bypassNotes: string; sendWelcomeEmail: boolean
}): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()

  // Create user in Supabase Auth
  let userId: string
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: data.email,
    email_confirm: true,
    user_metadata: { full_name: `${data.firstName} ${data.lastName}` },
  })

  if (authErr) {
    if (authErr.message.toLowerCase().includes('already registered') || authErr.message.toLowerCase().includes('already exists')) {
      // PERF: listUsers() is a major performance bottleneck that causes 504 timeouts.
      // We lookup the ID from the profiles table instead, which is indexed by email.
      const { data: existing, error: pErr } = await admin
        .from('profiles')
        .select('id')
        .eq('email', data.email.toLowerCase().trim())
        .maybeSingle()
      
      if (pErr) return { success: false, error: `User ID lookup failed: ${pErr.message}` }
      if (!existing) return { success: false, error: 'User exists in Auth but no profile was found.' }
      userId = existing.id
    } else {
      return { success: false, error: authErr.message }
    }
  } else {
    userId = authData.user!.id
  }

  const membershipTypeMap: Record<string, string> = {
    individual: 'personal', education: 'education',
    business: 'business', leadership: 'leadership',
  }

  // Upsert profile with bypass flags
  const { error: upsertErr } = await admin.from('profiles').upsert({
    id: userId, email: data.email,
    full_name: `${data.firstName} ${data.lastName}`,
    membership_tier: data.membershipTier,
    vertical: data.vertical,
    membership_type: membershipTypeMap[data.vertical] ?? 'personal',
    org_id: data.orgId || null,
    role: data.role,
    is_bypassed: true,
    bypass_reason: data.bypassReason,
    bypass_expiry: data.bypassExpiry ? new Date(data.bypassExpiry).toISOString() : null,
    bypass_notes: data.bypassNotes || null,
    bypass_added_by: sa.userId,
  })

  if (upsertErr) {
    return { success: false, error: upsertErr.message }
  }

  // Add to organization_members if org specified
  if (data.orgId) {
    await admin.from('organization_members').upsert({
      org_id: data.orgId, user_id: userId,
      email: data.email,
      full_name: `${data.firstName} ${data.lastName}`,
      role: 'member', status: 'active',
    }, { onConflict: 'org_id,email' })
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

  // Send welcome email with password-setup link if requested
  if (data.sendWelcomeEmail) {
    try {
      let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
      // Bulletproof sanitization: remove quotes, remove ALL existing protocol prefixes, and trailing slashes
      appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
      if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
      // Re-apply protocol
      appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`
      
      const { data: linkData, error: lErr } = await admin.auth.admin.generateLink({
        type: 'recovery',
        email: data.email,
        options: { redirectTo: `${appUrl}/auth/reset-password` },
      })

      if (lErr) console.warn('[addBypassUser] generateLink error:', lErr)

      let setupUrl = `${appUrl}/auth/reset-password`
      if (linkData?.properties?.action_link) {
        setupUrl = `${appUrl}/auth/enroll?link=${encodeURIComponent(linkData.properties.action_link)}`
      }
      
      const fullName = `${data.firstName} ${data.lastName}`
      await sendEmail({
        to: data.email,
        subject: 'Your Vibe Hyr account is ready',
        html: bypassWelcomeTemplate(fullName, data.membershipTier, setupUrl),
      })
      console.log('[addBypassUser] Welcome email sent to:', data.email)
    } catch (err: any) {
      console.error('[addBypassUser] email failure:', err.message)
    }
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
  name: string; vertical: string; website: string; domain: string
  adminFirstName: string; adminLastName: string; adminEmail: string
  tier: string; seats: number; bypassPayment: boolean
  bypassReason: string; bypassExpiry: string | null; bypassNotes: string
  sendOnboarding: boolean
}): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const expiryVal = data.bypassExpiry ? new Date(data.bypassExpiry).toISOString() : null

  // 1a. Pre-flight duplicate check — give a clear user-facing error if the name is taken.
  // This runs before the insert so we never silently merge into an existing org.
  const { data: existingOrg } = await admin
    .from('organizations')
    .select('id')
    .eq('name', data.name)
    .maybeSingle()

  if (existingOrg) {
    return { success: false, error: 'An organization with this name already exists. Please use a unique name.' }
  }

  // 1b. Insert organization — the upsert on 'name' is a server-side backstop
  // in case of an extremely rare race condition between two near-simultaneous requests.
  const { data: org, error: orgErr } = await admin.from('organizations').upsert({
    name: data.name,
    vertical: data.vertical,
    content_tier: data.tier,
    segment: data.vertical,
    type: data.vertical,
    plan: data.tier,
    tier: data.tier,
    seats_purchased: data.seats,
    seat_limit: data.seats,
    seats_used: 1, // Pre-allocate the admin seat
    domain: data.domain || null,
    status: 'active',
    is_bypassed: data.bypassPayment,
    bypass_reason: data.bypassPayment ? data.bypassReason : null,
    bypass_expiry: data.bypassPayment ? expiryVal : null,
  }, { onConflict: 'name', ignoreDuplicates: false }).select().single()

  if (orgErr || !org) return { success: false, error: `[Step 1] ${orgErr?.message ?? 'Failed to create organization'}` }

  // 2. Handle Admin User Creation/Retrieval
  let adminUserId: string | null = null

  // Try to create the user
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: data.adminEmail,
    email_confirm: true,
    user_metadata: { full_name: `${data.adminFirstName} ${data.adminLastName}` },
  })

  if (authErr) {
    if (authErr.message.toLowerCase().includes('already registered') || authErr.message.toLowerCase().includes('already exists')) {
      // PERF: Do NOT use listUsers() here. It's extremely slow and causes 504 timeouts.
      // Lookup the ID directly from the profiles table which is indexed by email.
      const { data: p, error: pErr } = await admin
        .from('profiles')
        .select('id')
        .eq('email', data.adminEmail.toLowerCase().trim())
        .maybeSingle()
      
      if (pErr) return { success: false, error: `[Step 2] User lookup failed: ${pErr.message}` }
      adminUserId = p?.id || null
    } else {
      return { success: false, error: `[Step 2] Auth Error: ${authErr.message}` }
    }
  } else {
    adminUserId = authData.user!.id
  }

  if (!adminUserId) return { success: false, error: '[Step 2] Could not create or find admin user ID.' }

  // 3. Upsert Profile & Link to Org
  // IMPORTANT: role must be 'admin' — 'institution_admin' was removed in 20260419_unify_admin_role.sql
  // For leadership vertical, use 'leader'. All other org admins use 'admin'.
  const adminRole = data.vertical === 'leadership' ? 'leader' : 'admin'

  // membership_type = the VERTICAL (education/business/leadership) — used by RLS policies
  // membership_tier = the ACCESS TIER (free/architect/elite)
  // Both must be set explicitly. The old sync trigger was writing the tier value into
  // membership_type which conflicts with the RLS policy expectations.
  const { error: profileErr } = await admin.from('profiles').upsert({
    id: adminUserId,
    email: data.adminEmail,
    full_name: `${data.adminFirstName} ${data.adminLastName}`,
    membership_tier: data.tier,       // e.g. 'elite'
    membership_type: data.vertical,   // e.g. 'education' — vertical identifier for RLS
    vertical: data.vertical,          // e.g. 'education' — standardized column
    org_id: org.id,
    role: adminRole,
    is_bypassed: data.bypassPayment,
  }, { onConflict: 'id' })

  if (profileErr) return { success: false, error: `[Step 3 - Profile] ${profileErr.message}` }

  // 4. Add to organization_members — explicit check → insert/update pattern.
  //    Avoids onConflict entirely (which requires a named unique constraint that
  //    may not exist depending on which migrations have been applied to the live DB).
  const { data: existingMember } = await admin
    .from('organization_members')
    .select('id')
    .eq('org_id', org.id)
    .eq('email', data.adminEmail)
    .maybeSingle()

  if (existingMember) {
    // Row already exists (prior invite or duplicate call) — update it in place
    const { error: memUpdateErr } = await admin
      .from('organization_members')
      .update({
        user_id: adminUserId,
        full_name: `${data.adminFirstName} ${data.adminLastName}`,
        role: 'admin',
        status: 'active',
        joined_at: new Date().toISOString(),
      })
      .eq('id', existingMember.id)
    if (memUpdateErr) return { success: false, error: `[Step 4 - Member Update] ${memUpdateErr.message}` }
  } else {
    // Brand new row — insert fresh
    const { error: memInsertErr } = await admin
      .from('organization_members')
      .insert({
        org_id: org.id,
        user_id: adminUserId,
        email: data.adminEmail,
        full_name: `${data.adminFirstName} ${data.adminLastName}`,
        role: 'admin',
        status: 'active',
        joined_at: new Date().toISOString(),
      })
    if (memInsertErr) return { success: false, error: `[Step 4 - Member Insert] ${memInsertErr.message}` }
  }

  // 5. Grant Course Access based on BYPASS_ROLES
  const defaultRole = BYPASS_ROLES.find(r => r.vertical === data.vertical && r.membership_tier === data.tier)
  if (defaultRole && defaultRole.access.length > 0) {
    const grants = defaultRole.access.map(slug => ({
      user_id: adminUserId,
      org_id: org.id,
      course_slug: slug,
      granted_by: sa.userId,
    }))
    await admin.from('course_access').upsert(grants, { onConflict: 'user_id,course_slug' })
  }

  // 6. Send Onboarding Email — runs AFTER all DB steps succeed
  let emailStatus = 'not_sent'
  if (data.sendOnboarding) {
    try {
      let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
      appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
      if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
      appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`

      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: 'recovery',
        email: data.adminEmail,
        options: { redirectTo: `${appUrl}/auth/reset-password` },
      })
      if (linkErr) {
        console.error('[addBypassOrg] generateLink failed:', linkErr.message)
      }

      const setupUrl = linkData?.properties?.action_link
        ? `${appUrl}/auth/enroll?link=${encodeURIComponent(linkData.properties.action_link)}`
        : `${appUrl}/auth/login`

      await sendEmail({
        to: data.adminEmail,
        subject: `Welcome to ${data.name} on Vibe Hyr`,
        html: institutionInviteTemplate(`${data.adminFirstName} ${data.adminLastName}`, data.name, adminRole, setupUrl),
      })
      emailStatus = 'sent'
    } catch (emailErr: any) {
      // Non-fatal: org + admin created successfully. Surface the error in the success message.
      emailStatus = `failed: ${emailErr?.message ?? 'unknown error'}`
      console.error('[addBypassOrg] Onboarding email failed:', emailErr?.message)
    }
  }

  await logAudit(sa.userId, sa.email, 'ORG_CREATED', 'organization', org.id,
    data.name,
    `Vertical: ${data.vertical} · Tier: ${data.tier} · Admin: ${data.adminEmail} · Bypass: ${data.bypassPayment} · Email: ${emailStatus}`
  )

  revalidatePath('/admin/super')
  return {
    success: true,
    ...(emailStatus.startsWith('failed') && {
      warning: `Organization and admin created successfully, but the welcome email could not be sent (${emailStatus}). You may need to manually notify the admin.`
    }),
  }
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

// ── Delete Organization (Hard Delete) ───────────────────────────────────────────

export async function deleteOrganization(
  orgId: string, orgName: string
): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()

  // 1. Fetch all associated user IDs to perform a clean sweep from Auth
  // (Profiles will cascade delete automatically once the Auth user is gone)
  const { data: members } = await admin.from('organization_members').select('user_id').eq('org_id', orgId)
  const { data: profiles } = await admin.from('profiles').select('id').eq('org_id', orgId)
  
  const userIds = new Set<string>()
  members?.forEach(m => { if (m.user_id) userIds.add(m.user_id) })
  profiles?.forEach(p => userIds.add(p.id))

  // 2. Delete each user account from Supabase Auth (Hard delete)
  const deletionResults = await Promise.allSettled(
    Array.from(userIds).map(async (uid) => {
      if (uid === sa.userId) return // Safety: never delete the super admin performing the action
      const { error } = await admin.auth.admin.deleteUser(uid)
      if (error) throw error
    })
  )

  const failedCount = deletionResults.filter(r => r.status === 'rejected').length
  if (failedCount > 0) {
    console.warn(`[deleteOrganization] Cleanup partially failed: ${failedCount} users could not be deleted from Auth.`)
  }

  // 3. Delete the organization record (triggers DB cascades for metadata)
  const { error: orgDelErr } = await admin.from('organizations').delete().eq('id', orgId)
  if (orgDelErr) return { success: false, error: orgDelErr.message }

  await logAudit(sa.userId, sa.email, 'ORGANIZATION_DELETED', 'organization', orgId, orgName, 
    `Permanent deletion: Organization and all associated user accounts wiped.`)
  
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
  data: { fullName: string; email: string; membershipTier: string; vertical: string; orgId: string | null; courses?: string[] }
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
    vertical: data.vertical,
    org_id: data.orgId || null,
  }).eq('id', userId)
  if (profileErr) return { success: false, error: profileErr.message }

  // Auto-sync course access with the selected vertical and tier
  await admin.from('course_access').delete().eq('user_id', userId)
  const defaultRole = BYPASS_ROLES.find(r => r.vertical === data.vertical && r.membership_tier === data.membershipTier)
  if (defaultRole && defaultRole.access.length > 0) {
    await admin.from('course_access').insert(
      defaultRole.access.map(slug => ({ user_id: userId, course_slug: slug, granted_by: sa.userId }))
    )
  }

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

// ── Delete User (Hard Delete) ─────────────────────────────────────────────────

export async function deleteUser(
  targetId: string,
  targetName: string,
): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }
  if (sa.userId === targetId) return { success: false, error: 'You cannot delete yourself.' }

  const admin = createAdminClient()
  const { error: deleteErr } = await admin.auth.admin.deleteUser(targetId)
  if (deleteErr) return { success: false, error: deleteErr.message }

  // Belt-and-suspenders: clean up profile row if cascade didn't fire
  await admin.from('profiles').delete().eq('id', targetId)

  await logAudit(sa.userId, sa.email, 'USER_DELETED', 'user', targetId, targetName,
    'Hard deleted user account and all associated data')
  revalidatePath('/admin/super')
  return { success: true }
}

// ── Invite Regular User (non-bypass) ─────────────────────────────────────────

export async function inviteUserBySuperAdmin(data: {
  email: string
  role: string
  vertical: string
  orgId: string | null
  membershipTier: string
}): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin  = createAdminClient()
  let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
  // Bulletproof sanitization: remove quotes, remove ALL existing protocol prefixes, and trailing slashes
  appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
  if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
  // Re-apply protocol
  appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    data.email,
    {
      redirectTo: `${appUrl}/auth/callback?next=/auth/reset-password`,
      data: {
        org_id:           data.orgId,
        vertical:         data.vertical,
        role:             data.role,
        membership_tier:  data.membershipTier,
      },
    }
  )

  if (inviteError) {
    const msg = inviteError.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('already been registered'))
      return { success: false, error: 'This email is already registered on the platform.' }
    return { success: false, error: inviteError.message }
  }

  if (inviteData?.user) {
    const mtMap: Record<string, string> = {
      individual: 'personal', education: 'education',
      business: 'business', leadership: 'leadership',
    }
    await admin.from('profiles').upsert(
      {
        id:               inviteData.user.id,
        email:            data.email,
        org_id:           data.orgId,
        vertical:         data.vertical,
        membership_type:  mtMap[data.vertical] ?? 'personal',
        role:             data.role,
        membership_tier:  data.membershipTier,
      },
      { onConflict: 'id' }
    )
  }

  // Send branded invite email
  try {
    const { data: linkData } = await admin.auth.admin.generateLink({
      type: 'invite',
      email: data.email,
      options: { redirectTo: `${appUrl}/auth/reset-password` },
    })
    let setupUrl = `${appUrl}/auth/reset-password`
    if (linkData?.properties?.action_link) {
      setupUrl = `${appUrl}/auth/enroll?link=${encodeURIComponent(linkData.properties.action_link)}`
    }
    await sendEmail({
      to: data.email,
      subject: "You've been invited to Vibe Hyr",
      html: institutionInviteTemplate(data.email, 'Vibe Hyr', data.role, setupUrl),
    })
  } catch (emailErr) {
    console.error('[inviteUserBySuperAdmin] Invite email failed:', emailErr)
  }

  await logAudit(sa.userId, sa.email, 'USER_INVITED', 'user',
    inviteData?.user?.id ?? null, data.email,
    `Invited as ${data.role} (${data.vertical}), tier: ${data.membershipTier}`)
  revalidatePath('/admin/super')
  return { success: true }
}

// ── Admin: Send Password Reset Email ─────────────────────────────────────────

export async function sendPasswordResetEmail(
  userId: string, userEmail: string, userName: string
): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
  // Bulletproof sanitization: remove quotes, remove ALL existing protocol prefixes, and trailing slashes
  appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
  if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
  // Re-apply protocol
  appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: userEmail,
    options: {
      redirectTo: `${appUrl}/auth/reset-password`,
    },
  })

  if (linkError) {
    return { success: false, error: linkError.message ?? 'Could not generate reset link' }
  }

  let resetLink = linkData.properties?.action_link
  if (resetLink) {
    // Wrap in branded enrollment link for consistency
    resetLink = `${appUrl}/auth/enroll?link=${encodeURIComponent(resetLink)}`
  }

  try {
    await sendEmail({
      to: userEmail,
      subject: 'Reset your Vibe Hyr password',
      html: passwordResetTemplate(resetLink || ''),
    })
  } catch (emailErr: any) {
    console.error('[sendPasswordResetEmail] Branding failed:', emailErr)
    return { success: false, error: 'Failed to send branded reset email' }
  }

  await logAudit(sa.userId, sa.email, 'PASSWORD_RESET_EMAIL_SENT', 'user', userId, userName,
    `Reset email triggered to ${userEmail}`)
  return { success: true }
}

// ── Update Org Admin (email / name) ──────────────────────────────────────────

export async function updateOrgAdmin(
  orgId: string,
  orgName: string,
  data: { email: string; fullName: string }
): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const emailNorm = data.email.toLowerCase().trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    return { success: false, error: 'Invalid email address.' }
  }

  const admin = createAdminClient()

  // Find the current org admin — check organization_members first, then profiles fallback
  let adminUserId: string | null = null

  const { data: adminMember } = await admin
    .from('organization_members')
    .select('user_id')
    .eq('org_id', orgId)
    .eq('role', 'admin')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (adminMember?.user_id) {
    adminUserId = adminMember.user_id
  } else {
    // Legacy: admin created before organization_members was populated — look in profiles
    const { data: profileAdmin } = await admin
      .from('profiles')
      .select('id')
      .eq('org_id', orgId)
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle()
    if (profileAdmin) adminUserId = profileAdmin.id
  }

  if (!adminUserId) {
    return { success: false, error: 'No admin found for this organization.' }
  }

  const nameNorm = data.fullName.trim()

  // Update Supabase Auth record
  const authPayload: Record<string, unknown> = { email: emailNorm }
  if (nameNorm) authPayload.user_metadata = { full_name: nameNorm }
  const { error: authErr } = await admin.auth.admin.updateUserById(adminUserId, authPayload)
  if (authErr) return { success: false, error: authErr.message }

  // Update profile row
  const profileUpdates: Record<string, unknown> = { email: emailNorm }
  if (nameNorm) profileUpdates.full_name = nameNorm
  await admin.from('profiles').update(profileUpdates).eq('id', adminUserId)

  // Update organization_members row
  const memberUpdates: Record<string, unknown> = { email: emailNorm }
  if (nameNorm) memberUpdates.full_name = nameNorm
  await admin.from('organization_members').update(memberUpdates)
    .eq('org_id', orgId).eq('user_id', adminUserId)

  await logAudit(sa.userId, sa.email, 'ORG_ADMIN_UPDATED', 'organization', orgId, orgName,
    `Admin updated: email=${emailNorm}${nameNorm ? ` · name=${nameNorm}` : ''}`)

  revalidatePath('/admin/super')
  return { success: true }
}

// ── Update Organization Complete ──────────────────────────────────────────────

export async function updateOrganizationComplete(
  orgId: string,
  data: {
    orgName: string
    vertical: string
    tier: string
    adminEmail: string
    adminFullName: string
    courses: string[]
  }
): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const emailNorm = data.adminEmail.toLowerCase().trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    return { success: false, error: 'Invalid email address.' }
  }

  const admin = createAdminClient()

  // 1. Update Organization (vertical, tier, name)
  const { error: orgErr } = await admin.from('organizations').update({
    name: data.orgName,
    vertical: data.vertical,
    type: data.vertical,
    segment: data.vertical,
    tier: data.tier,
    plan: data.tier,
    content_tier: data.tier,
  }).eq('id', orgId)

  if (orgErr) return { success: false, error: 'Failed to update organization details: ' + orgErr.message }

  // 2. Find Admin and Update
  let adminUserId: string | null = null
  const { data: adminMember } = await admin
    .from('organization_members')
    .select('user_id')
    .eq('org_id', orgId)
    .eq('role', 'admin')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (adminMember?.user_id) {
    adminUserId = adminMember.user_id
  } else {
    const { data: profileAdmin } = await admin
      .from('profiles')
      .select('id')
      .eq('org_id', orgId)
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle()
    if (profileAdmin) adminUserId = profileAdmin.id
  }

  if (adminUserId) {
    // Update Supabase Auth record
    const nameNorm = data.adminFullName.trim()
    const { error: authErr } = await admin.auth.admin.updateUserById(adminUserId, {
      email: emailNorm,
      user_metadata: { full_name: nameNorm }
    })
    
    if (!authErr) {
      // Update profile
      await admin.from('profiles').update({
        email: emailNorm,
        full_name: nameNorm,
        membership_tier: data.tier,
        vertical: data.vertical,
      }).eq('id', adminUserId)

      // Update organization_members row
      await admin.from('organization_members').update({
        email: emailNorm,
        full_name: nameNorm,
      }).eq('org_id', orgId).eq('user_id', adminUserId)
    }
  }

  // 3. Update Course Access for Organization using BYPASS_ROLES
  await admin.from('course_access').delete().eq('org_id', orgId)
  
  const defaultRole = BYPASS_ROLES.find(r => r.vertical === data.vertical && r.membership_tier === data.tier)
  if (defaultRole && defaultRole.access.length > 0) {
    const grants = defaultRole.access.map(slug => ({
      org_id: orgId,
      course_slug: slug,
      granted_by: sa.userId
    }))
    await admin.from('course_access').insert(grants)
    
    if (adminUserId) {
      const adminGrants = defaultRole.access.map(slug => ({
        user_id: adminUserId,
        org_id: orgId,
        course_slug: slug,
        granted_by: sa.userId
      }))
      await admin.from('course_access').upsert(adminGrants, { onConflict: 'user_id,course_slug' })
    }
  }

  await logAudit(sa.userId, sa.email, 'ORG_FULL_UPDATED', 'organization', orgId, data.orgName,
    `Updated vertical=${data.vertical}, tier=${data.tier}, admin_email=${emailNorm}, courses=${data.courses.length}`)

  revalidatePath('/admin/super')
  return { success: true }
}

// ── Validate Org Admin Email ──────────────────────────────────────────────────

export async function validateOrgAdminEmail(
  email: string
): Promise<{
  valid: boolean
  error?: string
  warning?: string
  userId?: string
  existingOrgId?: string
  existingOrgName?: string
}> {
  const sa = await requireSuperAdmin()
  if (!sa) return { valid: false, error: 'Unauthorized' }

  const emailNorm = email.toLowerCase().trim()
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('id, is_super_admin, org_id, organizations(name)')
    .eq('email', emailNorm)
    .maybeSingle()

  if (!profile) {
    return {
      valid: true,
      warning: 'This email is not registered yet. A new account will be created.',
    }
  }

  if (profile.is_super_admin) {
    return { valid: false, error: 'Super admins cannot be assigned as org admins.' }
  }

  if (profile.org_id) {
    const orgName = (profile.organizations as any)?.name ?? 'another organization'
    return {
      valid: true,
      warning: `This user is already assigned to ${orgName}. Proceeding will move them to this organization.`,
      userId: profile.id,
      existingOrgId: profile.org_id,
      existingOrgName: orgName,
    }
  }

  return { valid: true, userId: profile.id }
}

// ══════════════════════════════════════════════════════════════════════════════
// COURSE CMS ACTIONS
// ══════════════════════════════════════════════════════════════════════════════

export type CmsLesson = {
  id: string
  course_id: number
  title: string
  type: 'video' | 'text' | 'header'
  youtube_url: string | null
  content: string | null
  sort_order: number
  is_published: boolean
  is_preview: boolean
  created_at: string
  updated_at: string
}


// ── List lessons for a course ─────────────────────────────────────────────────

export async function listCourseLessons(
  courseId: number
): Promise<{ success: boolean; lessons: CmsLesson[]; error?: string }> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, lessons: [], error: 'Unauthorized' }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('course_lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true })

  if (error) return { success: false, lessons: [], error: error.message }
  return { success: true, lessons: (data ?? []) as CmsLesson[] }
}

// ── Upsert a lesson ───────────────────────────────────────────────────────────

// ── Helpers ──────────────────────────────────────────────────────────────────
function sanitizeHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip <script> tags
    .replace(/on\w+="[^"]*"/gi, '') // Strip onmouseover="..." etc
    .replace(/on\w+='[^']*'/gi, '') // Strip onmouseover='...' etc
    .replace(/javascript:/gi, '')   // Strip javascript: protocols
}

export async function upsertLesson(lesson: {
  id?: string
  course_id: number
  title: string
  type: 'video' | 'text' | 'header'
  youtube_url?: string | null
  content?: string | null
  sort_order: number
  is_published: boolean
  is_preview: boolean
}): Promise<ActionResult & { id?: string }> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const title = lesson.title.trim()
  if (!title) return { success: false, error: 'Title is required.' }

  if (lesson.type === 'video') {
    const url = lesson.youtube_url?.trim() ?? ''
    if (!url) return { success: false, error: 'Video URL or ID is required for video lessons.' }
    // We now allow IDs or non-YT URLs for Cloudflare Stream support
  }

  const admin = createAdminClient()
  const payload: Record<string, unknown> = {
    course_id:   lesson.course_id,
    title,
    type:        lesson.type,
    // Preserve both fields independently — don't null one when switching types.
    // The lesson type controls which field the player renders, not which is stored.
    youtube_url: lesson.youtube_url?.trim() ?? null,
    content:     lesson.content ? sanitizeHtml(lesson.content) : null,
    sort_order:  lesson.sort_order,
    is_published: lesson.is_published,
    is_preview:   lesson.is_preview,
    updated_at:  new Date().toISOString(),
  }
  if (lesson.id) payload.id = lesson.id

  const { data, error } = await admin
    .from('course_lessons')
    .upsert(payload, { onConflict: 'id' })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  const action = lesson.id ? 'LESSON_UPDATED' : 'LESSON_CREATED'
  await logAudit(sa.userId, sa.email, action, 'lesson', data?.id ?? '', title,
    `Course ${lesson.course_id} — ${lesson.type}`)

  revalidatePath('/admin/super')
  return { success: true, id: data?.id }
}

// ── Delete a lesson ───────────────────────────────────────────────────────────

export async function deleteCmsLesson(id: string): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const { error } = await admin.from('course_lessons').delete().eq('id', id)

  if (error) return { success: false, error: error.message }

  await logAudit(sa.userId, sa.email, 'LESSON_DELETED', 'lesson', id, id, '')
  revalidatePath('/admin/super')
  return { success: true }
}

// ── Reorder lessons (batch sort_order update) ─────────────────────────────────

export async function reorderLessons(
  items: { id: string; sort_order: number }[]
): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('course_lessons')
    .upsert(
      items.map(item => ({ id: item.id, sort_order: item.sort_order, updated_at: new Date().toISOString() })),
      { onConflict: 'id' }
    )

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ── Sync Leadership courses from curriculum into course_lessons ───────────────

export async function syncLeadershipCourses(
  force = false
): Promise<ActionResult & { seeded: number }> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized', seeded: 0 }

  const { COURSES } = await import('@/lib/leadership/curriculum')
  const { LESSON_EXPANSIONS } = await import('@/lib/leadership/curriculum-expanded')
  const admin = createAdminClient()

  // course_id mapping: leadership_course_N → integer 12 + N
  const COURSE_ID_MAP: Record<string, number> = {
    leadership_course_1: 13,
    leadership_course_2: 14,
    leadership_course_3: 15,
    leadership_course_4: 16,
  }

  let seeded = 0

  for (const course of COURSES) {
    const courseId = COURSE_ID_MAP[course.id]
    if (!courseId) continue

    const lessons = course.lessons.map((lesson, index) => {
      const exp = LESSON_EXPANSIONS[lesson.id]

      // ── Rich HTML content assembled from base curriculum + expansion fields ──
      const content = [
        // Opening description
        `<p>${lesson.description}</p>`,

        // Deep dive (3 paragraphs of expanded instruction) — from expansion
        exp?.deepDive ?? '',

        // Key Insight callout
        exp?.keyInsight
          ? `<blockquote><strong>Key Insight:</strong> ${exp.keyInsight}</blockquote>`
          : '',

        // Key Concepts
        `<h2>Key Concepts</h2>`,
        `<ul>${lesson.keyConcepts.map(c => `<li>${c}</li>`).join('\n')}</ul>`,

        // Neuroscience Anchor
        `<h2>Neuroscience Anchor</h2>`,
        `<p>${lesson.neuroscienceAnchor}</p>`,

        // Law Anchor
        `<h2>The Law in Action</h2>`,
        `<p>${lesson.lawAnchor}</p>`,

        // Practical Application — from expansion
        exp?.practicalApplication
          ? `<h2>Practical Application</h2><p>${exp.practicalApplication}</p>`
          : '',

        // Reflection Prompts — from expansion
        exp?.reflectionPrompts?.length
          ? `<h2>Reflection Prompts</h2><ul>${exp.reflectionPrompts.map(p => `<li>${p}</li>`).join('\n')}</ul>`
          : '',

        // Weekly Challenge — from expansion
        exp?.weeklyChallenge
          ? `<h2>This Week's Challenge</h2><p>${exp.weeklyChallenge}</p>`
          : '',
      ].filter(Boolean).join('\n')

      return {
        course_id:    courseId,
        title:        lesson.title,
        type:         'text' as const,
        youtube_url:  null,
        content:      sanitizeHtml(content),
        sort_order:   index + 1,
        is_published: true,
        is_preview:   index === 0,
        created_at:   new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      }
    })

    // When force=true, delete existing lessons and reseed with expanded content.
    // When force=false, only seed if the course has no lessons yet.
    const { count } = await admin
      .from('course_lessons')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId)

    if ((count ?? 0) > 0) {
      if (!force) continue
      // Delete existing rows so we can reinsert with the expanded content
      const { error: delErr } = await admin
        .from('course_lessons')
        .delete()
        .eq('course_id', courseId)
      if (delErr) {
        console.error(`[syncLeadershipCourses] Delete failed for course ${courseId}:`, delErr)
        continue
      }
    }

    const { error } = await admin.from('course_lessons').insert(lessons)
    if (error) {
      console.error(`[syncLeadershipCourses] Insert failed for course ${courseId}:`, error)
      continue
    }
    seeded += lessons.length
  }

  await logAudit(sa.userId, sa.email, 'LEADERSHIP_COURSES_SYNCED', 'course', null, null,
    `Seeded/updated ${seeded} lessons across leadership courses (force=${force})`)

  revalidatePath('/admin/super')
  return { success: true, seeded }
}

// ── Sync Business courses from curriculum into course_lessons ─────────────────

export async function syncBusinessCourses(
  force = false
): Promise<ActionResult & { seeded: number }> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized', seeded: 0 }

  const { TRACKS } = await import('@/lib/business/curriculum')
  const { LESSON_EXPANSIONS } = await import('@/lib/business/curriculum-expanded')
  const admin = createAdminClient()

  // course_id mapping: track.id → integer
  const COURSE_ID_MAP: Record<string, number> = {
    'common-sense-in-the-workplace': 5,
    'from-reaction-to-response':     6,
    'know-yourself-lead-yourself':   7,
    'the-high-frequency-team':       8,
  }

  let seeded = 0

  for (const track of TRACKS) {
    const courseId = COURSE_ID_MAP[track.id]
    if (!courseId) continue

    const lessons = track.lessons
      .filter(lesson => !lesson.isLive) // skip live sessions
      .map((lesson, index) => {
        const exp = LESSON_EXPANSIONS[lesson.id]

        const content = [
          `<p>${lesson.description}</p>`,
          exp?.deepDive ?? '',
          exp?.keyInsight
            ? `<blockquote><strong>Key Insight:</strong> ${exp.keyInsight}</blockquote>`
            : '',
          lesson.objectives?.length
            ? `<h2>Learning Objectives</h2><ul>${lesson.objectives.map(o => `<li>${o}</li>`).join('\n')}</ul>`
            : '',
          lesson.content?.length
            ? `<h2>Core Concepts</h2>${lesson.content.map(c => `<p>${c}</p>`).join('\n')}`
            : '',
          exp?.practicalApplication
            ? `<h2>Practical Application</h2><p>${exp.practicalApplication}</p>`
            : '',
          exp?.reflectionPrompts?.length
            ? `<h2>Reflection Prompts</h2><ul>${exp.reflectionPrompts.map(p => `<li>${p}</li>`).join('\n')}</ul>`
            : '',
          exp?.weeklyChallenge
            ? `<h2>This Week's Challenge</h2><p>${exp.weeklyChallenge}</p>`
            : '',
        ].filter(Boolean).join('\n')

        return {
          course_id:    courseId,
          title:        lesson.title,
          type:         lesson.type === 'video' ? 'video' as const : 'text' as const,
          youtube_url:  null,
          content:      sanitizeHtml(content),
          sort_order:   index + 1,
          is_published: true,
          is_preview:   index === 0,
          created_at:   new Date().toISOString(),
          updated_at:   new Date().toISOString(),
        }
      })

    const { count } = await admin
      .from('course_lessons')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId)

    if ((count ?? 0) > 0) {
      if (!force) continue
      await admin.from('course_lessons').delete().eq('course_id', courseId)
    }

    const { error } = await admin.from('course_lessons').insert(lessons)
    if (error) {
      console.error(`[syncBusinessCourses] Insert failed for course ${courseId}:`, error)
      continue
    }
    seeded += lessons.length
  }

  await logAudit(sa.userId, sa.email, 'BUSINESS_COURSES_SYNCED', 'course', null, null,
    `Seeded/updated ${seeded} lessons across business courses (force=${force})`)

  revalidatePath('/admin/super')
  return { success: true, seeded }
}

// ── Sync Educator courses from curriculum into course_lessons ─────────────────

export async function syncEducatorCourses(
  force = false
): Promise<ActionResult & { seeded: number }> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized', seeded: 0 }

  const { PROGRAMS } = await import('@/lib/education/curriculum')
  const admin = createAdminClient()

  // course_id mapping: program.id → integer
  const COURSE_ID_MAP: Record<string, number> = {
    'ed01': 9,
    'ed02': 10,
    'ed03': 11,
    'ed04': 12,
  }

  let seeded = 0

  for (const program of PROGRAMS) {
    const courseId = COURSE_ID_MAP[program.id]
    if (!courseId) continue

    const lessons = program.modules.map((module, index) => ({
      course_id:    courseId,
      title:        module.title,
      type:         'text' as const,
      youtube_url:  null,
      content:      sanitizeHtml(module.content),
      sort_order:   index + 1,
      is_published: true,
      is_preview:   index === 0,
      created_at:   new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    }))

    const { count } = await admin
      .from('course_lessons')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId)

    if ((count ?? 0) > 0) {
      if (!force) continue
      await admin.from('course_lessons').delete().eq('course_id', courseId)
    }

    const { error } = await admin.from('course_lessons').insert(lessons)
    if (error) {
      console.error(`[syncEducatorCourses] Insert failed for course ${courseId}:`, error)
      continue
    }
    seeded += lessons.length
  }

  await logAudit(sa.userId, sa.email, 'EDUCATOR_COURSES_SYNCED', 'course', null, null,
    `Seeded/updated ${seeded} lessons across educator courses (force=${force})`)

  revalidatePath('/admin/super')
  return { success: true, seeded }
}

// ── Sync Personal courses from curriculum into course_lessons ─────────────────

export async function syncPersonalCourses(
  force = false
): Promise<ActionResult & { seeded: number }> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized', seeded: 0 }

  const { COURSE_01_LESSONS, COURSE_02_LESSONS, COURSE_03_LESSONS, COURSE_04_LESSONS } =
    await import('@/lib/data/lessons')
  const { PERSONAL_LESSON_EXPANSIONS } = await import('@/lib/personal/curriculum-expanded')
  const admin = createAdminClient()

  const COURSE_SETS = [
    { courseId: 1, lessons: COURSE_01_LESSONS },
    { courseId: 2, lessons: COURSE_02_LESSONS },
    { courseId: 3, lessons: COURSE_03_LESSONS },
    { courseId: 4, lessons: COURSE_04_LESSONS },
  ]

  let seeded = 0

  for (const { courseId, lessons } of COURSE_SETS) {
    const rows = lessons.map((lesson, index) => {
      const exp = PERSONAL_LESSON_EXPANSIONS[lesson.title]

      // Build rich HTML: existing content_md converted to HTML paragraphs + expansion
      const existingContent = lesson.content_md
        ? lesson.content_md
            .split('\n\n')
            .filter(Boolean)
            .map(block => {
              if (block.startsWith('## ')) return `<h2>${block.slice(3)}</h2>`
              if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`
              if (block.startsWith('> ')) return `<blockquote>${block.slice(2)}</blockquote>`
              if (block.startsWith('- ') || block.startsWith('* ')) {
                const items = block.split('\n').filter(l => l.match(/^[-*] /))
                return `<ul>${items.map(l => `<li>${l.replace(/^[-*] /, '')}</li>`).join('')}</ul>`
              }
              if (block.startsWith('1. ')) {
                const items = block.split('\n').filter(l => l.match(/^\d+\. /))
                return `<ul>${items.map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('')}</ul>`
              }
              if (block.startsWith('---')) return '<hr />'
              return `<p>${block.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code>$1</code>')}</p>`
            })
            .join('\n')
        : `<p>${lesson.description}</p>`

      const content = [
        existingContent,
        exp?.deepDive ?? '',
        exp?.keyInsight
          ? `<blockquote><strong>Key Insight:</strong> ${exp.keyInsight}</blockquote>`
          : '',
        exp?.practicalApplication
          ? `<h2>Your Practice</h2><p>${exp.practicalApplication}</p>`
          : '',
        exp?.reflectionPrompts?.length
          ? `<h2>Reflection Prompts</h2><ul>${exp.reflectionPrompts.map(p => `<li>${p}</li>`).join('\n')}</ul>`
          : '',
        exp?.weeklyChallenge
          ? `<h2>This Week's Challenge</h2><p>${exp.weeklyChallenge}</p>`
          : '',
      ].filter(Boolean).join('\n')

      return {
        course_id:    courseId,
        title:        lesson.title,
        type:         lesson.video_url ? 'video' as const : 'text' as const,
        youtube_url:  lesson.video_url ?? null,
        content:      sanitizeHtml(content),
        sort_order:   index + 1,
        is_published: true,
        is_preview:   lesson.is_preview,
        created_at:   new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      }
    })

    const { count } = await admin
      .from('course_lessons')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId)

    if ((count ?? 0) > 0) {
      if (!force) continue
      await admin.from('course_lessons').delete().eq('course_id', courseId)
    }

    const { error } = await admin.from('course_lessons').insert(rows)
    if (error) {
      console.error(`[syncPersonalCourses] Insert failed for course ${courseId}:`, error)
      continue
    }
    seeded += rows.length
  }

  await logAudit(sa.userId, sa.email, 'PERSONAL_COURSES_SYNCED', 'course', null, null,
    `Seeded/updated ${seeded} lessons across personal courses (force=${force})`)

  revalidatePath('/admin/super')
  return { success: true, seeded }
}

// ══════════════════════════════════════════════════════════════════════════════
// CERTIFICATES CMS ACTIONS
// ══════════════════════════════════════════════════════════════════════════════

// ── Toggle Certificate Validity (Revoke / Reinstate) ──────────────────────────

export async function toggleCertificateStatus(
  certId: string,
  currentStatus: boolean,
  certNumber: string
): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const newStatus = !currentStatus

  const { error } = await admin
    .from('certificates')
    .update({ is_valid: newStatus })
    .eq('id', certId)

  if (error) return { success: false, error: error.message }

  const actionName = newStatus ? 'REINSTATED' : 'REVOKED'
  await logAudit(sa.userId, sa.email, `CERTIFICATE_${actionName}`, 'certificate', certId, certNumber, null)

  revalidatePath('/admin/super')
  return { success: true }
}

// ── Help Center: Send Support Message to Super Admin ─────────────────────────

export async function sendSupportMessage(data: {
  senderName: string
  senderEmail: string
  subject: string
  message: string
}): Promise<ActionResult> {
  if (!data.senderName.trim() || !data.senderEmail.trim() || !data.message.trim()) {
    return { success: false, error: 'Name, email, and message are required.' }
  }

  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? 'k.solomon@live.com'

  try {
    await sendEmail({
      to: SUPER_ADMIN_EMAIL,
      subject: `[Vibe Hyr Support] ${data.subject || 'New Support Request'}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0E0C08;color:#F7F2EA;padding:32px;border-radius:8px;">
          <div style="font-size:22px;font-weight:700;letter-spacing:2px;margin-bottom:4px;">
            <span style="color:#E8621A;">VIBE</span>HYR — Support Request
          </div>
          <div style="font-size:11px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:24px;">Platform Help Center</div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr><td style="padding:8px 0;color:#888;font-size:12px;width:100px;">From</td><td style="padding:8px 0;font-size:13px;">${data.senderName} &lt;${data.senderEmail}&gt;</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:12px;">Subject</td><td style="padding:8px 0;font-size:13px;">${data.subject || '—'}</td></tr>
          </table>
          <div style="background:#1A1208;border-left:3px solid #E8621A;padding:16px 20px;border-radius:0 4px 4px 0;font-size:14px;line-height:1.7;white-space:pre-wrap;">${data.message}</div>
          <div style="margin-top:24px;font-size:11px;color:#555;">Sent from Vibe Hyr Admin Help Center · ${new Date().toUTCString()}</div>
        </div>
      `,
    })
    return { success: true }
  } catch (err: any) {
    return { success: false, error: 'Failed to send message. Please try again.' }
  }
}
