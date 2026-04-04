'use client'

/**
 * OrgUserManagement
 * ─────────────────────────────────────────────────────────────────────────────
 * Full user management panel for the institutional admin dashboard.
 * Renders as the Users & Seats tab content inside InstitutionalAdminDashboard.
 *
 * Features:
 *   • Seat usage banner with progress bar (warning at 80%, blocked at 100%)
 *   • Member table — Name, Email, Status, Courses (count + tooltip), Added, Actions
 *   • Add User slide-panel — First, Last, Email, multi-select courses, "Add & Send Invite"
 *   • Edit Courses modal — checkbox list, pre-populated per user
 *   • Remove User confirmation dialog
 *
 * Data:  fetches from /api/members (members + seat info) and /api/org/courses
 * Auth:  all routes enforce requireOrgAdmin() server-side
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// ── Brand tokens ──────────────────────────────────────────────────────────────

const C = {
  dark:    '#0A0804',
  dark2:   '#110E09',
  dark3:   '#1A1510',
  dark4:   '#221C13',
  dark5:   '#2A2218',
  cream:   '#F0EAE0',
  orange:  '#E8621A',
  gold:    '#C9A84C',
  muted:   '#7A6E60',
  muted2:  '#B0A090',
  border:  'rgba(201,168,76,0.15)',
  borderB: 'rgba(201,168,76,0.35)',
  red:     '#E57373',
  green:   '#81C784',
  yellow:  '#FFD54F',
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrgInfo {
  id:        string
  name:      string
  type:      string
  plan:      string
  seatLimit: number
  seatsUsed: number
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
  profiles?:  { id: string; avatar_url?: string; membership_tier?: string } | null
}

interface Course {
  slug:        string
  name:        string
  description: string
  courseId:    number
}

// ── Pill helpers ──────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  active:   { background: 'rgba(129,199,132,0.15)', color: C.green,  border: '1px solid rgba(129,199,132,0.3)' },
  invited:  { background: 'rgba(255,213,79,0.12)',  color: C.yellow, border: '1px solid rgba(255,213,79,0.3)' },
  inactive: { background: 'rgba(122,110,96,0.2)',   color: C.muted,  border: `1px solid ${C.border}` },
}

const ROLE_STYLE: Record<string, React.CSSProperties> = {
  admin:  { background: 'rgba(232,98,26,0.15)', color: '#FF8A50', border: '1px solid rgba(232,98,26,0.3)' },
  member: { background: 'rgba(201,168,76,0.1)', color: C.gold,    border: `1px solid rgba(201,168,76,0.2)` },
}

function Pill({ label, style }: { label: string; style: React.CSSProperties }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
      padding: '3px 9px', borderRadius: 20, ...style,
    }}>
      {label}
    </span>
  )
}

// ── Input style ───────────────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  background: C.dark4, border: `1px solid ${C.border}`, color: C.cream,
  fontFamily: 'inherit', fontSize: 13, padding: '10px 14px', borderRadius: 4,
  outline: 'none', width: '100%', boxSizing: 'border-box',
}

const LABEL: React.CSSProperties = {
  display: 'block', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
  color: C.muted, marginBottom: 6,
}

// ── Seat Banner ───────────────────────────────────────────────────────────────

function SeatBanner({ org }: { org: OrgInfo }) {
  const pct     = org.seatLimit > 0 ? Math.round((org.seatsUsed / org.seatLimit) * 100) : 0
  const atLimit = org.seatsUsed >= org.seatLimit
  const warning = !atLimit && pct >= 80

  const barColor = atLimit ? C.red : warning ? C.yellow : C.orange
  const bannerBg = atLimit
    ? 'rgba(229,115,115,0.08)'
    : warning
    ? 'rgba(255,213,79,0.07)'
    : 'transparent'
  const bannerBorder = atLimit
    ? 'rgba(229,115,115,0.3)'
    : warning
    ? 'rgba(255,213,79,0.25)'
    : C.border

  return (
    <div style={{
      background: bannerBg, border: `1px solid ${bannerBorder}`,
      borderRadius: 8, padding: '16px 20px', marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, lineHeight: 1,
            color: atLimit ? C.red : warning ? C.yellow : C.cream,
          }}>
            {org.seatsUsed}
          </span>
          <span style={{ fontSize: 13, color: C.muted }}>
            of <strong style={{ color: C.cream }}>{org.seatLimit}</strong> seats used
          </span>
          {atLimit && (
            <Pill label="Seat limit reached" style={{ background: 'rgba(229,115,115,0.15)', color: C.red, border: '1px solid rgba(229,115,115,0.3)' }} />
          )}
          {warning && !atLimit && (
            <Pill label="Nearing limit" style={{ background: 'rgba(255,213,79,0.12)', color: C.yellow, border: '1px solid rgba(255,213,79,0.3)' }} />
          )}
        </div>
        <span style={{ fontSize: 12, color: C.muted }}>
          {org.seatLimit - org.seatsUsed} seat{org.seatLimit - org.seatsUsed !== 1 ? 's' : ''} remaining
        </span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: atLimit
            ? C.red
            : `linear-gradient(90deg,${barColor},${warning ? C.yellow : C.gold})`,
          width: `${Math.min(pct, 100)}%`,
          transition: 'width 0.6s ease',
        }} />
      </div>
      {atLimit && (
        <p style={{ margin: '10px 0 0', fontSize: 12, color: C.red, lineHeight: 1.6 }}>
          You've reached your organisation's user limit. Upgrade your plan or remove existing users to add new ones.
        </p>
      )}
    </div>
  )
}

// ── Add User Panel ────────────────────────────────────────────────────────────

function AddUserPanel({
  courses,
  atLimit,
  onClose,
  onSuccess,
  onToast,
}: {
  courses:   Course[]
  atLimit:   boolean
  onClose:   () => void
  onSuccess: () => void
  onToast:   (msg: string, kind?: 'ok' | 'err') => void
}) {
  const [firstName,    setFirstName]    = useState('')
  const [lastName,     setLastName]     = useState('')
  const [email,        setEmail]        = useState('')
  const [selectedSlugs, setSelected]   = useState<string[]>([])
  const [loading,      setLoading]      = useState(false)
  const [fieldErr,     setFieldErr]     = useState<Record<string, string>>({})
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => { firstRef.current?.focus() }, [])

  function toggleCourse(slug: string) {
    setSelected(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!firstName.trim()) errs.firstName = 'Required'
    if (!lastName.trim())  errs.lastName  = 'Required'
    if (!email.trim())     errs.email     = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Invalid email'
    setFieldErr(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    if (atLimit) { onToast('Seat limit reached. Remove a user or upgrade your plan.', 'err'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/members', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:        email.trim().toLowerCase(),
          full_name:    `${firstName.trim()} ${lastName.trim()}`,
          role:         'member',
          course_slugs: selectedSlugs,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        onToast(data.error ?? 'Failed to add user.', 'err')
      } else {
        onSuccess()
      }
    } catch {
      onToast('Network error. Please try again.', 'err')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 110,
      display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ flex: 1, background: 'rgba(10,8,4,0.7)' }}
      />
      {/* Panel */}
      <div style={{
        width: 480, maxWidth: '95vw',
        background: C.dark2, borderLeft: `1px solid ${C.borderB}`,
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2 }}>
              Add New User
            </span>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
            The user will receive a branded invitation email with a link to set their password and access their assigned courses.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={LABEL}>First Name</label>
              <input
                ref={firstRef}
                type="text"
                value={firstName}
                onChange={e => { setFirstName(e.target.value); setFieldErr(p => ({ ...p, firstName: '' })) }}
                style={{ ...INPUT, borderColor: fieldErr.firstName ? C.red : undefined }}
                placeholder="Jane"
              />
              {fieldErr.firstName && <span style={{ fontSize: 11, color: C.red }}>{fieldErr.firstName}</span>}
            </div>
            <div>
              <label style={LABEL}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => { setLastName(e.target.value); setFieldErr(p => ({ ...p, lastName: '' })) }}
                style={{ ...INPUT, borderColor: fieldErr.lastName ? C.red : undefined }}
                placeholder="Smith"
              />
              {fieldErr.lastName && <span style={{ fontSize: 11, color: C.red }}>{fieldErr.lastName}</span>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={LABEL}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setFieldErr(p => ({ ...p, email: '' })) }}
              style={{ ...INPUT, borderColor: fieldErr.email ? C.red : undefined }}
              placeholder="jane@company.com"
            />
            {fieldErr.email && <span style={{ fontSize: 11, color: C.red }}>{fieldErr.email}</span>}
          </div>

          {/* Course assignment */}
          {courses.length > 0 && (
            <div>
              <label style={LABEL}>Assign Courses <span style={{ color: C.muted2, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <div style={{
                background: C.dark4, border: `1px solid ${C.border}`, borderRadius: 4,
                overflow: 'hidden',
              }}>
                {courses.map((c, i) => (
                  <label key={c.slug} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 14px', cursor: 'pointer',
                    borderBottom: i < courses.length - 1 ? `1px solid ${C.border}` : 'none',
                    background: selectedSlugs.includes(c.slug) ? 'rgba(232,98,26,0.06)' : 'transparent',
                    transition: 'background 0.15s',
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedSlugs.includes(c.slug)}
                      onChange={() => toggleCourse(c.slug)}
                      style={{ marginTop: 2, accentColor: C.orange, flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.cream }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{c.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {selectedSlugs.length > 0 && (
                <div style={{ fontSize: 11, color: C.orange, marginTop: 6 }}>
                  {selectedSlugs.length} course{selectedSlugs.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}

          {/* Footer buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 'auto', paddingTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.muted, fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                letterSpacing: 1, textTransform: 'uppercase', padding: '10px 20px', borderRadius: 4, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || atLimit}
              style={{
                background: atLimit ? 'rgba(229,115,115,0.2)' : C.orange,
                border: 'none', color: atLimit ? C.red : '#fff',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
                letterSpacing: 1, textTransform: 'uppercase', padding: '10px 24px',
                borderRadius: 4, cursor: loading || atLimit ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Adding…' : 'Add & Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Edit Courses Modal ────────────────────────────────────────────────────────

function EditCoursesModal({
  member,
  courses,
  currentSlugs,
  onClose,
  onSave,
}: {
  member:       Member
  courses:      Course[]
  currentSlugs: string[]
  onClose:      () => void
  onSave:       (slugs: string[]) => Promise<void>
}) {
  const [selected, setSelected] = useState<string[]>(currentSlugs)
  const [saving,   setSaving]   = useState(false)

  function toggle(slug: string) {
    setSelected(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug])
  }

  async function handleSave() {
    setSaving(true)
    await onSave(selected)
    setSaving(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,8,4,0.85)',
      zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: C.dark3, border: `1px solid ${C.borderB}`,
        borderRadius: 10, width: 500, maxWidth: '95vw', maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 18px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 2, marginBottom: 4 }}>
            Edit Course Access
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            {member.full_name ?? member.email}
          </div>
        </div>

        {/* Course list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {courses.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', fontSize: 13, color: C.muted }}>
              No courses available for this organisation type.
            </div>
          ) : (
            courses.map((c, i) => (
              <label key={c.slug} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '14px 28px', cursor: 'pointer',
                borderBottom: i < courses.length - 1 ? `1px solid ${C.border}` : 'none',
                background: selected.includes(c.slug) ? 'rgba(232,98,26,0.07)' : 'transparent',
                transition: 'background 0.15s',
              }}>
                <input
                  type="checkbox"
                  checked={selected.includes(c.slug)}
                  onChange={() => toggle(c.slug)}
                  style={{ marginTop: 3, accentColor: C.orange, flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.cream }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{c.description}</div>
                </div>
              </label>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '18px 28px', borderTop: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: C.muted }}>
            {selected.length} of {courses.length} courses assigned
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.muted, fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                letterSpacing: 1, textTransform: 'uppercase', padding: '9px 18px',
                borderRadius: 4, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: C.orange, border: 'none', color: '#fff',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
                letterSpacing: 1, textTransform: 'uppercase', padding: '9px 22px',
                borderRadius: 4, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Save Access'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Remove Confirm Dialog ─────────────────────────────────────────────────────

function RemoveDialog({
  member,
  loading,
  onClose,
  onConfirm,
}: {
  member:    Member
  loading:   boolean
  onClose:   () => void
  onConfirm: () => void
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,8,4,0.85)',
      zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: C.dark3, border: '1px solid rgba(229,115,115,0.35)',
        borderRadius: 10, width: 460, maxWidth: '95vw', padding: '28px 32px',
      }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, marginBottom: 14, color: C.red }}>
          Remove User
        </div>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: C.muted2, lineHeight: 1.65 }}>
          Are you sure you want to remove{' '}
          <strong style={{ color: C.cream }}>{member.full_name ?? member.email}</strong> from your organisation?
          They will immediately lose access to all assigned courses and the platform.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: `1px solid ${C.border}`,
              color: C.muted, fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              letterSpacing: 1, textTransform: 'uppercase', padding: '10px 20px',
              borderRadius: 4, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: '#C62828', border: 'none', color: '#fff',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
              letterSpacing: 1, textTransform: 'uppercase', padding: '10px 24px',
              borderRadius: 4, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Removing…' : 'Remove User'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Course count tooltip ──────────────────────────────────────────────────────

function CourseCell({ memberId, courses }: { memberId: string; courses: string[] }) {
  const [open, setOpen] = useState(false)

  if (courses.length === 0) {
    return <span style={{ fontSize: 12, color: C.muted }}>None</span>
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          background: 'rgba(232,98,26,0.12)', border: '1px solid rgba(232,98,26,0.25)',
          color: C.orange, borderRadius: 20, padding: '3px 10px',
          fontSize: 11, fontWeight: 600, cursor: 'default',
        }}
      >
        {courses.length} course{courses.length !== 1 ? 's' : ''}
      </button>
      {open && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, marginBottom: 6,
          background: C.dark5, border: `1px solid ${C.borderB}`,
          borderRadius: 6, padding: '10px 14px', zIndex: 50,
          minWidth: 220, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>
            Assigned Courses
          </div>
          {courses.map(name => (
            <div key={name} style={{ fontSize: 12, color: C.cream, padding: '3px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 5, height: 5, background: C.orange, borderRadius: '50%', flexShrink: 0 }} />
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function OrgUserManagement() {
  const [members,     setMembers]     = useState<Member[]>([])
  const [org,         setOrg]         = useState<OrgInfo | null>(null)
  const [courses,     setCourses]     = useState<Course[]>([])
  // map: member.id → assigned course names
  const [courseMap,   setCourseMap]   = useState<Record<string, string[]>>({})
  // map: member.id → course slugs (for edit modal)
  const [slugMap,     setSlugMap]     = useState<Record<string, string[]>>({})
  const [loading,     setLoading]     = useState(true)
  const [query,       setQuery]       = useState('')
  const [addOpen,     setAddOpen]     = useState(false)
  const [editTarget,  setEditTarget]  = useState<Member | null>(null)
  const [removeTarget,setRemoveTarget]= useState<Member | null>(null)
  const [removeLoading, setRemoveLoad]= useState(false)
  const [toast,       setToast]       = useState<{ msg: string; kind: 'ok' | 'err' } | null>(null)

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/members?limit=200')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load members')
      setMembers(data.members ?? [])
      setOrg(data.org ?? null)
    } catch (err: any) {
      showToast(err.message, 'err')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCourses = useCallback(async () => {
    try {
      const res  = await fetch('/api/org/courses')
      const data = await res.json()
      if (res.ok) setCourses(data.courses ?? [])
    } catch {}
  }, [])

  const fetchMemberCourses = useCallback(async (memberList: Member[]) => {
    const results = await Promise.all(
      memberList.map(async m => {
        try {
          const res  = await fetch(`/api/members/${m.id}/courses`)
          const data = await res.json()
          return { id: m.id, slugs: (data.course_slugs ?? []) as string[] }
        } catch {
          return { id: m.id, slugs: [] as string[] }
        }
      })
    )

    // Rebuild course name map from slugs + available courses
    const newSlugMap: Record<string, string[]> = {}
    const newNameMap: Record<string, string[]> = {}

    results.forEach(({ id, slugs }) => {
      newSlugMap[id] = slugs
      // We'll fill names once courses are loaded
    })
    setSlugMap(newSlugMap)
    return newSlugMap
  }, [])

  useEffect(() => {
    Promise.all([fetchMembers(), fetchCourses()])
  }, [fetchMembers, fetchCourses])

  // When members and courses are both loaded, fetch per-member course assignments
  useEffect(() => {
    if (members.length === 0 || courses.length === 0) return
    fetchMemberCourses(members).then(slugMapResult => {
      const nameMap: Record<string, string[]> = {}
      Object.entries(slugMapResult).forEach(([id, slugs]) => {
        nameMap[id] = slugs
          .map(slug => courses.find(c => c.slug === slug)?.name ?? slug)
      })
      setCourseMap(nameMap)
    })
  }, [members, courses, fetchMemberCourses])

  // ── Toast ──────────────────────────────────────────────────────────────────

  function showToast(msg: string, kind: 'ok' | 'err' = 'ok') {
    setToast({ msg, kind })
    setTimeout(() => setToast(null), 4000)
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleRemove() {
    if (!removeTarget) return
    setRemoveLoad(true)
    try {
      const res = await fetch(`/api/members/${removeTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Remove failed')
      setRemoveTarget(null)
      showToast('User removed from organisation.')
      await fetchMembers()
    } catch (err: any) {
      showToast(err.message, 'err')
    } finally {
      setRemoveLoad(false)
    }
  }

  async function handleSaveCourses(slugs: string[]) {
    if (!editTarget) return
    try {
      const res = await fetch(`/api/members/${editTarget.id}/courses`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ course_slugs: slugs }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Update failed')
      setEditTarget(null)
      showToast('Course access updated. ✦')
      // Update local state without full refetch
      const names = slugs.map(s => courses.find(c => c.slug === s)?.name ?? s)
      setCourseMap(prev => ({ ...prev, [editTarget.id]: names }))
      setSlugMap(prev => ({ ...prev, [editTarget.id]: slugs }))
    } catch (err: any) {
      showToast(err.message, 'err')
    }
  }

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = members.filter(m => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      (m.full_name ?? '').toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.status.includes(q) ||
      m.role.includes(q)
    )
  })

  const atLimit = org ? org.seatsUsed >= org.seatLimit : false

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ color: C.cream, fontFamily: "'DM Sans',sans-serif" }}>

      {/* Seat banner */}
      {org && <SeatBanner org={org} />}

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {/* Search */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: C.dark4, border: `1px solid ${C.border}`,
          borderRadius: 4, padding: '8px 14px',
        }}>
          <span style={{ color: C.muted, fontSize: 14 }}>⌕</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, email, or status…"
            style={{
              background: 'none', border: 'none', color: C.cream,
              fontFamily: 'inherit', fontSize: 13, outline: 'none', flex: 1,
            }}
          />
        </div>

        {/* Add user button */}
        <button
          onClick={() => setAddOpen(true)}
          disabled={atLimit}
          title={atLimit ? 'Seat limit reached' : undefined}
          style={{
            background: atLimit ? 'rgba(122,110,96,0.2)' : C.orange,
            border: 'none', color: atLimit ? C.muted : '#fff',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
            letterSpacing: 1, textTransform: 'uppercase', padding: '10px 20px',
            borderRadius: 4, cursor: atLimit ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          + Add User
        </button>
      </div>

      {/* Table */}
      <div style={{ background: C.dark3, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: C.muted, fontSize: 13 }}>
            Loading members…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: C.muted, fontSize: 13 }}>
            {query ? 'No members match your search.' : 'No members yet. Add your first user above.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['User', 'Role', 'Status', 'Courses', 'Date Added', 'Actions'].map(h => (
                    <th key={h} style={{
                      fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                      color: C.muted, padding: '12px 16px', textAlign: 'left',
                      borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const dateAdded = new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  const memberCourseNames = courseMap[m.id] ?? []
                  return (
                    <tr key={m.id} style={{ borderBottom: `1px solid rgba(201,168,76,0.06)` }}>
                      {/* User */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500, fontSize: 13, color: C.cream }}>
                          {m.full_name ?? <span style={{ color: C.muted, fontStyle: 'italic' }}>Name pending</span>}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{m.email}</div>
                      </td>
                      {/* Role */}
                      <td style={{ padding: '14px 16px' }}>
                        <Pill label={m.role} style={ROLE_STYLE[m.role] ?? ROLE_STYLE.member} />
                      </td>
                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <Pill
                          label={m.status === 'invited' ? 'Pending' : m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                          style={STATUS_STYLE[m.status] ?? STATUS_STYLE.inactive}
                        />
                      </td>
                      {/* Courses */}
                      <td style={{ padding: '14px 16px' }}>
                        <CourseCell memberId={m.id} courses={memberCourseNames} />
                      </td>
                      {/* Date */}
                      <td style={{ padding: '14px 16px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>
                        {dateAdded}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => setEditTarget(m)}
                          style={{
                            fontSize: 11, color: C.orange, cursor: 'pointer', fontWeight: 600,
                            letterSpacing: 1, textTransform: 'uppercase', background: 'none',
                            border: 'none', marginRight: 14,
                          }}
                        >
                          Courses
                        </button>
                        <button
                          onClick={() => setRemoveTarget(m)}
                          style={{
                            fontSize: 11, color: C.red, cursor: 'pointer', fontWeight: 600,
                            letterSpacing: 1, textTransform: 'uppercase', background: 'none',
                            border: 'none',
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Member count footer */}
      {!loading && (
        <div style={{ marginTop: 10, fontSize: 12, color: C.muted }}>
          Showing {filtered.length} of {members.length} member{members.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Add User panel */}
      {addOpen && (
        <AddUserPanel
          courses={courses}
          atLimit={atLimit}
          onClose={() => setAddOpen(false)}
          onSuccess={async () => {
            setAddOpen(false)
            showToast('✦ Invitation sent! User will receive their setup email shortly.')
            await fetchMembers()
          }}
          onToast={showToast}
        />
      )}

      {/* Edit Courses modal */}
      {editTarget && (
        <EditCoursesModal
          member={editTarget}
          courses={courses}
          currentSlugs={slugMap[editTarget.id] ?? []}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveCourses}
        />
      )}

      {/* Remove confirm dialog */}
      {removeTarget && (
        <RemoveDialog
          member={removeTarget}
          loading={removeLoading}
          onClose={() => setRemoveTarget(null)}
          onConfirm={handleRemove}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 200,
          background: C.dark3,
          border: `1px solid ${toast.kind === 'err' ? 'rgba(229,115,115,0.5)' : C.orange}`,
          borderRadius: 6, padding: '14px 20px', fontSize: 13, color: C.cream,
          maxWidth: 360, lineHeight: 1.5,
          animation: 'fadeInUp 0.25s ease',
        }}>
          {toast.msg}
          <style>{`
            @keyframes fadeInUp {
              from { opacity:0; transform:translateY(10px) }
              to   { opacity:1; transform:translateY(0)    }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
