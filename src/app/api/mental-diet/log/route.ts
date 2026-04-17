// app/api/mental-diet/log/route.ts
// Adds a mental diet entry.
// Recalculates today's compliance score and persists to profiles.
// Computes identity_score_contribution delta.

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { MentalDietCategory } from '@/types'

const VALID_CATEGORIES: MentalDietCategory[] = [
  'thoughts', 'media', 'conversations', 'reactions',
]

export async function POST(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = createServerClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    const body              = await req.json()
    const category:          MentalDietCategory = body.category
    const entryText:         string             = (body.entryText ?? '').trim()
    const complianceRating:  number             = Number(body.complianceRating)

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }
    if (!entryText) {
      return NextResponse.json({ error: 'Entry text is required' }, { status: 400 })
    }
    if (![1, 2, 3].includes(complianceRating)) {
      return NextResponse.json({ error: 'Compliance rating must be 1, 2, or 3' }, { status: 400 })
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const today = new Date().toISOString().slice(0, 10)

    // ── Compute bridge_day from profile ─────────────────────────────────────
    const { data: profile } = await admin
      .from('profiles')
      .select('bridge_start_date, identity_score_contribution')
      .eq('id', user.id)
      .single()

    let bridgeDay: number | null = null
    if (profile?.bridge_start_date) {
      const start = new Date(profile.bridge_start_date)
      const now   = new Date(today)
      const diff  = Math.floor((now.getTime() - start.getTime()) / 86_400_000) + 1
      bridgeDay = diff > 0 && diff <= 90 ? diff : null
    }

    // ── Insert log entry ─────────────────────────────────────────────────────
    const { data: newEntry, error: insertErr } = await admin
      .from('mental_diet_logs')
      .insert({
        user_id:          user.id,
        date:             today,
        category,
        entry_text:       entryText,
        compliance_rating: complianceRating,
        bridge_day:       bridgeDay,
      })
      .select()
      .single()

    if (insertErr) {
      console.error('[diet-log] insert error:', insertErr)
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    // ── Recalculate today's compliance score ─────────────────────────────────
    const { data: todayLogs } = await admin
      .from('mental_diet_logs')
      .select('compliance_rating')
      .eq('user_id', user.id)
      .eq('date', today)

    const ratings    = (todayLogs ?? []).map(l => l.compliance_rating)
    const avgRating  = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : complianceRating
    const scoreToday = Math.round((avgRating / 3) * 100 * 10) / 10  // 0–100, 1 dp

    // ── Identity score delta ─────────────────────────────────────────────────
    // Mental diet daily: today's score * 0.05 (max +5)
    // We add a per-entry delta (not cumulative) to avoid over-counting.
    // delta = compliance_rating contribution capped: (rating/3)*0.05 per entry
    const entryDelta  = (complianceRating / 3) * 0.05
    const currentScore = Number(profile?.identity_score_contribution ?? 0)
    const newScore     = Math.round((currentScore + entryDelta) * 10) / 10

    // ── Persist to profiles ──────────────────────────────────────────────────
    await admin
      .from('profiles')
      .update({
        mental_diet_score:            scoreToday,
        identity_score_contribution:  newScore,
      })
      .eq('id', user.id)

    return NextResponse.json({
      ok:          true,
      entry:       newEntry,
      scoreToday,
      identityScore: newScore,
    })
  } catch (err: any) {
    console.error('[diet-log]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ── Set bridge_start_date ────────────────────────────────────────────────────

export async function PUT(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const today = new Date().toISOString().slice(0, 10)
    const { error } = await admin
      .from('profiles')
      .update({ bridge_start_date: today })
      .eq('id', user.id)
      .is('bridge_start_date', null) // only set if not already set

    if (error) {
      console.error('[diet-log PUT] bridge_start_date error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, bridge_start_date: today })
  } catch (err: any) {
    console.error('[diet-log PUT]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
