'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

/** A single progress ring (SVG) */
function ProgressRing({ pct, size = 36 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (Math.min(100, Math.max(0, pct)) / 100) * circumference
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--p-border2)" strokeWidth={3} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--p-orange)" strokeWidth={3}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill="var(--p-orange)" fontSize={size < 40 ? 9 : 11} fontWeight={700}>
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
      style={{
        width:          isOpen ? 300 : 0,
        minWidth:       isOpen ? 300 : 0,
        overflow:       'hidden',
        background:     'var(--p-panel)',
        borderRight:    '1px solid var(--p-border)',
        transition:     'width 0.25s ease, min-width 0.25s ease',
        display:        'flex',
        flexDirection:  'column',
        height:         'calc(100vh - 52px)',
        overflowY:      'auto',
        flexShrink:     0,
      }}
    >
      <div style={{ padding: '16px 0' }}>
        {entries.map((entry, ei) => {
          const completedCount = entry.items.filter(it => completedItemIds.includes(it.id)).length
          const pct            = entry.items.length > 0 ? (completedCount / entry.items.length) * 100 : 0
          const isExpanded     = expandedIdx === ei
          const isActive       = activeEntryIdx === ei

          return (
            <div key={entry.id}>
              {/* Accordion tab header */}
              <button
                onClick={() => toggleEntry(ei)}
                aria-expanded={isExpanded}
                aria-label={`${entry.num} — ${entry.title}`}
                style={{
                  width:        '100%',
                  textAlign:    'left',
                  background:   isActive ? 'var(--p-card2)' : 'transparent',
                  border:       'none',
                  borderLeft:   isActive ? '3px solid var(--p-orange)' : '3px solid transparent',
                  cursor:       'pointer',
                  padding:      '12px 16px',
                  display:      'flex',
                  flexDirection:'column',
                  gap:          6,
                  transition:   'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ProgressRing pct={pct} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, color: 'var(--p-muted)', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>
                      {entry.num} · {entry.audienceTag}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--p-cream)', fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.title}
                    </div>
                  </div>
                  <ChevronDown
                    size={14}
                    style={{ color: 'var(--p-gray)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}
                  />
                </div>
                <div style={{ fontSize: 10, color: 'var(--p-muted)', paddingLeft: 46 }}>
                  {completedCount}/{entry.items.length}{entry.totalTime ? ` · ${entry.totalTime}` : ''}
                </div>
              </button>

              {/* Expanded item list */}
              {isExpanded && (
                <div style={{ background: 'var(--p-bg)' }}>
                  {entry.items.map((item, ii) => {
                    const isDone   = completedItemIds.includes(item.id)
                    const isCurr   = isActive && activeItemIdx === ii

                    return (
                      <button
                        key={item.id}
                        onClick={(e) => { e.stopPropagation(); onSelectItem(ei, ii) }}
                        aria-label={`${item.num} ${item.title}${isDone ? ' — complete' : ''}`}
                        aria-current={isCurr ? 'true' : undefined}
                        style={{
                          width:      '100%',
                          textAlign:  'left',
                          background: isCurr ? 'var(--p-card2)' : 'transparent',
                          border:     'none',
                          borderLeft: isCurr ? '2px solid rgba(232,98,26,0.4)' : '2px solid transparent',
                          cursor:     'pointer',
                          padding:    '10px 16px 10px 20px',
                          display:    'flex',
                          alignItems: 'center',
                          gap:        12,
                          transition: 'background 0.15s',
                        }}
                      >
                        {/* Number / check circle */}
                        <div style={{
                          width:          24,
                          height:         24,
                          borderRadius:   '50%',
                          border:         `1px solid ${isDone ? 'var(--p-orange)' : 'var(--p-border2)'}`,
                          background:     isDone ? 'var(--p-orange)' : 'transparent',
                          display:        'flex',
                          alignItems:     'center',
                          justifyContent: 'center',
                          fontSize:       10,
                          fontWeight:     700,
                          color:          isDone ? '#fff' : 'var(--p-gray)',
                          flexShrink:     0,
                        }}>
                          {isDone ? '✓' : item.num}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: isCurr ? 'var(--p-cream)' : 'var(--p-cream-dim)', fontWeight: isCurr ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title}
                          </div>
                          {item.duration && (
                            <div style={{ fontSize: 10, color: 'var(--p-muted)', marginTop: 2 }}>{item.duration}</div>
                          )}
                        </div>

                        {/* Badges */}
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          {item.isPreview && (
                            <span style={{ fontSize: 8, padding: '2px 6px', background: 'rgba(232,98,26,0.15)', color: 'var(--p-orange)', border: '1px solid var(--p-orange-mid)', borderRadius: 4, fontWeight: 700, letterSpacing: '0.08em' }}>FREE</span>
                          )}
                          {item.isQuiz && (
                            <span style={{ fontSize: 8, padding: '2px 6px', background: 'rgba(201,168,76,0.15)', color: 'var(--p-gold)', border: '1px solid var(--p-gold-dim)', borderRadius: 4, fontWeight: 700, letterSpacing: '0.08em' }}>QUIZ</span>
                          )}
                          {item.hasReflection && (
                            <span style={{ fontSize: 8, padding: '2px 6px', background: 'rgba(232,98,26,0.1)', color: 'var(--p-orange)', border: '1px solid var(--p-orange-dim)', borderRadius: 4, fontWeight: 700, letterSpacing: '0.08em' }}>REFLECT</span>
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
      <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', left: -9999, top: 0 }} id="player-announcer" />
    </nav>
  )
}
