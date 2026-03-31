import type { Lesson, Quiz, AssumptionLab } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// COURSE B01 — Common Sense in the Workplace
// ─────────────────────────────────────────────────────────────────────────────
export const COURSE_B01_LESSONS: Lesson[] = [
  {
    id: 'b01-l01', course_id: 'b01', order_index: 1,
    title: 'The Professional Filter — Why Teams Miss the Obvious',
    description: 'In a business environment, the RAS filters for problems or opportunities. Most teams are programmed to see only the fires.',
    video_url: null, duration_seconds: 900, is_preview: true,
    content_md: `## The Professional Filter

Your brain processes 11 million bits of data, but in your office, you likely only notice the "important" ones: deadlines, emails, and problems.

This is your **Professional RAS** at work. 

If your team's culture is rooted in "firefighting," your brain will actually become blind to long-term opportunities and strategic shifts. We call this **Transactional Blindness**.

### The Business Impact
When you change the filter from "what is going wrong" to "what is possible here," the same conference room becomes a different environment.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b01-l02', course_id: 'b01', order_index: 2,
    title: 'The Innovation Bias',
    description: 'How to program your team to notice the subtle signals that lead to market breakthroughs.',
    video_url: null, duration_seconds: 840, is_preview: true,
    content_md: `## The Innovation Bias

Just as you see a specific car model everywhere after deciding to buy it, a leader who decides to find "efficiency gains" will suddenly see them in every process.

Innovation isn't about creating something from nothing—it's about **noticing** what was previously filtered out.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b01-l03', course_id: 'b01', order_index: 3,
    title: 'The Deep Work State — Alpha in the Office',
    description: 'The science of high-performance focus and how to move from frantic Beta to productive Alpha.',
    video_url: null, duration_seconds: 960, is_preview: false,
    content_md: `## The Deep Work State

Most workplace stress happens in high-frequency **Beta**. True productivity—the kind that moves the needle—happens in **Alpha**.

We'll learn how to transition your team into a collective Alpha state for collaborative problem solving.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b01-l04', course_id: 'b01', order_index: 4,
    title: 'Reprogramming Organizational Culture',
    description: 'Clarity, Emotion, and Repetition applied to team goals.',
    video_url: null, duration_seconds: 900, is_preview: false,
    content_md: `## Reprogramming Culture

A company culture is simply the **collective RAS** of its employees. To change the culture, you must change the shared filtering instructions.`,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b01-l05', course_id: 'b01', order_index: 5,
    title: 'Module Quiz & Workplace RAS Audit',
    description: 'Test your understanding and receive your first team-wide reprogramming assignment.',
    video_url: null, duration_seconds: 300, is_preview: false,
    content_md: `## Workplace RAS Audit

Complete the knowledge check below to unlock **Course B02: From Reaction to Response**.`,
    created_at: new Date().toISOString(),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS QUIZZES (Mockups for now, can be expanded)
// ─────────────────────────────────────────────────────────────────────────────
export const BUSINESS_QUIZZES: Record<string, Quiz> = {
  'b01-l05': {
    id: 'quiz-b01-final', course_id: 'b01', lesson_id: 'b01-l05',
    title: 'Workplace Mastery Check', description: null,
    quiz_type: 'knowledge_check', tier_required: 'free', pass_percent: 70,
    created_at: new Date().toISOString(),
    questions: [
      {
        id: 'q-b01-1', quiz_id: 'quiz-b01-final', order_index: 1,
        correct_option_id: 'q-b01-1-b', explanation: 'The RAS acts as the gatekeeper for all professional sensory input.',
        question: 'What is the primary role of the RAS in a professional context?',
        options: [
          { id: 'q-b01-1-a', label: 'A', text: 'To manage your calendar', feedback: null },
          { id: 'q-b01-1-b', label: 'B', text: 'To filter environmental data based on priorities', feedback: null },
          { id: 'q-b01-1-c', label: 'C', text: 'To increase typing speed', feedback: null },
          { id: 'q-b01-1-d', label: 'D', text: 'To regulate office temperature', feedback: null },
        ],
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS LABS
// ─────────────────────────────────────────────────────────────────────────────
export const BUSINESS_LABS: Record<string, AssumptionLab> = {
  'b01-l01': {
    id: 'lab-b01-01',
    lesson_id: 'b01-l01',
    title: 'The Opportunity Filter',
    subtitle: 'Beyond Firefighting',
    scenario: "Your team is currently in 'wait and see' mode regarding the new market changes. This is a passive filter.",
    prompt: "Identify one asset your company has that you've been 'ignoring' because it didn't fit the old success model.",
    accentColor: "#E8621A",
  }
}
