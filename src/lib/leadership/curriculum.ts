// src/lib/leadership/curriculum.ts
// Leadership vertical — The Architecture of Impact
// 4 courses × 3 lessons + quiz + assumption lab

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number; // 0-indexed (A=0, B=1, C=2, D=3)
}

export interface AssumptionLab {
  labId: string;
  title: string;
  module: string;
  prompt: string;
  outputFormat: string[];
}

export interface Lesson {
  id: string;
  num: string;
  title: string;
  description: string;
  keyConcepts: string[];
  neuroscienceAnchor: string;
  lawAnchor: string;
}

export interface Course {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  description: string;
  durationEstimate: string;
  tierRequired: string;
  color: string;
  lessons: Lesson[];
  quiz: {
    quizId: string;
    title: string;
    passingScore: number;
    questions: QuizQuestion[];
  };
  assumptionLab: AssumptionLab;
}

const C = {
  orange: "#E8621A",
  gold:   "#C9A84C",
  purple: "#A855F7",
  teal:   "#0F505A",
};

export const COURSES: Course[] = [
  {
    id: "leadership_course_1",
    num: 1,
    title: "The Internal Authority",
    subtitle: "RAS Programming for Leaders",
    description:
      "Shift from a worker mindset to a leadership mindset by retraining your brain's filter. Leadership is not a title—it is a pattern of focus that the RAS either confirms or contradicts. This course rewires the filter.",
    durationEstimate: "45–60 min",
    tierRequired: "seeker",
    color: C.orange,
    lessons: [
      {
        id: "the-responsibility-formula",
        num: "01",
        title: "The Responsibility Formula",
        description:
          "Understanding that leadership is not a title, but 100% ownership of outcomes. Most people treat leadership as positional. Vibe Hyr treats it as neurological—a pattern of assumption the RAS is tasked with confirming.",
        keyConcepts: [
          "Leadership as identity, not rank",
          "The worker asks what to do; the leader asks what needs to be done",
          "Ownership as a neurological default, not a choice made under pressure",
        ],
        neuroscienceAnchor:
          "The RAS filters reality based on assumed identity. A leader who privately doubts their authority programs their RAS to scan for evidence of incompetence.",
        lawAnchor:
          "You do not rise to the level of your goals. You fall to the level of your assumptions about yourself as a leader.",
      },
      {
        id: "setting-the-tone",
        num: "02",
        title: "Setting the Tone",
        description:
          "How a leader's internal state determines the emotional weather of the community. The nervous systems of a group unconsciously co-regulate with the leader's. This is not metaphor—it is neuroscience. The leader's baseline state is the community's ceiling.",
        keyConcepts: [
          "Emotional contagion and nervous system co-regulation",
          "The leader as atmospheric architect",
          "Why a regulated leader produces regulated teams",
        ],
        neuroscienceAnchor:
          "Mirror neurons cause groups to unconsciously mirror the internal state of authority figures. A dysregulated leader creates a dysregulated culture regardless of policy.",
        lawAnchor:
          "The internal state of the leader is the community's dominant assumption. Change the leader's state and you change the community's reality.",
      },
      {
        id: "thinking-in-outcomes",
        num: "03",
        title: "Thinking in Outcomes",
        description:
          "Using the Reticular Activating System to filter for solutions rather than obstacles. Untrained leaders focus on what is wrong. Trained leaders program their RAS to surface what is possible. The community they see is the community they build.",
        keyConcepts: [
          "RAS as a solution-finding engine",
          "The cognitive difference between problem-focus and outcome-focus",
          "How to reprogram the filter through sustained assumption",
        ],
        neuroscienceAnchor:
          "The RAS is a goal-seeking mechanism. Without intentional programming, it defaults to threat detection. Leaders must install a new search parameter: opportunity.",
        lawAnchor:
          "Assume the thriving community exists now. Your RAS will begin surfacing the bridge of incidents required to walk you there.",
      },
    ],
    quiz: {
      quizId: "leadership_c1_quiz",
      title: "The Ownership Audit",
      passingScore: 80,
      questions: [
        {
          q: "What is the primary difference between a worker mindset and a leader mindset according to the Internal Authority framework?",
          options: [
            "A) The worker earns more; the leader earns less",
            "B) The worker asks what to do; the leader asks what needs to be done",
            "C) The leader delegates everything; the worker executes everything",
            "D) There is no meaningful difference—both focus on results",
          ],
          correct: 1,
        },
        {
          q: "Why does a leader's internal state affect the community's performance?",
          options: [
            "A) Because leaders set the rules everyone must follow",
            "B) Because mirror neurons cause groups to co-regulate with the leader's nervous system state",
            "C) Because leaders control compensation and motivation",
            "D) Because communities only perform well when morale is high",
          ],
          correct: 1,
        },
        {
          q: "What happens when the RAS is not intentionally programmed?",
          options: [
            "A) It defaults to scanning for threats, lack, and problems",
            "B) It becomes dormant and stops filtering information",
            "C) It automatically focuses on the leader's stated goals",
            "D) It operates identically to a programmed RAS",
          ],
          correct: 0,
        },
        {
          q: "According to Echo Theory, what is a leader's current community reality?",
          options: [
            "A) A product of the budget allocated to community programs",
            "B) A reflection of the community's collective effort",
            "C) A delayed echo of the leader's previous internal assumptions",
            "D) A fixed condition determined by external circumstances",
          ],
          correct: 2,
        },
        {
          q: "What is the fastest way for a leader to shift the community's trajectory?",
          options: [
            "A) Change the community's external resources and funding",
            "B) Replace underperforming members",
            "C) Shift the leader's own internal state and assumption first",
            "D) Implement a new strategic plan with measurable KPIs",
          ],
          correct: 2,
        },
      ],
    },
    assumptionLab: {
      labId: "leadership_c1_lab",
      title: "The Community Blueprint",
      module: "Reality_Architecture_Module",
      prompt:
        "Upload or describe a current community challenge you are facing. The Lab will strip away all external blame variables—funding, participation, politics, personnel—and force you to rewrite the scenario focusing only on your internal points of influence. Output: A reframed challenge statement written from 100% ownership, plus three RAS-programming assumptions to install before the next community interaction.",
      outputFormat: [
        "Reframed challenge statement (ownership language only)",
        "3 identity-level assumptions to install",
        "RAS search parameter: what your brain will now scan for",
      ],
    },
  },

  {
    id: "leadership_course_2",
    num: 2,
    title: "Visionary Architecture",
    subtitle: "SATS and Mental Rehearsal for Community Leaders",
    description:
      "A vision without a felt internal state is just a plan. This course teaches leaders to use the hypnagogic threshold to install a living, emotional picture of the thriving community—one the subconscious cannot distinguish from present reality.",
    durationEstimate: "45–60 min",
    tierRequired: "architect",
    color: C.gold,
    lessons: [
      {
        id: "the-science-of-mental-rehearsal",
        num: "01",
        title: "The Science of Mental Rehearsal",
        description:
          "Why the brain cannot distinguish between a deeply felt imaginal act and a physical event. Olympic athletes and elite military units have used this protocol for decades. Leaders who rehearse mentally before executing physically perform at a categorically higher level.",
        keyConcepts: [
          "The neurological equivalence of imagination and experience",
          "How mental rehearsal builds myelin on neural pathways",
          "The role of emotion as the activating signal in subconscious programming",
        ],
        neuroscienceAnchor:
          "Functional MRI studies show identical neural firing patterns during mental rehearsal and physical execution. The brain treats a deeply felt imaginal act as a real event—and files it as memory.",
        lawAnchor:
          "Feeling is the secret. The subconscious does not respond to information. It responds to the emotional state that accompanies the assumption.",
      },
      {
        id: "sats-for-leaders",
        num: "02",
        title: "SATS for Leaders",
        description:
          "Creating short, emotionally charged end scenes of community success using the State Akin to Sleep protocol. The hypnagogic window—the 5–10 minutes before sleep—is when the analytical filter of the prefrontal cortex is lowest. This is the leader's highest-leverage reprogramming window.",
        keyConcepts: [
          "The hypnagogic threshold as a neuroplasticity window",
          "Constructing a 5-second end scene of community impact",
          "Sensory specificity as the signal amplifier",
        ],
        neuroscienceAnchor:
          "During the hypnagogic state, theta brainwaves (4–8 Hz) dominate. The prefrontal cortex's critical filter is bypassed, allowing new assumptions to be installed directly into the Default Mode Network.",
        lawAnchor:
          "The end scene is not a visualization of the future. It is an assumption of the present—felt as already accomplished, experienced from within.",
      },
      {
        id: "the-persistence-principle",
        num: "03",
        title: "The Persistence Principle",
        description:
          "How to maintain the internal vision when current community facts contradict it. Lack of funding, low engagement, conflict, attrition—these are echoes of the previous assumption. The trained leader does not revise the vision to match current conditions. They hold the vision until current conditions match it.",
        keyConcepts: [
          "The Echo Theory delay (60–90 days) applied to community leadership",
          "Why revising the vision is the most common leadership error",
          "Mental diet as a leadership discipline",
        ],
        neuroscienceAnchor:
          "Cognitive consistency bias causes the brain to seek confirmation of whatever belief is held most persistently. A leader who maintains the vision regardless of current evidence programs the RAS to surface confirming data.",
        lawAnchor:
          "The 3D world is always reporting on the past. When conditions contradict the vision, the correct response is persistence—not revision.",
      },
    ],
    quiz: {
      quizId: "leadership_c2_quiz",
      title: "The Vision Logic Test",
      passingScore: 80,
      questions: [
        {
          q: "Why is 'feeling' considered the activating signal in subconscious programming?",
          options: [
            "A) Because emotion creates biochemical changes that reinforce memory formation",
            "B) Because positive emotions improve mood and productivity",
            "C) Because the subconscious responds to emotional state, not information or intention",
            "D) Both A and C",
          ],
          correct: 3,
        },
        {
          q: "What makes the hypnagogic window the optimal time for SATS practice?",
          options: [
            "A) The body is resting, conserving energy for morning performance",
            "B) The prefrontal cortex's analytical filter is at its lowest, allowing direct subconscious access",
            "C) Visualization is easier when the eyes are closed",
            "D) The conscious mind is fully awake and receptive",
          ],
          correct: 1,
        },
        {
          q: "What is the correct response when current community conditions contradict a leader's vision?",
          options: [
            "A) Revise the vision to align with current evidence",
            "B) Address the external conditions before returning to the vision",
            "C) Persist in the internal state; treat the external as an echo of the past",
            "D) Consult stakeholders to validate the vision's accuracy",
          ],
          correct: 2,
        },
        {
          q: "What distinguishes a '5-second end scene' from a general visualization?",
          options: [
            "A) The end scene is longer and more detailed",
            "B) The end scene is felt from within as already accomplished, not observed from outside as future",
            "C) The end scene focuses on the steps required to reach the goal",
            "D) The end scene involves other people but not the leader themselves",
          ],
          correct: 1,
        },
        {
          q: "What does neuroscience confirm about mental rehearsal and physical execution?",
          options: [
            "A) Mental rehearsal improves confidence but not performance",
            "B) The brain fires identical neural patterns during mental rehearsal and actual execution",
            "C) Mental rehearsal is only effective when combined with physical practice",
            "D) Visualization activates different brain regions than physical experience",
          ],
          correct: 1,
        },
      ],
    },
    assumptionLab: {
      labId: "leadership_c2_lab",
      title: "Hypnagogic Scripting",
      module: "SATS_Library_Module",
      prompt:
        "Define your community's '5-second end scene.' Describe a specific moment of community success—a program milestone, a member transformation, a community event—that represents your vision fully realized. Include sensory details: what you hear in the room, the handshake or acknowledgment you receive, the precise feeling of having built what you intended. The Lab will refine your scene into a SATS-ready script formatted for nightly practice.",
      outputFormat: [
        "Refined 5-second end scene (present tense, sensory-specific)",
        "SATS-ready audio script (60–90 seconds)",
        "Emotional anchor phrase for rapid state induction",
      ],
    },
  },

  {
    id: "leadership_course_3",
    num: 3,
    title: "The Bridge of Incidents",
    subtitle: "Execution, Consistency, and the Natural Unfolding",
    description:
      "Vision without execution is hallucination. This course teaches leaders to recognize the Bridge of Incidents—the chain of seemingly coincidental events that constitute the natural path from internal assumption to external reality—and to persist through the grind with precision.",
    durationEstimate: "45–60 min",
    tierRequired: "architect",
    color: C.purple,
    lessons: [
      {
        id: "walking-the-bridge",
        num: "01",
        title: "Walking the Bridge",
        description:
          "Recognizing coincidences and serendipitous events as the natural path to the community goal. The Bridge of Incidents is not luck—it is the structural mechanism by which internal state reorganizes external reality.",
        keyConcepts: [
          "The Bridge of Incidents as a structural phenomenon, not coincidence",
          "How to track synchronicity without collapsing into superstition",
          "Why the bridge accelerates when the internal state is stable",
        ],
        neuroscienceAnchor:
          "A stable internal state produces consistent behavioral signals that the social environment responds to over time. What appears as coincidence is often the compounding output of a sustained neurological pattern.",
        lawAnchor:
          "Trust the bridge. The incidents are not random—they are the 3D world reorganizing itself to match your assumption. Walk each one without demanding to see the destination.",
      },
      {
        id: "the-law-of-exchange",
        num: "02",
        title: "The Law of Exchange",
        description:
          "Understanding that value must be delivered before the community delivers support. Leaders who assume the community owes them loyalty before value is exchanged consistently fail. The law of exchange is not transactional—it is energetic.",
        keyConcepts: [
          "Service as the precondition for community momentum",
          "The difference between transactional exchange and energetic exchange",
          "How withholding value stalls the Bridge of Incidents",
        ],
        neuroscienceAnchor:
          "Oxytocin—the bonding and trust hormone—is released in communities when members feel seen, safe, and served. Leaders who prioritize the community's experience first trigger the neurochemistry of loyalty.",
        lawAnchor:
          "The community is your mirror. Pour the vision, the service, and the presence into it—and it will reflect that back amplified.",
      },
      {
        id: "private-consistency",
        num: "03",
        title: "Private Consistency",
        description:
          "Why the habits a leader maintains when no one is watching build the Character Bank required for public crisis. Public leadership is built on private discipline. The community does not see the nightly SATS practice, the morning RAS programming, or the mental diet. But they experience its output in every interaction.",
        keyConcepts: [
          "The Character Bank: private discipline as public credibility",
          "Why inconsistency in private practice produces inconsistency in public leadership",
          "The mental diet as a leadership protocol, not a personal habit",
        ],
        neuroscienceAnchor:
          "Habit formation requires consistent repetition across an average of 66 days (UCL research). Leaders who practice privately for 66+ days produce automatic, subconscious leadership responses that are neurologically impossible to fake.",
        lawAnchor:
          "Who you are when no one is watching is who you actually are. The community feels the Character Bank even when they cannot name it.",
      },
    ],
    quiz: {
      quizId: "leadership_c3_quiz",
      title: "The Momentum Check",
      passingScore: 80,
      questions: [
        {
          q: "What is the Bridge of Incidents?",
          options: [
            "A) A strategic plan with milestone checkpoints",
            "B) The chain of events that naturally unfolds when a leader's internal state is stable and the vision is held",
            "C) A networking strategy for building community relationships",
            "D) A project management framework for community programs",
          ],
          correct: 1,
        },
        {
          q: "What is the correct response when the 3D community environment contradicts the leader's vision?",
          options: [
            "A) Adjust the vision to reflect current community conditions",
            "B) Increase external pressure and programming efforts",
            "C) Remain persistent in the internal state and treat the external contradiction as a past echo",
            "D) Pause the vision until conditions improve",
          ],
          correct: 2,
        },
        {
          q: "According to the Law of Exchange, what must a leader provide before the community provides support?",
          options: [
            "A) Compensation and resources",
            "B) Authority and structure",
            "C) Value—experience, safety, and a compelling vision",
            "D) Rules and expectations",
          ],
          correct: 2,
        },
        {
          q: "What does the 'Character Bank' refer to in the Private Consistency framework?",
          options: [
            "A) The leader's public reputation and social capital",
            "B) The reservoir of trust built through private discipline and consistent internal practice",
            "C) Financial reserves set aside for community programs",
            "D) The leader's portfolio of past accomplishments",
          ],
          correct: 1,
        },
        {
          q: "What does neuroscience confirm about the formation of consistent leadership habits?",
          options: [
            "A) Habits form within 21 days of consistent repetition",
            "B) Leadership behaviors are primarily trait-based and difficult to change",
            "C) Consistent repetition over approximately 66 days produces automatic, subconscious leadership responses",
            "D) Habits require conscious effort regardless of how long they are practiced",
          ],
          correct: 2,
        },
      ],
    },
    assumptionLab: {
      labId: "leadership_c3_lab",
      title: "Synchronicity Tracker",
      module: "Reality_Timeline_API",
      prompt:
        "Enter three events from the last 48–72 hours that felt coincidental, unexpected, or unplanned—a conversation that came out of nowhere, a resource that appeared, a connection that surfaced without effort. Describe each briefly. The Lab will analyze them against your current community vision to surface the Bridge of Incidents connections you may be overlooking.",
      outputFormat: [
        "Bridge analysis: how each event connects to your current vision",
        "Bridge momentum score (accelerating / neutral / stalling)",
        "Internal state calibration: what to reinforce or release",
      ],
    },
  },

  {
    id: "leadership_course_4",
    num: 4,
    title: "Echo Theory Mastery",
    subtitle: "Elite Identity and the Multiplier Effect",
    description:
      "The final course. This is where the leader and the community vision become one. The internal state is no longer something the leader manages—it is who the leader is. At this level, the leader's stabilized frequency automatically elevates the entire group without deliberate effort.",
    durationEstimate: "60–75 min",
    tierRequired: "reality_master",
    color: C.teal,
    lessons: [
      {
        id: "dissolving-the-old-identity",
        num: "01",
        title: "Dissolving the Old Identity",
        description:
          "Removing the smaller version of yourself that was afraid to lead. Every leader carries a shadow identity—the version that believed leadership required external permission, perfect conditions, or proven results before fully stepping in.",
        keyConcepts: [
          "The shadow leader identity: how it was formed and how it persists",
          "Memory reconsolidation as the mechanism for identity dissolution",
          "The revision technique applied to leadership origin stories",
        ],
        neuroscienceAnchor:
          "Memory reconsolidation research (Nader, 2000) demonstrates that recalled memories become temporarily malleable and can be rewritten at the neurological level. The Revision Journal exploits this window to dissolve limiting leadership identities.",
        lawAnchor:
          "You do not have to become a leader. You have to dissolve the assumption that you are not already one. The leadership identity was always present—it was simply not assumed.",
      },
      {
        id: "leadership-as-a-lifestyle",
        num: "02",
        title: "Leadership as a Lifestyle",
        description:
          "Moving from trying to lead to being a leader. Most leadership development programs train behaviors. Vibe Hyr trains identity. Behavioral training produces performance that requires effort. Identity-level training produces performance that requires none—because it is simply who the person is.",
        keyConcepts: [
          "The difference between behavioral leadership and identity-level leadership",
          "How the Default Mode Network encodes identity and runs it automatically",
          "Why identity-level leaders outperform behavioral leaders under pressure",
        ],
        neuroscienceAnchor:
          "The Default Mode Network (DMN)—active during rest and self-referential thought—is the neurological home of identity. Leaders whose DMN is programmed with a stable leadership identity perform automatically under pressure because the behavior is subconscious, not deliberate.",
        lawAnchor:
          "Stop trying to lead. Assume the state of a leader who has already built what they came to build. Act from that state. The community will conform to the assumption.",
      },
      {
        id: "the-multiplier-effect",
        num: "03",
        title: "The Multiplier Effect",
        description:
          "How a leader's stabilized internal state automatically elevates the frequency of the entire group. When a leader reaches identity-level mastery, they no longer need to motivate, manage, or manipulate community behavior. Their stabilized state becomes the community's new floor.",
        keyConcepts: [
          "The Multiplier Effect: how one stabilized leader shifts group dynamics",
          "Why motivation is a symptom of identity misalignment",
          "The community as a reflection of the leader's frequency ceiling",
        ],
        neuroscienceAnchor:
          "Sustained emotional regulation in a leader activates the social engagement system (Porges' Polyvagal Theory) in group members, lowering collective threat response and raising collaborative capacity without any deliberate intervention.",
        lawAnchor:
          "One leader at the level of identity is worth a thousand leaders operating at the level of effort. The community rises to the frequency of the leader who has stopped trying to rise.",
      },
    ],
    quiz: {
      quizId: "leadership_c4_quiz",
      title: "The Identity Final",
      passingScore: 80,
      questions: [
        {
          q: "According to Echo Theory, what is your current community reality?",
          options: [
            "A) The product of the community's collective effort and external resources",
            "B) A fixed condition determined by history and circumstance",
            "C) A delayed projection of your previous internal assumptions and identity",
            "D) A reflection of the community's collective consciousness",
          ],
          correct: 2,
        },
        {
          q: "What is the Default Mode Network's role in leadership identity?",
          options: [
            "A) It controls conscious decision-making and strategic planning",
            "B) It regulates the leader's sleep and recovery cycles",
            "C) It encodes identity and runs it automatically as the self-concept during rest and self-reflection",
            "D) It manages the leader's emotional responses to external triggers",
          ],
          correct: 2,
        },
        {
          q: "What distinguishes identity-level leadership from behavioral leadership?",
          options: [
            "A) Identity-level leaders have more experience and credentials",
            "B) Behavioral leadership requires effort; identity-level leadership is automatic because it is who the person is",
            "C) Identity-level leadership is more strategic; behavioral leadership is more tactical",
            "D) There is no meaningful difference in outcomes between the two",
          ],
          correct: 1,
        },
        {
          q: "What is the Multiplier Effect?",
          options: [
            "A) A community growth strategy based on referral programs",
            "B) The phenomenon by which a leader's stabilized internal state automatically elevates the entire group's frequency without deliberate intervention",
            "C) The compounding returns of consistent community investment over time",
            "D) A leadership model based on distributing authority across multiple leaders",
          ],
          correct: 1,
        },
        {
          q: "What is the role of memory reconsolidation in dissolving the shadow leader identity?",
          options: [
            "A) It strengthens existing memories to build confidence",
            "B) It allows recalled memories to become temporarily malleable, enabling them to be rewritten at the neurological level",
            "C) It suppresses negative memories so they no longer affect behavior",
            "D) It creates new memories that override old ones through repetition",
          ],
          correct: 1,
        },
      ],
    },
    assumptionLab: {
      labId: "leadership_c4_lab",
      title: "The Identity Audit 2.0",
      module: "SATS_Library_Module",
      prompt:
        "Complete a 25-question deep dive designed to surface remaining 'Worker' assumptions operating beneath your leadership identity. The questions probe how you respond to community resistance, resource scarcity, public criticism, team conflict, and personal doubt. The Lab analyzes your responses, identifies the residual shadow leader patterns, and generates a custom Neural Script calibrated to your specific identity gaps—formatted for nightly Revision Journal practice.",
      outputFormat: [
        "Identity Audit score (Leadership Frequency Rating out of 100)",
        "Top 3 residual shadow leader patterns identified",
        "Custom Neural Script for nightly Revision Journal (personalized to audit results)",
        "30-day private consistency protocol",
      ],
    },
  },
];

// Tier access map
export const TIER_ACCESS: Record<string, string[]> = {
  seeker:         ["leadership_course_1"],
  architect:      ["leadership_course_1", "leadership_course_2", "leadership_course_3"],
  reality_master: ["leadership_course_1", "leadership_course_2", "leadership_course_3", "leadership_course_4"],
};

// Lesson counts per course (for completion tracking)
export const COURSE_LESSON_COUNTS: Record<string, number> = {
  leadership_course_1: 3,
  leadership_course_2: 3,
  leadership_course_3: 3,
  leadership_course_4: 3,
};
