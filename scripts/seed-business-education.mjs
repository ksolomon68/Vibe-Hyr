/**
 * seed-business-education.mjs
 * Seeds placeholder lessons for Business (c5-c8) and Education (c9-c12) courses.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dwpmujyycpgibpsculfd.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cG11anl5Y3BnaWJwc2N1bGZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQwMjM5OSwiZXhwIjoyMDg3OTc4Mzk5fQ.hv1-u4Zl74s_ms3ffKY74jMEF5dKrxU_0nrcKA7vNOo'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const COURSES_TO_SEED = [
  // Business
  { id: 5, prefix: 'B1', title: 'Common Sense in the Workplace', count: 5 },
  { id: 6, prefix: 'B2', title: 'From Reaction to Response', count: 7 },
  { id: 7, prefix: 'B3', title: 'Know Yourself, Lead Yourself', count: 8 },
  { id: 8, prefix: 'B4', title: 'Vibing as a Unit', count: 9 },
  // Education
  { id: 9, prefix: 'E1', title: 'The Educator Reset', count: 6 },
  { id: 10, prefix: 'E2', title: 'Vibrational Leadership', count: 8 },
  { id: 11, prefix: 'E3', title: 'Co-Regulation Mastery', count: 7 },
  { id: 12, prefix: 'E4', title: 'The Retained Educator', count: 9 },
]

async function main() {
  console.log('\n🌱 Seeding Business and Education lessons...\n')

  let totalSeeded = 0

  for (const course of COURSES_TO_SEED) {
    const lessons = []
    
    // Add a header
    lessons.push({
      course_id: course.id,
      sort_order: 1,
      title: `Module 1: Welcome to ${course.title}`,
      type: 'header',
      youtube_url: null,
      content: `## Module 1\n\nWelcome to ${course.title}.`,
      is_published: true,
      is_preview: false,
    })

    for (let i = 2; i <= course.count; i++) {
      lessons.push({
        course_id: course.id,
        sort_order: i,
        title: `${course.prefix} — Lesson ${i - 1}`,
        type: 'text',
        youtube_url: null,
        content: `## ${course.title} — Lesson ${i - 1}\n\nThis is a placeholder lesson for the ${course.title} course. You can edit this content directly in the CMS.`,
        is_published: true,
        is_preview: false,
      })
    }

    const { error } = await supabase
      .from('course_lessons')
      .insert(lessons)
    
    if (error) {
      console.error(`❌ Failed to seed Course ${course.id} (${course.title}):`, error.message)
    } else {
      console.log(`✓ Seeded ${lessons.length} lessons for Course ${course.id} (${course.title})`)
      totalSeeded += lessons.length
    }
  }

  console.log(`\n✅ Complete. Added ${totalSeeded} new lessons.\n`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
