'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  MessageCircle, Pin, ArrowUp, ChevronRight, Users, Send,
  Loader2, RefreshCw, Plus, X, Sparkles, Search, CheckCheck, UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  COMMUNITY_THREADS,
  COMMUNITY_CATEGORIES,
  COMMUNITY_VERTICALS,
  SAMPLE_DM_CONVERSATIONS,
  COMMUNITY_DIRECTORY,
  type CommunityThread,
  type CommunityAuthor,
  type CommunityVertical,
  type DirectMessageConversation,
  type DirectMessageItem,
} from '@/lib/data/community'
import type { PostCategory } from '@/types'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// ── Types & Constants ────────────────────────────────────────────────────────

const CUSTOM_POSTS_STORAGE_KEY = 'vibehyr_community_custom_posts'
const DM_STORAGE_KEY           = 'vibehyr_dm_conversations_v1'

const POST_TYPE_TO_CATEGORY: Record<string, PostCategory> = {
  bridge_win:            'bridge_of_incidents',
  question:              'questions',
  insight:               'general',
  accountability_update: 'accountability',
}

const CATEGORY_TO_POST_TYPE: Record<PostCategory, 'bridge_win' | 'question' | 'insight' | 'accountability_update'> = {
  general:             'insight',
  sats_wins:           'bridge_win',
  questions:           'question',
  bridge_of_incidents: 'bridge_win',
  accountability:      'accountability_update',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 0) return 'just now'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

function formatMessageTime(iso: string) {
  const date = new Date(iso)
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000)
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (diffDays <= 0) return `Today · ${timeStr}`
  if (diffDays === 1) return `Yesterday · ${timeStr}`
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${timeStr}`
}

const CATEGORY_COLORS: Record<PostCategory, string> = {
  general:             'border-grey-DEFAULT text-grey-DEFAULT',
  sats_wins:           'border-orange-DEFAULT text-orange-DEFAULT',
  questions:           'border-blue-400 text-blue-400',
  bridge_of_incidents: 'border-green-400 text-green-400',
  accountability:      'border-[#dfbd8b] text-[#dfbd8b]',
}
const CATEGORY_LABELS: Record<PostCategory, string> = {
  general:             'General',
  sats_wins:           'Win & Breakthrough',
  questions:           'Question',
  bridge_of_incidents: 'Bridge of Incidents',
  accountability:      'Accountability',
}

const VERTICAL_BADGE_STYLES: Record<string, string> = {
  personal:   'bg-orange-DEFAULT/10 text-orange-DEFAULT border-orange-DEFAULT/30',
  business:   'bg-amber-500/10 text-amber-300 border-amber-500/30',
  educator:   'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  leadership: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  all:        'bg-white/5 text-white/70 border-white/15',
}

const VERTICAL_LABELS: Record<string, string> = {
  personal:   'Personal',
  business:   'Business',
  educator:   'Educators',
  leadership: 'Leadership',
  all:        'All Tracks',
}

// ── Contextual auto-reply generator for seeded mentors & accountability leads ─

function getAutoReplyForPartner(partner: CommunityAuthor, userText: string): string {
  const lower = userText.toLowerCase()
  if (partner.role === 'admin') {
    if (lower.includes('sats') || lower.includes('scene')) {
      return 'Remember: keep your SATS scene to a single 8-to-15-second first-person moment *after* the wish is already fulfilled. Add one physical texture (like a desk or ring) and let the feeling of normality do the heavy lifting.'
    }
    if (lower.includes('echo') || lower.includes('3d') || lower.includes('delay')) {
      return 'Hold your standard steady! What you see in the 3D today is just expiring fossil light from 60 days ago. Run the 30-Second Decision Matrix and refuse to sign a new lease on the old state.'
    }
    return 'Received and locked in, Architect. Keep logging your daily Assumption Lab commitments and nightly Revision — I am holding the end state with you.'
  }
  if (partner.id === 'm-7') {
    return 'Locked in for the 30-Day Challenge! ☑ Make sure you do your 5-minute morning RAS directive before checking notifications tomorrow, and message me after your evening Revision Journal!'
  }
  if (partner.id === 'm-9') {
    return 'Love that focus. Try dropping your vocal cadence to 80% speed and leading with the Clarity Frame in your next meeting — let me know how the room responds!'
  }
  if (partner.id === 'm-10') {
    return 'Co-regulation first! Do your 30-second Zone 2 threshold breath at the classroom door tomorrow and keep banking those 2×10 relational deposits. Keep me posted!'
  }
  if (partner.id === 'm-12') {
    return 'Strong commitment. Remember Course 01: we don\'t get the culture we ask for, we get the culture we embody and tolerate. Let\'s review your progress at the end of the week!'
  }
  return `Appreciate you reaching out! Let's hold the assumption steady this week and check in on our Bridge of Incidents progress in a few days.`
}

// ── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ author, size = 'sm' }: { author: CommunityAuthor; size?: 'sm' | 'md' | 'lg' }) {
  const sz =
    size === 'sm'
      ? 'w-9 h-9 text-sm'
      : size === 'lg'
        ? 'w-11 h-11 text-lg'
        : 'w-10 h-10 text-base'
  const initial = author.full_name?.[0]?.toUpperCase() ?? '?'
  return (
    <div
      className={cn(
        'rounded-full bg-[#E8621A]/15 border border-[#E8621A]/50 flex items-center justify-center flex-shrink-0 font-display text-[#E8621A]',
        sz
      )}
    >
      {initial}
    </div>
  )
}

// ── Thread row ────────────────────────────────────────────────────────────────

function ThreadRow({ thread }: { thread: CommunityThread }) {
  const verticalKey = thread.vertical ?? 'personal'
  const hasRecentUpdate = Boolean(thread.updated_at && thread.updated_at !== thread.created_at)

  return (
    <Link
      href={`/community/${thread.id}`}
      className="flex items-start gap-4 px-6 py-5 bg-black-2 hover:bg-black-3 transition-colors group border-b border-white/5 last:border-0"
    >
      <Avatar author={thread.author} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {thread.is_pinned && (
            <span className="inline-flex items-center gap-1 font-mono text-[0.46rem] tracking-[0.18em] uppercase px-2 py-0.5 bg-orange-DEFAULT/15 border border-orange-DEFAULT/40 text-orange-DEFAULT">
              <Pin size={10} className="text-orange-DEFAULT flex-shrink-0" />
              Pinned
            </span>
          )}
          <span className={cn('font-mono text-[0.48rem] tracking-[0.18em] uppercase px-2 py-0.5 border', CATEGORY_COLORS[thread.category])}>
            {CATEGORY_LABELS[thread.category]}
          </span>
          {verticalKey !== 'all' && (
            <span className={cn('font-mono text-[0.46rem] tracking-[0.16em] uppercase px-2 py-0.5 border', VERTICAL_BADGE_STYLES[verticalKey] ?? VERTICAL_BADGE_STYLES.personal)}>
              {VERTICAL_LABELS[verticalKey] ?? verticalKey}
            </span>
          )}
          {thread.course_tag && (
            <span className="font-mono text-[0.46rem] tracking-[0.14em] uppercase px-2 py-0.5 bg-white/[0.03] border border-white/10 text-grey-DEFAULT">
              {thread.course_tag}
            </span>
          )}
          {hasRecentUpdate && (
            <span className="inline-flex items-center gap-1 font-mono text-[0.45rem] tracking-[0.15em] uppercase text-[#dfbd8b]">
              <Sparkles size={10} />
              Updated {timeAgo(thread.updated_at!)}
            </span>
          )}
        </div>

        <p className="font-body text-white text-sm md:text-[0.95rem] font-medium leading-snug group-hover:text-orange-DEFAULT transition-colors mb-1 line-clamp-2">
          {thread.title}
        </p>

        <p className="font-body text-grey-DEFAULT/75 text-xs leading-relaxed line-clamp-1 mb-2">
          {thread.content.replace(/\*\*/g, '').replace(/• /g, '')}
        </p>

        <div className="flex items-center gap-2 flex-wrap font-mono text-[0.52rem] tracking-widest text-grey-dark">
          <span className="text-white/80">{thread.author.full_name}</span>
          {thread.author.role === 'admin' && (
            <span className="text-[0.44rem] tracking-[0.18em] uppercase px-1.5 py-0.2 bg-orange-DEFAULT/15 border border-orange-DEFAULT/40 text-orange-DEFAULT">
              Admin
            </span>
          )}
          {thread.author.title && (
            <span>· {thread.author.title}</span>
          )}
          <span>· Posted {timeAgo(thread.created_at)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0 text-grey-dark self-center">
        <div className="flex items-center gap-1" title="Upvotes">
          <ArrowUp size={12} className="text-orange-DEFAULT/80" />
          <span className="font-mono text-[0.55rem] text-white/80">{thread.upvotes}</span>
        </div>
        <div className="flex items-center gap-1" title="Replies">
          <MessageCircle size={12} />
          <span className="font-mono text-[0.55rem]">{thread.reply_count}</span>
        </div>
        <ChevronRight size={14} className="group-hover:text-orange-DEFAULT transition-colors" />
      </div>
    </Link>
  )
}

// ── New Post Modal ────────────────────────────────────────────────────────────

function NewPostModal({
  onClose,
  onCreated,
  userId,
  userName,
  defaultVertical,
}: {
  onClose: () => void
  onCreated: (newThread: CommunityThread) => void
  userId: string | null
  userName: string
  defaultVertical: CommunityVertical
}) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<PostCategory>('bridge_of_incidents')
  const [vertical, setVertical] = useState<CommunityVertical>(
    defaultVertical === 'all' ? 'personal' : defaultVertical
  )
  const [courseTag, setCourseTag] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and post content are required')
      return
    }
    setSubmitting(true)

    const nowIso = new Date().toISOString()
    const newThread: CommunityThread = {
      id: `post-${Date.now()}`,
      category,
      vertical,
      course_tag: courseTag.trim() || `${VERTICAL_LABELS[vertical] ?? 'Personal'} Practice`,
      title: title.trim(),
      content: body.trim(),
      author: {
        id: userId ?? 'local-member',
        full_name: userName || 'Reality Architect',
        avatar_url: null,
        membership_tier: 'architect',
        title: `${VERTICAL_LABELS[vertical] ?? 'Personal'} Track`,
      },
      reply_count: 0,
      upvotes: 1,
      is_pinned: false,
      created_at: nowIso,
      updated_at: nowIso,
      replies: [],
    }

    try {
      const existingRaw = localStorage.getItem(CUSTOM_POSTS_STORAGE_KEY)
      const existing: CommunityThread[] = existingRaw ? JSON.parse(existingRaw) : []
      localStorage.setItem(CUSTOM_POSTS_STORAGE_KEY, JSON.stringify([newThread, ...existing]))
    } catch {
      // ignore storage errors
    }

    if (userId) {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('bridge_forum_posts')
          .insert({
            user_id: userId,
            title: title.trim(),
            body: body.trim(),
            post_type: CATEGORY_TO_POST_TYPE[category] ?? 'insight',
            vertical_cohort: vertical === 'all' ? 'personal' : vertical,
          })
          .select('id')
          .single()
        if (data?.id) {
          newThread.id = data.id
        }
      } catch {
        // local storage already succeeded
      }
    }

    setSubmitting(false)
    toast.success('Post published to the community!')
    onCreated(newThread)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-black-2 border border-orange-DEFAULT/30 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-grey-dark hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <p className="font-mono text-[0.52rem] tracking-[0.2em] uppercase text-orange-DEFAULT mb-1">
          Share With The Architects
        </p>
        <h3 className="font-display text-2xl text-white tracking-wide mb-4">
          CREATE COMMUNITY POST
        </h3>

        <label className="block font-mono text-[0.46rem] tracking-[0.18em] uppercase text-grey-dark mb-1.5">
          Category
        </label>
        <div className="flex gap-2 flex-wrap mb-4">
          {COMMUNITY_CATEGORIES.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn(
                'font-mono text-[0.46rem] tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors',
                category === c.id
                  ? 'border-orange-DEFAULT bg-orange-DEFAULT/15 text-orange-DEFAULT'
                  : 'border-white/15 text-grey-dark hover:border-orange-DEFAULT/50'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <label className="block font-mono text-[0.46rem] tracking-[0.18em] uppercase text-grey-dark mb-1.5">
          Track / Vertical
        </label>
        <div className="flex gap-2 flex-wrap mb-4">
          {COMMUNITY_VERTICALS.filter(v => v.id !== 'all').map(v => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVertical(v.id)}
              className={cn(
                'font-mono text-[0.46rem] tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors',
                vertical === v.id
                  ? 'border-orange-DEFAULT bg-orange-DEFAULT/15 text-orange-DEFAULT'
                  : 'border-white/15 text-grey-dark hover:border-orange-DEFAULT/50'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Post title (e.g., My Assumption Lab breakthrough in Course 4)..."
            className="sm:col-span-2 w-full bg-black-3 border border-white/15 px-4 py-2.5 font-body text-sm text-white placeholder:text-grey-dark focus:outline-none focus:border-orange-DEFAULT/50 transition-colors"
          />
          <input
            type="text"
            value={courseTag}
            onChange={e => setCourseTag(e.target.value)}
            placeholder="Course / Module tag (optional)"
            className="w-full bg-black-3 border border-white/15 px-3 py-2.5 font-body text-xs text-white placeholder:text-grey-dark focus:outline-none focus:border-orange-DEFAULT/50 transition-colors"
          />
        </div>

        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Share your win, Assumption Lab commitment, synchronicity, or question..."
          rows={6}
          className="w-full bg-black-3 border border-white/15 px-4 py-2.5 font-body text-sm text-white placeholder:text-grey-dark focus:outline-none focus:border-orange-DEFAULT/50 transition-colors resize-none mb-4"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full btn-orange flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {submitting ? 'Publishing...' : 'Publish to Community'}
        </button>
      </div>
    </div>
  )
}

// ── Forum Tab ─────────────────────────────────────────────────────────────────

function ForumTab({
  userId,
  userName,
}: {
  userId: string | null
  userName: string
}) {
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'all'>('all')
  const [activeVertical, setActiveVertical] = useState<CommunityVertical>('all')
  const [customThreads, setCustomThreads] = useState<CommunityThread[]>([])
  const [liveThreads, setLiveThreads] = useState<CommunityThread[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewPost, setShowNewPost] = useState(false)
  const [userVertical, setUserVertical] = useState<CommunityVertical>('personal')
  const [localReplyCounts, setLocalReplyCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    try {
      const savedPosts = localStorage.getItem(CUSTOM_POSTS_STORAGE_KEY)
      if (savedPosts) {
        setCustomThreads(JSON.parse(savedPosts))
      }
      const counts: Record<string, number> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('vibehyr_community_replies_')) {
          const postId = key.replace('vibehyr_community_replies_', '')
          const replies = JSON.parse(localStorage.getItem(key) || '[]')
          if (Array.isArray(replies)) counts[postId] = replies.length
        }
      }
      setLocalReplyCounts(counts)
    } catch {
      // ignore storage errors
    }
  }, [])

  const fetchLivePosts = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_vertical')
          .eq('id', userId)
          .single()
        if (profile?.account_vertical) {
          setUserVertical(profile.account_vertical as CommunityVertical)
        }
      }

      const { data, error } = await supabase
        .from('bridge_forum_posts')
        .select(`
          id, title, body, post_type, upvotes, reply_count,
          is_pinned, created_at, vertical_cohort, user_id,
          profiles:user_id ( full_name, membership_tier )
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data && data.length > 0) {
        const mapped: CommunityThread[] = data.map((row: any) => ({
          id: row.id,
          category: POST_TYPE_TO_CATEGORY[row.post_type] ?? 'general',
          vertical: (row.vertical_cohort as CommunityVertical) ?? 'personal',
          course_tag: `${VERTICAL_LABELS[row.vertical_cohort] ?? 'Community'} Discussion`,
          title: row.title,
          content: row.body,
          author: {
            id: row.user_id,
            full_name: row.profiles?.full_name ?? 'Reality Architect',
            avatar_url: null,
            membership_tier: (row.profiles?.membership_tier as 'free' | 'architect' | 'elite') ?? 'architect',
          },
          reply_count: row.reply_count ?? 0,
          upvotes: row.upvotes ?? 1,
          is_pinned: Boolean(row.is_pinned),
          created_at: row.created_at,
          updated_at: row.created_at,
          replies: [],
        }))
        setLiveThreads(mapped)
      }
    } catch {
      // fallback gracefully to static + local threads
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchLivePosts()
  }, [fetchLivePosts])

  const allThreads = useMemo(() => {
    const map = new Map<string, CommunityThread>()
    for (const t of [...liveThreads, ...customThreads, ...COMMUNITY_THREADS]) {
      if (!map.has(t.id)) {
        const extraReplies = localReplyCounts[t.id] ?? 0
        map.set(t.id, {
          ...t,
          reply_count: t.reply_count + extraReplies,
        })
      }
    }
    return Array.from(map.values())
  }, [liveThreads, customThreads, localReplyCounts])

  const filteredThreads = useMemo(() => {
    return allThreads.filter(t => {
      const categoryMatch = activeCategory === 'all' || t.category === activeCategory
      const verticalMatch =
        activeVertical === 'all' ||
        t.vertical === 'all' ||
        (t.vertical ?? 'personal') === activeVertical
      return categoryMatch && verticalMatch
    })
  }, [allThreads, activeCategory, activeVertical])

  const pinned = filteredThreads.filter(t => t.is_pinned)
  const regular = filteredThreads.filter(t => !t.is_pinned)

  return (
    <div>
      {/* Track / Vertical Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[0.48rem] tracking-[0.2em] uppercase text-grey-dark mr-1">
            Track:
          </span>
          {COMMUNITY_VERTICALS.map(v => (
            <button
              key={v.id}
              onClick={() => setActiveVertical(v.id)}
              className={cn(
                'font-mono text-[0.5rem] tracking-[0.18em] uppercase px-3 py-1.5 border transition-colors',
                activeVertical === v.id
                  ? 'border-orange-DEFAULT bg-orange-DEFAULT/15 text-orange-DEFAULT'
                  : 'border-white/15 text-grey-dark hover:border-orange-DEFAULT/40 hover:text-white'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowNewPost(true)}
          style={{ backgroundColor: '#E8621A', color: '#000000' }}
          className="flex items-center gap-1.5 px-4 py-2 hover:opacity-90 transition-opacity font-mono text-[0.52rem] font-bold tracking-[0.18em] uppercase"
        >
          <Plus size={13} />
          New Post
        </button>
      </div>

      {/* Category Filter Bar */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            'font-mono text-[0.52rem] tracking-[0.18em] uppercase px-3 py-1.5 border transition-colors',
            activeCategory === 'all'
              ? 'border-orange-DEFAULT text-orange-DEFAULT bg-orange-DEFAULT/10'
              : 'border-white/20 text-grey-dark hover:border-orange-DEFAULT/50'
          )}
        >
          All Categories
        </button>
        {COMMUNITY_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'font-mono text-[0.52rem] tracking-[0.18em] uppercase px-3 py-1.5 border transition-colors',
              activeCategory === cat.id
                ? 'border-orange-DEFAULT text-orange-DEFAULT bg-orange-DEFAULT/10'
                : 'border-white/20 text-grey-dark hover:border-orange-DEFAULT/50'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stats + Refresh bar */}
      <div className="flex items-center justify-between gap-6 mb-4 px-1 flex-wrap">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users size={12} className="text-orange-DEFAULT" />
            <span className="font-mono text-[0.52rem] tracking-widest text-grey-dark">
              {filteredThreads.length} active discussions
            </span>
          </div>
          <div className="font-mono text-[0.52rem] tracking-widest text-[#dfbd8b]">
            ✦ Updated with Personal, Business, Educators &amp; Leadership Assumption Lab threads
          </div>
        </div>
        <button
          onClick={fetchLivePosts}
          disabled={loading}
          className="flex items-center gap-1.5 text-grey-dark hover:text-orange-DEFAULT transition-colors"
          title="Refresh discussions"
        >
          <RefreshCw size={11} className={cn(loading && 'animate-spin')} />
          <span className="font-mono text-[0.48rem] tracking-widest uppercase">Refresh</span>
        </button>
      </div>

      {/* Thread list */}
      <div className="border border-orange-DEFAULT/20 overflow-hidden">
        {pinned.length > 0 && (
          <div className="bg-orange-DEFAULT/5 border-b border-orange-DEFAULT/20">
            {pinned.map(t => (
              <ThreadRow key={t.id} thread={t} />
            ))}
          </div>
        )}
        {regular.map(t => (
          <ThreadRow key={t.id} thread={t} />
        ))}
        {regular.length === 0 && pinned.length === 0 && (
          <div className="py-12 text-center font-body italic text-grey-dark text-sm">
            No discussions match this filter yet. Click &ldquo;New Post&rdquo; to start the conversation.
          </div>
        )}
      </div>

      {/* New post modal */}
      {showNewPost && (
        <NewPostModal
          userId={userId}
          userName={userName}
          defaultVertical={activeVertical !== 'all' ? activeVertical : userVertical}
          onClose={() => setShowNewPost(false)}
          onCreated={newThread => {
            setCustomThreads(prev => [newThread, ...prev])
          }}
        />
      )}
    </div>
  )
}

// ── New Direct Message Modal (Member Directory) ───────────────────────────────

function NewMessageModal({
  onClose,
  onSelectMember,
  existingMembers,
}: {
  onClose: () => void
  onSelectMember: (member: CommunityAuthor) => void
  existingMembers: CommunityAuthor[]
}) {
  const [search, setSearch] = useState('')
  const [liveProfiles, setLiveProfiles] = useState<CommunityAuthor[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, membership_tier, role')
      .limit(30)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const mapped: CommunityAuthor[] = data
            .filter((p: any) => p.full_name)
            .map((p: any) => ({
              id: p.id,
              full_name: p.full_name,
              avatar_url: p.avatar_url ?? null,
              membership_tier: (p.membership_tier as 'free' | 'architect' | 'elite') ?? 'architect',
              role: p.role === 'super_admin' || p.role === 'admin' ? 'admin' : undefined,
              title: 'Community Member',
            }))
          setLiveProfiles(mapped)
        }
      })
  }, [])

  const directory = useMemo(() => {
    const map = new Map<string, CommunityAuthor>()
    for (const m of [...COMMUNITY_DIRECTORY, ...existingMembers, ...liveProfiles]) {
      if (!map.has(m.id)) map.set(m.id, m)
    }
    const q = search.trim().toLowerCase()
    return Array.from(map.values()).filter(
      m =>
        !q ||
        m.full_name.toLowerCase().includes(q) ||
        (m.title && m.title.toLowerCase().includes(q))
    )
  }, [existingMembers, liveProfiles, search])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-black-2 border border-[#E8621A]/40 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-grey-dark hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <p className="font-mono text-[0.52rem] tracking-[0.2em] uppercase text-[#E8621A] mb-1">
          Direct Messaging
        </p>
        <h3 className="font-display text-2xl text-white tracking-wide mb-4">
          START A CONVERSATION
        </h3>

        <div className="relative mb-4">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-dark" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search practitioners by name or track..."
            className="w-full bg-black-3 border border-white/15 pl-9 pr-4 py-2.5 font-body text-sm text-white placeholder:text-grey-dark focus:outline-none focus:border-[#E8621A]/60"
          />
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-white/5 border border-white/10">
          {directory.map(member => (
            <button
              key={member.id}
              type="button"
              onClick={() => {
                onSelectMember(member)
                onClose()
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 bg-black-2 hover:bg-black-3 transition-colors text-left group"
            >
              <Avatar author={member} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm font-medium text-white group-hover:text-[#E8621A] transition-colors truncate">
                    {member.full_name}
                  </span>
                  {member.role === 'admin' && (
                    <span className="font-mono text-[0.42rem] tracking-[0.18em] uppercase px-1.5 py-0.5 bg-[#E8621A]/15 border border-[#E8621A]/40 text-[#E8621A]">
                      Admin
                    </span>
                  )}
                  <span className="font-mono text-[0.42rem] tracking-[0.16em] uppercase px-1.5 py-0.5 border border-white/15 text-grey-DEFAULT">
                    {member.membership_tier}
                  </span>
                </div>
                {member.title && (
                  <p className="font-mono text-[0.48rem] tracking-widest text-grey-dark truncate mt-0.5">
                    {member.title}
                  </p>
                )}
              </div>
              <ChevronRight size={14} className="text-grey-dark group-hover:text-[#E8621A]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Direct Messages Tab ───────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  '🔥 Daily SATS & Mental Diet check-in complete!',
  '✦ Just finished today\'s Assumption Lab — locking in my new identity anchor.',
  '🤝 Looking to pair up for the 30-Day Revision & SATS Challenge!',
]

function MessagesTab({
  userId,
  userName,
  conversations,
  setConversations,
}: {
  userId: string | null
  userName: string
  conversations: DirectMessageConversation[]
  setConversations: React.Dispatch<React.SetStateAction<DirectMessageConversation[]>>
}) {
  const [selectedId, setSelectedId]         = useState<string>(conversations[0]?.id ?? 'dm-admin-welcome')
  const [searchQuery, setSearchQuery]       = useState('')
  const [messageInput, setMessageInput]     = useState('')
  const [sending, setSending]               = useState(false)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const messagesEndRef                      = useRef<HTMLDivElement | null>(null)

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === selectedId) ?? conversations[0],
    [conversations, selectedId]
  )

  // Mark selected conversation as read when opened
  useEffect(() => {
    if (!activeConversation || !activeConversation.unread) return
    setConversations(prev => {
      const updated = prev.map(c =>
        c.id === activeConversation.id ? { ...c, unread: false } : c
      )
      try {
        localStorage.setItem(DM_STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // ignore
      }
      return updated
    })
  }, [activeConversation, setConversations])

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeConversation?.messages.length, activeConversation?.id])

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter(
      c =>
        c.with.full_name.toLowerCase().includes(q) ||
        c.status_text.toLowerCase().includes(q) ||
        c.last_message.toLowerCase().includes(q)
    )
  }, [conversations, searchQuery])

  const persistAndSet = useCallback(
    (updater: (prev: DirectMessageConversation[]) => DirectMessageConversation[]) => {
      setConversations(prev => {
        const next = updater(prev)
        try {
          localStorage.setItem(DM_STORAGE_KEY, JSON.stringify(next))
        } catch {
          // ignore
        }
        return next
      })
    },
    [setConversations]
  )

  const handleSendMessage = async (customText?: string) => {
    const text = (customText ?? messageInput).trim()
    if (!text || !activeConversation) return
    setSending(true)
    if (!customText) setMessageInput('')

    const nowIso = new Date().toISOString()
    const currentSenderId = userId ?? 'current-user'

    const outgoingMsg: DirectMessageItem = {
      id: `dm-msg-${Date.now()}`,
      sender_id: currentSenderId,
      content: text,
      created_at: nowIso,
    }

    const targetConvoId = activeConversation.id
    const partner = activeConversation.with

    persistAndSet(prev =>
      prev.map(c =>
        c.id === targetConvoId
          ? {
              ...c,
              last_message: text,
              last_message_at: nowIso,
              unread: false,
              messages: [...c.messages, outgoingMsg],
            }
          : c
      )
    )

    // Attempt Supabase sync if authenticated
    if (userId) {
      try {
        const supabase = createClient()
        await supabase.from('direct_messages').insert({
          sender_id: userId,
          recipient_id: partner.id,
          recipient_name: partner.full_name,
          content: text,
        })
      } catch {
        // already persisted locally
      }
    }

    setSending(false)

    // Provide a natural mentor/accountability partner response after a brief moment
    setTimeout(() => {
      const replyText = getAutoReplyForPartner(partner, text)
      const replyIso = new Date().toISOString()
      const replyMsg: DirectMessageItem = {
        id: `dm-reply-${Date.now()}`,
        sender_id: partner.id,
        content: replyText,
        created_at: replyIso,
      }
      persistAndSet(prev =>
        prev.map(c =>
          c.id === targetConvoId
            ? {
                ...c,
                last_message: replyText,
                last_message_at: replyIso,
                messages: [...c.messages, replyMsg],
              }
            : c
        )
      )
    }, 900)
  }

  const handleStartConversationWithMember = (member: CommunityAuthor) => {
    const existing = conversations.find(c => c.with.id === member.id)
    if (existing) {
      setSelectedId(existing.id)
      return
    }
    const nowIso = new Date().toISOString()
    const newConvo: DirectMessageConversation = {
      id: `dm-${member.id}-${Date.now()}`,
      with: member,
      vertical: 'personal',
      status_text: member.title ?? 'Reality Architect',
      last_message: `Connected with ${member.full_name}`,
      last_message_at: nowIso,
      unread: false,
      messages: [
        {
          id: `msg-init-${Date.now()}`,
          sender_id: member.id,
          content: `Hey ${userName}! Glad to connect here on Vibe Hyr. Let me know what course or assumption you are focusing on this week!`,
          created_at: nowIso,
        },
      ],
    }
    persistAndSet(prev => [newConvo, ...prev])
    setSelectedId(newConvo.id)
    toast.success(`Opened conversation with ${member.full_name}`)
  }

  return (
    <div className="border border-[#E8621A]/30 bg-black-2 grid grid-cols-1 lg:grid-cols-12 min-h-[620px] overflow-hidden">
      {/* ── Left Column: Conversations Inbox ────────────────────────────────── */}
      <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col">
        {/* Inbox Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2 bg-black-3">
          <div>
            <p className="font-mono text-[0.48rem] tracking-[0.22em] uppercase text-[#E8621A]">
              Direct Channels
            </p>
            <h2 className="font-display text-xl tracking-wider text-white">
              MESSAGES ({conversations.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowNewMessage(true)}
            style={{ backgroundColor: '#E8621A', color: '#000000' }}
            className="flex items-center gap-1.5 px-3 py-2 font-mono text-[0.48rem] font-bold tracking-[0.16em] uppercase hover:opacity-90 transition-opacity"
          >
            <UserPlus size={12} />
            New Chat
          </button>
        </div>

        {/* Search Conversations */}
        <div className="p-3 border-b border-white/10 bg-black-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-dark" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter conversations..."
              className="w-full bg-black-3 border border-white/15 pl-8 pr-3 py-2 font-body text-xs text-white placeholder:text-grey-dark focus:outline-none focus:border-[#E8621A]/50"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 max-h-[340px] lg:max-h-[520px]">
          {filteredConversations.map(convo => {
            const isSelected = convo.id === activeConversation?.id
            return (
              <button
                key={convo.id}
                type="button"
                onClick={() => setSelectedId(convo.id)}
                className={cn(
                  'w-full flex items-start gap-3.5 p-4 text-left transition-colors relative',
                  isSelected
                    ? 'bg-[#E8621A]/15 border-l-2 border-l-[#E8621A]'
                    : 'bg-black-2 hover:bg-black-3'
                )}
              >
                <div className="relative">
                  <Avatar author={convo.with} size="sm" />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black"
                    title="Active Practitioner"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-body text-sm font-semibold text-white truncate">
                      {convo.with.full_name}
                    </span>
                    <span className="font-mono text-[0.45rem] tracking-wider text-grey-dark flex-shrink-0">
                      {timeAgo(convo.last_message_at)}
                    </span>
                  </div>
                  <p className="font-mono text-[0.45rem] tracking-widest uppercase text-[#E8621A] truncate mb-1">
                    {convo.status_text}
                  </p>
                  <p
                    className={cn(
                      'font-body text-xs line-clamp-1',
                      convo.unread ? 'text-white font-medium' : 'text-grey-DEFAULT/75'
                    )}
                  >
                    {convo.last_message}
                  </p>
                </div>
                {convo.unread && (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#E8621A] flex-shrink-0 self-center"
                    title="Unread message"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right Column: Active Conversation Pane ──────────────────────────── */}
      {activeConversation ? (
        <div className="lg:col-span-8 flex flex-col bg-[#0A0A0A]">
          {/* Active Recipient Header */}
          <div className="px-6 py-4 bg-black-3 border-b border-white/10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3.5">
              <Avatar author={activeConversation.with} size="md" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-body text-base font-semibold text-white">
                    {activeConversation.with.full_name}
                  </h3>
                  {activeConversation.with.role === 'admin' && (
                    <span className="font-mono text-[0.44rem] tracking-[0.18em] uppercase px-2 py-0.5 bg-[#E8621A]/15 border border-[#E8621A]/40 text-[#E8621A]">
                      Admin
                    </span>
                  )}
                  <span className="font-mono text-[0.44rem] tracking-[0.16em] uppercase px-2 py-0.5 border border-white/15 text-grey-DEFAULT">
                    {activeConversation.with.membership_tier}
                  </span>
                </div>
                <p className="font-mono text-[0.48rem] tracking-widest text-grey-dark mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {activeConversation.status_text}
                </p>
              </div>
            </div>

            <span className={cn('font-mono text-[0.46rem] tracking-[0.16em] uppercase px-2.5 py-1 border', VERTICAL_BADGE_STYLES[activeConversation.vertical] ?? VERTICAL_BADGE_STYLES.all)}>
              {VERTICAL_LABELS[activeConversation.vertical] ?? 'All Tracks'}
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[380px] lg:max-h-[420px]">
            {activeConversation.messages.map(msg => {
              const isMe =
                msg.sender_id === 'current-user' ||
                (userId !== null && msg.sender_id === userId)

              return (
                <div
                  key={msg.id}
                  className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}
                >
                  <div className="flex items-end gap-2.5 max-w-[85%] md:max-w-[75%]">
                    {!isMe && <Avatar author={activeConversation.with} size="sm" />}
                    <div
                      style={
                        isMe
                          ? { backgroundColor: '#E8621A', color: '#000000' }
                          : { backgroundColor: '#1A1A1A', color: '#F0EAE0' }
                      }
                      className={cn(
                        'px-4 py-3 text-sm font-body leading-relaxed',
                        isMe
                          ? 'font-medium border border-[#E8621A]'
                          : 'border border-white/10'
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 px-1">
                    <span className="font-mono text-[0.44rem] tracking-widest text-grey-dark">
                      {formatMessageTime(msg.created_at)}
                    </span>
                    {isMe && <CheckCheck size={11} className="text-[#E8621A]" />}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Accountability Check-In Chips */}
          <div className="px-6 py-2.5 bg-black-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto">
            <span className="font-mono text-[0.44rem] tracking-[0.18em] uppercase text-grey-dark flex-shrink-0">
              Quick Check-In:
            </span>
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="font-mono text-[0.46rem] tracking-wider text-grey-DEFAULT hover:text-[#E8621A] bg-black-3 border border-white/10 hover:border-[#E8621A]/40 px-2.5 py-1 transition-colors flex-shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Composer */}
          <div className="p-4 bg-black-3 border-t border-white/10">
            <div className="flex items-end gap-3">
              <textarea
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder={`Message ${activeConversation.with.full_name}... (Enter to send)`}
                rows={2}
                className="flex-1 bg-black-2 border border-white/15 px-4 py-2.5 font-body text-sm text-white placeholder:text-grey-dark focus:outline-none focus:border-[#E8621A]/60 resize-none"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={sending || !messageInput.trim()}
                style={{ backgroundColor: '#E8621A', color: '#000000' }}
                className="px-5 py-3 font-mono text-[0.52rem] font-bold tracking-[0.18em] uppercase flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={13} />
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Member Directory Modal */}
      {showNewMessage && (
        <NewMessageModal
          onClose={() => setShowNewMessage(false)}
          onSelectMember={handleStartConversationWithMember}
          existingMembers={conversations.map(c => c.with)}
        />
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [tab, setTab]                     = useState<'forum' | 'messages'>('forum')
  const [userId, setUserId]               = useState<string | null>(null)
  const [userName, setUserName]           = useState<string>('Reality Architect')
  const [conversations, setConversations] = useState<DirectMessageConversation[]>(SAMPLE_DM_CONVERSATIONS)

  useEffect(() => {
    // Load persisted DM conversations
    try {
      const savedDms = localStorage.getItem(DM_STORAGE_KEY)
      if (savedDms) {
        const parsed = JSON.parse(savedDms)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed)
        }
      }
    } catch {
      // ignore storage errors
    }

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name)
      } else if (user?.email) {
        setUserName(user.email.split('@')[0])
      }
    })
  }, [])

  const unreadCount = useMemo(
    () => conversations.filter(c => c.unread).length,
    [conversations]
  )

  return (
    <>
      <Navbar />
      <main className="pt-[68px] min-h-screen">

        {/* Header */}
        <section className="py-16 px-6 md:px-14 border-b-2 border-[#E8621A]/20 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E8621A]" />
          <div className="max-w-7xl mx-auto">
            <div className="label mb-3">Community · Personal · Business · Educators · Leadership</div>
            <h1 className="font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-[0.02em]">
              THE REALITY<br />
              <span className="text-[#E8621A]">ARCHITECTS</span>
            </h1>
            <p className="font-body italic text-grey-DEFAULT mt-4 max-w-2xl text-lg leading-relaxed">
              A live forum and direct messaging hub for practitioners across all four verticals. Share your Assumption Lab breakthroughs, SATS wins, classroom co-regulation shifts, and executive leadership protocols.
            </p>

            {/* Forum / Messages Toggle Buttons — explicit contrast styles so both active & inactive tabs are always crystal-clear */}
            <div
              role="tablist"
              aria-label="Community Views"
              className="inline-flex mt-8 border-2 border-[#E8621A] bg-[#111111] overflow-hidden"
            >
              {(['forum', 'messages'] as const).map(t => {
                const isActive = tab === t
                return (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => setTab(t)}
                    style={{
                      backgroundColor: isActive ? '#E8621A' : '#111111',
                      color: isActive ? '#000000' : '#F0EAE0',
                    }}
                    className={cn(
                      'px-8 py-3 font-mono text-[0.62rem] tracking-[0.22em] uppercase transition-all flex items-center gap-2.5',
                      isActive
                        ? 'font-bold shadow-[inset_0_0_0_1px_#E8621A]'
                        : 'font-medium hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <span>{t === 'forum' ? 'Forum' : 'Messages'}</span>
                    {t === 'messages' && unreadCount > 0 && (
                      <span
                        style={{
                          backgroundColor: isActive ? '#000000' : '#E8621A',
                          color: isActive ? '#E8621A' : '#000000',
                        }}
                        className="px-1.5 py-0.5 text-[0.5rem] font-bold rounded-full leading-none"
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <div className="py-12 px-6 md:px-14">
          <div className="max-w-7xl mx-auto">
            {tab === 'forum' ? (
              <ForumTab userId={userId} userName={userName} />
            ) : (
              <MessagesTab
                userId={userId}
                userName={userName}
                conversations={conversations}
                setConversations={setConversations}
              />
            )}
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
