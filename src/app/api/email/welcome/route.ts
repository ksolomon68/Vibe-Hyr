// app/api/email/welcome/route.ts
// Sends a branded welcome email after self-signup.
// Called client-side from the signup page immediately after supabase.auth.signUp() succeeds.

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'
import { welcomeFreeTemplate, welcomePaidTemplate } from '@/lib/email/templates'

export async function POST(req: NextRequest) {
  try {
    const { name, email, plan } = await req.json()

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing name or email' }, { status: 400 })
    }

    let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
    // Bulletproof sanitization: remove quotes, remove ALL existing protocol prefixes, and trailing slashes
    appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
    if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
    // Re-apply protocol
    appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`

    const dashboardUrl = `${appUrl}/dashboard`

    const html = plan && plan !== 'free'
      ? welcomePaidTemplate(name, plan, dashboardUrl)
      : welcomeFreeTemplate(name, dashboardUrl)

    const subject = plan && plan !== 'free'
      ? `Welcome to Vibe Hyr — Your ${plan === 'elite' ? 'Reality Master' : 'Architect'} access is ready`
      : 'Welcome to Vibe Hyr — Your journey starts here'

    await sendEmail({ to: email, subject, html })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/email/welcome]', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
