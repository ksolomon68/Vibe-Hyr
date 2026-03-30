/**
 * seed-lessons.mjs
 * Seeds the course_lessons table — uses plain INSERT since table is freshly created.
 * Run: node scripts/seed-lessons.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dwpmujyycpgibpsculfd.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cG11anl5Y3BnaWJwc2N1bGZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQwMjM5OSwiZXhwIjoyMDg3OTc4Mzk5fQ.hv1-u4Zl74s_ms3ffKY74jMEF5dKrxU_0nrcKA7vNOo'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const lessons = [
  // ── COURSE 1 — Programming the Gatekeeper ──────────────────────────────────
  { course_id: 1, title: 'The 11 Million Bit Problem',            type: 'video', youtube_url: 'https://www.youtube.com/watch?v=mTjDPbUC44U', sort_order: 1,  is_published: true, is_preview: true  },
  { course_id: 1, title: 'The Car Model Phenomenon',              type: 'video', youtube_url: 'https://www.youtube.com/watch?v=7zzyEcLtreA', sort_order: 2,  is_published: true, is_preview: true  },
  { course_id: 1, title: 'Beta, Alpha, Theta — Your Three Operating Modes', type: 'video', youtube_url: 'https://www.youtube.com/watch?v=3oASflIFWHs', sort_order: 3, is_published: true, is_preview: false },
  { course_id: 1, title: 'Installing New Filtering Instructions', type: 'video', youtube_url: 'https://www.youtube.com/watch?v=UvDAAwlFQBY', sort_order: 4,  is_published: true, is_preview: false },
  { course_id: 1, title: 'Module Quiz & Your RAS Assignment',     type: 'text',  youtube_url: null, sort_order: 5,  is_published: true, is_preview: false },

  // ── COURSE 2 — Mastery of the Law of Assumption ───────────────────────────
  { course_id: 2, title: 'The Law vs. The Law of Attraction',     type: 'text',  youtube_url: null, sort_order: 1,  is_published: true, is_preview: false },
  { course_id: 2, title: 'Thinking Of vs. Thinking From',         type: 'text',  youtube_url: null, sort_order: 2,  is_published: true, is_preview: false },
  { course_id: 2, title: 'Living in the End',                     type: 'text',  youtube_url: null, sort_order: 3,  is_published: true, is_preview: false },
  { course_id: 2, title: 'The Bridge of Incidents',               type: 'text',  youtube_url: null, sort_order: 4,  is_published: true, is_preview: false },
  { course_id: 2, title: 'The Feeling Is the Secret',             type: 'text',  youtube_url: null, sort_order: 5,  is_published: true, is_preview: false },
  { course_id: 2, title: 'The Echo Theory — Understanding the Delay', type: 'text', youtube_url: null, sort_order: 6, is_published: true, is_preview: false },
  { course_id: 2, title: 'Course 2 Knowledge Check',              type: 'text',  youtube_url: null, sort_order: 7,  is_published: true, is_preview: false },

  // ── COURSE 3 — SATS Reprogramming ─────────────────────────────────────────
  { course_id: 3, title: 'What Is SATS — and Why It Works',       type: 'text',  youtube_url: null, sort_order: 1,  is_published: true, is_preview: false },
  { course_id: 3, title: 'Constructing Your SATS Scene',           type: 'text',  youtube_url: null, sort_order: 2,  is_published: true, is_preview: false },
  { course_id: 3, title: 'The 7-Night Integration Ritual',         type: 'text',  youtube_url: null, sort_order: 3,  is_published: true, is_preview: false },
  { course_id: 3, title: 'Myelination — The 21-Day Science',       type: 'text',  youtube_url: null, sort_order: 4,  is_published: true, is_preview: false },
  { course_id: 3, title: 'Common SATS Mistakes & How to Fix Them', type: 'text',  youtube_url: null, sort_order: 5,  is_published: true, is_preview: false },
  { course_id: 3, title: 'SATS for Specific Desires',              type: 'text',  youtube_url: null, sort_order: 6,  is_published: true, is_preview: false },
  { course_id: 3, title: 'The Chemical Cement — Dopamine, Serotonin & the Impression Process', type: 'text', youtube_url: null, sort_order: 7, is_published: true, is_preview: false },
  { course_id: 3, title: 'SATS Mastery Diagnostic',                type: 'text',  youtube_url: null, sort_order: 8,  is_published: true, is_preview: false },

  // ── COURSE 4 — Navigating the Echo Theory Delay ───────────────────────────
  { course_id: 4, title: 'The Mental Diet — What It Actually Means', type: 'text', youtube_url: null, sort_order: 1, is_published: true, is_preview: false },
  { course_id: 4, title: 'The Decision Matrix',                    type: 'text',  youtube_url: null, sort_order: 2,  is_published: true, is_preview: false },
  { course_id: 4, title: 'Staying Faithful When 3D Contradicts',   type: 'text',  youtube_url: null, sort_order: 3,  is_published: true, is_preview: false },
  { course_id: 4, title: 'Advanced Revision — Rewriting the Timeline', type: 'text', youtube_url: null, sort_order: 4, is_published: true, is_preview: false },
  { course_id: 4, title: 'Monitoring Your Inner Speech',            type: 'text',  youtube_url: null, sort_order: 5,  is_published: true, is_preview: false },
  { course_id: 4, title: 'The Persistence Principle',              type: 'text',  youtube_url: null, sort_order: 6,  is_published: true, is_preview: false },
  { course_id: 4, title: 'Integrated Practice — All Four Systems Working Together', type: 'text', youtube_url: null, sort_order: 7, is_published: true, is_preview: false },
  { course_id: 4, title: 'The Life Mastery Score — Monthly Assessment Protocol', type: 'text', youtube_url: null, sort_order: 8, is_published: true, is_preview: false },
  { course_id: 4, title: 'Course Completion — Your Reality Architecture', type: 'text', youtube_url: null, sort_order: 9, is_published: true, is_preview: false },
]

async function main() {
  console.log('\n🌱  Seeding course_lessons …\n')

  // Check current count
  const { count: existing } = await supabase
    .from('course_lessons')
    .select('*', { count: 'exact', head: true })

  console.log(`Current row count: ${existing ?? 0}`)

  let ok = 0, skip = 0, fail = 0

  for (const lesson of lessons) {
    // Try plain insert first; if duplicate (23505) skip
    const { error } = await supabase
      .from('course_lessons')
      .insert(lesson)

    if (error) {
      if (error.code === '23505') {
        skip++
        console.log(`↷  skip  C${lesson.course_id}.${String(lesson.sort_order).padStart(2,'0')}  ${lesson.title}`)
      } else {
        fail++
        console.error(`❌  fail  ${lesson.title}: [${error.code}] ${error.message}`)
      }
    } else {
      ok++
      console.log(`✓  ins   C${lesson.course_id}.${String(lesson.sort_order).padStart(2,'0')}  ${lesson.title}`)
    }
  }

  // Final count
  const { count: final } = await supabase
    .from('course_lessons')
    .select('*', { count: 'exact', head: true })

  console.log(`\n✅  inserted=${ok}  skipped=${skip}  failed=${fail}`)
  console.log(`   Total rows: ${final}\n`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
