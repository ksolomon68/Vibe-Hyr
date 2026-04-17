// app/api/email/diet-alert/route.ts
// Cron job: email users whose mental diet score has been below 50% for 3 consecutive days.
// Call via GET /api/email/diet-alert with header: Authorization: Bearer <CRON_SECRET>

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const WEEKLY_INSIGHT_LOW =
  'Your RAS is scanning for lack. Recommit to the diet today.'

function buildDietAlertHtml(
  firstName: string,
  appUrl:    string,
): string {
  const BG     = '#0E0C08'
  const PANEL  = '#141008'
  const BORDER = '#2E2416'
  const CREAM  = '#FAF9F6'
  const ORANGE = '#E8621A'

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
            <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;letter-spacing:4px;color:${ORANGE};text-transform:uppercase;">
              YOUR MENTAL DIET NEEDS ATTENTION
            </h1>
            <p style="margin:0 0 20px;font-size:16px;color:#1A1208;">
              Hey ${firstName || 'Architect'} —
            </p>
            <div style="background:#F5EFE6;border-left:4px solid ${ORANGE};padding:16px 20px;margin-bottom:20px;border-radius:0 8px 8px 0;">
              <p style="margin:0;font-size:13px;color:#5A4A3A;font-style:italic;line-height:1.6;">
                "${WEEKLY_INSIGHT_LOW}"
              </p>
            </div>
            <p style="margin:0 0 20px;font-size:13px;color:#333;line-height:1.6;">
              Your mental diet has been below 50% for the past 3 days. Every thought,
              conversation, and reaction is either building your bridge or dismantling it.
              Log your entries today and recommit to the diet.
            </p>
            <a
              href="${appUrl}/dashboard/mental-diet"
              style="
                display:inline-block;background:${ORANGE};color:#fff;
                font-weight:700;font-size:12px;letter-spacing:3px;
                text-transform:uppercase;padding:14px 32px;
                text-decoration:none;margin-top:8px;
              "
            >LOG YOUR DIET →</a>
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

    // Build last 3 date strings
    const dates: string[] = []
    for (let i = 1; i <= 3; i++) {
      dates.push(new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10))
    }

    // For each date, get per-user average compliance
    // Group by (user_id, date) → avg compliance_rating
    const { data: logs } = await admin
      .from('mental_diet_logs')
      .select('user_id, date, compliance_rating')
      .in('date', dates)

    if (!logs || logs.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    // Compute per-user per-day scores
    const scoreMap: Record<string, Record<string, number[]>> = {}
    for (const log of logs) {
      if (!scoreMap[log.user_id]) scoreMap[log.user_id] = {}
      if (!scoreMap[log.user_id][log.date]) scoreMap[log.user_id][log.date] = []
      scoreMap[log.user_id][log.date].push(log.compliance_rating)
    }

    // Find users who had score < 50% on all 3 days (must have logged all 3 days)
    const alertUserIds: string[] = []
    for (const [userId, dayMap] of Object.entries(scoreMap)) {
      if (Object.keys(dayMap).length < 3) continue // must have logged all 3 days
      const allBelow = dates.every(d => {
        const ratings = dayMap[d]
        if (!ratings || ratings.length === 0) return false
        const avg   = ratings.reduce((a, b) => a + b, 0) / ratings.length
        const score = (avg / 3) * 100
        return score < 50
      })
      if (allBelow) alertUserIds.push(userId)
    }

    if (alertUserIds.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    // Fetch profiles
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, email, full_name')
      .in('id', alertUserIds)

    const { Resend } = await import('resend')
    const resend     = new Resend(process.env.RESEND_API_KEY)
    const FROM       = process.env.EMAIL_FROM ?? 'Vibe Hyr <noreply@vibehyr.com>'

    let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
    appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
    if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
    appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1')
      ? `http://${appUrl}`
      : `https://${appUrl}`

    let sent = 0
    for (const profile of profiles ?? []) {
      if (!profile.email) continue
      try {
        const firstName = profile.full_name?.split(' ')[0] ?? ''
        await resend.emails.send({
          from:    FROM,
          to:      profile.email,
          subject: 'Your mental diet needs attention',
          html:    buildDietAlertHtml(firstName, appUrl),
        })
        sent++
      } catch (emailErr) {
        console.error('[diet-alert] email error for', profile.id, emailErr)
      }
    }

    return NextResponse.json({ ok: true, sent })
  } catch (err: any) {
    console.error('[diet-alert]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
