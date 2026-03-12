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

  // Fetch the org this user administers
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('admin_user_id', user.id)
    .single()

  if (!org) redirect('/dashboard')

  // Fetch org members
  const { data: members } = await supabase
    .from('profiles')
    .select('id, email, full_name, membership_tier, updated_at')
    .eq('org_id', org.id)
    .order('full_name')

  // Fetch admin profile
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  return (
    <InstitutionalAdminDashboard
      org={org}
      members={members ?? []}
      adminName={adminProfile?.full_name ?? adminProfile?.email ?? 'Admin'}
    />
  )
}
