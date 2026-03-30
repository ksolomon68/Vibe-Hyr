import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  // 1. Verify auth
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Fetch progress rows for this user + course
  const { data, error } = await supabase
    .from('course_progress')
    .select('lesson_id, completed_at')
    .eq('user_id',   user.id)
    .eq('course_id', params.courseId)

  if (error) {
    console.error('[progress/[courseId]]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []).map((r: { lesson_id: string; completed_at: string | null }) => ({
    lessonId:    r.lesson_id,
    completedAt: r.completed_at,
  }))

  return NextResponse.json(rows)
}
