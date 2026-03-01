'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Quiz } from '@/types'

interface LessonQuizProps {
  quiz:         Quiz
  onPass:       () => void
  alreadyPassed?: boolean
}

type Phase = 'intro' | 'taking' | 'reviewing' | 'passed' | 'failed'

export function LessonQuiz({ quiz, onPass, alreadyPassed }: LessonQuizProps) {
  const [phase,       setPhase]     = useState<Phase>(alreadyPassed ? 'passed' : 'intro')
  const [currentQ,    setCurrentQ]  = useState(0)
  const [answers,     setAnswers]   = useState<Record<string, string>>({})
  const [submitted,   setSubmitted] = useState(false)
  const [score,       setScore]     = useState(0)
  const [saving,      setSaving]    = useState(false)

  const question     = quiz.questions[currentQ]
  const totalQ       = quiz.questions.length
  const selectedOptId = answers[question?.id ?? ''] ?? null

  function handleSelect(optId: string) {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [question.id]: optId }))
  }

  function handleSubmitQuestion() {
    if (!selectedOptId) return
    setSubmitted(true)
  }

  function handleNext() {
    if (currentQ < totalQ - 1) {
      setCurrentQ(prev => prev + 1)
      setSubmitted(false)
    } else {
      finalizeQuiz()
    }
  }

  async function finalizeQuiz() {
    const correct = quiz.questions.filter(q =>
      q.correct_option_id && answers[q.id] === q.correct_option_id
    ).length

    const pct    = Math.round((correct / totalQ) * 100)
    const passed = pct >= quiz.pass_percent

    setScore(pct)
    setPhase('reviewing')
    setSaving(true)

    // Save attempt to Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('quiz_attempts').insert({
        user_id:      user.id,
        quiz_id:      quiz.id,
        answers,
        score_percent: pct,
        passed,
        completed_at:  new Date().toISOString(),
      })
    }

    setSaving(false)
    setTimeout(() => setPhase(passed ? 'passed' : 'failed'), 1200)
  }

  function handleRetry() {
    setPhase('taking')
    setCurrentQ(0)
    setAnswers({})
    setSubmitted(false)
    setScore(0)
  }

  // ── Correct option lookup
  const correctOptId = question?.correct_option_id
  const selectedOpt  = question?.options.find(o => o.id === selectedOptId)
  const correctOpt   = question?.options.find(o => o.id === correctOptId)
  const isCorrect    = submitted && selectedOptId === correctOptId

  return (
    <div className="border-2 border-orange-DEFAULT bg-black-2">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/8">
        <div>
          <div className="label mb-1">Quiz Gate</div>
          <h3 className="font-display text-xl tracking-widest text-white">{quiz.title}</h3>
        </div>
        {phase === 'taking' && (
          <span className="font-mono text-[0.6rem] tracking-widest text-grey-dark">
            {currentQ + 1} / {totalQ}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">

        {/* ── INTRO ── */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-8"
          >
            <p className="font-body text-base text-grey-DEFAULT leading-relaxed mb-6">
              {quiz.description ?? `Complete this ${totalQ}-question check before advancing to the next lesson. You need ${quiz.pass_percent}% to pass.`}
            </p>
            <div className="flex items-center gap-5 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl text-orange-DEFAULT">{totalQ}</span>
                <span className="font-mono text-[0.55rem] tracking-widest text-grey-dark uppercase">Questions</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl text-orange-DEFAULT">{quiz.pass_percent}%</span>
                <span className="font-mono text-[0.55rem] tracking-widest text-grey-dark uppercase">To Pass</span>
              </div>
            </div>
            <button onClick={() => setPhase('taking')} className="btn-orange flex items-center gap-2">
              Begin Quiz <ChevronRight size={14} />
            </button>
          </motion.div>
        )}

        {/* ── TAKING ── */}
        {phase === 'taking' && (
          <motion.div
            key={`q-${currentQ}`}
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="p-8"
          >
            {/* Progress bar */}
            <div className="h-px bg-black-4 mb-7">
              <div
                className="h-px bg-orange-DEFAULT transition-all duration-500"
                style={{ width: `${(currentQ / totalQ) * 100}%` }}
              />
            </div>

            <p className="font-body text-lg font-semibold text-white mb-6 leading-relaxed">
              {question.question}
            </p>

            <div className="flex flex-col gap-3 mb-6">
              {question.options.map(opt => {
                const isSelected = selectedOptId === opt.id
                const isRight    = submitted && opt.id === correctOptId
                const isWrong    = submitted && isSelected && opt.id !== correctOptId

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    disabled={submitted}
                    className={cn(
                      'flex items-start gap-4 p-4 border text-left transition-all duration-200',
                      !submitted && isSelected
                        ? 'border-orange-DEFAULT bg-orange-DEFAULT/10 text-white'
                        : '',
                      !submitted && !isSelected
                        ? 'border-grey-dark text-grey-DEFAULT hover:border-orange-DEFAULT/50 hover:text-white'
                        : '',
                      isRight  ? 'border-green-400 bg-green-400/10 text-white' : '',
                      isWrong  ? 'border-red-400 bg-red-400/10 text-white' : '',
                      submitted && !isSelected && opt.id !== correctOptId ? 'opacity-40' : ''
                    )}
                  >
                    <span className="font-display text-lg text-orange-DEFAULT leading-none mt-0.5 min-w-[18px]">
                      {opt.label}
                    </span>
                    <span className="font-body text-sm leading-relaxed flex-1">{opt.text}</span>
                    {isRight  && <CheckCircle size={15} className="text-green-400 mt-0.5 flex-shrink-0" />}
                    {isWrong  && <XCircle     size={15} className="text-red-400 mt-0.5 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Explanation after submit */}
            <AnimatePresence>
              {submitted && question.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'border-l-4 p-4 mb-6',
                    isCorrect
                      ? 'border-green-400 bg-green-400/8'
                      : 'border-orange-DEFAULT bg-orange-DEFAULT/8'
                  )}
                >
                  <p className="font-mono text-[0.58rem] tracking-widest uppercase mb-1 text-grey-DEFAULT">
                    {isCorrect ? '✓ Correct' : '✗ Not quite'}
                  </p>
                  <p className="font-body text-sm italic text-grey-DEFAULT leading-relaxed">
                    {question.explanation}
                  </p>
                </motion.div>
              )}
              {submitted && selectedOpt?.feedback && !question.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-l-4 border-orange-DEFAULT bg-orange-DEFAULT/8 p-4 mb-6"
                >
                  <p className="font-body text-sm italic text-grey-DEFAULT leading-relaxed">
                    {selectedOpt.feedback}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action button */}
            {!submitted ? (
              <button
                onClick={handleSubmitQuestion}
                disabled={!selectedOptId}
                className={cn('btn-orange', !selectedOptId && 'opacity-40 cursor-not-allowed')}
              >
                Submit Answer
              </button>
            ) : (
              <button onClick={handleNext} className="btn-orange flex items-center gap-2">
                {currentQ < totalQ - 1 ? 'Next Question' : saving ? 'Scoring…' : 'See Results'}
                <ChevronRight size={14} />
              </button>
            )}
          </motion.div>
        )}

        {/* ── REVIEWING (brief transition) ── */}
        {phase === 'reviewing' && (
          <motion.div
            key="reviewing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-8 text-center py-12"
          >
            <div className="font-display text-6xl text-orange-DEFAULT mb-2">{score}%</div>
            <p className="font-mono text-[0.6rem] tracking-widest text-grey-dark uppercase">
              {saving ? 'Saving your results…' : 'Calculating…'}
            </p>
          </motion.div>
        )}

        {/* ── PASSED ── */}
        {phase === 'passed' && (
          <motion.div
            key="passed"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center py-10"
          >
            <Trophy size={40} className="text-orange-DEFAULT mx-auto mb-4" />
            <div className="font-display text-6xl text-orange-DEFAULT mb-2">{score}%</div>
            <h4 className="font-display text-2xl tracking-widest text-white mb-3">PASSED</h4>
            <p className="font-body text-sm italic text-grey-DEFAULT mb-8 max-w-xs mx-auto leading-relaxed">
              Lesson complete. Your understanding is verified. Mark the lesson done to continue.
            </p>
            <button onClick={onPass} className="btn-orange flex items-center gap-2 mx-auto">
              <CheckCircle size={14} />
              Mark Lesson Complete
            </button>
          </motion.div>
        )}

        {/* ── FAILED ── */}
        {phase === 'failed' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center py-10"
          >
            <div className="font-display text-6xl text-grey-dark mb-2">{score}%</div>
            <h4 className="font-display text-2xl tracking-widest text-white mb-3">
              NEEDS REVIEW
            </h4>
            <p className="font-body text-sm italic text-grey-DEFAULT mb-8 max-w-xs mx-auto leading-relaxed">
              You need {quiz.pass_percent}% to pass. Re-read the lesson and give it another shot — the material will stick better the second time.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button onClick={handleRetry} className="btn-orange flex items-center gap-2">
                <RotateCcw size={13} />
                Retry Quiz
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="btn-outline"
              >
                Re-read Lesson
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
