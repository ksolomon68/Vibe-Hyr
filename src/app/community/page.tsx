'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MessageCircle, Pin, ArrowUp, ChevronRight, Send, Users, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  COMMUNITY_THREADS,
  COMMUNITY_CATEGORIES,
  SAMPLE_DM_CONVERSATIONS,
  type CommunityThread,
  type CommunityAuthor,
} from '@/lib/data/community'
import type { PostCategory } from '@/types'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

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
  accountability:      'border-purple-400 text-purple-400',
}
const CATEGORY_LABELS: Record<PostCategory, string> = {
  general:             'General',
  sats_wins:           'SATS Win',
  questions:           'Question',
  bridge_of_incidents: 'Bridge',
  accountability:      'Accountability',
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ author, size = 'sm' }: { author: CommunityAuthor; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'
  const initial = author.full_name?.[0]?.toUpperCase() ?? '?'
  return (
    <div className={cn('rounded-full bg-orange-DEFAULT/10 border border-orange-DEFAULT/40 flex items-center justify-center flex-shrink-0 font-display text-orange-DEFAULT', sz)}>
      {initial}
    </div>
  )
}

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

// ── Forum Tab ─────────────────────────────────────────────────────────────────

function ForumTab() {
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'all'>('all')

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
        {/* Pinned threads */}
        {pinned.length > 0 && (activeCategory === 'all') && (
          <div className="bg-orange-DEFAULT/5 border-b border-orange-DEFAULT/20">
            {pinned.map(t => <ThreadRow key={t.id} thread={t} />)}
          </div>
        )}
        {/* Regular threads */}
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

// ── Messages Tab ──────────────────────────────────────────────────────────────

function MessagesTab({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [message, setMessage] = useState('')
  const [activeDm, setActiveDm] = useState(SAMPLE_DM_CONVERSATIONS[0])

  if (!isLoggedIn) {
    return (
      <div className="py-16 text-center">
        <Inbox size={32} className="text-orange-DEFAULT mx-auto mb-4" />
        <h3 className="font-display text-2xl tracking-widest text-white mb-3">SIGN IN TO MESSAGE</h3>
        <p className="font-body italic text-grey-DEFAULT mb-6 max-w-sm mx-auto">
          Direct messages are available to all Vibe Hyr members.
        </p>
        <Link href="/auth/login" className="btn-orange">Log In</Link>
      </div>
    )
  }

  const handleSend = () => {
    if (!message.trim()) return
    toast.success('Message sent')
    setMessage('')
  }

  return (
    <div className="grid md:grid-cols-3 gap-[2px] bg-orange-DEFAULT/20 border border-orange-DEFAULT/20 overflow-hidden min-h-[480px]">
      {/* Conversation list */}
      <div className="bg-black-2 md:col-span-1">
        <div className="px-4 py-3 border-b border-white/8">
          <p className="font-mono text-[0.52rem] tracking-[0.2em] uppercase text-grey-dark">Messages</p>
        </div>
        {SAMPLE_DM_CONVERSATIONS.map(conv => (
          <button
            key={conv.id}
            onClick={() => setActiveDm(conv)}
            className={cn(
              'w-full flex items-start gap-3 px-4 py-4 border-b border-white/5 text-left transition-colors',
              activeDm.id === conv.id ? 'bg-black-3' : 'hover:bg-black-3'
            )}
          >
            <Avatar author={conv.with} />
            <div className="flex-1 min-w-0">
              <p className="font-body text-xs text-white mb-0.5">{conv.with.full_name}</p>
              <p className="font-body text-[0.65rem] text-grey-dark line-clamp-2 leading-relaxed">{conv.last_message}</p>
            </div>
          </button>
        ))}
        <div className="p-4">
          <p className="font-mono text-[0.48rem] tracking-widest text-grey-dark/60 uppercase text-center">
            More conversations available for Architect+ members
          </p>
        </div>
      </div>

      {/* Active conversation */}
      <div className="bg-black-2 md:col-span-2 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8">
          <Avatar author={activeDm.with} size="md" />
          <div>
            <p className="font-body text-sm text-white">{activeDm.with.full_name}</p>
            <p className="font-mono text-[0.48rem] tracking-widest text-grey-dark uppercase">
              {activeDm.with.role === 'admin' ? 'Vibe Hyr Admin' : 'Member'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          <div className="flex gap-3">
            <Avatar author={activeDm.with} />
            <div className="bg-black-3 border border-white/8 px-4 py-3 max-w-sm">
              <p className="font-body text-sm text-grey-DEFAULT leading-relaxed">{activeDm.last_message}</p>
              <p className="font-mono text-[0.48rem] tracking-widest text-grey-dark mt-2">{timeAgo(activeDm.last_message_at)}</p>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-white/8 p-4 flex gap-3">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-black-3 border border-white/15 px-4 py-2.5 font-body text-sm text-white placeholder:text-grey-dark focus:outline-none focus:border-orange-DEFAULT/50 transition-colors"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 bg-orange-DEFAULT flex items-center justify-center hover:bg-orange-DEFAULT/80 transition-colors flex-shrink-0"
          >
            <Send size={14} className="text-black" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [tab, setTab]             = useState<'forum' | 'messages'>('forum')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
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
              <ForumTab />
            ) : (
              <MessagesTab isLoggedIn={isLoggedIn} />
            )}
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
