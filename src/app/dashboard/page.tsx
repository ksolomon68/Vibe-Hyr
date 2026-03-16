import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { getTierLabel, getStreakMessage } from '@/lib/utils'
import { Flame, BookOpen, Target, Users, ArrowRight, Crown, Sparkles } from 'lucide-react'
import { PersonalUpgradeButton } from '@/components/pricing/PersonalUpgradeButton'
import type { PersonalTier } from '@/components/pricing/PersonalCheckoutModal'
import { COURSES } from '@/lib/data/courses'
import { TRACKS } from '@/lib/business/curriculum'
import { PROGRAMS } from '@/lib/education/curriculum'

export const metadata = { title: 'Dashboard' }

// Tier rank helper
const TIER_RANK: Record<string, number> = { free: 0, architect: 1, elite: 2 }

// Business tier access (matches business/[trackId]/[lessonId]/page.tsx)
const BUSINESS_TIER_ACCESS: Record<string, string[]> = {
  free:      ['common-sense-in-the-workplace'],
  architect: ['common-sense-in-the-workplace', 'from-reaction-to-response', 'know-yourself-lead-yourself'],
  elite:     ['common-sense-in-the-workplace', 'from-reaction-to-response', 'know-yourself-lead-yourself', 'the-high-frequency-team'],
}

// Education program tier requirements (matches educators/[programSlug]/[moduleId]/page.tsx)
const PROGRAM_TIERS: Record<string, string> = {
  'the-educator-reset':    'free',
  'vibrational-leadership': 'architect',
  'co-regulation-mastery': 'architect',
  'the-retained-educator': 'elite',
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const tier             = profile?.membership_tier ?? 'free'
  const institutionType  = profile?.institution_type ?? 'individual'
  const isSuperAdmin     = profile?.is_super_admin ?? false

  // ── Stats queries (shared across all user types) ───────────────────────────
  const [
    { data: journalEntries },
    { data: assumptions },
  ] = await Promise.all([
    supabase.from('journal_entries').select('id').eq('user_id', user.id),
    supabase.from('assumptions').select('*').eq('user_id', user.id).eq('status', 'active'),
  ])

  // ── Progress queries (type-specific) ──────────────────────────────────────
  let personalProgress:  Array<{ course_id: string; progress_percent: number }> = []
  let educationProgress: Array<{ program_id: string; module_id: string }> = []
  let workplaceProgress: Array<{ track_id: string; lesson_id: string }> = []

  if (institutionType === 'education') {
    const { data } = await supabase
      .from('education_progress')
      .select('program_id, module_id')
      .eq('user_id', user.id)
    educationProgress = data ?? []
  } else if (institutionType === 'business') {
    const { data } = await supabase
      .from('workplace_progress')
      .select('track_id, lesson_id')
      .eq('user_id', user.id)
    workplaceProgress = data ?? []
  } else {
    // individual (or super admin)
    const { data } = await supabase
      .from('course_progress')
      .select('course_id, progress_percent')
      .eq('user_id', user.id)
    personalProgress = data ?? []
  }

  const streak            = profile?.journal_streak ?? 0
  const totalJournal      = journalEntries?.length ?? 0
  const activeAssumptions = assumptions?.length ?? 0

  // Map DB tier to PersonalTier for checkout modal
  const upgradeTier: PersonalTier = tier === 'free' ? 'architect' : 'reality-master'

  const QUICK_LINKS = [
    { href: '/journal',   icon: BookOpen, label: "Tonight's Revision", desc: 'Open the nightly journal' },
    {
      href: institutionType === 'education' ? '/educators' : institutionType === 'business' ? '/business' : '/personal',
      icon: Target,
      label: 'Continue Course',
      desc: 'Pick up where you left off',
    },
    { href: '/personal',  icon: Sparkles, label: 'Take a Quiz',         desc: 'Test your implementation' },
    { href: '/community', icon: Users,    label: 'Community',            desc: 'Share your bridge' },
  ]

  // ── Build course list based on institution type ────────────────────────────

  // Personal courses
  const personalCourses = COURSES.map(course => {
    const hasAccess = isSuperAdmin || TIER_RANK[tier] >= TIER_RANK[course.tier]
    const progress  = personalProgress.find(p => p.course_id === course.id)?.progress_percent ?? 0
    const courseTier: PersonalTier = course.tier === 'elite' ? 'reality-master' : 'architect'
    return { ...course, hasAccess, progress, courseTier }
  })

  // Business tracks
  const allowedTracks = isSuperAdmin
    ? TRACKS.map(t => t.id)
    : BUSINESS_TIER_ACCESS[tier] ?? ['common-sense-in-the-workplace']

  const businessTracks = TRACKS.map(track => {
    const completedLessons = workplaceProgress
      .filter(p => p.track_id === track.id)
      .map(p => p.lesson_id)
    const total    = track.lessons.length
    const done     = completedLessons.length
    const pct      = total ? Math.round((done / total) * 100) : 0
    const hasAccess = allowedTracks.includes(track.id)
    // Find first incomplete lesson for "Continue" link
    const nextLesson = track.lessons.find(l => !completedLessons.includes(l.id)) ?? track.lessons[0]
    const href = `/business/${track.id}/${nextLesson.id}`
    return { ...track, hasAccess, progress: pct, href }
  })

  // Education programs
  const educationPrograms = PROGRAMS.map(program => {
    const completedModules = educationProgress
      .filter(p => p.program_id === program.id)
      .map(p => p.module_id)
    const total    = program.modules.length
    const done     = completedModules.length
    const pct      = total ? Math.round((done / total) * 100) : 0
    const programTier = PROGRAM_TIERS[program.slug] ?? 'free'
    const hasAccess = isSuperAdmin || TIER_RANK[tier] >= TIER_RANK[programTier]
    // Find first incomplete module
    const nextModule = program.modules.find(m => !completedModules.includes(m.id)) ?? program.modules[0]
    const href = `/educators/${program.slug}/${nextModule.id}`
    return { ...program, hasAccess, progress: pct, href }
  })

  return (
    <>
      <Navbar />
      <main className="pt-[68px] min-h-screen">
        {/* Header */}
        <section className="py-12 px-6 md:px-14 border-b-2 border-orange/20 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange" />
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
            <div className="flex items-center gap-3 bg-black-2 border border-orange/40 px-5 py-3">
              <Crown size={16} className="text-orange" />
              <div>
                <span className="font-display text-xl text-orange block leading-none">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] bg-orange border-2 border-orange mb-10">
              {[
                { icon: Flame,    label: 'Journal Streak',    val: `${streak} days`,   sub: getStreakMessage(streak) },
                { icon: BookOpen, label: 'Total Revisions',   val: totalJournal,        sub: 'entries in your timeline' },
                { icon: Sparkles, label: 'Active Assumptions', val: activeAssumptions,  sub: 'bridges being built' },
                { icon: Crown,    label: 'Tier',              val: getTierLabel(tier),  sub: 'upgrade to unlock more' },
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
                  {QUICK_LINKS.map(({ href, icon: Icon, label, desc }, i) => (
                    <Link
                      key={i}
                      href={href}
                      className="flex items-center gap-4 p-4 bg-black-2 border border-white/8 hover:border-orange/30 hover:bg-black-3 transition-all group"
                    >
                      <Icon size={18} className="text-orange flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-mono text-[0.65rem] tracking-[0.1em] uppercase text-white block">{label}</span>
                        <span className="font-body text-xs text-grey-dark italic">{desc}</span>
                      </div>
                      <ArrowRight size={14} className="text-grey-dark group-hover:text-orange transition-colors" />
                    </Link>
                  ))}
                </div>

                {/* Upgrade CTA for all non-elite users */}
                {tier !== 'elite' && !isSuperAdmin && (
                  <div className="mt-6 bg-black-2 border border-orange/40 p-5">
                    <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-orange mb-2">
                      ✦ Unlock More
                    </p>
                    {institutionType === 'individual' ? (
                      <>
                        <p className="font-body text-sm text-grey-DEFAULT mb-4 leading-relaxed">
                          {tier === 'free'
                            ? 'Upgrade to Architect for the full journal, Courses 2 & 3, and community access.'
                            : 'Upgrade to Reality Master for Course 4, the full Assumption Lab, and monthly live Q&As.'
                          }
                        </p>
                        <PersonalUpgradeButton
                          tier={upgradeTier}
                          className="btn-orange text-[0.62rem] px-6 py-3"
                        >
                          Upgrade Plan
                        </PersonalUpgradeButton>
                      </>
                    ) : (
                      <>
                        <p className="font-body text-sm text-grey-DEFAULT mb-4 leading-relaxed">
                          {tier === 'free'
                            ? 'Your organization is on the Seeker plan. Ask your administrator to upgrade for access to more courses and tools.'
                            : 'Your organization is on the Architect plan. Ask your administrator to upgrade to Reality Master for the full curriculum.'
                          }
                        </p>
                        <Link
                          href={institutionType === 'education' ? '/educators#pricing' : '/business#pricing'}
                          className="btn-outline-orange text-[0.62rem] px-6 py-3"
                        >
                          View Plan Options
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Course list — varies by institution type */}
              <div className="lg:col-span-2">

                {/* ── PERSONAL COURSES ── */}
                {(institutionType === 'individual' || isSuperAdmin) && (
                  <>
                    <h2 className="font-display text-2xl tracking-widest text-white mb-5">YOUR COURSES</h2>
                    <div className="flex flex-col gap-3">
                      {personalCourses.map((course, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-5 p-5 bg-black-2 border border-white/8 hover:border-orange/30 transition-all"
                        >
                          <div className="font-display text-3xl text-orange/20 leading-none w-12 flex-shrink-0">
                            {String(course.order_index).padStart(2, '0')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-base tracking-[0.04em] text-white leading-tight mb-0.5 truncate">
                              {course.title}
                            </p>
                            <p className="font-body text-xs italic text-grey-dark truncate">
                              {course.subtitle}
                            </p>
                            {course.hasAccess && (
                              <div className="mt-2 h-px bg-black-4">
                                <div className="h-px bg-orange" style={{ width: `${course.progress}%` }} />
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {course.hasAccess ? (
                              <Link
                                href={`/personal/${course.slug}`}
                                className="font-mono text-[0.58rem] tracking-widest uppercase text-orange hover:text-orange-light transition-colors flex items-center gap-1"
                              >
                                Open <ArrowRight size={10} />
                              </Link>
                            ) : (
                              <PersonalUpgradeButton
                                tier={course.courseTier}
                                className="font-mono text-[0.58rem] tracking-widest uppercase text-grey-dark hover:text-orange transition-colors"
                              >
                                Upgrade →
                              </PersonalUpgradeButton>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ── BUSINESS TRACKS ── */}
                {(institutionType === 'business' || isSuperAdmin) && (
                  <div className={institutionType === 'individual' ? 'mt-10' : ''}>
                    <h2 className="font-display text-2xl tracking-widest text-white mb-5">
                      WORKPLACE TRAINING
                    </h2>
                    <div className="flex flex-col gap-3">
                      {businessTracks.map((track, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-5 p-5 bg-black-2 border border-white/8 hover:border-orange/30 transition-all"
                        >
                          <div className="font-display text-3xl text-orange/20 leading-none w-12 flex-shrink-0">
                            {track.num}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-base tracking-[0.04em] text-white leading-tight mb-0.5 truncate">
                              {track.title}
                            </p>
                            <p className="font-body text-xs italic text-grey-dark truncate">
                              {track.subtitle}
                            </p>
                            {track.hasAccess && (
                              <div className="mt-2 h-px bg-black-4">
                                <div className="h-px bg-orange" style={{ width: `${track.progress}%` }} />
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {track.hasAccess ? (
                              <Link
                                href={track.href}
                                className="font-mono text-[0.58rem] tracking-widest uppercase text-orange hover:text-orange-light transition-colors flex items-center gap-1"
                              >
                                {track.progress > 0 ? 'Continue' : 'Start'} <ArrowRight size={10} />
                              </Link>
                            ) : (
                              <span className="font-mono text-[0.58rem] tracking-widest uppercase text-grey-dark">
                                Locked
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── EDUCATION PROGRAMS ── */}
                {(institutionType === 'education' || isSuperAdmin) && (
                  <div className={institutionType === 'individual' ? 'mt-10' : ''}>
                    <h2 className="font-display text-2xl tracking-widest text-white mb-5">
                      EDUCATOR PROGRAMS
                    </h2>
                    <div className="flex flex-col gap-3">
                      {educationPrograms.map((program, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-5 p-5 bg-black-2 border border-white/8 hover:border-orange/30 transition-all"
                        >
                          <div className="font-display text-3xl text-orange/20 leading-none w-12 flex-shrink-0">
                            {program.num}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-base tracking-[0.04em] text-white leading-tight mb-0.5 truncate">
                              {program.title}
                            </p>
                            <p className="font-body text-xs italic text-grey-dark truncate">
                              {program.subtitle}
                            </p>
                            {program.hasAccess && (
                              <div className="mt-2 h-px bg-black-4">
                                <div className="h-px bg-orange" style={{ width: `${program.progress}%` }} />
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {program.hasAccess ? (
                              <Link
                                href={program.href}
                                className="font-mono text-[0.58rem] tracking-widest uppercase text-orange hover:text-orange-light transition-colors flex items-center gap-1"
                              >
                                {program.progress > 0 ? 'Continue' : 'Start'} <ArrowRight size={10} />
                              </Link>
                            ) : (
                              <span className="font-mono text-[0.58rem] tracking-widest uppercase text-grey-dark">
                                Locked
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
