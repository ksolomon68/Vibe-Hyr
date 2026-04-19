'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PROGRAMS } from '@/lib/education/curriculum'
import { createClient } from '@/lib/supabase/client'
import { getCourseRoute } from '@/lib/constants/verticalRoutes'
import { Lock, Play, Clock, BookOpen } from 'lucide-react'
import type { MembershipTier } from '@/types'

// Tier gate for each program (by index: 0=free, 1=architect, 2=architect, 3=elite)
const PROGRAM_TIERS: MembershipTier[] = ['free', 'architect', 'architect', 'elite']
const TIER_ORDER: Record<string, number> = { free: 0, architect: 1, elite: 2 }
const TIER_BADGE: Record<string, string> = { free: 'badge-free', architect: 'badge-architect', elite: 'badge-elite' }
const TIER_LABEL: Record<string, string> = { free: 'Free', architect: 'Pro', elite: 'Elite' }

export default function EducationCoursesPage() {
  const [userTier, setUserTier] = useState<MembershipTier>('free')
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('membership_tier, membership_type')
        .eq('id', user.id)
        .single()
        .then(({ data: profile }) => {
          if (!profile) return
          if (profile.membership_tier) setUserTier(profile.membership_tier as MembershipTier)
          const correctRoute = getCourseRoute(profile.membership_type, null)
          if (correctRoute !== '/education') {
            router.replace(correctRoute)
          }
        })
    })
  }, [router])

  return (
    <>
      <Navbar />
      <main className="pt-[68px]">

        {/* Page header */}
        <section className="py-20 px-6 md:px-14 border-b-2 border-orange/20 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange" />
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-[1px] bg-orange" />
              <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange font-semibold">For schools &amp; institutions</span>
            </div>
            <h1 className="font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.92] tracking-[0.02em] mb-4">
              THE VIBE HYR<br />
              <span className="text-orange">EDUCATORS SERIES</span>
            </h1>
            <p className="font-body italic text-grey-DEFAULT max-w-2xl text-lg leading-relaxed">
              Professional development programs for school staff, administrators, and districts.
            </p>
          </div>
        </section>

        {/* Tier key */}
        <section className="py-8 px-6 md:px-14 bg-black-2 border-b border-white/8">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-6 items-center">
            <span className="font-mono text-[0.58rem] tracking-[0.25em] uppercase text-grey-dark">Access Key:</span>
            <div className="flex flex-wrap gap-4">
              <span className="badge-free">Free — Seeker</span>
              <span className="badge-architect">Pro — Architect</span>
              <span className="badge-elite">Elite — Reality Master</span>
            </div>
          </div>
        </section>

        {/* Programs grid */}
        <section className="py-16 px-6 md:px-14">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-orange border-2 border-orange">
              {PROGRAMS.map((program, idx) => {
                const requiredTier = PROGRAM_TIERS[idx] ?? 'elite'
                const hasAccess = TIER_ORDER[userTier] >= TIER_ORDER[requiredTier]

                return (
                  <div
                    key={program.id}
                    className="relative bg-black-2 border border-white/8 overflow-hidden group transition-all duration-200 hover:border-orange-DEFAULT/30 hover:bg-black-3"
                  >
                    {/* Ghost number */}
                    <div className="absolute top-3 right-4 font-display text-[3rem] md:text-[7rem] leading-none text-orange-DEFAULT opacity-[0.03] md:opacity-[0.06] pointer-events-none select-none overflow-hidden">
                      {program.num}
                    </div>

                    <div className="p-8 relative z-10">
                      {/* Badges row */}
                      <div className="flex items-center justify-between mb-5">
                        <span className={TIER_BADGE[requiredTier]}>
                          {TIER_LABEL[requiredTier]}
                        </span>
                        {!hasAccess && <Lock size={14} className="text-grey-dark" />}
                      </div>

                      {/* Title */}
                      <h3 className="font-display text-3xl tracking-[0.03em] text-white mb-2 leading-tight">
                        {program.title}
                      </h3>
                      <p className="font-body text-base italic text-grey-DEFAULT mb-4 leading-relaxed">
                        {program.subtitle}
                      </p>
                      <p className="font-body text-base text-grey-DEFAULT/70 mb-6 leading-relaxed line-clamp-3">
                        {program.description}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center gap-5 mb-6 pb-5 border-b border-white/8">
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={12} className="text-orange-DEFAULT" />
                          <span className="font-mono text-[0.6rem] tracking-widest text-grey-DEFAULT">
                            {program.modules.length} modules
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-orange-DEFAULT" />
                          <span className="font-mono text-[0.6rem] tracking-widest text-grey-DEFAULT">
                            {program.totalTime}
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      {hasAccess ? (
                        <a
                          href={`/educators/${program.slug}`}
                          className="btn-orange w-full text-center flex items-center justify-center gap-2 text-[0.62rem]"
                        >
                          <Play size={12} />
                          Start Program
                        </a>
                      ) : (
                        <button
                          onClick={() => router.push('/pricing')}
                          className="btn-outline-orange w-full text-center flex items-center justify-center gap-2 text-[0.62rem]"
                        >
                          <Lock size={12} />
                          Upgrade to Unlock
                        </button>
                      )}
                    </div>

                    {/* Bottom bar on hover */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-DEFAULT scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
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
