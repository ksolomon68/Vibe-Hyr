// app/api/checkin/route.ts
// Submits the daily Neural Pulse check-in.
// Calculates streak, persists to daily_checkins + profiles.
// Computes identity_score_contribution delta.

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { CheckinStateLabel } from '@/types'

const STREAK_MILESTONES = [7, 14, 30, 60, 90]

function milestoneBonus(streak: number): number {
  return STREAK_MILESTONES.includes(streak) ? 0.5 : 0
}

function stateBonus(stateScore: number): number {
  // Map 1-4 → 0-2
  return ((stateScore - 1) / 3) * 2
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = createServerClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    const body = await req.json()
    const stateLabel:      CheckinStateLabel = body.stateLabel
    const stateScore:      number            = Number(body.stateScore)
    const journalPrompt:   string | null     = body.journalPrompt   ?? null
    const journalResponse: string | null     = body.journalResponse ?? null

    const validStates: CheckinStateLabel[] = [
      'beta_resistance', 'alpha_aware', 'theta_receptive', 'identity_locked',
    ]
    if (!validStates.includes(stateLabel) || isNaN(stateScore) || stateScore < 1 || stateScore > 4) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
    }

    // ── Admin client for service-level operations ────────────────────────────
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // ── Fetch profile ────────────────────────────────────────────────────────
    const { data: profile } = await admin
      .from('profiles')
      .select('checkin_streak, last_checkin_date, identity_score_contribution')
      .eq('id', user.id)
      .single()

    // ── Compute streak ───────────────────────────────────────────────────────
    const today     = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)

    const lastDate      = profile?.last_checkin_date ?? null
    const currentStreak = profile?.checkin_streak ?? 0

    let newStreak: number
    if (lastDate === yesterday) {
      newStreak = currentStreak + 1
    } else if (lastDate === today) {
      // Already checked in today (shouldn't normally reach here, but guard it)
      newStreak = currentStreak
    } else {
      newStreak = 1
    }

    // ── Upsert daily_checkins ───────────────────────────────────────────────
    const { error: insertErr } = await admin
      .from('daily_checkins')
      .upsert(
        {
          user_id:          user.id,
          date:             today,
          state_label:      stateLabel,
          state_score:      stateScore,
          journal_prompt:   journalPrompt,
          journal_response: journalResponse,
          streak_count:     newStreak,
        },
        { onConflict: 'user_id,date' },
      )

    if (insertErr) {
      console.error('[checkin] insert error:', insertErr)
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    // ── Identity score delta ────────────────────────────────────────────────
    const currentScore = Number(profile?.identity_score_contribution ?? 0)
    const delta =
      2                           // daily check-in bonus
      + stateBonus(stateScore)    // state score bonus  (0-2)
      + milestoneBonus(newStreak) // streak milestone bonus (+0.5)

    const newScore = Math.round((currentScore + delta) * 10) / 10

    // ── Update profiles ─────────────────────────────────────────────────────
    const { error: updateErr } = await admin
      .from('profiles')
      .update({
        checkin_streak:              newStreak,
        last_checkin_date:           today,
        identity_score_contribution: newScore,
      })
      .eq('id', user.id)

    if (updateErr) {
      console.error('[checkin] profile update error:', updateErr)
      // Non-fatal: still return success to client
    }

    return NextResponse.json({ ok: true, streak: newStreak, identityScore: newScore })
  } catch (err: any) {
    console.error('[checkin]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
