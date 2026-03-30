import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('course_progress')
    .select('completed_lessons')
    .eq('user_id', user.id)
    .eq('course_id', params.courseId)
    .maybeSingle()

  if (error) {
    console.error('[progress/[courseId]]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data?.completed_lessons ?? []).map((lessonId: string) => ({
    lessonId,
    completedAt: null,
  }))

  return NextResponse.json(rows)
}
