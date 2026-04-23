import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { COURSE_TITLES, SLUG_TO_COURSE_ID } from '@/lib/constants/courses'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let courseId: string
  try {
    const body = await req.json()
    courseId = body.courseId
    if (!courseId) throw new Error('Missing courseId')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const canonicalCourseId = SLUG_TO_COURSE_ID[courseId] ?? courseId
  console.log('[certificates/issue] Request for:', { courseId, canonicalCourseId })
  
  const meta = COURSE_TITLES[canonicalCourseId]
  if (!meta) {
    console.error('[certificates/issue] Unknown course ID:', canonicalCourseId)
    return NextResponse.json({ error: `Unknown course: ${courseId}` }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: cert, error: certErr } = await admin.rpc('issue_certificate', {
    p_user_id:      user.id,
    p_course_id:    canonicalCourseId,
    p_vertical:     meta.vertical,
    p_course_title: meta.title,
  })

  if (certErr) {
    console.error('[certificates/issue]', certErr)
    return NextResponse.json({ error: certErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, certificate: cert })
}
