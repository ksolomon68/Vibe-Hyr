/**
 * courseContent.ts
 *
 * DB-first lesson resolver for the personal course player.
 *
 * When course_lessons has rows for a given course_id, those rows take precedence
 * over the hardcoded static lessons. The hardcoded lessons are used as a fallback
 * when the CMS is empty for that course.
 *
 * Tier mapping  (course_lessons.course_id → COURSES.order_index):
 *   1 = c01  Programming the Gatekeeper
 *   2 = c02  Mastery of the Law of Assumption
 *   3 = c03  SATS Reprogramming
 *   4 = c04  Echo Theory Delay
 */

import { createClient } from '@/lib/supabase/server'
import { getLessonsForCourse as getStaticLessons } from '@/lib/data/lessons'
import type { Lesson } from '@/types'

// ── Title → URL slug (matches curriculum lesson IDs) ─────────────────────────
// e.g. "The Responsibility Formula" → "the-responsibility-formula"
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, '')        // strip apostrophes
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric → dash
    .replace(/^-|-$/g, '')       // trim leading/trailing dashes
}

// ── YouTube URL → embed URL ───────────────────────────────────────────────────
function toEmbedUrl(youtubeUrl: string): string {
  const m = youtubeUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?#]+)/
  )
  if (!m) return youtubeUrl
  return `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&modestbranding=1&controls=1`
}

// ── course_id integer → course string id ─────────────────────────────────────
function numToStringId(n: number): string {
  if (n >= 13 && n <= 16) return `leadership_course_${n - 12}`
  return `c0${n}`
}

type DbLessonRow = {
  id: string
  course_id: number
  title: string
  type: 'video' | 'text' | 'header'
  youtube_url: string | null
  content: string | null
  sort_order: number
  is_published: boolean
  is_preview: boolean
  created_at: string
}

// Calculate approximate duration: 15min for video, otherwise ~1min per 1000 chars of text (min 5min)
function getApproxDurationSeconds(type: string, content: string | null): number {
  if (type === 'video') return 15 * 60; // 15 mins for video
  if (!content) return 5 * 60;          // 5 mins default
  
  // If HTML, strip tags for a better character count estimate
  const text = content.replace(/<[^>]*>/g, '');
  const chars = text.length;
  const mins = Math.max(5, Math.ceil(chars / 1000));
  return mins * 60;
}

function dbRowToLesson(row: DbLessonRow): Lesson {
  return {
    id:               slugify(row.title),
    course_id:        numToStringId(row.course_id),
    order_index:      row.sort_order,
    title:            row.title,
    description:      '',
    video_url:        (row.youtube_url ?? null)
                        ? toEmbedUrl(row.youtube_url!)
                        : null,
    duration_seconds: getApproxDurationSeconds(row.type, row.content),
    is_preview:       row.is_preview,
    content_md:       (row.type === 'text' || row.type === 'video') ? (row.content ?? '') :
                      row.type === 'header' ? `## ${row.title}` : '',
    created_at:       row.created_at,
  }
}

/**
 * Returns lessons for a course, preferring CMS content over hardcoded.
 *
 * @param courseStringId  e.g. 'c01', 'c02'
 * @param courseOrderIndex  1 | 2 | 3 | 4
 * @param userTier  'free' | 'architect' | 'elite'
 * @param institutionType  'individual' | 'education' | 'business'
 */
export async function getLessonsWithDBFallback(
  courseStringId: string,
  courseOrderIndex: number,
): Promise<Lesson[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('course_lessons')
    .select('*')
    .eq('course_id', courseOrderIndex)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  // If table is missing or empty, fall back to hardcoded content
  if (error || !data || data.length === 0) {
    return getStaticLessons(courseStringId)
  }

  return (data as DbLessonRow[]).map(dbRowToLesson)
}
