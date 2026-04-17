// app/api/email/checkin-reminder/route.ts
// Cron job: send a reminder to users who haven't checked in by 6pm UTC.
// Call via a scheduled job hitting GET /api/email/checkin-reminder
// with header: Authorization: Bearer <CRON_SECRET>

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function buildReminderHtml(
  firstName:  string,
  streak:     number,
  appUrl:     string,
): string {
  const BG      = '#0E0C08'
  const PANEL   = '#141008'
  const CARD    = '#1E1610'
  const BORDER  = '#2E2416'
  const CREAM   = '#FAF9F6'
  const ORANGE  = '#E8621A'
  const GREY    = '#8A7A6A'

  const streakWarning = streak > 3
    ? `<p style="margin:0 0 16px;font-size:13px;color:${GREY};">
         ⚠️ You have a <strong style="color:${ORANGE};">${streak}-day streak</strong> — check in today to keep it alive.
       </p>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${BG};font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};min-height:100vh;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:${BG};padding:32px 40px 28px;border-bottom:3px solid ${ORANGE};">
            <span style="font-size:22px;font-weight:900;letter-spacing:6px;color:${ORANGE};text-transform:uppercase;">VIBE</span><!--
            --><span style="font-size:22px;font-weight:900;letter-spacing:6px;color:${CREAM};text-transform:uppercase;">HYR</span>
          </td>
        </tr>
        <tr>
          <td style="background:${CREAM};padding:48px 40px 40px;">
            <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;letter-spacing:4px;color:${ORANGE};text-transform:uppercase;">
              YOUR NEURAL STATE IS UNCHECKED TODAY
            </h1>
            <p style="margin:0 0 20px;font-size:16px;color:#1A1208;">
              Hey ${firstName || 'Architect'} —
            </p>
            <p style="margin:0 0 16px;font-size:13px;color:#333;line-height:1.6;">
              You haven't set your neural state today. Your daily check-in takes 60 seconds
              and keeps your identity imprint on track.
            </p>
            ${streakWarning}
            <a
              href="${appUrl}/dashboard"
              style="
                display:inline-block;background:${ORANGE};color:#fff;
                font-weight:700;font-size:12px;letter-spacing:3px;
                text-transform:uppercase;padding:14px 32px;
                text-decoration:none;margin-top:8px;
              "
            >CHECK IN NOW →</a>
          </td>
        </tr>
        <tr>
          <td style="background:${PANEL};padding:24px 40px;border-top:1px solid ${BORDER};">
            <p style="margin:0;font-size:10px;letter-spacing:2px;color:${BORDER};text-transform:uppercase;text-align:center;font-family:monospace;">
              vibehyr.com · The Architecture of Reality
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function GET(req: NextRequest) {
  // ── Auth guard for cron ───────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const today = new Date().toISOString().slice(0, 10)

    // Find users who have NOT checked in today
    const { data: checkedInToday } = await admin
      .from('daily_checkins')
      .select('user_id')
      .eq('date', today)

    const checkedInIds = new Set((checkedInToday ?? []).map(r => r.user_id))

    // Get all profiles with email — exclude those who already checked in
    const { data: allProfiles } = await admin
      .from('profiles')
      .select('id, email, full_name, checkin_streak')

    const toNotify = (allProfiles ?? []).filter(
      p => p.email && !checkedInIds.has(p.id),
    )

    if (toNotify.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    // Instantiate Resend inside handler (guard rail compliance)
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const FROM   = process.env.EMAIL_FROM ?? 'Vibe Hyr <noreply@vibehyr.com>'

    let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
    appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
    if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
    appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1')
      ? `http://${appUrl}`
      : `https://${appUrl}`

    let sent = 0
    for (const profile of toNotify) {
      try {
        const firstName = profile.full_name?.split(' ')[0] ?? ''
        await resend.emails.send({
          from:    FROM,
          to:      profile.email,
          subject: 'Your neural state is unchecked today',
          html:    buildReminderHtml(firstName, profile.checkin_streak ?? 0, appUrl),
        })
        sent++
      } catch (emailErr) {
        console.error('[checkin-reminder] email error for', profile.id, emailErr)
      }
    }

    return NextResponse.json({ ok: true, sent })
  } catch (err: any) {
    console.error('[checkin-reminder]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
