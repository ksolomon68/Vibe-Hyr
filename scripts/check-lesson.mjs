import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dwpmujyycpgibpsculfd.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cG11anl5Y3BnaWJwc2N1bGZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQwMjM5OSwiZXhwIjoyMDg3OTc4Mzk5fQ.hv1-u4Zl74s_ms3ffKY74jMEF5dKrxU_0nrcKA7vNOo'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function check() {
  const { data, error } = await supabase
    .from('course_lessons')
    .select('id, title, type, content')
    .eq('id', 'e5ddef38-f69e-4e34-8138-c2a1f746e8ee')

  if (data && data.length > 0) {
    const row = data[0]
    console.log(`ID: ${row.id}`)
    console.log(`Title: ${row.title}`)
    console.log(`Type: ${row.type}`)
    console.log(`Content length: ${row.content ? row.content.length : 0}`)
    console.log(`Content start: ${row.content ? row.content.substring(0, 50) : 'null'}`)
  } else {
    console.log('No data found for UUID')
  }
}

check()
