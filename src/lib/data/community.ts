import type { PostCategory } from '@/types'

export interface CommunityAuthor {
  id: string
  full_name: string
  avatar_url: string | null
  membership_tier: 'free' | 'architect' | 'elite'
  role?: 'admin'
}

export interface CommunityThread {
  id: string
  category: PostCategory
  title: string
  content: string
  author: CommunityAuthor
  reply_count: number
  upvotes: number
  is_pinned: boolean
  created_at: string
  replies?: CommunityReply[]
}

export interface CommunityReply {
  id: string
  author: CommunityAuthor
  content: string
  upvotes: number
  created_at: string
}

const ADMIN: CommunityAuthor = {
  id: 'admin-ks',
  full_name: 'Keisha Solomon',
  avatar_url: null,
  membership_tier: 'elite',
  role: 'admin',
}

export const COMMUNITY_THREADS: CommunityThread[] = [
  // ── PINNED ──────────────────────────────────────────────────────────────────
  {
    id: 'welcome-to-vibe-hyr',
    category: 'general',
    title: 'Welcome to the Vibe Hyr Community — Start Here',
    content: `Welcome, Reality Architect. This is your space.\n\nThis community exists for one purpose: to support your practice. Whether you're on Day 1 of Course 1 or you've been working the Law of Assumption for years, you belong here.\n\n**Community Guidelines:**\n\n• Be generous — share your wins and your challenges\n• Stay on topic — we focus on the practice, not debate\n• Lift each other up — comparison has no place in assumption-based reality\n• Protect your assumption — don't seek validation for what you've already decided is true\n\nIntroduce yourself below and let us know where you are on the path. What brought you to Vibe Hyr?`,
    author: ADMIN,
    reply_count: 47,
    upvotes: 112,
    is_pinned: true,
    created_at: '2025-03-01T10:00:00Z',
    replies: [
      {
        id: 'r-welcome-1',
        author: ADMIN,
        content: 'This thread is always open. Check back whenever you need a reminder of why you started. The work is worth it.',
        upvotes: 34,
        created_at: '2025-03-01T11:00:00Z',
      },
    ],
  },

  // ── SATS WINS ───────────────────────────────────────────────────────────────
  {
    id: 'sp-called-after-revision',
    category: 'sats_wins',
    title: 'My SP called after 3 weeks of revision — here\'s exactly what I did',
    content: `Three weeks ago I committed to one thing: I stopped reacting to the 3D and started living in the end.\n\nEvery night during SATS, I felt the conversation we'd already had. Not the one I wanted — the one that had already happened in my imagination. I felt the ease of it, the normality. No desperation. No checking my phone.\n\nDay 18: a text. Day 21: a call.\n\nThe call wasn't dramatic. It was *normal*. And that's exactly what I had practiced feeling in the void.\n\n**What actually worked:**\n- Staying in the end state, not scripting a specific path\n- Removing the "when will it happen" energy entirely\n- Using the Revision Journal to rewrite three negative interactions\n- One SATS session per night, 20 minutes, right before sleep\n\nIf you're in the waiting, stop waiting. Start living from the result.`,
    author: ADMIN,
    reply_count: 28,
    upvotes: 89,
    is_pinned: false,
    created_at: '2025-03-05T14:30:00Z',
    replies: [
      {
        id: 'r-sp-1',
        author: ADMIN,
        content: 'The key that most people miss: the normality. When you\'re desperate, your subconscious reads the desperation, not the desire. Practice the feeling of it already being *boring* because it\'s so done.',
        upvotes: 41,
        created_at: '2025-03-05T16:00:00Z',
      },
    ],
  },
  {
    id: 'got-the-promotion',
    category: 'sats_wins',
    title: 'Got the promotion using the Identity Audit — from doubter to Director',
    content: `I want to be honest about where I started: I was a mess of contradictions.\n\nI wanted a promotion but I believed I wasn't ready. I wanted to earn more but felt guilty about it. The Identity Audit from Course 2 exposed every one of those contradictions in a way I couldn't ignore.\n\nSo I did the work. Every conflicting belief I found, I revised. Not suppressed — *revised*. I went back in my mind and rewrote the experiences that taught me I wasn't leadership material.\n\nFour months later: Director of Operations. $40K raise. Same company, different identity.\n\nThe 3D always catches up to the imaginal. Always.`,
    author: ADMIN,
    reply_count: 19,
    upvotes: 73,
    is_pinned: false,
    created_at: '2025-03-08T09:15:00Z',
    replies: [
      {
        id: 'r-promo-1',
        author: ADMIN,
        content: 'The Identity Audit works because it doesn\'t just tell you what you want — it shows you what you actually *believe*. Those two things are rarely the same when we start. The gap between them is the work.',
        upvotes: 28,
        created_at: '2025-03-08T10:30:00Z',
      },
    ],
  },

  // ── QUESTIONS ────────────────────────────────────────────────────────────────
  {
    id: 'void-state-intrusive-thoughts',
    category: 'questions',
    title: 'How do you handle intrusive thoughts during the void state?',
    content: `I\'ve been practicing SATS for three weeks. I can get to the hypnagogic state but the moment I try to hold my scene, random thoughts come in — work stress, random memories, sometimes just nonsense.\n\nDo I engage with them? Dismiss them? Start over? I feel like I'm fighting my own mind and losing.\n\nAnybody who has moved past this — what clicked for you?`,
    author: ADMIN,
    reply_count: 22,
    upvotes: 44,
    is_pinned: false,
    created_at: '2025-03-10T19:00:00Z',
    replies: [
      {
        id: 'r-void-1',
        author: ADMIN,
        content: `Great question. Here\'s the reframe that changed everything for me:\n\nYou're not fighting your mind. You\'re training it. Intrusive thoughts aren\'t failures — they\'re your subconscious letting go of old material.\n\nWhat works: don\'t engage, don\'t resist. Just gently return to your scene like you\'d redirect a child\'s attention. No judgment, no frustration. The gentleness is the technique.\n\nAlso: the void doesn\'t require a "perfect" session. One genuine moment of feeling is worth more than 20 minutes of struggle.`,
        upvotes: 52,
        created_at: '2025-03-10T20:00:00Z',
      },
    ],
  },
  {
    id: 'sats-sitting-vs-lying',
    category: 'questions',
    title: 'SATS: sitting position vs lying down — does it actually matter?',
    content: `Neville Goddard always said to lie down, arms uncrossed, eyes closed. But I fall asleep nearly every time.\n\nI\'ve tried sitting upright and I stay conscious but I can\'t get as deep. Is one better than the other, or is it just what works for your body?\n\nAlso curious if anyone has tried it at other times of day instead of right before sleep.`,
    author: ADMIN,
    reply_count: 16,
    upvotes: 38,
    is_pinned: false,
    created_at: '2025-03-12T21:30:00Z',
    replies: [
      {
        id: 'r-sats-pos-1',
        author: ADMIN,
        content: `Both work. Here\'s what matters:\n\n**The goal** is the hypnagogic state — the threshold between waking and sleep. That\'s where the subconscious is most receptive.\n\n**Lying down** gets you there faster but the risk is falling fully asleep before your scene is fixed. If that\'s you, try sitting at a slight recline — recliner, or propped pillows.\n\n**Sitting upright** keeps you conscious but may require more practice to reach depth. It\'s actually what many advanced practitioners prefer.\n\n**My suggestion:** If you fall asleep lying down, don\'t fight it. The instruction to your subconscious is still sent. The sleep just seals it. Experiment and trust your body.`,
        upvotes: 44,
        created_at: '2025-03-12T22:00:00Z',
      },
    ],
  },
  {
    id: 'revision-journal-past-events',
    category: 'questions',
    title: 'Best way to use the Revision Journal for past events vs future desires?',
    content: `I understand revision for past negative events — I rewrite what happened to what I wish had happened and feel the new version.\n\nBut I\'m confused about future desires. Do I write as if it\'s already happened? Like "I got the contract" or "I am in a loving relationship"?\n\nAnd do you revise every day or just when something feels "stuck"?`,
    author: ADMIN,
    reply_count: 14,
    upvotes: 31,
    is_pinned: false,
    created_at: '2025-03-14T08:00:00Z',
    replies: [
      {
        id: 'r-revision-1',
        author: ADMIN,
        content: `For **past events**: Write what you wish had happened. Feel it as memory. "I remember when I handled that meeting brilliantly." Make it a fond recollection, not a wish.\n\nFor **future desires**: Write from the end. "It\'s done. I have the contract. I\'m signing the lease. I\'m in this relationship." Past tense or present tense — both work. The key is the *feeling* of completion, not the tense.\n\n**Frequency**: Daily is ideal for active desires. For healed past events, once is often enough. The journal works when you *feel* the revision, not just write it mechanically. Quality over quantity.`,
        upvotes: 36,
        created_at: '2025-03-14T09:00:00Z',
      },
    ],
  },

  // ── BRIDGE OF INCIDENTS ──────────────────────────────────────────────────────
  {
    id: 'course-1-week-1-realizations',
    category: 'bridge_of_incidents',
    title: 'Course 1, Week 1 — Share Your RAS Realization',
    content: `After completing Lesson 1 (The 11 Million Bit Problem), I want to hear what hit different for you.\n\nFor me it was understanding that my brain has been filtering for evidence of my *existing beliefs* my entire life. Every day I've been collecting proof that I'm "not good enough" or "money is hard" — not because it\'s true, but because those were the filters my subconscious loaded.\n\nChanging the assumption changes what the RAS lets through. That\'s the whole game.\n\nWhat was your aha moment? Drop it below — the more specific, the better. Your realization might be exactly what someone else needs to hear.`,
    author: ADMIN,
    reply_count: 31,
    upvotes: 56,
    is_pinned: false,
    created_at: '2025-03-03T12:00:00Z',
    replies: [
      {
        id: 'r-c1-1',
        author: ADMIN,
        content: 'The RAS lesson is the scientific foundation for everything that follows. Once you understand *why* assumption-based reality creation works neurologically, the practice stops feeling like faith and starts feeling like engineering.',
        upvotes: 29,
        created_at: '2025-03-03T13:00:00Z',
      },
    ],
  },

  // ── ACCOUNTABILITY ──────────────────────────────────────────────────────────
  {
    id: 'daily-revision-routine',
    category: 'accountability',
    title: '30-Day Revision Challenge — Join me starting March 15',
    content: `I\'m committing to 30 consecutive days of the full Vibe Hyr daily practice:\n\n☑ Morning: Identity statement (5 min)\n☑ Evening: Revision Journal entry\n☑ Night: SATS session (20 min minimum)\n☑ Weekly: Identity Audit check-in\n\nI\'ll post updates weekly. Drop a comment if you want to join and I\'ll check in on you.\n\nRules:\n1. No skipping — if you miss a day, restart the count\n2. Log your dominant emotional state each day\n3. Document any "bridge of incidents" — synchronicities, unexpected doors opening\n\nWho\'s in?`,
    author: ADMIN,
    reply_count: 38,
    upvotes: 67,
    is_pinned: false,
    created_at: '2025-03-13T07:00:00Z',
    replies: [
      {
        id: 'r-30day-1',
        author: ADMIN,
        content: 'Week 1 update: The hardest part is the morning identity statement. Old thoughts fight hard in the first 5 minutes of the day. Staying consistent regardless. The evening revision is getting easier — I can feel the difference between writing and *feeling* now.',
        upvotes: 23,
        created_at: '2025-03-20T07:30:00Z',
      },
    ],
  },

  // ── GENERAL ─────────────────────────────────────────────────────────────────
  {
    id: 'combining-sats-scripting',
    category: 'general',
    title: 'Combining SATS with scripting — my honest review after 60 days',
    content: `I know some people say to pick one technique and stick to it. I\'ve been combining SATS and scripting for 60 days and I want to share what I actually found.\n\n**What combining does:** Scripting in the morning creates a written anchor — a concrete statement of what\'s true in the imaginal. SATS at night lets me *feel* it at the threshold of sleep, which is when the subconscious is most impressionable.\n\nThink of it like this: scripting writes the program. SATS runs it.\n\n**The risk:** If scripting becomes mechanical (just writing words without feeling), it can actually create resistance because you\'re reinforcing the *act of wanting* rather than the *state of having*.\n\n**My results:** Significant movement on three things I\'d been working on for months. I\'m not attributing it all to technique combination — consistency matters more than method. But the synergy is real.`,
    author: ADMIN,
    reply_count: 11,
    upvotes: 42,
    is_pinned: false,
    created_at: '2025-03-15T15:00:00Z',
    replies: [
      {
        id: 'r-scripting-1',
        author: ADMIN,
        content: '"Scripting writes the program. SATS runs it." — I\'m going to save this. This is exactly the framing I needed.',
        upvotes: 18,
        created_at: '2025-03-15T16:30:00Z',
      },
    ],
  },
]

export const COMMUNITY_CATEGORIES: { id: PostCategory; label: string; description: string }[] = [
  { id: 'general',             label: 'General',             description: 'Open discussion about the practice and platform' },
  { id: 'sats_wins',          label: 'SATS Wins',           description: 'Share your manifestation results and breakthroughs' },
  { id: 'questions',          label: 'Questions',           description: 'Ask the community anything about the techniques' },
  { id: 'bridge_of_incidents', label: 'Bridge of Incidents', description: 'Synchronicities and the 3D moving to match your assumption' },
  { id: 'accountability',     label: 'Accountability',      description: 'Challenges, streaks, and consistent practice' },
]

export function getThread(id: string): CommunityThread | undefined {
  return COMMUNITY_THREADS.find(t => t.id === id)
}

export function getThreadsByCategory(category: PostCategory): CommunityThread[] {
  return COMMUNITY_THREADS.filter(t => t.category === category && !t.is_pinned)
}

export const SAMPLE_DM_CONVERSATIONS = [
  {
    id: 'dm-admin-welcome',
    with: ADMIN,
    last_message: 'Welcome to Vibe Hyr — if you have questions about the practice, drop them in the community forum. We read everything.',
    last_message_at: '2025-03-01T10:05:00Z',
    unread: false,
  },
]
