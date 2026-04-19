export const VERTICAL_COURSE_ROUTES: Record<string, string> = {
  personal:    '/personal',
  education:   '/education',
  business:    '/business',
  leadership:  '/leadership',
  free:        '/personal',  // free tier defaults to personal
}

export function getCourseRoute(
  membershipType: string | null,
  role: string | null
): string {
  if (!membershipType) return '/personal'
  return VERTICAL_COURSE_ROUTES[membershipType.toLowerCase()] ?? '/personal'
}
