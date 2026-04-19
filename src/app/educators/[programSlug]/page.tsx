import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { PROGRAMS } from '@/lib/education/curriculum'
import { cn } from '@/lib/utils'
import {
  Lock, Play, CheckCircle, Clock, BookOpen, GraduationCap
} from 'lucide-react'
import { CourseLockedScreen } from '@/components/CourseLockedScreen'

export async function generateMetadata({ params }: { params: { programSlug: string } }) {
  const program = PROGRAMS.find(p => p.slug === params.programSlug)
  if (!program) return {}
  return { title: `${program.title} — Vibe Hyr Educators`, description: program.description }
}

export default async function EducatorProgramPage({ params }: { params: { programSlug: string } }) {
  const program = PROGRAMS.find(p => p.slug === params.programSlug)
  if (!program) notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let canAccess = false;
  let completedModules: string[] = []

  if (user) {
    // Primary: check explicit course_access grant (covers bypass users + org-granted access)
    const { data: accessGrant } = await supabase
      .from('course_access')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_slug', program.id)
      .maybeSingle()

    // Fallback: check course_catalog RLS (for future paid-access path)
    const { data: catalogEntry } = await supabase
      .from('course_catalog')
      .select('id')
      .eq('slug', program.slug)
      .maybeSingle()

    canAccess = !!accessGrant || !!catalogEntry;

    if (canAccess) {
      const { data: prog } = await supabase
        .from('education_progress')
        .select('module_id')
        .eq('user_id', user.id)
        .eq('program_id', program.id)
      
      completedModules = prog?.map(p => p.module_id) ?? []
    }
  }

  // If locked, show locked screen unless user is not logged in
  if (user && !canAccess) {
    return (
      <CourseLockedScreen
        reason="tier_required"
        courseSlug={program.slug}
        sectionLabel="EDUCATION"
        backHref="/educators"
        backLabel="Back to Programs"
      />
    )
  }

  const pct = program.modules.length > 0
    ? Math.round((completedModules.length / program.modules.length) * 100)
    : 0

  const nextModule = program.modules.find(m => !completedModules.includes(m.id)) ?? program.modules[0]

  return (
    <>
      <Navbar />
      <main className="pt-[68px]">

        {/* ── HERO ── */}
        <section className="relative border-b-2 border-orange-DEFAULT/20 overflow-hidden bg-[#0E0C08]">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 font-display text-[14rem] md:text-[22rem] leading-none text-white select-none pointer-events-none pr-8 opacity-10 md:opacity-5">
            {program.num}
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-14 py-16 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/educators" className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors">
                ← Educator Programs
              </Link>
              <span className="text-grey-dark">/</span>
              <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase px-2.5 py-1 border border-orange-DEFAULT text-orange-DEFAULT">
                {program.audience}
              </span>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 items-start">
              {/* Left: title + description */}
              <div className="lg:col-span-2">
                <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-orange-DEFAULT mb-3">
                  Program {program.num} of 04
                </p>
                <h1 className="font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.93] tracking-[0.02em] mb-4 text-white">
                  {program.title.split(' ').map((word, i) => (
                    <span key={i} className={i === program.title.split(' ').length - 1 ? 'text-orange-DEFAULT' : ''}>
                      {word}{' '}
                    </span>
                  ))}
                </h1>
                <p className="font-body text-xl italic text-grey-DEFAULT mb-5 leading-relaxed max-w-2xl">
                  {program.subtitle}
                </p>
                <p className="font-body text-lg text-grey-DEFAULT leading-relaxed max-w-2xl">
                  {program.description}
                </p>
              </div>

              {/* Right: action card */}
              <div className="bg-black-2 border-2 border-orange-DEFAULT p-7">
                {user && pct > 0 && (
                  <div className="mb-6 pb-6 border-b border-white/8">
                    <div className="flex justify-between mb-2">
                      <span className="font-mono text-[0.55rem] tracking-widest uppercase text-grey-dark">Progress</span>
                      <span className="font-mono text-[0.55rem] tracking-widest text-orange-DEFAULT">{pct}%</span>
                    </div>
                    <div className="h-1 bg-black-4 rounded-full">
                      <div className="h-1 bg-orange-DEFAULT rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="font-mono text-[0.52rem] tracking-widest text-grey-dark mt-1.5">
                      {completedModules.length} of {program.modules.length} modules complete
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: BookOpen, val: program.modules.length, label: 'Modules' },
                    { icon: Clock,    val: program.totalTime, label: 'Est. time' },
                    { icon: GraduationCap, val: program.certTitle ? "Yes" : "No", label: 'Cert' },
                  ].map(({ icon: Icon, val, label }) => (
                    <div key={label} className="text-center">
                      <Icon size={14} className="text-orange-DEFAULT mx-auto mb-1" />
                      <span className="font-display text-xl text-white block leading-none">{val}</span>
                      <span className="font-mono text-[0.5rem] tracking-widest text-grey-dark uppercase">{label}</span>
                    </div>
                  ))}
                </div>

                {user && canAccess ? (
                  <Link
                    href={`/educators/${program.slug}/${nextModule?.id}`}
                    className="btn-orange w-full text-center flex items-center justify-center gap-2"
                  >
                    <Play size={13} />
                    {pct === 0 ? 'Start Program' : pct === 100 ? 'Review Modules' : 'Continue Program'}
                  </Link>
                ) : user ? null : (
                  <Link href={`/auth/login?redirect=/educators/${program.slug}`} className="btn-outline w-full text-center block mb-3">
                    Log In to Access
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── LESSON LIST ── */}
        <section className="py-16 px-6 md:px-14 bg-black">
          <div className="max-w-4xl mx-auto">
            <div className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-grey-dark mb-6">Program Modules</div>

            <div className="flex flex-col gap-[2px] bg-orange-DEFAULT border-2 border-orange-DEFAULT">
              {program.modules.map((moduleItem, idx) => {
                const done    = completedModules.includes(moduleItem.id)
                const locked  = !canAccess;
                const isCurrent = nextModule?.id === moduleItem.id && pct > 0 && pct < 100

                return (
                  <div key={moduleItem.id} className={cn('bg-black-2 transition-colors', locked ? 'opacity-60' : 'hover:bg-black-3', isCurrent && 'border-l-4 border-orange-DEFAULT bg-orange-DEFAULT/5')}>
                    {locked ? (
                      <div className="flex items-start gap-5 px-7 py-5 cursor-not-allowed">
                        <span className="font-display text-2xl text-white/20 leading-none min-w-[36px] mt-0.5">
                          {moduleItem.num}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-lg text-grey-dark">{moduleItem.title}</p>
                          <p className="font-body text-sm italic text-grey-dark mt-1 line-clamp-1">
                            {moduleItem.subtitle}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-mono text-[0.55rem] tracking-widest text-grey-dark">
                            {moduleItem.duration}
                          </span>
                          <Lock size={13} className="text-grey-dark" />
                        </div>
                      </div>
                    ) : (
                      <Link href={`/educators/${program.slug}/${moduleItem.id}`} className="flex items-start gap-5 px-7 py-5 group">
                        <span className="font-display text-2xl text-white/40 leading-none min-w-[36px] mt-0.5 group-hover:text-orange-DEFAULT transition-colors">
                          {moduleItem.num}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={cn('font-body text-lg transition-colors', done ? 'text-white' : 'text-white/80 group-hover:text-white')}>
                            {moduleItem.title}
                          </p>
                          <p className="font-body text-sm italic text-grey-DEFAULT mt-1 line-clamp-2">
                            {moduleItem.subtitle}
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[0.55rem] tracking-widest text-grey-dark">{moduleItem.duration}</span>
                            {done ? <CheckCircle size={15} className="text-orange-DEFAULT" /> : <Play size={13} className="text-grey-dark/50 group-hover:text-orange-DEFAULT transition-colors" />}
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
