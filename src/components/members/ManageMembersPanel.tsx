'use client'

/**
 * ManageMembersPanel
 * ─────────────────────────────────────────────────────────────────────────────
 * Full client-side Manage Members UI for education / business org admins.
 *
 * Features:
 *   • Members table with search + role/status filters
 *   • Add Member modal (invite by email)
 *   • Edit Member modal (update name / role / status)
 *   • Delete confirmation modal
 *   • Resend invite
 *   • Seat usage indicator
 *   • Role badges, status badges
 *   • Toast notifications
 *   • Pagination
 *   • Full loading / empty / error states
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface MemberProfile {
  id:             string
  avatar_url:     string | null
  membership_tier: string
}

interface Member {
  id:         string
  email:      string
  full_name:  string | null
  role:       'admin' | 'member'
  status:     'active' | 'invited' | 'inactive'
  invited_at: string
  joined_at:  string | null
  created_at: string
  profiles:   MemberProfile | null
}

interface OrgMeta {
  id:        string
  name:      string
  type:      string
  plan:      string
  seatLimit: number
  seatsUsed: number
}

interface ListResponse {
  members:    Member[]
  total:      number
  page:       number
  totalPages: number
  org:        OrgMeta
}

interface Toast {
  id:      number
  type:    'success' | 'error'
  message: string
}

// ── Toast hook ────────────────────────────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const add = useCallback((type: Toast['type'], message: string) => {
    const id = ++counter.current
    setToasts(t => [...t, { id, type, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  return { toasts, success: (m: string) => add('success', m), error: (m: string) => add('error', m) }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`
            px-4 py-3 rounded-lg text-sm font-barlow font-medium shadow-xl
            animate-in slide-in-from-right-4 fade-in duration-200
            ${t.type === 'success'
              ? 'bg-[#E8621A] text-[#F7F2EA]'
              : 'bg-red-900 border border-red-700 text-red-100'}
          `}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

function RoleBadge({ role }: { role: 'admin' | 'member' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-ibm-mono uppercase tracking-wider
        ${role === 'admin'
          ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30'
          : 'bg-[#2E2416] text-[#F7F2EA]/60 border border-[#2E2416]'}
      `}
    >
      {role === 'admin' ? '★ Admin' : 'Member'}
    </span>
  )
}

function StatusBadge({ status }: { status: 'active' | 'invited' | 'inactive' }) {
  const map = {
    active:   'bg-emerald-900/40 text-emerald-400 border-emerald-800/50',
    invited:  'bg-amber-900/40  text-amber-400  border-amber-800/50',
    inactive: 'bg-[#2E2416]     text-[#F7F2EA]/40 border-[#2E2416]',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-ibm-mono border ${map[status]}`}>
      {status === 'invited' ? '⏳ Invited' : status === 'active' ? '● Active' : '○ Inactive'}
    </span>
  )
}

function Avatar({ name, url }: { name: string | null; url: string | null }) {
  const initials = (name ?? '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
  if (url) {
    return <img src={url} alt={name ?? ''} className="w-8 h-8 rounded-full object-cover" />
  }
  return (
    <div className="w-8 h-8 rounded-full bg-[#E8621A]/20 border border-[#E8621A]/30 flex items-center justify-center">
      <span className="text-xs font-bebas text-[#E8621A] tracking-wider">{initials}</span>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-[#1E1610] border border-[#2E2416] rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2E2416]">
          <h2 className="font-bebas text-xl tracking-wider text-[#F7F2EA]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#F7F2EA]/40 hover:text-[#F7F2EA] transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-ibm-mono text-[#F7F2EA]/50 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  )
}

const inputCls = `
  w-full bg-[#141008] border border-[#2E2416] rounded-lg px-3 py-2.5
  text-sm font-barlow text-[#F7F2EA] placeholder-[#F7F2EA]/25
  focus:outline-none focus:border-[#E8621A]/60 focus:ring-1 focus:ring-[#E8621A]/30
  transition-colors
`

const selectCls = `${inputCls} cursor-pointer`

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="
        w-full py-2.5 px-4 rounded-lg
        bg-[#E8621A] hover:bg-[#E8621A]/90
        disabled:opacity-50 disabled:cursor-not-allowed
        text-sm font-bebas tracking-widest text-white
        transition-colors duration-150
      "
    >
      {loading ? 'Processing…' : label}
    </button>
  )
}

// ── Add Member Modal ──────────────────────────────────────────────────────────

function AddMemberModal({
  onClose,
  onAdded,
  seatsLeft,
}: {
  onClose:  () => void
  onAdded:  (member: Member) => void
  seatsLeft: number
}) {
  const [name,  setName]  = useState('')
  const [email, setEmail] = useState('')
  const [role,  setRole]  = useState<'member' | 'admin'>('member')
  const [err,   setErr]   = useState('')
  const [busy,  setBusy]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (!email.trim()) { setErr('Email is required'); return }

    setBusy(true)
    try {
      const res  = await fetch('/api/members', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), full_name: name.trim() || null, role }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error ?? 'Something went wrong'); return }
      onAdded(data.member)
      onClose()
    } catch {
      setErr('Network error — please try again')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Invite Member" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {seatsLeft <= 0 && (
          <div className="bg-amber-900/30 border border-amber-700/40 text-amber-300 text-xs font-barlow px-3 py-2 rounded-lg">
            ⚠ Your organization has reached its seat limit. Remove a member or upgrade to add more.
          </div>
        )}

        <Field label="Full Name (optional)">
          <input
            className={inputCls}
            placeholder="Jane Smith"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={busy}
          />
        </Field>

        <Field label="Email Address *">
          <input
            className={inputCls}
            type="email"
            placeholder="jane@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={busy}
          />
        </Field>

        <Field label="Role">
          <select
            className={selectCls}
            value={role}
            onChange={e => setRole(e.target.value as 'member' | 'admin')}
            disabled={busy}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </Field>

        {err && (
          <p className="text-red-400 text-xs font-barlow bg-red-900/20 px-3 py-2 rounded-lg border border-red-800/40">
            {err}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg border border-[#2E2416] text-sm font-bebas tracking-widest text-[#F7F2EA]/60 hover:text-[#F7F2EA] hover:border-[#F7F2EA]/20 transition-colors"
          >
            Cancel
          </button>
          <div className="flex-1">
            <SubmitButton loading={busy} label="Send Invite" />
          </div>
        </div>

        <p className="text-xs text-[#F7F2EA]/30 font-barlow text-center">
          An email invite will be sent. They'll join as <strong className="text-[#F7F2EA]/50">{role}</strong>.
        </p>
      </form>
    </Modal>
  )
}

// ── Edit Member Modal ─────────────────────────────────────────────────────────

function EditMemberModal({
  member,
  isSelf,
  onClose,
  onUpdated,
}: {
  member:    Member
  isSelf:    boolean
  onClose:   () => void
  onUpdated: (updated: Member) => void
}) {
  const [name,   setName]   = useState(member.full_name ?? '')
  const [role,   setRole]   = useState(member.role)
  const [status, setStatus] = useState(member.status)
  const [err,    setErr]    = useState('')
  const [busy,   setBusy]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const res  = await fetch(`/api/members/${member.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ full_name: name.trim() || null, role, status }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error ?? 'Something went wrong'); return }
      onUpdated(data.member)
      onClose()
    } catch {
      setErr('Network error — please try again')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Edit Member" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-2 border-b border-[#2E2416]">
          <Avatar name={member.full_name} url={member.profiles?.avatar_url ?? null} />
          <div>
            <p className="text-sm font-barlow font-semibold text-[#F7F2EA]">
              {member.full_name ?? member.email}
            </p>
            <p className="text-xs text-[#F7F2EA]/40 font-barlow">{member.email}</p>
          </div>
        </div>

        <Field label="Full Name">
          <input
            className={inputCls}
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={busy}
          />
        </Field>

        <Field label="Role">
          <select
            className={selectCls}
            value={role}
            onChange={e => setRole(e.target.value as 'member' | 'admin')}
            disabled={busy || isSelf}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          {isSelf && (
            <p className="text-xs text-[#F7F2EA]/30 font-barlow">
              You cannot change your own role.
            </p>
          )}
        </Field>

        <Field label="Status">
          <select
            className={selectCls}
            value={status}
            onChange={e => setStatus(e.target.value as Member['status'])}
            disabled={busy}
          >
            <option value="active">Active</option>
            <option value="invited">Invited (pending)</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>

        {err && (
          <p className="text-red-400 text-xs font-barlow bg-red-900/20 px-3 py-2 rounded-lg border border-red-800/40">
            {err}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg border border-[#2E2416] text-sm font-bebas tracking-widest text-[#F7F2EA]/60 hover:text-[#F7F2EA] transition-colors"
          >
            Cancel
          </button>
          <div className="flex-1">
            <SubmitButton loading={busy} label="Save Changes" />
          </div>
        </div>
      </form>
    </Modal>
  )
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────

function DeleteModal({
  member,
  onClose,
  onDeleted,
}: {
  member:    Member
  onClose:   () => void
  onDeleted: (id: string) => void
}) {
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(false)

  async function handleDelete() {
    setErr('')
    setBusy(true)
    try {
      const res  = await fetch(`/api/members/${member.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { setErr(data.error ?? 'Something went wrong'); return }
      onDeleted(member.id)
      onClose()
    } catch {
      setErr('Network error — please try again')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Remove Member" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <p className="text-sm font-barlow text-[#F7F2EA]/70 leading-relaxed">
          Are you sure you want to remove{' '}
          <strong className="text-[#F7F2EA]">{member.full_name ?? member.email}</strong>{' '}
          from your organization? They will lose access immediately.
        </p>

        {member.status === 'invited' && (
          <div className="bg-amber-900/20 border border-amber-800/40 text-amber-300 text-xs font-barlow px-3 py-2 rounded-lg">
            This member has a pending invite. Removing them will cancel it.
          </div>
        )}

        {err && (
          <p className="text-red-400 text-xs font-barlow bg-red-900/20 px-3 py-2 rounded-lg border border-red-800/40">
            {err}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg border border-[#2E2416] text-sm font-bebas tracking-widest text-[#F7F2EA]/60 hover:text-[#F7F2EA] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="flex-1 py-2.5 px-4 rounded-lg bg-red-900 hover:bg-red-800 disabled:opacity-50 text-sm font-bebas tracking-widest text-red-100 transition-colors"
          >
            {busy ? 'Removing…' : 'Remove Member'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-t border-[#2E2416]">
      {[1, 2, 3, 4, 5].map(i => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-[#2E2416] rounded animate-pulse" style={{ width: `${60 + i * 8}%` }} />
        </td>
      ))}
    </tr>
  )
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export default function ManageMembersPanel({
  currentUserId,
  initialData,
}: {
  currentUserId: string
  initialData:   ListResponse
}) {
  const toast = useToast()

  // ── State ──────────────────────────────────────────────────────────────────
  const [members,    setMembers]    = useState<Member[]>(initialData.members)
  const [org,        setOrg]        = useState<OrgMeta>(initialData.org)
  const [total,      setTotal]      = useState(initialData.total)
  const [totalPages, setTotalPages] = useState(initialData.totalPages)
  const [page,       setPage]       = useState(1)
  const [loading,    setLoading]    = useState(false)
  const [search,     setSearch]     = useState('')
  const [roleFilter,   setRoleFilter]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [showAdd,   setShowAdd]   = useState(false)
  const [editTarget,   setEditTarget]   = useState<Member | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)
  const [resending,    setResending]    = useState<string | null>(null)

  // Debounce search
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>()

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchMembers = useCallback(async (
    p: number, q: string, role: string, status: string
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p) })
      if (q)      params.set('q',      q)
      if (role)   params.set('role',   role)
      if (status) params.set('status', status)

      const res  = await fetch(`/api/members?${params}`)
      const data: ListResponse = await res.json()
      if (!res.ok) { toast.error((data as { error?: string }).error ?? 'Failed to load members'); return }

      setMembers(data.members)
      setOrg(data.org)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setPage(data.page)
    } catch {
      toast.error('Network error — could not load members')
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when filters/page change
  useEffect(() => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(
      () => fetchMembers(1, search, roleFilter, statusFilter),
      search ? 350 : 0
    )
    return () => clearTimeout(searchTimeout.current)
  }, [search, roleFilter, statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (page > 1) fetchMembers(page, search, roleFilter, statusFilter)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Resend invite ──────────────────────────────────────────────────────────
  async function handleResend(member: Member) {
    setResending(member.id)
    try {
      const res  = await fetch(`/api/members/${member.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'resend_invite' }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to resend invite'); return }
      toast.success(`Invite resent to ${member.email}`)
      // Update invited_at in local state
      setMembers(ms => ms.map(m =>
        m.id === member.id ? { ...m, invited_at: new Date().toISOString() } : m
      ))
    } catch {
      toast.error('Network error')
    } finally {
      setResending(null)
    }
  }

  // ── Seat stats ─────────────────────────────────────────────────────────────
  const seatsLeft   = org.seatLimit - org.seatsUsed
  const seatPct     = org.seatLimit > 0 ? Math.min(100, (org.seatsUsed / org.seatLimit) * 100) : 0
  const seatWarning = seatPct >= 90

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      <ToastStack toasts={toast.toasts} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-bebas text-3xl tracking-wider text-[#F7F2EA]">
            Manage Members
          </h1>
          <p className="text-sm text-[#F7F2EA]/50 font-barlow mt-1">
            {org.name} · {org.type.charAt(0).toUpperCase() + org.type.slice(1)} plan
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="
            flex items-center gap-2 px-5 py-2.5 rounded-lg
            bg-[#E8621A] hover:bg-[#E8621A]/90
            text-sm font-bebas tracking-widest text-white
            transition-colors duration-150 whitespace-nowrap
          "
        >
          + Invite Member
        </button>
      </div>

      {/* ── Seat Usage ──────────────────────────────────────────────────── */}
      <div className="bg-[#141008] border border-[#2E2416] rounded-xl px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-ibm-mono text-[#F7F2EA]/50 uppercase tracking-widest">
            Seat Usage
          </span>
          <span className={`text-xs font-ibm-mono ${seatWarning ? 'text-amber-400' : 'text-[#F7F2EA]/50'}`}>
            {org.seatsUsed} / {org.seatLimit} seats used
          </span>
        </div>
        <div className="h-1.5 bg-[#2E2416] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              seatWarning ? 'bg-amber-500' : 'bg-[#E8621A]'
            }`}
            style={{ width: `${seatPct}%` }}
          />
        </div>
        {seatWarning && (
          <p className="text-xs text-amber-400/80 font-barlow mt-1.5">
            {seatsLeft <= 0
              ? 'Seat limit reached — upgrade to invite more members.'
              : `Only ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} remaining.`}
          </p>
        )}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className={`${inputCls} sm:flex-1`}
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={`${selectCls} sm:w-36`}
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
        <select
          className={`${selectCls} sm:w-40`}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="bg-[#141008] border border-[#2E2416] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-[#2E2416]">
                {['Member', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-ibm-mono text-[#F7F2EA]/40 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : members.length === 0
                ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-4xl opacity-20">👥</span>
                        <p className="text-sm font-barlow text-[#F7F2EA]/40">
                          {search || roleFilter || statusFilter
                            ? 'No members match your filters.'
                            : 'No members yet. Invite your first team member.'}
                        </p>
                        {!search && !roleFilter && !statusFilter && (
                          <button
                            onClick={() => setShowAdd(true)}
                            className="text-sm text-[#E8621A] font-barlow hover:underline"
                          >
                            + Invite Member
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
                : members.map(m => {
                  const isSelf    = m.user_id === currentUserId
                  const isResend  = resending === m.id
                  return (
                    <tr
                      key={m.id}
                      className="border-t border-[#2E2416] hover:bg-[#1E1610]/60 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={m.full_name}
                            url={m.profiles?.avatar_url ?? null}
                          />
                          <div>
                            <p className="text-sm font-barlow font-medium text-[#F7F2EA]">
                              {m.full_name ?? '—'}
                              {isSelf && (
                                <span className="ml-1.5 text-xs text-[#E8621A]/70">(you)</span>
                              )}
                            </p>
                            <p className="text-xs text-[#F7F2EA]/35 font-barlow">
                              Joined {m.joined_at
                                ? new Date(m.joined_at).toLocaleDateString()
                                : m.invited_at
                                  ? `Invited ${new Date(m.invited_at).toLocaleDateString()}`
                                  : '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-barlow text-[#F7F2EA]/70">{m.email}</span>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <RoleBadge role={m.role} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={m.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditTarget(m)}
                            className="text-xs font-barlow text-[#C9A84C] hover:text-[#C9A84C]/80 transition-colors"
                          >
                            Edit
                          </button>
                          {m.status === 'invited' && (
                            <button
                              onClick={() => handleResend(m)}
                              disabled={isResend}
                              className="text-xs font-barlow text-[#F7F2EA]/50 hover:text-[#F7F2EA] transition-colors disabled:opacity-40"
                            >
                              {isResend ? 'Sending…' : 'Resend'}
                            </button>
                          )}
                          {!isSelf && (
                            <button
                              onClick={() => setDeleteTarget(m)}
                              className="text-xs font-barlow text-red-500/70 hover:text-red-400 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#2E2416]">
            <p className="text-xs font-barlow text-[#F7F2EA]/40">
              {total} member{total !== 1 ? 's' : ''} total
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-xs font-barlow border border-[#2E2416] rounded text-[#F7F2EA]/50 hover:text-[#F7F2EA] hover:border-[#F7F2EA]/20 disabled:opacity-30 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-xs font-ibm-mono text-[#F7F2EA]/40">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs font-barlow border border-[#2E2416] rounded text-[#F7F2EA]/50 hover:text-[#F7F2EA] hover:border-[#F7F2EA]/20 disabled:opacity-30 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showAdd && (
        <AddMemberModal
          seatsLeft={seatsLeft}
          onClose={() => setShowAdd(false)}
          onAdded={member => {
            setMembers(ms => [member, ...ms])
            setTotal(t => t + 1)
            setOrg(o => ({ ...o, seatsUsed: o.seatsUsed + 1 }))
            toast.success(`Invite sent to ${member.email}`)
          }}
        />
      )}

      {editTarget && (
        <EditMemberModal
          member={editTarget}
          isSelf={editTarget.user_id === currentUserId}
          onClose={() => setEditTarget(null)}
          onUpdated={updated => {
            setMembers(ms => ms.map(m => m.id === updated.id ? { ...m, ...updated } : m))
            toast.success('Member updated successfully')
          }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          member={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={id => {
            setMembers(ms => ms.filter(m => m.id !== id))
            setTotal(t => t - 1)
            setOrg(o => ({ ...o, seatsUsed: Math.max(0, o.seatsUsed - 1) }))
            toast.success('Member removed from organization')
          }}
        />
      )}
    </div>
  )
}
