import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/dashboard', '/journal', '/community', '/quizzes', '/business/', '/educators/', '/leadership/', '/admin/']
  const isProtectedPath = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))
  const isProtected = isProtectedPath;

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from auth pages
  // Exception: /auth/reset-password requires an active session (set by the recovery token callback)
  const AUTH_PASSTHROUGH = ['/auth/reset-password', '/auth/callback', '/reset-password']
  const isAuthPassthrough = AUTH_PASSTHROUGH.some(p => request.nextUrl.pathname.startsWith(p))
  if (user && request.nextUrl.pathname.startsWith('/auth/') && !isAuthPassthrough) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
