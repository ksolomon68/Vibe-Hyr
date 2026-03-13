'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlayerTopbar } from '@/components/shared/PlayerTopbar'
import { PlayerSidebar } from '@/components/shared/PlayerSidebar'

import EducationModulePlayer from '@/components/educators/EducationModulePlayer'
import { PROGRAMS, EducationProgram, EducationModule } from '@/lib/education/curriculum'
import { createBrowserClient } from '@supabase/ssr'
import type { SidebarEntry } from '@/components/shared/PlayerSidebar'

interface EducationPageClientProps {
  initialProgramIdx: number
  initialModuleIdx:  number
  program:           EducationProgram
  module:            EducationModule
  userId:            string
  initialCompleted:  string[]
}

export default function EducationPageClient({
  initialProgramIdx,
  initialModuleIdx,
  program,
  module,
  userId,
  initialCompleted,
}: EducationPageClientProps) {
  const router      = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    initialCompleted.forEach(id => { map[id] = true })
    return map
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleNavigate = (pIdx: number, mIdx: number) => {
    const p = PROGRAMS[pIdx]
    const m = p.modules[mIdx]
    router.push(`/educators/${p.slug}/${m.id}`)
  }

  const handleMarkComplete = async (moduleId: string) => {
    const newMap = { ...completedMap, [moduleId]: true }
    setCompletedMap(newMap)

    const { error } = await supabase.from('education_progress').upsert({
      user_id:    userId,
      program_id: program.id,
      module_id:  moduleId,
    }, { onConflict: 'user_id, program_id, module_id' })

    if (!error) {
      const isNowComplete = program.modules.every(m => newMap[m.id])
      if (isNowComplete) {
        const { data } = await supabase
          .from('education_certifications')
          .select('id')
          .eq('user_id', userId)
          .eq('program_id', program.id)
          .single()
        if (!data) {
          await supabase.from('education_certifications').insert({
            user_id:    userId,
            program_id: program.id,
            cert_title: program.certTitle,
          })
        }
        // Announce to screen reader
        const announcer = document.getElementById('player-announcer') || document.getElementById('a11y-announcer')
        if (announcer) announcer.textContent = `${program.title} complete! Certification earned.`
      }
    }
  }

  /* ── Build sidebar data ── */
  const totalAll     = PROGRAMS.reduce((a, p) => a + p.modules.length, 0)
  const completedAll = PROGRAMS.reduce((a, p) => a + p.modules.filter(m => completedMap[m.id]).length, 0)
  const overallPct   = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0

  const sidebarEntries: SidebarEntry[] = PROGRAMS.map((p, pi) => ({
    id:          p.id,
    slug:        p.slug,
    num:         String(pi + 1).padStart(2, '0'),
    title:       p.title,
    audienceTag: p.audience,
    totalTime:   p.totalTime,
    items:       p.modules.map((m, mi) => ({
      id:            m.id,
      num:           String(mi + 1).padStart(2, '0'),
      title:         m.title,
      duration:      m.duration,
      hasReflection: m.hasReflection,
    })),
  }))

  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Shared topbar */}
      <PlayerTopbar
        vertical="educators"
        verticalLabel="EDUCATORS"
        contentTitle={program.title}
        completionPct={overallPct}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        breadcrumb={{
          label: 'Educators',
          href: '/educators'
        }}
      />

      {/* Body: sidebar + content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'row-reverse' }}>
        <PlayerSidebar
          entries={sidebarEntries}
          activeEntryIdx={initialProgramIdx}
          activeItemIdx={initialModuleIdx}
          completedItemIds={Object.keys(completedMap).filter(k => completedMap[k])}
          onSelectEntry={(pIdx) => handleNavigate(pIdx, 0)}
          onSelectItem={(pIdx, mIdx) => handleNavigate(pIdx, mIdx)}
          isOpen={sidebarOpen}
        />

        <EducationModulePlayer
          program={program}
          module={module}
          activeProgramIdx={initialProgramIdx}
          activeModuleIdx={initialModuleIdx}
          completedMap={completedMap}
          onMarkComplete={handleMarkComplete}
          onNavigate={handleNavigate}
          isLoggedIn={!!userId}
        />
      </div>

      {/* Accessibility widget */}

    </div>
  )
}
