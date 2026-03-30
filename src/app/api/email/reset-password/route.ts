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

    // Generate the Supabase recovery link server-side
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: 'https://vibehyr.com/reset-password',
      },
    })

    if (error) {
      // Don't expose whether an email exists — return success either way
      console.error('[reset-password] generateLink error:', error.message)
      return NextResponse.json({ ok: true })
    }

    const resetLink = data.properties?.action_link
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
