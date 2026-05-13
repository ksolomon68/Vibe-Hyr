'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ABCOption { label: string; text: string; value: number }
interface ABCQuestion { pillar: string; question: string; type: 'abc'; options: ABCOption[] }
interface ScaleQuestion { pillar: string; question: string; type: 'scale'; min: string; max: string }
type Question = ABCQuestion | ScaleQuestion

// ── Question data ─────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    pillar: 'PILLAR I — RAS PROGRAMMING',
    type: 'abc',
    question: 'You receive an unexpected setback at work. Your first instinct is to...',
    options: [
      { label: 'A', value: 1, text: 'Replay what went wrong and mentally catalog everything at risk' },
      { label: 'B', value: 2, text: 'Feel frustrated but quickly look for what can be salvaged or learned' },
      { label: 'C', value: 3, text: 'Immediately start scanning for the opportunity hidden inside the setback' },
    ],
  },
  {
    pillar: 'PILLAR I — RAS PROGRAMMING',
    type: 'scale',
    question: 'How often do you notice evidence that your goals are already unfolding?',
    min: 'Rarely notice',
    max: 'Always notice',
  },
  {
    pillar: 'PILLAR II — IDENTITY & ASSUMPTION',
    type: 'abc',
    question: 'When you think about the person you want to become, you feel...',
    options: [
      { label: 'A', value: 1, text: 'A gap — like that version of me is far away or conditional on major change' },
      { label: 'B', value: 2, text: "Some alignment — I'm heading there but don't fully inhabit that identity yet" },
      { label: 'C', value: 3, text: 'Already there — I think, act, and feel like that version of me now' },
    ],
  },
  {
    pillar: 'PILLAR III — SUBCONSCIOUS REPROGRAMMING',
    type: 'abc',
    question: 'How would you describe your mental state in the 10 minutes before sleep?',
    options: [
      { label: 'A', value: 1, text: "My mind replays the day's problems, stress, or unfinished tasks" },
      { label: 'B', value: 2, text: 'I try to wind down but have no deliberate practice or intention' },
      { label: 'C', value: 3, text: 'I use this window intentionally — scripting, visualization, or assumption work' },
    ],
  },
  {
    pillar: 'PILLAR IV — ECHO THEORY PATIENCE',
    type: 'abc',
    question: "You've been working toward a major goal for 60 days with no visible result. You...",
    options: [
      { label: 'A', value: 1, text: "Conclude it's not working and switch strategies or abandon the goal" },
      { label: 'B', value: 2, text: 'Feel doubt creeping in but push through with diminishing conviction' },
      { label: 'C', value: 3, text: 'Trust the lag — I know the bridge of incidents is already forming' },
    ],
  },
  {
    pillar: 'OVERALL BASELINE',
    type: 'scale',
    question: 'How aligned does your daily mental diet feel with the reality you want to build?',
    min: 'Actively misaligned',
    max: 'Fully aligned',
  },
]

// ── Pillar metadata ───────────────────────────────────────────────────────────

const PILLAR_META = [
  {
    key: 'ras' as const,
    label: 'RAS Programming',
    course: 'Course 1: Programming the Gatekeeper',
    gap: 'Your Reticular Activating System is filtering for evidence against your goals instead of for them.',
  },
  {
    key: 'identity' as const,
    label: 'Identity & Assumption',
    course: 'Course 2: Mastery of the Law of Assumption',
    gap: "You haven't fully inhabited the identity of the person who already has what you want.",
  },
  {
    key: 'sats' as const,
    label: 'Subconscious Reprogramming',
    course: 'Course 3: Subconscious Reprogramming via SATS',
    gap: 'Your subconscious is receiving its nightly programming by default, not by design.',
  },
  {
    key: 'echo' as const,
    label: 'Echo Theory Patience',
    course: 'Course 4: Navigating the Echo Theory Delay',
    gap: 'Impatience with the lag between assumption and manifestation is canceling your own orders.',
  },
]

// ── Scoring ───────────────────────────────────────────────────────────────────

function computeScores(answers: number[]) {
  const [q0, q1, q2, q3, q4, q5] = answers
  const ras      = Math.round(((q0 / 3) * 50) + ((q1 / 5) * 50))
  const identity = Math.round((q2 / 3) * 100)
  const sats     = Math.round((q3 / 3) * 100)
  const echo     = Math.round((q4 / 3) * 100)
  const mental   = Math.round((q5 / 5) * 100)
  const total    = Math.round((ras + identity + sats + echo + mental) / 5)
  return { ras, identity, sats, echo, mental, total }
}

function getArchetype(total: number): { name: string; sub: string } {
  if (total >= 75) return { name: 'REALITY ARCHITECT', sub: 'Your blueprint is strong — now activate it at scale' }
  if (total >= 45) return { name: 'REALITY BUILDER',   sub: 'Your foundation exists — but key pillars need reinforcement' }
  return                  { name: 'REALITY SEEKER',    sub: 'Your 95% is running an outdated program' }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RealityAssessmentSection() {
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState<number[]>(Array(6).fill(0))
  const [phase, setPhase]     = useState<'quiz' | 'results'>('quiz')

  const currentQ = QUESTIONS[step]

  function selectAnswer(value: number) {
    const next = [...answers]
    next[step] = value
    setAnswers(next)
  }

  function handleNext() {
    if (answers[step] === 0) return
    if (step < 5) { setStep(step + 1) }
    else          { setPhase('results') }
  }

  function handleReset() {
    setStep(0)
    setAnswers(Array(6).fill(0))
    setPhase('quiz')
  }

  const scores    = computeScores(answers)
  const archetype = getArchetype(scores.total)
  const pillars   = PILLAR_META.map(p => ({ ...p, score: scores[p.key] }))
  const gaps      = [...pillars].sort((a, b) => a.score - b.score).slice(0, 2)

  return (
    <section id="reality-assessment" className="py-24 px-6 md:px-14">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="label mb-4">Neural Diagnostic</div>
        <h2 className="font-display text-[clamp(3rem,6vw,5rem)] leading-[0.95] tracking-[0.02em] mb-4">
          FIND OUT WHERE YOUR<br />
          <span className="text-orange">REALITY BREAKS</span>
        </h2>
        <p className="font-body italic text-grey max-w-xl mb-12">
          A 2-minute diagnostic across all four NRA pillars. No fluff. Just your blueprint.
        </p>

        {/* Card */}
        <div className="bg-black-2 border-2 border-orange p-10 relative">

          {/* Progress steps */}
          <div className="flex gap-1.5 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-[3px] transition-all duration-300"
                style={{
                  background:
                    phase === 'results' || i < step ? '#E8621A'
                    : i === step                    ? 'rgba(232,98,26,0.5)'
                    :                                 '#333333',
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {phase === 'quiz' ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28 }}
              >
                <div className="label mb-4">{currentQ.pillar}</div>

                <p className="font-body text-xl font-semibold text-white mb-8 leading-relaxed">
                  {currentQ.question}
                </p>

                {/* ABC options */}
                {currentQ.type === 'abc' && (
                  <div className="flex flex-col gap-3 mb-8">
                    {currentQ.options.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => selectAnswer(opt.value)}
                        className={cn(
                          'flex items-start gap-4 p-4 border text-left transition-all duration-200',
                          answers[step] === opt.value
                            ? 'border-orange bg-orange/10 text-white'
                            : 'border-grey-dark text-grey hover:border-orange hover:text-white hover:bg-orange/5'
                        )}
                      >
                        <span className="font-display text-xl text-orange leading-none mt-0.5 min-w-[20px]">
                          {opt.label}
                        </span>
                        <span className="font-body text-sm leading-relaxed">{opt.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Scale options */}
                {currentQ.type === 'scale' && (
                  <div className="mb-8">
                    <div className="flex justify-between font-mono text-xs text-grey mb-3">
                      <span>{currentQ.min}</span>
                      <span>{currentQ.max}</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          onClick={() => selectAnswer(v)}
                          className={cn(
                            'flex-1 py-5 border font-display text-2xl transition-all duration-200',
                            answers[step] === v
                              ? 'border-orange bg-orange/10 text-orange'
                              : 'border-grey-dark text-grey hover:border-orange hover:text-white'
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleNext}
                  disabled={answers[step] === 0}
                  className={cn(
                    'btn-orange block w-full text-center',
                    answers[step] === 0 && 'opacity-40 cursor-not-allowed hover:bg-orange hover:text-black hover:translate-y-0'
                  )}
                >
                  {step < 5 ? 'NEXT' : 'SEE MY REPORT'}
                </button>
              </motion.div>
            ) : (
              /* ── Results ── */
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

                {/* Score circle + archetype */}
                <motion.div
                  className="flex flex-col items-center mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="relative w-36 h-36 mb-6">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="45" fill="none" stroke="#222222" strokeWidth="6" />
                      <motion.circle
                        cx="60" cy="60" r="45"
                        fill="none"
                        stroke="#E8621A"
                        strokeWidth="6"
                        strokeLinecap="round"
                        pathLength={1}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: scores.total / 100 }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        className="font-display text-4xl text-white leading-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        {scores.total}
                      </motion.span>
                      <span className="font-mono text-[0.55rem] tracking-widest text-grey">/100</span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-orange/10 border border-orange/30 px-4 py-1.5 mb-3">
                    <span className="font-display text-sm tracking-[0.2em] text-orange">{archetype.name}</span>
                  </div>
                  <p className="font-body text-grey text-center max-w-sm text-sm">{archetype.sub}</p>
                </motion.div>

                {/* Pillar bars */}
                <motion.div
                  className="mb-10"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.55 }}
                >
                  <div className="font-display text-xs tracking-[0.25em] text-grey mb-5">YOUR PILLAR SCORES</div>
                  <div className="flex flex-col gap-4">
                    {pillars.map((p, i) => (
                      <div key={p.key}>
                        <div className="flex justify-between font-mono text-xs mb-1.5">
                          <span className="text-grey">{p.label}</span>
                          <span className="text-white">{p.score}%</span>
                        </div>
                        <div className="h-[3px] bg-black-4 w-full">
                          <motion.div
                            className="h-full bg-orange"
                            initial={{ width: 0 }}
                            animate={{ width: `${p.score}%` }}
                            transition={{ duration: 0.8, delay: 0.65 + i * 0.1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Gap cards */}
                <motion.div
                  className="mb-10"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.95 }}
                >
                  <div className="font-display text-xs tracking-[0.25em] text-grey mb-5">WHERE TO FOCUS FIRST</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gaps.map((g) => (
                      <div key={g.key} className="bg-black-3 border border-orange/20 p-5">
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="font-display text-sm tracking-widest text-white">{g.label}</span>
                          <span className="font-mono text-xs text-orange">{g.score}%</span>
                        </div>
                        <p className="font-body text-xs text-grey leading-relaxed mb-3">{g.gap}</p>
                        <span className="font-mono text-[0.6rem] tracking-wider text-orange">{g.course}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* CTAs */}
                <motion.div
                  className="flex flex-col gap-3"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.15 }}
                >
                  <Link href="/auth/signup" className="btn-orange block w-full text-center">
                    START BUILDING YOUR REALITY
                  </Link>
                  <button onClick={handleReset} className="btn-outline block w-full text-center">
                    RETAKE ASSESSMENT
                  </button>
                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}
