'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { listCourseLessons, upsertLesson, deleteCmsLesson, reorderLessons, syncLeadershipCourses,
  type CmsLesson,
} from '@/app/admin/super/actions'
import { RichTextEditor } from './RichTextEditor'

// ── Brand colors (mirrors SuperAdminDashboard C palette) ─────────────────────
const C = {
  dark:  '#0A0804', dark2: '#0F0C07', dark3: '#161109', dark4: '#1E160C', dark5: '#251C0F',
  cream: '#F0EAE0', orange: '#E8621A', gold: '#C9A84C',
  muted: '#B8A89A', muted2: '#D4C4B7',
  border:  'rgba(201,168,76,0.12)',
  border2: 'rgba(201,168,76,0.25)',
  border3: 'rgba(201,168,76,0.45)',
  red: '#E57373', green: '#81C784',
}

// ── Course definitions ────────────────────────────────────────────────────────
const COURSES = [
  // Personal (Individual)
  { id: 1, name: 'Programming the Gatekeeper',          category: 'individual', tag: 'RAS Programming',     tier: 'Free' },
  { id: 2, name: 'Mastery of the Law of Assumption',    category: 'individual', tag: 'Law of Assumption',   tier: 'Architect' },
  { id: 3, name: 'Subconscious Reprogramming via SATS', category: 'individual', tag: 'SATS Reprogramming',  tier: 'Architect' },
  { id: 4, name: 'Navigating the Echo Theory Delay',    category: 'individual', tag: 'Echo Theory',         tier: 'Reality Master' },
  
  // Business
  { id: 5, name: 'Common Sense in the Workplace',       category: 'business',   tag: 'Business',            tier: 'Free' },
  { id: 6, name: 'From Reaction to Response',           category: 'business',   tag: 'Business',            tier: 'Architect' },
  { id: 7, name: 'Know Yourself, Lead Yourself',        category: 'business',   tag: 'Business',            tier: 'Architect' },
  { id: 8, name: 'The High-Frequency Team',             category: 'business',   tag: 'Business',            tier: 'Elite' },
  
  // Education
  { id: 9,  name: 'The Educator Reset',                 category: 'education',  tag: 'Education',           tier: 'Free' },
  { id: 10, name: 'Vibrational Leadership',             category: 'education',  tag: 'Education',           tier: 'Architect' },
  { id: 11, name: 'Co-Regulation Mastery',              category: 'education',  tag: 'Education',           tier: 'Architect' },
  { id: 12, name: 'The Retained Educator',              category: 'education',  tag: 'Education',           tier: 'Elite' },

  // Leadership
  { id: 13, name: 'The Internal Authority',             category: 'leadership', tag: 'Leadership',          tier: 'Free' },
  { id: 14, name: 'Visionary Architecture',             category: 'leadership', tag: 'Leadership',          tier: 'Architect' },
  { id: 15, name: 'The Bridge of Incidents',            category: 'leadership', tag: 'Leadership',          tier: 'Architect' },
  { id: 16, name: 'Echo Theory Mastery',                category: 'leadership', tag: 'Leadership',          tier: 'Elite' },
]

// ── YouTube helpers ───────────────────────────────────────────────────────────
function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?#]+)/)
  return m ? m[1] : null
}
function isValidYoutubeUrl(url: string): boolean {
  if (!url) return false
  const trimmed = url.trim()
  if (trimmed.startsWith('http')) {
    return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/.test(trimmed)
  }
  return trimmed.length > 0
}

// ── Small reusable components ─────────────────────────────────────────────────
function IS(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    background: C.dark4, border: `1px solid ${C.border}`, color: C.cream,
    fontFamily: "'DM Sans',sans-serif", fontSize: 14, padding: '9px 12px',
    borderRadius: 3, outline: 'none', width: '100%', boxSizing: 'border-box',
    ...extra,
  }
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.muted, marginBottom: 5 }}>
      {children}
    </div>
  )
}

function Err({ msg }: { msg: string | null }) {
  if (!msg) return null
  return (
    <div style={{ fontSize: 12, color: C.red, marginTop: 4, padding: '6px 10px', background: 'rgba(229,115,115,0.08)', border: '1px solid rgba(229,115,115,0.2)', borderRadius: 3 }}>
      {msg}
    </div>
  )
}

function Btn({
  variant = 'ghost', size = 'sm', children, onClick, disabled, style,
}: {
  variant?: 'ghost' | 'primary' | 'danger' | 'success' | 'gold'
  size?: 'sm' | 'md'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  style?: React.CSSProperties
}) {
  const base: React.CSSProperties = {
    fontFamily: "'DM Sans',sans-serif", fontWeight: 600, letterSpacing: '1.5px',
    textTransform: 'uppercase', borderRadius: 3, cursor: disabled ? 'default' : 'pointer',
    transition: 'all 0.18s', border: 'none', opacity: disabled ? 0.5 : 1,
    padding: size === 'sm' ? '5px 12px' : '9px 18px', fontSize: size === 'sm' ? 10 : 12,
  }
  const vs: Record<string, React.CSSProperties> = {
    ghost:   { background: 'transparent', border: `1px solid ${C.border2}`, color: C.muted2 },
    primary: { background: C.orange, color: '#fff' },
    gold:    { background: 'transparent', border: `1px solid ${C.border2}`, color: C.gold },
    danger:  { background: 'transparent', border: '1px solid rgba(229,115,115,0.3)', color: C.red },
    success: { background: 'transparent', border: '1px solid rgba(129,199,132,0.3)', color: C.green },
  }
  return (
    <button style={{ ...base, ...vs[variant], ...style }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{
      position: 'relative', width: 36, height: 19, flexShrink: 0, cursor: 'pointer',
      background: checked ? 'rgba(232,98,26,0.15)' : C.dark5,
      border: `1px solid ${checked ? C.orange : C.border}`,
      borderRadius: 19, transition: '0.2s',
    }}>
      <div style={{
        position: 'absolute', width: 13, height: 13, borderRadius: '50%',
        background: checked ? C.orange : C.muted,
        top: 2, left: checked ? 19 : 2, transition: '0.2s',
      }} />
    </div>
  )
}

// ── Type badge ────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: 'video' | 'text' | 'header' }) {
  const styles: Record<string, React.CSSProperties> = {
    video:  { background: 'rgba(232,98,26,0.15)',  color: C.orange, border: `1px solid rgba(232,98,26,0.3)` },
    text:   { background: 'rgba(240,234,224,0.08)', color: C.cream,  border: `1px solid rgba(240,234,224,0.15)` },
    header: { background: 'rgba(201,168,76,0.1)',  color: C.gold,   border: `1px solid rgba(201,168,76,0.25)` },
  }
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: 2, whiteSpace: 'nowrap',
      ...styles[type],
    }}>
      {type}
    </span>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// LESSON EDITOR MODAL
// ══════════════════════════════════════════════════════════════════════════════

type LessonForm = {
  id?: string
  course_id: number
  title: string
  type: 'video' | 'text' | 'header'
  youtube_url: string
  content: string
  sort_order: number
  is_published: boolean
  is_preview: boolean
}

function defaultForm(courseId: number, sortOrder: number): LessonForm {
  return {
    course_id: courseId, title: '', type: 'video', youtube_url: '',
    content: '', sort_order: sortOrder, is_published: true, is_preview: false,
  }
}

function LessonEditorModal({
  open, lesson, courseId, nextSortOrder, onClose, onSaved, onDeleted,
}: {
  open: boolean
  lesson: CmsLesson | null
  courseId: number
  nextSortOrder: number
  onClose: () => void
  onSaved: (msg: string) => void
  onDeleted: (msg: string) => void
}) {
  const isNew = !lesson
  const [form, setForm] = useState<LessonForm>(
    lesson ? {
      id: lesson.id, course_id: lesson.course_id, title: lesson.title,
      type: lesson.type as LessonForm['type'], youtube_url: lesson.youtube_url ?? '',
      content: lesson.content ?? '', sort_order: lesson.sort_order,
      is_published: lesson.is_published, is_preview: lesson.is_preview,
    } : defaultForm(courseId, nextSortOrder)
  )
  const [errors, setErrors]             = useState<Record<string, string>>({})
  const [isPending, startTransition]    = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Reset form when lesson changes (open/close)
  useEffect(() => {
    if (open) {
      setErrors({})
      setShowDeleteConfirm(false)
      setForm(
        lesson ? {
          id: lesson.id, course_id: lesson.course_id, title: lesson.title,
          type: lesson.type as LessonForm['type'], youtube_url: lesson.youtube_url ?? '',
          content: lesson.content ?? '', sort_order: lesson.sort_order,
          is_published: lesson.is_published, is_preview: lesson.is_preview,
        } : defaultForm(courseId, nextSortOrder)
      )
    }
  }, [open, lesson, courseId, nextSortOrder])

  if (!open) return null

  const set = <K extends keyof LessonForm>(k: K, v: LessonForm[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const videoId  = form.type === 'video' ? extractYoutubeId(form.youtube_url) : null
  const urlValid = form.type === 'video' ? (form.youtube_url === '' || isValidYoutubeUrl(form.youtube_url)) : true

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required.'
    if (form.type === 'video') {
      if (!form.youtube_url.trim()) e.youtube_url = 'YouTube URL is required.'
      else if (!isValidYoutubeUrl(form.youtube_url)) e.youtube_url = 'Enter a valid YouTube URL.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function save() {
    if (!validate()) return
    startTransition(async () => {
      const res = await upsertLesson({
        id:          form.id,
        course_id:   form.course_id,
        title:       form.title.trim(),
        type:        form.type,
        youtube_url: form.youtube_url.trim() || null,
        content:     form.content || null,
        sort_order:  form.sort_order,
        is_published: form.is_published,
        is_preview:   form.is_preview,
      })
      if (res.success) { onClose(); onSaved(isNew ? 'Lesson created.' : 'Lesson updated.') }
      else setErrors({ _form: res.error ?? 'Save failed.' })
    })
  }

  function doDelete() {
    if (!form.id) return
    startTransition(async () => {
      const res = await deleteCmsLesson(form.id!)
      if (res.success) { onClose(); onDeleted('Lesson deleted.') }
      else setErrors({ _form: res.error ?? 'Delete failed.' })
    })
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        display: 'flex', position: 'fixed', inset: 0,
        background: 'rgba(10,8,4,0.9)', zIndex: 200,
        alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div style={{
        background: C.dark3, border: `1px solid ${C.border2}`, borderRadius: 8,
        width: 720, maxWidth: '95vw', maxHeight: '92vh', overflowY: 'auto', padding: 32,
      }}>

        {/* Header */}
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, marginBottom: 6 }}>
          {isNew ? 'Add Lesson' : 'Edit Lesson'}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 24, letterSpacing: 1, display: 'flex', gap: 6, alignItems: 'center' }}>
          Course {courseId} — {COURSES.find(c => c.id === courseId)?.name}
          <span style={{ 
            fontSize: 9, padding: '2px 6px', borderRadius: 2, 
            background: 'rgba(232,98,26,0.1)', color: C.orange, 
            border: '1px solid rgba(232,98,26,0.2)', textTransform: 'uppercase', fontWeight: 700 
          }}>
            {COURSES.find(c => c.id === courseId)?.category}
          </span>
        </div>

        {/* Type selector */}
        <div style={{ marginBottom: 20 }}>
          <Label>Lesson Type</Label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['video', 'text', 'header'] as const).map(t => (
              <button
                key={t}
                onClick={() => set('type', t)}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 3, cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11,
                  letterSpacing: 2, textTransform: 'uppercase', transition: '0.18s',
                  background: form.type === t ? C.orange : C.dark5,
                  color: form.type === t ? '#fff' : C.muted2,
                  border: `1px solid ${form.type === t ? C.orange : C.border}`,
                }}
              >
                {t === 'video' ? '▶ Video' : t === 'text' ? '☰ Text' : '— Header'}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <Label>Lesson Title</Label>
          <input
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. The 11 Million Bit Problem"
            style={IS()}
          />
          <Err msg={errors.title ?? null} />
        </div>

        {/* YouTube URL (video only) */}
        {form.type === 'video' && (
          <div style={{ marginBottom: 20 }}>
            <Label>YouTube URL</Label>
            <input
              value={form.youtube_url}
              onChange={e => set('youtube_url', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=XXXXXXXXX"
              style={IS({ borderColor: !urlValid ? C.red : undefined })}
            />
            <Err msg={errors.youtube_url ?? null} />

            {/* Live preview */}
            {videoId && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>
                  VIDEO PREVIEW
                </div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt="thumbnail"
                    style={{ width: 160, height: 90, objectFit: 'cover', border: `1px solid ${C.border2}`, borderRadius: 3 }}
                  />
                  <div style={{ flex: 1, background: C.dark4, border: `1px solid ${C.border}`, borderRadius: 3, overflow: 'hidden', aspectRatio: '16/9', maxHeight: 200 }}>
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=1`}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="preview"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text content (text & video only) */}
        {(form.type === 'text' || form.type === 'video') && (
          <div style={{ marginBottom: 16 }}>
            <Label>{form.type === 'video' ? 'Video Description' : 'Lesson Content'}</Label>
            <RichTextEditor
              key={form.id ?? 'new'}
              content={form.content}
              onChange={val => set('content', val)}
            />
          </div>
        )}

        {/* Header type note */}
        {form.type === 'header' && (
          <div style={{
            marginBottom: 16, padding: '10px 14px',
            background: 'rgba(201,168,76,0.06)', border: `1px solid ${C.border2}`,
            borderRadius: 3, fontSize: 12, color: C.muted, lineHeight: 1.5,
          }}>
            ✦ Section headers display as visual dividers inside the course player. Only the title is used.
          </div>
        )}

        {/* Sort order */}
        <div style={{ marginBottom: 16 }}>
          <Label>Sort Order</Label>
          <input
            type="number"
            value={form.sort_order}
            onChange={e => set('sort_order', parseInt(e.target.value) || 0)}
            style={IS({ width: 100 })}
          />
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: 28, marginBottom: 24 }}>
          <div>
            <Label>Published</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
              <Toggle checked={form.is_published} onChange={() => set('is_published', !form.is_published)} />
              <span style={{ fontSize: 13, color: form.is_published ? C.green : C.muted }}>
                {form.is_published ? 'Live' : 'Draft'}
              </span>
            </div>
          </div>
          <div>
            <Label>Seeker Preview</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
              <Toggle checked={form.is_preview} onChange={() => set('is_preview', !form.is_preview)} />
              <span style={{ fontSize: 13, color: form.is_preview ? C.orange : C.muted }}>
                {form.is_preview ? 'Visible to Seeker tier' : 'Paid tiers only'}
              </span>
            </div>
          </div>
        </div>

        <Err msg={errors._form ?? null} />

        {/* Delete confirmation inline */}
        {showDeleteConfirm && (
          <div style={{
            marginBottom: 16, padding: '14px 16px',
            background: 'rgba(229,115,115,0.06)', border: '1px solid rgba(229,115,115,0.25)',
            borderRadius: 4,
          }}>
            <div style={{ fontSize: 13, color: C.red, marginBottom: 10 }}>
              Delete this lesson permanently? This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="danger" size="sm" onClick={doDelete} disabled={isPending}>
                {isPending ? 'Deleting…' : 'Yes, Delete'}
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Btn>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 18, borderTop: `1px solid ${C.border}`,
        }}>
          <div>
            {!isNew && !showDeleteConfirm && (
              <Btn variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                Delete Lesson
              </Btn>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="ghost" size="sm" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" size="sm" onClick={save} disabled={isPending}>
              {isPending ? 'Saving…' : isNew ? 'Create Lesson' : 'Save Changes'}
            </Btn>
          </div>
        </div>

      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// COURSE MANAGER PAGE
// ══════════════════════════════════════════════════════════════════════════════

export function CourseManagerPage({ onToast }: { onToast: (msg: string) => void }) {
  const [activeCategory, setActiveCategory] = useState<'individual' | 'business' | 'education' | 'leadership'>('individual')
  const [selectedCourse, setSelectedCourse] = useState(1)
  const [lessons, setLessons]               = useState<CmsLesson[]>([])
  const [loading, setLoading]               = useState(false)
  const [editLesson, setEditLesson]         = useState<CmsLesson | null>(null)
  const [showEditor, setShowEditor]         = useState(false)
  const [isPending, startTransition]        = useTransition()
  const [syncing, setSyncing]               = useState(false)

  const fetchLessons = useCallback(async (courseId: number) => {
    setLoading(true)
    const res = await listCourseLessons(courseId)
    setLessons(res.lessons)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLessons(selectedCourse)
  }, [selectedCourse, fetchLessons])

  function openNew() {
    setEditLesson(null)
    setShowEditor(true)
  }
  function openEdit(lesson: CmsLesson) {
    setEditLesson(lesson)
    setShowEditor(true)
  }

  async function handleSyncLeadership() {
    setSyncing(true)
    // force=true — always replace existing content with the expanded curriculum
    const res = await syncLeadershipCourses(true)
    setSyncing(false)
    if (res.success) {
      onToast(res.seeded > 0 ? `Resynced ${res.seeded} lessons with expanded curriculum content.` : 'Sync complete.')
      fetchLessons(selectedCourse)
    } else {
      onToast(`Sync failed: ${res.error}`)
    }
  }

  function handleSaved(msg: string) {
    onToast(msg)
    fetchLessons(selectedCourse)
  }
  function handleDeleted(msg: string) {
    onToast(msg)
    fetchLessons(selectedCourse)
  }

  // DnD reorder
  function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const reordered = Array.from(lessons)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    const withNewOrder = reordered.map((l, i) => ({ ...l, sort_order: i }))
    setLessons(withNewOrder)

    startTransition(async () => {
      const res = await reorderLessons(withNewOrder.map(l => ({ id: l.id, sort_order: l.sort_order })))
      if (res.success) onToast('Order saved.')
      else onToast(`Error saving order: ${res.error}`)
    })
  }

  const nextSortOrder = lessons.length > 0
    ? Math.max(...lessons.map(l => l.sort_order)) + 1
    : 0

  return (
    <>
      <div style={{ display: 'flex', gap: 20, minHeight: 480 }}>

        {/* ── Left panel: course selector ─────────────────────────────────── */}
        <div style={{ width: 220, flexShrink: 0 }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: C.dark2, padding: 4, borderRadius: 4 }}>
            {(['individual', 'business', 'education', 'leadership'] as const).map(cat => {
              const active = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat)
                    // Auto-select first course in category
                    const first = COURSES.find(c => c.category === cat)
                    if (first) setSelectedCourse(first.id)
                  }}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 2, cursor: 'pointer',
                    fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, letterSpacing: 1.5,
                    textTransform: 'uppercase', transition: '0.15s',
                    background: active ? C.orange : 'transparent',
                    color: active ? '#fff' : C.muted,
                    border: 'none',
                  }}
                >
                  {cat === 'individual' ? 'Personal' : cat === 'education' ? 'Educators' : cat === 'leadership' ? 'Leadership' : cat}
                </button>
              )
            })}
          </div>

          <div style={{
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 3,
            color: C.muted, marginBottom: 10, paddingLeft: 4
          }}>
            Courses
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {COURSES.filter(c => c.category === activeCategory).map(course => {
              const active = selectedCourse === course.id
              return (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '12px 14px', borderRadius: 4, cursor: 'pointer',
                    background: active ? 'linear-gradient(90deg,rgba(232,98,26,0.18),rgba(201,168,76,0.05))' : C.dark3,
                    border: `1px solid ${active ? C.orange : C.border}`,
                    borderLeft: `3px solid ${active ? C.orange : 'transparent'}`,
                    transition: 'all 0.18s',
                  }}
                >
                  <div style={{
                    fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700,
                    letterSpacing: 2, textTransform: 'uppercase',
                    color: active ? C.orange : C.muted, marginBottom: 3,
                  }}>
                    Course {course.id} · {course.tier}
                  </div>
                  <div style={{ fontSize: 13, color: active ? C.cream : C.muted2, lineHeight: 1.3 }}>
                    {course.name}
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{course.tag}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Right panel: lesson list ─────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Panel header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}`,
          }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2 }}>
                {COURSES.find(c => c.id === selectedCourse)?.name}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>
                {loading ? 'Loading…' : `${lessons.length} lesson${lessons.length !== 1 ? 's' : ''}`}
                {isPending && <span style={{ marginLeft: 8, color: C.gold }}>· Saving order…</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {activeCategory === 'leadership' && (
                <Btn variant="gold" size="md" onClick={handleSyncLeadership} disabled={syncing}>
                  {syncing ? 'Syncing…' : '⟳ Sync from Curriculum'}
                </Btn>
              )}
              <Btn variant="primary" size="md" onClick={openNew}>+ Add Lesson</Btn>
            </div>
          </div>

          {/* Empty state */}
          {!loading && lessons.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '48px 0', color: C.muted,
              border: `1px dashed ${C.border2}`, borderRadius: 6,
            }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 2, marginBottom: 8 }}>
                No lessons yet
              </div>
              <div style={{ fontSize: 13, marginBottom: 16 }}>
                Add the first lesson for this course.
              </div>
              <Btn variant="primary" size="sm" onClick={openNew}>+ Add First Lesson</Btn>
            </div>
          )}

          {/* Loading shimmer */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: 56, background: C.dark3, border: `1px solid ${C.border}`,
                  borderRadius: 4, opacity: 0.5, animation: 'pulse 1.4s ease-in-out infinite',
                }} />
              ))}
            </div>
          )}

          {/* DnD lesson list */}
          {!loading && lessons.length > 0 && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="lessons">
                {provided => (
                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {lessons.map((lesson, index) => (
                      <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                        {(draggable, snapshot) => (
                          <div
                            ref={draggable.innerRef}
                            {...draggable.draggableProps}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 14px',
                              background: snapshot.isDragging ? C.dark5 : C.dark3,
                              border: `1px solid ${snapshot.isDragging ? C.orange : C.border}`,
                              borderRadius: 4, transition: snapshot.isDragging ? 'none' : 'all 0.15s',
                              userSelect: 'none',
                              ...draggable.draggableProps.style,
                            }}
                          >
                            {/* Drag handle */}
                            <div
                              {...draggable.dragHandleProps}
                              style={{
                                cursor: 'grab', color: C.muted, fontSize: 14,
                                padding: '2px 4px', flexShrink: 0,
                              }}
                              title="Drag to reorder"
                            >
                              ⠿
                            </div>

                            {/* Sort number */}
                            <div style={{
                              fontFamily: "'Bebas Neue',sans-serif", fontSize: 13,
                              color: C.muted, minWidth: 22, flexShrink: 0,
                            }}>
                              {String(index + 1).padStart(2, '0')}
                            </div>

                            {/* Type badge */}
                            <TypeBadge type={lesson.type} />

                            {/* Title */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: 14, color: lesson.is_published ? C.cream : C.muted,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {lesson.title}
                                {!lesson.is_published && (
                                  <span style={{ marginLeft: 8, fontSize: 9, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>
                                    Draft
                                  </span>
                                )}
                              </div>
                              {lesson.type === 'video' && lesson.youtube_url && (
                                <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                                  {lesson.youtube_url.replace('https://www.', '')}
                                </div>
                              )}
                            </div>

                            {/* Preview badge */}
                            {lesson.is_preview && (
                              <span style={{
                                fontSize: 9, padding: '2px 7px', borderRadius: 10, flexShrink: 0,
                                background: 'rgba(129,199,132,0.12)', color: C.green,
                                border: '1px solid rgba(129,199,132,0.25)',
                                fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                              }}>
                                Seeker
                              </span>
                            )}

                            {/* Published toggle */}
                            <div style={{ flexShrink: 0 }}>
                              <Toggle
                                checked={lesson.is_published}
                                onChange={() => {
                                  // Optimistic toggle
                                  const updated = lessons.map(l =>
                                    l.id === lesson.id ? { ...l, is_published: !l.is_published } : l
                                  )
                                  setLessons(updated)
                                  startTransition(async () => {
                                    await upsertLesson({
                                      id: lesson.id, 
                                      course_id: lesson.course_id,
                                      title: lesson.title, 
                                      type: lesson.type,
                                      youtube_url: lesson.type === 'video' ? (lesson.youtube_url ?? null) : null,
                                      content: lesson.type === 'text' ? (lesson.content ?? null) : null,
                                      sort_order: lesson.sort_order,
                                      is_published: !lesson.is_published,
                                      is_preview: lesson.is_preview,
                                    })
                                  })
                                }}
                              />
                            </div>

                            {/* Edit button */}
                            <Btn variant="gold" size="sm" onClick={() => openEdit(lesson)}>Edit</Btn>

                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Legend */}
          {!loading && lessons.length > 0 && (
            <div style={{
              marginTop: 16, fontSize: 11, color: C.muted, display: 'flex',
              alignItems: 'center', gap: 16, borderTop: `1px solid ${C.border}`, paddingTop: 12,
            }}>
              <span>⠿ Drag rows to reorder — changes save instantly</span>
              <span style={{ marginLeft: 'auto' }}>
                Toggle left = draft · Toggle right = live
              </span>
            </div>
          )}

        </div>
      </div>

      <LessonEditorModal
        open={showEditor}
        lesson={editLesson}
        courseId={selectedCourse}
        nextSortOrder={nextSortOrder}
        onClose={() => setShowEditor(false)}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.2} }
      `}</style>
    </>
  )
}
