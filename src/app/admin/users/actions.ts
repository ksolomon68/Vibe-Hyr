'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { institutionInviteTemplate } from '@/lib/email/templates'

// ─── Helper: resolve admin's org ID from either column ───────────────────────
// The schema has two org-FK columns on profiles: org_id (used by invite flow)
// and institution_id (added by institution_access migration). Admin profiles
// created via different paths may have one or the other populated.
// This helper coalesces both so auth checks never fail due to column mismatch.

async function getAdminOrg(
  adminSupabase: ReturnType<typeof createAdminClient>,
  adminUserId: string
): Promise<{ orgId: string; institutionType: string } | null> {
  const { data } = await adminSupabase
    .from('profiles')
    .select('role, org_id, institution_id, institution_type')
    .eq('id', adminUserId)
    .single()

  if (!data || data.role !== 'institution_admin') return null

  const orgId = data.org_id ?? data.institution_id
  if (!orgId) return null

  return { orgId, institutionType: data.institution_type ?? 'business' }
}

// ─── Check if a target profile belongs to the given org ──────────────────────

async function isInOrg(
  adminSupabase: ReturnType<typeof createAdminClient>,
  targetId: string,
  orgId: string
): Promise<boolean> {
  const { data } = await adminSupabase
    .from('profiles')
    .select('org_id, institution_id')
    .eq('id', targetId)
    .single()

  if (!data) return false
  const targetOrgId = data.org_id ?? data.institution_id
  return targetOrgId === orgId
}

// ─── Invite a new user ────────────────────────────────────────────────────────

export async function inviteUser(
  _prev: { error?: string; success?: boolean; email?: string } | null,
  formData: FormData
) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const role  = formData.get('role') as string

  if (!email || !role) return { error: 'Email and role are required.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' }

  const supabase      = createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const adminOrg = await getAdminOrg(adminSupabase, user.id)
  if (!adminOrg) return { error: 'Unauthorized.' }

  const { orgId, institutionType } = adminOrg

  // Role must be valid for this org type
  const educationRoles = ['educator', 'institution_admin']
  const businessRoles  = ['business', 'institution_admin']
  const allowedRoles   = institutionType === 'education' ? educationRoles : businessRoles
  if (!allowedRoles.includes(role)) return { error: 'Invalid role for your organization type.' }

  // Fetch org plan + check seat limit
  const { data: org } = await adminSupabase
    .from('organizations')
    .select('seats_purchased, tier, name')
    .eq('id', orgId)
    .single()

  if (!org) return { error: 'Organization not found.' }

  const { count: currentCount } = await adminSupabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .or(`org_id.eq.${orgId},institution_id.eq.${orgId}`)

  if ((currentCount ?? 0) >= org.seats_purchased) {
    return {
      error: `Seat limit reached (${currentCount}/${org.seats_purchased} seats used). Upgrade your plan to add more users.`,
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com'

  const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: `${appUrl}/auth/callback?next=/auth/reset-password`,
      data: {
        org_id:           orgId,
        institution_type: institutionType,
        role,
        membership_tier:  org.tier,
      },
    }
  )

  if (inviteError) {
    const msg = inviteError.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('already been registered')) {
      return { error: 'This email address is already registered on the platform.' }
    }
    return { error: inviteError.message }
  }

  if (inviteData?.user) {
    const membershipType = institutionType === 'education' ? 'education' : 'business'
    await adminSupabase.from('profiles').upsert(
      {
        id:               inviteData.user.id,
        email,
        org_id:           orgId,
        institution_id:   orgId,
        institution_type: institutionType as 'education' | 'business',
        role,
        membership_tier:  org.tier,
        membership_type:  membershipType,
      },
      { onConflict: 'id' }
    )
  }

  // Send branded invite email
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com'
    const { data: linkData } = await adminSupabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${appUrl}/auth/reset-password` },
    })
    const setupUrl = linkData?.properties?.action_link ?? `${appUrl}/auth/login`
    await sendEmail({
      to: email,
      subject: `You've been invited to join ${org.name} on Vibe Hyr`,
      html: institutionInviteTemplate(email, org.name, role, setupUrl),
    })
  } catch (emailErr) {
    console.error('[inviteUser] Invite email failed:', emailErr)
  }

  revalidatePath('/admin/users')
  revalidatePath('/admin/institutional')
  return { success: true, email }
}

// ─── Invite a single user directly (for client-component modal) ───────────────

export async function inviteUserDirect(
  email: string,
  role: string
): Promise<{ error?: string; success?: boolean }> {
  const fd = new FormData()
  fd.set('email', email)
  fd.set('role', role)
  const result = await inviteUser(null, fd)
  if (result.error) return { error: result.error }
  return { success: true }
}

// ─── Edit a user (name / role / tier) — scoped to caller's org ───────────────

export async function editUser(
  userId: string,
  updates: { full_name?: string; role?: string; membership_tier?: string }
): Promise<{ error?: string; success?: boolean }> {
  const supabase      = createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const adminOrg = await getAdminOrg(adminSupabase, user.id)
  if (!adminOrg) return { error: 'Unauthorized.' }

  if (!(await isInOrg(adminSupabase, userId, adminOrg.orgId))) {
    return { error: 'User not found in your organization.' }
  }

  const { error: updateErr } = await adminSupabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (updateErr) return { error: updateErr.message }

  revalidatePath('/admin/institutional')
  return { success: true }
}

// ─── Remove a user from the org (deletes auth user + profile) ────────────────

export async function removeUser(
  targetId: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase      = createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  if (user.id === targetId) return { error: 'You cannot remove yourself.' }

  const adminOrg = await getAdminOrg(adminSupabase, user.id)
  if (!adminOrg) return { error: 'Unauthorized.' }

  if (!(await isInOrg(adminSupabase, targetId, adminOrg.orgId))) {
    return { error: 'User not found in your organization.' }
  }

  const { error: deleteErr } = await adminSupabase.auth.admin.deleteUser(targetId)
  if (deleteErr) return { error: deleteErr.message }

  // Belt-and-suspenders: delete profile row if cascade didn't fire
  await adminSupabase.from('profiles').delete().eq('id', targetId)

  revalidatePath('/admin/institutional')
  return { success: true }
}
