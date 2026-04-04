import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { InviteUserForm } from './InviteUserForm'
import { RemoveUserButton } from './RemoveUserButton'
import type { UserRole, MembershipTier, InstitutionType } from '@/types'

type UserRow = {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  membership_tier: MembershipTier
  institution_type: InstitutionType
  org_id: string | null
  created_at: string
}

type OrgRow = {
  id: string
  name: string
  seats_purchased: number
  institution_type?: string
}

const ROLE_BADGE: Record<UserRole, { label: string; color: string }> = {
  super_admin:       { label: 'Super Admin',       color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  institution_admin: { label: 'Institution Admin', color: 'bg-orange/20 text-orange border-orange/30' },
  educator:          { label: 'Educator',          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  business:          { label: 'Team Member',       color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  personal:          { label: 'Personal',          color: 'bg-white/10 text-grey-DEFAULT border-white/10' },
  leader:            { label: 'Leader',            color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
}

const TIER_LABEL: Record<MembershipTier, string> = {
  free:      'Free',
  architect: 'Architect',
  elite:     'Elite',
}

export default async function ManageUsersPage() {
  const supabase      = createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: myProfile } = await adminSupabase
    .from('profiles')
    .select('role, org_id, institution_type')
    .eq('id', user.id)
    .single()

  const isSuperAdmin = myProfile?.role === 'super_admin'

  // isOrgAdmin: legacy check (profiles.role) OR new-flow check (organization_members.role='admin')
  let isOrgAdmin = myProfile?.role === 'institution_admin'
  let myOrgId    = myProfile?.org_id as string | null

  if (!isSuperAdmin && !isOrgAdmin) {
    const { data: membership } = await adminSupabase
      .from('organization_members')
      .select('org_id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('status', 'active')
      .limit(1)
      .single()
    if (membership) {
      isOrgAdmin = true
      myOrgId    = membership.org_id
    }
  }

  if (!isSuperAdmin && !isOrgAdmin) redirect('/dashboard')

  let users: UserRow[]  = []
  let orgs:  OrgRow[]   = []
  let myOrg: OrgRow | null = null

  if (isSuperAdmin) {
    const [{ data: allUsers }, { data: allOrgs }] = await Promise.all([
      adminSupabase
        .from('profiles')
        .select('id, email, full_name, role, membership_tier, institution_type, org_id, created_at')
        .order('role').order('email'),
      adminSupabase
        .from('organizations')
        .select('id, name, seats_purchased'),
    ])
    users = (allUsers ?? []) as UserRow[]
    orgs  = (allOrgs  ?? []) as OrgRow[]
  } else {
    if (!myOrgId) redirect('/dashboard')

    const [{ data: orgMembers }, { data: orgData }] = await Promise.all([
      adminSupabase
        .from('organization_members')
        .select('user_id, email, full_name, role, status, created_at, profiles(membership_tier, institution_type, org_id)')
        .eq('org_id', myOrgId)
        .order('email'),
      adminSupabase
        .from('organizations')
        .select('id, name, seats_purchased')
        .eq('id', myOrgId)
        .single(),
    ])
    const orgUsers = (orgMembers ?? []).map((m: any) => ({
      id:               m.user_id,
      email:            m.email,
      full_name:        m.full_name,
      role:             m.role === 'admin' ? 'institution_admin' : (m.profiles?.role ?? m.role),
      membership_tier:  m.profiles?.membership_tier ?? 'free',
      institution_type: m.profiles?.institution_type ?? null,
      org_id:           myOrgId,
      created_at:       m.created_at,
    }))
    users  = (orgUsers ?? []) as UserRow[]
    myOrg  = orgData as OrgRow | null
    if (myOrg) orgs = [myOrg]
  }

  const orgMap = Object.fromEntries(orgs.map(o => [o.id, o.name]))

  return (
    <>
      <Navbar />
      <main className="pt-[68px] pb-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 md:px-14 pt-12">

          {/* Header */}
          <div className="mb-8">
            <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-orange mb-2">
              {isSuperAdmin ? 'Super Admin' : 'Institution Admin'}
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-white mb-3">
              Manage Users
            </h1>
            <p className="text-grey-DEFAULT text-lg">
              {isSuperAdmin
                ? `${users.length} total platform users`
                : `${users.length} users in your organization`}
            </p>
          </div>

          {/* Invite form — institution admins only */}
          {isOrgAdmin && myOrg && (
            <InviteUserForm
              orgType={(myProfile?.institution_type === 'education' ? 'education' : 'business') as 'education' | 'business'}
              seatsUsed={users.length}
              seatsPurchased={myOrg.seats_purchased}
            />
          )}

          {/* User table */}
          <div className="bg-black-3 border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-black-2">
                    <th className="text-left px-6 py-4 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-grey-dark">User</th>
                    <th className="text-left px-6 py-4 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-grey-dark">Role</th>
                    <th className="text-left px-6 py-4 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-grey-dark">Tier</th>
                    {isSuperAdmin && (
                      <th className="text-left px-6 py-4 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-grey-dark">Organization</th>
                    )}
                    <th className="text-left px-6 py-4 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-grey-dark">Type</th>
                    <th className="text-left px-6 py-4 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-grey-dark">Joined</th>
                    {isOrgAdmin && (
                      <th className="px-6 py-4" />
                    )}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => {
                    const badge    = ROLE_BADGE[u.role] ?? ROLE_BADGE.personal
                    const joinDate = new Date(u.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })
                    const orgName  = u.org_id ? (orgMap[u.org_id] ?? '—') : '—'
                    return (
                      <tr
                        key={u.id}
                        className={`border-b border-white/5 hover:bg-black-2 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                      >
                        <td className="px-6 py-4">
                          <p className="text-white text-sm font-medium">{u.full_name || '—'}</p>
                          <p className="text-grey-dark text-xs mt-0.5">{u.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded border font-mono text-[0.55rem] tracking-widest uppercase ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-[0.6rem] tracking-widest uppercase text-grey-DEFAULT">
                            {TIER_LABEL[u.membership_tier] ?? u.membership_tier}
                          </span>
                        </td>
                        {isSuperAdmin && (
                          <td className="px-6 py-4">
                            <span className="text-grey-DEFAULT text-sm">{orgName}</span>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <span className="font-mono text-[0.6rem] tracking-widest uppercase text-grey-dark capitalize">
                            {u.institution_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-grey-dark text-xs">{joinDate}</span>
                        </td>
                        {isOrgAdmin && (
                          <td className="px-6 py-4 text-right">
                            <RemoveUserButton
                              userId={u.id}
                              userName={u.full_name || u.email}
                            />
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="text-center py-16 text-grey-dark">
                  No users found. Invite your first team member above.
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
