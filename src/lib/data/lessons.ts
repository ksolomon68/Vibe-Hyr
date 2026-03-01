import type { Lesson, Quiz } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// COURSE 1 — Programming the Gatekeeper
// ─────────────────────────────────────────────────────────────────────────────
export const COURSE_01_LESSONS: Lesson[] = [
  {
    id: 'c01-l01',
    course_id: 'course-01',
    order_index: 1,
    title: 'The 11 Million Bit Problem',
    description: 'Your brain is drowning in data every second. Understand why it filters almost everything out — and who controls the filter.',
    video_url: null,
    duration_seconds: 720,
    is_preview: true,
    content_md: `## The 11 Million Bit Problem

Your brain receives **11 million bits of information per second** from your environment — through your eyes, ears, skin, nose, and internal body signals.

Your conscious mind processes approximately **50 bits per second**.

That gap — 11,000,000 vs 50 — is not a bug. It's the most important feature of your nervous system. Without it, you would be completely overwhelmed by raw sensory data and unable to function.

Something has to decide what makes it through to your conscious awareness. That something is the **Reticular Activating System (RAS)**.

### What is the RAS?

The Reticular Activating System is a network of neurons in your brainstem that acts as your brain's primary gatekeeper. It regulates:

- **Wakefulness and sleep** — it controls arousal
- **Attention** — it decides what you consciously notice
- **Priority filtering** — it elevates information that matches your current goals, fears, and identity

The RAS doesn't think. It doesn't judge. It simply executes the **filtering instructions** it has been given — by you, mostly unconsciously, over years of habitual thought.

### The Consequences

If your RAS is programmed to filter for *lack*, it will find lack everywhere. If it's programmed to filter for *opportunity*, you'll notice opportunities in the same environment others walk past completely blind to.

This is not metaphor. This is neuroscience.

> "The RAS is the physical mechanism by which the Law of Assumption operates in the brain." — David Bayer

### Your First Instruction

Before this module ends, write down one thing you genuinely want in your life. Not what you think is realistic — what you *actually* want.

That desire is the first filtering instruction we're going to install.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c01-l02',
    course_id: 'course-01',
    order_index: 2,
    title: 'The Car Model Phenomenon',
    description: 'Why you suddenly see your desired car everywhere after deciding to buy it — and how to weaponize this effect for every goal.',
    video_url: null,
    duration_seconds: 840,
    is_preview: true,
    content_md: `## The Car Model Phenomenon

You decide to buy a red Tesla Model 3. You've never particularly noticed them before.

Within 48 hours, you see red Tesla Model 3s *everywhere*. On your commute. In parking lots. In TV ads. In your neighbor's driveway that you've walked past 500 times.

Did the number of red Teslas in your city suddenly increase? Of course not.

**Your RAS updated its filtering instructions.**

### How It Works

The moment you made the decision — the moment you committed emotionally to wanting that specific car — your RAS received a new priority instruction: *flag this stimulus as important*.

Before the decision: red Tesla Model 3 data = noise. Filtered out.
After the decision: red Tesla Model 3 data = signal. Elevated to consciousness.

The world didn't change. Your filter did.

### The Goal Programming Parallel

Every goal, desire, or identity statement you hold with genuine emotional conviction does the same thing to your RAS. It reprograms the filter to notice:

- **Opportunities** that match your desired outcome
- **People** who can help you get there
- **Information** relevant to your goal
- **Coincidences** that weren't really coincidences

This is why two people can be in the same room at the same event and one walks away with three new business contacts and one walks away with nothing. Their RAS filters are set differently.

### Setting Your Filters Deliberately

The filter update requires three components working together:

1. **Clarity** — the RAS needs a specific target, not a vague wish
2. **Emotion** — neutral thoughts don't update the filter; feeling does
3. **Repetition** — a single thought fades; consistent repetition myelinates the pathway

We'll build each of these systematically across this course.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c01-l03',
    course_id: 'course-01',
    order_index: 3,
    title: 'Beta, Alpha, Theta — Your Three Operating Modes',
    description: "Your brain runs on different frequencies. Each one has a different relationship with your beliefs — and one is the master key to the subconscious.",
    video_url: null,
    duration_seconds: 960,
    is_preview: false,
    content_md: `## Beta, Alpha, Theta — Your Three Operating Modes

Your brain is an electrical organ. Neurons communicate through electrical impulses that fire in rhythmic patterns — **brainwaves** — measured in cycles per second (Hz).

The frequency your brain is running on determines which parts of your mind are accessible, and crucially, **whether new beliefs can be installed or rejected**.

### Beta (13–30 Hz) — The Analytical State

This is your default waking state. Right now, as you read this, you're likely in Beta.

**Characteristics:**
- Logical thinking and problem-solving
- Critical analysis and skepticism
- The "bouncer" is fully awake

The bouncer is your **critical factor** — the part of your conscious mind that evaluates new information against your existing belief system. In Beta, the critical factor rejects any belief that contradicts what you already know to be true.

This is why willpower and positive thinking alone almost never change deep programs. You're trying to install new software while the security system is running at full power.

### Alpha (8–12 Hz) — The Relaxed Bridge

Alpha occurs during relaxed, calm waking states — a walk in nature, light meditation, the moment after you laugh. The critical factor softens but doesn't fully disengage.

This is an excellent state for learning and absorbing information (hence why this course is designed to be consumed in a relaxed state).

### Theta (4–7 Hz) — The Direct Line

Theta is where everything changes.

Theta occurs naturally in two windows:
1. **Hypnagogic state** — the 5–10 minutes as you drift from wakefulness into sleep
2. **Hypnopompic state** — the brief window as you surface from sleep into waking

In Theta, the critical factor goes offline. The subconscious is fully exposed and **cannot distinguish between imagination and reality**.

Brain scans in Theta show that imagining an action and physically performing it activate **identical neural regions**.

This is the operating principle behind SATS — the technique we'll master in Course 3.

### Your Practice This Week

Each morning and evening, for just 5 minutes, enter a relaxed state (eyes closed, slow breathing) and hold your desired outcome in mind with genuine feeling. You're practicing the Alpha entry point — the first step toward the Theta gateway.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c01-l04',
    course_id: 'course-01',
    order_index: 4,
    title: 'Installing New Filtering Instructions',
    description: 'The three-part protocol for deliberately reprogramming your RAS — clarity, emotion, and repetition working in sequence.',
    video_url: null,
    duration_seconds: 900,
    is_preview: false,
    content_md: `## Installing New Filtering Instructions

Now that you understand *what* the RAS is and *why* it matters, we're going to build the deliberate reprogramming protocol.

There are three required components. All three must be present for the installation to take hold.

---

### Component 1: Specificity

The RAS is a pattern-matching system. It needs a precise target.

"I want more money" gives the RAS nothing to work with.
"I receive an unexpected deposit of $10,000 that creates complete financial freedom" gives it a specific sensory signature to search for.

**Exercise:** Write your desired outcome in one precise sentence. Include what you'd see, hear, or feel in the moment it arrives.

---

### Component 2: Emotional Charge

Emotion is the language the subconscious understands. Thoughts without feeling produce no filter update.

This is why vision boards without feeling don't work. Looking at images while feeling neutral — or worse, while feeling the gap between where you are and where you want to be — actually reinforces the current state.

The emotion required is the **feeling of the wish fulfilled** — not hope, not wanting, not longing. The settled feeling of someone who *already has* what they desire.

This sounds difficult. It becomes natural with practice.

---

### Component 3: Repetition + Myelination

A single thought — no matter how emotional — fades. Repetition is what converts a fleeting thought into a neural highway.

**Myelination** is the biological process by which repeated neural firing causes the myelin sheath (an insulating layer) to form around the nerve pathway. Myelinated pathways transmit signals up to **100x faster** than unmyelinated ones.

A myelinated belief doesn't require effort to hold. It becomes automatic — the new default filter.

Research suggests approximately **21 days of consistent repetition** begins meaningful myelination of new pathways. This is not a magic number but a practical guide.

---

### The Full Protocol

1. **Morning (2 min):** In Alpha state, hold your specific desire with the feeling of fulfillment for 2 minutes. No effort, no forcing — just resting in the feeling.

2. **Evening (5 min):** At the edge of sleep (Theta entry), run your desired scene. We cover this fully in Course 3.

3. **Throughout the day:** Each time you catch a contradictory thought (lack, doubt, old story), label it: *"old program"* — then redirect to the new filter.

This is the beginning of the Mental Diet. We'll master this in Course 4.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c01-l05',
    course_id: 'course-01',
    order_index: 5,
    title: 'Module Quiz & Your RAS Assignment',
    description: 'Test your understanding of the RAS framework and receive your 7-day reprogramming assignment.',
    video_url: null,
    duration_seconds: 300,
    is_preview: false,
    content_md: `## Module Quiz & Your RAS Assignment

You've completed Course 1. Before moving forward, complete the knowledge check below.

### Your 7-Day RAS Assignment

For the next 7 days, run this protocol:

**Morning (upon waking, before phone):**
- 2 minutes, eyes closed
- Hold your specific desired outcome
- Generate the *feeling* of having it now — settled, grateful, natural

**Evening (at the edge of sleep):**
- In the drowsy Theta state
- Run a short scene implying your desire is fulfilled
- Loop it until you drift off

**Throughout the day:**
- Each time you catch a contradictory thought, say internally: *"Old program."*
- Redirect to your desired filter

**Track it:** Note in your Revision Journal each evening what you noticed that day that you might have filtered out before. New opportunities? New conversations? Unexpected coincidences?

The RAS is already reprogramming. The question is whether you're doing it deliberately or by default.

---

After completing the quiz, you've unlocked **Course 2: Mastery of the Law of Assumption** (Architect tier).`,
    created_at: new Date().toISOString(),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// COURSE 2 — Mastery of the Law of Assumption
// ─────────────────────────────────────────────────────────────────────────────
export const COURSE_02_LESSONS: Lesson[] = [
  {
    id: 'c02-l01', course_id: 'course-02', order_index: 1,
    title: 'The Law vs. The Law of Attraction',
    description: "The critical distinction that changes everything — you're not attracting from outside, you're selecting from within.",
    video_url: null, duration_seconds: 840, is_preview: false,
    content_md: `## The Law vs. The Law of Attraction

The distinction between these two frameworks seems subtle. Its implications are total.

### The Law of Attraction (The Popular Version)

The LOA as typically taught says: *think positive thoughts, raise your vibration, and the universe will send you matching things.*

This positions you as a **receiver** — something out there must be attracted to you, dispatched by some cosmic order-fulfillment system.

Problems with this model:
- Creates a sense of waiting and hoping
- The "gap" between you and your desire is constantly reinforced
- Positive thinking without assumption change rarely produces lasting results

### The Law of Assumption (Neville's Teaching)

Neville Goddard's framework says something fundamentally different: **all possible realities already exist.** You are not attracting anything. You are *selecting* a specific state of consciousness and allowing it to project into the physical world.

"Creation is finished. Your consciousness is the only reality." — Neville Goddard

This positions you as the **operant power** — not a receiver, but the source.

### The Practical Difference

LOA: "I'm sending out positive energy to attract a new job."
→ Implication: The job is out there, somewhere, and you're hoping it comes to you.

Law of Assumption: "I am a person who has the perfect job. I think, feel, and move from that identity."
→ Implication: The job already exists in the state you've inhabited. The physical world will rearrange to reflect it.

One keeps the desire at arm's length. The other **collapses the distance entirely**.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c02-l02', course_id: 'course-02', order_index: 2,
    title: 'Thinking Of vs. Thinking From',
    description: 'The single most important shift in manifestation practice — and how to make it in any moment.',
    video_url: null, duration_seconds: 900, is_preview: false,
    content_md: `## Thinking Of vs. Thinking From

This is the core technique of the Law of Assumption, and it requires only one shift — but it is total.

### Thinking Of Your Desire

When you *think of* something you want, you are observing it from the outside. The desire is *over there*. You are *here*. There is a gap.

Every moment you spend thinking *of* your desire reinforces the assumption that you don't have it. Your subconscious receives the instruction: **this thing is separate from me.**

This is why desire-focused visualization often backfires. You're impressing the subconscious with the feeling of wanting — which perpetuates wanting.

### Thinking From Your Desire

When you *think from* a state, you inhabit it. You are inside the reality in which your desire is fulfilled, looking outward at the world through those eyes.

- **Thinking of** a promotion: imagining getting the call, feeling the relief and excitement
- **Thinking from** the promotion: thinking about what you'll focus on in your new role, what you'll wear on the first day, what you'll say to your team

The internal conversation changes completely.

### How to Make the Shift Right Now

Take your desired outcome. Ask yourself: *If this were already true, what would I be thinking about?*

Not *about* the desire itself — what would you be thinking about **instead**, now that it's done?

A person who has money doesn't think about getting money. They think about what to do with it, how to invest it, what experiences to create.

**That** is the thought stream to inhabit. Anything less is thinking *of*.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c02-l03', course_id: 'course-02', order_index: 3,
    title: 'Living in the End',
    description: "Neville's most powerful instruction — what it actually means to inhabit the fulfilled state, and the common mistakes that prevent it.",
    video_url: null, duration_seconds: 960, is_preview: false,
    content_md: `## Living in the End

"Go to the end. Dwell there. Move mentally from where you are to where you want to be." — Neville Goddard

"Living in the End" is the practical application of thinking *from*. It is the art of mentally and emotionally inhabiting the final scene — the state after the desire has been fulfilled — as your operating reality.

### What "The End" Actually Means

The end is not the moment of getting. It's not the phone call, the notification, the arrival.

The end is the **settled, ordinary feeling of a life in which this thing is already true.**

The end of financial freedom is not the moment you see the bank balance. It's Tuesday morning, making coffee, feeling the quiet certainty that money is not a problem.

The end of a relationship is not the first date. It's the inside joke you share six months in, the feeling of being completely known.

This is what you're inhabiting.

### The Three Common Mistakes

**1. Inhabiting the receiving moment instead of the settled state.**
The excitement of getting is a transition emotion — it implies you didn't have it before. Instead inhabit the state *after* the newness has worn off and it's simply your life.

**2. Checking the 3D world for confirmation.**
Living in the end means you no longer need external evidence to confirm the inner reality. Checking for signs is evidence that you haven't fully assumed the state.

**3. Treating it as a practice instead of a way of being.**
Living in the end isn't a 10-minute meditation. It's a sustained background hum of inner knowing that colors everything — your posture, your speech, your decisions.

### Today's Practice

Choose one area of your life. Write 5 sentences beginning with "Now that I have ___..." that describe your daily thoughts and feelings from within the fulfilled state.

Notice how different these thoughts feel from thoughts *about* the desire.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c02-l04', course_id: 'course-02', order_index: 4,
    title: 'The Bridge of Incidents',
    description: 'The inevitable chain of events that moves your assumption into physical reality — and why you must never try to control it.',
    video_url: null, duration_seconds: 840, is_preview: false,
    content_md: `## The Bridge of Incidents

Once a genuine assumption is planted in the subconscious, the physical world begins to rearrange. The pathway from inner assumption to outer reality is what Neville called the **Bridge of Incidents** — a chain of events, people, and circumstances that unfolds with uncanny precision.

### What the Bridge Looks Like

The bridge rarely looks the way you expect.

A woman assumes she has her dream job. Within a week, she's unexpectedly let go from her current role — terrifying. But that termination frees up the exact time window needed to interview for the opportunity that leads to the job she assumed. The bridge looked like disaster at first.

A man assumes financial abundance. He receives an unexpected bill — infuriating. But paying it introduces him to a financial advisor who restructures his entire portfolio and triples his returns. The bridge looked like loss at first.

> "The bridge of incidents often appears like failure on the way to success." — Neville Goddard

### The Critical Rule: Don't Touch the Bridge

Your job is to **hold the assumption**. The subconscious's job is to build the bridge.

The moment you start trying to figure out *how* it's going to happen — strategizing, micromanaging, forcing outcomes — you step off the bridge and back into the 3D echo state.

This is not passivity. You take every inspired action that presents itself. You simply do not try to *engineer* the path.

### Recognizing Your Bridge

When unexpected things happen — good or confusing — ask: *Is this part of my bridge?*

Don't answer with logic. Answer with feeling. If there's an inner pull toward an action, follow it. If something feels forced, leave it.

The subconscious is smarter than your conscious strategies. Trust the construction.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c02-l05', course_id: 'course-02', order_index: 5,
    title: 'The Feeling Is the Secret',
    description: "Why emotion is the operative force — not visualization, not words, not logic — and how to generate genuine feeling on demand.",
    video_url: null, duration_seconds: 780, is_preview: false,
    content_md: `## The Feeling Is the Secret

*"The feeling of the wish fulfilled is the father of the thought."* — Neville Goddard, The Feeling Is the Secret

You can visualize for hours. You can repeat affirmations until your voice gives out. You can write your goals a thousand times. None of it will produce lasting change without the one operative element: **genuine feeling**.

### Why Feeling Is Primary

The subconscious does not respond to words. It responds to the emotional signature those words generate.

An affirmation stated with anxiety ("I am wealthy" spoken through a background hum of financial fear) impresses the anxiety — not the affirmation. The subconscious reads the *feeling*, not the *statement*.

This is why hollow positivity doesn't work. You can't fool your own subconscious.

### What Feeling Is Not

Feeling is not excitement, hoping, or wishing. These emotions all carry an implied absence. "I'm so excited to be wealthy someday" — *someday* is the operative instruction.

The feeling required is the **satisfied contentment** of someone for whom this is already true and ordinary. Not exhilaration. Settled knowing.

### How to Generate Genuine Feeling

Three methods that work:

**1. The Memory Bridge:** Recall a time when you felt completely satisfied, at peace, or certain. Hold that exact feeling — then introduce your desired state into it. Let the feeling *carry* the desire.

**2. Sensory Saturation:** Build the internal scene with every sense engaged — what you see, hear, smell, touch. Sensory specificity triggers authentic emotional response.

**3. Gratitude Anchoring:** Enter genuine gratitude for something you already have. From that open, receiving emotional state, extend gratitude to include your desired state as if already present.

Practice one of these today. Notice the difference between feeling *about* a desire and feeling *from* fulfillment.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c02-l06', course_id: 'course-02', order_index: 6,
    title: 'The Echo Theory — Understanding the Delay',
    description: "Why nothing seems to change immediately after you shift your assumption — and what's actually happening beneath the surface.",
    video_url: null, duration_seconds: 720, is_preview: false,
    content_md: `## The Echo Theory — Understanding the Delay

You've shifted your inner state. You're living in the end. You feel different. You're thinking from the new identity.

And your external reality looks completely identical.

This is the point where most people quit. And it's precisely the wrong moment to stop.

### What the Echo Theory Explains

Your current 3D reality is not a real-time reflection of your consciousness. It is an **echo** — a projection of your past assumptions, typically running 60–90 days behind your internal state.

Think of it like this: you turn on a new radio station inside yourself. But the room is still full of the sound of the old station. Not because the new station isn't transmitting — but because sound takes time to travel and old sound takes time to dissipate.

The old echo is not evidence that your new assumption isn't working. It's evidence that it was once true that you held the old assumption.

### The Critical Window

The 30–90 day period after a genuine assumption shift is the most important — and most dangerous — window.

It's dangerous because the 3D echo provides constant "evidence" that nothing is changing. Every old circumstance, every lingering result from the old state, whispers: *See? It doesn't work.*

This is the critical factor trying to reassert itself. This is where the mental diet and revision become essential tools.

The assumption that survives this window — that persists despite the echo — will objectify. Without exception.

### Your Instruction

Do not evaluate your practice by what you see. Evaluate it by what you *feel inside*.

Are you genuinely thinking from the new state more than the old? That is the only measure that matters during the delay. The external world is just catching up.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c02-l07', course_id: 'course-02', order_index: 7,
    title: 'Module Quiz & Assumption Assignment',
    description: 'Solidify your understanding of the Law of Assumption and receive your core practice for the next 30 days.',
    video_url: null, duration_seconds: 300, is_preview: false,
    content_md: `## Module Quiz & Assumption Assignment

### Your 30-Day Assumption Assignment

Choose one area of your life for your primary assumption over the next 30 days.

**Write it as a present-tense identity statement:**
*"I am a person who ___."*

Then complete these three exercises daily:

**Morning (3 min):**
Enter Alpha state. Think *from* the identity — what would you naturally be thinking about this morning if this were simply your life?

**Throughout the day:**
Catch moments of thinking *of* the desire (the gap feeling). Shift immediately to thinking *from* the fulfilled state. What ordinary thought would a person with this thing be having right now?

**Evening (SATS — covered in full in Course 3):**
At the edge of sleep, run a short scene that implies fulfillment. Loop it.

**In your Revision Journal tonight:**
Write about one moment today where you genuinely inhabited the assumed state — even for a minute. What did it feel like? What thoughts came naturally from that place?

The subconscious is being impressed. Persistently, deliberately, consistently — for 30 days. Then watch what echoes back.`,
    created_at: new Date().toISOString(),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// COURSE 3 — Subconscious Reprogramming via SATS
// ─────────────────────────────────────────────────────────────────────────────
export const COURSE_03_LESSONS: Lesson[] = [
  {
    id: 'c03-l01', course_id: 'course-03', order_index: 1,
    title: 'What Is SATS — and Why It Works',
    description: "The science and mysticism behind the hypnagogic state — the most direct access point to the subconscious mind ever identified.",
    video_url: null, duration_seconds: 840, is_preview: false,
    content_md: `## What Is SATS — and Why It Works

SATS stands for **State Akin to Sleep** — Neville Goddard's term for the hypnagogic threshold, the 5–10 minute window between full wakefulness and sleep.

In this state, everything changes.

### The Neuroscience of the SATS Window

As you drift toward sleep, your brainwaves descend from Beta (active, critical) through Alpha (relaxed) into Theta (4–7 Hz). In Theta:

- The **critical factor** goes offline — the part of your conscious mind that evaluates and rejects new information based on existing beliefs
- The **subconscious is fully exposed** and cannot distinguish between imagined experience and real experience
- Brain scans show identical neural activation for imagined and real events

This is not the same as daytime visualization. During the day, your Beta-state critical factor is constantly present, evaluating and filtering what you're imagining. It undermines the impression.

In SATS, that filter is gone. The subconscious receives the imaginal scene **as if it were a real memory**.

### Neville's Original Teaching

"As you enter the state akin to sleep — a state of drowsiness — the critical area of the mind is submerged, and then suggestions and impressions are accepted literally as fact." — Neville Goddard

He practiced this every night of his life. His students who saw the most dramatic results were those who used it consistently.

### The Window Is Brief

The hypnagogic window is approximately **5–10 minutes** after you lie down in darkness, when you feel genuinely drowsy. Not tired-but-scrolling. Not sleepless anxiety. The natural drift toward sleep.

Miss this window, and you'll either be too awake (critical factor active) or asleep (no conscious direction). This is why Course 3 exists — to teach you to catch the window and use it with precision.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c03-l02', course_id: 'course-03', order_index: 2,
    title: 'Constructing Your SATS Scene',
    description: 'The exact specifications for a scene that works — first-person, implied, short, looped. Why each element matters.',
    video_url: null, duration_seconds: 960, is_preview: false,
    content_md: `## Constructing Your SATS Scene

The scene is the vehicle. These specifications are not arbitrary — each one serves a precise function in the subconscious impression process.

### Specification 1: First-Person Perspective

You must be *inside* the scene, looking out through your own eyes. Not watching yourself like a movie.

Why: The subconscious imprints experiences, not observations. Watching yourself receive congratulations is an observer experience. *Hearing* congratulations directed at you while feeling the warmth of it is a subject experience. Only the latter impresses as real.

**Test:** In your scene, can you feel the texture of what you're touching? Can you hear sounds directed at you? If not, you're still watching from outside.

### Specification 2: Implied Fulfillment

The scene does not need to show the entire desire — it only needs to *imply* it is true.

The most powerful scenes are short moments that could only exist if your desire had already manifested. A colleague saying "Congratulations!" A bank notification on your phone. A key in a front door that's yours.

Avoid scenes that show the *process* of getting — those imply a journey, which implies a current lack.

### Specification 3: 5–10 Seconds Long

The brain in Theta cannot process complex narratives. Attempting a long, elaborate scene in SATS results in Beta activation — you think your way out of the state.

Your scene should be a *single moment*, vividly felt, that loops continuously. Think of it as a short film clip, not a full movie.

### Specification 4: The Loop

Once the scene is constructed, you simply run it on repeat with full sensory engagement until you fall asleep. The looping is the impression mechanism — not unlike a myelination protocol for the subconscious.

You don't think about the scene. You *live* the scene, over and over, until consciousness dissolves into sleep.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c03-l03', course_id: 'course-03', order_index: 3,
    title: 'The 7-Night Integration Ritual',
    description: "The complete week-long protocol for building a layered subconscious foundation across 7 domains of your life.",
    video_url: null, duration_seconds: 1020, is_preview: false,
    content_md: `## The 7-Night Integration Ritual

Rather than using SATS for a single desire every night, this protocol works *across* your life — building a layered subconscious foundation that supports everything.

Each night targets a different core emotional state. By the end of 7 nights, your subconscious has received impressions of fulfillment across the full spectrum of human desire.

---

### Night 1 — Security
**Scene:** Someone you trust places their hand on your shoulder and says, "You're safe now. You're completely taken care of."
**Target emotion:** Peace. Relief. The deep exhale of someone who is protected.

---

### Night 2 — Receiving
**Scene:** An unexpected gift is placed in your hands. You feel its weight. Someone says: "This is for you. No strings."
**Target emotion:** Genuine surprise. Gratitude. The warmth of being given to.

---

### Night 3 — Achievement
**Scene:** Someone whose respect you value says: "You did it. I always knew you would."
**Target emotion:** Pride. Quiet confidence. The satisfaction of completion.

---

### Night 4 — Prosperity
**Scene:** You check your phone and see a large deposit notification — a number that produces complete financial ease.
**Target emotion:** Abundance. Awe. The total absence of money anxiety.

---

### Night 5 — Love
**Scene:** Someone holds you and says with total conviction: "I love you. I choose you. You are it for me."
**Target emotion:** Deep connection. Being fully known and wanted.

---

### Night 6 — Radiance
**Scene:** You catch your own reflection and genuinely like what you see. Something glows from inside.
**Target emotion:** Self-acceptance. Beauty. Personal power.

---

### Night 7 — Destiny
**Scene:** You step through a doorway into a space that feels entirely yours — built for the person you were always meant to be.
**Target emotion:** Surrender. Purpose. The rightness of arriving.

---

Run this cycle, then repeat. Each iteration deepens the impression.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c03-l04', course_id: 'course-03', order_index: 4,
    title: 'Myelination — The 21-Day Science',
    description: 'Why consistency over 21 days creates permanent neural change — and how to structure your practice for maximum biological impact.',
    video_url: null, duration_seconds: 780, is_preview: false,
    content_md: `## Myelination — The 21-Day Science

Every time you run your SATS scene, a specific set of neurons fires in a specific sequence. Repetition of this sequence triggers a biological process called **myelination**.

### What Is Myelination?

Myelin is a fatty insulating sheath that forms around nerve axons — the "wires" of your neural network. When a neural pathway is used repeatedly, glial cells (oligodendrocytes) begin wrapping that pathway in myelin.

The effect is dramatic:
- Unmyelinated pathways transmit signals at approximately 1 m/s
- Myelinated pathways transmit at up to 120 m/s — a 120x increase

A myelinated belief doesn't require effort to hold. It becomes the **default** — the path of least resistance for thought. What was once effortful ("I am abundant") becomes automatic background assumption.

### The 21-Day Threshold

Neuroscientific research indicates that consistent repetition of a new behavior or thought pattern over approximately 21 days produces measurable structural changes in the relevant neural pathways.

This is not a magic number. Some pathways myelinate faster (simpler, more emotionally charged content). Some take longer (complex identity shifts against strong existing programs).

The 21-day guideline is your minimum commitment, not your ceiling.

### Why SATS Accelerates Myelination

Standard repetition during the day (Beta state) competes with the critical factor and existing contrary programs. Progress is slower.

SATS delivers impressions during Theta — directly to the subconscious, without interference. The neural activation is identical to real experience. The myelination process treats it as such.

This is why consistent nightly SATS practice can produce identity shifts in weeks that might otherwise take years of conscious effort.

### Your Commitment

21 nights. Same time. Same ritual. Begin tonight.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c03-l05', course_id: 'course-03', order_index: 5,
    title: 'Common SATS Mistakes & How to Fix Them',
    description: "The 7 most frequent failure points in SATS practice — why they happen and exactly how to correct each one.",
    video_url: null, duration_seconds: 900, is_preview: false,
    content_md: `## Common SATS Mistakes & How to Fix Them

### Mistake 1: Missing the Window
**What happens:** You practice SATS while too awake (Beta active) or fall asleep too fast (no conscious direction).
**Fix:** Use complete darkness, lie on your back (slows sleep onset), put your phone away 20 minutes before. The window is the 5-10 minutes of genuine drowsiness.

### Mistake 2: The Scene Is Too Long
**What happens:** Complex scenes require cognitive effort, activating Beta and pulling you out of Theta.
**Fix:** Reduce your scene to one 5–10 second moment. If you're "thinking about" your scene instead of feeling it, it's too complex.

### Mistake 3: Observer Perspective
**What happens:** You watch yourself in the scene like a movie — "I can see myself getting the call." This is an observer experience, not a subject experience.
**Fix:** Close your eyes and feel what you would feel *from inside* the moment. What are you touching? What sounds are coming toward you?

### Mistake 4: Using a Scene That Shows the Process
**What happens:** "I see myself working toward my goal" — this implies a journey, which implies current lack.
**Fix:** Jump to *after* the journey. The scene is the already-arrived moment, not the path.

### Mistake 5: Desperate Feeling
**What happens:** The emotional tone of the scene is one of *wanting* or *relief from suffering*, which impresses need, not fulfillment.
**Fix:** Generate the settled, ordinary feeling of someone for whom this is just Tuesday. Not euphoric — calm and natural.

### Mistake 6: Inconsistency
**What happens:** 3 nights on, 2 nights off, back to 2 nights — the myelination process resets.
**Fix:** Treat SATS as non-negotiable as brushing your teeth. 5 minutes. Every night. No exceptions for 21 days.

### Mistake 7: Evaluating While Practicing
**What happens:** Mid-scene, you think "Is this working? Nothing's changed."
**Fix:** Label the evaluating thought as Beta-state interruption. Return immediately to the scene without engaging the thought.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c03-l06', course_id: 'course-03', order_index: 6,
    title: 'SATS for Specific Desires',
    description: 'How to customize your SATS scene for relationships, money, career, health, and creative work — with example scenes for each.',
    video_url: null, duration_seconds: 840, is_preview: false,
    content_md: `## SATS for Specific Desires

### Relationships

**Principle:** The scene implies mutual connection, not your desire for the other person.

**Example scene:** You're sitting together in comfortable silence. They reach over and take your hand. That's it. 5 seconds. Loop.

**What to avoid:** Any scene where you're looking at the person hoping they'll respond — that implies distance, not union.

---

### Finances & Career

**Principle:** The scene implies the *lifestyle* of the fulfilled state, not the transaction.

**Example scene:** You open your banking app and see a number that means complete freedom. Your chest releases. That feeling — 5 seconds. Loop.

**Alternative:** Your phone rings. You see the name. You answer. You hear: "Congratulations, you got it." 5 seconds. Loop.

---

### Health & Body

**Principle:** The scene implies ease and vitality in your body, not the absence of the current condition.

**Example scene:** You're moving through your day with lightness you haven't felt in years. Someone comments, "You look amazing — what are you doing differently?" 5 seconds. Loop.

---

### Creative Work

**Principle:** The scene implies your work is received and celebrated, not that you're creating it.

**Example scene:** You hold the finished product in your hands. You read a review or a message from someone it changed. Their words. 5 seconds. Loop.

---

### Multiple Desires

You can rotate different scenes across different nights. Many practitioners find the 7-Night Ritual (covered in Lesson 3) is ideal for this — it covers the full spectrum without narrowing focus to one domain.

The subconscious has no limitation on how much it can receive. Be generous.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c03-l07', course_id: 'course-03', order_index: 7,
    title: 'The Chemical Cement — Dopamine, Serotonin & the Impression Process',
    description: "Why positive emotion during SATS isn't just feel-good advice — it's the neurochemical mechanism that makes impressions permanent.",
    video_url: null, duration_seconds: 720, is_preview: false,
    content_md: `## The Chemical Cement

The emotions you generate during SATS don't just make the experience more pleasant. They trigger a cascade of neurochemicals that **chemically cement** new neural pathways.

### Dopamine — The Encoding Molecule

Dopamine is released in the brain's reward circuit when you anticipate or experience something good. In Theta state, the brain cannot distinguish imagined reward from real reward — dopamine is released in response to your scene.

Dopamine's role in memory and learning: it signals to the hippocampus to encode the current experience as important and worth retaining. Experiences accompanied by dopamine are remembered more vividly and influence future behavior more strongly.

Conclusion: a SATS scene felt with genuine positive emotion is dopamine-encoded — treated by the brain as a significant real experience worth building behavior around.

### Serotonin — The Certainty Signal

Serotonin is associated with feelings of security, sufficiency, and social confidence. The "settled knowing" feeling described throughout this course — the emotion of someone for whom the desire is simply true — is a serotonin state.

Running your SATS scene from this emotional tone triggers serotonin release, which your brain then associates with the neural pattern of the desired state. Over time, that neural pattern (your new assumption) begins to carry the biological marker of certainty.

### The Cortisol Block

Conversely: fear, anxiety, and doubt during visualization trigger cortisol release. Cortisol actively suppresses hippocampal neuroplasticity — the biological process that would allow new beliefs to form.

This is why a desperate SATS practice doesn't work. The fear-based emotional tone creates a chemical environment that prevents the very change you're seeking.

**Ease, warmth, and settled certainty** are not optional extras. They are the biological prerequisites for the impression to take hold.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c03-l08', course_id: 'course-03', order_index: 8,
    title: 'Module Quiz & Your 21-Night SATS Commitment',
    description: 'Assess your SATS mastery and formalize your 21-night practice commitment.',
    video_url: null, duration_seconds: 300, is_preview: false,
    content_md: `## Your 21-Night SATS Commitment

You now have everything you need to run a professional-grade SATS practice.

**Your commitment:** 21 consecutive nights. Non-negotiable.

### The Protocol (Summary)

1. **Complete darkness.** Phone away 20 minutes before.
2. **Lie on your back** to slow sleep onset.
3. **Wait for genuine drowsiness** — the natural drift, not forced tiredness.
4. **Run your scene:** First-person. Implied fulfillment. 5–10 seconds. Sensory detail.
5. **Loop** until you fall asleep within the scene.
6. **Note in your Revision Journal** each morning: any dreams, any unexpected events, any shifts in how you feel.

### Tracking Your 21 Days

Use the streak tracker in your dashboard. Missing a night resets the counter — this creates healthy accountability, not punishment. The subconscious impression process benefits from unbroken consistency.

### What to Expect

**Days 1–7:** Settling in. The practice may feel awkward or mechanical. This is normal.

**Days 8–14:** The scene becomes more vivid and emotionally natural. Some practitioners notice unexpected opportunities or "coincidences" beginning.

**Days 15–21:** The assumed state begins to feel ordinary inside — the natural resting point of inner conversation. External echoes begin shifting.

**Day 22+:** Continue indefinitely. You have built a myelinated pathway. Maintaining it requires only occasional reinforcement — like maintaining a physical fitness baseline.

Complete the quiz below, then begin tonight.`,
    created_at: new Date().toISOString(),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// COURSE 4 — Navigating the Echo Theory Delay
// ─────────────────────────────────────────────────────────────────────────────
export const COURSE_04_LESSONS: Lesson[] = [
  {
    id: 'c04-l01', course_id: 'course-04', order_index: 1,
    title: 'The Mental Diet — What It Actually Means',
    description: "Neville's most demanding instruction — and the one most practitioners underestimate until they implement it fully.",
    video_url: null, duration_seconds: 900, is_preview: false,
    content_md: `## The Mental Diet

"Man's chief delusion is his conviction that there are causes other than his own state of consciousness." — Neville Goddard

The Mental Diet is the practice of monitoring and controlling your inner conversation throughout every waking hour — not just during formal practice sessions.

### Why Inner Conversation Is Primary

Your subconscious is not reacting to the world. It is reacting to your *memory* of the world — filtered through the inner dialogue you maintain about it.

Every sentence of your ongoing inner monologue is a subconscious instruction:

- "I'm always broke" → instruction to the RAS: filter for evidence of scarcity
- "People like me don't get these opportunities" → identity program: not that kind of person
- "She never really liked me" → social reality program: confirms isolation

The formal practices (SATS, visualization, journaling) are impressions that run for minutes. Your inner conversation runs for 16 hours a day.

Which has more total impact on your subconscious programming?

### What the Mental Diet Requires

You don't suppress thoughts. You become the **observer** of thoughts — and you exercise the power to redirect.

The moment you catch an old program running:

1. **Label it:** "Old program." Not judgment. Just recognition.
2. **Don't engage:** Engaging (arguing with it, trying to disprove it, feeling guilty about it) gives it energy.
3. **Redirect:** Return to the inner conversation of the assumed state. What would the person who *has* this be thinking right now?

This is a practice, not a performance. You will catch programs late sometimes. That's fine. The moment of catching is the moment of choice.

### The Repetition Score

Every thought you think adds to what practitioners call the "repetition score" — the total reinforcement of either the old program or the new assumption.

The mental diet shifts the score, one redirected thought at a time. By the end of a consistent day, you've cast hundreds of votes for the new reality.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c04-l02', course_id: 'course-04', order_index: 2,
    title: 'The Decision Matrix',
    description: 'A real-time tool for neutralizing limiting beliefs the moment they arise — without suppression, without spiritual bypass.',
    video_url: null, duration_seconds: 840, is_preview: false,
    content_md: `## The Decision Matrix

When a limiting belief surfaces — and it will, throughout the day — you need a rapid-response tool that neutralizes it without turning it into a battle.

The Decision Matrix is a 3-step real-time protocol.

### Step 1: Identify the Program

A limiting belief announces itself through a feeling (contraction, fear, shame, scarcity) or a thought (the habitual story). You've felt these before. You'll recognize them.

Don't try to immediately replace them. First, just name what's happening:

*"This is the 'I'm not good enough' program running."*

Naming creates separation between you and the program. You are not the program. You are the one observing it.

### Step 2: Make the Opposite Decision

Immediately — not eventually — make a decision in favor of the opposite truth.

Not an affirmation. A **decision.** There's a felt difference.

An affirmation says: "I am worthy." (Often said *because* you don't feel it, which the subconscious detects.)

A decision says: "That program is not accurate. I choose the opposite to be true. Done."

The decision doesn't require emotional certainty right now. It requires a committed choice.

### Step 3: Find Evidence

Your RAS will now look for what you ask it to find. Ask it to find evidence of the opposite.

"What is *one piece of evidence* in my current life that the opposite is true?"

There is always evidence. The mental diet requires you to find it rather than defaulting to the evidence for the old story.

Over repetition, Step 3 rewires the RAS to habitually look for supportive evidence — a fundamental identity shift in the filter itself.

### Example

**Program:** "Money is always tight for me."
**Step 1:** *"Old program — scarcity belief running."*
**Step 2:** *"I choose: I am someone who always has enough and more."*
**Step 3:** *"Evidence: I paid every bill this month. I bought coffee today without checking my account. I have food in my fridge."*

Three steps. 30 seconds. Repeat as needed, as many times as needed.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c04-l03', course_id: 'course-04', order_index: 3,
    title: 'Staying Faithful When 3D Contradicts',
    description: 'The hardest skill in manifestation practice — maintaining your inner state when external evidence says the opposite.',
    video_url: null, duration_seconds: 960, is_preview: false,
    content_md: `## Staying Faithful When 3D Contradicts

This is where almost every practitioner stumbles. And it's the most important skill in the entire practice.

### Understanding What "Contradiction" Actually Means

When your external reality contradicts your assumption, it is not evidence that your assumption is wrong. It is the **echo of your previous state** — nothing more.

Your 3D reality has a built-in lag. The circumstances you see today are the physical projection of where your consciousness *was* 60–90 days ago. You have already changed. The echo simply hasn't caught up yet.

A contradicting 3D circumstance is like receiving a bill for something you've already paid. It's not evidence of debt. It's a delayed statement.

### The Dual Reality Technique

This is Neville's most practical instruction for handling contradiction:

You hold two simultaneous awarenesses:
1. **The outer:** I see this circumstance. I acknowledge it as real in the physical world.
2. **The inner:** I know what I have planted. I know what is coming.

You don't deny the outer. You don't rage against it. You simply don't give it the authority to revise your inner state.

*"Yes, this is what I see. And I know what I am."*

### What Faithfulness Looks Like in Practice

Faithfulness is not pretending the challenge isn't there. It is refusing to update your inner assumption based on outer evidence.

Faithfulness sounds like:
- "This is just the echo. My assumption is already hardening."
- "This circumstance belongs to the old state. I have already moved."
- "The bridge may look like this. I trust the construction."

It does not sound like:
- "WHY ISN'T IT WORKING YET" (this is old-state energy)
- "Maybe it won't work for me" (this replants the old assumption)
- "I need to do more SATS to fix this" (desperation)

### The Test

If you can observe a contradicting circumstance with genuine inner peace — not forced positivity, but the real calm of someone who knows — you are in the assumed state.

That peace is the most powerful signal you can send to the subconscious. It says: *this circumstance does not define me. I am the one who defines my reality.*`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c04-l04', course_id: 'course-04', order_index: 4,
    title: 'Advanced Revision — Rewriting the Timeline',
    description: 'How to use the revision technique to neutralize not just today\'s events but years of accumulated emotional charge from the past.',
    video_url: null, duration_seconds: 900, is_preview: false,
    content_md: `## Advanced Revision — Rewriting the Timeline

The nightly Revision Journal you're already using targets recent events. Advanced revision goes deeper — into the past experiences whose emotional charge continues to shape your present assumption.

### How the Past Controls the Present

Your subconscious does not experience time the way your conscious mind does. A humiliation from 15 years ago, if unrevised, carries exactly the same weight today as it did then — because the emotional charge was never neutralized.

Those old experiences are active filtering instructions. The RAS searches for evidence confirming what those past events "proved" — that you're not worthy, that people can't be trusted, that money is dangerous, that your voice doesn't matter.

Revision interrupts this process.

### The Advanced Revision Protocol

**Step 1:** Identify a past event whose memory carries a charge — shame, regret, anger, loss, humiliation. Something that still affects you when you think of it.

**Step 2:** Close your eyes. Return to the scene — not to relive it, but to revise it. See it play out differently. Hear different words. Feel a different outcome.

**Step 3:** Don't just watch the revision. *Feel it as if it actually happened this way.* Let the body-memory update. Emotion is the mechanism of the rewrite.

**Step 4:** Repeat this revision for 3–5 consecutive nights before sleep. Let the new version become the dominant version in the neural record.

### What You're Actually Doing

You're not changing history in the literal sense. You are:

1. **Neutralizing the emotional charge** of the old memory — it loses its power to trigger the old program
2. **Installing a new memory template** that carries different instructions for the RAS
3. **Practicing the emotional state** of the desired reality as if you've always lived it

The subconscious, which cannot distinguish revised imagination from real experience, begins treating the revised version as the actual history.

This is memory reconsolidation — a well-documented neuroscientific process where recalled memories become temporarily malleable and can be updated before re-storage.

### Choose One Tonight

Go to your Revision Journal. Identify one past experience to revise over the next week. Begin tonight.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c04-l05', course_id: 'course-04', order_index: 5,
    title: 'Monitoring Your Inner Speech',
    description: 'Building the observer capacity to catch inner dialogue in real time — the skill that makes every other practice work better.',
    video_url: null, duration_seconds: 780, is_preview: false,
    content_md: `## Monitoring Your Inner Speech

"What are you saying to yourself about yourself, about others, about life — in the space between thoughts?" — the question the Mental Diet answers.

Most people have never listened to their own inner speech with genuine attention. They are so identified with the voice that they don't notice it's running.

### Building the Observer

The observer capacity — the ability to hear your own inner speech as if you were an outside listener — is the foundational skill of the mental diet.

It is developed through practice, not insight.

**Exercise — The Transcription Practice:**

For one full hour today, whenever you remember, transcribe your inner speech as if you were taking dictation. What was the voice just saying?

Write it down without editing. You'll find patterns you didn't know were there.

Common patterns:
- Running commentary on other people (often critical)
- Rehashing past events that went wrong
- Anxious rehearsal of future conversations
- Self-comparison and self-diminishment
- Scarcity narration ("I can't afford that," "This never works out")

### What to Do With What You Find

Don't be alarmed by what you discover. Every practitioner finds the same things. The inner critic is universal.

Your response: recognition, not suppression.

*"The voice just said I don't deserve this. That's the unworthiness program."*

Then: redirect. What would the inner speech of a person who fully inhabits my desired state sound like?

Over days and weeks, the quality of your inner speech changes — not through force, but through redirected attention. The new voice becomes more natural. The old one appears less frequently, with less authority.

This is the mental diet working. One redirected thought at a time.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c04-l06', course_id: 'course-04', order_index: 6,
    title: 'The Persistence Principle',
    description: "Why the practitioners who see the most dramatic results all share one quality — and how to develop it deliberately.",
    video_url: null, duration_seconds: 840, is_preview: false,
    content_md: `## The Persistence Principle

Of all the variables that determine whether a practitioner sees results, persistence is the single most predictive factor.

Not the quality of the visualization. Not the specificity of the desire. Not the depth of understanding of the theory. Persistence.

### What Persistence Is Not

Persistence is not white-knuckling your way through doubt while secretly terrified it won't work. That is effortful trying — and the effortful quality transmits as much as the content.

Persistence is also not obsessing over whether it's working. Obsessive checking is the opposite of assumed fulfillment.

### What Persistence Is

Persistence is the steady, unfazed continuation of practice and inner assumption — through delay, through contradiction, through the silence of an echo that hasn't arrived yet.

It looks like:
- Continuing the SATS practice on the night when nothing seems to be moving
- Choosing the assumed inner conversation on the Tuesday when everything looks the same
- Opening the Revision Journal when you're tired and would rather not

It doesn't feel heroic. It feels quiet and ordinary. That is exactly what it should feel like.

### The Parable of the Seed

A seed planted in the ground doesn't produce visible growth for days or weeks. The absence of a sprout is not evidence that nothing is happening. The entire biological infrastructure is building underground — root system, moisture absorption, cellular multiplication — before a single green shoot appears.

Digging the seed up to check on it kills it.

Your assumption is the seed. The 3D world is the soil. The delay between planting and sprouting is the echo lag.

**Leave the seed alone. Water it daily. Trust the process.**

### Building Your Persistence Muscle

Track your practice publicly in the community forum. Share your journey — not just the results, but the quiet continuation during the delay. Accountability with others who understand the practice strengthens persistence more than almost anything else.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c04-l07', course_id: 'course-04', order_index: 7,
    title: 'Integrated Practice — All Four Systems Working Together',
    description: "How the RAS framework, Law of Assumption, SATS, and Mental Diet function as one unified system — and how to run them simultaneously.",
    video_url: null, duration_seconds: 900, is_preview: false,
    content_md: `## Integrated Practice — All Four Systems Working Together

You now have four complete systems. The power multiplies when they run simultaneously.

### The Unified Daily Protocol

**Morning (10 minutes):**
- Wake in the hypnopompic window (between sleep and wakefulness) — briefly inhabit your assumed state before reaching for your phone
- 3 minutes Alpha/Theta edge: think *from* the desired state — what's your first thought as this person?
- Set your RAS filter for the day: "Today I will notice [specific type of opportunity/evidence]"

**Throughout the day:**
- Mental diet active: observer mode running
- Decision Matrix deployed on any limiting belief that surfaces
- Inner speech redirected toward the assumed identity's natural thought stream
- Inspired actions taken without requiring them to "make sense" logically

**Evening (20 minutes):**
- Revision Journal: one event revised
- (Optional) Advanced revision: one past event worked on
- SATS practice: one scene, looped to sleep

**Weekly:**
- Life Mastery Score check-in (available in your dashboard)
- Community post: share one bridge moment, one win, one question

### The Compound Effect

Each system reinforces the others:

- SATS installs the assumption → RAS programs to filter for evidence → Day brings more confirming evidence → Mental diet maintains the signal → Evening revision neutralizes any contradictions → SATS deepens the installation

This is not a linear chain. It's a self-reinforcing cycle. Once it achieves critical velocity, it becomes self-sustaining.

### Mastery Looks Like

After 90 days of integrated practice, most practitioners report the same shift: the practice no longer feels like *doing something to change reality*. It feels like *maintaining the reality that now simply is*.

The assumed state has become the default. The old programs appear occasionally, recognized quickly, neutralized efficiently.

This is the architecture of a reality that you built, deliberately, from the inside out.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c04-l08', course_id: 'course-04', order_index: 8,
    title: 'The Life Mastery Score — Monthly Assessment Protocol',
    description: 'How to use the monthly Life Mastery Score diagnostic to track your internal shifts and generate your next-phase roadmap.',
    video_url: null, duration_seconds: 600, is_preview: false,
    content_md: `## The Life Mastery Score

The Life Mastery Score is a monthly self-assessment across six life domains. It gives you an objective read on where your internal state is actually sitting — separate from what the 3D echo is currently showing.

### The Six Domains

**Relationships (0–100):** How does your inner conversation sound when you think about connection, love, and belonging? From the assumed state or from lack?

**Finances (0–100):** What is the background emotional tone when money enters your awareness? Ease or anxiety?

**Health (0–100):** How do you inhabit your body? With appreciation and assumed vitality, or with habitual complaint?

**Mindset (0–100):** How quickly do limiting beliefs surface vs. the assumed identity? How rapidly are they neutralized?

**Purpose (0–100):** Does your daily life feel connected to something meaningful, or is that connection still something you're waiting to find?

**Self-Worth (0–100):** What does your inner speech say about whether you deserve what you want?

### How to Score Honestly

Resist the urge to give yourself high scores across the board because you want to feel good about your progress. The diagnostic is only useful if it's accurate.

Score based on your *average inner experience* over the past 30 days — not your best moments, not your worst, but the baseline.

### Using Your Scores

The domain with your lowest score is your primary focus area for the next 30 days:
- SATS scenes targeting that domain
- Advanced revision for past events in that domain
- Mental diet focus on the inner speech patterns in that domain

A 5-point shift in one domain over one month is significant progress. This is not rapid transformation — it's sustained, permanent reconstruction.

### Access Your Assessment

Available in your Elite member dashboard. Complete monthly on the same date each month for consistent tracking.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c04-l09', course_id: 'course-04', order_index: 9,
    title: 'Course Completion — Your Reality Architecture',
    description: "You've built the complete internal architecture. What comes next — and how to maintain what you've built.",
    video_url: null, duration_seconds: 600, is_preview: false,
    content_md: `## Your Reality Architecture Is Complete

You have now studied and practiced:

1. **The RAS** — the physical gatekeeper of your experienced reality, programmed by assumption and emotion
2. **The Law of Assumption** — the operating principle by which inner state becomes outer world
3. **SATS** — the direct-access tool to the subconscious via the hypnagogic Theta state
4. **The Mental Diet** — the ongoing maintenance of your internal operating system

Together, these form the complete architecture of deliberate reality creation.

### What You Have Built

Over the course of this curriculum, you have:

- **Identified** the specific subconscious programs running your old reality
- **Installed** new assumptions through SATS and living-in-the-end practice
- **Maintained** those assumptions through the mental diet and revision
- **Persisted** through the echo delay without abandoning the inner state
- **Tracked** your progress through the Life Mastery Score

This is not a course you've completed. It's a foundation you've built. The practice continues — it simply becomes more natural and less effortful with time.

### What Comes Next

**Continue your SATS practice** — nightly, indefinitely. Scale it as desires manifest and new ones emerge.

**Use the Revision Journal** as a permanent nightly tool — not just for challenging days, but as the daily pruning that keeps your inner garden clean.

**Contribute to the community** — share your bridge moments. Your testimony is someone else's evidence that persistence works.

**Return to Course 1** periodically — practitioners consistently report that earlier material reveals new depth after lived practice.

### A Final Word

"Your imagination is your preview of life's coming attractions." 

You have learned to run your own previews now. Deliberately. With precision. From the inside out.

What you assume, you become. What you become, you see reflected back.

Build the reality you actually want. You have everything required.

✦`,
    created_at: new Date().toISOString(),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// LESSON QUIZZES (knowledge checks after each module)
// ─────────────────────────────────────────────────────────────────────────────
export const LESSON_QUIZZES: Record<string, Quiz> = {
  'c01-l05': {
    id: 'quiz-c01-final', course_id: 'course-01', lesson_id: 'c01-l05',
    title: 'Course 1 Knowledge Check', description: null,
    quiz_type: 'knowledge_check', tier_required: 'free', pass_percent: 70,
    created_at: new Date().toISOString(),
    questions: [
      {
        id: 'q-c01-1', quiz_id: 'quiz-c01-final', order_index: 1,
        correct_option_id: 'q-c01-1-b', explanation: 'The RAS processes approximately 50 bits per second from the 11 million bits of incoming data — acting as the primary gatekeeper of conscious experience.',
        question: 'How many bits per second does your conscious mind process from the 11 million incoming?',
        options: [
          { id: 'q-c01-1-a', label: 'A', text: '500 bits', feedback: null },
          { id: 'q-c01-1-b', label: 'B', text: '50 bits', feedback: null },
          { id: 'q-c01-1-c', label: 'C', text: '5,000 bits', feedback: null },
          { id: 'q-c01-1-d', label: 'D', text: '5 bits', feedback: null },
        ],
      },
      {
        id: 'q-c01-2', quiz_id: 'quiz-c01-final', order_index: 2,
        correct_option_id: 'q-c01-2-c', explanation: 'In Theta (4-7 Hz), the critical factor goes offline and the subconscious cannot distinguish imagination from reality — making it the ideal state for installing new beliefs.',
        question: 'In which brainwave state is the "critical factor" offline and subconscious most receptive?',
        options: [
          { id: 'q-c01-2-a', label: 'A', text: 'Beta (13–30 Hz)', feedback: null },
          { id: 'q-c01-2-b', label: 'B', text: 'Alpha (8–12 Hz)', feedback: null },
          { id: 'q-c01-2-c', label: 'C', text: 'Theta (4–7 Hz)', feedback: null },
          { id: 'q-c01-2-d', label: 'D', text: 'Delta (0–4 Hz)', feedback: null },
        ],
      },
      {
        id: 'q-c01-3', quiz_id: 'quiz-c01-final', order_index: 3,
        correct_option_id: 'q-c01-3-a', explanation: 'The Car Model Phenomenon demonstrates that the RAS updated its filter after you made a decision — causing you to notice what was always there but previously filtered as noise.',
        question: 'What does the Car Model Phenomenon demonstrate about the RAS?',
        options: [
          { id: 'q-c01-3-a', label: 'A', text: 'The RAS filters for what matches your current emotional priorities', feedback: null },
          { id: 'q-c01-3-b', label: 'B', text: 'More cars of that model appeared after your decision', feedback: null },
          { id: 'q-c01-3-c', label: 'C', text: 'Desire creates objects in the physical world', feedback: null },
          { id: 'q-c01-3-d', label: 'D', text: 'The RAS only responds to visual stimuli', feedback: null },
        ],
      },
      {
        id: 'q-c01-4', quiz_id: 'quiz-c01-final', order_index: 4,
        correct_option_id: 'q-c01-4-d', explanation: 'Myelination is the biological process by which repeated neural firing causes an insulating myelin sheath to form, making that pathway up to 120x faster — converting effortful belief into automatic assumption.',
        question: 'What is the biological process that converts repeated thought into automatic belief?',
        options: [
          { id: 'q-c01-4-a', label: 'A', text: 'Neurogenesis', feedback: null },
          { id: 'q-c01-4-b', label: 'B', text: 'Synaptogenesis', feedback: null },
          { id: 'q-c01-4-c', label: 'C', text: 'Dopaminergic encoding', feedback: null },
          { id: 'q-c01-4-d', label: 'D', text: 'Myelination', feedback: null },
        ],
      },
    ],
  },
  'c02-l07': {
    id: 'quiz-c02-final', course_id: 'course-02', lesson_id: 'c02-l07',
    title: 'Course 2 Knowledge Check', description: null,
    quiz_type: 'knowledge_check', tier_required: 'architect', pass_percent: 70,
    created_at: new Date().toISOString(),
    questions: [
      {
        id: 'q-c02-1', quiz_id: 'quiz-c02-final', order_index: 1,
        correct_option_id: 'q-c02-1-b', explanation: "Thinking *from* means inhabiting the identity of someone who already has the desire — their natural thought stream, not thoughts about the desire itself.",
        question: 'What is the core difference between "thinking of" and "thinking from" a desire?',
        options: [
          { id: 'q-c02-1-a', label: 'A', text: 'Thinking from requires more emotional intensity', feedback: null },
          { id: 'q-c02-1-b', label: 'B', text: 'Thinking from inhabits the identity of fulfillment; thinking of observes the desire from outside', feedback: null },
          { id: 'q-c02-1-c', label: 'C', text: 'They produce identical subconscious impressions', feedback: null },
          { id: 'q-c02-1-d', label: 'D', text: 'Thinking of is more powerful because it creates desire-energy', feedback: null },
        ],
      },
      {
        id: 'q-c02-2', quiz_id: 'quiz-c02-final', order_index: 2,
        correct_option_id: 'q-c02-2-c', explanation: "The Echo Theory describes a 60-90 day lag between an internal assumption shift and its physical manifestation — 3D reality reflects past consciousness, not present.",
        question: 'According to the Echo Theory, what does your current 3D reality reflect?',
        options: [
          { id: 'q-c02-2-a', label: 'A', text: 'Your current assumptions in real-time', feedback: null },
          { id: 'q-c02-2-b', label: 'B', text: 'The universe\'s response to your vibration today', feedback: null },
          { id: 'q-c02-2-c', label: 'C', text: 'Your past assumptions, typically 60-90 days behind', feedback: null },
          { id: 'q-c02-2-d', label: 'D', text: 'Your genetic programming and childhood conditioning', feedback: null },
        ],
      },
      {
        id: 'q-c02-3', quiz_id: 'quiz-c02-final', order_index: 3,
        correct_option_id: 'q-c02-3-d', explanation: "The Bridge of Incidents is orchestrated by the subconscious — your role is to hold the assumption, not engineer the path. Trying to control the bridge undermines it.",
        question: 'What is your role regarding the Bridge of Incidents?',
        options: [
          { id: 'q-c02-3-a', label: 'A', text: 'Strategically engineer the most logical path to your desire', feedback: null },
          { id: 'q-c02-3-b', label: 'B', text: 'Identify the bridge and accelerate it with focused action', feedback: null },
          { id: 'q-c02-3-c', label: 'C', text: 'Trust specific people to be your bridge and cultivate them', feedback: null },
          { id: 'q-c02-3-d', label: 'D', text: 'Hold the assumption and take inspired action — do not try to control the construction', feedback: null },
        ],
      },
    ],
  },
  'c03-l08': {
    id: 'quiz-c03-final', course_id: 'course-03', lesson_id: 'c03-l08',
    title: 'SATS Mastery Diagnostic', description: null,
    quiz_type: 'sats_diagnostic', tier_required: 'architect', pass_percent: 70,
    created_at: new Date().toISOString(),
    questions: [
      {
        id: 'q-c03-1', quiz_id: 'quiz-c03-final', order_index: 1,
        correct_option_id: 'q-c03-1-a', explanation: 'SATS requires first-person perspective — you must be inside the scene, feeling it as a subject, not watching it as an observer.',
        question: 'Which perspective is required for an effective SATS scene?',
        options: [
          { id: 'q-c03-1-a', label: 'A', text: 'First-person — inside the scene, feeling it through your own senses', feedback: null },
          { id: 'q-c03-1-b', label: 'B', text: 'Third-person — watching yourself receive the desired outcome', feedback: null },
          { id: 'q-c03-1-c', label: 'C', text: 'Either perspective works equally well', feedback: null },
          { id: 'q-c03-1-d', label: 'D', text: 'Aerial view — seeing the full scene from above', feedback: null },
        ],
      },
      {
        id: 'q-c03-2', quiz_id: 'quiz-c03-final', order_index: 2,
        correct_option_id: 'q-c03-2-b', explanation: 'The ideal SATS scene is 5-10 seconds — short enough to run in Theta without triggering Beta analytical thinking, long enough to carry full sensory and emotional detail.',
        question: 'How long should an ideal SATS scene be?',
        options: [
          { id: 'q-c03-2-a', label: 'A', text: '2-3 minutes of detailed narrative', feedback: null },
          { id: 'q-c03-2-b', label: 'B', text: '5-10 seconds — a single moment looped', feedback: null },
          { id: 'q-c03-2-c', label: 'C', text: '30-60 seconds with multiple scenes', feedback: null },
          { id: 'q-c03-2-d', label: 'D', text: 'As long as needed until you feel it', feedback: null },
        ],
      },
      {
        id: 'q-c03-3', quiz_id: 'quiz-c03-final', order_index: 3,
        correct_option_id: 'q-c03-3-c', explanation: 'Dopamine (anticipation/reward), serotonin (certainty/sufficiency), and norepinephrine encode the SATS session as a real, important experience — cementing the neural pathway.',
        question: 'Which neurochemicals "cement" the SATS impression biologically?',
        options: [
          { id: 'q-c03-3-a', label: 'A', text: 'Cortisol and adrenaline', feedback: null },
          { id: 'q-c03-3-b', label: 'B', text: 'Melatonin and GABA', feedback: null },
          { id: 'q-c03-3-c', label: 'C', text: 'Dopamine, serotonin, and norepinephrine', feedback: null },
          { id: 'q-c03-3-d', label: 'D', text: 'Oxytocin and acetylcholine', feedback: null },
        ],
      },
    ],
  },
  'c04-l09': {
    id: 'quiz-c04-final', course_id: 'course-04', lesson_id: 'c04-l09',
    title: 'Course 4 Final Assessment', description: null,
    quiz_type: 'knowledge_check', tier_required: 'elite', pass_percent: 75,
    created_at: new Date().toISOString(),
    questions: [
      {
        id: 'q-c04-1', quiz_id: 'quiz-c04-final', order_index: 1,
        correct_option_id: 'q-c04-1-b', explanation: 'The Mental Diet requires labeling the old program, refusing to engage (not suppress), and redirecting to the assumed identity\'s natural inner conversation.',
        question: 'What are the three steps of the Decision Matrix?',
        options: [
          { id: 'q-c04-1-a', label: 'A', text: 'Feel it, suppress it, replace it', feedback: null },
          { id: 'q-c04-1-b', label: 'B', text: 'Identify the program, make the opposite decision, find evidence', feedback: null },
          { id: 'q-c04-1-c', label: 'C', text: 'Name it, argue with it, affirm the opposite', feedback: null },
          { id: 'q-c04-1-d', label: 'D', text: 'Observe it, accept it, release it', feedback: null },
        ],
      },
      {
        id: 'q-c04-2', quiz_id: 'quiz-c04-final', order_index: 2,
        correct_option_id: 'q-c04-2-d', explanation: 'Advanced revision targets past memories with emotional charge — using memory reconsolidation (a real neurological process) to neutralize old programs at the root.',
        question: 'What neurological process does advanced revision leverage?',
        options: [
          { id: 'q-c04-2-a', label: 'A', text: 'Neurogenesis — growing new neurons', feedback: null },
          { id: 'q-c04-2-b', label: 'B', text: 'Synaptic pruning — removing unused connections', feedback: null },
          { id: 'q-c04-2-c', label: 'C', text: 'Long-term potentiation', feedback: null },
          { id: 'q-c04-2-d', label: 'D', text: 'Memory reconsolidation — updating memories when recalled', feedback: null },
        ],
      },
      {
        id: 'q-c04-3', quiz_id: 'quiz-c04-final', order_index: 3,
        correct_option_id: 'q-c04-3-a', explanation: 'Faithfulness during contradiction is the most important skill — the 3D echo is past programming, not present reality. Peace in the face of contradiction signals the assumed state.',
        question: 'A 3D circumstance appears to contradict your assumption after 3 weeks of practice. The correct response is:',
        options: [
          { id: 'q-c04-3-a', label: 'A', text: '"This is the echo of the old state. My assumption is already hardening. I remain."', feedback: null },
          { id: 'q-c04-3-b', label: 'B', text: '"I need to intensify my SATS practice to overcome this resistance."', feedback: null },
          { id: 'q-c04-3-c', label: 'C', text: '"I should revise my goal to something more realistic."', feedback: null },
          { id: 'q-c04-3-d', label: 'D', text: '"The universe is testing my desire to see if I really want it."', feedback: null },
        ],
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: get all lessons for a course
// ─────────────────────────────────────────────────────────────────────────────
export const ALL_LESSONS: Record<string, Lesson[]> = {
  'course-01': COURSE_01_LESSONS,
  'course-02': COURSE_02_LESSONS,
  'course-03': COURSE_03_LESSONS,
  'course-04': COURSE_04_LESSONS,
}

export function getLessonsForCourse(courseId: string): Lesson[] {
  return ALL_LESSONS[courseId] ?? []
}

export function getLessonQuiz(lessonId: string): Quiz | null {
  return LESSON_QUIZZES[lessonId] ?? null
}
