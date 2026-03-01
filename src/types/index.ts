// ── USER & AUTH ──────────────────────────────────────────────────────────────

export type MembershipTier = 'free' | 'architect' | 'elite'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  membership_tier: MembershipTier
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  journal_streak: number
  last_journal_date: string | null
  created_at: string
  updated_at: string
}

// ── COURSES ───────────────────────────────────────────────────────────────────

export type CourseAccessTier = 'free' | 'architect' | 'elite'

export interface Course {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  tier: CourseAccessTier
  order_index: number
  thumbnail_url: string | null
  total_lessons: number
  total_quizzes: number
  estimated_hours: number
  created_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string | null
  video_url: string | null
  duration_seconds: number
  order_index: number
  is_preview: boolean
  content_md: string | null
  created_at: string
}

export interface CourseProgress {
  id: string
  user_id: string
  course_id: string
  lesson_id: string | null
  completed_lessons: string[]
  progress_percent: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface LessonNote {
  id: string
  user_id: string
  lesson_id: string
  content: string
  created_at: string
  updated_at: string
}

// ── QUIZZES ───────────────────────────────────────────────────────────────────

export type QuizType = 'knowledge_check' | 'identity_audit' | 'sats_diagnostic' | 'assumption_lab' | 'life_mastery'

export interface Quiz {
  id: string
  course_id: string | null
  lesson_id: string | null
  title: string
  description: string | null
  quiz_type: QuizType
  tier_required: CourseAccessTier
  pass_percent: number
  questions: QuizQuestion[]
  created_at: string
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question: string
  options: QuizOption[]
  correct_option_id: string | null
  explanation: string | null
  order_index: number
}

export interface QuizOption {
  id: string
  label: string
  text: string
  feedback: string | null
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  answers: Record<string, string>
  score_percent: number
  passed: boolean
  completed_at: string
}

// ── JOURNAL ───────────────────────────────────────────────────────────────────

export type EmotionTag =
  | 'peaceful'
  | 'grateful'
  | 'confident'
  | 'joyful'
  | 'anxious'
  | 'frustrated'
  | 'neutral'
  | 'powerful'
  | 'loving'
  | 'abundant'

export interface JournalEntry {
  id: string
  user_id: string
  date: string
  event_raw: string
  event_revised: string
  emotion_before: EmotionTag
  emotion_after: EmotionTag
  module_context: string | null
  active_assumption: string | null
  created_at: string
  updated_at: string
}

export interface Assumption {
  id: string
  user_id: string
  title: string
  description: string | null
  status: 'active' | 'manifested' | 'released'
  manifested_at: string | null
  created_at: string
}

// ── COMMUNITY ─────────────────────────────────────────────────────────────────

export type PostCategory = 'general' | 'bridge_of_incidents' | 'sats_wins' | 'questions' | 'accountability'

export interface ForumPost {
  id: string
  user_id: string
  author: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'membership_tier'>
  title: string
  content: string
  category: PostCategory
  course_id: string | null
  upvotes: number
  comment_count: number
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface ForumComment {
  id: string
  post_id: string
  user_id: string
  author: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'membership_tier'>
  content: string
  upvotes: number
  created_at: string
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────

export interface LifeMasteryScore {
  id: string
  user_id: string
  month: string
  relationships: number
  finances: number
  health: number
  mindset: number
  purpose: number
  self_worth: number
  overall: number
  created_at: string
}

export interface DashboardStats {
  journal_streak: number
  total_journal_entries: number
  courses_completed: number
  courses_in_progress: number
  quiz_average_score: number
  community_posts: number
  active_assumptions: number
  manifested_count: number
  life_mastery_latest: LifeMasteryScore | null
}
