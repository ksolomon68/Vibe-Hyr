/**
 * /dashboard/manage-members
 * ─────────────────────────────────────────────────────────────────────────────
 * Server component — performs auth + role check server-side before rendering.
 * Passes pre-fetched data to the client panel so the page loads with content
 * on first render (no client-side loading flash for the initial list).
 */

import { redirect }          from 'next/navigation'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ManageMembersPanel    from '@/components/members/ManageMembersPanel'

export const dynamic = 'force-dynamic'

export default async function ManageMembersPage() {
  // ── 1. Auth check ──────────────────────────────────────────────────────────
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/manage-members')
  }

  // ── 2. Admin + org-type check ──────────────────────────────────────────────
  const admin = createAdminClient()

  const { data: membership } = await admin
    .from('organization_members')
    .select('org_id, role, status')
    .eq('user_id', user.id)
    .eq('role',    'admin')
    .eq('status',  'active')
    .limit(1)
    .single()

  if (!membership) {
    // Not an org admin → redirect to regular dashboard
    redirect('/dashboard')
  }

  const { data: org } = await admin
    .from('organizations')
    .select('id, name, type, plan, seat_limit, seats_used')
    .eq('id', membership.org_id)
    .single()

  if (!org || !['education', 'business'].includes(org.type)) {
    redirect('/dashboard')
  }

  // ── 3. Pre-fetch first page of members ────────────────────────────────────
  const { data: members, count } = await admin
    .from('organization_members')
    .select(
      `id, user_id, email, full_name, role, status, invited_at, joined_at, created_at,
       profiles:user_id ( id, avatar_url, membership_tier )`,
      { count: 'exact' }
    )
    .eq('org_id', membership.org_id)
    .order('created_at', { ascending: false })
    .range(0, 19)

  const initialData = {
    members:    members ?? [],
    total:      count ?? 0,
    page:       1,
    totalPages: Math.ceil((count ?? 0) / 20),
    org: {
      id:        org.id,
      name:      org.name,
      type:      org.type,
      plan:      org.plan,
      seatLimit: org.seat_limit ?? 50,
      seatsUsed: org.seats_used ?? 0,
    },
  }

  // ── 4. Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0E0C08]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs font-ibm-mono text-[#F7F2EA]/30">
          <a href="/dashboard" className="hover:text-[#F7F2EA]/60 transition-colors">Dashboard</a>
          <span>/</span>
          <span className="text-[#F7F2EA]/50">Manage Members</span>
        </nav>

        <ManageMembersPanel
          currentUserId={user.id}
          initialData={initialData}
        />
      </div>
    </div>
  )
}
