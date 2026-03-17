// app/auth/callback/route.ts
// Handles post-OAuth redirect from Supabase.
// After login, checks if user's email domain matches an org — if so,
// auto-assigns them to that org (if seats are available).

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code       = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type')

  // 'next' is our own param; 'redirect_to' may come from Supabase token links.
  // Sanitize: only allow relative paths (prevents open redirect attacks).
  const rawDest = searchParams.get('next') ?? searchParams.get('redirect_to') ?? '/dashboard'
  const next    = rawDest.startsWith('/') ? rawDest : '/dashboard'

  console.log('[auth/callback] code:', !!code, '| token_hash:', !!token_hash, '| type:', type, '| destination:', next)

  if (!code && !token_hash) {
    console.warn('[auth/callback] No code or token_hash — redirecting to error')
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

  // Handle token_hash (password recovery / email verification links)
  if (token_hash && type) {
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'recovery' | 'email' | 'signup' | 'invite' | 'magiclink' | 'email_change',
    })
    if (verifyErr) {
      console.error('[auth/callback] verifyOtp failed:', verifyErr)
      return NextResponse.redirect(`${origin}/auth/error?reason=invalid_token`)
    }
    // For recovery, redirect directly to the reset-password page
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Exchange code for session (OAuth / magic link)
  const { data, error } = await supabase.auth.exchangeCodeForSession(code!)
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
