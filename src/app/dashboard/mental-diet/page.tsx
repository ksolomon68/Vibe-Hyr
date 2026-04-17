import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { MentalDietClient } from '@/components/mental-diet/MentalDietClient'
import type { MentalDietLog } from '@/types'

export const metadata = { title: 'Mental Diet Tracker' }

export default async function MentalDietPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/mental-diet')

  const { data: profile } = await supabase
    .from('profiles')
    .select('bridge_start_date, mental_diet_score, checkin_streak')
    .eq('id', user.id)
    .single()

  const today = new Date().toISOString().slice(0, 10)

  // Today's log entries
  const { data: todayLogs } = await supabase
    .from('mental_diet_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .order('logged_at', { ascending: false })

  // Last 7 days scores (one row per day)
  const sevenDaysAgo = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10)
  const { data: weekLogs } = await supabase
    .from('mental_diet_logs')
    .select('date, compliance_rating')
    .eq('user_id', user.id)
    .gte('date', sevenDaysAgo)
    .order('date', { ascending: true })

  // Compute bridge day
  let bridgeDay: number | null = null
  const bridgeStartDate = profile?.bridge_start_date ?? null
  if (bridgeStartDate) {
    const start = new Date(bridgeStartDate)
    const now   = new Date(today)
    const diff  = Math.floor((now.getTime() - start.getTime()) / 86_400_000) + 1
    bridgeDay = diff > 0 && diff <= 90 ? diff : diff > 90 ? 91 : null
  }

  // Compute today's compliance score
  const todayRatings  = (todayLogs ?? []).map((l: any) => l.compliance_rating as number)
  const todayAvg      = todayRatings.length
    ? todayRatings.reduce((a, b) => a + b, 0) / todayRatings.length
    : null
  const todayScore    = todayAvg !== null ? Math.round((todayAvg / 3) * 100) : null

  // Compute 7-day scores per day
  const dayScoreMap: Record<string, number[]> = {}
  for (const log of (weekLogs ?? []) as any[]) {
    if (!dayScoreMap[log.date]) dayScoreMap[log.date] = []
    dayScoreMap[log.date].push(log.compliance_rating)
  }

  // Build last 7 days array
  const sevenDays = Array.from({ length: 7 }, (_, i) => {
    const d    = new Date(Date.now() - (6 - i) * 86_400_000)
    const iso  = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    const ratings = dayScoreMap[iso] ?? []
    const avg     = ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null
    const score   = avg !== null ? Math.round((avg / 3) * 100) : null
    return { date: iso, label, score }
  })

  // Weekly insight logic
  const daysAbove70 = sevenDays.filter(d => d.score !== null && d.score >= 70).length
  let weeklyInsight: string
  if (daysAbove70 >= 5) {
    weeklyInsight = 'Your mental diet is strong. The bridge is building.'
  } else if (daysAbove70 >= 3) {
    weeklyInsight = 'Consistent progress. Watch for resistance patterns.'
  } else {
    weeklyInsight = 'Your RAS is scanning for lack. Recommit to the diet today.'
  }

  // Weekly average
  const scoredDays   = sevenDays.filter(d => d.score !== null)
  const weeklyAvg    = scoredDays.length
    ? Math.round(scoredDays.reduce((a, d) => a + (d.score ?? 0), 0) / scoredDays.length)
    : null

  return (
    <>
      <Navbar />
      <main className="pt-[68px] min-h-screen bg-[#0a0a0a]">
        <MentalDietClient
          todayLogs={(todayLogs ?? []) as MentalDietLog[]}
          todayScore={todayScore}
          sevenDays={sevenDays}
          weeklyInsight={weeklyInsight}
          weeklyAvg={weeklyAvg}
          bridgeDay={bridgeDay}
          bridgeStartDate={bridgeStartDate}
          entryCount={todayLogs?.length ?? 0}
        />
      </main>
      <Footer />
    </>
  )
}
