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
  console.log('\n🔧  Updating course_lessons constraint …')

  const sql = `
    ALTER TABLE course_lessons DROP CONSTRAINT IF EXISTS course_lessons_course_id_check;
    ALTER TABLE course_lessons ADD CONSTRAINT course_lessons_course_id_check CHECK (course_id BETWEEN 1 AND 12);
  `

  const ok = await runSQL(sql, 'Updating course_id check constraint')

  if (ok) {
    console.log('\n✅  Constraint updated successfully!\n')
  } else {
    // try removing entirely mapping
    const fallbackSql = `
      ALTER TABLE course_lessons DROP CONSTRAINT IF EXISTS course_lessons_course_id_check;
    `
    const ok2 = await runSQL(fallbackSql, 'Dropping constraint as fallback')
    if (ok2) {
      console.log('\n✅  Constraint dropped successfully as fallback!\n')
    } else {
      console.log('\n⚠  Updates failed.\n')
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
