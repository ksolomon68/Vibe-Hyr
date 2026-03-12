// app/auth/callback/route.ts
// Handles post-OAuth redirect from Supabase.
// After login, checks if user's email domain matches an org — if so,
// auto-assigns them to that org (if seats are available).

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?reason=no_code`)
  }

  // Use server-side Supabase client with cookie support
  const { createServerClient } = await import('@supabase/ssr')
  const { cookies } = await import('next/headers')
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  // Exchange code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) {
    console.error('[auth/callback] Session exchange failed:', error)
    return NextResponse.redirect(`${origin}/auth/error?reason=session_failed`)
  }

  const user = data.user
  const email = user.email!

  // Use service role to call the domain-matching function
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: assignResult, error: assignError } = await adminClient
    .rpc('assign_user_to_org_by_domain', {
      p_user_id: user.id,
      p_email: email,
    })

  if (assignError) {
    console.error('[auth/callback] Domain assignment error:', assignError)
    // Non-fatal — user can still log in, just won't have org access
  } else {
    console.log('[auth/callback] Domain assignment result:', assignResult)

    // If seat limit was hit, redirect to a specific page
    if (assignResult?.status === 'seat_limit_reached') {
      const orgId = assignResult.org_id
      return NextResponse.redirect(
        `${origin}/auth/seat-limit?org=${orgId}`
      )
    }
  }

  // Successful login — redirect to dashboard or intended page
  return NextResponse.redirect(`${origin}${next}`)
}
