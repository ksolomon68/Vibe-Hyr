// app/api/email/reset-password/route.ts
// Generates a branded password-reset email via Resend.
// Uses the Supabase Admin API to create the recovery link so we own the email HTML.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/resend'
import { passwordResetTemplate } from '@/lib/email/templates'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // admin.generateLink uses implicit flow — Supabase puts the session in the
    // URL hash fragment, which server-side route handlers cannot see. The
    // redirectTo must be a client-side page that lets the browser SDK process
    // the hash and establish the session via onAuthStateChange.
    let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
    // Bulletproof sanitization: remove quotes, remove ALL existing protocol prefixes, and trailing slashes
    appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
    if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
    // Re-apply protocol
    appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${appUrl}/auth/reset-password`,
      },
    })

    if (error) {
      // Don't expose whether an email exists — return success either way
      console.error('[reset-password] generateLink error:', error.message)
      return NextResponse.json({ ok: true })
    }

    let resetLink = data.properties?.action_link
    if (resetLink) {
      // Wrap in branded enrollment link for consistency
      resetLink = `${appUrl}/auth/enroll?link=${encodeURIComponent(resetLink)}`
    }
    if (!resetLink) {
      console.error('[reset-password] No action_link returned')
      return NextResponse.json({ ok: true })
    }

    await sendEmail({
      to: email,
      subject: 'Reset your Vibe Hyr password',
      html: passwordResetTemplate(resetLink),
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[reset-password]', err)
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 })
  }
}
