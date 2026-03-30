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

  // 3. Upsert via admin client (bypasses RLS for the write)
  const admin = createAdminClient()
  const { error } = await admin
    .from('course_progress')
    .upsert(
      {
        user_id:      user.id,
        course_id:    courseId,
        lesson_id:    lessonId,
        completed_at: new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      },
      { onConflict: 'user_id,course_id,lesson_id' }
    )

  if (error) {
    console.error('[progress/complete]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
