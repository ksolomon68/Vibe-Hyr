'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CourseCard } from '@/components/personal/CourseCard'
import { COURSES } from '@/lib/data/courses'
import { createClient } from '@/lib/supabase/client'
import type { MembershipTier } from '@/types'
import { PersonalCheckoutModal } from '@/components/pricing/PersonalCheckoutModal'
import type { PersonalTier } from '@/components/pricing/PersonalCheckoutModal'

export default function CoursesPage() {
  const [userTier,  setUserTier]  = useState<MembershipTier>('free')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTier, setModalTier] = useState<PersonalTier>('architect')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('membership_tier')
          .eq('id', user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.membership_tier) {
              setUserTier(profile.membership_tier as MembershipTier)
            }
          })
      }
    })
  }, [])

  const handleUpgrade = (tier: string) => {
    // Normalize course tier values to PersonalTier
    const personalTier: PersonalTier = tier === 'elite' ? 'reality-master' : 'architect'
    setModalTier(personalTier)
    setModalOpen(true)
  }

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
              <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange font-semibold">For individuals</span>
            </div>
            <h1 className="font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.92] tracking-[0.02em] mb-4">
              THE ARCHITECTURE<br />
              <span className="text-orange">OF REALITY</span>
            </h1>
            <p className="font-body italic text-grey-DEFAULT max-w-2xl text-lg leading-relaxed">
              Four courses. Each one builds on the last. Complete Course 1 free — then decide how deep you want to go.
            </p>
          </div>
        </section>

        {/* Tier key */}
        <section className="py-8 px-6 md:px-14 bg-black-2 border-b border-white/8">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-6 items-center">
            <span className="font-mono text-[0.58rem] tracking-[0.25em] uppercase text-grey-dark">Access Key:</span>
            <div className="flex flex-wrap gap-4">
              <span className="badge-free">Free — Seeker</span>
              <span className="badge-architect">Pro — Architect ($27/mo)</span>
              <span className="badge-elite">Elite — Reality Master ($67/mo)</span>
            </div>
          </div>
        </section>

        {/* Courses */}
        <section className="py-16 px-6 md:px-14">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-orange border-2 border-orange">
              {COURSES.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  userTier={userTier}
                  onUpgrade={handleUpgrade}
                />
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />

      <PersonalCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTier={modalTier}
      />
    </>
  )
}
