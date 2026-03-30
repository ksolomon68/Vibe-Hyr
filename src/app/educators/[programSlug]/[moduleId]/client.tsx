'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, PanelRight, CheckCircle, Circle,
  Menu, X, FileText, Loader2,
} from 'lucide-react'
import { VideoPlayer } from '@/components/personal/VideoPlayer'
import { AssumptionLab } from '@/components/shared/AssumptionLab'
import EducationReflection from '@/components/educators/EducationReflection'
import { useLessonNotes } from '@/hooks/useLessonNotes'
import { createClient } from '@/lib/supabase/client'
import { PROGRAMS } from '@/lib/education/curriculum'
import { cn } from '@/lib/utils'
import type { EducationProgram, EducationModule } from '@/lib/education/curriculum'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialProgramIdx: number
  initialModuleIdx:  number
  program:           EducationProgram
  module:            EducationModule
  userId:            string
  initialCompleted:  string[]
}

type Tab = 'lesson' | 'reflection' | 'notes'

// ─── Main component ───────────────────────────────────────────────────────────

export default function EducationPageClient({
  initialProgramIdx,
  program,
  module,
  userId,
  initialCompleted,
}: Props) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab]     = useState<Tab>('lesson')
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompleted)

  const { content: lessonNotes, handleChange: handleNotesChange, saving: notesSaving, saved: notesSaved } =
    useLessonNotes(module.id)

  const moduleIdx  = program.modules.findIndex(m => m.id === module.id)
  const prevModule = moduleIdx > 0 ? program.modules[moduleIdx - 1] : null
  const nextModule = moduleIdx < program.modules.length - 1 ? program.modules[moduleIdx + 1] : null

  const isModuleDone = completedIds.includes(module.id)
  const hasQuiz      = module.hasReflection && module.quiz.length > 0
  const percentDone  = program.modules.length
    ? Math.round((completedIds.length / program.modules.length) * 100)
    : 0

  async function saveProgress(moduleId: string) {
    const supabase = createClient()
    const newCompleted = [...new Set([...completedIds, moduleId])]
    setCompletedIds(newCompleted)

    await supabase.from('education_progress').upsert(
      { user_id: userId, module_id: moduleId, program_id: program.id, completed_at: new Date().toISOString() },
      { onConflict: 'user_id, program_id, module_id' }
    )

    // Check if all modules are now complete → award certification
    const isProgramComplete = program.modules.every(m => newCompleted.includes(m.id))
    if (isProgramComplete) {
      const { data: existing } = await supabase
        .from('education_certifications')
        .select('id')
        .eq('user_id', userId)
        .eq('program_id', program.id)
        .single()
      if (!existing) {
        await supabase.from('education_certifications').insert({
          user_id:    userId,
          program_id: program.id,
          cert_title: program.certTitle,
        })
      }
    }
  }

  async function handleMarkComplete() {
    await saveProgress(module.id)
    if (nextModule) router.push(`/educators/${program.slug}/${nextModule.id}`)
    else router.push(`/educators/${program.slug}`)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* ─── TOP BAR ─────────────────────────────────────────────── */}
      <div className="h-[64px] bg-[#0E0C08] border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 relative z-30">
        {/* Left: breadcrumb */}
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="font-display text-xl tracking-widest text-[#E8621A] hover:opacity-80 transition-opacity hidden sm:block">
            VIBE<span className="text-white">HYR</span>
          </Link>
          <span className="text-white/10 text-xs flex-shrink-0 hidden sm:block">/</span>
          <Link
            href={`/educators/${program.slug}`}
            className="flex items-center gap-2 text-white/40 hover:text-[#E8621A] transition-colors flex-shrink-0"
          >
            <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase hidden md:block">
              {program.title}
            </span>
            <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase md:hidden">
              Programs
            </span>
          </Link>
          <span className="text-white/10 text-xs flex-shrink-0">/</span>
          <span className="font-mono text-[0.65rem] tracking-[0.15em] text-white/90 truncate max-w-[200px] md:max-w-none uppercase">
            {module.num} — {module.title}
          </span>
        </div>

        {/* Center: progress bar (desktop only) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-4">
          <div className="w-40 h-[2px] bg-white/5 relative rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-[#E8621A] transition-all duration-700 ease-out"
              style={{ width: `${percentDone}%` }}
            />
          </div>
          <span className="font-mono text-[0.6rem] tracking-[0.2em] text-[#E8621A] font-bold">
            {percentDone}%
          </span>
        </div>

        {/* Right: nav arrows + sidebar toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {prevModule && (
            <Link
              href={`/educators/${program.slug}/${prevModule.id}`}
              className="text-white/40 hover:text-[#E8621A] transition-colors p-2 hover:bg-white/5 rounded-lg"
              title="Previous module"
            >
              <ChevronLeft size={18} />
            </Link>
          )}
          {nextModule && (
            <Link
              href={`/educators/${program.slug}/${nextModule.id}`}
              className="text-white/40 hover:text-[#E8621A] transition-colors p-2 hover:bg-white/5 rounded-lg"
              title="Next module"
            >
              <ChevronRight size={18} />
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className={cn(
              'ml-1 p-2 transition-colors hidden lg:block rounded-lg hover:bg-white/5',
              sidebarOpen ? 'text-[#E8621A]' : 'text-white/40 hover:text-[#E8621A]'
            )}
            title="Toggle sidebar"
          >
            <PanelRight size={20} />
          </button>
        </div>
      </div>

      {/* ─── BODY ───────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden flex-col lg:flex-row-reverse">

        {/* SIDEBAR (desktop) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="hidden lg:block flex-shrink-0 overflow-hidden border-l border-white/5 bg-[#0E0C08]/80 backdrop-blur-xl"
            >
              <div className="w-[320px] h-full">
                <EduSidebar
                  program={program}
                  currentModule={module}
                  completedIds={completedIds}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0 bg-[#0E0C08] module-body">

          {/* Video player */}
          <VideoPlayer
            videoUrl={null}
            lessonId={module.id}
            title={module.title}
          />

          <div className="flex-1 max-w-3xl w-full mx-auto px-6 md:px-10 py-10 lg:py-16">

            {/* Module header */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-full border-2 border-[#E8621A] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-[#E8621A] uppercase tracking-tighter">
                    {module.num}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-orange-DEFAULT/60">
                      Module {module.num} · {module.duration}
                    </span>
                    {isModuleDone && (
                      <span className="font-mono text-[0.5rem] tracking-widest uppercase px-2 py-0.5 border border-orange-DEFAULT text-orange-DEFAULT flex items-center gap-1">
                        <CheckCircle size={9} /> Complete
                      </span>
                    )}
                  </div>
                  <h1 className="font-display text-[clamp(1.8rem,4vw,3.5rem)] leading-[0.95] tracking-[0.02em] text-white">
                    {module.title}
                  </h1>
                </div>
              </div>
              <p className="font-body text-base italic text-grey-DEFAULT leading-relaxed max-w-2xl">
                {module.subtitle}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-white/5 mb-8">
              <EduTab id="lesson" active={activeTab} setActive={setActiveTab} label="01. Lesson" />
              {hasQuiz && (
                <EduTab id="reflection" active={activeTab} setActive={setActiveTab} label="02. Reflection" />
              )}
              <EduTab
                id="notes"
                active={activeTab}
                setActive={setActiveTab}
                label={hasQuiz ? '03. My Notes' : '02. My Notes'}
              />
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === 'lesson' && (
                <motion.div
                  key="lesson"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="content-area mb-12"
                    style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: module.content }}
                  />

                  {/* Assumption Labs — module-specific */}
                  {module.hasReflection && (
                    <div className="my-16">
                      {module.id === 'ed01-m03' ? (
                        <AssumptionLab
                          title="Co-Regulation Move"
                          subtitle="From Defiance to Biological Safety"
                          scenario="A student is shouting in the hallway. Your immediate assumption (and physiological response) is 'Defiance' or 'Disrespect'."
                          prompt="If you shifted your assumption to 'Safety/Biological Emergency', how would your first 10 seconds of interaction (voice, proximity, eye contact) change?"
                          accentColor="#E8621A"
                        />
                      ) : module.id === 'ed01-m01' ? (
                        <AssumptionLab
                          title="The Regulated Leader"
                          subtitle="The Morning Pivot"
                          scenario="A chaotic morning commute or personal issue has you in a state of 'Survival' before the first bell ever rings."
                          prompt="How would leading from a deliberate 'Sovereign' assumption change your very first interaction with a difficult colleague today?"
                          accentColor="#E8621A"
                        />
                      ) : (
                        <AssumptionLab
                          title="Identity Workshop"
                          subtitle="Reflecting on Your Educational Standard"
                          prompt={`In the context of "${module.title}", what is one assumption you've held about your students or your environment that no longer serves the standard you're building?`}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'reflection' && hasQuiz && (
                <motion.div
                  key="reflection"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <EducationReflection
                    quiz={module.quiz}
                    moduleId={module.id}
                    onComplete={() => saveProgress(module.id)}
                  />
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-[400px] flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-body text-sm text-white/40 italic">
                      Your insights and reflections for this module…
                    </p>
                    <div className="flex items-center gap-2">
                      {notesSaving && <Loader2 size={12} className="text-[#E8621A] animate-spin" />}
                      {notesSaved && (
                        <span className="font-mono text-[0.6rem] tracking-widest text-[#E8621A]">
                          All changes saved
                        </span>
                      )}
                    </div>
                  </div>
                  <textarea
                    className="flex-1 w-full bg-white/5 border border-white/5 rounded-xl p-6 text-white font-body text-lg leading-relaxed
                               focus:bg-white/[0.08] focus:border-[#E8621A]/30 outline-none transition-all resize-none min-h-[400px]"
                    placeholder="Capture your thoughts here…"
                    value={lessonNotes || ''}
                    onChange={e => handleNotesChange(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer navigation */}
            <div className="mt-12 pt-8 border-t border-white/8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  {prevModule ? (
                    <Link
                      href={`/educators/${program.slug}/${prevModule.id}`}
                      className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.15em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors"
                    >
                      <ChevronLeft size={14} />
                      <span className="hidden sm:inline">Previous:</span> {prevModule.title}
                    </Link>
                  ) : (
                    <Link
                      href={`/educators/${program.slug}`}
                      className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.15em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors"
                    >
                      <ChevronLeft size={14} /> Program Overview
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {isModuleDone ? (
                    nextModule ? (
                      <Link
                        href={`/educators/${program.slug}/${nextModule.id}`}
                        className="btn-orange flex items-center gap-2"
                      >
                        Next Module <ChevronRight size={14} />
                      </Link>
                    ) : (
                      <Link
                        href={`/educators/${program.slug}`}
                        className="btn-orange flex items-center gap-2"
                      >
                        <CheckCircle size={14} /> Program Complete
                      </Link>
                    )
                  ) : (
                    <button
                      onClick={handleMarkComplete}
                      className="btn-orange flex items-center gap-2"
                    >
                      <CheckCircle size={14} />
                      Mark Complete
                      {nextModule && <ChevronRight size={12} />}
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── MOBILE DRAWER ─────────────────────────────────────── */}
      <EduMobileDrawer
        program={program}
        currentModule={module}
        completedIds={completedIds}
      />

    </div>
  )
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function EduTab({
  id, active, setActive, label,
}: {
  id: Tab
  active: Tab
  setActive: (t: Tab) => void
  label: string
}) {
  return (
    <button
      onClick={() => setActive(id)}
      className={cn(
        'pb-4 text-[0.65rem] tracking-[0.2em] uppercase font-mono transition-all relative',
        active === id ? 'text-[#E8621A]' : 'text-white/30 hover:text-white/60'
      )}
    >
      {label}
      {active === id && (
        <motion.div
          layoutId="edu-tab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8621A]"
        />
      )}
    </button>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function EduSidebar({
  program,
  currentModule,
  completedIds,
}: {
  program:       EducationProgram
  currentModule: EducationModule
  completedIds:  string[]
}) {
  const { content, handleChange, saving, saved, loaded } = useLessonNotes(currentModule.id)
  const pct = program.modules.length
    ? Math.round((completedIds.length / program.modules.length) * 100)
    : 0

  return (
    <aside className="flex flex-col h-full bg-black-2 border-l border-white/8 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/8 flex-shrink-0">
        <Link
          href={`/educators/${program.slug}`}
          className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-orange-DEFAULT hover:text-orange-light transition-colors"
        >
          ← {program.title}
        </Link>
        <div className="mt-2 h-px bg-black-4">
          <div
            className="h-px bg-orange-DEFAULT transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="font-mono text-[0.52rem] tracking-widest text-grey-dark mt-1">
          {completedIds.length}/{program.modules.length} modules · {pct}%
        </p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        {/* Module list */}
        <div className="flex-shrink-0">
          <div className="px-5 py-3 border-b border-white/8">
            <span className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-grey-dark">
              Modules
            </span>
          </div>
          <ul className="py-1">
            {program.modules.map((mod, idx) => {
              const done    = completedIds.includes(mod.id)
              const current = mod.id === currentModule.id
              return (
                <li key={mod.id}>
                  <Link
                    href={`/educators/${program.slug}/${mod.id}`}
                    className={cn(
                      'flex items-start gap-3 px-5 py-3 transition-colors group',
                      current
                        ? 'bg-orange-DEFAULT/10 border-r-2 border-orange-DEFAULT'
                        : 'hover:bg-black-3'
                    )}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {done ? (
                        <CheckCircle size={13} className="text-orange-DEFAULT" />
                      ) : (
                        <Circle
                          size={13}
                          className={cn(
                            'transition-colors',
                            current ? 'text-orange-DEFAULT' : 'text-grey-dark group-hover:text-grey-DEFAULT'
                          )}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        'font-body text-xs leading-snug',
                        current ? 'text-white font-semibold' : 'text-grey-DEFAULT'
                      )}>
                        {String(idx + 1).padStart(2, '0')}. {mod.title}
                      </p>
                      <p className="font-mono text-[0.5rem] tracking-widest text-grey-dark mt-0.5">
                        {mod.duration}
                      </p>
                    </div>
                    {current && (
                      <ChevronRight size={11} className="text-orange-DEFAULT mt-0.5 flex-shrink-0" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Notes */}
        <div className="flex-1 flex flex-col border-t border-white/8 min-h-[200px]">
          <div className="px-5 py-3 flex items-center justify-between border-b border-white/8 flex-shrink-0">
            <div className="flex items-center gap-2">
              <FileText size={12} className="text-orange-DEFAULT" />
              <span className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-grey-dark">
                My Notes
              </span>
            </div>
            <div className="flex items-center gap-1.5 h-4">
              {saving && <Loader2 size={10} className="text-grey-dark animate-spin" />}
              {saved  && <span className="font-mono text-[0.5rem] tracking-widest text-orange-DEFAULT">Saved ✓</span>}
            </div>
          </div>
          {loaded ? (
            <textarea
              className="flex-1 bg-transparent text-white text-xs font-body leading-relaxed
                         p-4 resize-none outline-none placeholder:text-white/15
                         focus:bg-black-3 transition-colors"
              placeholder={`Notes for "${currentModule.title}"…`}
              value={content}
              onChange={e => handleChange(e.target.value)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={16} className="text-grey-dark animate-spin" />
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

// ─── Mobile bottom-sheet drawer ───────────────────────────────────────────────

function EduMobileDrawer({
  program,
  currentModule,
  completedIds,
}: {
  program:       EducationProgram
  currentModule: EducationModule
  completedIds:  string[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="lg:hidden fixed bottom-5 right-5 z-40 w-12 h-12 bg-orange-DEFAULT text-black flex items-center justify-center shadow-xl"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-30 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[75vh] bg-black-2 border-t-2 border-orange-DEFAULT"
            >
              <EduSidebar
                program={program}
                currentModule={currentModule}
                completedIds={completedIds}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
