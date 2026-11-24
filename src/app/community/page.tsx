'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  MessageCircle, Pin, ArrowUp, ChevronRight, Users, Send,
  Loader2, RefreshCw, Plus, X, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  COMMUNITY_THREADS,
  COMMUNITY_CATEGORIES,
  COMMUNITY_VERTICALS,
  type CommunityThread,
  type CommunityAuthor,
  type CommunityVertical,
} from '@/lib/data/community'
import type { PostCategory } from '@/types'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// ── Types & Constants ────────────────────────────────────────────────────────

const CUSTOM_POSTS_STORAGE_KEY = 'vibehyr_community_custom_posts'

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

// ── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ author, size = 'sm' }: { author: CommunityAuthor; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-10 h-10 text-base'
  const initial = author.full_name?.[0]?.toUpperCase() ?? '?'
  return (
    <div className={cn('rounded-full bg-orange-DEFAULT/10 border border-orange-DEFAULT/40 flex items-center justify-center flex-shrink-0 font-display text-orange-DEFAULT', sz)}>
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

    // Save locally so it works immediately and persists across page loads
    try {
      const existingRaw = localStorage.getItem(CUSTOM_POSTS_STORAGE_KEY)
      const existing: CommunityThread[] = existingRaw ? JSON.parse(existingRaw) : []
      localStorage.setItem(CUSTOM_POSTS_STORAGE_KEY, JSON.stringify([newThread, ...existing]))
    } catch {
      // ignore storage errors
    }

    // Also persist to Supabase bridge_forum_posts if authenticated
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

        {/* Category selector */}
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
                  ? 'border-orange-DEFAULT bg-orange-DEFAULT/10 text-orange-DEFAULT'
                  : 'border-white/15 text-grey-dark hover:border-orange-DEFAULT/50'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Track / Vertical selector */}
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
                  ? 'border-orange-DEFAULT bg-orange-DEFAULT/10 text-orange-DEFAULT'
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
  isLoggedIn,
  userId,
  userName,
}: {
  isLoggedIn: boolean
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

  // Load locally created threads & reply count overrides
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

  // Combine live, custom local, and static seeded threads without duplicates
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
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-DEFAULT text-black hover:bg-orange-DEFAULT/90 transition-colors font-mono text-[0.52rem] font-semibold tracking-[0.18em] uppercase"
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
              ? 'border-orange-DEFAULT text-orange-DEFAULT'
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
                ? 'border-orange-DEFAULT text-orange-DEFAULT'
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

// ── Messages Tab — Coming Soon ────────────────────────────────────────────────

function MessagesTab() {
  return (
    <div
      className="relative overflow-hidden border border-[#E8621A]/20"
      style={{ background: '#0a0a0a', minHeight: '480px' }}
    >
      {/* Subtle grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(232,98,26,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,98,26,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Accent glow — top-left corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(232,98,26,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
        {/* Icon ring */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-2"
          style={{ border: '1px solid rgba(232,98,26,0.35)', background: 'rgba(232,98,26,0.06)' }}
        >
          <MessageCircle size={32} style={{ color: '#E8621A' }} strokeWidth={1.5} />
        </div>

        {/* Eyebrow */}
        <p
          className="font-mono tracking-[0.3em] uppercase text-[0.5rem]"
          style={{ color: '#E8621A' }}
        >
          Coming Soon
        </p>

        {/* Heading — Bebas Neue via font-display */}
        <h2
          className="font-display leading-none tracking-[0.05em] text-white"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
        >
          DIRECT MESSAGING
        </h2>

        {/* Body — DM Sans via font-body */}
        <p
          className="font-body leading-relaxed max-w-md"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9375rem' }}
        >
          Private conversations between members are on the roadmap.
          When it launches, you&apos;ll be able to connect directly with
          accountability partners and fellow practitioners across all four verticals.
        </p>

        {/* Divider line */}
        <div
          className="w-16 mt-2"
          style={{ height: '1px', background: 'rgba(232,98,26,0.4)' }}
        />

        {/* Footnote */}
        <p
          className="font-mono tracking-[0.2em] uppercase text-[0.45rem]"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          Architect &amp; Elite members get early access
        </p>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [tab, setTab]               = useState<'forum' | 'messages'>('forum')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId]         = useState<string | null>(null)
  const [userName, setUserName]     = useState<string>('Reality Architect')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
      setUserId(user?.id ?? null)
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name)
      } else if (user?.email) {
        setUserName(user.email.split('@')[0])
      }
    })
  }, [])

  return (
    <>
      <Navbar />
      <main className="pt-[68px] min-h-screen">

        {/* Header */}
        <section className="py-16 px-6 md:px-14 border-b-2 border-orange-DEFAULT/20 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          <div className="max-w-7xl mx-auto">
            <div className="label mb-3">Community · Personal · Business · Educators · Leadership</div>
            <h1 className="font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-[0.02em]">
              THE REALITY<br />
              <span className="text-orange-DEFAULT">ARCHITECTS</span>
            </h1>
            <p className="font-body italic text-grey-DEFAULT mt-4 max-w-2xl text-lg leading-relaxed">
              A live forum for practitioners across all four verticals. Share your Assumption Lab breakthroughs, SATS wins, classroom co-regulation shifts, and executive leadership protocols.
            </p>

            {/* Tabs */}
            <div className="flex gap-0 mt-8 border border-orange-DEFAULT/30 w-fit">
              {(['forum', 'messages'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'px-8 py-3 font-mono text-[0.58rem] tracking-[0.2em] uppercase transition-colors',
                    tab === t ? 'bg-orange-DEFAULT text-black' : 'text-grey-DEFAULT hover:text-white'
                  )}
                >
                  {t === 'forum' ? 'Forum' : 'Messages'}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="py-12 px-6 md:px-14">
          <div className="max-w-7xl mx-auto">
            {tab === 'forum' ? (
              <ForumTab isLoggedIn={isLoggedIn} userId={userId} userName={userName} />
            ) : (
              <MessagesTab />
            )}
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
