'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { editUser, removeUser, inviteUserDirect } from '@/app/admin/users/actions'
import { OrgUserManagement } from '@/components/admin/OrgUserManagement'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Org {
  id: string
  name: string
  tier: string
  segment: string
  seats_purchased: number
  seats_used: number
  domain?: string | null
  website?: string | null
  industry?: string | null
  billing_email?: string | null
  admin_user_id?: string | null
}

interface Member {
  id: string
  email: string
  full_name: string | null
  role: string
  membership_tier: string
  updated_at: string
}

interface Props {
  org: Org
  members: Member[]
  adminName: string
}

// ─── CSS token helpers ────────────────────────────────────────────────────────

const C = {
  dark:  '#0A0804',
  dark2: '#110E09',
  dark3: '#1A1510',
  dark4: '#221C13',
  cream: '#F0EAE0',
  orange:'#E8621A',
  gold:  '#C9A84C',
  muted: '#7A6E60',
  border:'rgba(201,168,76,0.15)',
  borderB:'rgba(201,168,76,0.35)',
  glow:  'rgba(232,98,26,0.12)',
}

const TIER_LABEL: Record<string, string> = {
  free: 'Seeker',
  architect: 'Architect',
  elite: 'Reality Master',
}

const TIER_PILL: Record<string, React.CSSProperties> = {
  free:      { background:'rgba(201,168,76,0.1)',  color:C.gold,           border:`1px solid rgba(201,168,76,0.2)` },
  architect: { background:'rgba(232,98,26,0.1)',   color:'#FF8A50',        border:`1px solid rgba(232,98,26,0.25)` },
  elite:     { background:'linear-gradient(90deg,rgba(232,98,26,0.2),rgba(201,168,76,0.2))', color:C.gold, border:`1px solid rgba(201,168,76,0.4)` },
}

const STATUS_PILL: Record<string, React.CSSProperties> = {
  active:   { background:'rgba(76,175,80,0.15)',  color:'#81C784', border:`1px solid rgba(76,175,80,0.25)` },
  pending:  { background:'rgba(255,193,7,0.12)',  color:'#FFD54F', border:`1px solid rgba(255,193,7,0.25)` },
  inactive: { background:'rgba(122,110,96,0.2)',  color:C.muted,  border:`1px solid ${C.border}` },
}

function pill(style: React.CSSProperties, label: string) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', fontSize:10, fontWeight:600,
      letterSpacing:1, textTransform:'uppercase', padding:'3px 9px', borderRadius:20,
      ...style,
    }}>{label}</span>
  )
}

function getMemberStatus(m: Member): 'active' | 'pending' | 'inactive' {
  const daysAgo = (Date.now() - new Date(m.updated_at).getTime()) / 86400000
  if (daysAgo > 14) return 'inactive'
  if (!m.full_name)  return 'pending'
  return 'active'
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────

function EditUserModal({
  member, orgSegment, onClose, onSave,
}: {
  member: Member
  orgSegment: string
  onClose: () => void
  onSave: (id: string, updates: { full_name?: string; role?: string; membership_tier?: string }) => Promise<void>
}) {
  const [fullName, setFullName] = useState(member.full_name ?? '')
  const [role, setRole]         = useState(member.role ?? '')
  const [tier, setTier]         = useState(member.membership_tier)
  const [saving, setSaving]     = useState(false)

  const roles = orgSegment === 'education'
    ? ['educator', 'institution_admin']
    : orgSegment === 'leadership'
    ? ['leader', 'institution_admin']
    : ['business', 'institution_admin']

  async function handleSave() {
    setSaving(true)
    await onSave(member.id, {
      full_name: fullName.trim() || undefined,
      role,
      membership_tier: tier,
    })
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    background: C.dark4, border: `1px solid ${C.border}`, color: C.cream,
    fontFamily: 'inherit', fontSize: 13, padding: '10px 14px', borderRadius: 4, outline: 'none', width: '100%',
  }

  return (
    <div style={{ display:'flex', position:'fixed', inset:0, background:'rgba(10,8,4,0.85)', zIndex:100, alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:C.dark3, border:`1px solid ${C.borderB}`, borderRadius:10, width:480, maxWidth:'95vw', padding:32 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:2, marginBottom:4 }}>Edit User</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:20 }}>{member.email}</div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ display:'block', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:C.muted, marginBottom:6 }}>Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} placeholder="Full name" />
          </div>
          <div>
            <label style={{ display:'block', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:C.muted, marginBottom:6 }}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
              {roles.map(r => (
                <option key={r} value={r}>{r === 'institution_admin' ? 'Institution Admin' : r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:C.muted, marginBottom:6 }}>Membership Tier</label>
            <select value={tier} onChange={e => setTier(e.target.value)} style={inputStyle}>
              <option value="free">Seeker (Free)</option>
              <option value="architect">Architect</option>
              <option value="elite">Reality Master</option>
            </select>
          </div>
        </div>

        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:24 }}>
          <button onClick={onClose} style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.muted, fontFamily:'inherit', fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase', padding:'10px 20px', borderRadius:4, cursor:'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ background:C.orange, border:'none', color:'#fff', fontFamily:'inherit', fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase', padding:'10px 24px', borderRadius:4, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  member, onClose, onConfirm, loading,
}: {
  member: Member
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <div style={{ display:'flex', position:'fixed', inset:0, background:'rgba(10,8,4,0.85)', zIndex:100, alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:C.dark3, border:`1px solid rgba(229,115,115,0.4)`, borderRadius:10, width:440, maxWidth:'95vw', padding:32 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:2, marginBottom:12 }}>Remove User</div>
        <p style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:24 }}>
          Are you sure you want to remove{' '}
          <strong style={{ color:C.cream }}>{member.full_name ?? member.email}</strong>{' '}
          from your organization? They will lose all access immediately.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.muted, fontFamily:'inherit', fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase', padding:'10px 20px', borderRadius:4, cursor:'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ background:'#C62828', border:'none', color:'#fff', fontFamily:'inherit', fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase', padding:'10px 24px', borderRadius:4, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Removing…' : 'Remove User'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({
  orgSegment, onClose, onSuccess, onToast,
}: {
  orgSegment: string
  onClose: () => void
  onSuccess: () => void
  onToast: (m: string) => void
}) {
  const [emailsText, setEmailsText] = useState('')
  const [role, setRole]             = useState(orgSegment === 'education' ? 'educator' : orgSegment === 'leadership' ? 'leader' : 'business')
  const [sending, setSending]       = useState(false)

  const roles = orgSegment === 'education'
    ? ['educator', 'institution_admin']
    : orgSegment === 'leadership'
    ? ['leader', 'institution_admin']
    : ['business', 'institution_admin']

  const inputStyle: React.CSSProperties = {
    background: C.dark4, border: `1px solid ${C.border}`, color: C.cream,
    fontFamily: 'inherit', fontSize: 13, padding: '10px 14px', borderRadius: 4, outline: 'none', width: '100%',
  }

  async function handleSend() {
    const emails = emailsText.split('\n').map(e => e.trim()).filter(Boolean)
    if (!emails.length) { onToast('Enter at least one email address.'); return }
    setSending(true)
    let successCount = 0
    let firstError = ''
    for (const email of emails) {
      const res = await inviteUserDirect(email, role)
      if (res.success) successCount++
      else if (!firstError) firstError = res.error ?? 'Unknown error'
    }
    setSending(false)
    if (firstError) {
      onToast(`Error: ${firstError}`)
    } else {
      onSuccess()
    }
  }

  return (
    <div style={{ display:'flex', position:'fixed', inset:0, background:'rgba(10,8,4,0.85)', zIndex:100, alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:C.dark3, border:`1px solid ${C.borderB}`, borderRadius:10, width:480, maxWidth:'95vw', padding:32 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:2, marginBottom:20 }}>Invite Users</div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ display:'block', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:C.muted, marginBottom:6 }}>Email Addresses</label>
            <textarea
              value={emailsText}
              onChange={e => setEmailsText(e.target.value)}
              placeholder={`Enter one email per line\ne.g. jane@company.com`}
              style={{ ...inputStyle, resize:'vertical', minHeight:100 }}
            />
            <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>One email per line. Each will receive an invitation.</div>
          </div>
          <div>
            <label style={{ display:'block', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:C.muted, marginBottom:6 }}>Assign Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
              {roles.map(r => (
                <option key={r} value={r}>{r === 'institution_admin' ? 'Institution Admin' : r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:24 }}>
          <button onClick={onClose} style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.muted, fontFamily:'inherit', fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase', padding:'10px 20px', borderRadius:4, cursor:'pointer' }}>Cancel</button>
          <button onClick={handleSend} disabled={sending} style={{ background:C.orange, border:'none', color:'#fff', fontFamily:'inherit', fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase', padding:'10px 24px', borderRadius:4, cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.7 : 1 }}>
            {sending ? 'Sending…' : 'Send Invites'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-pages ────────────────────────────────────────────────────────────────

function DashboardPage({ org, members }: { org: Org; members: Member[] }) {
  const active    = members.filter(m => getMemberStatus(m) === 'active').length
  const inactive  = members.filter(m => getMemberStatus(m) === 'inactive').length
  const seatsLeft = org.seats_purchased - org.seats_used

  return (
    <div>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
        {[
          { label:'Active Users',          value: active,           change:`${inactive} inactive` },
          { label:'Avg. Course Completion', value:'—',              change:'No data yet' },
          { label:'Seats Remaining',        value: seatsLeft,       change:`of ${org.seats_purchased} total` },
          { label:'Plan',                   value: org.tier ?? '—', change: org.segment ?? '' },
        ].map(s => (
          <div key={s.label} style={{ background:C.dark3, border:`1px solid ${C.border}`, borderRadius:8, padding:20, position:'relative', overflow:'hidden' }}>
            <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:C.muted, marginBottom:10 }}>{s.label}</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:34, letterSpacing:1, lineHeight:1, color:C.cream }}>{s.value}</div>
            <div style={{ fontSize:11, marginTop:6, color:C.muted }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Recent members */}
      <div style={{ background:C.dark3, border:`1px solid ${C.border}`, borderRadius:8, padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:2 }}>Team Members</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>All active seats</div>
          </div>
        </div>
        <MembersTable members={members.slice(0, 5)} />
        {members.length > 5 && (
          <div style={{ fontSize:12, color:C.orange, marginTop:12 }}>
            +{members.length - 5} more — view all in Users tab →
          </div>
        )}
      </div>
    </div>
  )
}

function MembersTable({
  members,
  onEdit,
  onDelete,
}: {
  members: Member[]
  onEdit?: (m: Member) => void
  onDelete?: (m: Member) => void
}) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            {['User', 'Role', 'Tier', 'Last Active', 'Status', ...(onEdit ? ['Actions'] : [])].map(h => (
              <th key={h} style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:C.muted, padding:'10px 12px', textAlign:'left', borderBottom:`1px solid ${C.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map(m => {
            const status  = getMemberStatus(m)
            const daysAgo = Math.floor((Date.now() - new Date(m.updated_at).getTime()) / 86400000)
            const lastActive = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`
            const roleLabel = m.role === 'institution_admin' ? 'Admin' : m.role ? m.role.charAt(0).toUpperCase() + m.role.slice(1) : '—'
            return (
              <tr key={m.id} style={{ borderBottom:`1px solid rgba(201,168,76,0.06)` }}>
                <td style={{ padding:'12px 12px' }}>
                  <div style={{ fontWeight:500, fontSize:13 }}>{m.full_name ?? '—'}</div>
                  <div style={{ color:C.muted, fontSize:12 }}>{m.email}</div>
                </td>
                <td style={{ padding:'12px 12px', fontSize:12, color:C.muted }}>{roleLabel}</td>
                <td style={{ padding:'12px 12px' }}>{pill(TIER_PILL[m.membership_tier] ?? TIER_PILL.free, TIER_LABEL[m.membership_tier] ?? m.membership_tier)}</td>
                <td style={{ padding:'12px 12px', fontSize:13, color:C.muted }}>{lastActive}</td>
                <td style={{ padding:'12px 12px' }}>{pill(STATUS_PILL[status], status)}</td>
                {onEdit && (
                  <td style={{ padding:'12px 12px', whiteSpace:'nowrap' }}>
                    <button
                      onClick={() => onEdit(m)}
                      style={{ fontSize:11, color:C.orange, cursor:'pointer', fontWeight:500, letterSpacing:1, textTransform:'uppercase', background:'none', border:'none', marginRight:12 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete?.(m)}
                      style={{ fontSize:11, color:'#E57373', cursor:'pointer', fontWeight:500, letterSpacing:1, textTransform:'uppercase', background:'none', border:'none' }}
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
          {members.length === 0 && (
            <tr>
              <td colSpan={onEdit ? 6 : 5} style={{ padding:'24px 12px', textAlign:'center', color:C.muted, fontSize:13 }}>No members yet. Invite your team to get started.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function UsersPage({
  org, members, onToast, onEdit, onDelete,
}: {
  org: Org
  members: Member[]
  onToast: (m: string) => void
  onEdit: (m: Member) => void
  onDelete: (m: Member) => void
}) {
  const [query, setQuery] = useState('')
  const filtered = members.filter(m =>
    `${m.full_name ?? ''} ${m.email} ${m.membership_tier} ${m.role}`.toLowerCase().includes(query.toLowerCase())
  )
  const seatsLeft = org.seats_purchased - org.seats_used

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20, padding:'16px 20px', background:C.dark4, border:`1px solid ${C.border}`, borderRadius:6 }}>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color:C.orange }}>{org.seats_used}</div>
          <div style={{ fontSize:11, color:C.muted }}>Active Users</div>
        </div>
        <div style={{ width:1, height:40, background:C.border }} />
        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color:C.gold }}>{seatsLeft}</div>
          <div style={{ fontSize:11, color:C.muted }}>Available Seats</div>
        </div>
        <div style={{ width:1, height:40, background:C.border }} />
        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color:C.cream }}>{org.seats_purchased}</div>
          <div style={{ fontSize:11, color:C.muted }}>Total License</div>
        </div>
        <div style={{ flex:1 }} />
        <button onClick={() => onToast('Export coming soon.')} style={{ background:'transparent', border:`1px solid ${C.borderB}`, color:C.cream, fontSize:12, fontWeight:500, letterSpacing:1, padding:'8px 16px', borderRadius:4, cursor:'pointer', textTransform:'uppercase' }}>
          Export CSV
        </button>
      </div>

      {members.filter(m => getMemberStatus(m) === 'inactive').length > 0 && (
        <div style={{ background:'rgba(201,168,76,0.07)', border:`1px solid rgba(201,168,76,0.25)`, borderRadius:6, padding:'14px 18px', fontSize:12, color:C.gold, marginBottom:20 }}>
          <strong>{members.filter(m => getMemberStatus(m) === 'inactive').length} users</strong> have not been active for 14+ days.
        </div>
      )}

      <div style={{ background:C.dark3, border:`1px solid ${C.border}`, borderRadius:8, padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, background:C.dark4, border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 14px', marginBottom:16 }}>
          <span style={{ color:C.muted }}>⌕</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, email, role, or tier..."
            style={{ background:'none', border:'none', color:C.cream, fontFamily:'inherit', fontSize:13, outline:'none', flex:1 }}
          />
        </div>
        <MembersTable members={filtered} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  )
}

function ProgressPage({ members }: { members: Member[] }) {
  const tierCounts = members.reduce<Record<string,number>>((acc, m) => {
    acc[m.membership_tier] = (acc[m.membership_tier] ?? 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:32 }}>
        {[
          { label:'Total Members',   value: members.length },
          { label:'Reality Masters', value: tierCounts['elite'] ?? 0 },
          { label:'Architects',      value: tierCounts['architect'] ?? 0 },
        ].map(s => (
          <div key={s.label} style={{ background:C.dark3, border:`1px solid ${C.border}`, borderRadius:8, padding:20 }}>
            <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:C.muted, marginBottom:10 }}>{s.label}</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:38, color:C.cream }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={{ background:C.dark3, border:`1px solid ${C.border}`, borderRadius:8, padding:24 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:2, marginBottom:20 }}>Tier Breakdown</div>
          {(['elite','architect','free'] as const).map(tier => {
            const count = tierCounts[tier] ?? 0
            const pct   = members.length ? Math.round((count / members.length) * 100) : 0
            return (
              <div key={tier} style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 }}>
                  <span style={{ color:C.cream }}>{TIER_LABEL[tier]}</span>
                  <span style={{ color:C.muted }}>{count} members</span>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:2, background:`linear-gradient(90deg,${C.orange},${C.gold})`, width:`${pct}%`, transition:'width 0.6s ease' }} />
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ background:C.dark3, border:`1px solid ${C.border}`, borderRadius:8, padding:24 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:2, marginBottom:16 }}>Course Access</div>
          {[
            { name:'Course 1 — Programming the Gatekeeper', tiers:['free','architect','elite'] },
            { name:'Course 2 — Mastery of Assumption',       tiers:['architect','elite'] },
            { name:'Course 3 — SATS Reprogramming',          tiers:['architect','elite'] },
            { name:'Course 4 — Echo Theory Delay',           tiers:['elite'] },
          ].map(c => {
            const eligible = members.filter(m => c.tiers.includes(m.membership_tier)).length
            const pct = members.length ? Math.round((eligible / members.length) * 100) : 0
            return (
              <div key={c.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:`1px solid ${C.border}` }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:C.orange, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500 }}>{c.name}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{eligible} of {members.length} members have access</div>
                </div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:C.gold }}>{pct}%</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PaymentsPage({ org, onToast }: { org: Org; onToast: (m: string) => void }) {
  const plans = [
    {
      tier:'Foundational', name:'Seeker Institutional', price:'$15', unit:'/seat/mo',
      desc:'Core access for teams beginning their cognitive engineering journey.',
      features:['Course 1: Programming the Gatekeeper','Mini Identity Audit','Core Content Library','Admin Dashboard','Email support'],
      key:'seeker',
    },
    {
      tier:'Comprehensive', name:'Architect Institutional', price:'$47', unit:'/seat/mo',
      desc:'Full access for teams ready to operationalize subconscious reprogramming.',
      features:['Courses 1–3','Full Revision Journal','SATS Diagnostics','Core Community Access','Priority support'],
      key:'architect',
    },
    {
      tier:'Elite', name:'Reality Master Elite', price:'$67', unit:'/seat/mo',
      desc:'The full cognitive architecture stack. Maximum institutional transformation.',
      features:['All 4 Courses incl. Echo Theory','Full Assumption Lab','Live Q&As with Reality Architects','Full Audio SATS Library','Dedicated account manager'],
      key:'elite',
    },
  ]

  const current = org.tier?.toLowerCase().includes('elite') ? 'elite' : org.tier?.toLowerCase().includes('architect') ? 'architect' : 'seeker'

  return (
    <div>
      <div style={{ background:'rgba(201,168,76,0.07)', border:`1px solid rgba(201,168,76,0.25)`, borderRadius:6, padding:'14px 18px', fontSize:12, color:C.gold, marginBottom:24 }}>
        <strong>Pricing is seat-based and scales with your team size — not your organization type.</strong> Volume discounts apply at 25, 50, and 100+ seats.
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:2 }}>Choose Your Plan</div>
          <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>All plans include all 4 courses. Billed monthly per seat.</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {plans.map(p => {
          const isCurrent = p.key === current
          return (
            <div key={p.key} style={{ background:C.dark3, border:`1px solid ${isCurrent ? C.orange : C.border}`, borderRadius:8, padding:24, position:'relative' }}>
              {isCurrent && (
                <div style={{ position:'absolute', top:-1, right:16, background:C.orange, color:'#fff', fontSize:9, fontWeight:700, letterSpacing:2, padding:'4px 10px', borderRadius:'0 0 4px 4px' }}>
                  CURRENT PLAN
                </div>
              )}
              <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:C.gold, marginBottom:8 }}>{p.tier}</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, letterSpacing:1, marginBottom:4 }}>{p.name}</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:40, color:C.orange, lineHeight:1 }}>
                {p.price}<span style={{ fontSize:16, color:C.muted, fontFamily:'inherit' }}>{p.unit}</span>
              </div>
              <div style={{ fontSize:12, color:C.muted, margin:'10px 0 16px', lineHeight:1.6 }}>{p.desc}</div>
              {p.features.map(f => (
                <div key={f} style={{ fontSize:12, color:C.cream, padding:'5px 0', display:'flex', gap:8, alignItems:'flex-start' }}>
                  <span style={{ color:C.gold, fontSize:8, marginTop:3, flexShrink:0 }}>✦</span>{f}
                </div>
              ))}
              <button
                onClick={() => onToast(isCurrent ? "You\u2019re already on this plan!" : 'Plan change initiated — contact support to confirm.')}
                style={{ width:'100%', marginTop:20, padding:10, background: isCurrent ? C.orange : 'transparent', border:`1px solid ${C.borderB}`, color:C.cream, fontFamily:'inherit', fontSize:11, fontWeight:600, letterSpacing:2, textTransform:'uppercase', borderRadius:4, cursor:'pointer' }}
              >
                {isCurrent ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Volume discounts */}
      <div style={{ background:C.dark3, border:`1px solid ${C.border}`, borderRadius:8, padding:20, marginBottom:28 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:2, marginBottom:4 }}>Volume Discounts</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:14 }}>Applied equally to all institution types.</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[
            { range:'1–24 Seats',   disc:'Standard', sub:'No discount',      highlight: org.seats_purchased < 25 },
            { range:'25–49 Seats',  disc:'10% Off',  sub:'Per seat savings',  highlight: org.seats_purchased >= 25 && org.seats_purchased < 50 },
            { range:'50–99 Seats',  disc:'20% Off',  sub:'Current tier',      highlight: org.seats_purchased >= 50 && org.seats_purchased < 100 },
            { range:'100+ Seats',   disc:'30% Off',  sub:'+ Custom SLA',      highlight: org.seats_purchased >= 100 },
          ].map(d => (
            <div key={d.range} style={{ textAlign:'center', padding:16, background: d.highlight ? 'rgba(232,98,26,0.06)' : C.dark4, border:`1px solid ${d.highlight ? 'rgba(232,98,26,0.2)' : C.border}`, borderRadius:6 }}>
              <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:C.muted, marginBottom:6 }}>
                {d.range}{d.highlight ? ' \u2190 You' : ''}
              </div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color: d.highlight ? C.orange : C.gold }}>{d.disc}</div>
              <div style={{ fontSize:12, color:C.muted }}>{d.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:C.dark3, border:`1px solid ${C.border}`, borderRadius:8, padding:24 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:2, marginBottom:16 }}>Billing</div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${C.border}`, fontSize:13 }}>
          <span style={{ color:C.muted }}>Plan</span><span>{org.tier ?? '—'}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${C.border}`, fontSize:13 }}>
          <span style={{ color:C.muted }}>Seats</span><span>{org.seats_purchased}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${C.border}`, fontSize:13 }}>
          <span style={{ color:C.muted }}>Billing Email</span><span>{org.billing_email ?? '—'}</span>
        </div>
        <button
          onClick={() => onToast('Redirecting to billing portal...')}
          style={{ marginTop:16, width:'100%', background:C.orange, border:'none', color:'#fff', fontFamily:'inherit', fontSize:12, fontWeight:600, letterSpacing:2, textTransform:'uppercase', padding:12, borderRadius:4, cursor:'pointer' }}
        >
          Manage Payment Method
        </button>
      </div>
    </div>
  )
}

function SettingsPage({ org, onToast }: { org: Org; onToast: (m: string) => void }) {
  const [name, setName]    = useState(org.name ?? '')
  const [website, setWeb]  = useState(org.website ?? '')
  const [bEmail, setBEmail]= useState(org.billing_email ?? '')

  return (
    <div>
      {/* Institution Profile */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, letterSpacing:2, marginBottom:16, paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>Institution Profile</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[
            { label:'Institution Name', val:name,    set:setName,   type:'text' },
            { label:'Billing Email',    val:bEmail,  set:setBEmail, type:'email' },
            { label:'Website',          val:website, set:setWeb,    type:'text' },
            { label:'Domain',           val:org.domain ?? '', set:()=>{}, type:'text', readonly:true },
          ].map(f => (
            <div key={f.label} style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <label style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:C.muted }}>{f.label}</label>
              <input
                type={f.type}
                value={f.val}
                readOnly={f.readonly}
                onChange={e => f.set(e.target.value)}
                style={{ background:C.dark4, border:`1px solid ${C.border}`, color: f.readonly ? C.muted : C.cream, fontFamily:'inherit', fontSize:13, padding:'10px 14px', borderRadius:4, outline:'none' }}
              />
            </div>
          ))}
        </div>
        <button onClick={() => onToast('✦ Institution profile saved.')} style={{ marginTop:16, background:C.orange, border:'none', color:'#fff', fontFamily:'inherit', fontSize:12, fontWeight:600, letterSpacing:2, textTransform:'uppercase', padding:'12px 28px', borderRadius:4, cursor:'pointer' }}>
          Save Changes
        </button>
      </div>

      {/* Notifications */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, letterSpacing:2, marginBottom:16, paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>Notifications</div>
        {[
          { label:'Weekly Progress Digest',  desc:'Weekly email summary of team completion rates' },
          { label:'Inactivity Alerts',        desc:'Alert when users haven\u2019t logged in for 14+ days' },
          { label:'Billing Notifications',    desc:'Notify before each billing cycle and on payment failures' },
        ].map(t => (
          <div key={t.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:`1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500 }}>{t.label}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{t.desc}</div>
            </div>
            <label style={{ position:'relative', width:38, height:20, flexShrink:0 }}>
              <input type="checkbox" defaultChecked style={{ opacity:0, width:0, height:0 }} />
              <span onClick={() => onToast('Setting updated.')} style={{ position:'absolute', inset:0, background:'rgba(232,98,26,0.2)', border:`1px solid ${C.orange}`, borderRadius:20, cursor:'pointer' }}>
                <span style={{ position:'absolute', width:14, height:14, background:C.orange, borderRadius:'50%', top:2, left:20, transition:'0.2s' }} />
              </span>
            </label>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, letterSpacing:2, marginBottom:16, paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>Danger Zone</div>
        <div style={{ background:'rgba(229,115,115,0.06)', border:`1px solid rgba(229,115,115,0.2)`, borderRadius:6, padding:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:13, fontWeight:500 }}>Cancel Institution Plan</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>All users lose access at end of billing cycle. This cannot be undone.</div>
          </div>
          <button onClick={() => onToast('Please contact support to cancel.')} style={{ background:'transparent', border:`1px solid rgba(229,115,115,0.4)`, color:'#E57373', fontFamily:'inherit', fontSize:12, fontWeight:500, letterSpacing:1, padding:'8px 16px', borderRadius:4, cursor:'pointer', textTransform:'uppercase' }}>
            Cancel Plan
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Shell / Main export ──────────────────────────────────────────────────────

type Tab = 'dashboard' | 'users' | 'progress' | 'payments' | 'settings'

const TAB_TITLES: Record<Tab, string> = {
  dashboard: 'Dashboard Overview',
  users:     'Users & Seat Management',
  progress:  'Course Progress & Engagement',
  payments:  'Billing & Payments',
  settings:  'Institution Settings',
}

export function InstitutionalAdminDashboard({ org, members, adminName }: Props) {
  const [tab, setTab]               = useState<Tab>('dashboard')
  const [toast, setToast]           = useState('')
  const [toastVis, setToastVis]     = useState(false)
  const [inviteOpen, setInvite]     = useState(false)
  const [editTarget, setEditTarget] = useState<Member | null>(null)
  const [delTarget, setDelTarget]   = useState<Member | null>(null)
  const [delLoading, setDelLoading] = useState(false)
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setSidebarOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setToastVis(true)
    setTimeout(() => setToastVis(false), 3500)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleSaveEdit(id: string, updates: { full_name?: string; role?: string; membership_tier?: string }) {
    const res = await editUser(id, updates)
    if (res.error) {
      showToast(`Error: ${res.error}`)
    } else {
      setEditTarget(null)
      showToast('✦ User updated.')
      router.refresh()
    }
  }

  async function handleConfirmDelete() {
    if (!delTarget) return
    setDelLoading(true)
    const res = await removeUser(delTarget.id)
    setDelLoading(false)
    if (res.error) {
      showToast(`Error: ${res.error}`)
    } else {
      setDelTarget(null)
      showToast('User removed from organization.')
      router.refresh()
    }
  }

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id:'dashboard', icon:'◈', label:'Dashboard' },
    { id:'users',     icon:'◎', label:'Users & Seats' },
    { id:'progress',  icon:'⬡', label:'Progress & Courses' },
    { id:'payments',  icon:'◇', label:'Billing & Payments' },
    { id:'settings',  icon:'✦', label:'Institution Settings' },
  ]

  const initials    = adminName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const segmentLabel = org.segment === 'education' ? 'Education' : org.segment === 'leadership' ? 'Leadership' : org.segment === 'smb' ? 'SMB' : 'Corporate'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        .inst-nav-item { transition: all 0.2s; }
        .inst-nav-item:hover { background: ${C.glow}; color: ${C.cream}; }
        .inst-sidebar {
          width:260px; min-width:260px; background:${C.dark2};
          border-right:1px solid ${C.border}; display:flex; flex-direction:column;
          position:sticky; top:0; height:100vh; overflow-y:auto; padding-bottom:24px;
          z-index:40; transition:transform 0.25s ease;
        }
        .inst-overlay {
          display:none; position:fixed; inset:0;
          background:rgba(10,8,4,0.72); z-index:39; cursor:pointer;
        }
        .inst-hamburger { display:none; align-items:center; justify-content:center; }
        @media (max-width: 767px) {
          .inst-sidebar {
            position:fixed !important; top:0 !important; left:0 !important;
            transform:translateX(-100%);
            height:100vh !important;
            box-shadow:4px 0 24px rgba(0,0,0,0.6);
          }
          .inst-sidebar.open { transform:translateX(0); }
          .inst-overlay.open { display:block; }
          .inst-hamburger { display:flex !important; }
          .inst-header { padding:12px 16px !important; }
          .inst-content { padding:16px !important; }
          .inst-content [style*="grid-template-columns"] { grid-template-columns:1fr !important; }
          .inst-upgrade-btn { display:none !important; }
        }
      `}</style>

      <div style={{ display:'flex', minHeight:'100vh', background:C.dark, color:C.cream, fontFamily:"'DM Sans',sans-serif" }}>

        {/* Mobile overlay */}
        <div onClick={() => setSidebarOpen(false)} className={`inst-overlay${sidebarOpen ? ' open' : ''}`} />

        {/* ── SIDEBAR ── */}
        <nav className={`inst-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div style={{ padding:'28px 24px 20px', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2 }}>
              <span style={{ color:C.orange }}>VIBE</span>HYR
            </div>
            <div style={{ fontSize:10, color:C.gold, letterSpacing:3, textTransform:'uppercase', marginTop:2 }}>Institutional Admin</div>
          </div>

          <div style={{ margin:'20px 16px', background:`linear-gradient(135deg,${C.dark3},${C.dark4})`, border:`1px solid ${C.borderB}`, borderRadius:8, padding:16 }}>
            <div style={{ display:'inline-block', background:C.orange, color:'#fff', fontSize:9, fontWeight:600, letterSpacing:2, textTransform:'uppercase', padding:'3px 8px', borderRadius:3, marginBottom:8 }}>{segmentLabel}</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:1, lineHeight:1.2 }}>{org.name}</div>
            <div style={{ fontSize:11, color:C.gold, marginTop:4 }}>{org.tier ?? 'Institutional Plan'}</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{org.seats_used} / {org.seats_purchased} seats active</div>
          </div>

          <div style={{ padding:'0 12px', marginTop:8 }}>
            <div style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:C.muted, padding:'12px 12px 6px' }}>Overview</div>
            {navItems.slice(0, 3).map(n => (
              <button key={n.id} onClick={() => { setTab(n.id); setSidebarOpen(false) }} className="inst-nav-item" style={{
                display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:6,
                fontSize:13, fontWeight:400, width:'100%', textAlign:'left', cursor:'pointer', marginBottom:2,
                background: tab === n.id ? 'linear-gradient(90deg,rgba(232,98,26,0.2),transparent)' : 'transparent',
                color: tab === n.id ? C.cream : C.muted, border: 'none',
                borderLeft: tab === n.id ? `2px solid ${C.orange}` : '2px solid transparent',
              }}>
                <span style={{ width:16, textAlign:'center', fontSize:14 }}>{n.icon}</span>
                {n.label}
                {n.id === 'users' && <span style={{ marginLeft:'auto', background:C.orange, color:'#fff', fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:10 }}>{members.length}</span>}
              </button>
            ))}

            <div style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:C.muted, padding:'12px 12px 6px' }}>Manage</div>
            {navItems.slice(3).map(n => (
              <button key={n.id} onClick={() => { setTab(n.id); setSidebarOpen(false) }} className="inst-nav-item" style={{
                display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:6,
                fontSize:13, fontWeight:400, width:'100%', textAlign:'left', cursor:'pointer', marginBottom:2,
                background: tab === n.id ? 'linear-gradient(90deg,rgba(232,98,26,0.2),transparent)' : 'transparent',
                color: tab === n.id ? C.cream : C.muted, border: 'none',
                borderLeft: tab === n.id ? `2px solid ${C.orange}` : '2px solid transparent',
              }}>
                <span style={{ width:16, textAlign:'center', fontSize:14 }}>{n.icon}</span>
                {n.label}
              </button>
            ))}

            <div style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:C.muted, padding:'12px 12px 6px' }}>Support</div>
            <button onClick={() => showToast('Opening help center...')} className="inst-nav-item" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:6, fontSize:13, color:C.muted, background:'transparent', border:'none', width:'100%', textAlign:'left', cursor:'pointer', marginBottom:2 }}>
              <span style={{ width:16, textAlign:'center' }}>○</span> Help Center
            </button>
          </div>

          <div style={{ marginTop:'auto', padding:16, borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${C.orange},${C.gold})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',sans-serif", fontSize:14, color:'#fff', flexShrink:0 }}>{initials}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{adminName}</div>
              <div style={{ fontSize:10, color:C.muted }}>Institution Admin</div>
            </div>
            <button onClick={handleLogout} title="Log out" style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:14 }}>↩</button>
          </div>
        </nav>

        {/* ── MAIN ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          <div className="inst-header" style={{ padding:'18px 32px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', background:C.dark2, position:'sticky', top:0, zIndex:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={() => setSidebarOpen(o => !o)} className="inst-hamburger" style={{ background:'none', border:'none', color:C.cream, cursor:'pointer', fontSize:20, padding:'4px 8px', borderRadius:4, flexShrink:0, lineHeight:1 }}>☰</button>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:2 }}>{TAB_TITLES[tab]}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <button onClick={() => setInvite(true)} style={{ background:'transparent', border:`1px solid ${C.borderB}`, color:C.cream, fontFamily:'inherit', fontSize:12, fontWeight:500, letterSpacing:1, padding:'8px 16px', borderRadius:4, cursor:'pointer', textTransform:'uppercase' }}>
                + Invite
              </button>
              <button className="inst-upgrade-btn" onClick={() => setTab('payments')} style={{ background:C.orange, border:`1px solid ${C.orange}`, color:'#fff', fontFamily:'inherit', fontSize:12, fontWeight:500, letterSpacing:1, padding:'8px 16px', borderRadius:4, cursor:'pointer', textTransform:'uppercase' }}>
                Upgrade Plan
              </button>
            </div>
          </div>

          <div className="inst-content" style={{ padding:32, flex:1 }}>
            {tab === 'dashboard' && <DashboardPage org={org} members={members} />}
            {tab === 'users'     && <OrgUserManagement />}
            {tab === 'progress'  && <ProgressPage members={members} />}
            {tab === 'payments'  && <PaymentsPage org={org} onToast={showToast} />}
            {tab === 'settings'  && <SettingsPage org={org} onToast={showToast} />}
          </div>
        </div>
      </div>

      {/* Invite modal */}
      {inviteOpen && (
        <InviteModal
          orgSegment={org.segment}
          onClose={() => setInvite(false)}
          onSuccess={() => { setInvite(false); showToast('✦ Invites sent!'); router.refresh() }}
          onToast={showToast}
        />
      )}

      {/* Edit user modal */}
      {editTarget && (
        <EditUserModal
          member={editTarget}
          orgSegment={org.segment}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete confirm modal */}
      {delTarget && (
        <DeleteConfirmModal
          member={delTarget}
          onClose={() => setDelTarget(null)}
          onConfirm={handleConfirmDelete}
          loading={delLoading}
        />
      )}

      {/* Toast */}
      {toastVis && (
        <div style={{ position:'fixed', bottom:32, right:32, background:C.dark3, border:`1px solid ${C.orange}`, borderRadius:6, padding:'14px 20px', fontSize:13, color:C.cream, zIndex:200, animation:'fadeInUp 0.3s ease' }}>
          {toast}
          <style>{`@keyframes fadeInUp { from { opacity:0;transform:translateY(12px) } to { opacity:1;transform:translateY(0) } }`}</style>
        </div>
      )}
    </>
  )
}
