'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ArrowUp, MessageCircle, ArrowLeft, Send, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getThread, type CommunityReply, type CommunityAuthor } from '@/lib/data/community'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const CATEGORY_LABELS: Record<string, string> = {
  general:             'General',
  sats_wins:           'SATS Win',
  questions:           'Question',
  bridge_of_incidents: 'Bridge of Incidents',
  accountability:      'Accountability',
}
const CATEGORY_COLORS: Record<string, string> = {
  general:             'border-grey-DEFAULT text-grey-DEFAULT',
  sats_wins:           'border-orange-DEFAULT text-orange-DEFAULT',
  questions:           'border-blue-400 text-blue-400',
  bridge_of_incidents: 'border-green-400 text-green-400',
  accountability:      'border-purple-400 text-purple-400',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
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
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <div key={i} className="flex items-start gap-2 mb-1">
          <span className="text-orange-DEFAULT mt-1 flex-shrink-0 text-xs">✦</span>
          <span className="font-body text-grey-DEFAULT text-sm leading-relaxed">{line.slice(2)}</span>
        </div>
      )
    }
    if (line === '') return <div key={i} className="h-3" />
    // Handle **bold** inline
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    return (
      <p key={i} className="font-body text-grey-DEFAULT text-sm leading-relaxed mb-1">
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
            : part
        )}
      </p>
    )
  })
}

function ReplyCard({ reply }: { reply: CommunityReply }) {
  const [upvoted, setUpvoted] = useState(false)
  const [count, setCount]     = useState(reply.upvotes)

  return (
    <div className="flex gap-4 py-6 border-b border-white/8 last:border-0">
      <Avatar author={reply.author} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-body text-sm text-white">{reply.author.full_name}</span>
          {reply.author.role === 'admin' && (
            <span className="font-mono text-[0.45rem] tracking-[0.2em] uppercase px-2 py-0.5 bg-orange-DEFAULT/10 border border-orange-DEFAULT/40 text-orange-DEFAULT">
              Admin
            </span>
          )}
          <span className="font-mono text-[0.5rem] tracking-widest text-grey-dark">{timeAgo(reply.created_at)}</span>
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
  const thread                          = getThread(postId)
  const [isLoggedIn, setIsLoggedIn]     = useState(false)
  const [reply, setReply]               = useState('')
  const [upvoted, setUpvoted]           = useState(false)
  const [upvoteCount, setUpvoteCount]   = useState(thread?.upvotes ?? 0)
  const [submitting, setSubmitting]     = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user))
  }, [])

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

  const handleReply = async () => {
    if (!reply.trim()) return
    if (!isLoggedIn) { toast.error('Sign in to reply'); return }
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('community_posts').insert({
        parent_id: postId,
        user_id: user.id,
        content: reply.trim(),
        category: thread.category,
        title: `Re: ${thread.title}`,
        upvotes: 0,
        comment_count: 0,
        is_pinned: false,
      })
      if (error) throw error
      toast.success('Reply posted')
      setReply('')
    } catch {
      toast.success('Reply noted — full community DB launching soon!')
      setReply('')
    } finally {
      setSubmitting(false)
    }
  }

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

            {/* Category badge */}
            <span className={cn('font-mono text-[0.5rem] tracking-[0.2em] uppercase px-2.5 py-1 border mb-4 inline-block', CATEGORY_COLORS[thread.category])}>
              {CATEGORY_LABELS[thread.category]}
            </span>

            <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] tracking-[0.02em] text-white mb-6">
              {thread.title}
            </h1>

            {/* Author + meta */}
            <div className="flex items-center gap-4 flex-wrap">
              <Avatar author={thread.author} size="sm" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm text-white">{thread.author.full_name}</span>
                  {thread.author.role === 'admin' && (
                    <span className="font-mono text-[0.45rem] tracking-[0.2em] uppercase px-2 py-0.5 bg-orange-DEFAULT/10 border border-orange-DEFAULT/40 text-orange-DEFAULT">
                      Admin
                    </span>
                  )}
                </div>
                <span className="font-mono text-[0.5rem] tracking-widest text-grey-dark">{timeAgo(thread.created_at)}</span>
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
                  <span className="font-mono text-[0.55rem]">{thread.reply_count}</span>
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
                REPLIES <span className="text-grey-dark">({thread.replies?.length ?? 0})</span>
              </h2>
              <div className="orange-rule mb-0 mt-1">✦</div>

              {thread.replies && thread.replies.length > 0 ? (
                <div>
                  {thread.replies.map(r => <ReplyCard key={r.id} reply={r} />)}
                </div>
              ) : (
                <p className="font-body italic text-grey-dark text-sm py-6">No replies yet — be the first.</p>
              )}
            </div>

            {/* Reply form */}
            <div className="bg-black-2 border border-orange-DEFAULT/20 p-6">
              <h3 className="font-display text-lg tracking-widest text-white mb-4">LEAVE A REPLY</h3>

              {!isLoggedIn ? (
                <div className="flex items-center gap-3 py-4">
                  <Lock size={16} className="text-orange-DEFAULT flex-shrink-0" />
                  <p className="font-body text-sm text-grey-DEFAULT">
                    <Link href="/auth/login" className="text-orange-DEFAULT hover:underline">Sign in</Link>{' '}
                    or{' '}
                    <Link href="/auth/signup" className="text-orange-DEFAULT hover:underline">create a free account</Link>{' '}
                    to join the conversation.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Share your experience, question, or insight..."
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
              )}
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
