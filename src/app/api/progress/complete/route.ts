import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let lessonId: string, courseId: string
  try {
    const body = await req.json()
    lessonId = body.lessonId
    courseId = body.courseId
    if (!lessonId || !courseId) throw new Error('Missing fields')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Fetch existing row
  const { data: existing } = await admin
    .from('course_progress')
    .select('id, completed_lessons')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  let error
  if (existing) {
    const lessons: string[] = existing.completed_lessons ?? []
    if (!lessons.includes(lessonId)) {
      ;({ error } = await admin
        .from('course_progress')
        .update({ completed_lessons: [...lessons, lessonId], updated_at: new Date().toISOString() })
        .eq('id', existing.id))
    }
  } else {
    ;({ error } = await admin
      .from('course_progress')
      .insert({
        user_id:           user.id,
        course_id:         courseId,
        completed_lessons: [lessonId],
        updated_at:        new Date().toISOString(),
      }))
  }

  if (error) {
    console.error('[progress/complete]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
