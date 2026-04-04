'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { bypassWelcomeTemplate, institutionInviteTemplate, passwordResetTemplate } from '@/lib/email/templates'

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

  // Create user in Supabase Auth
  let userId: string
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: data.email,
    email_confirm: true,
    user_metadata: { full_name: `${data.firstName} ${data.lastName}` },
  })

  if (authErr) {
    if (authErr.message.includes('already registered')) {
      // User exists — fetch their ID
      const { data: existing } = await admin.from('profiles').select('id').eq('email', data.email).single()
      if (!existing) return { success: false, error: 'User exists in Auth but no profile found.' }
      userId = existing.id
    } else {
      return { success: false, error: authErr.message }
    }
  } else {
    userId = authData.user!.id
  }

  // Upsert profile with bypass flags
  await admin.from('profiles').upsert({
    id: userId, email: data.email,
    full_name: `${data.firstName} ${data.lastName}`,
    membership_tier: data.membershipTier,
    institution_type: data.institutionType,
    org_id: data.orgId || null,
    is_bypassed: true,
    bypass_reason: data.bypassReason,
    bypass_expiry: data.bypassExpiry ? new Date(data.bypassExpiry).toISOString() : null,
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

  // Send welcome email with password-setup link if requested
  if (data.sendWelcomeEmail) {
    try {
      let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
      // Fix malformed URLs: remove quotes, ensure protocol, and fix dev hostname 0.0.0.0
      appUrl = appUrl.replace(/["]/g, '').replace(/\/$/, '')
      if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
      if (!appUrl.startsWith('http')) appUrl = `https://${appUrl}`
      
      const { data: linkData, error: lErr } = await admin.auth.admin.generateLink({
        type: 'recovery',
        email: data.email,
        // implicit flow — hash fragment goes to client-side page, not server callback
        options: { redirectTo: `${appUrl}/auth/reset-password` },
      })

      if (lErr) console.warn('[addBypassUser] generateLink error:', lErr)

      let setupUrl = `${appUrl}/auth/login`
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
    billing_cycle: null,            // bypass orgs are not billed
    stripe_customer_id: null,
    stripe_subscription_id: null,
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
    let authDataFinal: any = null
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email: data.adminEmail,
      email_confirm: true,
      user_metadata: { full_name: `${data.adminFirstName} ${data.adminLastName}` },
    })
    
    if (authErr) {
      if (authErr.message.includes('already registered')) {
        const { data: existing } = await admin.from('profiles').select('id').eq('email', data.adminEmail).single()
        authDataFinal = { user: existing }
      } else {
        console.error('[addBypassOrg] admin creation failed:', authErr.message)
      }
    } else {
      authDataFinal = authData
    }

    if (authDataFinal?.user) {
      const adminUserId = authDataFinal.user.id
      await admin.from('profiles').upsert({
        id: adminUserId, email: data.adminEmail,
        full_name: `${data.adminFirstName} ${data.adminLastName}`,
        membership_tier: data.tier, org_id: org.id,
        institution_type: data.segment === 'education' ? 'education' : data.segment === 'leadership' ? 'leadership' : 'business',
      })
      await admin.from('organization_members').upsert({
        org_id: org.id, user_id: adminUserId, role: 'admin', is_active: true,
      }, { onConflict: 'org_id,user_id' })

      // Update org seats_used
      await admin.from('organizations').update({ seats_used: 1 }).eq('id', org.id)
      
      if (data.sendOnboarding) {
        try {
          let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
          appUrl = appUrl.replace(/["]/g, '').replace(/\/$/, '')
          if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
          if (!appUrl.startsWith('http')) appUrl = `https://${appUrl}`

          const { data: linkData, error: lErr } = await admin.auth.admin.generateLink({
            type: 'recovery',
            email: data.adminEmail,
            options: { redirectTo: `${appUrl}/auth/reset-password` },
          })
          
          if (lErr) console.warn('[addBypassOrg] generateLink error:', lErr)

          let setupUrl = `${appUrl}/auth/login`
          if (linkData?.properties?.action_link) {
            setupUrl = `${appUrl}/auth/enroll?link=${encodeURIComponent(linkData.properties.action_link)}`
          }
          const fullName = `${data.adminFirstName} ${data.adminLastName}`
          
          await sendEmail({
            to: data.adminEmail,
            subject: `Welcome to ${data.name} on Vibe Hyr`,
            html: bypassWelcomeTemplate(fullName, data.tier, setupUrl),
          })
          console.log('[addBypassOrg] Welcome email sent to:', data.adminEmail)
        } catch (err: any) {
          console.error('[addBypassOrg] email failure:', err.message)
        }
      }
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
  institutionType: string
  orgId: string | null
  membershipTier: string
}): Promise<ActionResult> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized' }

  const admin  = createAdminClient()
  let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
  // Fix malformed URLs
  appUrl = appUrl.replace(/["]/g, '').replace(/\/$/, '')
  if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
  if (!appUrl.startsWith('http')) appUrl = `https://${appUrl}`

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    data.email,
    {
      redirectTo: `${appUrl}/auth/callback?next=/auth/reset-password`,
      data: {
        org_id:           data.orgId,
        institution_type: data.institutionType,
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
    await admin.from('profiles').upsert(
      {
        id:               inviteData.user.id,
        email:            data.email,
        org_id:           data.orgId,
        institution_type: data.institutionType as 'individual' | 'education' | 'business' | 'leadership',
        role:             data.role,
        membership_tier:  data.membershipTier,
        membership_type:  data.institutionType === 'individual' ? 'personal' : data.institutionType,
      },
      { onConflict: 'id' }
    )
  }

  // Send branded invite email
  try {
    const { data: linkData } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: data.email,
      options: { redirectTo: `${appUrl}/auth/reset-password` },
    })
    let setupUrl = `${appUrl}/auth/login`
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
    `Invited as ${data.role} (${data.institutionType}), tier: ${data.membershipTier}`)
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
  // Fix malformed URLs: remove quotes, ensure protocol, and handle 0.0.0.0
  appUrl = appUrl.replace(/["]/g, '').replace(/\/$/, '')
  if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
  if (!appUrl.startsWith('http')) appUrl = `https://${appUrl}`

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: userEmail,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/auth/reset-password`,
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

function isValidYoutubeUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/.test(url.trim())
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
    if (!url) return { success: false, error: 'YouTube URL is required for video lessons.' }
    if (!isValidYoutubeUrl(url)) {
      return { success: false, error: 'Enter a valid YouTube URL (youtube.com/watch?v=... or youtu.be/...).' }
    }
  }

  const admin = createAdminClient()
  const payload: Record<string, unknown> = {
    course_id:   lesson.course_id,
    title,
    type:        lesson.type,
    // Preserve both fields independently — don't null one when switching types.
    // The lesson type controls which field the player renders, not which is stored.
    youtube_url: lesson.youtube_url?.trim() ?? null,
    content:     lesson.content ?? null,
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

export async function syncLeadershipCourses(): Promise<ActionResult & { seeded: number }> {
  const sa = await requireSuperAdmin()
  if (!sa) return { success: false, error: 'Unauthorized', seeded: 0 }

  const { COURSES } = await import('@/lib/leadership/curriculum')
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
      const content = [
        lesson.description,
        '',
        'KEY CONCEPTS',
        ...lesson.keyConcepts.map(c => `• ${c}`),
        '',
        'NEUROSCIENCE ANCHOR',
        lesson.neuroscienceAnchor,
        '',
        'LAW ANCHOR',
        lesson.lawAnchor,
      ].join('\n')

      return {
        course_id:    courseId,
        title:        lesson.title,
        type:         'text' as const,
        youtube_url:  null,
        content,
        sort_order:   index + 1,
        is_published: false,
        is_preview:   index === 0,
        created_at:   new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      }
    })

    // Seed if empty; re-seed if count is below the current curriculum lesson count
    const { count } = await admin
      .from('course_lessons')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId)

    if ((count ?? 0) >= lessons.length) continue

    // Clear stale lessons before re-seeding (handles curriculum expansions)
    if ((count ?? 0) > 0) {
      await admin.from('course_lessons').delete().eq('course_id', courseId)
    }

    const { error } = await admin.from('course_lessons').insert(lessons)
    if (error) {
      console.error(`[syncLeadershipCourses] Failed for course ${courseId}:`, error)
      continue
    }
    seeded += lessons.length
  }

  await logAudit(sa.userId, sa.email, 'LEADERSHIP_COURSES_SYNCED', 'course', null, null,
    `Seeded ${seeded} lessons across leadership courses`)

  revalidatePath('/admin/super')
  return { success: true, seeded }
}
