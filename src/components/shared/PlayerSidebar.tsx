'use client'

import { useState } from 'react'
import { ChevronDown, CheckCircle, Circle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

/** A single progress ring (SVG) */
function ProgressRing({ pct, size = 32 }: { pct: number; size?: number }) {
  const r = (size - 4) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (Math.min(100, Math.max(0, pct)) / 100) * circumference
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--p-orange)" strokeWidth={2}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill="var(--p-orange)" fontSize={8} fontWeight={700}>
        {Math.round(pct)}%
      </text>
    </svg>
  )
}

/** Single lesson/module item inside an expanded accordion tab */
interface SidebarItem {
  id:             string
  num:            string
  title:          string
  duration?:      string
  isPreview?:     boolean
  isQuiz?:        boolean
  hasReflection?: boolean
}

/** A single course/program/track accordion tab */
export interface SidebarEntry {
  id:          string
  slug:        string
  num:         string
  title:       string
  audienceTag: string   // e.g. "FREE" | "ALL K–12 STAFF" | "SELF MASTERY"
  totalTime?:  string   // e.g. "3.5h"
  items:       SidebarItem[]
}

interface PlayerSidebarProps {
  entries:          SidebarEntry[]
  activeEntryIdx:   number
  activeItemIdx:    number
  completedItemIds: string[]
  onSelectEntry:    (entryIdx: number) => void
  onSelectItem:     (entryIdx: number, itemIdx: number) => void
  isOpen:           boolean
}

export function PlayerSidebar({
  entries,
  activeEntryIdx,
  activeItemIdx,
  completedItemIds,
  onSelectEntry,
  onSelectItem,
  isOpen,
}: PlayerSidebarProps) {
  const [expandedIdx, setExpandedIdx] = useState(activeEntryIdx)

  const toggleEntry = (i: number) => {
    setExpandedIdx(prev => (prev === i ? -1 : i))
    onSelectEntry(i)
  }

  return (
    <nav
      aria-label="Course navigation"
      className={cn(
        "flex flex-col h-[calc(100vh-52px)] bg-black-2 border-l border-white/8 overflow-y-auto transition-all duration-300 ease-in-out flex-shrink-0 relative",
        isOpen ? "w-[320px]" : "w-0 opacity-0"
      )}
    >
      <div className="py-2">
        {entries.map((entry, ei) => {
          const completedCount = entry.items.filter(it => completedItemIds.includes(it.id)).length
          const pct            = entry.items.length > 0 ? (completedCount / entry.items.length) * 100 : 0
          const isExpanded     = expandedIdx === ei
          const isActive       = activeEntryIdx === ei

          return (
            <div key={entry.id} className="mb-1">
              {/* Accordion tab header */}
              <button
                onClick={() => toggleEntry(ei)}
                aria-expanded={isExpanded}
                className={cn(
                  "w-full text-left px-5 py-3 flex flex-col gap-1 transition-colors border-l-2",
                  isActive ? "bg-orange-DEFAULT/5 border-orange-DEFAULT" : "border-transparent hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <ProgressRing pct={pct} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[0.52rem] text-grey-dark tracking-[0.15em] uppercase mb-0.5">
                      {entry.num} · {entry.audienceTag}
                    </div>
                    <div className={cn(
                      "font-body text-xs leading-tight truncate",
                      isActive ? "text-white font-bold" : "text-grey-DEFAULT"
                    )}>
                      {entry.title}
                    </div>
                  </div>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-grey-dark transition-transform duration-300",
                      isExpanded && "rotate-180"
                    )}
                  />
                </div>
                <div className="font-mono text-[0.5rem] text-grey-dark pl-11">
                  {completedCount}/{entry.items.length}{entry.totalTime ? ` · ${entry.totalTime}` : ''}
                </div>
              </button>

              {/* Expanded item list */}
              {isExpanded && (
                <div className="bg-black/20">
                  {entry.items.map((item, ii) => {
                    const isDone   = completedItemIds.includes(item.id)
                    const isCurr   = isActive && activeItemIdx === ii

                    return (
                      <button
                        key={item.id}
                        onClick={(e) => { e.stopPropagation(); onSelectItem(ei, ii) }}
                        className={cn(
                          "w-full text-left pl-14 pr-5 py-2.5 flex items-center gap-3 transition-colors group border-l-2",
                          isCurr ? "bg-orange-DEFAULT/10 border-orange-DEFAULT" : "border-transparent hover:bg-white/5"
                        )}
                      >
                        {/* Status icon */}
                        <div className="flex-shrink-0">
                          {isDone ? (
                            <CheckCircle size={13} className="text-orange-DEFAULT" />
                          ) : (
                            <Circle 
                              size={13} 
                              className={cn(
                                "transition-colors",
                                isCurr ? "text-orange-DEFAULT" : "text-grey-dark group-hover:text-grey-DEFAULT"
                              )}
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "font-body text-xs leading-snug truncate",
                            isCurr ? "text-white font-semibold" : "text-grey-DEFAULT"
                          )}>
                            {item.num}. {item.title}
                          </div>
                          {item.duration && (
                            <div className="font-mono text-[0.5rem] text-grey-dark mt-0.5">{item.duration}</div>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex gap-1.5 flex-shrink-0">
                          {item.isPreview && (
                            <span className="font-mono text-[0.45rem] tracking-[0.1em] px-1.5 py-0.5 border border-green-400/30 text-green-400 bg-green-400/5 rounded">FREE</span>
                          )}
                          {item.isQuiz && (
                            <span className="font-mono text-[0.45rem] tracking-[0.1em] px-1.5 py-0.5 border border-orange-DEFAULT/30 text-orange-DEFAULT bg-orange-DEFAULT/5 rounded">QUIZ</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ARIA live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="player-announcer" />
    </nav>
  )
}
