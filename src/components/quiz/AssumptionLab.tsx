'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ASSUMPTION_LAB_QUIZ } from '@/lib/data/courses'

export function AssumptionLab() {
  const [currentQ, setCurrentQ]     = useState(0)
  const [selected, setSelected]     = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [completed, setCompleted]   = useState(false)

  const questions = ASSUMPTION_LAB_QUIZ.questions
  const question  = questions[currentQ]

  function handleSelect(optId: string) {
    if (showFeedback) return
    setSelected(optId)
    setShowFeedback(true)
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
      setSelected(null)
      setShowFeedback(false)
    } else {
      setCompleted(true)
    }
  }

  function handleReset() {
    setCurrentQ(0)
    setSelected(null)
    setShowFeedback(false)
    setCompleted(false)
  }

  const selectedOption = question?.options.find(o => o.id === selected)

  return (
    <div className="bg-black-2 border-2 border-orange-DEFAULT p-10 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="label mb-2">The Assumption Lab · Live Preview</div>
          <h3 className="font-display text-2xl tracking-widest text-white">
            SCENARIO {String(currentQ + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
          </h3>
        </div>
        <button onClick={handleReset} className="text-grey-DEFAULT hover:text-orange-DEFAULT transition-colors">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-px bg-black-4 mb-8">
        <motion.div
          className="h-px bg-orange-DEFAULT"
          animate={{ width: `${((currentQ) / questions.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question */}
            <p className="font-body text-xl font-semibold text-white mb-8 leading-relaxed">
              {question.question}
            </p>

            {/* Options */}
            <div className="flex flex-col gap-3 mb-6">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={cn(
                    'flex items-start gap-4 p-4 border text-left transition-all duration-200',
                    selected === opt.id
                      ? 'border-orange-DEFAULT bg-orange-DEFAULT/10 text-white'
                      : 'border-grey-dark text-grey-DEFAULT hover:border-orange-DEFAULT hover:text-white hover:bg-orange-DEFAULT/5',
                    showFeedback && selected !== opt.id && 'opacity-40'
                  )}
                >
                  <span className="font-display text-xl text-orange-DEFAULT leading-none mt-0.5 min-w-[20px]">
                    {opt.label}
                  </span>
                  <span className="font-body text-sm leading-relaxed">{opt.text}</span>
                </button>
              ))}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && selectedOption && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-l-4 border-orange-DEFAULT bg-orange-DEFAULT/8 p-5 mb-6"
                >
                  <p className="font-body text-sm italic text-offwhite leading-relaxed">
                    {selectedOption.feedback}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next button */}
            {showFeedback && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleNext}
                className="btn-orange flex items-center gap-2"
              >
                {currentQ < questions.length - 1 ? 'Next Scenario' : 'Complete Lab'}
                <ChevronRight size={14} />
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
          >
            <div className="font-display text-7xl text-orange-DEFAULT mb-4">✦</div>
            <h3 className="font-display text-3xl tracking-widest mb-4">
              LAB COMPLETE
            </h3>
            <p className="font-body text-grey-DEFAULT mb-8 max-w-md mx-auto leading-relaxed">
              You've run three scenarios through the Assumption Lab. The full version inside the platform includes 20+ scenarios across money, relationships, health, and self-worth — with a personalized readout of your default programs.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="/auth/signup" className="btn-orange">
                Unlock Full Lab
              </a>
              <button onClick={handleReset} className="btn-outline">
                Run Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
