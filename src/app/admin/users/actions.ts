'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  // Verify caller
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const { data: myProfile } = await adminSupabase
    .from('profiles')
    .select('role, org_id, institution_type')
    .eq('id', user.id)
    .single()

  if (!myProfile || myProfile.role !== 'institution_admin') return { error: 'Unauthorized.' }

  const orgId = myProfile.org_id
  if (!orgId) return { error: 'No organization found for your account.' }

  // Role must be valid for this org type
  const educationRoles = ['educator', 'institution_admin']
  const businessRoles  = ['business', 'institution_admin']
  const allowedRoles   = myProfile.institution_type === 'education' ? educationRoles : businessRoles
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
    .eq('org_id', orgId)

  if ((currentCount ?? 0) >= org.seats_purchased) {
    return {
      error: `Seat limit reached (${currentCount}/${org.seats_purchased} seats used). Upgrade your plan to add more users.`,
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com'

  // Send invite email via Supabase
  const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: `${appUrl}/auth/callback`,
      data: {
        org_id:           orgId,
        institution_type: myProfile.institution_type,
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

  // Pre-create profile so the user has correct org/role from day one
  if (inviteData?.user) {
    const institutionType = myProfile.institution_type as 'education' | 'business'
    const membershipType  = institutionType === 'education' ? 'education' : 'business'

    await adminSupabase.from('profiles').upsert(
      {
        id:               inviteData.user.id,
        email,
        org_id:           orgId,
        institution_type: institutionType,
        role,
        membership_tier:  org.tier,
        membership_type:  membershipType,
      },
      { onConflict: 'id' }
    )
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

  const { data: myProfile } = await adminSupabase
    .from('profiles')
    .select('role, org_id')
    .eq('id', user.id)
    .single()

  if (!myProfile || myProfile.role !== 'institution_admin') return { error: 'Unauthorized.' }

  const { data: target } = await adminSupabase
    .from('profiles')
    .select('org_id')
    .eq('id', userId)
    .single()

  if (!target || target.org_id !== myProfile.org_id) return { error: 'User not found in your organization.' }

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

  const { data: myProfile } = await adminSupabase
    .from('profiles')
    .select('role, org_id')
    .eq('id', user.id)
    .single()

  if (!myProfile || myProfile.role !== 'institution_admin') return { error: 'Unauthorized.' }

  const { data: target } = await adminSupabase
    .from('profiles')
    .select('org_id')
    .eq('id', targetId)
    .single()

  if (!target || target.org_id !== myProfile.org_id) return { error: 'User not found in your organization.' }

  const { error: deleteErr } = await adminSupabase.auth.admin.deleteUser(targetId)
  if (deleteErr) return { error: deleteErr.message }

  // Belt-and-suspenders: delete profile row if no cascade
  await adminSupabase.from('profiles').delete().eq('id', targetId)

  revalidatePath('/admin/institutional')
  return { success: true }
}
