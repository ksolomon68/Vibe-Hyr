"use client";

// components/workplace/WorkplaceLessonPlayer.tsx
//
// Core lesson player for Vibe Hyr Workplace Training Series.
// 4 tracks · 24 modules · quiz gates · progress rings · sidebar nav.
// Can be used standalone (internal state) or driven by WorkplaceLessonPlayerWrapper (Supabase).

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const T = {
  orange:  "#E8621A",
  gold:    "#C9A84C",
  dark:    "#0E0C08",
  darkMid: "#1A1208",
  panel:   "#141008",
  card:    "#1E1610",
  border:  "#2E2416",
  gray:    "#8C7A60",
  muted:   "#5A4A34",
  cream:   "#F7F2EA",
  white:   "#FFFFFF",
  teal:    "#0F505A",
  green:   "#22C55E",
  red:     "#EF4444",
};

// ─── Data types ────────────────────────────────────────────────────────────────
interface QuizQuestion {
  q: string;
  options: string[];
  correct: number; // index into options
}

interface Lesson {
  id: string;
  num: string;          // e.g. "01"
  title: string;
  duration: string;     // e.g. "18 min"
  type: "video" | "workshop" | "live" | "capstone";
  isLive?: boolean;
  description: string;
  objectives: string[];
  content: string[];    // paragraphs / sections
  tool?: string;        // worksheet / exercise name
  quiz: QuizQuestion[];
}

interface Track {
  id: string;
  num: string;          // e.g. "01"
  tag: string;
  title: string;
  subtitle: string;
  color: string;
  totalTime: string;
  description: string;
  lessons: Lesson[];
}

// ─── Curriculum data ──────────────────────────────────────────────────────────
const TRACKS: Track[] = [
  {
    id: "t1",
    num: "01",
    tag: "Foundation",
    title: "Common Sense in the Workplace",
    subtitle: "Awareness · Communication · Vibe Hygiene",
    color: T.orange,
    totalTime: "~2.5 hrs",
    description:
      "The foundational track. Before de-escalation, self-mastery, or team cohesion is possible, every professional needs a baseline level of emotional awareness, communication clarity, and personal vibe hygiene. This track installs that baseline.",
    lessons: [
      {
        id: "t1l1",
        num: "01",
        title: "The Awareness Gap",
        duration: "20 min",
        type: "video",
        description:
          "Most workplace friction isn't caused by bad people — it's caused by unawareness. This module maps the gap between what we intend, what we project, and how others receive us.",
        objectives: [
          "Define the Awareness Gap and why it generates most professional friction",
          "Distinguish between intent, behavior, and impact",
          "Identify your default awareness level under stress",
        ],
        content: [
          "The Awareness Gap is the distance between who you think you're being and who others actually experience. Most workplace dysfunction lives in this gap — not in malice, but in unawareness.",
          "We operate from intention ('I was just being honest') while others receive behavior ('that comment felt dismissive'). Neither is wrong — both are real. The professional who closes this gap becomes someone others want to work with.",
          "Neuroscience tells us that under stress, the prefrontal cortex — responsible for self-monitoring — goes offline first. Emotional intelligence is the skill of keeping it online when it matters most.",
          "Your Awareness Inventory: For the next 48 hours, practice a single question after every meaningful interaction — 'What did they experience from me?' Not what you intended. What they received.",
        ],
        tool: "Awareness Inventory Log",
        quiz: [
          {
            q: "The Awareness Gap describes the distance between:",
            options: [
              "Your intentions and how others experience your behavior",
              "Your skill level and your manager's expectations",
              "What you say and what you mean",
              "Your current role and the role you want",
            ],
            correct: 0,
          },
          {
            q: "Under stress, which brain region goes offline first?",
            options: ["Amygdala", "Cerebellum", "Prefrontal cortex", "Hippocampus"],
            correct: 2,
          },
          {
            q: "The core professional skill taught in this module is:",
            options: [
              "Assertive communication",
              "Keeping the self-monitoring brain online under stress",
              "Reading body language",
              "Time management",
            ],
            correct: 1,
          },
        ],
      },
      {
        id: "t1l2",
        num: "02",
        title: "Emotional Signals at Work",
        duration: "22 min",
        type: "video",
        description:
          "Emotions are data, not drama. This module teaches you to read your own emotional signals accurately — before they read you.",
        objectives: [
          "Identify the four primary emotion families and their workplace triggers",
          "Use the Body-Emotion-Behavior chain to anticipate your responses",
          "Develop a personal emotion vocabulary that increases precision",
        ],
        content: [
          "Emotions are not problems to eliminate — they are your nervous system's real-time assessment of your environment. The goal isn't to feel less; it's to read more accurately.",
          "The four primary emotion families relevant to workplace dynamics: Fear (threat, vulnerability), Anger (boundary violation, injustice), Sadness (loss, disappointment), and Shame (status threat, exposure). Most professional reactions trace back to one of these four.",
          "The Body-Emotion-Behavior chain: Every emotion begins as a physical signal. Tight chest (fear). Hot face (anger). Heavy shoulders (sadness). When you catch the body signal first, you have a moment of choice before the behavior fires.",
          "Most professionals operate with an emotion vocabulary of 5–7 words. Research shows that people with a vocabulary of 30+ emotions make significantly better decisions under pressure. Precision in labeling = precision in responding.",
        ],
        tool: "Emotion Signal Map",
        quiz: [
          {
            q: "In this module, emotions are described as:",
            options: [
              "Weaknesses that professionals must suppress",
              "Data — the nervous system's real-time environmental assessment",
              "Social signals that only matter in personal relationships",
              "Random noise unrelated to performance",
            ],
            correct: 1,
          },
          {
            q: "The Body-Emotion-Behavior chain teaches you to:",
            options: [
              "Suppress your body's signals to appear calm",
              "Identify the physical signal before the behavior fires",
              "Analyze emotions after the fact",
              "Share emotions openly with colleagues",
            ],
            correct: 1,
          },
          {
            q: "Which emotion family is activated by a perceived status threat?",
            options: ["Fear", "Anger", "Sadness", "Shame"],
            correct: 3,
          },
        ],
      },
      {
        id: "t1l3",
        num: "03",
        title: "Communication Architecture",
        duration: "25 min",
        type: "workshop",
        description:
          "The structure behind clear professional communication. Most workplace misunderstandings are architectural failures, not character flaws.",
        objectives: [
          "Apply the three-layer communication model (content, context, subtext)",
          "Distinguish between assertive, passive, and aggressive communication patterns",
          "Practice the Clarity Frame: Observation — Impact — Request",
        ],
        content: [
          "Every workplace communication operates on three simultaneous layers: Content (what you literally said), Context (the situation and relationship it's said within), and Subtext (what both parties actually mean beneath the words). Most miscommunications are subtext collisions.",
          "Communication patterns exist on a spectrum: Passive (suppressing needs to avoid conflict) → Assertive (expressing needs clearly while respecting others) → Aggressive (imposing needs at the expense of others). The goal is not to be assertive all the time — it's to have the range.",
          "The Clarity Frame is a structure for addressing difficult topics without triggering defensiveness: (1) Observation: 'When X happens...' (2) Impact: '...I notice Y effect.' (3) Request: '...I'm asking for Z.' No blame. No assumption. Just clarity.",
          "Practice exercise: Take a current workplace tension. Run it through the Clarity Frame. Write it out before speaking it. The act of writing removes the emotional charge and reveals whether the issue is real or reactive.",
        ],
        tool: "Clarity Frame Worksheet",
        quiz: [
          {
            q: "The three layers of communication in this model are:",
            options: [
              "Verbal, nonverbal, and written",
              "Content, context, and subtext",
              "Speaker, listener, and environment",
              "Thinking, feeling, and acting",
            ],
            correct: 1,
          },
          {
            q: "The Clarity Frame begins with:",
            options: [
              "Stating your feelings directly",
              "A specific, behavior-based observation",
              "Asking a question",
              "Summarizing the other person's position",
            ],
            correct: 1,
          },
          {
            q: "Most workplace miscommunications are described as:",
            options: [
              "Character flaws in one or both parties",
              "Subtext collisions — architectural failures",
              "Failures of listening",
              "Power imbalance issues",
            ],
            correct: 1,
          },
        ],
      },
      {
        id: "t1l4",
        num: "04",
        title: "Trigger Mapping",
        duration: "20 min",
        type: "workshop",
        description:
          "Know your triggers before they know you. This module builds a personal trigger map as a professional tool.",
        objectives: [
          "Define what a workplace trigger is at the neurological level",
          "Identify your top three personal trigger categories",
          "Build a Trigger Map: stimulus → body signal → primary emotion → typical behavior",
        ],
        content: [
          "A trigger is not a feeling — it's a threat signal sent to your amygdala that hijacks your prefrontal cortex. It happens in under 200 milliseconds. By the time you 'decide' how to respond, the hijack is already complete — unless you've trained for it.",
          "Common professional trigger categories: Status triggers (being dismissed, overlooked, or condescended to), Competence triggers (being questioned, corrected, or undermined in your area of expertise), Fairness triggers (perceiving inequity or inconsistency in rules or treatment), Autonomy triggers (feeling micromanaged or controlled).",
          "Building your Trigger Map is not therapy — it's reconnaissance. You're mapping the terrain of your own nervous system so that the next time a trigger fires, you recognize it as a known pattern rather than an overwhelming surprise.",
          "Once you have a map, you can create preemptive protocols: 'When I notice X signal in my body, I will pause for Y seconds before responding.' Protocols make the pause automatic instead of heroic.",
        ],
        tool: "Personal Trigger Map",
        quiz: [
          {
            q: "A trigger fires in the amygdala in approximately:",
            options: ["2 seconds", "500 milliseconds", "Under 200 milliseconds", "1-2 minutes"],
            correct: 2,
          },
          {
            q: "Being questioned in your area of expertise most commonly activates which trigger category?",
            options: [
              "Status trigger",
              "Competence trigger",
              "Fairness trigger",
              "Autonomy trigger",
            ],
            correct: 1,
          },
          {
            q: "Trigger Mapping is described in this module as:",
            options: [
              "A therapeutic exercise for emotional healing",
              "Professional reconnaissance — mapping your nervous system terrain",
              "A conflict resolution tool",
              "A way to identify colleagues' weaknesses",
            ],
            correct: 1,
          },
        ],
      },
      {
        id: "t1l5",
        num: "05",
        title: "Vibe Hygiene",
        duration: "18 min",
        type: "video",
        description:
          "Your nervous system is contagious. This module covers the daily practices that regulate your baseline state before you walk into any room.",
        objectives: [
          "Understand nervous system co-regulation and why your state affects others",
          "Build a personalized Vibe Hygiene stack (morning and evening)",
          "Apply Evening Revision as a professional reset practice",
        ],
        content: [
          "Nervous systems are contagious — mirror neurons mean your colleagues' brains are literally affected by your physiological state. A dysregulated leader in a meeting is not just distracted; they are neurologically distressing everyone in the room.",
          "Vibe Hygiene is the set of practices that regulate your baseline before high-stakes moments. It's not about being positive — it's about being stable. Stability is the foundation of professional effectiveness.",
          "Morning stack fundamentals: 10 minutes of stillness before the first screen, one clear intention for the day (not a task list — an intention about how you want to show up), and a 2-minute body scan to check your baseline state.",
          "Evening Revision is the professional reset: before sleep, mentally replay the day. Where did it go well? Where did it go sideways? Now revise it — not as an exercise in regret, but as a neural rehearsal for the next version of you. Your subconscious will integrate the revision overnight.",
        ],
        tool: "Vibe Hygiene Daily Stack",
        quiz: [
          {
            q: "Why is a dysregulated leader harmful to their team at a neurological level?",
            options: [
              "They make poor decisions",
              "Mirror neurons cause their physiological state to affect others' brains",
              "They speak louder under stress",
              "They tend to cancel meetings",
            ],
            correct: 1,
          },
          {
            q: "Vibe Hygiene is primarily aimed at:",
            options: [
              "Being more positive and optimistic",
              "Regulating your baseline state before high-stakes moments",
              "Improving physical health habits",
              "Building a morning routine for productivity",
            ],
            correct: 1,
          },
          {
            q: "Evening Revision works because:",
            options: [
              "Writing things down improves memory",
              "The subconscious integrates neural rehearsals during sleep",
              "Reflecting on mistakes prevents them from recurring",
              "It forces accountability for the day's choices",
            ],
            correct: 1,
          },
        ],
      },
      {
        id: "t1l6",
        num: "06",
        title: "Live Integration Session",
        duration: "60 min",
        type: "live",
        isLive: true,
        description:
          "Live group session with a Vibe Hyr facilitator. Case study review, Q&A, and personalized practice assignments.",
        objectives: [
          "Apply Track 01 concepts to real-world case studies",
          "Receive personalized feedback on your Trigger Map and Vibe Hygiene stack",
          "Build your Track 01 Integration Commitment",
        ],
        content: [
          "This live session is your integration point for all five Track 01 modules. Come with your Trigger Map, your Vibe Hygiene stack draft, and at least one real workplace situation you want to run through the frameworks.",
          "Format: 20-minute facilitated case study → 25-minute open Q&A with cohort → 15-minute individual commitment building.",
          "Your Track 01 Integration Commitment is a single sentence: 'For the next 30 days, when I notice [trigger signal], I will [new behavior].' Simple. Specific. Measurable.",
        ],
        tool: "Track 01 Integration Commitment",
        quiz: [],
      },
    ],
  },

  {
    id: "t2",
    num: "02",
    tag: "De-Escalation",
    title: "From Reaction to Response",
    subtitle: "The Escalation Ladder · Stage Intervention · Pattern Interrupts",
    color: T.gold,
    totalTime: "~2.5 hrs",
    description:
      "Conflict isn't the problem. Unconscious escalation is. This track installs a five-stage Escalation Ladder and the intervention protocols to stop conflict before it becomes damage.",
    lessons: [
      {
        id: "t2l1",
        num: "01",
        title: "The Reactivity Spectrum",
        duration: "18 min",
        type: "video",
        description:
          "Why smart professionals do things they immediately regret — and the neurological mechanism that explains it.",
        objectives: [
          "Define the Reactivity Spectrum from baseline calm to full amygdala hijack",
          "Identify where on the spectrum your 'point of no return' currently sits",
          "Understand why logic is unavailable above a certain activation level",
        ],
        content: [
          "The Reactivity Spectrum runs from baseline calm → mild activation → moderate stress → high stress → amygdala hijack. At each stage, specific cognitive functions go offline. The skill is knowing where you are before you lose access to the tools.",
          "Most professionals only notice they've been reactive after the damage is done — the email is sent, the comment is made, the meeting explodes. The goal of this track is to move your self-awareness earlier on the spectrum, so intervention is possible.",
          "Once in a full amygdala hijack, the prefrontal cortex is offline and logic is literally unavailable. This is not a character failure — it's biology. The only solution is physiological: breath, movement, or time. Attempting to reason with someone in a full hijack is ineffective.",
          "The most important skill in conflict management is recognizing stage 3 (high stress) before stage 4 (hijack). That recognition window is your intervention window.",
        ],
        tool: "Reactivity Spectrum Self-Assessment",
        quiz: [
          {
            q: "Once in a full amygdala hijack, which of the following is available?",
            options: [
              "Logical reasoning",
              "Empathy",
              "Physiological regulation (breath, movement, time)",
              "Complex problem-solving",
            ],
            correct: 2,
          },
          {
            q: "The most critical skill in de-escalation is recognizing:",
            options: [
              "Stage 5 before it becomes permanent",
              "Stage 3 before reaching Stage 4 hijack",
              "Stage 1 before it reaches Stage 2",
              "The other person's stage",
            ],
            correct: 1,
          },
          {
            q: "In a full amygdala hijack, attempting to reason with someone is:",
            options: [
              "Effective if you use the right language",
              "Effective if you stay calm",
              "Ineffective — biology makes logic unavailable",
              "Effective only for certain personality types",
            ],
            correct: 2,
          },
        ],
      },
      {
        id: "t2l2",
        num: "02",
        title: "The Escalation Ladder",
        duration: "22 min",
        type: "workshop",
        description:
          "A five-stage conflict map with precise behavioral markers at each stage and the intervention window for each.",
        objectives: [
          "Identify all five stages of the Escalation Ladder with their behavioral markers",
          "Map a recent workplace conflict to its stage trajectory",
          "Calculate the intervention window for each stage",
        ],
        content: [
          "Stage 1 — Friction: Low-grade irritation. The other person's behavior is slightly off your preference. Body signal: mild tension. Available intervention: Acknowledge, clarify, or let it go. Hijack risk: 0%.",
          "Stage 2 — Tension: A pattern is forming. The irritation has repeated. Body signal: tightening chest, slightly elevated breath rate. Available intervention: Direct conversation using the Clarity Frame. Hijack risk: 10%.",
          "Stage 3 — Conflict: Active disagreement. Emotions are visible. Body signal: heat in the face, faster breath, louder voice. Available intervention: Pause protocol — call a recess. Hijack risk: 40%.",
          "Stage 4 — Crisis: Emotional flooding. Logic is intermittent. Body signal: trembling, blood pressure surge, tunnel vision. Available intervention: Physiological only — leave the space if possible. Hijack risk: 85%.",
          "Stage 5 — Rupture: Full breakdown. Irreversible things may be said or done. Body signal: dissociation, numbness, or explosive outburst. Available intervention: Damage control post-event. Hijack risk: 99%.",
          "The Escalation Ladder is also a map for other people's states. An emotionally intelligent professional reads others' stages before they escalate themselves.",
        ],
        tool: "Escalation Ladder Reference Card",
        quiz: [
          {
            q: "At Stage 3 (Conflict), the recommended intervention is:",
            options: [
              "State your position clearly and firmly",
              "Pause protocol — call a recess",
              "Increase logical reasoning",
              "Express your emotions directly",
            ],
            correct: 1,
          },
          {
            q: "At Stage 4, logic is:",
            options: [
              "Fully available but requires effort",
              "Available for simple decisions",
              "Intermittent — physiological intervention is primary",
              "Unchanged from baseline",
            ],
            correct: 2,
          },
          {
            q: "Stage 5 is characterized by:",
            options: [
              "Heightened clarity and urgency",
              "Full breakdown — damage control is the only intervention",
              "Intense but manageable emotion",
              "Peak cognitive performance under pressure",
            ],
            correct: 1,
          },
        ],
      },
      {
        id: "t2l3",
        num: "03",
        title: "Stage 1 Intervention",
        duration: "20 min",
        type: "workshop",
        description:
          "The most powerful place to intervene is Stage 1 — before it becomes anything. This module builds that reflex.",
        objectives: [
          "Master the Stage 1 intervention toolkit: acknowledge, clarify, redirect, or release",
          "Practice early-stage friction conversations using structured language",
          "Build the habit of proactive micro-conversations",
        ],
        content: [
          "Stage 1 intervention is the highest-leverage skill in this track. Addressing friction at Stage 1 costs almost nothing — it's a brief conversation, a clarifying question, a small acknowledgment. Waiting until Stage 3 or 4 multiplies the cost exponentially.",
          "The four Stage 1 responses: (1) Acknowledge — 'I noticed some tension there. Are we good?' (2) Clarify — 'I want to make sure I understood your point correctly...' (3) Redirect — Shift the conversation to shared goals or outcomes. (4) Release — consciously choose to let it go, fully, without carrying it.",
          "Most professionals skip Stage 1 intervention because it feels awkward. The skill being trained here is tolerating that slight awkwardness to prevent the much larger awkwardness of a full conflict.",
          "Micro-conversations are the opposite of the 'storing up grievances' pattern. They keep the relational ledger current and prevent the weight of unspoken friction from accumulating.",
        ],
        tool: "Stage 1 Conversation Scripts",
        quiz: [
          {
            q: "Why is Stage 1 intervention described as highest-leverage?",
            options: [
              "It's easier because emotions are less intense",
              "Addressing friction early costs very little and prevents exponential escalation",
              "Stage 1 is the only point where intervention is possible",
              "It impresses colleagues with your self-control",
            ],
            correct: 1,
          },
          {
            q: "Which of these is NOT one of the four Stage 1 responses?",
            options: ["Acknowledge", "Clarify", "Confront", "Release"],
            correct: 2,
          },
          {
            q: "Most professionals skip Stage 1 intervention because:",
            options: [
              "They lack the language",
              "It feels awkward, even though the alternative costs more",
              "It requires management approval",
              "Stage 1 friction always resolves on its own",
            ],
            correct: 1,
          },
        ],
      },
      {
        id: "t2l4",
        num: "04",
        title: "Pattern Interrupts",
        duration: "22 min",
        type: "workshop",
        description:
          "Patterns are more dangerous than single events. This module identifies recurring conflict loops and installs interrupts before they complete.",
        objectives: [
          "Identify your top recurring conflict pattern",
          "Map the pattern's sequence: trigger → thought → behavior → outcome",
          "Design a personalized pattern interrupt for each sequence",
        ],
        content: [
          "A conflict pattern is a loop — the same trigger, the same response, the same outcome — repeating with different people and different surface-level content but identical underlying structure. If you've had the same fight more than twice, it's a pattern.",
          "Pattern mapping: Write out the most recent version of your recurring conflict. Now write the version from two years ago. Now five years ago. Notice the structure. Different cast, same script. That structure is what we're interrupting.",
          "Pattern interrupts work by inserting a new behavior at the earliest detectable point in the sequence — typically at the trigger recognition, before the automated thought fires. The interrupt doesn't have to be elaborate: a pause, a breath, a walk to the bathroom, a glass of water.",
          "The goal is not to eliminate the trigger — it's to break the automated chain from trigger → old behavior. Even a 3-second pause creates enough neural distance for the prefrontal cortex to come back online.",
        ],
        tool: "Pattern Interrupt Design Template",
        quiz: [
          {
            q: "A conflict pattern is best defined as:",
            options: [
              "A single intense conflict event",
              "The same trigger-response-outcome loop repeating across different contexts",
              "Any workplace disagreement lasting more than a day",
              "A conflict involving more than two parties",
            ],
            correct: 1,
          },
          {
            q: "Pattern interrupts should be inserted at:",
            options: [
              "The outcome stage, to repair damage",
              "The behavior stage, to change the action",
              "The earliest detectable point — typically at trigger recognition",
              "The thought stage, to reframe",
            ],
            correct: 2,
          },
          {
            q: "Even a 3-second pause is effective because:",
            options: [
              "It shows emotional control to others",
              "It creates neural distance that allows the prefrontal cortex to re-engage",
              "Most people won't notice a 3-second delay",
              "It resets the nervous system completely",
            ],
            correct: 1,
          },
        ],
      },
      {
        id: "t2l5",
        num: "05",
        title: "Response Protocols",
        duration: "20 min",
        type: "video",
        description:
          "Pre-built response frameworks for the most common high-stakes workplace moments.",
        objectives: [
          "Apply the PAUSE protocol to high-activation situations",
          "Use the REFRAME script for receiving criticism without defensiveness",
          "Master the EXIT protocol for gracefully leaving escalating conversations",
        ],
        content: [
          "The PAUSE Protocol (for Stage 2-3 moments): P — Physiological brake (one slow breath). A — Acknowledge what's happening internally. U — Understand what's at stake before responding. S — Select your response intentionally. E — Execute with measured tone and pace.",
          "The REFRAME Script (for receiving criticism): 'Let me make sure I understand...' [paraphrase] '...Is that right?' [wait] 'I appreciate you bringing this to me. Give me a moment to think about what you're pointing to.' This script disarms defensiveness because it moves toward the feedback instead of away from it.",
          "The EXIT Protocol (for leaving escalating conversations): 'I want to have this conversation and I want to do it right. I need 20 minutes. Can we set a specific time to continue?' This preserves the relationship and the conversation while buying regulation time.",
          "Protocols are not scripts for every situation — they are structures that prevent the worst-case automatic behaviors while your full cognitive capacity returns.",
        ],
        tool: "Response Protocol Quick-Reference Card",
        quiz: [
          {
            q: "In the PAUSE Protocol, the 'A' step stands for:",
            options: [
              "Assert your position clearly",
              "Acknowledge what's happening internally",
              "Ask the other person a question",
              "Analyze the conflict",
            ],
            correct: 1,
          },
          {
            q: "The REFRAME Script works by:",
            options: [
              "Quickly pointing out the flaws in the criticism",
              "Moving toward the feedback instead of away from it",
              "Delaying the conversation until emotions settle",
              "Asking for feedback in writing",
            ],
            correct: 1,
          },
          {
            q: "The EXIT Protocol includes which key element?",
            options: [
              "Expressing frustration before leaving",
              "Setting a specific time to continue the conversation",
              "Sending a follow-up email immediately",
              "Involving a manager or mediator",
            ],
            correct: 1,
          },
        ],
      },
      {
        id: "t2l6",
        num: "06",
        title: "Live De-Escalation Workshop",
        duration: "60 min",
        type: "live",
        isLive: true,
        description:
          "Live facilitated workshop with real-time escalation scenario practice and facilitator feedback.",
        objectives: [
          "Practice the Escalation Ladder in live conflict scenarios",
          "Receive real-time feedback on your Stage 1 intervention language",
          "Build your personal De-Escalation Protocol card",
        ],
        content: [
          "This live workshop uses structured roleplay to practice the tools from Track 02 in real time. You'll work through three escalation scenarios, applying the Ladder, pattern interrupts, and response protocols with immediate facilitator feedback.",
          "Format: Brief and framing (10 min) → Scenario 1: Stage 2-3 friction (15 min) → Scenario 2: Pattern interrupt practice (15 min) → Scenario 3: Full escalation recovery (10 min) → Personal Protocol Card build (10 min).",
          "Come prepared with a real situation from your workplace. We'll run it live.",
        ],
        tool: "Personal De-Escalation Protocol Card",
        quiz: [],
      },
    ],
  },

  {
    id: "t3",
    num: "03",
    tag: "Self Mastery",
    title: "Know Yourself, Lead Yourself",
    subtitle: "Identity Architecture · Assumption Audit · 90-Day Shift Plan",
    color: "#A855F7",
    totalTime: "~3 hrs",
    description:
      "Leadership begins with self-knowledge. This track uses neuroscience and the Law of Assumption to map your current identity architecture and build a 90-day plan to lead from the next version of you.",
    lessons: [
      {
        id: "t3l1",
        num: "01",
        title: "Identity Architecture",
        duration: "22 min",
        type: "video",
        description:
          "Your professional behavior is downstream of your self-concept. This module maps the architecture of identity and how it drives performance.",
        objectives: [
          "Define identity as a habitual assumption, not a fixed trait",
          "Identify the three layers of professional identity: Core, Adaptive, Performed",
          "Locate the gap between current identity and desired leadership identity",
        ],
        content: [
          "Identity is not who you are — it's who you assume yourself to be. Neville Goddard called it 'the assumption of the feeling of the wish fulfilled.' Neuroscience calls it the brain's predictive processing model of self. Both point to the same truth: identity is programmable.",
          "Three layers of professional identity: Core Identity (the beliefs about yourself you rarely question), Adaptive Identity (how you shift based on context, role, and audience), Performed Identity (the professional persona you consciously project). Most people only work on the outermost layer.",
          "The Reticular Activating System (RAS) filters reality through the lens of your current identity. It selects evidence that confirms what you already believe about yourself and filters out contradicting evidence. To change outcomes, you must first change the filter.",
          "Your leadership ceiling is set by your Core Identity assumptions. The professional who believes 'I'm not a strategic thinker' will consistently act in ways that confirm this — not because it's true, but because the RAS makes it feel true.",
        ],
        tool: "Identity Architecture Map",
        quiz: [
          {
            q: "In this framework, identity is best described as:",
            options: [
              "A fixed set of personality traits determined by genetics",
              "A habitual assumption — programmable through repeated internal rehearsal",
              "The sum of your professional achievements",
              "How others perceive you at work",
            ],
            correct: 1,
          },
          {
            q: "The Reticular Activating System (RAS) affects professional performance by:",
            options: [
              "Boosting energy during high-stakes moments",
              "Filtering reality through current identity — confirming existing self-beliefs",
              "Regulating stress hormone release",
              "Improving memory under pressure",
            ],
            correct: 1,
          },
          {
            q: "The three layers of professional identity are:",
            options: [
              "Public, private, and subconscious",
              "Core, Adaptive, and Performed",
              "Conscious, unconscious, and behavioral",
              "Past, present, and future",
            ],
            correct: 1,
          },
        ],
      },
      {
        id: "t3l2",
        num: "02",
        title: "The Four Archetypes",
        duration: "25 min",
        type: "workshop",
        description:
          "Four identity archetypes found in high-pressure workplaces — and how to recognize which one is running you in key moments.",
        objectives: [
          "Identify the four professional archetypes: Performer, Protector, Prover, Sovereign",
          "Recognize which archetype runs you in high-stakes moments",
          "Understand the need each archetype is meeting and its professional cost",
        ],
        content: [
          "The Performer: Defines worth through accomplishment and external validation. Shows up brilliantly when recognized; collapses or withdraws when overlooked. Core belief: 'I am my results.' Professional cost: Inconsistency under conditions of low visibility.",
          "The Protector: Avoids risk, criticism, and exposure by playing small, pleasing others, or staying invisible. Shows up as reliability but rarely as innovation. Core belief: 'Safety comes from not standing out.' Professional cost: Under-contribution and resentment.",
          "The Prover: Must demonstrate competence and intelligence, especially when challenged. Shows up as expertise but also as defensiveness and difficulty receiving feedback. Core belief: 'I must never be seen as inadequate.' Professional cost: Difficulty collaborating and learning.",
          "The Sovereign: Operates from internal authority, not external approval. Shows up consistently regardless of recognition, criticism, or visibility. Core belief: 'My value is not contingent.' This is the archetype this track is building.",
          "Important: All four archetypes exist in everyone. The goal is not to eliminate the others — it's to know which one is driving and to have the ability to choose.",
        ],
        tool: "Archetype Recognition Journal",
        quiz: [
          {
            q: "The Sovereign archetype's core belief is:",
            options: [
              "'I am my results'",
              "'Safety comes from not standing out'",
              "'I must never be seen as inadequate'",
              "'My value is not contingent on external approval'",
            ],
            correct: 3,
          },
          {
            q: "The Prover's professional cost is:",
            options: [
              "Inconsistency under low-visibility conditions",
              "Under-contribution and resentment",
              "Difficulty collaborating and receiving feedback",
              "Overconfidence in unfamiliar domains",
            ],
            correct: 2,
          },
          {
            q: "The goal of the Four Archetypes framework is:",
            options: [
              "To eliminate the Performer, Protector, and Prover",
              "To identify which archetype is most aligned with your job role",
              "To develop awareness of which one is driving, and the ability to choose",
              "To assign archetypes to team members for better collaboration",
            ],
            correct: 2,
          },
        ],
      },
      {
        id: "t3l3",
        num: "03",
        title: "The Assumption Audit",
        duration: "22 min",
        type: "workshop",
        description:
          "Surface the unconscious assumptions that are producing your current professional reality.",
        objectives: [
          "Define an assumption as a belief held with feeling that the subconscious treats as fact",
          "Complete a professional Assumption Audit across five domains",
          "Identify the primary limiting assumption shaping current career trajectory",
        ],
        content: [
          "An assumption, in the Neville Goddard sense, is not a belief you hold — it's a belief that holds you. It operates beneath conscious reasoning and instructs the RAS what evidence to select and what opportunities to recognize.",
          "The five audit domains: (1) Assumptions about your capability ('I'm not the type who...'), (2) Assumptions about authority ('People like me don't get...'), (3) Assumptions about recognition ('My work speaks for itself, I shouldn't have to...'), (4) Assumptions about conflict ('Bringing this up will only make things worse'), (5) Assumptions about leadership ('I'm not ready to...').",
          "The Assumption Audit process: For each domain, complete the sentence 'I assume that when it comes to [domain], I am someone who...' Write without editing. The raw, uncurated version is the data.",
          "Once surfaced, the primary limiting assumption becomes the target of the 90-Day Identity Shift Plan. You don't argue with an assumption — you replace it by repeatedly inhabiting its opposite, with feeling, until the new assumption becomes automatic.",
        ],
        tool: "Professional Assumption Audit",
        quiz: [
          {
            q: "A limiting assumption differs from an ordinary belief in that it:",
            options: [
              "Is always false",
              "Is consciously held and easy to examine",
              "Operates beneath reasoning and instructs the RAS what to select",
              "Changes based on context",
            ],
            correct: 2,
          },
          {
            q: "The correct way to address a limiting assumption, according to this module, is to:",
            options: [
              "Argue with it using evidence and logic",
              "Replace it by repeatedly inhabiting its opposite with feeling",
              "Discuss it with a mentor or coach",
              "Identify its origin in childhood or past experiences",
            ],
            correct: 1,
          },
          {
            q: "The Assumption Audit should be completed:",
            options: [
              "As quickly as possible to avoid overthinking",
              "Raw and uncurated — the first-draft version is the data",
              "With a colleague or partner for objectivity",
              "Based on evidence from your performance reviews",
            ],
            correct: 1,
          },
        ],
      },
      {
        id: "t3l4",
        num: "04",
        title: "The SATS Stack",
        duration: "25 min",
        type: "video",
        description:
          "State Akin to Sleep — the nightly practice for reprogramming professional identity at the subconscious level.",
        objectives: [
          "Understand why the hypnagogic state is the optimal window for identity reprogramming",
          "Build a personalized SATS stack for professional identity shift",
          "Design a specific, sensory-rich scene that implies the desired identity",
        ],
        content: [
          "State Akin to Sleep (SATS) is the hypnagogic state — the threshold between waking and sleep where brain wave activity shifts from beta/alpha to theta. In this state, the critical faculty — the part of the mind that filters and rejects new beliefs — relaxes. New programming enters directly.",
          "For professional identity shift, the SATS scene must imply, not chase. Don't imagine receiving a promotion — imagine a conversation you'd have after having held that position for a year. The implication of already-being creates a different neural pattern than the wanting of still-becoming.",
          "Building your SATS scene: Choose one primary assumption you want to replace. Design a brief scene (30 seconds to 2 minutes) that implies its opposite is already true. Make it sensory: What are you hearing? Feeling in your body? What would someone say to you in this state? How does it feel — from the inside?",
          "Consistency matters more than duration. Five minutes at the hypnagogic threshold, five nights per week, for 90 days creates measurable identity shift. This is not metaphor — this is how repetitive neural activation changes default brain states.",
        ],
        tool: "SATS Scene Design Worksheet",
        quiz: [
          {
            q: "The hypnagogic state is optimal for identity work because:",
            options: [
              "The body is fully relaxed, making visualization easier",
              "The critical faculty relaxes, allowing new programming to enter directly",
              "The subconscious is most active during this period",
              "Dream content is most vivid and memorable in this state",
            ],
            correct: 1,
          },
          {
            q: "A correct SATS scene implies, not chases. This means:",
            options: [
              "Imagining receiving what you want rather than having it",
              "Imagining a conversation or moment that implies the desired state is already true",
              "Keeping the scene vague to avoid limitation",
              "Focusing on the feeling of wanting rather than having",
            ],
            correct: 1,
          },
          {
            q: "The recommended SATS practice for Track 03 is:",
            options: [
              "30 minutes daily, preferably in the morning",
              "5 minutes at the hypnagogic threshold, 5 nights per week, for 90 days",
              "As long as needed until the visualization feels real",
              "Weekly sessions of 20+ minutes for maximum impact",
            ],
            correct: 1,
          },
        ],
      },
      {
        id: "t3l5",
        num: "05",
        title: "90-Day Identity Shift Plan",
        duration: "25 min",
        type: "capstone",
        description:
          "Build your personalized 90-day plan to shift from the current identity to the Sovereign professional identity.",
        objectives: [
          "Complete the 90-Day Identity Shift Plan template",
          "Set 30/60/90-day behavioral markers for tracking the shift",
          "Choose an accountability partner and structure your check-in protocol",
        ],
        content: [
          "The 90-Day Identity Shift Plan is not a goal-setting exercise — it's an identity engineering document. The distinction matters: goals aim at outcomes, identity shifts change the self that produces outcomes. The plan works backward from who you want to be, not what you want to have.",
          "Plan structure: (1) Current assumption being replaced [precise language]. (2) Target identity statement [present tense, felt sense]. (3) Daily SATS scene [described in sensory detail]. (4) 30-day behavioral marker [the first observable change in your behavior]. (5) 60-day marker [deeper shift]. (6) 90-day marker [the behavior that would confirm the identity has shifted].",
          "Accountability structure: Choose one person who will hold you to your markers — not by motivation, but by honest witness. The check-in questions: 'Are you doing the nightly stack?' and 'Describe a moment this week when the new identity showed up.'",
          "The plan works because identity shifts precede behavioral change, not the other way around. When you inhabit the felt sense of the Sovereign professional long enough, the behaviors become automatic — because they're congruent with who you now assume yourself to be.",
        ],
        tool: "90-Day Identity Shift Plan Template",
        quiz: [
          {
            q: "The 90-Day Identity Shift Plan differs from standard goal-setting because:",
            options: [
              "It uses a 90-day timeline instead of annual goals",
              "It changes the self that produces outcomes, rather than targeting outcomes directly",
              "It's based on neuroscience rather than productivity principles",
              "It requires an accountability partner",
            ],
            correct: 1,
          },
          {
            q: "Behavioral markers in the plan are used to:",
            options: [
              "Track productivity metrics over 90 days",
              "Replace the SATS practice when motivation is low",
              "Observe the first external signs that the internal identity shift is taking hold",
              "Measure performance improvement for HR records",
            ],
            correct: 2,
          },
          {
            q: "Identity shifts precede behavioral change because:",
            options: [
              "Behavior is a leading indicator of identity",
              "When you inhabit a new identity long enough, congruent behaviors become automatic",
              "Setting intentions creates neural pathways before action",
              "The conscious mind catches up to subconscious shifts",
            ],
            correct: 1,
          },
        ],
      },
      {
        id: "t3l6",
        num: "06",
        title: "Live Identity Lab",
        duration: "60 min",
        type: "live",
        isLive: true,
        description:
          "Live session to review 90-Day Plans, run Archetype Recognition scenarios, and receive facilitator feedback on SATS scene design.",
        objectives: [
          "Present and refine your 90-Day Identity Shift Plan",
          "Receive facilitator feedback on SATS scene quality and specificity",
          "Build your Sovereign Professional Statement",
        ],
        content: [
          "This live session is the capstone for Track 03. Come with your completed 90-Day Plan and your SATS scene written out. You'll have the option to share your plan with the cohort for feedback, or work 1:1 with the facilitator.",
          "Format: 15-minute cohort check-in on archetypes → 30-minute plan review pairs → 15-minute Sovereign Professional Statement workshop.",
          "The Sovereign Professional Statement: One sentence that captures your target identity in present tense, first person, with felt sense. 'I am a professional who [behavioral quality] because [core assumption].' You'll test it against the question: Does it feel true, or does it feel like wishful thinking? If the latter, we refine until it lands.",
        ],
        tool: "Sovereign Professional Statement",
        quiz: [],
      },
    ],
  },

  {
    id: "t4",
    num: "04",
    tag: "Team Cohesion",
    title: "Vibing as a Unit",
    subtitle: "Team Frequency · Accountability Architecture · Bridge of Incidents",
    color: T.teal,
    totalTime: "~3 hrs",
    description:
      "Individual mastery is necessary but not sufficient. This track scales the internal work to the team level — creating shared frequency, collective accountability, and a culture of honest, high-trust communication.",
    lessons: [
      {
        id: "t4l1",
        num: "01",
        title: "Team Frequency Fundamentals",
        duration: "20 min",
        type: "video",
        description:
          "Teams have collective nervous systems. This module introduces Team Frequency — the shared emotional and energetic baseline of a group.",
        objectives: [
          "Define Team Frequency and how it differs from team culture",
          "Identify the four frequency states: Reactive, Managed, Responsive, and Sovereign",
          "Assess your current team's frequency state",
        ],
        content: [
          "Team Frequency is not team culture — culture is what you say you value. Frequency is what you actually feel when you walk into the room. It's the aggregate emotional state of the individuals, amplified or dampened by the system.",
          "Nervous systems co-regulate — this is established neuroscience. When a team spends enough time together, their stress responses begin to synchronize. A high-reactivity leader creates a high-reactivity team, regardless of the team's individual baseline.",
          "The four team frequency states: Reactive (chronic escalation, low trust, high blame), Managed (functional but suppressed — people comply rather than contribute), Responsive (high trust, direct communication, conflict navigated cleanly), Sovereign (peak collective state — individuals operating from internal authority in service of shared outcomes).",
          "Frequency is contagious in both directions. A single Responsive individual can shift a Managed team. A single Reactive individual can pull a Responsive team toward Managed. The goal of this track is to make Responsive the team's baseline.",
        ],
        tool: "Team Frequency Assessment",
        quiz: [
          {
            q: "Team Frequency differs from team culture in that:",
            options: [
              "Culture is measurable; frequency is subjective",
              "Culture is stated values; frequency is the actual felt emotional state of the group",
              "Frequency applies to individuals; culture applies to organizations",
              "Culture is set by leadership; frequency emerges from team members",
            ],
            correct: 1,
          },
          {
            q: "In the Managed frequency state, team members:",
            options: [
              "Operate from high trust and direct communication",
              "Comply rather than contribute — suppressed rather than expressed",
              "Experience chronic escalation and high blame",
              "Function independently without team coordination",
            ],
            correct: 1,
          },
          {
            q: "Nervous system co-regulation means:",
            options: [
              "Teams naturally balance each other's stress levels over time",
              "A team's stress responses can synchronize with a leader's physiological state",
              "Individual regulation is unnecessary when team frequency is high",
              "Emotional contagion only flows from leader to team, not team to leader",
            ],
            correct: 1,
          },
        ],
      },
      {
        id: "t4l2",
        num: "02",
        title: "Collective Assumptions",
        duration: "22 min",
        type: "workshop",
        description:
          "Teams operate from shared assumptions they never made explicit. This module surfaces and examines them.",
        objectives: [
          "Identify the five most common collective assumptions that lower team frequency",
          "Run a Team Assumption Audit with your direct reports or peers",
          "Replace the primary limiting collective assumption with a shared frequency anchor",
        ],
        content: [
          "Just as individuals operate from unconscious personal assumptions, teams operate from collective assumptions — unspoken beliefs about what's true, what's possible, and what's allowed within this team.",
          "Common collective assumptions that lower frequency: 'Conflict here always ends badly, so I keep things smooth.' / 'Leadership doesn't actually want our real feedback.' / 'People who speak up get sidelined.' / 'High performance is rewarded with more work, not advancement.' / 'Vulnerability is weakness on this team.'",
          "The Team Assumption Audit: Run this as a facilitated exercise. Each member completes five sentence stems anonymously. Aggregate the responses. The patterns that emerge are your collective assumptions — the actual operating system of the team, not the one on the org chart.",
          "A Frequency Anchor is a team-crafted statement that captures the collective identity they are choosing to inhabit. Not a value statement — a present-tense assumption: 'We are a team that navigates hard conversations directly and recovers fast.' Reviewed at the start of team meetings until it becomes internalized.",
        ],
        tool: "Team Assumption Audit + Frequency Anchor Builder",
        quiz: [
          {
            q: "A team Frequency Anchor differs from a team value statement in that:",
            options: [
              "A Frequency Anchor is shorter and easier to remember",
              "A Frequency Anchor is a present-tense assumed identity, not an aspirational value",
              "Value statements are set by leadership; Frequency Anchors are set by the team",
              "Frequency Anchors are reviewed only annually",
            ],
            correct: 1,
          },
          {
            q: "The Team Assumption Audit is most effective when:",
            options: [
              "Led by the most senior team member",
              "Responses are anonymous to surface the actual operating assumptions",
              "Done in an all-hands format with leadership present",
              "Completed individually and kept private",
            ],
            correct: 1,
          },
          {
            q: "'Leadership doesn't actually want our real feedback' is an example of:",
            options: [
              "A healthy team norm",
              "A communication breakdown between departments",
              "A collective assumption that lowers team frequency",
              "A leadership style preference",
            ],
            correct: 2,
          },
        ],
      },
      {
        id: "t4l3",
        num: "03",
        title: "Bridge of Incidents — Team Edition",
        duration: "20 min",
        type: "video",
        description:
          "When teams shift their collective frequency, the Bridge of Incidents begins — small signs in the environment that the internal shift is taking external form.",
        objectives: [
          "Define the Bridge of Incidents in a team context",
          "Distinguish between coincidence, confirmation bias, and genuine frequency shifts",
          "Build a team Bridge Moment log as a culture practice",
        ],
        content: [
          "The Bridge of Incidents is Neville Goddard's term for the chain of events that connects an internal shift to an external outcome. It's the path — often unexpected, always congruent — through which assumptions become reality.",
          "In a team context, Bridge Moments are the small, often-overlooked signs that a shift in collective frequency is producing changes in the environment. A new connection materializes. A conflict that would previously have exploded resolves cleanly. A leader who seemed resistant suddenly makes space. These are not coincidences — they are congruent reflections.",
          "The team Bridge Moment log is a shared document where members note incidents — however small — that feel like confirmation of the team's new frequency. Reviewed monthly. The act of collectively witnessing these moments strengthens the frequency that's producing them.",
          "Caution: This practice can collapse into confirmation bias if not held carefully. The standard: an incident qualifies as a Bridge Moment if it could not have happened in the team's previous frequency state. If it could have happened at any frequency, it's just an event. Be honest witnesses, not wishful thinkers.",
        ],
        tool: "Team Bridge Moment Log",
        quiz: [
          {
            q: "An incident qualifies as a Bridge Moment for the team log when:",
            options: [
              "It feels positive and morale-boosting",
              "It could not have happened in the team's previous frequency state",
              "Multiple team members independently notice it",
              "It directly relates to a project milestone",
            ],
            correct: 1,
          },
          {
            q: "The Bridge of Incidents, as applied to teams, represents:",
            options: [
              "The gap between team vision and current performance",
              "The congruent external reflections of an internal collective frequency shift",
              "The communication chain required to resolve cross-team conflict",
              "The 90-day period between frequency shifts",
            ],
            correct: 1,
          },
          {
            q: "To avoid confirmation bias in the Bridge Moment log, the team should:",
            options: [
              "Have a manager review and approve each entry",
              "Only log incidents that involve external stakeholders",
              "Apply the standard: could this have happened at any frequency, or only at this one?",
              "Limit entries to once per quarter",
            ],
            correct: 2,
          },
        ],
      },
      {
        id: "t4l4",
        num: "04",
        title: "Accountability Architecture",
        duration: "22 min",
        type: "workshop",
        description:
          "High-frequency teams hold each other accountable without shame. This module builds the architecture for clean, high-trust accountability.",
        objectives: [
          "Distinguish between accountability and blame in team dynamics",
          "Apply the Clean Miss protocol for dropping commitments without shame",
          "Build a team accountability charter with shared standards",
        ],
        content: [
          "Accountability and blame look similar from the outside — both follow a dropped commitment. The difference is internal: blame asks 'who is at fault?' Accountability asks 'what happened and what are we doing about it?'",
          "The Clean Miss Protocol: When a commitment is not met, the person who dropped it owns a four-part response: (1) Name the commitment clearly. (2) Acknowledge what happened without over-explanation. (3) State the impact. (4) Make a revised commitment. No self-flagellation, no excessive justification, no blame displacement. Clean and complete.",
          "The inverse of the Clean Miss is the Cover Story — a commitment that wasn't met, wrapped in explanation that subtly redirects responsibility. Cover stories are the most corrosive pattern in professional teams because they erode trust while appearing functional.",
          "A team accountability charter is a shared document that codifies: what 'done' means, how dropped commitments are handled, and what the team considers a Clean Miss vs. a Cover Story. Created collaboratively. Reviewed when accountability breaks down.",
        ],
        tool: "Team Accountability Charter Template",
        quiz: [
          {
            q: "The Clean Miss Protocol asks a person who dropped a commitment to:",
            options: [
              "Explain the circumstances that led to the drop",
              "Name the commitment, acknowledge what happened, state the impact, and make a revised commitment",
              "Apologize and ask for an extension",
              "Write a post-mortem report for team review",
            ],
            correct: 1,
          },
          {
            q: "A Cover Story differs from a Clean Miss in that:",
            options: [
              "A Cover Story involves external factors beyond the person's control",
              "A Clean Miss is public; a Cover Story is private",
              "A Cover Story wraps the dropped commitment in explanation that subtly redirects responsibility",
              "Cover Stories are acceptable in low-stakes situations",
            ],
            correct: 2,
          },
          {
            q: "Cover stories are described as the most corrosive team pattern because:",
            options: [
              "They take more time in team meetings",
              "They set a negative example for junior team members",
              "They erode trust while appearing functional",
              "They lead to repeated commitment failures",
            ],
            correct: 2,
          },
        ],
      },
      {
        id: "t4l5",
        num: "05",
        title: "Navigating Pressure Together",
        duration: "22 min",
        type: "video",
        description:
          "High-pressure moments are frequency tests. This module builds the team protocols for maintaining collective coherence under stress.",
        objectives: [
          "Apply the Pressure Protocol for keeping team frequency stable in crisis",
          "Use the Collective Pause as a team regulation tool",
          "Build a post-pressure debrief practice that prevents frequency regression",
        ],
        content: [
          "Every team faces high-pressure moments — a missed deadline, a client crisis, a conflict that threatens the project. These moments are not problems to solve; they are frequency tests. How the team responds reveals — and reinforces — their actual frequency.",
          "The Pressure Protocol: When a high-stress event occurs, one team member calls a Collective Pause. Format: 60-second silence. Then, one question from the designated driver: 'What's actually needed right now?' Not 'who's to blame,' not 'how bad is it' — just 'what's needed.' This simple structure moves the team from reactive to responsive in under two minutes.",
          "Post-pressure debrief: Within 24 hours of a high-pressure event, a brief team conversation (15-20 minutes): What happened to our frequency during that? What worked? What would we do differently? Not a performance review — a frequency audit. Teams that debrief build stronger frequency than teams that don't.",
          "Pressure reveals identity — both individual and collective. The team that can navigate pressure while maintaining their Frequency Anchor becomes a demonstrably different kind of team. This is the outcome of Track 04.",
        ],
        tool: "Pressure Protocol Card + Debrief Template",
        quiz: [
          {
            q: "The Collective Pause begins with:",
            options: [
              "A brief status update from the team leader",
              "A 60-second silence followed by 'What's actually needed right now?'",
              "A review of the team's Frequency Anchor statement",
              "Identification of who is responsible for the pressure event",
            ],
            correct: 1,
          },
          {
            q: "The post-pressure debrief is primarily a:",
            options: [
              "Performance review to identify what went wrong",
              "Frequency audit — examining how the team's state was affected and what would be different",
              "Accountability session to assign responsibility",
              "Planning meeting for the next high-pressure scenario",
            ],
            correct: 1,
          },
          {
            q: "High-pressure moments are described in this module as:",
            options: [
              "Obstacles that must be minimized through better project management",
              "Inevitable team failures that build resilience over time",
              "Frequency tests that reveal and reinforce the team's actual state",
              "Leadership failures that can be prevented with better planning",
            ],
            correct: 2,
          },
        ],
      },
      {
        id: "t4l6",
        num: "06",
        title: "Live Team Frequency Design Session",
        duration: "90 min",
        type: "live",
        isLive: true,
        description:
          "Live facilitated session for full team participation — Frequency Anchor design, Accountability Charter build, and Team Bridge Moment ceremony.",
        objectives: [
          "Facilitate a Team Assumption Audit with your actual team",
          "Co-create and commit to a Frequency Anchor statement",
          "Build your Team Accountability Charter collaboratively",
        ],
        content: [
          "This is the Track 04 capstone — a full team session designed to be run with your actual working team, not a cohort. The facilitator guides the process; your team does the real work.",
          "Format: 20-min Team Assumption Audit (anonymous, aggregated live) → 25-min Frequency Anchor design workshop → 25-min Accountability Charter build → 20-min Team Bridge Moment ceremony (sharing early signs of the shift).",
          "Deliverables: Your team leaves with a completed Frequency Anchor statement, a co-signed Accountability Charter, and a shared Bridge Moment log to begin populating.",
          "This session can be run in-person or virtually. Minimum team size: 3. Maximum recommended: 12. For larger teams, run in sub-groups and aggregate.",
        ],
        tool: "Team Frequency Design Session Facilitation Guide",
        quiz: [],
      },
    ],
  },
];

// ─── Props ─────────────────────────────────────────────────────────────────────
export interface WorkplaceLessonPlayerProps {
  initialTrackId?: string;
  initialLessonId?: string;
  externalProgress?: Record<string, string[]>;
  allowedTracks?: string[];
  onLessonComplete?: (trackId: string, lessonId: string) => void;
  onNavigate?: (trackId: string, lessonId: string) => void;
  userTier?: string;
}

// ─── Progress ring ─────────────────────────────────────────────────────────────
function ProgressRing({
  progress, size = 36, stroke = 3, color = T.orange,
}: { progress: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * progress;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.4s ease" }} />
    </svg>
  );
}

// ─── Quiz component ────────────────────────────────────────────────────────────
function QuizGate({
  questions, color, onPass,
}: { questions: QuizQuestion[]; color: string; onPass: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  function submit() {
    let s = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) s++; });
    setScore(s);
    setSubmitted(true);
    if (s === questions.length) {
      setTimeout(onPass, 1400);
    }
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  }

  const passed = submitted && score === questions.length;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div style={{ padding: "24px 28px", background: T.card, borderRadius: 12,
      border: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: "0.14em", marginBottom: 18 }}>
        MODULE QUIZ — PASS TO COMPLETE
      </div>

      {questions.map((q, qi) => (
        <div key={qi} style={{ marginBottom: 22 }}>
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: T.cream, lineHeight: 1.5 }}>
            {qi + 1}. {q.q}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              let bg = selected ? `${color}22` : "transparent";
              let borderColor = selected ? color : T.border;
              let textColor = selected ? color : T.gray;
              if (submitted) {
                if (oi === q.correct) { bg = "#22C55E22"; borderColor = "#22C55E"; textColor = "#22C55E"; }
                else if (selected && oi !== q.correct) { bg = "#EF444422"; borderColor = "#EF4444"; textColor = "#EF4444"; }
              }
              return (
                <button key={oi} disabled={submitted}
                  onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    borderRadius: 8, border: `1px solid ${borderColor}`, background: bg,
                    color: textColor, fontSize: 13, cursor: submitted ? "default" : "pointer",
                    textAlign: "left", transition: "all 0.12s",
                  }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%",
                    border: `1.5px solid ${borderColor}`, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 10, flexShrink: 0 }}>
                    {submitted && oi === q.correct ? "✓" : submitted && selected ? "✗" : String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button onClick={submit} disabled={!allAnswered}
          style={{
            padding: "11px 28px", background: allAnswered ? color : T.muted,
            color: T.white, border: "none", borderRadius: 8, fontWeight: 700,
            fontSize: 12, cursor: allAnswered ? "pointer" : "not-allowed",
            letterSpacing: "0.1em",
          }}>
          SUBMIT ANSWERS
        </button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {passed ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ fontSize: 13, fontWeight: 700, color: T.green, letterSpacing: "0.08em" }}>
              ✓ PASSED — {score}/{questions.length} correct. Marking complete...
            </motion.div>
          ) : (
            <>
              <span style={{ fontSize: 13, color: T.red, fontWeight: 700 }}>
                {score}/{questions.length} correct — review and retry
              </span>
              <button onClick={reset}
                style={{ padding: "9px 20px", background: T.card, border: `1px solid ${T.border}`,
                  color: T.gray, borderRadius: 8, fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                RETRY
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main player ───────────────────────────────────────────────────────────────
export default function WorkplaceLessonPlayer({
  initialTrackId = "t1",
  initialLessonId = "t1l1",
  externalProgress = {},
  allowedTracks = ["t1"],
  onLessonComplete,
  onNavigate,
  userTier = "seeker",
}: WorkplaceLessonPlayerProps) {
  const [activeTrackId, setActiveTrackId] = useState(initialTrackId);
  const [activeLessonId, setActiveLessonId] = useState(initialLessonId);
  const [completedMap, setCompletedMap] = useState<Record<string, string[]>>(externalProgress);
  const [quizPassed, setQuizPassed] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tab, setTab] = useState<"content" | "quiz">("content");

  // Sync external progress
  useEffect(() => { setCompletedMap(externalProgress); }, [externalProgress]);

  const activeTrack = TRACKS.find(t => t.id === activeTrackId) ?? TRACKS[0];
  const activeLesson = activeTrack.lessons.find(l => l.id === activeLessonId) ?? activeTrack.lessons[0];
  const isCompleted = (tid: string, lid: string) => completedMap[tid]?.includes(lid) ?? false;
  const trackProgress = (tid: string) => {
    const track = TRACKS.find(t => t.id === tid);
    if (!track) return 0;
    const done = completedMap[tid]?.length ?? 0;
    return done / track.lessons.length;
  };

  function navigate(trackId: string, lessonId: string) {
    setActiveTrackId(trackId);
    setActiveLessonId(lessonId);
    setTab("content");
    onNavigate?.(trackId, lessonId);
  }

  function handleComplete() {
    if (isCompleted(activeTrackId, activeLessonId)) return;
    setCompletedMap(prev => ({
      ...prev,
      [activeTrackId]: [...(prev[activeTrackId] ?? []), activeLessonId],
    }));
    onLessonComplete?.(activeTrackId, activeLessonId);

    // Auto-advance to next lesson
    const lessonIdx = activeTrack.lessons.findIndex(l => l.id === activeLessonId);
    const next = activeTrack.lessons[lessonIdx + 1];
    if (next) setTimeout(() => navigate(activeTrackId, next.id), 600);
  }

  function handleQuizPass() {
    setQuizPassed(prev => ({ ...prev, [activeLessonId]: true }));
    handleComplete();
  }

  const hasQuiz = activeLesson.quiz.length > 0;
  const alreadyCompleted = isCompleted(activeTrackId, activeLessonId);

  return (
    <div style={{
      display: "flex", height: "100vh", background: T.dark, color: T.cream,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif", overflow: "hidden",
    }}>
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{
              width: 280, background: T.darkMid, borderRight: `1px solid ${T.border}`,
              display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto",
            }}>
            {/* Logo */}
            <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: T.orange,
                fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.1em" }}>
                VIBE HYR
              </div>
              <div style={{ fontSize: 9, color: T.muted, letterSpacing: "0.16em", marginTop: 2 }}>
                WORKPLACE TRAINING SERIES
              </div>
            </div>

            {/* Track list */}
            <div style={{ padding: "12px 0", flex: 1 }}>
              {TRACKS.map(track => {
                const locked = !allowedTracks.includes(track.id);
                const prog = trackProgress(track.id);
                const activeT = track.id === activeTrackId;

                return (
                  <div key={track.id} style={{ marginBottom: 2 }}>
                    {/* Track header */}
                    <button
                      onClick={() => !locked && navigate(track.id, track.lessons[0].id)}
                      disabled={locked}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 16px", background: activeT ? `${track.color}18` : "transparent",
                        border: "none", cursor: locked ? "not-allowed" : "pointer",
                        borderLeft: `3px solid ${activeT ? track.color : "transparent"}`,
                        transition: "all 0.15s",
                      }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <ProgressRing progress={prog} size={32} stroke={2.5} color={track.color} />
                        <span style={{
                          position: "absolute", inset: 0, display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 8, fontWeight: 700,
                          color: locked ? T.muted : track.color,
                        }}>
                          {locked ? "🔒" : `${Math.round(prog * 100)}%`}
                        </span>
                      </div>
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{ fontSize: 9, letterSpacing: "0.12em", fontWeight: 700,
                          color: locked ? T.muted : track.color }}>
                          TRACK {track.num} · {track.tag.toUpperCase()}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: locked ? T.muted : T.cream,
                          lineHeight: 1.3, marginTop: 1 }}>
                          {track.title}
                        </div>
                      </div>
                    </button>

                    {/* Lesson list (expanded when track active) */}
                    {activeT && (
                      <div style={{ paddingLeft: 55 }}>
                        {track.lessons.map(lesson => {
                          const done = isCompleted(track.id, lesson.id);
                          const active = lesson.id === activeLessonId;
                          return (
                            <button key={lesson.id}
                              onClick={() => navigate(track.id, lesson.id)}
                              style={{
                                width: "100%", display: "flex", alignItems: "center", gap: 8,
                                padding: "7px 12px 7px 0", background: "transparent", border: "none",
                                cursor: "pointer", textAlign: "left",
                                borderLeft: `2px solid ${active ? track.color : "transparent"}`,
                                paddingLeft: 10,
                              }}>
                              <span style={{
                                width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                                background: done ? track.color : "transparent",
                                border: `1.5px solid ${done ? track.color : active ? track.color : T.border}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 8, color: T.dark,
                              }}>
                                {done ? "✓" : ""}
                              </span>
                              <span style={{
                                fontSize: 11, color: active ? T.cream : done ? T.gray : T.muted,
                                fontWeight: active ? 600 : 400, lineHeight: 1.35,
                              }}>
                                {lesson.isLive && <span style={{ color: T.orange }}>⚡ </span>}
                                {lesson.num}. {lesson.title}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tier badge */}
            <div style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}`,
              fontSize: 9, letterSpacing: "0.14em", color: T.muted, textTransform: "uppercase" }}>
              Tier: <span style={{ color: T.gold, fontWeight: 700 }}>{userTier.replace("_", " ")}</span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{
          height: 52, display: "flex", alignItems: "center", gap: 14,
          padding: "0 24px", borderBottom: `1px solid ${T.border}`,
          background: T.darkMid, flexShrink: 0,
        }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ background: "none", border: "none", cursor: "pointer",
              color: T.gray, fontSize: 18, lineHeight: 1, padding: 0 }}>
            ☰
          </button>
          <div style={{ fontSize: 9, color: T.muted, letterSpacing: "0.14em" }}>
            TRACK {activeTrack.num}
          </div>
          <span style={{ color: T.border }}>›</span>
          <div style={{ fontSize: 11, color: T.cream, fontWeight: 600 }}>
            {activeLesson.isLive && <span style={{ color: T.orange }}>⚡ </span>}
            {activeLesson.title}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 10, color: T.muted }}>{activeLesson.duration}</span>
            {alreadyCompleted && (
              <span style={{ fontSize: 10, color: T.green, fontWeight: 700,
                background: "#22C55E18", padding: "3px 10px", borderRadius: 10 }}>
                ✓ COMPLETE
              </span>
            )}
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Lesson header */}
          <div style={{
            padding: "32px 40px 28px",
            background: `linear-gradient(135deg, ${T.darkMid} 0%, ${T.dark} 100%)`,
            borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: activeTrack.color,
                letterSpacing: "0.16em", background: `${activeTrack.color}18`,
                padding: "3px 10px", borderRadius: 10 }}>
                {activeTrack.tag.toUpperCase()}
              </span>
              {activeLesson.isLive && (
                <span style={{ fontSize: 9, fontWeight: 700, color: T.orange,
                  background: `${T.orange}18`, padding: "3px 10px", borderRadius: 10,
                  letterSpacing: "0.1em" }}>
                  ⚡ LIVE SESSION
                </span>
              )}
              <span style={{ fontSize: 10, color: T.muted, marginLeft: "auto" }}>
                Module {activeLesson.num} of {activeTrack.lessons.length}
              </span>
            </div>

            <h1 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3vw, 36px)",
              fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em",
              fontWeight: 400, color: T.cream, lineHeight: 1.1 }}>
              {activeLesson.title}
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: T.gray, lineHeight: 1.6, maxWidth: 640 }}>
              {activeLesson.description}
            </p>

            {/* Objectives */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.16em", color: T.muted,
                fontWeight: 700, marginBottom: 10 }}>LEARNING OBJECTIVES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeLesson.objectives.map((obj, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: activeTrack.color, fontSize: 12, lineHeight: 1.6,
                      flexShrink: 0 }}>◈</span>
                    <span style={{ fontSize: 13, color: T.gray, lineHeight: 1.6 }}>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs (content / quiz) */}
          {hasQuiz && (
            <div style={{ display: "flex", gap: 0, padding: "0 40px",
              borderBottom: `1px solid ${T.border}`, background: T.darkMid }}>
              {(["content", "quiz"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    padding: "12px 20px", background: "none", border: "none",
                    borderBottom: `2px solid ${tab === t ? activeTrack.color : "transparent"}`,
                    color: tab === t ? T.cream : T.muted, fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.15s",
                    textTransform: "uppercase",
                  }}>
                  {t === "content" ? "📖 Module Content" : "✦ Quiz Gate"}
                </button>
              ))}
            </div>
          )}

          {/* Body */}
          <div style={{ padding: "32px 40px", maxWidth: 800 }}>
            <AnimatePresence mode="wait">
              {tab === "content" ? (
                <motion.div key="content" initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                  {/* Content blocks */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
                    {activeLesson.content.map((block, i) => (
                      <p key={i} style={{ margin: 0, fontSize: 15, color: T.gray,
                        lineHeight: 1.8, borderLeft: i === 0 ? `3px solid ${activeTrack.color}` : "none",
                        paddingLeft: i === 0 ? 18 : 0, fontStyle: i === 0 ? "italic" : "normal" }}>
                        {block}
                      </p>
                    ))}
                  </div>

                  {/* Tool / worksheet */}
                  {activeLesson.tool && (
                    <div style={{
                      background: `${activeTrack.color}0F`,
                      border: `1px solid ${activeTrack.color}44`,
                      borderRadius: 10, padding: "16px 20px", marginBottom: 28,
                    }}>
                      <div style={{ fontSize: 9, letterSpacing: "0.16em", fontWeight: 700,
                        color: activeTrack.color, marginBottom: 4 }}>MODULE TOOL</div>
                      <div style={{ fontSize: 13, color: T.cream, fontWeight: 600 }}>
                        {activeLesson.tool}
                      </div>
                      <p style={{ margin: "6px 0 0", fontSize: 12, color: T.gray }}>
                        Download or access in your workbook. Complete before the next module.
                      </p>
                    </div>
                  )}

                  {/* Live session booking */}
                  {activeLesson.isLive && (
                    <div style={{
                      background: `${T.orange}12`,
                      border: `1px solid ${T.orange}55`,
                      borderRadius: 12, padding: "20px 24px", marginBottom: 28,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.orange,
                        letterSpacing: "0.1em", marginBottom: 8 }}>⚡ LIVE SESSION REQUIRED</div>
                      <p style={{ margin: "0 0 14px", fontSize: 13, color: T.gray, lineHeight: 1.6 }}>
                        This module is a live facilitated session. Book your spot to complete this track.
                      </p>
                      <button style={{
                        padding: "10px 24px", background: T.orange, color: T.white,
                        border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12,
                        cursor: "pointer", letterSpacing: "0.08em",
                      }}
                        onClick={() => window.open("#book-live-session", "_blank")}>
                        BOOK SESSION →
                      </button>
                    </div>
                  )}

                  {/* Complete button */}
                  {!hasQuiz && (
                    <button
                      onClick={alreadyCompleted ? undefined : handleComplete}
                      style={{
                        padding: "13px 32px",
                        background: alreadyCompleted ? "#22C55E22" : activeTrack.color,
                        color: alreadyCompleted ? T.green : T.white,
                        border: `1px solid ${alreadyCompleted ? "#22C55E" : activeTrack.color}`,
                        borderRadius: 10, fontWeight: 700, fontSize: 13,
                        cursor: alreadyCompleted ? "default" : "pointer",
                        letterSpacing: "0.08em", transition: "all 0.2s",
                      }}>
                      {alreadyCompleted ? "✓ MODULE COMPLETE" : "MARK COMPLETE & CONTINUE →"}
                    </button>
                  )}

                  {hasQuiz && !alreadyCompleted && (
                    <button onClick={() => setTab("quiz")}
                      style={{
                        padding: "13px 32px", background: "transparent",
                        border: `1px solid ${activeTrack.color}`, color: activeTrack.color,
                        borderRadius: 10, fontWeight: 700, fontSize: 13,
                        cursor: "pointer", letterSpacing: "0.08em",
                      }}>
                      TAKE QUIZ TO COMPLETE →
                    </button>
                  )}
                </motion.div>

              ) : (
                <motion.div key="quiz" initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {alreadyCompleted ? (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                      <p style={{ color: T.green, fontSize: 14, fontWeight: 700 }}>
                        Module already completed. Well done.
                      </p>
                    </div>
                  ) : (
                    <QuizGate
                      questions={activeLesson.quiz}
                      color={activeTrack.color}
                      onPass={handleQuizPass}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
