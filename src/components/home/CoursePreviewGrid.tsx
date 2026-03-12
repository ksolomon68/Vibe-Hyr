'use client'

import { useState } from 'react'
import { CourseCard } from '@/components/personal/CourseCard'
import { COURSES } from '@/lib/data/courses'
import { PersonalCheckoutModal } from '@/components/pricing/PersonalCheckoutModal'
import type { PersonalTier } from '@/components/pricing/PersonalCheckoutModal'

export function CoursePreviewGrid() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTier, setModalTier] = useState<PersonalTier>('architect')

  const handleUpgrade = (tier: string) => {
    const personalTier: PersonalTier = tier === 'elite' ? 'reality-master' : 'architect'
    setModalTier(personalTier)
    setModalOpen(true)
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-orange-DEFAULT border-2 border-orange-DEFAULT">
        {COURSES.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            userTier="free"
            onUpgrade={handleUpgrade}
          />
        ))}
      </div>

      <PersonalCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTier={modalTier}
      />
    </div>
  )
}
