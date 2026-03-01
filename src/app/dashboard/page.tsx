import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { COURSES } from '@/lib/data/courses'
import { getTierLabel, getStreakMessage } from '@/lib/utils'
import { Flame, BookOpen, Target, Users, ArrowRight, Crown, Sparkles } from 'lucide-react'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: journalEntries } = await supabase
    .from('journal_entries')
    .select('id')
    .eq('user_id', user.id)

  const { data: assumptions } = await supabase
    .from('assumptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const tier        = profile?.membership_tier ?? 'free'
  const streak      = profile?.journal_streak  ?? 0
  const totalJournal = journalEntries?.length   ?? 0
  const activeAssumptions = assumptions?.length ?? 0

  const QUICK_LINKS = [
    { href: '/journal',   icon: BookOpen, label: 'Tonight\'s Revision', desc: 'Open the nightly journal' },
    { href: '/courses',   icon: Target,   label: 'Continue Course',     desc: 'Pick up where you left off' },
    { href: '/quizzes',   icon: Sparkles, label: 'Take a Quiz',         desc: 'Test your implementation' },
    { href: '/community', icon: Users,    label: 'Community',           desc: 'Share your bridge' },
  ]

  return (
    <>
      <Navbar />
      <main className="pt-[68px] min-h-screen">
        {/* Header */}
        <section className="py-12 px-6 md:px-14 border-b-2 border-orange-DEFAULT/20 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-6">
            <div>
              <div className="label mb-3">Member Dashboard</div>
              <h1 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-[0.02em]">
                WELCOME BACK,<br />
                <span className="text-orange-DEFAULT">
                  {profile?.full_name?.split(' ')[0]?.toUpperCase() ?? 'ARCHITECT'}
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-3 bg-black-2 border border-orange-DEFAULT/40 px-5 py-3">
              <Crown size={16} className="text-orange-DEFAULT" />
              <div>
                <span className="font-display text-xl text-orange-DEFAULT block leading-none">
                  {getTierLabel(tier)}
                </span>
                <span className="font-mono text-[0.55rem] tracking-widest text-grey-dark uppercase">
                  Current Tier
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="py-12 px-6 md:px-14">
          <div className="max-w-7xl mx-auto">

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] bg-orange-DEFAULT border-2 border-orange-DEFAULT mb-10">
              {[
                { icon: Flame,    label: 'Journal Streak',    val: `${streak} days`,        sub: getStreakMessage(streak) },
                { icon: BookOpen, label: 'Total Revisions',   val: totalJournal,             sub: 'entries in your timeline' },
                { icon: Sparkles, label: 'Active Assumptions', val: activeAssumptions,        sub: 'bridges being built' },
                { icon: Crown,    label: 'Tier',              val: getTierLabel(tier),        sub: 'upgrade to unlock more' },
              ].map(({ icon: Icon, label, val, sub }) => (
                <div key={label} className="bg-black-2 p-7 hover:bg-black-3 transition-colors">
                  <Icon size={18} className="text-orange-DEFAULT mb-3" />
                  <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-dark block mb-1">{label}</span>
                  <span className="font-display text-3xl text-white block leading-none mb-1">{val}</span>
                  <span className="font-body text-xs text-grey-dark italic">{sub}</span>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

              {/* Quick actions */}
              <div className="lg:col-span-1">
                <h2 className="font-display text-2xl tracking-widest text-white mb-5">QUICK ACTIONS</h2>
                <div className="flex flex-col gap-2">
                  {QUICK_LINKS.map(({ href, icon: Icon, label, desc }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-4 p-4 bg-black-2 border border-white/8 hover:border-orange-DEFAULT/30 hover:bg-black-3 transition-all group"
                    >
                      <Icon size={18} className="text-orange-DEFAULT flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-mono text-[0.65rem] tracking-[0.1em] uppercase text-white block">{label}</span>
                        <span className="font-body text-xs text-grey-dark italic">{desc}</span>
                      </div>
                      <ArrowRight size={14} className="text-grey-dark group-hover:text-orange-DEFAULT transition-colors" />
                    </Link>
                  ))}
                </div>

                {/* Upgrade CTA for non-elite */}
                {tier !== 'elite' && (
                  <div className="mt-6 bg-black-2 border border-orange-DEFAULT/40 p-5">
                    <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-orange-DEFAULT mb-2">
                      ✦ Unlock More
                    </p>
                    <p className="font-body text-sm text-grey-DEFAULT mb-4 leading-relaxed">
                      {tier === 'free'
                        ? 'Upgrade to Architect for the full journal, Courses 2 & 3, and community access.'
                        : 'Upgrade to Reality Master for Course 4, the full Assumption Lab, and monthly live Q&As.'
                      }
                    </p>
                    <Link href="/pricing" className="btn-orange text-[0.62rem] px-6 py-3">
                      View Plans
                    </Link>
                  </div>
                )}
              </div>

              {/* Courses progress */}
              <div className="lg:col-span-2">
                <h2 className="font-display text-2xl tracking-widest text-white mb-5">YOUR COURSES</h2>
                <div className="flex flex-col gap-3">
                  {COURSES.map((course) => {
                    const tierRank   = { free: 0, architect: 1, elite: 2 }
                    const hasAccess  = tierRank[tier] >= tierRank[course.tier]
                    return (
                      <div
                        key={course.id}
                        className="flex items-center gap-5 p-5 bg-black-2 border border-white/8 hover:border-orange-DEFAULT/30 transition-all"
                      >
                        <div className="font-display text-3xl text-orange-DEFAULT/20 leading-none w-12 flex-shrink-0">
                          {String(course.order_index).padStart(2,'0')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-base tracking-[0.04em] text-white leading-tight mb-0.5 truncate">
                            {course.title}
                          </p>
                          <p className="font-body text-xs italic text-grey-dark truncate">
                            {course.subtitle}
                          </p>
                          {hasAccess && (
                            <div className="mt-2 h-px bg-black-4">
                              <div className="h-px bg-orange-DEFAULT" style={{ width: '0%' }} />
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {hasAccess ? (
                            <Link
                              href={`/courses/${course.slug}`}
                              className="font-mono text-[0.58rem] tracking-widest uppercase text-orange-DEFAULT hover:text-orange-light transition-colors flex items-center gap-1"
                            >
                              Open <ArrowRight size={10} />
                            </Link>
                          ) : (
                            <Link
                              href="/pricing"
                              className="font-mono text-[0.58rem] tracking-widest uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors"
                            >
                              Upgrade
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
