'use client'

import React from 'react'
import Link from 'next/link'
import EducationReflection from './EducationReflection'
import { PlayerProgressBars } from '@/components/shared/PlayerProgressBars'
import { PlayerVideoPlaceholder } from '@/components/shared/PlayerVideoPlaceholder'
import { PlayerNav } from '@/components/shared/PlayerNav'
import { AssumptionLab } from '@/components/shared/AssumptionLab'
import { useLessonNotes } from '@/hooks/useLessonNotes'
import { Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROGRAMS, EducationModule, EducationProgram } from '@/lib/education/curriculum'

interface EducationModulePlayerProps {
  program:          EducationProgram
  module:           EducationModule
  activeProgramIdx: number
  activeModuleIdx:  number
  completedMap:     Record<string, boolean>
  onMarkComplete:   (moduleId: string) => void
  onNavigate:       (programIdx: number, moduleIdx: number) => void
  isLoggedIn:       boolean
}

export default function EducationModulePlayer({
  program,
  module,
  activeProgramIdx,
  activeModuleIdx,
  completedMap,
  onMarkComplete,
  onNavigate,
  isLoggedIn,
}: EducationModulePlayerProps) {
  const [activeTab, setActiveTab] = React.useState<'lesson' | 'notes'>('lesson')
  const { content: notes, handleChange: handleNotesChange, saving: notesSaving, saved: notesSaved } = useLessonNotes(module.id)

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

        {/* Video at the absolute top */}
        <div className="mb-10">
          <PlayerVideoPlaceholder duration={module.duration} />
        </div>

        {/* Module meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--p-gray)', textTransform: 'uppercase' }}>
            Program {program.num} · Module {module.num} of {totalMods}
          </span>
          <span style={{ fontSize: 12, color: 'var(--p-muted)', fontStyle: 'italic' }}>· {module.duration}</span>
          {isDone && (
            <span style={{ fontSize: 11, color: 'var(--p-orange)', fontWeight: 700, letterSpacing: '0.12em' }}>✓ COMPLETE</span>
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", serif)', fontSize: 'clamp(44px, 6vw, 84px)', color: 'var(--p-cream)', lineHeight: 1.0, letterSpacing: '0.02em', marginBottom: 12 }}>
          {module.title}
        </h1>
        <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(18px, 2vw, 24px)', color: 'var(--p-gray)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 48, maxWidth: '90%' }}>
          {module.subtitle}
        </p>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-white/10 mb-8">
          <button
            onClick={() => setActiveTab('lesson')}
            className={cn(
              'pb-4 text-[0.65rem] tracking-[0.2em] uppercase font-mono transition-all relative',
              activeTab === 'lesson' ? 'text-[var(--p-orange)]' : 'text-white/30 hover:text-white/60'
            )}
          >
            01. Lesson
            {activeTab === 'lesson' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--p-orange)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={cn(
              'pb-4 text-[0.65rem] tracking-[0.2em] uppercase font-mono transition-all relative',
              activeTab === 'notes' ? 'text-[var(--p-orange)]' : 'text-white/30 hover:text-white/60'
            )}
          >
            02. My Notes
            {activeTab === 'notes' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--p-orange)]" />
            )}
          </button>
        </div>

        {activeTab === 'lesson' ? (
          <>
            {/* Module content */}
            <div
              className="content-area mb-12"
              style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: module.content }}
            />

            {/* Assumption Lab - Integrated into Educators */}
            {module.hasReflection && (
              <div className="my-16">
                {module.id === 'ed01-m03' ? (
                  <AssumptionLab 
                    title="Co-Regulation Move"
                    subtitle="From Defiance to Biological Safety"
                    scenario="A student is shouting in the hallway. Your immediate assumption (and physiological response) is 'Defiance' or 'Disrespect'."
                    prompt="If you shifted your assumption to 'Safety/Biological Emergency', how would your first 10 seconds of interaction (voice, proximity, eye contact) change?"
                    accentColor="var(--p-orange)"
                    onComplete={() => !module.quiz && onMarkComplete(module.id)}
                  />
                ) : module.id === 'ed01-m01' ? (
                  <AssumptionLab 
                    title="The Regulated Leader"
                    subtitle="The Morning Pivot"
                    scenario="A chaotic morning commute or personal issue has you in a state of 'Survival' before the first bell ever rings."
                    prompt="How would leading from a deliberate 'Sovereign' assumption change your very first interaction with a difficult colleague today?"
                    accentColor="var(--p-orange)"
                    onComplete={() => !module.quiz && onMarkComplete(module.id)}
                  />
                ) : (
                  <AssumptionLab 
                    title="Identity Workshop"
                    subtitle="Reflecting on Your Educational Standard"
                    prompt={`In the context of "${module.title}", what is one assumption you've held about your students or your environment that no longer serves the standard you're building?`}
                    onComplete={() => !module.quiz && onMarkComplete(module.id)}
                  />
                )}
              </div>
            )}

            {/* Reflection quiz */}
            {module.hasReflection && module.quiz && (
              <EducationReflection
                quiz={module.quiz}
                moduleId={module.id}
                onComplete={() => onMarkComplete(module.id)}
              />
            )}
          </>
        ) : (
          <div className="min-h-[400px] flex flex-col mb-12">
            <div className="flex items-center justify-between mb-4">
              <p className="font-body text-sm text-white/40 italic">
                Your insights and action steps for this module…
              </p>
              <div className="flex items-center gap-2">
                 {notesSaving && <Loader2 size={12} className="text-[var(--p-orange)] animate-spin" />}
                 {notesSaved && <span className="font-mono text-[0.6rem] tracking-widest text-[var(--p-orange)]">All changes saved</span>}
              </div>
            </div>
              <textarea
              className="flex-1 w-full bg-white/5 border border-white/5 rounded-xl p-6 text-white font-body text-lg leading-relaxed
                         focus:bg-white/[0.08] focus:border-[var(--p-orange)]/30 outline-none transition-all resize-none min-h-[400px]"
              placeholder="Capture your thoughts here…"
              value={notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
            />
          </div>
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
        .module-body h2 { font-family: 'Bebas Neue', sans-serif; font-size: 34px; color: #E8621A; letter-spacing: 0.05em; margin: 52px 0 20px; }
        .module-body h3 { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #FFFFFF; letter-spacing: 0.05em; margin: 36px 0 14px; }
        .module-body p  { margin-bottom: 24px; line-height: 1.8; color: rgba(255, 255, 255, 0.8); font-size: 18px; }
        .module-body strong { color: #FFFFFF; font-weight: 600; }
        .module-body em { font-family: 'Cormorant Garamond', serif; font-size: 1.1em; color: #E8621A; }
        .module-body .bullet-list, .module-body ul { list-style: none; padding: 0; margin-bottom: 28px; }
        .module-body .bullet-list li, .module-body ul:not([class]) li { position: relative; padding-left: 22px; margin-bottom: 14px; font-size: 18px; color: rgba(255, 255, 255, 0.8); }
        .module-body .bullet-list li::before, .module-body ul:not([class]) li::before { content: "◆"; position: absolute; left: 0; color: #E8621A; font-size: 8px; top: 8px; }
        .module-body .callout { background: rgba(232, 98, 26, 0.06); border-left: 4px solid #E8621A; padding: 22px 28px; margin: 32px 0; font-family: 'Cormorant Garamond', serif; font-size: 22px; font-style: italic; color: rgba(255, 255, 255, 0.9); line-height: 1.6; }
        .module-body .callout cite { color: #E8621A; font-family: 'DM Sans', sans-serif; font-style: normal; font-size: 12px; font-weight: 600; display: block; margin-top: 14px; text-transform: uppercase; letter-spacing: 0.1em; }
        .module-body .key-concept { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-top: 2px solid #E8621A; border-radius: 0 0 12px 12px; padding: 24px 28px; margin: 32px 0; }
        .module-body .key-concept-label { color: #E8621A; font-size: 10px; letter-spacing: 0.2em; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; }
        .module-body .practice-box { background: rgba(232, 98, 26, 0.04); border: 1px solid rgba(232, 98, 26, 0.2); border-radius: 12px; padding: 24px 28px; margin: 32px 0; }
        .module-body .practice-label { color: #E8621A; font-size: 10px; letter-spacing: 0.2em; font-weight: 700; margin-bottom: 14px; text-transform: uppercase; }
        .module-body .stat-row { display: flex; gap: 20px; flex-wrap: wrap; margin: 32px 0; }
        .module-body .stat-card { flex: 1; min-width: 140px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: center; }
        .module-body .stat-num { font-size: 42px; font-weight: 700; color: #E8621A; display: block; font-family: 'Bebas Neue', sans-serif; line-height: 1; margin-bottom: 8px;}
        .module-body .stat-label { font-size: 11px; color: rgba(255, 255, 255, 0.5); letter-spacing: 0.1em; text-transform: uppercase; }
      `}</style>
    </main>
  )
}
