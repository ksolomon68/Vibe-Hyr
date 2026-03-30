import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  // 1. Verify auth
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  let lessonId: string, courseId: string
  try {
    const body = await req.json()
    lessonId = body.lessonId
    courseId = body.courseId
    if (!lessonId || !courseId) throw new Error('Missing fields')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // 3. Delete the completion row via admin client
  const admin = createAdminClient()
  const { error } = await admin
    .from('course_progress')
    .delete()
    .eq('user_id',   user.id)
    .eq('course_id', courseId)
    .eq('lesson_id', lessonId)

  if (error) {
    console.error('[progress/uncomplete]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
