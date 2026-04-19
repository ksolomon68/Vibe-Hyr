import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { COURSE_TITLES, SLUG_TO_COURSE_ID } from '@/lib/constants/courses'

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

  // ── Fetch existing progress row ────────────────────────────────────────────
  const { data: existing } = await admin
    .from('course_progress')
    .select('id, completed_lessons')
    .eq('user_id',   user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  let newCompletedLessons: string[]
  let error

  if (existing) {
    const lessons: string[] = existing.completed_lessons ?? []
    if (!lessons.includes(lessonId)) {
      newCompletedLessons = [...lessons, lessonId]
      ;({ error } = await admin
        .from('course_progress')
        .update({ completed_lessons: newCompletedLessons, updated_at: new Date().toISOString() })
        .eq('id', existing.id))
    } else {
      newCompletedLessons = lessons
    }
  } else {
    newCompletedLessons = [lessonId]
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

  // ── Check if course is now fully complete → issue certificate ──────────────
  try {
    // Count total lessons for this course
    const { count: totalLessons } = await admin
      .from('course_lessons')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId)

    if (totalLessons && newCompletedLessons && newCompletedLessons.length >= totalLessons) {
      // Resolve canonical course_id (handles slug-style IDs from personal vertical)
      const canonicalCourseId = SLUG_TO_COURSE_ID[courseId] ?? courseId
      const meta = COURSE_TITLES[canonicalCourseId]

      if (meta) {
        // Issue certificate via DB function (idempotent — ON CONFLICT DO NOTHING)
        const { data: cert, error: certErr } = await admin.rpc('issue_certificate', {
          p_user_id:     user.id,
          p_course_id:   canonicalCourseId,
          p_vertical:    meta.vertical,
          p_course_title: meta.title,
        })
        if (certErr) {
          console.error('[progress/complete] issue_certificate error:', certErr)
        } else {
          return NextResponse.json({ ok: true, certificate: cert })
        }
      }
    }
  } catch (certErr) {
    // Non-fatal: log but don't block the response
    console.error('[progress/complete] certificate check failed:', certErr)
  }

  return NextResponse.json({ ok: true })
}
