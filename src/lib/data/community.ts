import type { PostCategory } from '@/types'

export type CommunityVertical = 'all' | 'personal' | 'business' | 'educator' | 'leadership'

export interface CommunityAuthor {
  id: string
  full_name: string
  avatar_url: string | null
  membership_tier: 'free' | 'architect' | 'elite'
  role?: 'admin'
  title?: string
}

export interface CommunityThread {
  id: string
  category: PostCategory
  vertical?: CommunityVertical
  course_tag?: string
  title: string
  content: string
  author: CommunityAuthor
  reply_count: number
  upvotes: number
  is_pinned: boolean
  created_at: string
  updated_at?: string
  replies?: CommunityReply[]
}

export interface CommunityReply {
  id: string
  author: CommunityAuthor
  content: string
  upvotes: number
  created_at: string
}

export const ADMIN: CommunityAuthor = {
  id: 'admin-ks',
  full_name: 'Keisha Solomon',
  avatar_url: null,
  membership_tier: 'elite',
  role: 'admin',
  title: 'Founder · Master Architect',
}

// ── Community members ────────────────────────────────────────────────────────
const M1: CommunityAuthor  = { id: 'm-1',  full_name: 'Tamara Reeves',    avatar_url: null, membership_tier: 'architect', title: 'Personal Mastery' }
const M2: CommunityAuthor  = { id: 'm-2',  full_name: 'Jordan Ellis',     avatar_url: null, membership_tier: 'elite',     title: 'Director of Operations' }
const M3: CommunityAuthor  = { id: 'm-3',  full_name: 'Simone Carter',    avatar_url: null, membership_tier: 'free',      title: 'Seeker · Course 1' }
const M4: CommunityAuthor  = { id: 'm-4',  full_name: 'Marcus Webb',      avatar_url: null, membership_tier: 'architect', title: 'Workplace & Personal' }
const M5: CommunityAuthor  = { id: 'm-5',  full_name: 'Aaliyah Frost',    avatar_url: null, membership_tier: 'elite',     title: 'Reality Master' }
const M6: CommunityAuthor  = { id: 'm-6',  full_name: 'Devon Nash',       avatar_url: null, membership_tier: 'architect', title: 'Systems Engineer' }
const M7: CommunityAuthor  = { id: 'm-7',  full_name: 'Priya Okafor',     avatar_url: null, membership_tier: 'architect', title: '30-Day Challenge Host' }
const M8: CommunityAuthor  = { id: 'm-8',  full_name: 'Isaiah Montoya',   avatar_url: null, membership_tier: 'architect', title: 'Creative Director' }
const M9: CommunityAuthor  = { id: 'm-9',  full_name: 'Elena Vance',      avatar_url: null, membership_tier: 'elite',     title: 'VP of Product · Business Track' }
const M10: CommunityAuthor = { id: 'm-10', full_name: 'Darius Thorne',    avatar_url: null, membership_tier: 'architect', title: '8th Grade Lead Educator' }
const M11: CommunityAuthor = { id: 'm-11', full_name: 'maya Lin-Reyes',   avatar_url: null, membership_tier: 'elite',     title: 'High School Dean · Educators' }
const M12: CommunityAuthor = { id: 'm-12', full_name: 'Rev. Caleb Vance', avatar_url: null, membership_tier: 'elite',     title: 'Executive Director · Leadership' }
const M13: CommunityAuthor = { id: 'm-13', full_name: 'Nadia Al-Mansoor', avatar_url: null, membership_tier: 'architect', title: 'Founder & Chapter Lead' }
const M14: CommunityAuthor = { id: 'm-14', full_name: 'Kendrick Shaw',    avatar_url: null, membership_tier: 'architect', title: 'Enterprise Account Lead' }

export const COMMUNITY_VERTICALS: { id: CommunityVertical; label: string }[] = [
  { id: 'all',        label: 'All Tracks' },
  { id: 'personal',   label: 'Personal' },
  { id: 'business',   label: 'Business' },
  { id: 'educator',   label: 'Educators' },
  { id: 'leadership', label: 'Leadership' },
]

export const COMMUNITY_THREADS: CommunityThread[] = [
  // ── PINNED ──────────────────────────────────────────────────────────────────
  {
    id: 'platform-update-curriculum-labs-2026',
    category: 'general',
    vertical: 'all',
    course_tag: 'Platform Update',
    title: '✦ Platform Update: Expanded Deep-Dive Modules, Interactive Assumption Labs & Audio Narration Now Live',
    content: `Architects — we just rolled out our largest curriculum and player update across all four tracks (**Personal**, **Business**, **Educators**, and **Leadership**).\n\n**What's New in Your Lesson Players:**\n\n• **101 Interactive Assumption Labs & Reflections:** Every lesson across Personal (29), Business (24), Leadership (24), and Educators (24) now includes a scenario-based **Assumption Lab** at the bottom of the lesson. Your responses automatically persist to your account so you can review or edit them anytime.\n• **Expanded Deep-Dive Sections & Synthesis Frameworks:** All Business, Personal, and Leadership modules now render full multi-section Core Teachings, Practical Exercises, and 3-question Mastery Quizzes with detailed architectural explanations.\n• **Built-In Audio Narration:** Prefer to absorb lessons eyes-closed or while commuting? Click **"Listen to Lesson"** in the top banner of any text-first module for instant neural voice narration.\n• **Quick-Jump Navigation & Unified Notes:** Use the new section quick-jump bar under the header to leap straight to Deep-Dive Sections, the Assumption Lab, or the Mastery Quiz, and preview your saved notes right in the sidebar.\n\nDrop a reply below with the first **Assumption Lab** or module breakthrough you complete this week!`,
    author: ADMIN,
    reply_count: 19,
    upvotes: 148,
    is_pinned: true,
    created_at: '2026-11-20T14:00:00Z',
    updated_at: '2026-11-24T11:30:00Z',
    replies: [
      {
        id: 'r-update-1',
        author: M9,
        content: `The new Business Assumption Labs in Track 02 (*From Reaction to Response*) and Track 03 (*Vibrational Leadership*) are unreal. Having my saved lab commitments right there when I revisit a module before our Monday executive standup has already changed how I prep.`,
        upvotes: 37,
        created_at: '2026-11-21T09:15:00Z',
      },
      {
        id: 'r-update-2',
        author: M10,
        content: `Just used the **"Listen to Lesson"** audio feature on Program 3 (*Co-Regulation Mastery*) during my morning prep period before the bell rang. Walking into first period with my nervous system already anchored in Zone 2 made the entire morning effortless.`,
        upvotes: 29,
        created_at: '2026-11-22T07:45:00Z',
      },
      {
        id: 'r-update-3',
        author: M5,
        content: `The Quick-Jump bar and the scenario-based Assumption Labs in Course 4 (*Navigating the Echo*) hit so deep. Specifically the Decision Matrix scenario on breaking financial scarcity panic—I filled mine out last night and felt an immediate somatic drop in cortisol.`,
        upvotes: 24,
        created_at: '2026-11-23T18:20:00Z',
      },
      {
        id: 'r-update-4',
        author: ADMIN,
        content: `Love hearing this. Remember: the Assumption Lab isn't a test to "get right"—it's a decision anchor. Every time you articulate the new response in first-person present tense, you're handing your RAS a new search query.`,
        upvotes: 42,
        created_at: '2026-11-24T11:30:00Z',
      },
    ],
  },
  {
    id: 'welcome-to-vibe-hyr',
    category: 'general',
    vertical: 'all',
    course_tag: 'Start Here',
    title: 'Welcome to the Vibe Hyr Community — Start Here',
    content: `Welcome, Reality Architect. This is your space.\n\nThis community exists for one purpose: to support your practice. Whether you're on Day 1 of Course 1, leading a corporate team in the Business track, co-regulating a classroom in Educators, or building a movement in Leadership, you belong here.\n\n**Community Guidelines:**\n\n• Be generous — share your wins and your challenges\n• Stay on topic — we focus on the practice, not debate\n• Lift each other up — comparison has no place in assumption-based reality\n• Protect your assumption — don't seek validation for what you've already decided is true\n\nIntroduce yourself below and let us know which track you're in and what brought you to Vibe Hyr.`,
    author: ADMIN,
    reply_count: 54,
    upvotes: 136,
    is_pinned: true,
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-11-23T16:10:00Z',
    replies: [
      {
        id: 'r-welcome-1',
        author: ADMIN,
        content: 'This thread is always open. Check back whenever you need a reminder of why you started. The work is worth it.',
        upvotes: 48,
        created_at: '2026-09-01T11:00:00Z',
      },
      {
        id: 'r-welcome-2',
        author: M12,
        content: 'Checking in from the **Leadership** track! I run a regional youth & community organization of 45 staff and volunteers. Course 01 (*Internal Authority*) completely rewired how I hold the emotional weather of our building.',
        upvotes: 22,
        created_at: '2026-11-14T15:20:00Z',
      },
      {
        id: 'r-welcome-3',
        author: M11,
        content: 'High school dean here in the **Educators** cohort. Came for burnout recovery in Program 1, stayed because our hallway referral rate dropped by half once our grade-level team started practicing Co-Regulation Moves.',
        upvotes: 31,
        created_at: '2026-11-19T12:40:00Z',
      },
      {
        id: 'r-welcome-4',
        author: M14,
        content: 'Joined through the **Business** vertical after our VP recommended Track 01 (*Common Sense in the Workplace*). Already diving into the Personal Mastery courses at night too. Glad to be building with you all.',
        upvotes: 19,
        created_at: '2026-11-23T16:10:00Z',
      },
    ],
  },

  // ── NEW VERTICAL & CURRICULUM UPDATES ───────────────────────────────────────
  {
    id: 'decision-matrix-60-day-echo-delay',
    category: 'bridge_of_incidents',
    vertical: 'personal',
    course_tag: 'Course 4 · Navigating the Echo',
    title: 'How the 30-Second Decision Matrix saved me from sabotaging a $65K contract during the 60-day echo delay',
    content: `In Course 4, Lesson 2 (*Navigating the Echo*) and Lesson 7 (*The Decision Matrix*), we learn that 3D reality is a delayed reflection of past assumptions—the 60-to-90-day echo lag.\n\nHere is what happened to me last week:\n\nI had been occupying the identity of a sought-after strategic advisor for 45 days. Out of nowhere, an old client paused their retainer and my bank balance dipped. Twelve months ago, my old identity would have panicked, slashed my rates, and sent desperate follow-up emails.\n\nInstead, I opened the **Assumption Lab** for *The Decision Matrix* and ran the 3-filter check in 30 seconds:\n\n- **Filter 1 (Source Check):** Is the urge to discount my proposal coming from Fear/Scarcity or Fulfillment? *100% Fear.*\n- **Filter 2 (Identity Alignment):** What would the already-established version of me do right now? *Hold the standard, regulate my nervous system, and send the full-rate proposal without apology.*\n- **Filter 3 (Echo Awareness):** Is this temporary cash dip a verdict on my future, or just the dying echo of my old state from 60 days ago? *Just an old echo.*\n\n**The Result (72 hours later):**\nI held my state and didn't touch the panic button. On Thursday afternoon, a referral from a totally unexpected contact reached out, skipped the pitch phase, and signed a **$65,000 annual agreement** paid quarterly upfront.\n\nDo not dig up the seed during the echo delay!`,
    author: M5,
    reply_count: 17,
    upvotes: 94,
    is_pinned: false,
    created_at: '2026-11-22T16:40:00Z',
    updated_at: '2026-11-24T09:10:00Z',
    replies: [
      {
        id: 'r-echo-1',
        author: M6,
        content: `Filter 1 (*Fear vs. Fulfillment*) is the cleanest circuit-breaker in the entire curriculum. Every single time I've made a bad business move in the past, it was an action taken to *relieve anxiety* about the 3D rather than an action taken from the end state.`,
        upvotes: 28,
        created_at: '2026-11-22T18:05:00Z',
      },
      {
        id: 'r-echo-2',
        author: ADMIN,
        content: `This is textbook Echo Mastery, Aaliyah. Most practitioners don't fail because they can't enter the state—they fail because an old 60-day echo arrives on Day 40 and tricks them into abandoning the state right before harvest. Holding the standard for those 72 hours was the entire bridge.`,
        upvotes: 45,
        created_at: '2026-11-23T10:15:00Z',
      },
      {
        id: 'r-echo-3',
        author: M2,
        content: `Bookmarking this post. Currently on Day 34 of a major organizational transition and the 3D looked noisy yesterday. Thank you for the reminder that an echo has no creative power unless we re-energize it with reaction.`,
        upvotes: 19,
        created_at: '2026-11-24T09:10:00Z',
      },
    ],
  },
  {
    id: 'business-pause-protocol-clarity-frame-win',
    category: 'bridge_of_incidents',
    vertical: 'business',
    course_tag: 'Business · Track 01 & 02',
    title: 'Used the Stage 1 Clarity Frame + 80% PAUSE Protocol in a tense Q4 executive review — room shifted in 90 seconds',
    content: `Sharing a concrete win from the **Business / Workplace** tracks (*Track 01: Common Sense in the Workplace* + *Track 02: From Reaction to Response*).\n\nYesterday our product, engineering, and sales leads walked into a Q4 post-mortem that was rapidly climbing the **Conflict Escalation Ladder** toward Stage 3 (defensiveness, blame-shifting, interrupted sentences).\n\nBefore walking into the conference room, I did the 60-second **Intentional Presence** reset from Track 03:\n- Released my jaw and dropped my shoulders\n- Committed to speaking at **80% of my normal speed**\n- Decided my nervous system would be the thermostat, not the thermometer\n\nWhen the Sales VP challenged our delivery timeline with a sharp tone, I ran the **PAUSE Protocol**:\n- **P — Pause:** Took one full visible breath (3 seconds of silence instead of instant defense)\n- **A — Acknowledge:** Named the shared priority without absorbing the hostility\n- **U — Understand:** Used the **Clarity Frame**: *"What I'm hearing is that Q1 enterprise renewals depend on the analytics dashboard shipping by Jan 15. Let's align on what we need to lock that date."*\n\n**What happened next:**\nThe physical tension in the room dropped immediately. Within 90 seconds, the Sales VP went from adversarial to offering two of his solutions engineers to help us test. We walked out 15 minutes early with full sign-off.\n\nSomatic regulation in leadership isn't "soft"—it's pure leverage.`,
    author: M9,
    reply_count: 14,
    upvotes: 82,
    is_pinned: false,
    created_at: '2026-11-21T19:20:00Z',
    updated_at: '2026-11-23T21:00:00Z',
    replies: [
      {
        id: 'r-biz-1',
        author: M14,
        content: `Speaking at **80% of normal speed** is a superpower. I tested it on an enterprise renewal call on Tuesday—when you slow down and stop over-explaining, people immediately perceive certainty and authority.`,
        upvotes: 26,
        created_at: '2026-11-22T08:30:00Z',
      },
      {
        id: 'r-biz-2',
        author: M4,
        content: `That 3-second pause before responding is where all the power lives. In Track 02 when it explains how reactive defenders accidentally validate the attacker's escalation—that clicked so hard for me.`,
        upvotes: 21,
        created_at: '2026-11-22T14:15:00Z',
      },
      {
        id: 'r-biz-3',
        author: ADMIN,
        content: `"Thermostat, not thermometer." When you refuse to meet a Stage 2 provocation with Stage 2 defensiveness, the other person's nervous system has nothing to push against. Brilliant execution of the Clarity Frame, Elena.`,
        upvotes: 34,
        created_at: '2026-11-23T21:00:00Z',
      },
    ],
  },
  {
    id: 'educators-2x10-strategy-coregulation-results',
    category: 'sats_wins',
    vertical: 'educator',
    course_tag: 'Educators · Program 01 & 03',
    title: '10 days of the 2×10 Strategy + Zone 2 Somatic Room-Reading: 85% drop in 4th-period disruptions',
    content: `Calling all **Educators** in the community! I wanted to share hard data from my 8th-grade classroom after implementing two protocols from the Educators curriculum:\n\n1. **The Somatic Threshold Reset (Program 1):** Before unlocking my classroom door for 4th period (historically my most dysregulated block right after lunch), I paused for 30 seconds at the threshold, exhaled into Zone 2, and revised my internal assumption from *"4th period is always chaos"* to *"My regulated presence anchors this room."*\n2. **The 2×10 Relational Strategy (Program 3):** I picked the two students who usually triggered 80% of the peer conflict and spent **2 minutes a day for 10 consecutive school days** talking with them about anything *unrelated* to behavior or grades (sneakers, gaming, music).\n3. **Catching Dysregulation at the Whisper Stage:** Instead of calling out off-task behavior across the room (which triggers Adolescent Social Threat / amygdala hijack), I used silent proximity and a 10-second kneeling check-in.\n\n**10-Day Result:**\n- Office referrals from 4th period went from **6 per week to ZERO**\n- Overall redirections dropped by **85%**\n- Yesterday, one of my 2×10 students actually told a classmate, *"Yo, chill, let Mr. Thorne finish this part."*\n\nCo-regulation precedes cognition. Every single time.`,
    author: M10,
    reply_count: 15,
    upvotes: 91,
    is_pinned: false,
    created_at: '2026-11-20T20:15:00Z',
    updated_at: '2026-11-24T08:00:00Z',
    replies: [
      {
        id: 'r-edu-1',
        author: M11,
        content: `Darius!! When that student co-regulated his peer for you—that is the exact neuroception of safety we talk about in Program 3! We shared the 2×10 Strategy at our ninth-grade faculty huddle last week and 14 teachers are running it right now.`,
        upvotes: 31,
        created_at: '2026-11-21T11:20:00Z',
      },
      {
        id: 'r-edu-2',
        author: ADMIN,
        content: `Notice how you combined the *internal assumption revision* at the classroom door with the *somatic & relational practice* inside the room. Students don't respond to what we say; their mirror neurons respond to who we assume they are when they walk through the door.`,
        upvotes: 39,
        created_at: '2026-11-21T17:45:00Z',
      },
      {
        id: 'r-edu-3',
        author: M10,
        content: `Update (Day 14): Still zero referrals in 4th period, and class average on Friday's formative assessment jumped 18 points. My own evening exhaustion is completely gone.`,
        upvotes: 27,
        created_at: '2026-11-24T08:00:00Z',
      },
    ],
  },
  {
    id: 'business-prover-to-sovereign-archetype-shift',
    category: 'general',
    vertical: 'business',
    course_tag: 'Business · Track 03 & 04',
    title: 'Shifting from "The Prover" (70-hr weeks) to "The Sovereign" + running our first Team Collective Assumption Audit',
    content: `Lesson 5 of Business Track 03 (*The Four Archetypes at Work*) called me out by name.\n\nFor five years I operated as **The Prover**—tying my worth to exhaustion, answering Slack at 10:30 PM, and secretly resenting my team for not showing the same "urgency." I thought I was modeling high standards. In reality, as Track 04 (*Collective Reality*) teaches, I was broadcasting an assumption of anxiety and distrust.\n\n**Here is the 3-step shift I made over the last 3 weeks:**\n\n• **Archetype Upgrade (Prover → Sovereign):** In my Assumption Lab, I wrote and locked in a new executive identity: *"My value is measured by the clarity of my decisions and the calm of my presence, not the volume of my hours."*\n• **Stopped Rescuing:** When a project hit a snag, instead of taking the keyboard back at 8 PM, I asked: *"What is your recommended path forward, and what decision do you need from me?"*\n• **Team Collective Assumption Audit (Track 04, Lesson 2):** At our monthly retro, we surfaced our unspoken team assumption (*"Enterprise deals always stall in legal"*) and replaced it with a new operational standard + pre-aligned legal checklist.\n\n**Results after 21 days:**\nI cut my working hours from 68 to 44 per week, our team's sprint velocity went *up* 22%, and two enterprise deals cleared legal in 6 business days—a company record.`,
    author: M4,
    reply_count: 12,
    upvotes: 76,
    is_pinned: false,
    created_at: '2026-11-18T15:30:00Z',
    updated_at: '2026-11-23T14:20:00Z',
    replies: [
      {
        id: 'r-sov-1',
        author: M9,
        content: `That question—*"What is your recommended path forward, and what decision do you need from me?"*—is pure Sovereign leadership. When leaders operate as The Prover, they accidentally train capable teams to become passive waiters.`,
        upvotes: 24,
        created_at: '2026-11-19T09:50:00Z',
      },
      {
        id: 'r-sov-2',
        author: M2,
        content: `We ran the **Team Collective Assumption Audit** on our onboarding pipeline too! Turned out our entire team repeated the story *"Clients never send assets on time."* Once we revised the assumption and redesigned our kickoff call, Day-7 asset delivery hit 92%.`,
        upvotes: 19,
        created_at: '2026-11-21T16:10:00Z',
      },
      {
        id: 'r-sov-3',
        author: ADMIN,
        content: `Every organization has an invisible constitution made of its repeated complaints. Surface the complaint, revise the assumption, and align the process to the new certainty—that's Track 04 in action.`,
        upvotes: 31,
        created_at: '2026-11-23T14:20:00Z',
      },
    ],
  },
  {
    id: 'leadership-internal-authority-multiplier-effect',
    category: 'accountability',
    vertical: 'leadership',
    course_tag: 'Leadership · Course 01 & 04',
    title: 'Applying the Radical Ownership Script & Standard Audit to rebuild our organization\'s culture without burnout',
    content: `For anyone working through the **Leadership** vertical (*Course 01: Internal Authority* and *Course 04: The Multiplier Effect*), I want to share how the **Standard Audit** and **Radical Ownership** transformed our leadership team this quarter.\n\nTwo months ago, our core volunteer and staff meetings were starting 12 minutes late, follow-through on action items sat around 50%, and I was privately blaming "post-pandemic apathy."\n\nThen I hit Course 01, Lesson 3 (*Radical Ownership*) and Lesson 4 (*The Standard Audit*):\n> *"You do not get the culture you ask for; you get the culture you tolerate and embody."*\n\n**What I changed immediately:**\n- **Zero Blame / Full Ownership:** I opened our next leadership summit with the Radical Ownership Script: *"Where our commitments have slipped, that is a reflection of unclear standards from me—not a lack of heart from you. Starting today, we are resetting the container."*\n- **The Standard Audit:** We cut 40% of our low-impact meetings, started every remaining session at :00 sharp regardless of who was in the room, and ended every meeting with single-owner commitments.\n- **Leader Replacement Roadmap (Course 04):** Instead of hoarding the stage, I handed three of my signature operational roles to emerging leaders using the 4-stage Apprenticeship Loop (*I Do/You Watch → I Do/You Help → You Do/I Help → You Do/I Applaud*).\n\nAttendance is now at **96%**, three new directors are thriving, and for the first time in four years I took a full weekend completely offline.`,
    author: M12,
    reply_count: 11,
    upvotes: 69,
    is_pinned: false,
    created_at: '2026-11-17T13:10:00Z',
    updated_at: '2026-11-22T19:05:00Z',
    replies: [
      {
        id: 'r-lead-1',
        author: M13,
        content: `The 4-stage Apprenticeship Loop in Course 04 saved our chapter expansion. I realized I had been jumping straight from *"watch me do it once"* to *"why didn't you do it like me?"* Walking through all four stages deliberately builds real confidence.`,
        upvotes: 21,
        created_at: '2026-11-18T10:25:00Z',
      },
      {
        id: 'r-lead-2',
        author: ADMIN,
        content: `Opening with radical ownership disarms every ego in the room. When the leader stops blaming the room and upgrades the container, the right people always rise to meet the new standard.`,
        upvotes: 28,
        created_at: '2026-11-22T19:05:00Z',
      },
    ],
  },
  {
    id: 'night-4-integration-ritual-first-person-shift',
    category: 'sats_wins',
    vertical: 'personal',
    course_tag: 'Course 3 · Subconscious Reprogramming',
    title: 'Night 4 of the 7-Night Integration Ritual finally broke my 3rd-person "movie watching" habit in SATS',
    content: `If your SATS scenes have felt flat or delayed, read this!\n\nFor months I didn't realize I was constructing my imaginal scenes in **third person**—watching myself on a screen like a movie character. As Course 3, Lesson 4 (*Revision & The Architecture of Memory*) and Lesson 7 (*The 7-Night Integration Ritual*) explain, when you watch yourself from the outside, your subconscious codes it as *fantasy happening to someone else*.\n\nDuring the **Assumption Lab** in Lesson 7, I rebuilt my 8-second loop strictly in **first-person sensory POV**:\n- Looking *down* at my own hands resting on the warm walnut desk\n- Feeling the cool weight of my watch against my left wrist\n- Hearing my partner's voice coming from *behind my right shoulder* saying, *"You actually pulled it off, look at those numbers"*\n- Feeling the deep exhale of relief in my own chest\n\nBy **Night 4** of the 7-Night Integration Ritual, the scene stopped feeling like "visualization" and felt like a physical memory I had already lived. By **Night 6**, the craving to "check the 3D" vanished completely—what Neville calls the Sabbath.\n\nTen days later, the exact conversation happened in my kitchen—down to my partner standing behind my right shoulder.`,
    author: M1,
    reply_count: 16,
    upvotes: 88,
    is_pinned: false,
    created_at: '2026-11-16T21:00:00Z',
    updated_at: '2026-11-23T12:15:00Z',
    replies: [
      {
        id: 'r-night4-1',
        author: M3,
        content: `Looking down at your own hands first to anchor first-person POV is genius!! I always drifted into 3rd person within 10 seconds until I started beginning every scene by touching a physical texture with my imaginal hands.`,
        upvotes: 25,
        created_at: '2026-11-17T08:40:00Z',
      },
      {
        id: 'r-night4-2',
        author: M8,
        content: `Directional audio (hearing a voice from a specific side of the room rather than a generic voice in your head) was the game-changer for me in Course 3 too. The brain cannot distinguish spatial audio + tactile texture in theta from a real event.`,
        upvotes: 22,
        created_at: '2026-11-19T14:50:00Z',
      },
      {
        id: 'r-night4-3',
        author: ADMIN,
        content: `Third-person = longing. First-person = occupancy. Adding one tactile anchor (the walnut desk) and one directional voice is the fastest shortcut to neural encoding.`,
        upvotes: 35,
        created_at: '2026-11-23T12:15:00Z',
      },
    ],
  },
  {
    id: 'educators-private-repair-vs-public-consequence',
    category: 'questions',
    vertical: 'educator',
    course_tag: 'Educators · Program 02',
    title: 'Educators: How are you balancing the 3-Step Private Repair Protocol when other students demand "fairness"?',
    content: `Question for my fellow teachers and school leaders working through **Program 2: Trauma-Informed De-Escalation**.\n\nI've completely stopped doing public call-outs and public consequence threats when a student escalates. Stepping out of the power struggle and using the **Low-Slow-Sideways** stance + private hallway repair has worked wonders for de-escalating the individual student.\n\n**My question:**\nSometimes the *rest* of the class watches me stay calm and defer the conversation to a private repair moment, and a student will blurt out: *"Why didn't he get written up? If I did that I'd get sent out!"*\n\nHow do you communicate accountability to the whole room without returning to public shaming or performative punishment?`,
    author: M11,
    reply_count: 9,
    upvotes: 53,
    is_pinned: false,
    created_at: '2026-11-19T16:00:00Z',
    updated_at: '2026-11-23T19:30:00Z',
    replies: [
      {
        id: 'r-edq-1',
        author: M10,
        content: `I struggled with this exact moment in September! Here is the 1-sentence script I use with the class now:\n\n*"In this room, everyone gets dignity in public and accountability in private—including you if you ever have a hard day. Now turn back to page 42."*\n\nWhen students realize that *they* will also be protected from public humiliation on their worst day, the complaints stop completely.`,
        upvotes: 38,
        created_at: '2026-11-19T17:15:00Z',
      },
      {
        id: 'r-edq-2',
        author: ADMIN,
        content: `"Dignity in public and accountability in private." Put that on a plaque in every faculty lounge. Students asking "why didn't he get punished?" are really asking "are the adults in control and am I safe?" When your calm answers yes to both, the room settles.`,
        upvotes: 33,
        created_at: '2026-11-23T19:30:00Z',
      },
    ],
  },
  {
    id: 'leadership-6-second-window-board-conflict',
    category: 'bridge_of_incidents',
    vertical: 'leadership',
    course_tag: 'Leadership · Course 02',
    title: 'The 6-Second Amygdala Window: how "Naming the Dynamic Instead of the Person" saved our board coalition',
    content: `In **Leadership Course 02 (Emotional Regulation & Conflict Navigation)**, Lesson 4 covers *Naming the Dynamic, Not the Person* during high-stakes polarization.\n\nLast Thursday, two factions of our board were deadlocked over budget allocation for 2027. Personal accusations started flying (*"You don't care about fiscal sustainability"* vs. *"You're abandoning our grassroots mission"*).\n\nInstead of taking sides or gaveling the room into silence, I waited through the **6-second hijack window**, dropped my vocal pitch, and used the Course 02 script:\n\n> *"Pause with me for ten seconds. Nobody in this room is trying to bankrupt us, and nobody here is abandoning our mission. What we're experiencing right now is a natural structural tension between two essential values: long-term runway and immediate community impact. Let's put the tension on the whiteboard instead of between each other."*\n\nYou could literally hear nine people exhale at once. Once the problem was on the whiteboard instead of attached to people's identities, we found a phased 60/40 hybrid budget in 25 minutes.`,
    author: M13,
    reply_count: 10,
    upvotes: 64,
    is_pinned: false,
    created_at: '2026-11-15T18:00:00Z',
    updated_at: '2026-11-21T14:40:00Z',
    replies: [
      {
        id: 'r-lead2-1',
        author: M12,
        content: `"Put the tension on the whiteboard instead of between each other." That externalizes the conflict immediately. Moving people from face-to-face opposition to shoulder-to-shoulder problem solving is the highest art of conflict navigation.`,
        upvotes: 23,
        created_at: '2026-11-16T09:30:00Z',
      },
      {
        id: 'r-lead2-2',
        author: ADMIN,
        content: `When a leader names the underlying positive value behind *both* entrenched positions, neither side feels unseen—which means neither side needs to escalate to be heard. Masterful work, Nadia.`,
        upvotes: 27,
        created_at: '2026-11-21T14:40:00Z',
      },
    ],
  },

  // ── EXISTING CORE THREADS (UPDATED WITH FOLLOW-UP REPLIES & TIMESTAMPS) ─────
  {
    id: 'sp-called-after-revision',
    category: 'sats_wins',
    vertical: 'personal',
    course_tag: 'Course 3 · SATS & Revision',
    title: 'My SP called after 3 weeks of revision — here\'s exactly what I did (Update: 6 months later)',
    content: `Three weeks ago I committed to one thing: I stopped reacting to the 3D and started living in the end.\n\nEvery night during SATS, I felt the conversation we'd already had. Not the one I wanted — the one that had already happened in my imagination. I felt the ease of it, the normality. No desperation. No checking my phone.\n\nDay 18: a text. Day 21: a call.\n\nThe call wasn't dramatic. It was *normal*. And that's exactly what I had practiced feeling in the void.\n\n**What actually worked:**\n- Staying in the end state, not scripting a specific path\n- Removing the "when will it happen" energy entirely\n- Using the Revision Journal to rewrite three negative interactions\n- One SATS session per night, 20 minutes, right before sleep\n\nIf you're in the waiting, stop waiting. Start living from the result.`,
    author: M1,
    reply_count: 34,
    upvotes: 118,
    is_pinned: false,
    created_at: '2026-09-05T14:30:00Z',
    updated_at: '2026-11-18T20:15:00Z',
    replies: [
      {
        id: 'r-sp-1',
        author: ADMIN,
        content: 'The key that most people miss: the normality. When you\'re desperate, your subconscious reads the desperation, not the desire. Practice the feeling of it already being *boring* because it\'s so done.',
        upvotes: 49,
        created_at: '2026-09-05T16:00:00Z',
      },
      {
        id: 'r-sp-2',
        author: M3,
        content: 'Tamara, when you revised the three past negative interactions, did you revise them once and drop them, or revisit them every evening?',
        upvotes: 17,
        created_at: '2026-10-12T19:20:00Z',
      },
      {
        id: 'r-sp-3',
        author: M1,
        content: '**Update + Answer for Simone:** I revised each of those three memories two nights in a row until the old sting didn\'t trigger in my chest anymore—then I never touched the old story again. Also: 6-month update—we just signed the lease on our new place together last week! Keeping your self-concept anchored *after* the manifestation arrives is where Course 4 really shines.',
        upvotes: 63,
        created_at: '2026-11-18T20:15:00Z',
      },
    ],
  },
  {
    id: 'got-the-promotion',
    category: 'sats_wins',
    vertical: 'personal',
    course_tag: 'Course 2 · Identity Engineering',
    title: 'Got the promotion using the Identity Audit — from doubter to Director',
    content: `I want to be honest about where I started: I was a mess of contradictions.\n\nI wanted a promotion but I believed I wasn't ready. I wanted to earn more but felt guilty about it. The Identity Audit from Course 2 exposed every one of those contradictions in a way I couldn't ignore.\n\nSo I did the work. Every conflicting belief I found, I revised. Not suppressed — *revised*. I went back in my mind and rewrote the experiences that taught me I wasn't leadership material.\n\nFour months later: Director of Operations. $40K raise. Same company, different identity.\n\nThe 3D always catches up to the imaginal. Always.`,
    author: M2,
    reply_count: 23,
    upvotes: 92,
    is_pinned: false,
    created_at: '2026-09-18T09:15:00Z',
    updated_at: '2026-11-15T11:40:00Z',
    replies: [
      {
        id: 'r-promo-1',
        author: ADMIN,
        content: 'The Identity Audit works because it doesn\'t just tell you what you want — it shows you what you actually *believe*. Those two things are rarely the same when we start. The gap between them is the work.',
        upvotes: 34,
        created_at: '2026-09-18T10:30:00Z',
      },
      {
        id: 'r-promo-2',
        author: M14,
        content: 'This post convinced me to stop skimming the Identity Audit and actually write out my hidden objections around executive compensation. Found three childhood money scripts hiding in plain sight.',
        upvotes: 21,
        created_at: '2026-11-02T14:10:00Z',
      },
      {
        id: 'r-promo-3',
        author: M2,
        content: '**90-Day Update in the Director Role:** Once I stepped into the new role, I started pairing the Personal Identity Audit with **Business Track 03 (Vibrational Leadership)**. My team\'s retention hit 100% this quarter because I\'m no longer leading from impostor syndrome.',
        upvotes: 39,
        created_at: '2026-11-15T11:40:00Z',
      },
    ],
  },
  {
    id: 'void-state-intrusive-thoughts',
    category: 'questions',
    vertical: 'personal',
    course_tag: 'Course 3 · SATS Mastery',
    title: 'How do you handle intrusive thoughts during the void state?',
    content: `I've been practicing SATS for three weeks. I can get to the hypnagogic state but the moment I try to hold my scene, random thoughts come in — work stress, random memories, sometimes just nonsense.\n\nDo I engage with them? Dismiss them? Start over? I feel like I'm fighting my own mind and losing.\n\nAnybody who has moved past this — what clicked for you?`,
    author: M3,
    reply_count: 26,
    upvotes: 58,
    is_pinned: false,
    created_at: '2026-10-04T19:00:00Z',
    updated_at: '2026-11-19T21:10:00Z',
    replies: [
      {
        id: 'r-void-1',
        author: ADMIN,
        content: `Great question. Here's the reframe that changed everything for me:\n\nYou're not fighting your mind. You're training it. Intrusive thoughts aren't failures — they're your subconscious letting go of old material.\n\nWhat works: don't engage, don't resist. Just gently return to your scene like you'd redirect a child's attention. No judgment, no frustration. The gentleness is the technique.\n\nAlso: the void doesn't require a "perfect" session. One genuine moment of feeling is worth more than 20 minutes of struggle.`,
        upvotes: 59,
        created_at: '2026-10-04T20:00:00Z',
      },
      {
        id: 'r-void-2',
        author: M6,
        content: `What helped me as an engineer: when random nonsensical imagery pops up (like a purple bicycle or random phrases), that's actually a **positive neurological marker** that you've crossed into theta/hypnagogia! Don't fight the drift—just let your 8-second tactile loop ride right on top of that drowsy wave.`,
        upvotes: 33,
        created_at: '2026-10-19T22:15:00Z',
      },
      {
        id: 'r-void-3',
        author: M3,
        content: `Coming back to say thank you both! Realizing that the random imagery meant I was *actually in theta* removed all my performance anxiety. Last night I held my scene effortlessly for three loops and fell asleep smiling.`,
        upvotes: 28,
        created_at: '2026-11-19T21:10:00Z',
      },
    ],
  },
  {
    id: 'sats-sitting-vs-lying',
    category: 'questions',
    vertical: 'personal',
    course_tag: 'Course 3 · SATS Protocol',
    title: 'SATS: sitting position vs lying down — does it actually matter?',
    content: `Neville Goddard always said to lie down, arms uncrossed, eyes closed. But I fall asleep nearly every time.\n\nI've tried sitting upright and I stay conscious but I can't get as deep. Is one better than the other, or is it just what works for your body?\n\nAlso curious if anyone has tried it at other times of day instead of right before sleep.`,
    author: M4,
    reply_count: 19,
    upvotes: 49,
    is_pinned: false,
    created_at: '2026-10-12T21:30:00Z',
    updated_at: '2026-11-16T18:45:00Z',
    replies: [
      {
        id: 'r-sats-pos-1',
        author: ADMIN,
        content: `Both work. Here's what matters:\n\n**The goal** is the hypnagogic state — the threshold between waking and sleep. That's where the subconscious is most receptive.\n\n**Lying down** gets you there faster but the risk is falling fully asleep before your scene is fixed. If that's you, try sitting at a slight recline — recliner, or propped pillows.\n\n**Sitting upright** keeps you conscious but may require more practice to reach depth. It's actually what many advanced practitioners prefer.\n\n**My suggestion:** If you fall asleep lying down, don't fight it. The instruction to your subconscious is still sent. The sleep just seals it. Experiment and trust your body.`,
        upvotes: 47,
        created_at: '2026-10-12T22:00:00Z',
      },
      {
        id: 'r-sats-pos-2',
        author: M5,
        content: `Propped at a 45-degree angle against two pillows + a 15-minute afternoon SATS session right after lunch (when your circadian rhythm naturally dips into alpha/theta) is my golden combo. I do 15 min seated at 2 PM to lock the scene clearly, and then at night in bed I just drift off inside the feeling without worrying how fast I fall asleep.`,
        upvotes: 31,
        created_at: '2026-11-16T18:45:00Z',
      },
    ],
  },
  {
    id: 'revision-journal-past-events',
    category: 'questions',
    vertical: 'personal',
    course_tag: 'Course 3 · Revision Journal',
    title: 'Best way to use the Revision Journal for past events vs future desires?',
    content: `I understand revision for past negative events — I rewrite what happened to what I wish had happened and feel the new version.\n\nBut I'm confused about future desires. Do I write as if it's already happened? Like "I got the contract" or "I am in a loving relationship"?\n\nAnd do you revise every day or just when something feels "stuck"?`,
    author: M5,
    reply_count: 18,
    upvotes: 45,
    is_pinned: false,
    created_at: '2026-10-14T08:00:00Z',
    updated_at: '2026-11-14T17:20:00Z',
    replies: [
      {
        id: 'r-revision-1',
        author: ADMIN,
        content: `For **past events**: Write what you wish had happened. Feel it as memory. "I remember when I handled that meeting brilliantly." Make it a fond recollection, not a wish.\n\nFor **future desires**: Write from the end. "It's done. I have the contract. I'm signing the lease. I'm in this relationship." Past tense or present tense — both work. The key is the *feeling* of completion, not the tense.\n\n**Frequency**: Daily is ideal for active desires. For healed past events, once is often enough. The journal works when you *feel* the revision, not just write it mechanically. Quality over quantity.`,
        upvotes: 41,
        created_at: '2026-10-14T09:00:00Z',
      },
      {
        id: 'r-revision-2',
        author: M8,
        content: `One tip from Course 3 Lesson 4 (*Prune the Daily Vine*): every evening I pick just **one** minor friction point from that day—even a 2-minute awkward phone call—and rewrite it in the Revision Journal before bed so no weeds take root overnight.`,
        upvotes: 24,
        created_at: '2026-11-14T17:20:00Z',
      },
    ],
  },
  {
    id: 'course-1-week-1-realizations',
    category: 'bridge_of_incidents',
    vertical: 'personal',
    course_tag: 'Course 1 · Programming the Gatekeeper',
    title: 'Course 1, Week 1 — Share Your RAS Realization',
    content: `After completing Lesson 1 (The 11 Million Bit Problem), I want to hear what hit different for you.\n\nFor me it was understanding that my brain has been filtering for evidence of my *existing beliefs* my entire life. Every day I've been collecting proof that I'm "not good enough" or "money is hard" — not because it's true, but because those were the filters my subconscious loaded.\n\nChanging the assumption changes what the RAS lets through. That's the whole game.\n\nWhat was your aha moment? Drop it below — the more specific, the better. Your realization might be exactly what someone else needs to hear.`,
    author: M6,
    reply_count: 37,
    upvotes: 79,
    is_pinned: false,
    created_at: '2026-09-10T12:00:00Z',
    updated_at: '2026-11-20T10:30:00Z',
    replies: [
      {
        id: 'r-c1-1',
        author: ADMIN,
        content: 'The RAS lesson is the scientific foundation for everything that follows. Once you understand *why* assumption-based reality creation works neurologically, the practice stops feeling like faith and starts feeling like engineering.',
        upvotes: 38,
        created_at: '2026-09-10T13:00:00Z',
      },
      {
        id: 'r-c1-2',
        author: M7,
        content: 'Mine was the 40-to-50 bits vs. 11 million bits ratio! When I did the 48-Hour RAS Proof Experiment in Lesson 2 and started logging 3 daily proofs that *"Opportunities find me effortlessly,"* I noticed an email invitation in my promotions tab for a grant fellowship I would have deleted a week earlier. I applied and won $12,000!',
        upvotes: 44,
        created_at: '2026-10-28T16:15:00Z',
      },
      {
        id: 'r-c1-3',
        author: M14,
        content: 'Just completed the new Assumption Lab at the end of Course 1 Lesson 1 today. Realizing that my RAS doesn\'t judge whether a belief helps me or hurts me—it just fetches matching data like a search engine—instantly killed my habit of complaining about "bad leads" at work.',
        upvotes: 22,
        created_at: '2026-11-20T10:30:00Z',
      },
    ],
  },
  {
    id: 'daily-revision-routine',
    category: 'accountability',
    vertical: 'personal',
    course_tag: '30-Day Challenge · All Courses',
    title: '30-Day Revision & Assumption Lab Challenge — Cohort 3 Check-In Thread',
    content: `We are running our 30 consecutive days of the full Vibe Hyr daily practice:\n\n☑ Morning: Identity statement & RAS directive (5 min)\n☑ Daytime: Complete 1 Lesson + its interactive **Assumption Lab**\n☑ Evening: Revision Journal entry ("Prune the Daily Vine")\n☑ Night: SATS session (15–20 min first-person loop)\n☑ Weekly: Life Mastery Score & Identity Audit check-in\n\nI'll post updates weekly. Drop a comment with your Day 1 commitment and check back in as your Bridge of Incidents unfolds!\n\nRules:\n1. No skipping — if you miss a day, compassionately reset and recommit\n2. Log your dominant emotional baseline each day\n3. Document any synchronicities, behavioral shifts, or unexpected doors opening`,
    author: M7,
    reply_count: 46,
    upvotes: 104,
    is_pinned: false,
    created_at: '2026-10-15T07:00:00Z',
    updated_at: '2026-11-23T08:15:00Z',
    replies: [
      {
        id: 'r-30day-1',
        author: M7,
        content: '**Week 1 Update:** The hardest part is the first 5 minutes of the morning before checking notifications. Old thoughts fight hard for the microphone early in the day. Leaving my phone outside the bedroom made the morning RAS directive 10x easier.',
        upvotes: 31,
        created_at: '2026-10-22T07:30:00Z',
      },
      {
        id: 'r-30day-2',
        author: M4,
        content: '**Day 18 Check-In:** My Life Mastery Score went from 54 to 78 over the last two weeks. Biggest shift: using evening Revision on workplace friction so I never carry yesterday\'s resentment into tomorrow\'s meetings.',
        upvotes: 27,
        created_at: '2026-11-02T19:45:00Z',
      },
      {
        id: 'r-30day-3',
        author: M7,
        content: '**Day 30 Completion Report!!** Thirty consecutive days complete! Not only did my baseline anxiety vanish around Day 19, my consulting practice had its highest revenue month of the year without a single cold outreach message. Kicking off Cohort 4 right here—who is starting Day 1 this week?',
        upvotes: 52,
        created_at: '2026-11-15T09:00:00Z',
      },
      {
        id: 'r-30day-4',
        author: ADMIN,
        content: 'Massive congratulations on completing all 30 days, Priya! Notice how around Day 19 the new state stops requiring "effort" and becomes automatic default occupancy. Anyone jumping into the next 30-day cycle, post your Day 1 anchor below!',
        upvotes: 38,
        created_at: '2026-11-23T08:15:00Z',
      },
    ],
  },
  {
    id: 'combining-sats-scripting',
    category: 'general',
    vertical: 'personal',
    course_tag: 'Course 2 & 3 · Practice Synergy',
    title: 'Combining SATS with the new Assumption Labs & Scripting — my honest review after 60 days',
    content: `I know some people say to pick one technique and stick to it. I've been combining morning Scripting / Assumption Labs with nightly SATS for 60 days and I want to share what I actually found.\n\n**What combining does:** Writing your new identity response in the **Assumption Lab** or morning journal creates a cognitive, structural anchor — a clear conscious decision of what's true. SATS at night lets me *feel* it at the threshold of sleep, which is when the subconscious is most impressionable.\n\nThink of it like this: **Scripting and the Assumption Lab write the program. SATS compiles and runs it.**\n\n**The risk:** If scripting becomes mechanical (just writing words to try to "make" something happen), it can create resistance because you're reinforcing the *act of wanting* rather than the *state of having*.\n\n**My results:** Significant movement on three major goals I'd been working on for months—including landing our studio's flagship brand retainer. Consistency of state matters more than any single method, but the daytime clarity + nighttime feeling synergy is undeniable.`,
    author: M8,
    reply_count: 16,
    upvotes: 64,
    is_pinned: false,
    created_at: '2026-10-25T15:00:00Z',
    updated_at: '2026-11-21T16:30:00Z',
    replies: [
      {
        id: 'r-scripting-1',
        author: ADMIN,
        content: '"Scripting and the Assumption Lab write the program. SATS compiles and runs it." — I\'m saving this. That is the exact neurological relationship between daytime prefrontal rehearsal and nighttime theta encoding.',
        upvotes: 29,
        created_at: '2026-10-25T16:30:00Z',
      },
      {
        id: 'r-scripting-2',
        author: M1,
        content: 'Yes!! Doing one Assumption Lab during lunch break gives my mind a clear identity script for the rest of the workday, and then SATS at night feels 10x clearer because the decision is already made.',
        upvotes: 19,
        created_at: '2026-11-21T16:30:00Z',
      },
    ],
  },
]

export const COMMUNITY_CATEGORIES: { id: PostCategory; label: string; description: string }[] = [
  { id: 'general',             label: 'General',             description: 'Open discussion, platform updates, and cross-track synthesis' },
  { id: 'sats_wins',           label: 'Wins & Breakthroughs', description: 'Share your SATS manifestations, classroom shifts, and leadership wins' },
  { id: 'questions',           label: 'Questions',           description: 'Ask the community anything about the techniques and protocols' },
  { id: 'bridge_of_incidents', label: 'Bridge of Incidents', description: 'Synchronicities, Assumption Lab results, and 3D reality shifting' },
  { id: 'accountability',      label: 'Accountability',      description: '30-Day challenges, streaks, and consistent daily practice' },
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
    last_message: 'Welcome to Vibe Hyr — if you have questions about the practice or the new Assumption Labs, drop them in the community forum. We read everything.',
    last_message_at: '2026-11-20T10:05:00Z',
    unread: false,
  },
]
