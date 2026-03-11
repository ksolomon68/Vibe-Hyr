'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PROGRAMS } from '@/lib/education/curriculum';

interface SidebarProps {
  activeProgramIdx: number;
  activeModuleIdx: number;
  completedMap: Record<string, boolean>;
  onSelectProgram: (idx: number) => void;
  onSelectModule: (idx: number) => void;
  isOpen?: boolean;
}

export default function EducationSidebar({
  activeProgramIdx,
  activeModuleIdx,
  completedMap,
  onSelectProgram,
  onSelectModule,
  isOpen = true
}: SidebarProps) {
  const activeProgram = PROGRAMS[activeProgramIdx];

  const getProgramCompleted = (pid: string) => {
    const p = PROGRAMS.find(pr => pr.id === pid);
    if (!p) return 0;
    return p.modules.filter(m => completedMap[m.id]).length;
  };

  const makeSVGRing = (pct: number, size: number, color: string) => {
    const r = (size - 4) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E2E2E" strokeWidth="2.5" />
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={r} 
          fill="none" 
          stroke={color} 
          strokeWidth="2.5"
          strokeDasharray={`${dash} ${circ}`} 
          strokeLinecap="round" 
        />
      </svg>
    );
  };

  return (
    <aside 
      className={`fixed top-0 left-0 h-full w-[380px] bg-[#060A0A] border-r border-[#1E2E2E] flex flex-col z-40 transition-transform duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="h-[72px] border-b border-[#1E2E2E] px-8 flex items-center justify-between flex-shrink-0">
        <div className="text-white font-bebas text-2xl tracking-[0.08em] mt-1">
          VIBE HYR <span className="text-[#2ABFBF] ml-1">/</span> EDUCATION
        </div>
      </div>

      <div className="flex-[0_0_auto] border-b border-[#1E2E2E] max-h-[45vh] overflow-y-auto hidden-scrollbar">
        {PROGRAMS.map((prog, pi) => {
          const done = getProgramCompleted(prog.id);
          const total = prog.modules.length;
          const pct = Math.round((done / total) * 100);
          const isActive = pi === activeProgramIdx;

          return (
            <button 
              key={prog.id}
              onClick={() => onSelectProgram(pi)}
              className={`w-full text-left p-6 border-b border-white/5 transition-colors relative block cursor-pointer group ${isActive ? 'bg-[#121A1A] before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#2ABFBF]' : 'hover:bg-[#0A0F0F]'}`}
            >
              <div className="flex items-start gap-4 mb-2 relative">
                <div className="w-9 h-9 relative flex-shrink-0">
                  {makeSVGRing(pct, 36, '#2ABFBF')}
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white tracking-widest leading-none">
                    {pct}%
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#A3B8B8] text-[10px] font-bold tracking-[0.15em] mb-1">
                    {prog.num} · {prog.audience.toUpperCase()}
                  </div>
                  <div className={`font-bebas text-xl tracking-wide leading-[1.1] ${isActive ? 'text-[#2ABFBF]' : 'text-white group-hover:text-[#2ABFBF] transition-colors'}`}>
                    {prog.title}
                  </div>
                </div>
                <span className="bg-white/10 text-white text-[9px] font-bold tracking-[0.1em] px-2 py-1 rounded-sm uppercase whitespace-nowrap">
                  {prog.audience.split(' ')[0]}
                </span>
              </div>
              <div className="text-[#6B8585] text-xs leading-relaxed pl-[52px]">
                {done}/{total} modules · {prog.totalTime}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto hidden-scrollbar relative bg-[#060A0A]">
        <div className="sticky top-0 bg-[#060A0A] p-6 border-b border-[#1E2E2E] z-10 flex justify-between items-center">
          <div className="text-[#A3B8B8] text-xs font-bold tracking-[0.15em]">
            {activeProgram.title.toUpperCase()} MODULES
          </div>
        </div>
        <div>
          {activeProgram.modules.map((mod, mi) => {
            const isActive = mi === activeModuleIdx;
            const isDone = completedMap[mod.id];

            return (
              <button 
                key={mod.id}
                onClick={() => onSelectModule(mi)}
                className={`w-full text-left p-5 border-b border-[#1E2E2E] flex items-start gap-4 transition-colors cursor-pointer group ${isActive ? 'bg-[#121A1A]' : 'hover:bg-[#0A0F0F]'} ${isDone ? 'opacity-60 hover:opacity-100' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full border border-[#2ABFBF] flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${isDone ? 'bg-[#2ABFBF] text-[#060A0A]' : 'text-[#2ABFBF]'}`}>
                  {isDone ? '✓' : mod.num}
                </div>
                <div className="flex-1">
                  <div className={`text-base font-medium leading-tight mb-1 relative ${isActive ? 'text-[#2ABFBF]' : 'text-white group-hover:text-[#2ABFBF] transition-colors'} ${isDone && !isActive ? 'line-through decoration-[#6B8585]' : ''}`}>
                    {mod.title}
                  </div>
                  <div className="text-[#6B8585] text-xs uppercase tracking-wider">
                    {mod.duration}
                  </div>
                </div>
                {mod.hasReflection && !isDone && (
                  <span className="bg-[#121A1A] border border-[#2ABFBF]/30 text-[#2ABFBF] text-[9px] font-bold tracking-[0.1em] px-2 py-0.5 rounded-sm">
                    REFLECT
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
