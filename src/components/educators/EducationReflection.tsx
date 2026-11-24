'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { ReflectionQuestion } from '@/lib/education/curriculum';
import { cn } from '@/lib/utils';

interface EducationReflectionProps {
  quiz: ReflectionQuestion[];
  moduleId: string;
  onComplete: () => void;
  alreadyCompleted?: boolean;
}

export default function EducationReflection({
  quiz,
  onComplete,
  alreadyCompleted = false,
}: EducationReflectionProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(alreadyCompleted);

  if (!quiz || quiz.length === 0) return null;

  const handleSelectOption = (qIdx: number, oIdx: number) => {
    if (answers[qIdx] !== undefined) return;
    setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const allAnswered = Object.keys(answers).length === quiz.length;
  const correctCount = quiz.filter((q, idx) => answers[idx] === q.correct).length;

  const handleReset = () => {
    setAnswers({});
    setCompleted(false);
  };

  const handleFinish = () => {
    setCompleted(true);
    onComplete();
  };

  return (
    <div className="my-10 border-2 border-[#E8621A] bg-[#141008] relative overflow-hidden">
      <div className="px-7 py-5 border-b border-white/8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-mono text-[0.58rem] tracking-[0.25em] uppercase text-[#E8621A] mb-1">
            Module Knowledge &amp; Reflection Check
          </div>
          <h3 className="font-display text-2xl tracking-wider text-white">
            {quiz.length} Questions · Applied Neuroscience &amp; Practice
          </h3>
        </div>
        <span className="font-mono text-[0.6rem] tracking-widest text-white/50 uppercase">
          {Object.keys(answers).length} / {quiz.length} Answered
        </span>
      </div>

      <div className="p-7 md:p-10 space-y-10">
        {quiz.map((q, qi) => {
          const answered = answers[qi] !== undefined;
          const selected = answers[qi];
          const isRight = answered && selected === q.correct;

          return (
            <div key={qi} className="pb-10 border-b border-white/8 last:border-0 last:pb-0">
              <p className="font-body text-lg md:text-xl font-semibold text-white leading-snug mb-5">
                <span className="font-mono text-xs text-[#E8621A] mr-2">Q{qi + 1}.</span>
                {q.q}
              </p>

              <div className="space-y-2.5">
                {q.options.map((opt, oi) => {
                  const isCorrectOpt = oi === q.correct;
                  const isSelectedOpt = oi === selected;

                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelectOption(qi, oi)}
                      disabled={answered}
                      className={cn(
                        'w-full text-left p-4 border transition-all duration-200 flex items-start gap-4 font-body text-sm md:text-base leading-relaxed',
                        !answered && 'border-white/10 bg-black/40 text-white/80 hover:border-[#E8621A]/60 hover:bg-[#E8621A]/5 hover:text-white cursor-pointer',
                        answered && isCorrectOpt && 'border-green-500 bg-green-500/10 text-white',
                        answered && isSelectedOpt && !isCorrectOpt && 'border-red-500 bg-red-500/10 text-white',
                        answered && !isSelectedOpt && !isCorrectOpt && 'border-white/5 bg-black/20 text-white/35 opacity-50'
                      )}
                    >
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-[0.65rem] font-bold mt-0.5 border',
                          !answered && 'border-[#E8621A]/50 text-[#E8621A]',
                          answered && isCorrectOpt && 'border-green-400 bg-green-500 text-black',
                          answered && isSelectedOpt && !isCorrectOpt && 'border-red-400 bg-red-500 text-black',
                          answered && !isSelectedOpt && !isCorrectOpt && 'border-white/15 text-white/30'
                        )}
                      >
                        {['A', 'B', 'C', 'D', 'E'][oi]}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {answered && isCorrectOpt && <CheckCircle size={16} className="text-green-400 mt-1 flex-shrink-0" />}
                      {answered && isSelectedOpt && !isCorrectOpt && <XCircle size={16} className="text-red-400 mt-1 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {answered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'mt-4 p-5 border-l-4 text-sm md:text-base font-body leading-relaxed',
                      isRight
                        ? 'border-green-500 bg-green-500/5 text-white/85'
                        : 'border-[#E8621A] bg-[#E8621A]/8 text-white/85'
                    )}
                  >
                    <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase mb-1.5 text-[#E8621A]">
                      {isRight ? '✓ Correct — Neurobiological Rationale' : '◈ Key Distinction & Rationale'}
                    </p>
                    <p className="italic text-white/80">{q.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        <div className="pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
          {allAnswered ? (
            <div className="font-mono text-[0.6rem] tracking-widest uppercase text-[#C9A84C]">
              Score: {correctCount} / {quiz.length} ({Math.round((correctCount / quiz.length) * 100)}%)
            </div>
          ) : (
            <div className="font-mono text-[0.58rem] tracking-widest uppercase text-white/40">
              Select an answer for each question to complete
            </div>
          )}

          <div className="flex items-center gap-3">
            {allAnswered && (
              <button
                onClick={handleReset}
                className="btn-outline text-[0.6rem] px-4 py-2.5 flex items-center gap-2"
              >
                <RotateCcw size={12} /> Retry Questions
              </button>
            )}
            <button
              onClick={handleFinish}
              disabled={!allAnswered}
              className={cn(
                'btn-orange text-[0.62rem] px-6 py-3 flex items-center gap-2',
                !allAnswered && 'opacity-40 cursor-not-allowed'
              )}
            >
              <CheckCircle size={14} />
              {completed ? 'Module Completed ✓' : 'Complete Module'}
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
