// app/admin/institutional/page.tsx
// Institutional admin dashboard — available to org admins only.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InstitutionalAdminDashboard } from '@/components/admin/InstitutionalAdminDashboard'

export const metadata = { title: 'Institutional Admin — Vibe Hyr' }

export default async function InstitutionalAdminPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin/institutional')

  // Fetch admin's profile
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('full_name, email, role, org_id')
    .eq('id', user.id)
    .single()

  // Resolve org ID: check profiles.role first (legacy), then organization_members (new flow)
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  let orgId: string | null = adminProfile?.role === 'admin' ? (adminProfile.org_id ?? null) : null

  if (!orgId) {
    const { data: membership } = await adminClient
      .from('organization_members')
      .select('org_id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('status', 'active')
      .limit(1)
      .single()
    orgId = membership?.org_id ?? null
  }

  if (!orgId) redirect('/dashboard')

  // Fetch the org this admin belongs to
  const { data: org } = await adminClient
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()

  if (!org) redirect('/dashboard')

  // Fetch org members via organization_members (works for both legacy and new-flow admins)
  const { data: memberships } = await adminClient
    .from('organization_members')
    .select('user_id, email, full_name, role, status, created_at, profiles(membership_tier)')
    .eq('org_id', org.id)
    .order('full_name')

  const members = (memberships ?? []).map((m: any) => ({
    id:             m.user_id,
    email:          m.email,
    full_name:      m.full_name,
    role:           m.role,
    membership_tier: m.profiles?.membership_tier ?? 'free',
    updated_at:     m.created_at,
  }))

  const adminName = adminProfile?.full_name ?? adminProfile?.email ?? 'Admin'

  return (
    <InstitutionalAdminDashboard
      org={org}
      members={members}
      adminName={adminName}
    />
  )
}
