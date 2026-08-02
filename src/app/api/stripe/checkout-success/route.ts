// app/api/stripe/checkout-success/route.ts
// Stripe redirects the browser here right after a successful checkout.
// Verifies the session, finds-or-creates the Supabase auth user for the
// checkout email, and hands off to /auth/callback with a magic-link
// token so the browser lands on the dashboard already signed in —
// no separate login step required.

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  const loginFallback = (email?: string) => {
    const url = new URL(`${origin}/auth/login`)
    url.searchParams.set('checkout', 'success')
    if (email) url.searchParams.set('email', email)
    return NextResponse.redirect(url.toString())
  }

  if (!sessionId) return loginFallback()

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    const email = session.customer_details?.email || session.customer_email
    if (session.payment_status !== 'paid' || !email) return loginFallback()

    // Auto-login: generate a magic-link token for this email. If no auth
    // user exists yet for it (guest checkout), Supabase creates one — same
    // account the webhook's provisionAccess() will attach org/course
    // access to (it looks up the existing user by email if already created).
    const { data, error } = await getSupabaseAdmin().auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    const hashedToken = data?.properties?.hashed_token
    if (error || !hashedToken) {
      console.error('[checkout-success] generateLink failed:', error)
      return loginFallback(email)
    }

    const callbackUrl = new URL(`${origin}/auth/callback`)
    callbackUrl.searchParams.set('token_hash', hashedToken)
    callbackUrl.searchParams.set('type', 'magiclink')
    callbackUrl.searchParams.set('next', '/dashboard')
    return NextResponse.redirect(callbackUrl.toString())
  } catch (err) {
    console.error('[checkout-success] Error:', err)
    return loginFallback()
  }
}
