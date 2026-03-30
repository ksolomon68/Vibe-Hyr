/**
 * run-sql.mjs
 * Executes SQL directly against Supabase using the Management API.
 * Run: node scripts/run-sql.mjs
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Config ────────────────────────────────────────────────────────────────────
const PROJECT_REF   = 'dwpmujyycpgibpsculfd'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cG11anl5Y3BnaWJwc2N1bGZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQwMjM5OSwiZXhwIjoyMDg3OTc4Mzk5fQ.hv1-u4Zl74s_ms3ffKY74jMEF5dKrxU_0nrcKA7vNOo'

// The Supabase Management API endpoint for running SQL
const SQL_ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`

async function runSQL(sql, label) {
  console.log(`\n▶  ${label}`)
  const resp = await fetch(SQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  const text = await resp.text()
  let json
  try { json = JSON.parse(text) } catch { json = null }

  if (!resp.ok) {
    console.error(`   ❌  HTTP ${resp.status}:`, text.slice(0, 400))
    return false
  }

  console.log(`   ✓  Success`)
  if (json && Array.isArray(json) && json.length > 0) {
    console.log('   Result:', JSON.stringify(json.slice(0, 5)))
  }
  return true
}

async function main() {
  console.log('\n🔧  Applying course_lessons migrations …')

  // 1. Read the CMS table migration SQL
  const cmsSql = readFileSync(
    join(__dirname, '../supabase/migrations/20260329_course_cms.sql'),
    'utf-8'
  )

  // 2. Read the seed SQL
  const seedSql = readFileSync(
    join(__dirname, '../supabase/migrations/20260330_seed_course_lessons.sql'),
    'utf-8'
  )

  // 3. Apply CMS table migration
  const ok1 = await runSQL(cmsSql, 'Creating course_lessons table + RLS policies')
  if (!ok1) {
    console.log('\n   Trying seed anyway (table may already exist)…')
  }

  // 4. Apply seed
  const ok2 = await runSQL(seedSql, 'Seeding 29 lessons')

  // 5. Verify
  const verifyResult = await runSQL(
    'SELECT course_id, count(*) as lesson_count FROM course_lessons GROUP BY course_id ORDER BY course_id',
    'Verifying lesson counts per course'
  )

  if (ok2 || verifyResult) {
    console.log('\n✅  Done! Refresh the Course Manager in the Super Admin dashboard.\n')
  } else {
    console.log('\n⚠  Some steps failed. See output above.\n')
  }
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
