import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { JournalForm } from '@/components/journal/JournalForm'
import { createClient } from '@/lib/supabase/server'
import { getStreakMessage, formatDate } from '@/lib/utils'
import { Flame, BookOpen, Calendar } from 'lucide-react'

export const metadata = { title: 'Revision Journal' }

export default async function JournalPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/journal')

  const { data: profile } = await supabase
    .from('profiles')
    .select('journal_streak, membership_tier')
    .eq('id', user.id)
    .single()

  const { data: recentEntries } = await supabase
    .from('journal_entries')
    .select('id, date, event_raw, emotion_before, emotion_after, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(7)

  const streak = profile?.journal_streak ?? 0

  return (
    <>
      <Navbar />
      <main className="pt-[68px]">
        {/* Header */}
        <section className="py-16 px-6 md:px-14 border-b-2 border-orange-DEFAULT/20 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          <div className="max-w-5xl mx-auto">
            <div className="label mb-4">Daily Practice</div>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] tracking-[0.02em] mb-2">
                  REVISION<br />
                  <span className="text-orange-DEFAULT">JOURNAL</span>
                </h1>
                <p className="font-body italic text-grey-DEFAULT text-lg">
                  Neville's pruning shears — digitized. Rewrite your day, rewire your subconscious.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-black-2 border border-orange-DEFAULT/40 px-5 py-3">
                <Flame size={20} className="text-orange-DEFAULT" />
                <div>
                  <span className="font-display text-3xl text-orange-DEFAULT">{streak}</span>
                  <span className="font-mono text-[0.55rem] tracking-widest text-grey-dark uppercase block">
                    day streak
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="py-12 px-6 md:px-14">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
            {/* Form — 2 cols */}
            <div className="lg:col-span-2">
              <JournalForm streak={streak} />
            </div>

            {/* Sidebar — recent entries */}
            <div>
              <div className="bg-black-2 border border-white/8 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Calendar size={14} className="text-orange-DEFAULT" />
                  <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-grey-DEFAULT">
                    Recent Revisions
                  </span>
                </div>

                {recentEntries && recentEntries.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {recentEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-3 bg-black-3 border border-white/8 hover:border-orange-DEFAULT/30 transition-colors cursor-pointer"
                      >
                        <p className="font-mono text-[0.55rem] tracking-[0.15em] text-orange-DEFAULT mb-1">
                          {formatDate(entry.date)}
                        </p>
                        <p className="font-body text-xs text-grey-DEFAULT line-clamp-2 leading-relaxed">
                          {entry.event_raw}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen size={24} className="text-grey-dark mx-auto mb-3" />
                    <p className="font-mono text-[0.6rem] tracking-widest text-grey-dark uppercase">
                      No entries yet
                    </p>
                    <p className="font-body text-xs italic text-grey-dark mt-1">
                      Your first revision starts tonight.
                    </p>
                  </div>
                )}
              </div>

              {/* Nightly reminder */}
              <div className="mt-4 bg-black-2 border border-orange-DEFAULT/30 p-5">
                <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-orange-DEFAULT mb-2">
                  ✦ Tonight's Reminder
                </p>
                <p className="font-body text-sm italic text-grey-DEFAULT leading-relaxed">
                  "Your subconscious isn't reacting to the world — it's reacting to your memory of the world. When you revise the past, you change the lens you see through."
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
