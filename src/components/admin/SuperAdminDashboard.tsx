'use client'

import React, { useState, useTransition, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  addBypassUser, addBypassOrg,
  revokeUserBypass, revokeOrgBypass,
  updateBypassDetails,
  overrideUserCourseAccess, overrideOrgCourseAccess,
  deactivateUser, deleteUser, deleteOrganization,
  updateUserProfile,
  adminSetUserPassword,
  sendPasswordResetEmail,
  inviteUserBySuperAdmin,
  updateOrgAdmin,
} from '@/app/admin/super/actions'
import { CourseManagerPage } from './CourseManagerPage'

// ── Exported Types ────────────────────────────────────────────────────────────

export interface SuperAdminStats {
  totalUsers: number; totalOrgs: number; bypassedAccounts: number; mrr: number; pendingReviews: number
}

export interface BypassUser {
  id: string; full_name: string | null; email: string
  institution_type: string; org_id: string | null; org_name: string | null
  membership_tier: string; bypass_reason: string | null
  bypass_expiry: string | null; bypass_notes: string | null; created_at: string
}

export interface BypassOrg {
  id: string; name: string; segment: string; tier: string
  seats_purchased: number; seats_used: number
  admin_email: string | null; bypass_reason: string | null
  bypass_expiry: string | null; status: string; created_at: string
}

export interface SAOrg {
  id: string; name: string; segment: string; tier: string
  seats_purchased: number; seats_used: number
  is_bypassed: boolean; bypass_reason: string | null
  mrr: number; status: string; admin_email: string | null; created_at: string
}

export interface SAUser {
  id: string; full_name: string | null; email: string
  institution_type: string; org_id: string | null; org_name: string | null
  membership_tier: string; is_bypassed: boolean; bypass_reason: string | null
  role: string; updated_at: string; created_at: string
}

export interface AuditEntry {
  id: string; admin_email: string; action: string; target_type: string
  target_name: string | null; details: string | null; created_at: string
}

interface Props {
  adminName: string; stats: SuperAdminStats
  bypassUsers: BypassUser[]; bypassOrgs: BypassOrg[]
  orgs: SAOrg[]; users: SAUser[]; auditLog: AuditEntry[]
  orgOptions: { id: string; name: string }[]
}

// ── Colors ────────────────────────────────────────────────────────────────────

const C = {
  dark:'#0A0804', dark2:'#0F0C07', dark3:'#161109', dark4:'#1E160C', dark5:'#251C0F',
  cream:'#F0EAE0', orange:'#E8621A', gold:'#C9A84C',
  muted:'#B8A89A', muted2:'#D4C4B7',  // Increased contrast
  border:'rgba(201,168,76,0.12)', border2:'rgba(201,168,76,0.25)', border3:'rgba(201,168,76,0.45)',
  red:'#E57373', green:'#81C784', blue:'#90CAF9',
}

// ── Tier / type display ───────────────────────────────────────────────────────

type PillV = 'seeker'|'architect'|'master'|'active'|'inactive'|'pending'|'bypassed'|'ind'|'edu'|'biz'|'gold'
const PILLS: Record<PillV, React.CSSProperties> = {
  seeker:    { background:'rgba(154,142,128,0.15)', color:C.muted2, border:`1px solid rgba(154,142,128,0.25)` },
  architect: { background:'rgba(232,98,26,0.1)',   color:'#FF8A50', border:`1px solid rgba(232,98,26,0.25)` },
  master:    { background:'linear-gradient(90deg,rgba(232,98,26,0.15),rgba(201,168,76,0.15))', color:C.gold, border:`1px solid rgba(201,168,76,0.35)` },
  active:    { background:'rgba(39,174,96,0.12)',  color:C.green,   border:`1px solid rgba(39,174,96,0.25)` },
  inactive:  { background:'rgba(107,96,85,0.2)',   color:C.muted,   border:`1px solid ${C.border}` },
  pending:   { background:'rgba(255,193,7,0.1)',   color:'#FFD54F', border:`1px solid rgba(255,193,7,0.25)` },
  bypassed:  { background:'rgba(201,168,76,0.12)', color:C.gold,    border:`1px solid rgba(201,168,76,0.3)` },
  ind:       { background:'rgba(154,142,128,0.12)',color:C.muted2,  border:`1px solid rgba(154,142,128,0.2)` },
  edu:       { background:'rgba(41,128,185,0.12)', color:C.blue,    border:`1px solid rgba(41,128,185,0.25)` },
  biz:       { background:'rgba(39,174,96,0.1)',   color:'#A5D6A7', border:`1px solid rgba(39,174,96,0.2)` },
  gold:      { background:'rgba(201,168,76,0.12)', color:C.gold,    border:`1px solid rgba(201,168,76,0.3)` },
}
function Pill({ v, label }: { v: PillV; label: string }) {
  return <span style={{ display:'inline-flex', alignItems:'center', fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap', ...PILLS[v] }}>{label}</span>
}
function tierPill(tier: string) {
  if (tier === 'elite')     return <Pill v="master"    label="Reality Master"/>
  if (tier === 'architect') return <Pill v="architect" label="Architect"/>
  return                           <Pill v="seeker"    label="Seeker"/>
}
function segPill(seg: string) {
  if (seg === 'education' || seg === 'educator') return <Pill v="edu" label="Educator"/>
  if (seg === 'business' || seg === 'corporate' || seg === 'smb') return <Pill v="biz" label="Business"/>
  if (seg === 'leadership') return <Pill v="gold" label="Leadership"/>
  if (seg === 'personal') return <Pill v="ind" label="Personal"/>
  return                         <Pill v="ind" label={seg}/>
}
function typePill(type: string) {
  if (type === 'education') return <Pill v="edu" label="Education"/>
  if (type === 'business')  return <Pill v="biz" label="Business"/>
  if (type === 'leadership') return <Pill v="gold" label="Leadership"/>
  return                           <Pill v="ind" label="Individual"/>
}

function Tag({ bypass, label }: { bypass?: boolean; label: string }) {
  return <span style={{ display:'inline-block', fontSize:8, fontWeight:700, letterSpacing:1, textTransform:'uppercase', padding:'2px 6px', borderRadius:2, background: bypass ? 'rgba(201,168,76,0.15)' : 'rgba(39,174,96,0.12)', color: bypass ? C.gold : C.green, border:`1px solid ${bypass ? 'rgba(201,168,76,0.3)' : 'rgba(39,174,96,0.25)'}` }}>{label}</span>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}
function formatExpiry(iso: string | null) { return iso ? formatDate(iso) : 'Never' }
function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : d < 30 ? `${d}d ago` : formatDate(iso)
}

// ── Base components ───────────────────────────────────────────────────────────

function Btn({ variant='ghost', size='sm', children, onClick, disabled }: {
  variant?: 'ghost'|'primary'|'gold'|'danger'|'success'
  size?: 'sm'|'md'; children: React.ReactNode; onClick?: () => void; disabled?: boolean
}) {
  const base: React.CSSProperties = {
    fontFamily:"'DM Sans',sans-serif", fontWeight:600, letterSpacing:'1.5px',
    textTransform:'uppercase', borderRadius:3, cursor:disabled?'default':'pointer',
    transition:'all 0.18s', border:'none', opacity:disabled?0.5:1,
    padding:size==='sm'?'5px 12px':'9px 18px', fontSize:size==='sm'?10:12,
  }
  const vs: Record<string, React.CSSProperties> = {
    ghost:   { background:'transparent', border:`1px solid ${C.border2}`, color:C.muted2 },
    primary: { background:C.orange, color:'#fff' },
    gold:    { background:'transparent', border:`1px solid ${C.border2}`, color:C.gold },
    danger:  { background:'transparent', border:`1px solid rgba(192,57,43,0.3)`, color:C.red },
    success: { background:'transparent', border:`1px solid rgba(39,174,96,0.3)`, color:C.green },
  }
  return <button style={{ ...base, ...vs[variant] }} onClick={onClick} disabled={disabled}>{children}</button>
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:C.dark3, border:`1px solid ${C.border}`, borderRadius:6, padding:22, ...style }}>{children}</div>
}

function SecHd({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:14 }}>
      <div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:2 }}>{title}</div>
        {sub && <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{sub}</div>}
      </div>
      {action}
    </div>
  )
}

function Notice({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background:'linear-gradient(90deg,rgba(201,168,76,0.08),transparent)', border:`1px solid ${C.border2}`, borderRadius:5, padding:'12px 16px', marginBottom:18, display:'flex', alignItems:'center', gap:10, fontSize:13, color:C.gold, lineHeight:1.5 }}>
      <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>{children}
    </div>
  )
}

function SDivider({ label }: { label: string }) {
  return <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:15, letterSpacing:3, color:C.muted, margin:'18px 0 12px', paddingBottom:8, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8 }}><span style={{ color:C.orange, fontSize:12 }}>✦</span> {label}</div>
}

function FField({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return <div style={{ display:'flex', flexDirection:'column', gap:5, gridColumn:span2?'span 2':undefined }}><label style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:C.muted }}>{label}</label>{children}</div>
}

const IS: React.CSSProperties = { background:C.dark4, border:`1px solid ${C.border}`, color:C.cream, fontFamily:'inherit', fontSize:14, padding:'9px 12px', borderRadius:3, outline:'none' }

function Tbl({ cols, children }: { cols: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead><tr>{cols.map(c => <th key={c} style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:C.muted, padding:'9px 12px', textAlign:'left', borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' }}>{c}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
function TR({ children }: { children: React.ReactNode }) {
  return <tr style={{ borderBottom:`1px solid rgba(201,168,76,0.05)` }}>{children}</tr>
}
function TD({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <td style={{ padding:'11px 12px', fontSize:14, verticalAlign:'middle', color:muted?C.muted:undefined }}>{children}</td>
}
function TName({ name, sub, badge }: { name: string; sub: string; badge?: string }) {
  return <td style={{ padding:'11px 12px', verticalAlign:'middle' }}>
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <span style={{ fontWeight:500, fontSize:15 }}>{name}</span>
      {badge && <span style={{ fontSize:10, padding:'2px 6px', borderRadius:3, background:'rgba(232,98,26,0.15)', color:C.orange, border:`1px solid rgba(232,98,26,0.3)`, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>{badge}</span>}
    </div>
    <div style={{ fontSize:13, color:C.muted, marginTop:1 }}>{sub}</div>
  </td>
}
function ProgBar({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.round((value/max)*100) : 0
  return <div><span>{value}/{max}</span><div style={{ height:3, background:'rgba(255,255,255,0.05)', borderRadius:2, overflow:'hidden', marginTop:4 }}><div style={{ height:'100%', borderRadius:2, background:`linear-gradient(90deg,${C.orange},${C.gold})`, width:`${pct}%` }}/></div></div>
}
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return <div onClick={onChange} style={{ position:'relative', width:36, height:19, flexShrink:0, cursor:'pointer', background:checked?'rgba(232,98,26,0.15)':C.dark5, border:`1px solid ${checked?C.orange:C.border}`, borderRadius:19, transition:'0.2s' }}><div style={{ position:'absolute', width:13, height:13, borderRadius:'50%', background:checked?C.orange:C.muted, top:2, left:checked?19:2, transition:'0.2s' }}/></div>
}

function SearchInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:C.dark4, border:`1px solid ${C.border}`, borderRadius:3, padding:'7px 12px' }}><span style={{ color:C.muted }}>⌕</span><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ background:'none', border:'none', color:C.cream, fontFamily:'inherit', fontSize:12, outline:'none', flex:1 }}/></div>
}
function FilterSel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return <select value={value} onChange={e=>onChange(e.target.value)} style={{ background:C.dark4, border:`1px solid ${C.border}`, color:C.cream, fontFamily:'inherit', fontSize:11, padding:'7px 10px', borderRadius:3, outline:'none' }}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, sub, wide, children }: {
  open: boolean; onClose: () => void; title: string; sub?: string; wide?: boolean; children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div onClick={e=>{ if(e.target===e.currentTarget) onClose() }} style={{ display:'flex', position:'fixed', inset:0, background:'rgba(10,8,4,0.88)', zIndex:100, alignItems:'center', justifyContent:'center', backdropFilter:'blur(2px)' }}>
      <div style={{ background:C.dark3, border:`1px solid ${C.border2}`, borderRadius:8, width:wide?680:560, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto', padding:30 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:2, marginBottom:6 }}>{title}</div>
        {sub && <div style={{ fontSize:11, color:C.muted, marginBottom:22, lineHeight:1.5 }}>{sub}</div>}
        {children}
      </div>
    </div>
  )
}
function MFooter({ onClose, onConfirm, label, isPending }: { onClose:()=>void; onConfirm:()=>void; label:string; isPending?:boolean }) {
  return <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:22, paddingTop:18, borderTop:`1px solid ${C.border}` }}><Btn variant="ghost" size="sm" onClick={onClose}>Cancel</Btn><Btn variant="primary" size="sm" onClick={onConfirm} disabled={isPending}>{isPending?'Saving...':label}</Btn></div>
}

// ── Course checkboxes ─────────────────────────────────────────────────────────

const COURSES = [
  { slug:'programming-the-gatekeeper',        name:'Programming the Gatekeeper',        num:'Personal · Course 1' },
  { slug:'law-of-assumption',                  name:'Law of Assumption',                  num:'Personal · Course 2' },
  { slug:'sats-reprogramming',                 name:'SATS Reprogramming',                 num:'Personal · Course 3' },
  { slug:'echo-theory-delay',                  name:'Echo Theory Delay',                  num:'Personal · Course 4' },
  { slug:'common-sense-in-the-workplace',      name:'Common Sense in the Workplace',      num:'Business · Course 1' },
  { slug:'from-reaction-to-response',          name:'From Reaction to Response',          num:'Business · Course 2' },
  { slug:'know-yourself-lead-yourself',        name:'Know Yourself, Lead Yourself',       num:'Business · Course 3' },
  { slug:'the-high-frequency-team',            name:'The High-Frequency Team',            num:'Business · Course 4' },
  { slug:'ed01',                               name:'The Educator Reset',                 num:'Educators · Course 1' },
  { slug:'ed02',                               name:'Vibrational Leadership',             num:'Educators · Course 2' },
  { slug:'ed03',                               name:'Co-Regulation Mastery',              num:'Educators · Course 3' },
  { slug:'ed04',                               name:'The Retained Educator',              num:'Educators · Course 4' },
  { slug:'leadership_course_1',                name:'The Internal Authority',             num:'Leadership · Course 1' },
  { slug:'leadership_course_2',                name:'Visionary Architecture',             num:'Leadership · Course 2' },
  { slug:'leadership_course_3',                name:'The Bridge of Incidents',            num:'Leadership · Course 3' },
  { slug:'leadership_course_4',                name:'Echo Theory Mastery',                num:'Leadership · Course 4' },
]

function CourseChecks({ selected, onChange }: { selected: string[]; onChange: (s: string[]) => void }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
      {COURSES.map(c => {
        const checked = selected.includes(c.slug)
        return (
          <label key={c.slug} onClick={() => onChange(checked ? selected.filter(s=>s!==c.slug) : [...selected,c.slug])}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', cursor:'pointer', background:checked?'rgba(232,98,26,0.06)':C.dark5, border:`1px solid ${checked?'rgba(232,98,26,0.3)':C.border}`, borderRadius:3 }}>
            <div style={{ width:14, height:14, borderRadius:2, flexShrink:0, background:checked?C.orange:'transparent', border:`1px solid ${checked?C.orange:C.border2}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {checked && <span style={{ color:'#fff', fontSize:10 }}>✓</span>}
            </div>
            <div>
              <div style={{ fontSize:12 }}>{c.name}</div>
              <div style={{ fontSize:9, color:C.muted }}>{c.num}</div>
            </div>
          </label>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ADD USER MODAL
// ══════════════════════════════════════════════════════════════════════════════

function AddUserModal({ open, onClose, onSuccess, orgOptions }: {
  open: boolean; onClose: ()=>void; onSuccess: (m:string)=>void; orgOptions: { id:string; name:string }[]
}) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', institutionType:'individual', orgId:'', membershipTier:'elite', bypassReason:'Partner', bypassExpiry:'', bypassNotes:'' })
  const [courses, setCourses] = useState(COURSES.map(c=>c.slug))
  const set = (k: string, v: string) => setForm(f=>({...f,[k]:v}))

  function submit() {
    startTransition(async () => {
      const res = await addBypassUser({ firstName:form.firstName, lastName:form.lastName, email:form.email, institutionType:form.institutionType, orgId:form.orgId||null, membershipTier:form.membershipTier, courseAccess:courses, bypassReason:form.bypassReason, bypassExpiry:form.bypassExpiry||null, bypassNotes:form.bypassNotes, sendWelcomeEmail:true })
      if (res.success) { onClose(); onSuccess('User added & payment bypassed.') } else onSuccess(`Error: ${res.error}`)
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Add User — Bypass Payment" sub="This user receives full platform access without completing payment. Action is logged." wide>
      <Notice icon="⚡">Payment bypass active. This user will not be billed.</Notice>
      <SDivider label="User Details"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <FField label="First Name"><input value={form.firstName} onChange={e=>set('firstName',e.target.value)} style={IS} placeholder="First name"/></FField>
        <FField label="Last Name"><input value={form.lastName} onChange={e=>set('lastName',e.target.value)} style={IS} placeholder="Last name"/></FField>
        <FField label="Email Address" span2><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} style={IS} placeholder="user@domain.com"/></FField>
      </div>
      <SDivider label="Access Configuration"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <FField label="Institution Type">
          <select value={form.institutionType} onChange={e=>set('institutionType',e.target.value)} style={IS}>
            <option value="individual">Individual</option>
            <option value="education">Education</option>
            <option value="business">Business</option>
            <option value="leadership">Leadership</option>
          </select>
        </FField>
        <FField label="Assign to Organization (optional)">
          <select value={form.orgId} onChange={e=>set('orgId',e.target.value)} style={IS}>
            <option value="">— None (standalone) —</option>
            {orgOptions.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </FField>
        <FField label="Membership Tier">
          <select value={form.membershipTier} onChange={e=>set('membershipTier',e.target.value)} style={IS}>
            <option value="free">Seeker</option>
            <option value="architect">Architect</option>
            <option value="elite">Reality Master</option>
          </select>
        </FField>
        <FField label="Bypass Reason">
          <select value={form.bypassReason} onChange={e=>set('bypassReason',e.target.value)} style={IS}>
            {['Partner','Press / Media','Affiliate','Pilot / Trial','Internal / Test','Scholarship','Influencer','Other'].map(o=><option key={o}>{o}</option>)}
          </select>
        </FField>
        <FField label="Access Expiry (blank = never)" span2><input type="date" value={form.bypassExpiry} onChange={e=>set('bypassExpiry',e.target.value)} style={IS}/></FField>
      </div>
      <SDivider label="Course Access"/>
      <div style={{ marginBottom:14 }}><CourseChecks selected={courses} onChange={setCourses}/></div>
      <SDivider label="Notes"/>
      <textarea value={form.bypassNotes} onChange={e=>set('bypassNotes',e.target.value)} style={{ ...IS, width:'100%', resize:'vertical', minHeight:72 }} placeholder="e.g. Met at AfroTech 2026, agreed to 90-day partner access..."/>
      <MFooter onClose={onClose} onConfirm={submit} label="⚡ Add User & Bypass Payment" isPending={isPending}/>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ADD ORGANIZATION MODAL
// ══════════════════════════════════════════════════════════════════════════════

function AddOrgModal({ open, onClose, onSuccess }: { open: boolean; onClose: ()=>void; onSuccess: (m:string)=>void }) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ name:'', segment:'business', industry:'', website:'', domain:'', adminFirst:'', adminLast:'', adminEmail:'', tier:'elite', seats:25, bypassReason:'Pilot Program', bypassExpiry:'', bypassNotes:'' })
  const [courses, setCourses] = useState(COURSES.map(c=>c.slug))
  const set = (k: string, v: string|number) => setForm(f=>({...f,[k]:v}))

  function submit() {
    startTransition(async () => {
      const res = await addBypassOrg({ name:form.name, segment:form.segment, industry:form.industry, website:form.website, domain:form.domain, adminFirstName:form.adminFirst, adminLastName:form.adminLast, adminEmail:form.adminEmail, tier:form.tier, seats:form.seats, courseAccess:courses, bypassReason:form.bypassReason, bypassExpiry:form.bypassExpiry||null, bypassNotes:form.bypassNotes, sendOnboarding:true })
      if (res.success) { onClose(); onSuccess('Organization created. Admin onboarding email sent.') } else onSuccess(`Error: ${res.error}`)
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Organization — Bypass Payment" sub="Create an organization with full access and no billing. Can be converted to paid at any time." wide>
      <Notice icon="⬡">This organization will be active immediately with no billing attached.</Notice>
      <SDivider label="Organization Details"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <FField label="Organization Name" span2><input value={form.name} onChange={e=>set('name',e.target.value)} style={IS} placeholder="e.g. Horizon Leadership Academy"/></FField>
        <FField label="Segment">
          <select value={form.segment} onChange={e=>set('segment',e.target.value)} style={IS}>
            <option value="business">Business / Corporate</option>
            <option value="small-business">Small Business</option>
            <option value="education">Education (General)</option>
            <option value="k12">K-12 District</option>
            <option value="university">University / College</option>
            <option value="leadership">Leadership / Community</option>
            <option value="nonprofit">Nonprofit</option>
            <option value="government">Government</option>
            <option value="healthcare">Healthcare</option>
            <option value="personal">Personal / Individual</option>
          </select>
        </FField>
        <FField label="Industry">
          <select value={form.industry} onChange={e=>set('industry',e.target.value)} style={IS}>
            {['Financial Services','Technology','Healthcare','Education','Retail','Government','Other'].map(o=><option key={o}>{o}</option>)}
          </select>
        </FField>
        <FField label="Website (optional)"><input value={form.website} onChange={e=>set('website',e.target.value)} style={IS} placeholder="https://..."/></FField>
        <FField label="Domain Restriction (optional)"><input value={form.domain} onChange={e=>set('domain',e.target.value)} style={IS} placeholder="@company.com"/></FField>
      </div>
      <SDivider label="Admin Contact"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <FField label="First Name"><input value={form.adminFirst} onChange={e=>set('adminFirst',e.target.value)} style={IS} placeholder="First name"/></FField>
        <FField label="Last Name"><input value={form.adminLast} onChange={e=>set('adminLast',e.target.value)} style={IS} placeholder="Last name"/></FField>
        <FField label="Admin Email" span2><input type="email" value={form.adminEmail} onChange={e=>set('adminEmail',e.target.value)} style={IS} placeholder="admin@org.com"/></FField>
      </div>
      <SDivider label="Plan & Seats"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <FField label="Tier">
          <select value={form.tier} onChange={e=>set('tier',e.target.value)} style={IS}>
            <option value="free">Seeker (Course 1 only)</option>
            <option value="architect">Architect (Courses 1–3)</option>
            <option value="elite">Reality Master Elite (All 4)</option>
          </select>
        </FField>
        <FField label="Seats"><input type="number" value={form.seats} onChange={e=>set('seats',parseInt(e.target.value)||1)} style={IS} min={1} max={10000}/></FField>
      </div>
      <SDivider label="Course Access Override"/>
      <div style={{ marginBottom:14 }}><CourseChecks selected={courses} onChange={setCourses}/></div>
      <SDivider label="Bypass Details"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <FField label="Bypass Reason">
          <select value={form.bypassReason} onChange={e=>set('bypassReason',e.target.value)} style={IS}>
            {['Pilot Program','Partnership','Demo / Sales Trial','Scholarship Institution','Internal','Other'].map(o=><option key={o}>{o}</option>)}
          </select>
        </FField>
        <FField label="Bypass Expiry (blank = never)"><input type="date" value={form.bypassExpiry} onChange={e=>set('bypassExpiry',e.target.value)} style={IS}/></FField>
        <FField label="Internal Notes" span2><textarea value={form.bypassNotes} onChange={e=>set('bypassNotes',e.target.value)} style={{ ...IS, resize:'vertical', minHeight:72 }} placeholder="e.g. Demo for SHRM conference..."/></FField>
      </div>
      <MFooter onClose={onClose} onConfirm={submit} label="⬡ Create Organization & Bypass Payment" isPending={isPending}/>
    </Modal>
  )
}

// ── Edit Bypass Modal ─────────────────────────────────────────────────────────

type EditTarget = { type:'user'|'organization'; id:string; name:string; tier:string; reason:string|null; expiry:string|null } | null

function EditBypassModal({ open, onClose, onSuccess, target }: { open:boolean; onClose:()=>void; onSuccess:(m:string)=>void; target:EditTarget }) {
  const [isPending, startTransition] = useTransition()
  const [tier, setTier]     = useState(target?.tier ?? 'elite')
  const [reason, setReason] = useState(target?.reason ?? 'Partner')
  const [expiry, setExpiry] = useState(target?.expiry ? target.expiry.slice(0,10) : '')
  if (!target) return null
  function save() {
    startTransition(async () => {
      const res = await updateBypassDetails(target!.type, target!.id, target!.name, { tier, bypassReason:reason, bypassExpiry:expiry||null })
      if (res.success) { onClose(); onSuccess('Bypass updated.') } else onSuccess(`Error: ${res.error}`)
    })
  }
  return (
    <Modal open={open} onClose={onClose} title="Edit Bypass Access" sub="Modify tier, expiry, or reason for this account.">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <FField label="Membership Tier"><select value={tier} onChange={e=>setTier(e.target.value)} style={IS}><option value="free">Seeker</option><option value="architect">Architect</option><option value="elite">Reality Master</option></select></FField>
        <FField label="Bypass Reason"><select value={reason} onChange={e=>setReason(e.target.value)} style={IS}>{['Partner','Press / Media','Affiliate','Pilot / Trial','Internal / Test','Scholarship','Other'].map(o=><option key={o}>{o}</option>)}</select></FField>
        <FField label="Expiry (blank = never)" span2><input type="date" value={expiry} onChange={e=>setExpiry(e.target.value)} style={IS}/></FField>
      </div>
      <MFooter onClose={onClose} onConfirm={save} label="Save Changes" isPending={isPending}/>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// EDIT USER MODAL
// ══════════════════════════════════════════════════════════════════════════════

type EditUser = { id: string; full_name: string | null; email: string; membership_tier: string; institution_type: string; org_id: string | null } | null

function EditUserModal({ open, onClose, onSuccess, user, orgOptions }: {
  open: boolean; onClose: ()=>void; onSuccess: (m: string)=>void
  user: EditUser; orgOptions: { id: string; name: string }[]
}) {
  const [tab, setTab]           = useState<'profile'|'password'>('profile')
  const [isPending, startTrans] = useTransition()
  const [form, setForm]         = useState({ fullName:'', email:'', membershipTier:'free', institutionType:'individual', orgId:'' })
  const [pw, setPw]             = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.full_name??'', email: user.email, membershipTier: user.membership_tier, institutionType: user.institution_type, orgId: user.org_id??'' })
      setPw(''); setConfirmPw('')
    }
  }, [user])

  if (!user) return null
  const set = (k: string, v: string) => setForm(f => ({...f, [k]: v}))

  const tabSty = (active: boolean): React.CSSProperties => ({
    fontSize:11, fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase',
    padding:'9px 16px', color:active?C.orange:C.muted, cursor:'pointer',
    borderBottom:active?`2px solid ${C.orange}`:'2px solid transparent',
    marginBottom:-1, background:'none', border:'none',
  })

  function saveProfile() {
    startTrans(async () => {
      const res = await updateUserProfile(user!.id, user!.full_name??user!.email, {
        fullName: form.fullName, email: form.email,
        membershipTier: form.membershipTier, institutionType: form.institutionType,
        orgId: form.orgId || null,
      })
      if (res.success) { onClose(); onSuccess('User profile updated.') }
      else onSuccess(`Error: ${res.error}`)
    })
  }

  function setPassword() {
    if (pw.length < 8) return onSuccess('Error: Password must be at least 8 characters.')
    if (pw !== confirmPw) return onSuccess('Error: Passwords do not match.')
    startTrans(async () => {
      const res = await adminSetUserPassword(user!.id, user!.full_name??user!.email, pw)
      if (res.success) { setPw(''); setConfirmPw(''); onSuccess('Password set successfully.') }
      else onSuccess(`Error: ${res.error}`)
    })
  }

  function resetEmail() {
    startTrans(async () => {
      const res = await sendPasswordResetEmail(user!.id, user!.email, user!.full_name??user!.email)
      if (res.success) onSuccess(`Password reset email sent to ${user!.email}`)
      else onSuccess(`Error: ${res.error}`)
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={`Edit User`} sub={user.email} wide>
      <div style={{ display:'flex', gap:2, marginBottom:20, borderBottom:`1px solid ${C.border}` }}>
        <button style={tabSty(tab==='profile')}  onClick={()=>setTab('profile')}>Profile</button>
        <button style={tabSty(tab==='password')} onClick={()=>setTab('password')}>Password</button>
      </div>

      {tab==='profile' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <FField label="Full Name"><input value={form.fullName} onChange={e=>set('fullName',e.target.value)} style={IS} placeholder="Full name"/></FField>
            <FField label="Email Address"><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} style={IS} placeholder="user@domain.com"/></FField>
            <FField label="Membership Tier">
              <select value={form.membershipTier} onChange={e=>set('membershipTier',e.target.value)} style={IS}>
                <option value="free">Seeker</option>
                <option value="architect">Architect</option>
                <option value="elite">Reality Master</option>
              </select>
            </FField>
            <FField label="Institution Type">
              <select value={form.institutionType} onChange={e=>set('institutionType',e.target.value)} style={IS}>
                <option value="individual">Individual</option>
                <option value="education">Education</option>
                <option value="business">Business</option>
                <option value="leadership">Leadership</option>
              </select>
            </FField>
            <FField label="Organization (optional)" span2>
              <select value={form.orgId} onChange={e=>set('orgId',e.target.value)} style={IS}>
                <option value="">— None (standalone) —</option>
                {orgOptions.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </FField>
          </div>
          <MFooter onClose={onClose} onConfirm={saveProfile} label="Save Profile" isPending={isPending}/>
        </>
      )}

      {tab==='password' && (
        <>
          <SDivider label="Set New Password Directly"/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <FField label="New Password"><input type="password" value={pw} onChange={e=>setPw(e.target.value)} style={IS} placeholder="Min 8 characters"/></FField>
            <FField label="Confirm Password"><input type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} style={IS} placeholder="Re-enter password"/></FField>
          </div>
          <Btn variant="primary" size="md" onClick={setPassword} disabled={isPending||pw.length<8||pw!==confirmPw}>Set Password</Btn>

          <SDivider label="Send Reset Link by Email"/>
          <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>
            Send a password reset email to <strong style={{ color:C.cream }}>{user.email}</strong>. The user clicks the link to choose their own password.
          </div>
          <Btn variant="gold" size="md" onClick={resetEmail} disabled={isPending}>Send Reset Email →</Btn>

          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:22, paddingTop:18, borderTop:`1px solid ${C.border}` }}>
            <Btn variant="ghost" size="sm" onClick={onClose}>Close</Btn>
          </div>
        </>
      )}
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGES
// ══════════════════════════════════════════════════════════════════════════════

function OverviewPage({ stats, bypassUsers, auditLog, orgs, onNav, onAddUser, onAddOrg }: {
  stats: SuperAdminStats; bypassUsers: BypassUser[]; auditLog: AuditEntry[]
  orgs: SAOrg[]; onNav: (p: PageId)=>void; onAddUser: ()=>void; onAddOrg: ()=>void
}) {
  const DOT = [C.orange, C.gold, C.blue, C.green, C.red]
  const kpis = [
    { label:'Total Users',       val:stats.totalUsers,        accent:C.orange },
    { label:'Organizations',     val:stats.totalOrgs,         accent:C.gold },
    { label:'Bypassed Accounts', val:stats.bypassedAccounts,  accent:C.green },
    { label:'MRR',               val:`$${(stats.mrr/1000).toFixed(1)}k`, accent:C.blue },
    { label:'Pending Reviews',   val:stats.pendingReviews,    accent:C.red },
  ]
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:24 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background:C.dark3, border:`1px solid ${C.border}`, borderRadius:6, padding:'18px 16px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${k.accent},transparent)` }}/>
            <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:C.muted, marginBottom:8 }}>{k.label}</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:34, lineHeight:1 }}>{k.val}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:18, marginBottom:22 }}>
        <Card>
          <SecHd title="Recently Bypassed" sub="Users added without payment" action={<Btn variant="ghost" size="sm" onClick={()=>onNav('bypass')}>View All →</Btn>}/>
          <Tbl cols={['Name','Type','Tier','Reason','Added']}>
            {bypassUsers.slice(0,5).map(u=>(
              <TR key={u.id}>
                <TName name={u.full_name??'—'} sub={u.email}/>
                <TD>{typePill(u.institution_type)}</TD>
                <TD>{tierPill(u.membership_tier)}</TD>
                <TD><Tag bypass label={u.bypass_reason??'—'}/></TD>
                <TD muted>{timeAgo(u.created_at)}</TD>
              </TR>
            ))}
            {bypassUsers.length===0 && <TR><td colSpan={5} style={{ padding:'20px 12px', textAlign:'center', color:C.muted, fontSize:12 }}>No bypassed users yet.</td></TR>}
          </Tbl>
        </Card>
        <Card>
          <SecHd title="Audit Feed" sub="Recent super admin actions"/>
          {auditLog.slice(0,5).map((e,i)=>(
            <div key={e.id} style={{ display:'flex', gap:10, padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:3 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:DOT[i%5], flexShrink:0 }}/>
                {i<4 && <div style={{ width:1, flex:1, background:C.border, marginTop:4 }}/>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, lineHeight:1.5 }}><span style={{ color:C.orange }}>{e.action}</span>{e.target_name && <> — <span style={{ color:C.gold }}>{e.target_name}</span></>}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{timeAgo(e.created_at)}</div>
              </div>
            </div>
          ))}
          {auditLog.length===0 && <div style={{ fontSize:12, color:C.muted, paddingTop:8 }}>No activity yet.</div>}
        </Card>
      </div>
      <Card>
        <SecHd title="Organization Snapshot" sub="All organizations at a glance" action={<Btn variant="ghost" size="sm" onClick={()=>onNav('orgs')}>Manage All →</Btn>}/>
        <Tbl cols={['Organization','Segment','Tier','Seats','Bypass','Status','MRR','Actions']}>
          {orgs.slice(0,6).map(o=>(
            <TR key={o.id}>
              <TName name={o.name} sub={o.admin_email??'—'}/>
              <TD>{segPill(o.segment)}</TD>
              <TD>{tierPill(o.tier)}</TD>
              <TD><ProgBar value={o.seats_used} max={o.seats_purchased}/></TD>
              <TD><Tag bypass={o.is_bypassed} label={o.is_bypassed?(o.bypass_reason??'Bypass'):'Paid'}/></TD>
              <TD><Pill v={o.status as PillV} label={o.status}/></TD>
              <TD muted={o.mrr===0}><span style={{ color:o.mrr>0?C.gold:C.muted }}>{o.mrr>0?`$${o.mrr.toLocaleString()}`:'$0'}</span></TD>
              <TD><Btn variant="ghost" size="sm" onClick={()=>onNav('orgs')}>Manage</Btn></TD>
            </TR>
          ))}
        </Tbl>
      </Card>
    </div>
  )
}

function BypassPage({ bypassUsers, bypassOrgs, onEdit, onToast, onAddUser, onAddOrg, onEditAdmin }: {
  bypassUsers: BypassUser[]; bypassOrgs: BypassOrg[]
  onEditAdmin: (o:{id:string;name:string;admin_email:string|null})=>void
  onEdit: (t: EditTarget)=>void; onToast: (m:string)=>void; onAddUser:()=>void; onAddOrg:()=>void
}) {
  const [tab, setTab] = useState<'users'|'orgs'>('users')
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleRevokeUser(u: BypassUser) {
    startTransition(async () => {
      const res = await revokeUserBypass(u.id, u.email)
      if (res.success) { onToast('Bypass revoked.'); router.refresh() } else onToast(`Error: ${res.error}`)
    })
  }
  function handleRevokeOrg(o: BypassOrg) {
    startTransition(async () => {
      const res = await revokeOrgBypass(o.id, o.name)
      if (res.success) { onToast('Organization bypass revoked.'); router.refresh() } else onToast(`Error: ${res.error}`)
    })
  }

  const tabSty = (active: boolean): React.CSSProperties => ({
    fontSize:11, fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase',
    padding:'9px 16px', color:active?C.orange:C.muted, cursor:'pointer',
    borderBottom:active?`2px solid ${C.orange}`:'2px solid transparent',
    marginBottom:-1, background:'none', border:'none',
  })

  const filteredUsers = bypassUsers.filter(u=>`${u.full_name} ${u.email} ${u.bypass_reason}`.toLowerCase().includes(query.toLowerCase()))
  const filteredOrgs  = bypassOrgs.filter(o=>o.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <Notice icon="⚡"><span><strong>Bypass Mode:</strong> Users and organizations added here get full access without payment. All actions are logged with your admin ID.</span></Notice>
      <div style={{ display:'flex', gap:2, marginBottom:20, borderBottom:`1px solid ${C.border}` }}>
        <button style={tabSty(tab==='users')} onClick={()=>setTab('users')}>Bypassed Users</button>
        <button style={tabSty(tab==='orgs')}  onClick={()=>setTab('orgs')}>Bypassed Organizations</button>
      </div>

      {tab==='users' && (
        <>
          <div style={{ display:'flex', gap:10, marginBottom:14 }}>
            <SearchInput placeholder="Search bypassed users..." value={query} onChange={setQuery}/>
            <Btn variant="primary" size="sm" onClick={onAddUser}>+ Add User (Bypass)</Btn>
          </div>
          <Card>
            <Tbl cols={['User','Type','Organization','Tier','Reason','Expires','Actions']}>
              {filteredUsers.map(u=>(
                <TR key={u.id}>
                  <TName name={u.full_name??'—'} sub={u.email}/>
                  <TD>{typePill(u.institution_type)}</TD>
                  <TD muted>{u.org_name??'—'}</TD>
                  <TD>{tierPill(u.membership_tier)}</TD>
                  <TD><Tag bypass label={u.bypass_reason??'—'}/></TD>
                  <TD muted>{formatExpiry(u.bypass_expiry)}</TD>
                  <TD><div style={{ display:'flex', gap:6 }}>
                    <Btn variant="ghost" size="sm" onClick={()=>onEdit({ type:'user', id:u.id, name:u.full_name??u.email, tier:u.membership_tier, reason:u.bypass_reason, expiry:u.bypass_expiry })}>Edit</Btn>
                    <Btn variant="danger" size="sm" onClick={()=>handleRevokeUser(u)} disabled={isPending}>Revoke</Btn>
                  </div></TD>
                </TR>
              ))}
              {filteredUsers.length===0 && <TR><td colSpan={7} style={{ padding:'20px 12px', textAlign:'center', color:C.muted, fontSize:12 }}>No bypassed users.</td></TR>}
            </Tbl>
          </Card>
        </>
      )}

      {tab==='orgs' && (
        <>
          <div style={{ display:'flex', gap:10, marginBottom:14 }}>
            <SearchInput placeholder="Search bypassed organizations..." value={query} onChange={setQuery}/>
            <Btn variant="primary" size="sm" onClick={onAddOrg}>+ Add Organization (Bypass)</Btn>
          </div>
          <Card>
            <Tbl cols={['Organization','Segment','Tier','Seats','Reason','Expires','Admin','Actions']}>
              {filteredOrgs.map(o=>(
                <TR key={o.id}>
                  <TName name={o.name} sub={o.admin_email??'—'}/>
                  <TD>{segPill(o.segment)}</TD>
                  <TD>{tierPill(o.tier)}</TD>
                  <TD>{o.seats_purchased} seats</TD>
                  <TD><Tag bypass label={o.bypass_reason??'—'}/></TD>
                  <TD muted>{formatExpiry(o.bypass_expiry)}</TD>
                  <TD muted><span style={{ fontSize:11 }}>{o.admin_email??'—'}</span></TD>
                  <TD><div style={{ display:'flex', gap:6 }}>
                    <Btn variant="ghost" size="sm" onClick={()=>onEdit({ type:'organization', id:o.id, name:o.name, tier:o.tier, reason:o.bypass_reason, expiry:o.bypass_expiry })}>Edit</Btn>
                    <Btn variant="ghost" size="sm" onClick={()=>onEditAdmin({ id:o.id, name:o.name, admin_email:o.admin_email })}>Edit Admin</Btn>
                    <Btn variant="danger" size="sm" onClick={()=>handleRevokeOrg(o)} disabled={isPending}>Revoke</Btn>
                  </div></TD>
                </TR>
              ))}
              {filteredOrgs.length===0 && <TR><td colSpan={8} style={{ padding:'20px 12px', textAlign:'center', color:C.muted, fontSize:12 }}>No bypassed organizations.</td></TR>}
            </Tbl>
          </Card>
        </>
      )}
    </div>
  )
}

// ── EditOrgAdminModal ─────────────────────────────────────────────────────────

function EditOrgAdminModal({ open, onClose, onSuccess, org }: {
  open: boolean
  onClose: () => void
  onSuccess: (msg: string) => void
  org: { id: string; name: string; admin_email: string | null } | null
}) {
  const [email, setEmail]       = useState('')
  const [fullName, setFullName] = useState('')
  const [isPending, startTransition] = useTransition()
  const [err, setErr]           = useState('')

  React.useEffect(() => {
    if (open && org) { setEmail(org.admin_email ?? ''); setFullName(''); setErr('') }
  }, [open, org])

  function handleSave() {
    if (!org) return
    setErr('')
    startTransition(async () => {
      const res = await updateOrgAdmin(org.id, org.name, { email, fullName })
      if (res.success) { onSuccess(`Admin updated for ${org.name}.`); onClose() }
      else setErr(res.error ?? 'Failed to update admin.')
    })
  }

  if (!open || !org) return null
  return (
    <Modal open={open} onClose={onClose} title="Edit Org Admin" sub={`Update the admin contact for ${org.name}`}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <FField label="Admin Email" span2>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={IS} placeholder="admin@org.com"/>
        </FField>
        <FField label="Full Name (optional)" span2>
          <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} style={IS} placeholder="First Last"/>
        </FField>
        {err && <p style={{ color:C.red, fontSize:12, margin:0 }}>{err}</p>}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Btn variant="ghost" size="sm" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" size="sm" onClick={handleSave} disabled={isPending || !email}>
            {isPending ? 'Saving…' : 'Save Changes'}
          </Btn>
        </div>
      </div>
    </Modal>
  )
}

function OrgsPage({ orgs, onToast, onAddOrg, onAddUser, onDeleteOrg, onEditAdmin }: { orgs:SAOrg[]; onToast:(m:string)=>void; onAddOrg:()=>void; onAddUser:()=>void; onDeleteOrg:(o:SAOrg)=>void; onEditAdmin:(o:{id:string;name:string;admin_email:string|null})=>void }) {
  const [query, setQuery] = useState('')
  const [segF, setSegF]   = useState('All Segments')
  const [tierF, setTierF] = useState('All Tiers')

  const filtered = orgs.filter(o => {
    const q = `${o.name} ${o.admin_email}`.toLowerCase().includes(query.toLowerCase())
    const s = segF==='All Segments' || o.segment===segF
    const t = tierF==='All Tiers' || o.tier===tierF
    return q && s && t
  })

  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:14 }}>
        <SearchInput placeholder="Search organizations..." value={query} onChange={setQuery}/>
        <FilterSel value={segF} onChange={setSegF} options={['All Segments','personal','educator','business','leadership']}/>
        <FilterSel value={tierF} onChange={setTierF} options={['All Tiers','free','architect','elite']}/>
        <Btn variant="gold" size="sm" onClick={()=>onToast('Exporting...')}>Export</Btn>
        <Btn variant="primary" size="sm" onClick={onAddOrg}>+ Add Organization</Btn>
      </div>
      <Card>
        <Tbl cols={['Organization','Segment','Tier','Seats','Bypass','MRR','Status','Admin','Actions']}>
          {filtered.map(o=>(
            <TR key={o.id}>
              <TName name={o.name} sub={o.admin_email??'—'}/>
              <TD>{segPill(o.segment)}</TD>
              <TD>{tierPill(o.tier)}</TD>
              <TD><ProgBar value={o.seats_used} max={o.seats_purchased}/></TD>
              <TD><Tag bypass={o.is_bypassed} label={o.is_bypassed?(o.bypass_reason??'Bypass'):'Paid'}/></TD>
              <TD muted={o.mrr===0}><span style={{ color:o.mrr>0?C.gold:C.muted }}>{o.mrr>0?`$${o.mrr.toLocaleString()}`:'$0'}</span></TD>
              <TD><Pill v={o.status as PillV} label={o.status}/></TD>
              <TD muted><span style={{ fontSize:11 }}>{o.admin_email??'—'}</span></TD>
              <TD><div style={{ display:'flex', gap:6 }}>
                <Btn variant="ghost" size="sm" onClick={()=>onEditAdmin({ id:o.id, name:o.name, admin_email:o.admin_email })}>Edit Admin</Btn>
                <Btn variant="ghost" size="sm" onClick={onAddUser}>+ User</Btn>
                <Btn variant="danger" size="sm" onClick={()=>onDeleteOrg(o)}>Delete</Btn>
              </div></TD>
            </TR>
          ))}
          {filtered.length===0 && <TR><td colSpan={9} style={{ padding:'20px 12px', textAlign:'center', color:C.muted, fontSize:12 }}>No organizations found.</td></TR>}
        </Tbl>
      </Card>
    </div>
  )
}

function UsersPage({ users, onToast, onAddUser, onInviteUser, onEdit, onDelete }: {
  users:SAUser[]; onToast:(m:string)=>void; onAddUser:()=>void; onInviteUser:()=>void
  onEdit:(u:EditUser)=>void; onDelete:(u:SAUser)=>void
}) {
  const [query, setQuery] = useState('')
  const [typeF, setTypeF] = useState('All Types')
  const [tierF, setTierF] = useState('All Tiers')
  const [isPending, startTransition] = useTransition()
  const [resetingId, setResetingId] = useState<string|null>(null)
  const router = useRouter()

  const uStatus = (u: SAUser) => u.is_bypassed ? 'bypassed' : (Date.now()-new Date(u.updated_at).getTime())/86400000 > 14 ? 'inactive' : 'active'

  const filtered = users.filter(u => {
    const q = `${u.full_name} ${u.email} ${u.org_name}`.toLowerCase().includes(query.toLowerCase())
    const t = typeF==='All Types' || u.institution_type===typeF
    const tier = tierF==='All Tiers' || u.membership_tier===tierF
    return q && t && tier
  })

  function handleDeactivate(u: SAUser) {
    startTransition(async () => {
      const res = await deactivateUser(u.id, u.full_name??u.email)
      if (res.success) { onToast('User deactivated.'); router.refresh() } else onToast(`Error: ${res.error}`)
    })
  }

  async function handleResetPassword(u: SAUser) {
    setResetingId(u.id)
    try {
      const res = await sendPasswordResetEmail(u.id, u.email, u.full_name??u.email)
      if (res.success) onToast(`✓ Password reset link sent to ${u.email}`)
      else onToast(`Error: ${res.error}`)
    } finally {
      setResetingId(null)
    }
  }

  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:14 }}>
        <SearchInput placeholder="Search all users..." value={query} onChange={setQuery}/>
        <FilterSel value={typeF} onChange={setTypeF} options={['All Types','individual','education','business','leadership']}/>
        <FilterSel value={tierF} onChange={setTierF} options={['All Tiers','free','architect','elite']}/>
        <Btn variant="gold" size="sm" onClick={onInviteUser}>+ Invite User</Btn>
        <Btn variant="primary" size="sm" onClick={onAddUser}>+ Add User (Bypass)</Btn>
      </div>
      <Card>
        <Tbl cols={['User','Type','Organization','Tier','Payment','Status','Actions']}>
          {filtered.map(u => {
            const s = uStatus(u)
            const isSendingReset = resetingId === u.id
            return (
              <TR key={u.id}>
                <TName name={u.full_name??'—'} sub={u.email} badge={u.role==='institution_admin'?'Org Admin':undefined}/>
                <TD>{typePill(u.institution_type)}</TD>
                <TD muted>{u.org_name??'—'}</TD>
                <TD>{tierPill(u.membership_tier)}</TD>
                <TD><Tag bypass={u.is_bypassed} label={u.is_bypassed?'Bypassed':'Paid'}/></TD>
                <TD>{s==='bypassed'?<Pill v="bypassed" label="Bypassed"/>:s==='active'?<Pill v="active" label="Active"/>:<Pill v="inactive" label="Inactive"/>}</TD>
                <TD><div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <Btn variant="ghost" size="sm" onClick={()=>onEdit({ id:u.id, full_name:u.full_name, email:u.email, membership_tier:u.membership_tier, institution_type:u.institution_type, org_id:u.org_id })}>Edit</Btn>
                  <Btn
                    variant="gold"
                    size="sm"
                    onClick={()=>handleResetPassword(u)}
                    disabled={isSendingReset || isPending}
                    title={`Send password reset link to ${u.email}`}
                  >
                    {isSendingReset ? 'Sending…' : 'Reset PW'}
                  </Btn>
                  {u.is_bypassed
                    ? <Btn variant="danger" size="sm" onClick={()=>onToast('Use Bypass Manager to revoke.')}>Revoke</Btn>
                    : <Btn variant="danger" size="sm" onClick={()=>handleDeactivate(u)} disabled={isPending}>Deactivate</Btn>
                  }
                  <Btn variant="danger" size="sm" onClick={()=>onDelete(u)} disabled={isPending}>Delete</Btn>
                </div></TD>
              </TR>
            )
          })}
          {filtered.length===0 && <TR><td colSpan={7} style={{ padding:'20px 12px', textAlign:'center', color:C.muted, fontSize:12 }}>No users found.</td></TR>}
        </Tbl>
      </Card>
    </div>
  )
}

function CoursesPage({ orgs, users, onToast }: { orgs:SAOrg[]; users:SAUser[]; onToast:(m:string)=>void }) {
  const [orgId, setOrgId]       = useState('')
  const [orgCourses, setOrgC]   = useState(COURSES.map(c=>c.slug))
  const [userEmail, setUserEmail] = useState('')
  const [userCourses, setUserC] = useState(['programming-the-gatekeeper'])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function saveOrg() {
    const org = orgs.find(o=>o.id===orgId)
    if (!org) return onToast('Select an organization first.')
    startTransition(async () => {
      const res = await overrideOrgCourseAccess(orgId, org.name, orgCourses)
      if (res.success) { onToast('Course access updated for organization.'); router.refresh() } else onToast(`Error: ${res.error}`)
    })
  }
  function saveUser() {
    const u = users.find(u=>u.email===userEmail||u.full_name===userEmail)
    if (!u) return onToast('User not found. Enter exact email or name.')
    startTransition(async () => {
      const res = await overrideUserCourseAccess(u.id, u.full_name??u.email, userCourses)
      if (res.success) { onToast('User course access updated.'); router.refresh() } else onToast(`Error: ${res.error}`)
    })
  }

  return (
    <div>
      <Notice icon="◆">Override course access per organization or individual user. Changes bypass the standard tier-access matrix. All overrides are logged.</Notice>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <Card>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:2, marginBottom:4 }}>By Organization</div>
          <div style={{ fontSize:11, color:C.muted, marginBottom:16 }}>Override course access for an entire organization</div>
          <FField label="Organization"><select value={orgId} onChange={e=>setOrgId(e.target.value)} style={{ ...IS, marginBottom:16 }}><option value="">Select organization...</option>{orgs.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></FField>
          <SDivider label="Course Access Override"/>
          <div style={{ marginBottom:16 }}><CourseChecks selected={orgCourses} onChange={setOrgC}/></div>
          <Btn variant="primary" size="md" onClick={saveOrg} disabled={isPending||!orgId}>Save Organization Override</Btn>
        </Card>
        <Card>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:2, marginBottom:4 }}>By User</div>
          <div style={{ fontSize:11, color:C.muted, marginBottom:16 }}>Override access for a specific user regardless of tier</div>
          <FField label="User Email or Name"><input value={userEmail} onChange={e=>setUserEmail(e.target.value)} style={{ ...IS, marginBottom:16 }} placeholder="Email or name..."/></FField>
          <SDivider label="Course Access Override"/>
          <div style={{ marginBottom:16 }}><CourseChecks selected={userCourses} onChange={setUserC}/></div>
          <Btn variant="primary" size="md" onClick={saveUser} disabled={isPending||!userEmail}>Save User Override</Btn>
        </Card>
      </div>
    </div>
  )
}

function ActivityPage({ auditLog, onToast }: { auditLog:AuditEntry[]; onToast:(m:string)=>void }) {
  const [query, setQuery] = useState('')
  const [actionF, setActionF] = useState('All Actions')
  const actions = ['All Actions', ...Array.from(new Set(auditLog.map(e=>e.action)))]
  const filtered = auditLog.filter(e => {
    const q = `${e.action} ${e.target_name} ${e.details} ${e.admin_email}`.toLowerCase().includes(query.toLowerCase())
    const a = actionF==='All Actions' || e.action===actionF
    return q && a
  })
  const aColor = (a: string) => a.includes('BYPASS')?C.gold:a.includes('DEACTIVATED')||a.includes('REVOKED')?C.red:a.includes('COURSE')?C.blue:C.green
  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:14 }}>
        <SearchInput placeholder="Search audit log..." value={query} onChange={setQuery}/>
        <FilterSel value={actionF} onChange={setActionF} options={actions}/>
        <Btn variant="ghost" size="sm" onClick={()=>onToast('Exporting audit log...')}>Export Log</Btn>
      </div>
      <Card>
        <Tbl cols={['Timestamp','Action','Target','Details','Admin']}>
          {filtered.map(e=>(
            <TR key={e.id}>
              <TD muted>{formatDate(e.created_at)}</TD>
              <TD><span style={{ fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', padding:'2px 6px', borderRadius:2, background:'rgba(201,168,76,0.1)', color:aColor(e.action) }}>{e.action}</span></TD>
              <TD>{e.target_name??'—'}</TD>
              <TD muted>{e.details??'—'}</TD>
              <TD muted>{e.admin_email}</TD>
            </TR>
          ))}
          {filtered.length===0 && <TR><td colSpan={5} style={{ padding:'20px 12px', textAlign:'center', color:C.muted, fontSize:12 }}>No audit entries found.</td></TR>}
        </Tbl>
      </Card>
    </div>
  )
}

function SettingsPage({ onToast }: { onToast:(m:string)=>void }) {
  const [s, setS] = useState({ requireBypassReason:true, bypassExpiry:true, notifyConvert:true, twoAdmin:false })
  const tog = (k: keyof typeof s) => setS(prev=>({...prev,[k]:!prev[k]}))
  const opts: { k: keyof typeof s; label:string; desc:string }[] = [
    { k:'requireBypassReason', label:'Require bypass reason',            desc:'Force a reason field on all bypass actions' },
    { k:'bypassExpiry',        label:'Bypass expiry enforcement',        desc:'Auto-revoke bypassed access on expiry date' },
    { k:'notifyConvert',       label:'Notify on bypass convert to paid', desc:'Email you when a bypassed account upgrades to paid' },
    { k:'twoAdmin',            label:'Two-admin confirmation for revocations', desc:'Require a second super admin to confirm access revocations' },
  ]
  return (
    <div>
      <Card style={{ maxWidth:600 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:2, marginBottom:18 }}>Platform Settings</div>
        <SDivider label="Super Admin Access"/>
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:18 }}>
          {opts.map(o=>(
            <div key={o.k} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500 }}>{o.label}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{o.desc}</div>
              </div>
              <Toggle checked={s[o.k]} onChange={()=>tog(o.k)}/>
            </div>
          ))}
        </div>
        <Btn variant="primary" size="md" onClick={()=>onToast('Platform settings saved.')}>Save Settings</Btn>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// INVITE USER MODAL (non-bypass — sends email invite)
// ══════════════════════════════════════════════════════════════════════════════

function InviteUserModal({ open, onClose, onSuccess, orgOptions }: {
  open: boolean; onClose: ()=>void; onSuccess: (m:string)=>void
  orgOptions: { id:string; name:string }[]
}) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ email:'', role:'personal', institutionType:'individual', orgId:'', membershipTier:'free' })
  const set = (k: string, v: string) => setForm(f=>({...f,[k]:v}))

  function submit() {
    if (!form.email.trim()) return onSuccess('Error: Email is required.')
    startTransition(async () => {
      const res = await inviteUserBySuperAdmin({
        email: form.email.trim().toLowerCase(),
        role: form.role,
        institutionType: form.institutionType,
        orgId: form.orgId || null,
        membershipTier: form.membershipTier,
      })
      if (res.success) { onClose(); onSuccess('Invite sent — user will receive an email to set their password.') }
      else onSuccess(`Error: ${res.error}`)
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite User" sub="Send an email invitation. The user sets their own password on first login." wide>
      <SDivider label="User Details"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <FField label="Email Address" span2><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} style={IS} placeholder="user@domain.com"/></FField>
        <FField label="Institution Type">
          <select value={form.institutionType} onChange={e=>set('institutionType',e.target.value)} style={IS}>
            <option value="individual">Individual</option>
            <option value="education">Education</option>
            <option value="business">Business</option>
            <option value="leadership">Leadership</option>
          </select>
        </FField>
        <FField label="Role">
          <select value={form.role} onChange={e=>set('role',e.target.value)} style={IS}>
            <option value="personal">Personal</option>
            <option value="business">Business</option>
            <option value="educator">Educator</option>
            <option value="leader">Leadership</option>
            <option value="institution_admin">Institution Admin</option>
          </select>
        </FField>
        <FField label="Membership Tier">
          <select value={form.membershipTier} onChange={e=>set('membershipTier',e.target.value)} style={IS}>
            <option value="free">Seeker (Free)</option>
            <option value="architect">Architect</option>
            <option value="elite">Reality Master</option>
          </select>
        </FField>
        <FField label="Assign to Organization (optional)">
          <select value={form.orgId} onChange={e=>set('orgId',e.target.value)} style={IS}>
            <option value="">— None (standalone) —</option>
            {orgOptions.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </FField>
      </div>
      <MFooter onClose={onClose} onConfirm={submit} label="Send Invite" isPending={isPending}/>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// DELETE USER MODAL (hard delete — irreversible)
// ══════════════════════════════════════════════════════════════════════════════

function DeleteUserModal({ open, onClose, onSuccess, user }: {
  open: boolean; onClose: ()=>void; onSuccess: (m:string)=>void; user: SAUser | null
}) {
  const [isPending, startTransition] = useTransition()
  if (!user) return null

  function confirm() {
    if (!user) return
    startTransition(async () => {
      const res = await deleteUser(user.id, user.full_name ?? user.email)
      if (res.success) { onClose(); onSuccess(`${user.full_name ?? user.email} has been permanently deleted.`) }
      else onSuccess(`Error: ${res.error}`)
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete User" sub="This is permanent and cannot be undone. The user will lose all access immediately.">
      <div style={{ background:'rgba(229,115,115,0.07)', border:`1px solid rgba(229,115,115,0.25)`, borderRadius:5, padding:'14px 16px', marginBottom:20, fontSize:13, color:C.red, lineHeight:1.6 }}>
        ⚠ You are about to permanently delete{' '}
        <strong style={{ color:C.cream }}>{user.full_name ?? user.email}</strong>
        {' '}({user.email}). Their profile, course access, and all data will be removed.
      </div>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:4 }}>
        <Btn variant="ghost" size="sm" onClick={onClose}>Cancel</Btn>
        <Btn variant="danger" size="sm" onClick={confirm} disabled={isPending}>{isPending ? 'Deleting...' : 'Delete Permanently'}</Btn>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// COURSE PROGRESS PAGE  (read-only)
// ══════════════════════════════════════════════════════════════════════════════

const COURSE_NAMES: Record<string, string> = {
  'c1':                          'Personal · Course 1 — Programming the Gatekeeper',
  'c2':                          'Personal · Course 2 — The Art of Assumption',
  'c3':                          'Personal · Course 3 — Advanced Manifestation',
  'c4':                          'Personal · Course 4 — Navigating the Echo Theory Delay',
  'common-sense-in-the-workplace': 'Business · Course 1 — Common Sense in the Workplace',
  'from-reaction-to-response':     'Business · Course 2 — From Reaction to Response',
  'know-yourself-lead-yourself':   'Business · Course 3 — Know Yourself, Lead Yourself',
  'the-high-frequency-team':       'Business · Course 4 — The High-Frequency Team',
  'ed01':                          'Educators · Course 1 — The Educator Reset',
  'ed02':                          'Educators · Course 2 — Vibrational Leadership',
  'ed03':                          'Educators · Course 3 — Co-Regulation Mastery',
  'ed04':                          'Educators · Course 4 — The Retained Educator',
  'leadership_course_1':           'Leadership · Course 1 — The Internal Authority',
  'leadership_course_2':           'Leadership · Course 2 — Visionary Architecture',
  'leadership_course_3':           'Leadership · Course 3 — The Bridge of Incidents',
  'leadership_course_4':           'Leadership · Course 4 — Echo Theory Mastery',
}

interface ProgressRow {
  email:             string
  course_id:         string
  lessons_completed: number
  total_lessons:     number
  pct:               number
  last_activity:     string | null
}

const PAGE_SIZE = 25

function CourseProgressPage() {
  const [rows,         setRows]         = useState<ProgressRow[]>([])
  const [loading,      setLoading]      = useState(true)
  const [courseFilter, setCourseFilter] = useState('all')
  const [page,         setPage]         = useState(1)
  const [totalRows,    setTotalRows]    = useState(0)
  const [error,        setError]        = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadProgress()
  }, [courseFilter, page]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadProgress() {
    setLoading(true)
    setError(null)

    try {
      // Aggregate progress: group by (user_id, course_id), count rows
      let query = supabase
        .from('course_progress')
        .select(`
          course_id,
          user_id,
          completed_at,
          profiles!inner ( email )
        `, { count: 'exact' })
        .order('completed_at', { ascending: false })

      if (courseFilter !== 'all') {
        query = query.eq('course_id', courseFilter)
      }

      const { data, count, error: qErr } = await query

      if (qErr) throw qErr

      // Build aggregated rows grouped by (user_id + course_id)
      const map = new Map<string, ProgressRow>()
      for (const r of (data ?? []) as any[]) {
        const key = `${r.user_id}::${r.course_id}`
        const existing = map.get(key)
        const email = r.profiles?.email ?? '—'
        if (existing) {
          existing.lessons_completed += 1
          if (r.completed_at && (!existing.last_activity || r.completed_at > existing.last_activity)) {
            existing.last_activity = r.completed_at
          }
        } else {
          map.set(key, {
            email,
            course_id:         r.course_id,
            lessons_completed: 1,
            total_lessons:     0, // filled below
            pct:               0,
            last_activity:     r.completed_at,
          })
        }
      }

      // Set total_lessons (we don't store this in progress table, default to 10 if unknown)
      const TOTALS: Record<string, number> = { c1: 12, c2: 10, c3: 10, c4: 8 }
      const aggregated = Array.from(map.values()).map(row => {
        const total = TOTALS[row.course_id] ?? 10
        return { ...row, total_lessons: total, pct: Math.round((row.lessons_completed / total) * 100) }
      })

      // Client-side paginate
      const start = (page - 1) * PAGE_SIZE
      setRows(aggregated.slice(start, start + PAGE_SIZE))
      setTotalRows(aggregated.length)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalRows / PAGE_SIZE)

  const fmtDate = (s: string | null) => {
    if (!s) return '—'
    return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ fontSize:11, color:C.muted, letterSpacing:1 }}>Filter by course:</div>
        {[
          { val:'all',                          label:'All Courses' },
          { val:'c1',                           label:'Personal C1' },
          { val:'c2',                           label:'Personal C2' },
          { val:'c3',                           label:'Personal C3' },
          { val:'c4',                           label:'Personal C4' },
          { val:'common-sense-in-the-workplace', label:'Business C1' },
          { val:'from-reaction-to-response',     label:'Business C2' },
          { val:'know-yourself-lead-yourself',   label:'Business C3' },
          { val:'the-high-frequency-team',       label:'Business C4' },
          { val:'ed01',                          label:'Educators C1' },
          { val:'ed02',                          label:'Educators C2' },
          { val:'ed03',                          label:'Educators C3' },
          { val:'ed04',                          label:'Educators C4' },
          { val:'leadership_course_1',           label:'Leadership C1' },
          { val:'leadership_course_2',           label:'Leadership C2' },
          { val:'leadership_course_3',           label:'Leadership C3' },
          { val:'leadership_course_4',           label:'Leadership C4' },
        ].map(opt => (
          <button
            key={opt.val}
            onClick={() => { setCourseFilter(opt.val); setPage(1) }}
            style={{
              fontSize:10, fontWeight:600, letterSpacing:1, textTransform:'uppercase',
              padding:'5px 12px', borderRadius:4, cursor:'pointer',
              background: courseFilter === opt.val ? C.orange : 'transparent',
              color:       courseFilter === opt.val ? '#000'    : C.muted,
              border:`1px solid ${courseFilter === opt.val ? C.orange : C.border}`,
              transition:'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        ))}
        <div style={{ marginLeft:'auto', fontSize:11, color:C.muted }}>
          {totalRows} user·course combinations
        </div>
      </div>

      <div style={{ background:C.dark3, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
        {/* Table header */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr', borderBottom:`1px solid ${C.border}`, padding:'10px 16px', gap:12 }}>
          {['User', 'Course', 'Completed', '% Done', 'Last Activity'].map(h => (
            <div key={h} style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:C.muted }}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding:'32px 16px', textAlign:'center', color:C.muted, fontSize:12 }}>
            Loading progress data…
          </div>
        ) : error ? (
          <div style={{ padding:'32px 16px', textAlign:'center', color:C.red, fontSize:12 }}>
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding:'32px 16px', textAlign:'center', color:C.muted, fontSize:12 }}>
            No progress data {courseFilter !== 'all' ? 'for this course' : 'yet'}.
          </div>
        ) : rows.map((row, i) => (
          <div
            key={i}
            style={{
              display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr', gap:12,
              padding:'10px 16px', borderBottom:`1px solid ${C.border}`,
              fontSize:12, alignItems:'center',
            }}
          >
            <div style={{ color:C.cream, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {row.email}
            </div>
            <div style={{ color:C.muted, fontSize:11 }}>
              {COURSE_NAMES[row.course_id] ?? row.course_id}
            </div>
            <div style={{ color:C.cream }}>
              {row.lessons_completed} <span style={{ color:C.muted }}>/ {row.total_lessons}</span>
            </div>
            <div>
              {/* Mini progress bar */}
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ flex:1, height:4, background:C.border, borderRadius:2, overflow:'hidden' }}>
                  <div style={{ width:`${row.pct}%`, height:'100%', background: row.pct >= 100 ? '#22c55e' : C.orange, borderRadius:2, transition:'width 0.4s' }} />
                </div>
                <span style={{ fontSize:10, color: row.pct >= 100 ? '#22c55e' : C.orange, fontWeight:700, minWidth:30 }}>
                  {row.pct}%
                </span>
              </div>
            </div>
            <div style={{ color:C.muted, fontSize:11 }}>
              {fmtDate(row.last_activity)}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:16 }}>
          <Btn variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1}>
            ← Prev
          </Btn>
          <span style={{ fontSize:11, color:C.muted }}>Page {page} of {totalPages}</span>
          <Btn variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages}>
            Next →
          </Btn>
        </div>
      )}
    </div>
  )
}


// ══════════════════════════════════════════════════════════════════════════════
// DELETE ORG MODAL
// ══════════════════════════════════════════════════════════════════════════════

function DeleteOrgModal({ open, onClose, onSuccess, org }: { open:boolean; onClose:()=>void; onSuccess:(m:string)=>void; org: SAOrg | null }) {
  const [isPending, startTrans] = useTransition()
  if (!org) return null
  function del() {
    startTrans(async () => {
      const res = await deleteOrganization(org!.id, org!.name)
      if (res.success) { onClose(); onSuccess(`Organization ${org!.name} deleted.`) } else onSuccess(`Error: ${res.error}`)
    })
  }
  return (
    <Modal open={open} onClose={onClose} title="Delete Organization" sub={`Are you sure you want to permanently delete ${org.name}? This cannot be undone and will delete all associated members.`}>
      <Notice icon="⚠">This is a hard delete and will remove all access permanently.</Notice>
      <MFooter onClose={onClose} onConfirm={del} label="Permanently Delete" isPending={isPending}/>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SHELL
// ══════════════════════════════════════════════════════════════════════════════

type PageId = 'overview'|'bypass'|'orgs'|'users'|'courses'|'cms'|'progress'|'activity'|'settings'


const META: Record<PageId,{title:string;crumb:string}> = {
  overview: { title:'Platform Overview',   crumb:'Vibe Hyr Super Admin — Overview' },
  bypass:   { title:'Bypass Manager',       crumb:'Super Admin — Bypass Manager' },
  orgs:     { title:'All Organizations',    crumb:'Super Admin — Organizations' },
  users:    { title:'All Users',            crumb:'Super Admin — Users' },
  courses:  { title:'Course Access Control',crumb:'Super Admin — Course Access' },
  cms:      { title:'Course Manager',       crumb:'Super Admin — Course Content CMS' },
  progress: { title:'Course Progress',      crumb:'Super Admin — Course Progress' },
  activity: { title:'Audit Log',            crumb:'Super Admin — Audit Log' },
  settings: { title:'Platform Settings',    crumb:'Super Admin — Settings' },
}

export function SuperAdminDashboard({ adminName, stats, bypassUsers, bypassOrgs, orgs, users, auditLog, orgOptions }: Props) {
  const [page, setPage]       = useState<PageId>('overview')
  const [toast, setToast]     = useState('')
  const [toastVis, setToastVis] = useState(false)
  const [modalUser, setModalUser]     = useState(false)
  const [modalOrg, setModalOrg]       = useState(false)
  const [modalInvite, setModalInvite] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<SAUser | null>(null)
  const [deleteOrgTarget, setDeleteOrgTarget] = useState<SAOrg | null>(null)
  const [editTarget, setEditTarget] = useState<EditTarget>(null)
  const [editUser, setEditUser]   = useState<EditUser>(null)
  const [editOrgAdmin, setEditOrgAdmin] = useState<{ id: string; name: string; admin_email: string | null } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setSidebarOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg); setToastVis(true)
    setTimeout(()=>setToastVis(false), 3200)
  }, [])

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const initials = adminName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
  const meta = META[page]

  const navGroups = [
    { label:'Command', items:[
      { id:'overview' as PageId, icon:'◈', label:'Overview' },
      { id:'orgs'     as PageId, icon:'⬡', label:'Organizations', count:stats.totalOrgs, gold:true },
      { id:'users'    as PageId, icon:'◎', label:'All Users', count:stats.totalUsers, gold:false },
      { id:'bypass'   as PageId, icon:'⚡', label:'Bypass Manager' },
    ]},
    { label:'Platform', items:[
      { id:'courses'  as PageId, icon:'◆', label:'Course Access' },
      { id:'cms'      as PageId, icon:'✎', label:'Course Manager' },
      { id:'progress' as PageId, icon:'◉', label:'Course Progress' },
      { id:'activity' as PageId, icon:'↷', label:'Audit Log' },
      { id:'settings' as PageId, icon:'✦', label:'Platform Settings' },
    ]},
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        .sa-ni:hover { background:rgba(232,98,26,0.07) !important; color:${C.cream} !important; }
        .sa-sidebar {
          width:240px; min-width:240px;
          background:linear-gradient(180deg,${C.dark2} 0%,${C.dark} 100%);
          border-right:1px solid ${C.border}; display:flex; flex-direction:column;
          position:sticky; top:0; height:100vh; overflow-y:auto;
          z-index:40; transition:transform 0.25s ease;
        }
        .sa-overlay {
          display:none; position:fixed; inset:0;
          background:rgba(10,8,4,0.72); z-index:39; cursor:pointer;
        }
        .sa-hamburger { display:none; align-items:center; justify-content:center; }
        @media (max-width: 767px) {
          .sa-sidebar {
            position:fixed !important; top:0 !important; left:0 !important;
            transform:translateX(-100%);
            height:100vh !important;
            box-shadow:4px 0 24px rgba(0,0,0,0.6);
          }
          .sa-sidebar.open { transform:translateX(0); }
          .sa-overlay.open { display:block; }
          .sa-hamburger { display:flex !important; }
          .sa-header { padding:12px 16px !important; }
          .sa-header-actions .sa-export-btn { display:none !important; }
          .sa-content { padding:16px !important; }
          .sa-content [style*="grid-template-columns"] { grid-template-columns:1fr !important; }
        }
      `}</style>

      <div style={{ display:'flex', minHeight:'100vh', background:C.dark, color:C.cream, fontFamily:"'DM Sans',sans-serif" }}>

        {/* Mobile overlay */}
        <div onClick={() => setSidebarOpen(false)} className={`sa-overlay${sidebarOpen ? ' open' : ''}`} />

        {/* SIDEBAR */}
        <nav className={`sa-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div style={{ padding:'24px 20px 18px', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, letterSpacing:3 }}><span style={{ color:C.orange }}>VIBE</span>HYR</div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'linear-gradient(90deg,rgba(201,168,76,0.15),rgba(232,98,26,0.1))', border:`1px solid ${C.border2}`, borderRadius:2, padding:'3px 8px', marginTop:6, fontSize:9, letterSpacing:3, textTransform:'uppercase', color:C.gold }}>✦ Super Admin</div>
          </div>

          {navGroups.map(g=>(
            <div key={g.label} style={{ padding:'0 10px', marginTop:6 }}>
              <div style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:C.muted, padding:'14px 10px 6px' }}>{g.label}</div>
              {g.items.map(item=>{
                const active = page===item.id
                return (
                  <button key={item.id} onClick={()=>{ setPage(item.id); setSidebarOpen(false) }} className="sa-ni"
                    style={{ display:'flex', alignItems:'center', gap:10, padding:active?'9px 10px 9px 8px':'9px 10px', borderRadius:4, marginBottom:1, fontSize:12.5, width:'100%', textAlign:'left', cursor:'pointer', background:active?'linear-gradient(90deg,rgba(232,98,26,0.18),rgba(201,168,76,0.05))':'transparent', color:active?C.cream:C.muted2, border:'none', borderLeft:active?`2px solid ${C.orange}`:'2px solid transparent', transition:'all 0.18s' }}>
                    <span style={{ width:15, textAlign:'center', fontSize:12, opacity:active?1:0.7 }}>{item.icon}</span>
                    {item.label}
                    {'count' in item && item.count!==undefined && (
                      <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:10, background:item.gold?'rgba(201,168,76,0.15)':'rgba(232,98,26,0.2)', color:item.gold?C.gold:C.orange, border:`1px solid ${item.gold?'rgba(201,168,76,0.3)':'rgba(232,98,26,0.3)'}` }}>{item.count}</span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}

          <div style={{ padding:'0 10px', marginTop:6 }}>
            <div style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:C.muted, padding:'14px 10px 6px' }}>Quick Actions</div>
            <button onClick={()=>{ setModalUser(true); setSidebarOpen(false) }} className="sa-ni" style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:4, marginBottom:1, fontSize:12.5, width:'100%', textAlign:'left', cursor:'pointer', background:'transparent', color:C.muted2, border:'none', transition:'all 0.18s' }}><span style={{ width:15, textAlign:'center', opacity:0.7 }}>+</span> Add User (Bypass)</button>
            <button onClick={()=>{ setModalOrg(true); setSidebarOpen(false) }} className="sa-ni" style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:4, marginBottom:1, fontSize:12.5, width:'100%', textAlign:'left', cursor:'pointer', background:'transparent', color:C.muted2, border:'none', transition:'all 0.18s' }}><span style={{ width:15, textAlign:'center', opacity:0.7 }}>+</span> Add Organization (Bypass)</button>
          </div>

          <div style={{ marginTop:'auto', padding:'14px 16px', borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg,${C.orange},${C.gold})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',sans-serif", fontSize:13, color:'#fff', flexShrink:0, boxShadow:`0 0 12px rgba(232,98,26,0.4)` }}>{initials}</div>
            <div>
              <div style={{ fontSize:12, fontWeight:600 }}>{adminName}</div>
              <div style={{ fontSize:9, color:C.orange, letterSpacing:2, textTransform:'uppercase' }}>Super Admin</div>
            </div>
            <button onClick={logout} title="Log out" style={{ marginLeft:'auto', background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:14 }}>↩</button>
          </div>
        </nav>

        {/* MAIN */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          <div className="sa-header" style={{ padding:'16px 28px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', background:C.dark2, position:'sticky', top:0, zIndex:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={() => setSidebarOpen(o => !o)} className="sa-hamburger" style={{ background:'none', border:'none', color:C.cream, cursor:'pointer', fontSize:20, padding:'4px 8px', borderRadius:4, flexShrink:0, lineHeight:1 }}>☰</button>
              <div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:2 }}>{meta.title}</div>
                <div style={{ fontSize:10, color:C.muted, letterSpacing:1 }}>{meta.crumb}</div>
              </div>
            </div>
            <div className="sa-header-actions" style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span className="sa-export-btn"><Btn variant="ghost" size="sm" onClick={()=>showToast('Exporting platform report...')}>Export Report</Btn></span>
              <Btn variant="gold" size="sm" onClick={()=>setModalOrg(true)}>+ Org</Btn>
              <Btn variant="primary" size="sm" onClick={()=>setModalUser(true)}>+ User</Btn>
            </div>
          </div>

          <div className="sa-content" style={{ padding:28, flex:1 }}>
            {page==='overview' && <OverviewPage stats={stats} bypassUsers={bypassUsers} auditLog={auditLog} orgs={orgs} onNav={setPage} onAddUser={()=>setModalUser(true)} onAddOrg={()=>setModalOrg(true)}/>}
            {page==='bypass'   && <BypassPage bypassUsers={bypassUsers} bypassOrgs={bypassOrgs} onEdit={setEditTarget} onToast={showToast} onAddUser={()=>setModalUser(true)} onAddOrg={()=>setModalOrg(true)} onEditAdmin={setEditOrgAdmin}/>}
            {page==='orgs'     && <OrgsPage orgs={orgs} onToast={showToast} onAddOrg={()=>setModalOrg(true)} onAddUser={()=>setModalUser(true)} onDeleteOrg={setDeleteOrgTarget} onEditAdmin={setEditOrgAdmin}/>}
            {page==='users'    && <UsersPage users={users} onToast={showToast} onAddUser={()=>setModalUser(true)} onInviteUser={()=>setModalInvite(true)} onEdit={setEditUser} onDelete={setDeleteTarget}/>}
            {page==='courses'  && <CoursesPage orgs={orgs} users={users} onToast={showToast}/>}
            {page==='cms'      && <CourseManagerPage onToast={showToast}/>}
            {page==='progress' && <CourseProgressPage/>}
            {page==='activity' && <ActivityPage auditLog={auditLog} onToast={showToast}/>}
            {page==='settings' && <SettingsPage onToast={showToast}/>}
          </div>
        </div>
      </div>

      <AddUserModal    open={modalUser}      onClose={()=>setModalUser(false)}      onSuccess={m=>{showToast(m);router.refresh()}} orgOptions={orgOptions}/>
      <AddOrgModal     open={modalOrg}       onClose={()=>setModalOrg(false)}       onSuccess={m=>{showToast(m);router.refresh()}}/>
      <InviteUserModal open={modalInvite}    onClose={()=>setModalInvite(false)}    onSuccess={m=>{showToast(m);router.refresh()}} orgOptions={orgOptions}/>
      <DeleteUserModal open={!!deleteTarget} onClose={()=>setDeleteTarget(null)}    onSuccess={m=>{showToast(m);router.refresh()}} user={deleteTarget}/>
      <DeleteOrgModal  open={!!deleteOrgTarget} onClose={()=>setDeleteOrgTarget(null)}    onSuccess={m=>{showToast(m);router.refresh()}} org={deleteOrgTarget}/>
      <EditBypassModal    open={!!editTarget}    onClose={()=>setEditTarget(null)}    onSuccess={m=>{showToast(m);router.refresh()}} target={editTarget}/>
      <EditUserModal      open={!!editUser}      onClose={()=>setEditUser(null)}      onSuccess={m=>{showToast(m);router.refresh()}} user={editUser} orgOptions={orgOptions}/>
      <EditOrgAdminModal  open={!!editOrgAdmin}  onClose={()=>setEditOrgAdmin(null)}  onSuccess={m=>{showToast(m);router.refresh()}} org={editOrgAdmin}/>

      {toastVis && (
        <div style={{ position:'fixed', bottom:28, right:28, background:C.dark3, border:`1px solid ${C.border2}`, borderRadius:5, padding:'12px 18px', fontSize:12.5, display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,0.5)', zIndex:300, animation:'toastIn 0.25s ease' }}>
          <span style={{ fontSize:14 }}>✦</span> {toast}
        </div>
      )}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  )
}
