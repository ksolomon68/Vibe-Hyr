'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  MessageCircle, Pin, ArrowUp, ChevronRight, Users, Send,
  Loader2, RefreshCw, Plus, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  COMMUNITY_THREADS,
  COMMUNITY_CATEGORIES,
  type CommunityThread,
  type CommunityAuthor,
} from '@/lib/data/community'
import type { PostCategory } from '@/types'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// ── Types ────────────────────────────────────────────────────────────────────

type LivePost = {
  id: string
  title: string
  body: string
  post_type: 'bridge_win' | 'question' | 'insight' | 'accountability_update'
  upvotes: number
  reply_count: number
  is_pinned: boolean
  created_at: string
  vertical_cohort: string
  user_id: string
  author_name: string | null
  author_tier: string | null
}

// Map bridge_forum_posts.post_type → PostCategory for display
const POST_TYPE_TO_CATEGORY: Record<string, PostCategory> = {
  bridge_win:          'bridge_of_incidents',
  question:            'questions',
  insight:             'general',
  accountability_update: 'accountability',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
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
  sats_wins:           'SATS Win',
  questions:           'Question',
  bridge_of_incidents: 'Bridge',
  accountability:      'Accountability',
}
const POST_TYPE_LABELS: Record<string, string> = {
  bridge_win:            'Bridge',
  question:              'Question',
  insight:               'Insight',
  accountability_update: 'Accountability',
}
const POST_TYPE_COLORS: Record<string, string> = {
  bridge_win:            'border-green-400 text-green-400',
  question:              'border-blue-400 text-blue-400',
  insight:               'border-grey-DEFAULT text-grey-DEFAULT',
  accountability_update: 'border-[#dfbd8b] text-[#dfbd8b]',
}

// ── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ author, size = 'sm' }: { author: CommunityAuthor; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'
  const initial = author.full_name?.[0]?.toUpperCase() ?? '?'
  return (
    <div className={cn('rounded-full bg-orange-DEFAULT/10 border border-orange-DEFAULT/40 flex items-center justify-center flex-shrink-0 font-display text-orange-DEFAULT', sz)}>
      {initial}
    </div>
  )
}

function AvatarInitial({ name, size = 'sm' }: { name: string | null; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'
  const initial = name?.[0]?.toUpperCase() ?? '?'
  return (
    <div className={cn('rounded-full bg-orange-DEFAULT/10 border border-orange-DEFAULT/40 flex items-center justify-center flex-shrink-0 font-display text-orange-DEFAULT', sz)}>
      {initial}
    </div>
  )
}

// ── Static thread row (used for fallback mock data) ───────────────────────────

function ThreadRow({ thread }: { thread: CommunityThread }) {
  return (
    <Link
      href={`/community/${thread.id}`}
      className="flex items-start gap-4 px-6 py-5 bg-black-2 hover:bg-black-3 transition-colors group border-b border-white/5 last:border-0"
    >
      <Avatar author={thread.author} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {thread.is_pinned && (
            <Pin size={11} className="text-orange-DEFAULT flex-shrink-0" />
          )}
          <span className={cn('font-mono text-[0.48rem] tracking-[0.18em] uppercase px-2 py-0.5 border', CATEGORY_COLORS[thread.category])}>
            {CATEGORY_LABELS[thread.category]}
          </span>
        </div>
        <p className="font-body text-white text-sm leading-snug group-hover:text-orange-DEFAULT transition-colors mb-1 line-clamp-2">
          {thread.title}
        </p>
        <p className="font-mono text-[0.52rem] tracking-widest text-grey-dark">
          {thread.author.full_name} · {timeAgo(thread.created_at)}
        </p>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0 text-grey-dark">
        <div className="flex items-center gap-1">
          <ArrowUp size={11} />
          <span className="font-mono text-[0.52rem]">{thread.upvotes}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle size={11} />
          <span className="font-mono text-[0.52rem]">{thread.reply_count}</span>
        </div>
        <ChevronRight size={13} className="group-hover:text-orange-DEFAULT transition-colors" />
      </div>
    </Link>
  )
}

// ── Live post row (bridge_forum_posts) ────────────────────────────────────────

function LivePostRow({ post }: { post: LivePost }) {
  const category = POST_TYPE_TO_CATEGORY[post.post_type] ?? 'general'
  const colorClass = POST_TYPE_COLORS[post.post_type] ?? CATEGORY_COLORS.general

  return (
    <div className="flex items-start gap-4 px-6 py-5 bg-black-2 hover:bg-black-3 transition-colors group border-b border-white/5 last:border-0">
      <AvatarInitial name={post.author_name} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {post.is_pinned && (
            <Pin size={11} className="text-orange-DEFAULT flex-shrink-0" />
          )}
          <span className={cn('font-mono text-[0.48rem] tracking-[0.18em] uppercase px-2 py-0.5 border', colorClass)}>
            {POST_TYPE_LABELS[post.post_type] ?? 'Post'}
          </span>
        </div>
        <p className="font-body text-white text-sm leading-snug group-hover:text-orange-DEFAULT transition-colors mb-1 line-clamp-2">
          {post.title}
        </p>
        <p className="font-mono text-[0.52rem] tracking-widest text-grey-dark">
          {post.author_name ?? 'Community Member'} · {timeAgo(post.created_at)}
        </p>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0 text-grey-dark">
        <div className="flex items-center gap-1">
          <ArrowUp size={11} />
          <span className="font-mono text-[0.52rem]">{post.upvotes}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle size={11} />
          <span className="font-mono text-[0.52rem]">{post.reply_count}</span>
        </div>
        <ChevronRight size={13} className="group-hover:text-orange-DEFAULT transition-colors" />
      </div>
    </div>
  )
}

// ── New Post Modal ────────────────────────────────────────────────────────────

function NewPostModal({
  onClose,
  onCreated,
  userId,
  vertical,
}: {
  onClose: () => void
  onCreated: () => void
  userId: string
  vertical: string
}) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [postType, setPostType] = useState<'bridge_win' | 'question' | 'insight' | 'accountability_update'>('insight')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required')
      return
    }
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('bridge_forum_posts').insert({
      user_id:        userId,
      title:          title.trim(),
      body:           body.trim(),
      post_type:      postType,
      vertical_cohort: vertical,
    })
    setSubmitting(false)
    if (error) {
      toast.error('Could not post — ' + error.message)
    } else {
      toast.success('Post submitted!')
      onCreated()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-black-2 border border-orange-DEFAULT/30 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-grey-dark hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <p className="font-mono text-[0.52rem] tracking-[0.2em] uppercase text-orange-DEFAULT mb-4">New Post</p>

        {/* Post type */}
        <div className="flex gap-2 flex-wrap mb-4">
          {(['bridge_win', 'question', 'insight', 'accountability_update'] as const).map(t => (
            <button
              key={t}
              onClick={() => setPostType(t)}
              className={cn(
                'font-mono text-[0.45rem] tracking-[0.15em] uppercase px-2.5 py-1 border transition-colors',
                postType === t
                  ? 'border-orange-DEFAULT text-orange-DEFAULT'
                  : 'border-white/20 text-grey-dark hover:border-orange-DEFAULT/50'
              )}
            >
              {POST_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Post title..."
          className="w-full bg-black-3 border border-white/15 px-4 py-2.5 font-body text-sm text-white placeholder:text-grey-dark focus:outline-none focus:border-orange-DEFAULT/50 transition-colors mb-3"
        />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Share your experience, question, or insight..."
          rows={6}
          className="w-full bg-black-3 border border-white/15 px-4 py-2.5 font-body text-sm text-white placeholder:text-grey-dark focus:outline-none focus:border-orange-DEFAULT/50 transition-colors resize-none mb-4"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full btn-orange flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {submitting ? 'Posting...' : 'Post to Community'}
        </button>
      </div>
    </div>
  )
}

// ── Forum Tab ─────────────────────────────────────────────────────────────────

function ForumTab({ isLoggedIn, userId }: { isLoggedIn: boolean; userId: string | null }) {
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'all'>('all')
  const [livePosts, setLivePosts] = useState<LivePost[]>([])
  const [loading, setLoading] = useState(false)
  const [useLive, setUseLive] = useState(false)
  const [showNewPost, setShowNewPost] = useState(false)
  const [userVertical, setUserVertical] = useState<string>('personal')

  const fetchLivePosts = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Get the current user's vertical cohort
      let vertical = 'personal'
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_vertical')
          .eq('id', userId)
          .single()
        if (profile?.account_vertical) {
          vertical = profile.account_vertical
          setUserVertical(vertical)
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

      if (error || !data || data.length === 0) {
        setUseLive(false)
      } else {
        const mapped: LivePost[] = data.map((row: any) => ({
          id:             row.id,
          title:          row.title,
          body:           row.body,
          post_type:      row.post_type,
          upvotes:        row.upvotes,
          reply_count:    row.reply_count,
          is_pinned:      row.is_pinned,
          created_at:     row.created_at,
          vertical_cohort: row.vertical_cohort,
          user_id:        row.user_id,
          author_name:    row.profiles?.full_name ?? null,
          author_tier:    row.profiles?.membership_tier ?? null,
        }))
        setLivePosts(mapped)
        setUseLive(true)
      }
    } catch {
      setUseLive(false)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchLivePosts()
  }, [fetchLivePosts])

  // ── Render live data path ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3">
        <Loader2 size={20} className="animate-spin text-orange-DEFAULT" />
        <span className="font-mono text-[0.52rem] tracking-widest text-grey-dark uppercase">
          Loading community...
        </span>
      </div>
    )
  }

  if (useLive) {
    const pinned  = livePosts.filter(p => p.is_pinned)
    const regular = livePosts.filter(p => !p.is_pinned)

    return (
      <div>
        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn('font-mono text-[0.52rem] tracking-[0.18em] uppercase px-3 py-1.5 border transition-colors',
              activeCategory === 'all' ? 'border-orange-DEFAULT text-orange-DEFAULT' : 'border-white/20 text-grey-dark hover:border-orange-DEFAULT/50'
            )}
          >
            All
          </button>
          {(['bridge_win', 'question', 'insight', 'accountability_update'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveCategory(POST_TYPE_TO_CATEGORY[t] ?? 'general')}
              className={cn('font-mono text-[0.52rem] tracking-[0.18em] uppercase px-3 py-1.5 border transition-colors',
                activeCategory === (POST_TYPE_TO_CATEGORY[t] ?? 'general')
                  ? 'border-orange-DEFAULT text-orange-DEFAULT'
                  : 'border-white/20 text-grey-dark hover:border-orange-DEFAULT/50'
              )}
            >
              {POST_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Stats + actions bar */}
        <div className="flex items-center justify-between gap-6 mb-4 px-1">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users size={12} className="text-orange-DEFAULT" />
              <span className="font-mono text-[0.52rem] tracking-widest text-grey-dark">
                {livePosts.length} posts · live
              </span>
            </div>
            <button
              onClick={fetchLivePosts}
              className="flex items-center gap-1.5 text-grey-dark hover:text-orange-DEFAULT transition-colors"
              title="Refresh"
            >
              <RefreshCw size={11} />
              <span className="font-mono text-[0.48rem] tracking-widest uppercase">Refresh</span>
            </button>
          </div>
          {isLoggedIn && (
            <button
              onClick={() => setShowNewPost(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-orange-DEFAULT/40 text-orange-DEFAULT hover:bg-orange-DEFAULT/10 transition-colors font-mono text-[0.48rem] tracking-widest uppercase"
            >
              <Plus size={11} />
              New Post
            </button>
          )}
        </div>

        {/* Thread list */}
        <div className="border border-orange-DEFAULT/20 overflow-hidden">
          {pinned.length > 0 && (
            <div className="bg-orange-DEFAULT/5 border-b border-orange-DEFAULT/20">
              {pinned.map(p => <LivePostRow key={p.id} post={p} />)}
            </div>
          )}
          {regular.length === 0 && pinned.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-body italic text-grey-dark text-sm mb-4">
                No posts yet. Be the first to share.
              </p>
              {isLoggedIn && (
                <button
                  onClick={() => setShowNewPost(true)}
                  className="btn-orange inline-flex items-center gap-2"
                >
                  <Plus size={14} />
                  Start a Thread
                </button>
              )}
            </div>
          ) : (
            regular.map(p => <LivePostRow key={p.id} post={p} />)
          )}
        </div>

        {/* New post modal */}
        {showNewPost && userId && (
          <NewPostModal
            userId={userId}
            vertical={userVertical}
            onClose={() => setShowNewPost(false)}
            onCreated={fetchLivePosts}
          />
        )}
      </div>
    )
  }

  // ── Fallback: static mock data ─────────────────────────────────────────────
  const pinned  = COMMUNITY_THREADS.filter(t => t.is_pinned)
  const regular = COMMUNITY_THREADS.filter(t => !t.is_pinned && (activeCategory === 'all' || t.category === activeCategory))

  return (
    <div>
      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn('font-mono text-[0.52rem] tracking-[0.18em] uppercase px-3 py-1.5 border transition-colors',
            activeCategory === 'all' ? 'border-orange-DEFAULT text-orange-DEFAULT' : 'border-white/20 text-grey-dark hover:border-orange-DEFAULT/50'
          )}
        >
          All
        </button>
        {COMMUNITY_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn('font-mono text-[0.52rem] tracking-[0.18em] uppercase px-3 py-1.5 border transition-colors',
              activeCategory === cat.id ? 'border-orange-DEFAULT text-orange-DEFAULT' : 'border-white/20 text-grey-dark hover:border-orange-DEFAULT/50'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-4 px-1">
        <div className="flex items-center gap-2">
          <Users size={12} className="text-orange-DEFAULT" />
          <span className="font-mono text-[0.52rem] tracking-widest text-grey-dark">
            {COMMUNITY_THREADS.length} threads
          </span>
        </div>
        <div className="font-mono text-[0.52rem] tracking-widest text-grey-dark">
          ✦ New posts every day
        </div>
      </div>

      {/* Thread list */}
      <div className="border border-orange-DEFAULT/20 overflow-hidden">
        {pinned.length > 0 && (activeCategory === 'all') && (
          <div className="bg-orange-DEFAULT/5 border-b border-orange-DEFAULT/20">
            {pinned.map(t => <ThreadRow key={t.id} thread={t} />)}
          </div>
        )}
        {regular.map(t => <ThreadRow key={t.id} thread={t} />)}
        {regular.length === 0 && (
          <div className="py-12 text-center font-body italic text-grey-dark text-sm">
            No threads in this category yet.
          </div>
        )}
      </div>
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
          When it launches, you'll be able to connect directly with
          accountability partners and fellow practitioners.
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

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
      setUserId(user?.id ?? null)
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
            <div className="label mb-3">Community</div>
            <h1 className="font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-[0.02em]">
              THE REALITY<br />
              <span className="text-orange-DEFAULT">ARCHITECTS</span>
            </h1>
            <p className="font-body italic text-grey-DEFAULT mt-4 max-w-xl text-lg leading-relaxed">
              A space for practitioners. Share your wins, ask your questions, and reinforce each other's assumptions.
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
              <ForumTab isLoggedIn={isLoggedIn} userId={userId} />
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
