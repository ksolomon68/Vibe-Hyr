/**
 * reload-and-seed.mjs
 * 
 * 1. Triggers a PostgREST schema cache reload via the Supabase REST API
 * 2. Then seeds the course_lessons table
 * 
 * Run: node scripts/reload-and-seed.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dwpmujyycpgibpsculfd.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cG11anl5Y3BnaWJwc2N1bGZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQwMjM5OSwiZXhwIjoyMDg3OTc4Mzk5fQ.hv1-u4Zl74s_ms3ffKY74jMEF5dKrxU_0nrcKA7vNOo'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// Trigger PostgREST schema cache reload
async function reloadSchemaCache() {
  console.log('🔄  Triggering PostgREST schema cache reload …')
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'GET',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      // This header triggers a schema cache reload in PostgREST
      'Accept-Profile': 'public',
    },
  })
  console.log(`   Reload response: HTTP ${resp.status}`)
  // Wait a moment for the reload to take effect
  await new Promise(r => setTimeout(r, 3000))
}

const lessons = [
  { course_id: 1, title: 'The 11 Million Bit Problem',            type: 'video', youtube_url: 'https://www.youtube.com/watch?v=mTjDPbUC44U', sort_order: 1,  is_published: true, is_preview: true  },
  { course_id: 1, title: 'The Car Model Phenomenon',              type: 'video', youtube_url: 'https://www.youtube.com/watch?v=7zzyEcLtreA', sort_order: 2,  is_published: true, is_preview: true  },
  { course_id: 1, title: 'Beta, Alpha, Theta — Your Three Operating Modes', type: 'video', youtube_url: 'https://www.youtube.com/watch?v=3oASflIFWHs', sort_order: 3, is_published: true, is_preview: false },
  { course_id: 1, title: 'Installing New Filtering Instructions', type: 'video', youtube_url: 'https://www.youtube.com/watch?v=UvDAAwlFQBY', sort_order: 4,  is_published: true, is_preview: false },
  { course_id: 1, title: 'Module Quiz & Your RAS Assignment',     type: 'text',  youtube_url: null, sort_order: 5,  is_published: true, is_preview: false },
  { course_id: 2, title: 'The Law vs. The Law of Attraction',     type: 'text',  youtube_url: null, sort_order: 1,  is_published: true, is_preview: false },
  { course_id: 2, title: 'Thinking Of vs. Thinking From',         type: 'text',  youtube_url: null, sort_order: 2,  is_published: true, is_preview: false },
  { course_id: 2, title: 'Living in the End',                     type: 'text',  youtube_url: null, sort_order: 3,  is_published: true, is_preview: false },
  { course_id: 2, title: 'The Bridge of Incidents',               type: 'text',  youtube_url: null, sort_order: 4,  is_published: true, is_preview: false },
  { course_id: 2, title: 'The Feeling Is the Secret',             type: 'text',  youtube_url: null, sort_order: 5,  is_published: true, is_preview: false },
  { course_id: 2, title: 'The Echo Theory — Understanding the Delay', type: 'text', youtube_url: null, sort_order: 6, is_published: true, is_preview: false },
  { course_id: 2, title: 'Course 2 Knowledge Check',              type: 'text',  youtube_url: null, sort_order: 7,  is_published: true, is_preview: false },
  { course_id: 3, title: 'What Is SATS — and Why It Works',       type: 'text',  youtube_url: null, sort_order: 1,  is_published: true, is_preview: false },
  { course_id: 3, title: 'Constructing Your SATS Scene',           type: 'text',  youtube_url: null, sort_order: 2,  is_published: true, is_preview: false },
  { course_id: 3, title: 'The 7-Night Integration Ritual',         type: 'text',  youtube_url: null, sort_order: 3,  is_published: true, is_preview: false },
  { course_id: 3, title: 'Myelination — The 21-Day Science',       type: 'text',  youtube_url: null, sort_order: 4,  is_published: true, is_preview: false },
  { course_id: 3, title: 'Common SATS Mistakes & How to Fix Them', type: 'text',  youtube_url: null, sort_order: 5,  is_published: true, is_preview: false },
  { course_id: 3, title: 'SATS for Specific Desires',              type: 'text',  youtube_url: null, sort_order: 6,  is_published: true, is_preview: false },
  { course_id: 3, title: 'The Chemical Cement — Dopamine, Serotonin & the Impression Process', type: 'text', youtube_url: null, sort_order: 7, is_published: true, is_preview: false },
  { course_id: 3, title: 'SATS Mastery Diagnostic',                type: 'text',  youtube_url: null, sort_order: 8,  is_published: true, is_preview: false },
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
  console.log('\n🌱  Reload schema + seed course_lessons\n')

  await reloadSchemaCache()

  console.log('\n📥  Inserting lessons …\n')

  let ok = 0, skip = 0, fail = 0

  for (const lesson of lessons) {
    // Use plain insert with onConflict ignore
    const { error } = await supabase
      .from('course_lessons')
      .insert(lesson)

    if (error) {
      if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
        skip++
        process.stdout.write(`↷ `)
      } else {
        fail++
        console.log(`\n❌  ${lesson.title}: ${error.code} — ${error.message}`)
      }
    } else {
      ok++
      console.log(`✓  ${lesson.course_id}.${String(lesson.sort_order).padStart(2,'0')}  ${lesson.title}`)
    }
  }

  const { count } = await supabase
    .from('course_lessons')
    .select('*', { count: 'exact', head: true })

  console.log(`\n\n✅  inserted=${ok}  skipped=${skip}  failed=${fail}`)
  console.log(`   Total rows: ${count}\n`)

  if (fail > 0) {
    console.log('⚠  Some inserts failed. The table may still not be in PostgREST cache.')
    console.log('   Please apply the migration via the Supabase SQL Editor, then run this script again.\n')
  }
}

main().catch(console.error)
