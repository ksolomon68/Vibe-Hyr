/**
 * GET /api/org/courses
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns the courses available for the calling org admin's organisation type.
 * Used by the OrgUserManagement component to populate course multi-selects.
 */

import { NextResponse }       from 'next/server'
import { requireOrgAdmin }    from '@/lib/supabase/requireOrgAdmin'
import { getCoursesForOrgType } from '@/lib/data/orgCourses'

export async function GET() {
  const { ctx, error } = await requireOrgAdmin()
  if (error) return error

  const courses = getCoursesForOrgType(ctx.orgType)

  return NextResponse.json({ courses, orgType: ctx.orgType })
}
