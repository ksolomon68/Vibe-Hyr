export const VERTICAL_COURSE_ROUTES: Record<string, string> = {
  personal:    '/personal',
  individual:  '/personal',
  education:   '/educators',
  educators:   '/educators',
  educator:    '/educators',
  business:    '/business',
  workplace:   '/business',
  leadership:  '/leadership',
  leader:      '/leadership',
  free:        '/personal',  // free tier defaults to personal
}

export function getCourseRoute(
  membershipType: string | null,
  role: string | null
): string {
  if (membershipType) {
    const mapped = VERTICAL_COURSE_ROUTES[membershipType.toLowerCase()]
    if (mapped) return mapped
  }
  if (role) {
    const mapped = VERTICAL_COURSE_ROUTES[role.toLowerCase()]
    if (mapped) return mapped
  }
  return '/personal'
}
