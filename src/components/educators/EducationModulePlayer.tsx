'use client'

import React from 'react'
import Link from 'next/link'
import EducationReflection from './EducationReflection'
import { PlayerProgressBars } from '@/components/shared/PlayerProgressBars'
import { PlayerVideoPlaceholder } from '@/components/shared/PlayerVideoPlaceholder'
import { PlayerNav } from '@/components/shared/PlayerNav'
import { PROGRAMS, EducationModule, EducationProgram } from '@/lib/education/curriculum'

interface EducationModulePlayerProps {
  program:          EducationProgram
  module:           EducationModule
  activeProgramIdx: number
  activeModuleIdx:  number
  completedMap:     Record<string, boolean>
  onMarkComplete:   (moduleId: string) => void
  onNavigate:       (programIdx: number, moduleIdx: number) => void
}

export default function EducationModulePlayer({
  program,
  module,
  activeProgramIdx,
  activeModuleIdx,
  completedMap,
  onMarkComplete,
  onNavigate,
}: EducationModulePlayerProps) {
  const isDone     = completedMap[module.id]
  const totalMods  = program.modules.length
  const completedCount = program.modules.filter(m => completedMap[m.id]).length

  // Overall: across all programs
  const totalAll    = PROGRAMS.reduce((a, p) => a + p.modules.length, 0)
  const completedAll = PROGRAMS.reduce((a, p) => a + p.modules.filter(m => completedMap[m.id]).length, 0)
  const overallPct  = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0

  const hasPrev = activeModuleIdx > 0 || activeProgramIdx > 0
  const hasNext = activeModuleIdx < totalMods - 1 || activeProgramIdx < PROGRAMS.length - 1

  const navigatePrev = () => {
    if (activeModuleIdx > 0) onNavigate(activeProgramIdx, activeModuleIdx - 1)
    else if (activeProgramIdx > 0) onNavigate(activeProgramIdx - 1, PROGRAMS[activeProgramIdx - 1].modules.length - 1)
  }
  const navigateNext = () => {
    if (activeModuleIdx < totalMods - 1) onNavigate(activeProgramIdx, activeModuleIdx + 1)
    else if (activeProgramIdx < PROGRAMS.length - 1) onNavigate(activeProgramIdx + 1, 0)
  }

  const isProgramComplete = program.modules.every(m => completedMap[m.id])

  return (
    <main
      id="main-content"
      className="module-body"
      style={{
        flex:       1,
        background: 'var(--p-bg)',
        minHeight:  'calc(100vh - 52px)',
        overflowY:  'auto',
        color:      'var(--p-cream)',
      }}
    >
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 28px 80px' }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--p-gray)', textTransform: 'uppercase', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/educators" style={{ color: 'var(--p-gray)', textDecoration: 'none' }} className="hover:text-[var(--p-orange)]">Educators</Link>
          <span style={{ color: 'var(--p-muted)' }}>›</span>
          <button onClick={() => onNavigate(activeProgramIdx, 0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--p-gray)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}
            className="hover:text-[var(--p-orange)]"
          >
            {program.title}
          </button>
          <span style={{ color: 'var(--p-muted)' }}>›</span>
          <span style={{ color: 'var(--p-cream-dim)' }}>Module {module.num}</span>
        </nav>

        {/* Progress bars */}
        <PlayerProgressBars
          itemLabel="Program"
          currentCompleted={completedCount}
          currentTotal={totalMods}
          overallPct={overallPct}
        />

        {/* Module meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--p-gray)', textTransform: 'uppercase' }}>
            Program {program.num} · Module {module.num} of {totalMods}
          </span>
          <span style={{ fontSize: 12, color: 'var(--p-muted)', fontStyle: 'italic' }}>· {module.duration}</span>
          {module.hasReflection && (
            <span style={{ fontSize: 9, padding: '2px 8px', background: 'var(--p-orange-dim)', color: 'var(--p-orange)', border: '1px solid var(--p-orange-mid)', borderRadius: 4, fontWeight: 700, letterSpacing: '0.1em' }}>
              REFLECTION
            </span>
          )}
          {isDone && (
            <span style={{ fontSize: 11, color: 'var(--p-orange)', fontWeight: 700, letterSpacing: '0.12em' }}>✓ COMPLETE</span>
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", serif)', fontSize: 'clamp(40px, 6vw, 72px)', color: 'var(--p-cream)', lineHeight: 1.05, letterSpacing: '0.03em', marginBottom: 12 }}>
          {module.title}
        </h1>
        <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(18px, 2vw, 22px)', color: 'var(--p-gray)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 40, maxWidth: '90%' }}>
          {module.subtitle}
        </p>

        {/* Video placeholder */}
        <PlayerVideoPlaceholder duration={module.duration} />

        {/* Module content */}
        <div
          className="module-body"
          style={{ fontSize: 16, color: 'var(--p-cream-dim)', lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: module.content }}
        />

        {/* Reflection quiz */}
        {module.hasReflection && module.quiz && (
          <EducationReflection
            quiz={module.quiz}
            moduleId={module.id}
            onComplete={() => onMarkComplete(module.id)}
          />
        )}

        {/* Nav buttons */}
        <PlayerNav
          hasPrev={hasPrev}
          hasNext={hasNext}
          isComplete={isDone}
          mode="module"
          onPrev={navigatePrev}
          onNext={navigateNext}
          onComplete={!module.hasReflection ? () => onMarkComplete(module.id) : undefined}
        />

        {/* Program completion banner */}
        {isProgramComplete && (
          <div style={{
            marginTop:   48,
            padding:     48,
            background:  'linear-gradient(135deg, var(--p-card2) 0%, var(--p-bg) 100%)',
            border:      '1px solid var(--p-border2)',
            borderRadius:16,
            textAlign:   'center',
            position:    'relative',
            overflow:    'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--p-orange), transparent)' }} />
            <div style={{ display: 'inline-block', padding: '4px 16px', background: 'var(--p-orange-dim)', border: '1px solid var(--p-orange-mid)', borderRadius: 20, fontSize: 13, fontWeight: 700, color: 'var(--p-orange)', letterSpacing: '0.06em', marginBottom: 16 }}>
              🎓 {program.certTitle}
            </div>
            <h3 style={{ fontFamily: 'var(--font-bebas, serif)', fontSize: 48, color: 'var(--p-cream)', letterSpacing: '0.05em', marginBottom: 12, lineHeight: 1 }}>
              PROGRAM COMPLETE
            </h3>
            <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 20, color: 'var(--p-gray)', fontStyle: 'italic', marginBottom: 28, lineHeight: 1.5, maxWidth: 500, margin: '0 auto 28px' }}>
              You've completed all {totalMods} modules of <em style={{ color: 'var(--p-cream)' }}>{program.title}</em>.{' '}
              {activeProgramIdx < PROGRAMS.length - 1 ? 'Continue to the next program to deepen your practice.' : 'You have completed the full Vibe Hyr Educators curriculum.'}
            </p>
            {activeProgramIdx < PROGRAMS.length - 1 && (
              <button
                onClick={() => onNavigate(activeProgramIdx + 1, 0)}
                style={{ padding: '12px 28px', background: 'var(--p-orange)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer' }}
              >
                Next Program →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Scoped styles for injected HTML content */}
      <style>{`
        .module-body h2 { font-family: var(--font-bebas, "Bebas Neue", serif); font-size: 30px; color: var(--p-cream); letter-spacing: 0.05em; margin: 52px 0 20px; }
        .module-body h3 { font-family: var(--font-bebas, "Bebas Neue", serif); font-size: 22px; color: var(--p-gray); letter-spacing: 0.05em; margin: 36px 0 14px; }
        .module-body p  { margin-bottom: 20px; line-height: 1.8; }
        .module-body strong { color: var(--p-cream); font-weight: 600; }
        .module-body em { font-family: var(--font-cormorant, serif); font-size: 1.1em; color: var(--p-orange); }
        .module-body .bullet-list, .module-body ul { list-style: none; padding: 0; margin-bottom: 28px; }
        .module-body .bullet-list li, .module-body ul:not([class]) li { position: relative; padding-left: 22px; margin-bottom: 14px; }
        .module-body .bullet-list li::before, .module-body ul:not([class]) li::before { content: "◆"; position: absolute; left: 0; color: var(--p-orange); font-size: 8px; top: 6px; }
        .module-body .callout { background: var(--p-card); border-left: 3px solid var(--p-orange); border-radius: 0 10px 10px 0; padding: 18px 22px; margin: 28px 0; font-family: var(--font-cormorant, serif); font-size: 20px; font-style: italic; color: var(--p-cream); line-height: 1.6; }
        .module-body .callout cite { color: var(--p-orange); font-family: var(--font-dm, sans-serif); font-style: normal; font-size: 12px; font-weight: 600; display: block; margin-top: 10px; }
        .module-body .key-concept { background: var(--p-card2); border: 1px solid var(--p-border2); border-top: 2px solid var(--p-gold); border-radius: 0 0 12px 12px; padding: 20px 24px; margin: 28px 0; }
        .module-body .key-concept-label { color: var(--p-gold); font-size: 9px; letter-spacing: 0.16em; font-weight: 700; margin-bottom: 10px; text-transform: uppercase; }
        .module-body .practice-box { background: rgba(232,98,26,0.05); border: 1px solid rgba(232,98,26,0.27); border-radius: 12px; padding: 22px 26px; margin: 28px 0; }
        .module-body .practice-label { color: var(--p-orange); font-size: 9px; letter-spacing: 0.16em; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; }
        .module-body .stat-row { display: flex; gap: 20px; flex-wrap: wrap; margin: 24px 0; }
        .module-body .stat-box { flex: 1; min-width: 110px; background: var(--p-card); border: 1px solid var(--p-border); border-radius: 10px; padding: 14px; text-align: center; }
        .module-body .stat-num { font-size: 30px; font-weight: 700; color: var(--p-orange); display: block; }
        .module-body .stat-label { font-size: 10px; color: var(--p-gray); letter-spacing: 0.1em; }
      `}</style>
    </main>
  )
}
