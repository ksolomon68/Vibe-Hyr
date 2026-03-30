/**
 * check-lesson-data.mjs
 * Checks the database for a specific lesson and associated quiz.
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dwpmujyycpgibpsculfd.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cG11anl5Y3BnaWJwc2N1bGZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQwMjM5OSwiZXhwIjoyMDg3OTc4Mzk5fQ.hv1-u4Zl74s_ms3ffKY74jMEF5dKrxU_0nrcKA7vNOo'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function main() {
  const lessonId = 'e5ddef38-f69e-4e34-8138-c2a1f746e8ee'
  
  console.log(`\n🔍 Checking Lesson: ${lessonId}\n`)
  
  const { data: lesson, error: lessonError } = await supabase
    .from('course_lessons')
    .select('*')
    .eq('id', lessonId)
    .single()
    
  if (lessonError) {
    console.error('Error fetching lesson:', lessonError.message)
  } else {
    console.log('Lesson Found:')
    console.log(' - Title:', lesson.title)
    console.log(' - Type:', lesson.type)
    console.log(' - Content length:', lesson.content?.length ?? 0)
    console.log(' - Content (first 100 chars):', lesson.content?.substring(0, 100))
  }
  
  console.log('\n🔍 Checking for Quizzes associated with this lesson ID in code vs DB\n')
}

main()
