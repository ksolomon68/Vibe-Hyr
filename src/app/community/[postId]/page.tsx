'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ArrowUp, MessageCircle, ArrowLeft, Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getThread,
  type CommunityThread,
  type CommunityReply,
  type CommunityAuthor,
  type CommunityVertical,
} from '@/lib/data/community'
import type { PostCategory } from '@/types'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const CUSTOM_POSTS_STORAGE_KEY = 'vibehyr_community_custom_posts'

const CATEGORY_LABELS: Record<string, string> = {
  general:             'General',
  sats_wins:           'Win & Breakthrough',
  questions:           'Question',
  bridge_of_incidents: 'Bridge of Incidents',
  accountability:      'Accountability',
}
const CATEGORY_COLORS: Record<string, string> = {
  general:             'border-grey-DEFAULT text-grey-DEFAULT',
  sats_wins:           'border-orange-DEFAULT text-orange-DEFAULT',
  questions:           'border-blue-400 text-blue-400',
  bridge_of_incidents: 'border-green-400 text-green-400',
  accountability:      'border-[#dfbd8b] text-[#dfbd8b]',
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

const POST_TYPE_TO_CATEGORY: Record<string, PostCategory> = {
  bridge_win:            'bridge_of_incidents',
  question:              'questions',
  insight:               'general',
  accountability_update: 'accountability',
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
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Avatar({ author, size = 'md' }: { author: CommunityAuthor; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-12 h-12 text-xl' : 'w-10 h-10 text-base'
  return (
    <div className={cn('rounded-full bg-orange-DEFAULT/10 border border-orange-DEFAULT/40 flex items-center justify-center flex-shrink-0 font-display text-orange-DEFAULT', sz)}>
      {author.full_name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

function formatContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-body font-bold text-white mb-2">{line.slice(2, -2)}</p>
    }
    if (line.startsWith('> ')) {
      return (
        <blockquote key={i} className="border-l-2 border-orange-DEFAULT pl-4 py-1 my-2 italic text-white/90 font-body text-sm">
          {line.slice(2)}
        </blockquote>
      )
    }
    if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('☑ ')) {
      const bullet = line.startsWith('☑ ') ? '☑' : '✦'
      return (
        <div key={i} className="flex items-start gap-2 mb-1">
          <span className="text-orange-DEFAULT mt-1 flex-shrink-0 text-xs">{bullet}</span>
          <span className="font-body text-grey-DEFAULT text-sm leading-relaxed">
            {renderInlineBold(line.slice(2))}
          </span>
        </div>
      )
    }
    if (line === '') return <div key={i} className="h-3" />
    return (
      <p key={i} className="font-body text-grey-DEFAULT text-sm leading-relaxed mb-1">
        {renderInlineBold(line)}
      </p>
    )
  })
}

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, j) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
      : part
  )
}

function ReplyCard({ reply }: { reply: CommunityReply }) {
  const [upvoted, setUpvoted] = useState(false)
  const [count, setCount]     = useState(reply.upvotes)

  return (
    <div className="flex gap-4 py-6 border-b border-white/8 last:border-0">
      <Avatar author={reply.author} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
          <span className="font-body text-sm font-medium text-white">{reply.author.full_name}</span>
          {reply.author.role === 'admin' && (
            <span className="font-mono text-[0.45rem] tracking-[0.2em] uppercase px-2 py-0.5 bg-orange-DEFAULT/10 border border-orange-DEFAULT/40 text-orange-DEFAULT">
              Admin
            </span>
          )}
          {reply.author.title && (
            <span className="font-mono text-[0.48rem] tracking-wider text-grey-DEFAULT">
              · {reply.author.title}
            </span>
          )}
          <span className="font-mono text-[0.5rem] tracking-widest text-grey-dark">
            · {timeAgo(reply.created_at)}
          </span>
        </div>
        <div className="space-y-1 mb-4">{formatContent(reply.content)}</div>
        <button
          onClick={() => { setUpvoted(!upvoted); setCount(c => upvoted ? c - 1 : c + 1) }}
          className={cn('flex items-center gap-1.5 transition-colors', upvoted ? 'text-orange-DEFAULT' : 'text-grey-dark hover:text-grey-DEFAULT')}
        >
          <ArrowUp size={13} />
          <span className="font-mono text-[0.52rem]">{count}</span>
        </button>
      </div>
    </div>
  )
}

export default function ThreadPage() {
  const params                          = useParams()
  const postId                          = params.postId as string
  const staticThread                    = getThread(postId)

  const [thread, setThread]             = useState<CommunityThread | undefined>(staticThread)
  const [localReplies, setLocalReplies] = useState<CommunityReply[]>([])
  const [userName, setUserName]         = useState<string>('Reality Architect')
  const [reply, setReply]               = useState('')
  const [upvoted, setUpvoted]           = useState(false)
  const [upvoteCount, setUpvoteCount]   = useState(staticThread?.upvotes ?? 0)
  const [submitting, setSubmitting]     = useState(false)

  // Load user info, custom local posts, local replies, or live Supabase post if needed
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name)
      } else if (user?.email) {
        setUserName(user.email.split('@')[0])
      }
    })

    // Load saved local replies for this postId
    try {
      const savedRepliesRaw = localStorage.getItem(`vibehyr_community_replies_${postId}`)
      if (savedRepliesRaw) {
        const parsed = JSON.parse(savedRepliesRaw)
        if (Array.isArray(parsed)) setLocalReplies(parsed)
      }
    } catch {
      // ignore storage errors
    }

    // If not in static COMMUNITY_THREADS, check custom posts in localStorage or Supabase bridge_forum_posts
    if (!staticThread) {
      try {
        const savedPostsRaw = localStorage.getItem(CUSTOM_POSTS_STORAGE_KEY)
        if (savedPostsRaw) {
          const customPosts: CommunityThread[] = JSON.parse(savedPostsRaw)
          const found = customPosts.find(p => p.id === postId)
          if (found) {
            setThread(found)
            setUpvoteCount(found.upvotes)
            return
          }
        }
      } catch {
        // ignore
      }

      // Check Supabase bridge_forum_posts
      supabase
        .from('bridge_forum_posts')
        .select(`
          id, title, body, post_type, upvotes, reply_count,
          is_pinned, created_at, vertical_cohort, user_id,
          profiles:user_id ( full_name, membership_tier )
        `)
        .eq('id', postId)
        .single()
        .then(({ data }) => {
          if (data) {
            const row: any = data
            const mapped: CommunityThread = {
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
            }
            setThread(mapped)
            setUpvoteCount(mapped.upvotes)
          }
        })
    }
  }, [postId, staticThread])

  if (!thread) {
    return (
      <>
        <Navbar />
        <main className="pt-[68px] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="font-display text-4xl text-white mb-4">Thread not found</p>
            <Link href="/community" className="btn-outline-orange">← Back to Community</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const allReplies: CommunityReply[] = [...(thread.replies ?? []), ...localReplies]

  const handleReply = async () => {
    if (!reply.trim()) return
    setSubmitting(true)

    const newReply: CommunityReply = {
      id: `reply-${Date.now()}`,
      author: {
        id: 'current-user',
        full_name: userName || 'Reality Architect',
        avatar_url: null,
        membership_tier: 'architect',
        title: 'Community Practitioner',
      },
      content: reply.trim(),
      upvotes: 1,
      created_at: new Date().toISOString(),
    }

    // Save immediately to state and localStorage so it renders and persists
    const updatedLocal = [...localReplies, newReply]
    setLocalReplies(updatedLocal)
    try {
      localStorage.setItem(`vibehyr_community_replies_${postId}`, JSON.stringify(updatedLocal))
    } catch {
      // ignore storage errors
    }

    // Attempt Supabase sync if signed in
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('community_posts').insert({
          parent_id: postId,
          user_id: user.id,
          content: reply.trim(),
          category: thread.category,
          title: `Re: ${thread.title}`,
          upvotes: 0,
          comment_count: 0,
          is_pinned: false,
        })
      }
    } catch {
      // already persisted locally
    }

    setReply('')
    setSubmitting(false)
    toast.success('Reply added to the discussion!')
  }

  const verticalKey = thread.vertical ?? 'personal'

  return (
    <>
      <Navbar />
      <main className="pt-[68px] min-h-screen">

        {/* Breadcrumb + header */}
        <section className="py-10 px-6 md:px-14 border-b border-orange-DEFAULT/20 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          <div className="max-w-4xl mx-auto">
            <Link
              href="/community"
              className="flex items-center gap-2 font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors mb-6"
            >
              <ArrowLeft size={11} /> Back to Community
            </Link>

            {/* Category + Vertical + Course badges */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className={cn('font-mono text-[0.5rem] tracking-[0.2em] uppercase px-2.5 py-1 border', CATEGORY_COLORS[thread.category])}>
                {CATEGORY_LABELS[thread.category]}
              </span>
              {verticalKey !== 'all' && (
                <span className={cn('font-mono text-[0.48rem] tracking-[0.18em] uppercase px-2.5 py-1 border', VERTICAL_BADGE_STYLES[verticalKey] ?? VERTICAL_BADGE_STYLES.personal)}>
                  {VERTICAL_LABELS[verticalKey] ?? verticalKey}
                </span>
              )}
              {thread.course_tag && (
                <span className="font-mono text-[0.48rem] tracking-[0.15em] uppercase px-2.5 py-1 bg-white/[0.03] border border-white/10 text-grey-DEFAULT">
                  {thread.course_tag}
                </span>
              )}
              {thread.updated_at && thread.updated_at !== thread.created_at && (
                <span className="inline-flex items-center gap-1 font-mono text-[0.48rem] tracking-[0.15em] uppercase text-[#dfbd8b] ml-1">
                  <Sparkles size={11} />
                  Updated {timeAgo(thread.updated_at)}
                </span>
              )}
            </div>

            <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] tracking-[0.02em] text-white mb-6">
              {thread.title}
            </h1>

            {/* Author + meta */}
            <div className="flex items-center gap-4 flex-wrap">
              <Avatar author={thread.author} size="sm" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-body text-sm text-white">{thread.author.full_name}</span>
                  {thread.author.role === 'admin' && (
                    <span className="font-mono text-[0.45rem] tracking-[0.2em] uppercase px-2 py-0.5 bg-orange-DEFAULT/10 border border-orange-DEFAULT/40 text-orange-DEFAULT">
                      Admin
                    </span>
                  )}
                  {thread.author.title && (
                    <span className="font-mono text-[0.48rem] tracking-wider text-grey-DEFAULT">
                      · {thread.author.title}
                    </span>
                  )}
                </div>
                <span className="font-mono text-[0.5rem] tracking-widest text-grey-dark">
                  Posted {timeAgo(thread.created_at)}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-5">
                <button
                  onClick={() => { setUpvoted(!upvoted); setUpvoteCount(c => upvoted ? c - 1 : c + 1) }}
                  className={cn('flex items-center gap-1.5 transition-colors', upvoted ? 'text-orange-DEFAULT' : 'text-grey-dark hover:text-grey-DEFAULT')}
                >
                  <ArrowUp size={14} />
                  <span className="font-mono text-[0.55rem]">{upvoteCount}</span>
                </button>
                <div className="flex items-center gap-1.5 text-grey-dark">
                  <MessageCircle size={14} />
                  <span className="font-mono text-[0.55rem]">{Math.max(thread.reply_count + localReplies.length, allReplies.length)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="py-10 px-6 md:px-14">
          <div className="max-w-4xl mx-auto">

            {/* Original post body */}
            <div className="mb-10 pb-8 border-b border-white/8">
              <div className="space-y-2">{formatContent(thread.content)}</div>
            </div>

            {/* Replies */}
            <div className="mb-10">
              <h2 className="font-display text-xl tracking-widest text-white mb-1">
                REPLIES <span className="text-grey-dark">({allReplies.length})</span>
              </h2>
              <div className="orange-rule mb-0 mt-1">✦</div>

              {allReplies.length > 0 ? (
                <div>
                  {allReplies.map(r => <ReplyCard key={r.id} reply={r} />)}
                </div>
              ) : (
                <p className="font-body italic text-grey-dark text-sm py-6">No replies yet — be the first.</p>
              )}
            </div>

            {/* Reply form */}
            <div className="bg-black-2 border border-orange-DEFAULT/20 p-6">
              <h3 className="font-display text-lg tracking-widest text-white mb-4">LEAVE A REPLY</h3>

              <div className="flex flex-col gap-3">
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Share your experience, Assumption Lab breakthrough, question, or insight..."
                  rows={4}
                  className="w-full bg-black-3 border border-white/15 px-4 py-3 font-body text-sm text-white placeholder:text-grey-dark focus:outline-none focus:border-orange-DEFAULT/50 transition-colors resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleReply}
                    disabled={submitting || !reply.trim()}
                    className="btn-orange flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={13} />
                    {submitting ? 'Posting...' : 'Post Reply'}
                  </button>
                </div>
              </div>
            </div>

            {/* Back link */}
            <div className="mt-8">
              <Link
                href="/community"
                className="flex items-center gap-2 font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors"
              >
                <ArrowLeft size={11} /> Back to All Threads
              </Link>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
