'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReflectionQuestion } from '@/lib/education/curriculum';

interface EducationReflectionProps {
  quiz: ReflectionQuestion[];
  moduleId: string;
  onComplete: () => void;
}

export default function EducationReflection({
  quiz,
  moduleId,
  onComplete
}: EducationReflectionProps) {
  // Map of question index to selected option index
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  if (!quiz || quiz.length === 0) return null;

  const handleSelectOption = (qIdx: number, oIdx: number) => {
    if (answers[qIdx] !== undefined) return; // already answered
    setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const isModuleComplete = Object.keys(answers).length === quiz.length;

  return (
    <div className="mt-12 mb-16 border border-[#1E2E2E] rounded bg-[#0A0F0F] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#E5B573]" />
      
      <div className="p-8 md:p-12 pb-6 border-b border-[#1E2E2E]">
        <div className="text-[#E5B573] text-sm font-bold tracking-[0.15em] mb-2 uppercase">
          MODULE REFLECTION
        </div>
        <div className="text-[#A3B8B8] text-base leading-relaxed">
          {quiz.length} questions · Reflect on what you've learned
        </div>
      </div>

      <div className="p-8 md:p-12 pt-6">
        {quiz.map((q, qi) => {
          const answered = answers[qi] !== undefined;
          const selected = answers[qi];
          return (
             <div key={qi} className="mb-12 last:mb-0 border-b border-white/5 pb-12 last:border-0 last:pb-0">
               <div className="text-xl md:text-2xl font-cormorant text-white leading-snug mb-6">
                 {qi + 1}. {q.q}
               </div>
               
               <div className="space-y-3 mt-6">
                 {q.options.map((opt, oi) => {
                   let stateClass = 'border-[#2ABFBF]/20 bg-[#060A0A] text-[#A3B8B8] hover:bg-[#121A1A] hover:border-[#2ABFBF]/50';
                   let letterClass = 'bg-[#121A1A] text-[#2ABFBF]';
                   
                   if (answered) {
                     if (oi === q.correct) {
                       stateClass = 'border-[#4CAF50] bg-[#4CAF50]/10 text-white';
                       letterClass = 'bg-[#4CAF50] text-[#060A0A]';
                     } else if (oi === selected && !isModuleComplete) {
                       stateClass = 'border-[#FF9800] bg-[#FF9800]/10 text-white';
                       letterClass = 'bg-[#FF9800] text-[#060A0A]';
                     } else {
                       stateClass = 'border-[#1E2E2E] bg-[#060A0A] text-[#6B8585] opacity-50';
                       letterClass = 'bg-[#1E2E2E] text-[#6B8585]';
                     }
                   }

                   return (
                     <button
                       key={oi}
                       onClick={() => handleSelectOption(qi, oi)}
                       disabled={answered}
                       className={`w-full text-left p-5 rounded border transition-all duration-300 flex items-start gap-4 cursor-pointer text-base leading-relaxed ${stateClass}`}
                     >
                       <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${letterClass}`}>
                         {['A', 'B', 'C', 'D', 'E'][oi]}
                       </div>
                       <div className="pt-0.5">{opt}</div>
                     </button>
                   );
                 })}
               </div>

               <AnimatePresence>
                 {answered && (
                   <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     className="mt-6 p-6 rounded bg-[#121A1A] border-l-[3px] border-[#4CAF50] text-[#A3B8B8] text-[15px] leading-[1.7] overflow-hidden"
                   >
                     <strong className="text-white block mb-2">{q.options[q.correct]}</strong>
                     {q.explanation}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          );
        })}

        <div className="mt-12 pt-8 border-t border-[#1E2E2E] flex justify-end">
          <button
            onClick={onComplete}
            disabled={!isModuleComplete}
            className={`px-8 py-4 bg-[#2ABFBF] text-[#060A0A] text-sm font-bold tracking-[0.1em] uppercase transition-all duration-300 ${!isModuleComplete ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:shadow-[0_0_20px_rgba(42,191,191,0.4)]'}`}
          >
            Complete Module →
          </button>
        </div>
      </div>
    </div>
  );
}
