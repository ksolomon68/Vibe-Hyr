export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
}

export interface Lesson {
  id: string;
  num: string;
  title: string;
  duration: string;
  type: "video" | "workshop" | "live" | "capstone";
  isLive?: boolean;
  description: string;
  objectives: string[];
  content: string[];
  tool?: string;
  quiz: QuizQuestion[];
}

export interface Track {
  id: string;
  num: string;
  tag: string;
  title: string;
  subtitle: string;
  color: string;
  totalTime: string;
  description: string;
  lessons: Lesson[];
}

const T = {
  orange:  "#E8621A",
  gold:    "#C9A84C",
  purple:  "#A855F7",
  teal:    "#0F505A",
};

export const TRACKS: Track[] = [
  {
    id: "t1",
    num: "01",
    tag: "Foundation",
    title: "Common Sense in the Workplace",
    subtitle: "Awareness · Communication · Vibe Hygiene",
    color: T.orange,
    totalTime: "~2.5 hrs",
    description: "The foundational track. Before de-escalation, self-mastery, or team cohesion is possible, every professional needs a baseline level of emotional awareness, communication clarity, and personal vibe hygiene.",
    lessons: [
      {
        id: "t1l1",
        num: "01",
        title: "The Awareness Gap",
        duration: "20 min",
        type: "video",
        description: "Most workplace friction isn't caused by bad people — it's caused by unawareness.",
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
        description: "Emotions are data, not drama. This module teaches you to read your own emotional signals accurately — before they read you.",
        objectives: [
          "Identify the four primary emotion families and their workplace triggers",
          "Use the Body-Emotion-Behavior chain to anticipate your responses",
          "Develop a personal emotion vocabulary that increases precision",
        ],
        content: [
          "Emotions are not problems to eliminate — they are your nervous system's real-time assessment of your environment.",
          "The four primary emotion families: Fear, Anger, Sadness, and Shame.",
        ],
        tool: "Emotion Signal Map",
        quiz: [
          {
            q: "In this module, emotions are described as:",
            options: ["Weaknesses", "Data", "Social signals", "Random noise"],
            correct: 1,
          },
        ],
      },
      {
        id: "t1l3",
        num: "03",
        title: "Communication Architecture",
        duration: "25 min",
        type: "workshop",
        description: "The structure behind clear professional communication.",
        objectives: [
          "Apply the three-layer communication model (content, context, subtext)",
          "Distinguish between assertive, passive, and aggressive communication patterns",
          "Practice the Clarity Frame: Observation — Impact — Request",
        ],
        content: [
          "Every workplace communication operates on three simultaneous layers: Content, Context, and Subtext.",
        ],
        tool: "Clarity Frame Worksheet",
        quiz: [
          {
            q: "The three layers of communication in this model are:",
            options: ["Verbal/nonverbal/written", "Content, context, and subtext", "Speaker, listener, environment", "Thinking, feeling, acting"],
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
        description: "Know your triggers before they know you.",
        objectives: [
          "Define what a workplace trigger is at the neurological level",
          "Identify your top three personal trigger categories",
          "Build a Trigger Map",
        ],
        content: [
          "A trigger is not a feeling — it's a threat signal sent to your amygdala that hijacks your prefrontal cortex.",
        ],
        tool: "Personal Trigger Map",
        quiz: [
          {
            q: "A trigger fires in the amygdala in approximately:",
            options: ["2 seconds", "500 milliseconds", "Under 200 milliseconds", "1-2 minutes"],
            correct: 2,
          },
        ],
      },
      {
        id: "t1l5",
        num: "05",
        title: "Vibe Hygiene",
        duration: "18 min",
        type: "video",
        description: "Your nervous system is contagious.",
        objectives: [
          "Understand nervous system co-regulation",
          "Build a personalized Vibe Hygiene stack",
          "Apply Evening Revision",
        ],
        content: [
          "Nervous systems are contagious — mirror neurons mean your colleagues' brains are literally affected by your physiological state.",
        ],
        tool: "Vibe Hygiene Daily Stack",
        quiz: [
          {
            q: "Why is a dysregulated leader harmful to their team?",
            options: ["Poor decision making", "Mirror neurons cause physiological contagion", "They speak louder", "They cancel meetings"],
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
        description: "Live group session with a Vibe Hyr facilitator.",
        objectives: ["Apply concepts to case studies", "Receive feedback", "Build Integration Commitment"],
        content: ["This live session is your integration point for all five Track 01 modules."],
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
    description: "Conflict isn't the problem. Unconscious escalation is. This track installs a five-stage Escalation Ladder.",
    lessons: [
       {
        id: "t2l1",
        num: "01",
        title: "The Reactivity Spectrum",
        duration: "18 min",
        type: "video",
        description: "Why smart professionals do things they immediately regret.",
        objectives: ["Define Reactivity Spectrum", "Identify point of no return", "Understand logic loss"],
        content: ["The Reactivity Spectrum runs from baseline calm to amygdala hijack."],
        tool: "Reactivity Spectrum Self-Assessment",
        quiz: [
          {
            q: "Once in a full amygdala hijack, which is available?",
            options: ["Reasoning", "Empathy", "Physiological regulation", "Problem solving"],
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
        description: "A five-stage conflict map.",
        objectives: ["Identify all five stages", "Map recent conflict", "Calculate intervention windows"],
        content: ["Stage 1 Friction, Stage 2 Tension, Stage 3 Conflict, Stage 4 Crisis, Stage 5 Rupture."],
        tool: "Escalation Ladder Reference Card",
        quiz: [
          {
            q: "At Stage 3 (Conflict), recommended intervention is:",
            options: ["State position", "Pause protocol/recess", "Increase logic", "Express emotion"],
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
        description: "The most powerful place to intervene is Stage 1.",
        objectives: ["Master toolkit", "Practice conversations", "Build proactive habits"],
        content: ["Four Stage 1 responses: Acknowledge, Clarify, Redirect, Release."],
        tool: "Stage 1 Conversation Scripts",
        quiz: [
          {
            q: "Why is Stage 1 highest-leverage?",
            options: ["Easier intensity", "Early intervention costs little", "Only point possible", "Impresses colleagues"],
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
        description: "Patterns are more dangerous than single events.",
        objectives: ["Identify recurring patterns", "Map sequence", "Design interrupts"],
        content: ["The goal is not to eliminate the trigger — it's to break the automated chain from trigger → old behavior."],
        tool: "Pattern Interrupt Design Template",
        quiz: [
          {
            q: "A conflict pattern is defined as:",
            options: ["Single intense event", "Repeating trigger-response-outcome loop", "Disagreement > 1 day", "Multi-party conflict"],
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
        description: "Pre-built response frameworks.",
        objectives: ["Apply PAUSE protocol", "Use REFRAME script", "Master EXIT protocol"],
        content: ["The PAUSE Protocol: Physiological, Acknowledge, Understand, Select, Execute."],
        tool: "Response Protocol Quick-Reference Card",
        quiz: [
          {
            q: "In PAUSE, 'A' stands for:",
            options: ["Assert", "Acknowledge internal state", "Ask question", "Analyze"],
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
        description: "Live facilitated workshop.",
        objectives: ["Practice live", "Receive feedback", "Build protocol card"],
        content: ["This live workshop uses structured roleplay."],
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
    color: T.purple,
    totalTime: "~3 hrs",
    description: "Leadership begins with self-knowledge. This track uses neuroscience and the Law of Assumption.",
    lessons: [
       {
        id: "t3l1",
        num: "01",
        title: "Identity Architecture",
        duration: "22 min",
        type: "video",
        description: "Professional behavior is downstream of self-concept.",
        objectives: ["Define identity as assumption", "Three layers of identity", "Locate gap"],
        content: ["Identity is not who you are — it's who you assume yourself to be."],
        tool: "Identity Architecture Map",
        quiz: [
          {
            q: "In this framework, identity is:",
            options: ["Fixed traits", "Habitual assumption", "Achievements", "Perception"],
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
        description: "Four identity archetypes: Performer, Protector, Prover, Sovereign.",
        objectives: ["Identify archetypes", "Recognize driving archetype", "Understand costs"],
        content: ["The goal is not to eliminate archetypes — it's to know which one is driving and have choice."],
        tool: "Archetype Recognition Journal",
        quiz: [
          {
            q: "The Sovereign archetype's core belief is:",
            options: ["I am my results", "Safety is not standing out", "Never inadequante", "Value is not contingent"],
            correct: 3,
          },
        ],
      },
      {
        id: "t3l3",
        num: "03",
        title: "The Assumption Audit",
        duration: "22 min",
        type: "workshop",
        description: "Surface unconscious assumptions.",
        objectives: ["Define assumption", "Complete audit", "Identify limiters"],
        content: ["An assumption is not a belief you hold — it's a belief that holds you."],
        tool: "Professional Assumption Audit",
        quiz: [
          {
            q: "A limiting assumption differs from a belief because it:",
            options: ["Is false", "Consciously held", "Instructs the RAS", "Contextual"],
            correct: 2,
          },
        ],
      },
    ],
  },
  {
    id: "t4",
    num: "04",
    tag: "Team Excellence",
    title: "The High-Frequency Team",
    subtitle: "Co-Regulation · Collective Assumptions · Accountability",
    color: T.teal,
    totalTime: "~3 hrs",
    description: "High performance is a byproduct of high frequency. This track builds the team architecture for sustained excellence.",
    lessons: [
       {
        id: "t4l1",
        num: "01",
        title: "Team Frequency Mapping",
        duration: "18 min",
        type: "video",
        description: "Teams have a collective frequency. This module teaches you to map it.",
        objectives: ["Define team frequency", "Identify states", "Nervous system co-regulation"],
        content: ["Team frequency is the collective physiological and emotional state of the group."],
        tool: "Team Frequency Map",
        quiz: [
          {
            q: "Nervous system co-regulation means:",
            options: ["Natural balance", "Stress responses synchronize with leader", "Individual regulation unnecessary", "Flow is one way"],
            correct: 1,
          },
        ],
      },
    ],
  },
];
