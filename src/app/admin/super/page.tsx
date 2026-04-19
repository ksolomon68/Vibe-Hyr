// app/admin/super/page.tsx
// Super Admin dashboard — accessible only to is_super_admin = true users.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard'
import type {
  SuperAdminStats, BypassUser, BypassOrg, SAOrg, SAUser, AuditEntry,
} from '@/components/admin/SuperAdminDashboard'

export const metadata = { title: 'Super Admin — Vibe Hyr' }

export default async function SuperAdminPage() {
  // ── Auth: session ─────────────────────────────────────────────────────────
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin/super')

  // ── Auth: super admin check via service role ───────────────────────────────
  const admin = createAdminClient()
  const { data: saProfile } = await admin
    .from('profiles')
    .select('is_super_admin, full_name, email')
    .eq('id', user.id)
    .single()

  if (!saProfile?.is_super_admin) redirect('/dashboard')

  // ── Fetch all platform data ────────────────────────────────────────────────
  const [
    { count: totalUsers },
    { count: totalOrgs },
    { count: bypassedUsers },
    { count: bypassedOrgs },
    { data: mrrData },
    { count: pendingCount },
    { data: rawBypassUsers },
    { data: rawBypassOrgs },
    { data: rawOrgs },
    { data: rawUsers },
    { data: rawAudit },
    { data: rawOrgAdmins },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count:'exact', head:true }).neq('is_super_admin', true),
    admin.from('organizations').select('*', { count:'exact', head:true }),
    admin.from('profiles').select('*', { count:'exact', head:true }).eq('is_bypassed', true),
    admin.from('organizations').select('*', { count:'exact', head:true }).eq('is_bypassed', true),
    admin.from('organizations').select('mrr'),
    admin.from('organizations').select('*', { count:'exact', head:true }).eq('status', 'pending'),
    // Bypassed users
    admin.from('profiles')
      .select('id, full_name, email, vertical, org_id, membership_tier, bypass_reason, bypass_expiry, bypass_notes, created_at')
      .eq('is_bypassed', true)
      .neq('is_super_admin', true)
      .order('created_at', { ascending: false })
      .limit(30),
    // Bypassed organizations
    admin.from('organizations')
      .select('id, name, vertical, tier, seats_purchased, seats_used, bypass_reason, bypass_expiry, status, created_at')
      .eq('is_bypassed', true)
      .order('created_at', { ascending: false }),
    // All organizations
    admin.from('organizations')
      .select('id, name, vertical, tier, seats_purchased, seats_used, is_bypassed, bypass_reason, mrr, status, website, industry, created_at')
      .order('created_at', { ascending: false }),
    // All users (non super admin)
    admin.from('profiles')
      .select('id, full_name, email, vertical, org_id, membership_tier, is_bypassed, bypass_reason, role, updated_at, created_at')
      .neq('is_super_admin', true)
      .order('created_at', { ascending: false })
      .limit(300),
    // Audit log
    admin.from('admin_audit_log')
      .select('id, admin_email, action, target_type, target_name, details, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    // Org admins (role = 'admin' in organization_members)
    admin.from('organization_members')
      .select('org_id, user_id, email, role')
      .eq('role', 'admin')
      .eq('status', 'active'),
  ])

  // Compute MRR
  const mrr = (mrrData ?? []).reduce((sum: number, r: { mrr: number }) => sum + (r.mrr ?? 0), 0)

  // Build org → admin info map
  const orgAdminMap: Record<string, { userId: string | null; email: string }> = {}
  ;(rawOrgAdmins ?? []).forEach((m: { org_id: string; user_id: string | null; email: string }) => {
    orgAdminMap[m.org_id] = { userId: m.user_id, email: m.email }
  })

  // Fetch admin emails from profiles
  const adminUserIds = Array.from(new Set(Object.values(orgAdminMap).map(v => v.userId).filter(Boolean))) as string[]
  let adminEmailMap: Record<string, string> = {}
  if (adminUserIds.length > 0) {
    const { data: adminProfiles } = await admin
      .from('profiles').select('id, email').in('id', adminUserIds)
    ;(adminProfiles ?? []).forEach((p: { id: string; email: string }) => {
      adminEmailMap[p.id] = p.email
    })
  }

  // Build org name map for users
  const orgIds = Array.from(new Set((rawUsers ?? [])
    .map((u: { org_id: string | null }) => u.org_id).filter(Boolean))) as string[]
  let orgNameMap: Record<string, string> = {}
  if (orgIds.length > 0) {
    const { data: orgNames } = await admin
      .from('organizations').select('id, name').in('id', orgIds)
    ;(orgNames ?? []).forEach((o: { id: string; name: string }) => {
      orgNameMap[o.id] = o.name
    })
  }

  // ── Shape data ────────────────────────────────────────────────────────────
  const stats: SuperAdminStats = {
    totalUsers: totalUsers ?? 0,
    totalOrgs: totalOrgs ?? 0,
    bypassedAccounts: (bypassedUsers ?? 0) + (bypassedOrgs ?? 0),
    mrr,
    pendingReviews: pendingCount ?? 0,
  }

  const bypassUsers: BypassUser[] = (rawBypassUsers ?? []).map((u: {
    id: string; full_name: string | null; email: string; vertical: string;
    org_id: string | null; membership_tier: string; bypass_reason: string | null;
    bypass_expiry: string | null; bypass_notes: string | null; created_at: string;
  }) => ({
    id: u.id, full_name: u.full_name, email: u.email,
    vertical: u.vertical, institution_type: u.vertical, org_id: u.org_id,
    org_name: u.org_id ? orgNameMap[u.org_id] ?? null : null,
    membership_tier: u.membership_tier,
    bypass_reason: u.bypass_reason, bypass_expiry: u.bypass_expiry,
    bypass_notes: u.bypass_notes, created_at: u.created_at,
  }))

  const bypassOrgs: BypassOrg[] = (rawBypassOrgs ?? []).map((o: {
    id: string; name: string; vertical: string; tier: string;
    seats_purchased: number; seats_used: number;
    bypass_reason: string | null; bypass_expiry: string | null; status: string; created_at: string;
  }) => {
    const adminInfo = orgAdminMap[o.id]
    return {
      id: o.id, name: o.name, vertical: o.vertical, tier: o.tier,
      seats_purchased: o.seats_purchased, seats_used: o.seats_used,
      admin_email: adminInfo ? (adminInfo.userId ? adminEmailMap[adminInfo.userId] ?? adminInfo.email : adminInfo.email) : null,
      bypass_reason: o.bypass_reason, bypass_expiry: o.bypass_expiry,
      status: o.status, created_at: o.created_at,
    }
  })

  const orgs: SAOrg[] = (rawOrgs ?? []).map((o: {
    id: string; name: string; vertical: string; tier: string;
    seats_purchased: number; seats_used: number; is_bypassed: boolean;
    bypass_reason: string | null; mrr: number; status: string; created_at: string;
  }) => {
    const adminInfo = orgAdminMap[o.id]
    return {
      id: o.id, name: o.name, vertical: o.vertical, tier: o.tier,
      seats_purchased: o.seats_purchased, seats_used: o.seats_used,
      is_bypassed: o.is_bypassed, bypass_reason: o.bypass_reason,
      mrr: o.mrr ?? 0, status: o.status,
      admin_email: adminInfo ? (adminInfo.userId ? adminEmailMap[adminInfo.userId] ?? adminInfo.email : adminInfo.email) : null,
      created_at: o.created_at,
    }
  })

  const users: SAUser[] = (rawUsers ?? []).map((u: {
    id: string; full_name: string | null; email: string; vertical: string;
    org_id: string | null; membership_tier: string; is_bypassed: boolean;
    bypass_reason: string | null; role: string; updated_at: string; created_at: string;
  }) => ({
    id: u.id, full_name: u.full_name, email: u.email,
    vertical: u.vertical, institution_type: u.vertical, org_id: u.org_id,
    org_name: u.org_id ? orgNameMap[u.org_id] ?? null : null,
    membership_tier: u.membership_tier, is_bypassed: u.is_bypassed,
    bypass_reason: u.bypass_reason, role: u.role,
    updated_at: u.updated_at, created_at: u.created_at,
  }))

  const auditLog: AuditEntry[] = (rawAudit ?? []).map((e: {
    id: string; admin_email: string; action: string; target_type: string;
    target_name: string | null; details: string | null; created_at: string;
  }) => ({
    id: e.id, admin_email: e.admin_email, action: e.action,
    target_type: e.target_type, target_name: e.target_name,
    details: e.details, created_at: e.created_at,
  }))

  return (
    <SuperAdminDashboard
      adminName={saProfile.full_name ?? saProfile.email}
      stats={stats}
      bypassUsers={bypassUsers}
      bypassOrgs={bypassOrgs}
      orgs={orgs}
      users={users}
      auditLog={auditLog}
      orgOptions={orgs.map(o => ({ id: o.id, name: o.name }))}
    />
  )
}
