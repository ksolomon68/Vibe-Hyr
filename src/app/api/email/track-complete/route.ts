// app/api/email/track-complete/route.ts
// Called from WorkplaceLessonPlayerWrapper when a user completes all lessons in a track.

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { trackCompleteTemplate } from '@/lib/email/templates'

const TRACK_NAMES: Record<string, string> = {
  t1: 'Common Sense in the Workplace',
  t2: 'Reaction to Response',
  t3: 'Lead Yourself',
  t4: 'Vibing as a Unit',
}

const TRACK_NUMBERS: Record<string, string> = {
  t1: '01', t2: '02', t3: '03', t4: '04',
}

export async function POST(req: NextRequest) {
  try {
    const { userId, trackId } = await req.json()
    if (!userId || !trackId) {
      return NextResponse.json({ error: 'userId and trackId are required' }, { status: 400 })
    }

    const { data: profile } = await getSupabaseAdmin()
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!profile?.email) {
      return NextResponse.json({ ok: true }) // no-op if no email found
    }

    const trackName   = TRACK_NAMES[trackId]   ?? trackId
    const trackNumber = TRACK_NUMBERS[trackId] ?? trackId
    let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
    // Bulletproof sanitization: remove quotes, remove ALL existing protocol prefixes, and trailing slashes
    appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
    if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
    // Re-apply protocol
    appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`

    await sendEmail({
      to: profile.email,
      subject: `Track ${trackNumber} Complete — ${trackName} ✦`,
      html: trackCompleteTemplate(
        profile.full_name ?? '',
        trackName,
        trackNumber,
        `${appUrl}/workplace/learn`
      ),
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[track-complete email]', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
