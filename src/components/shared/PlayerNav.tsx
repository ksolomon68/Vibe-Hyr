'use client'

import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface PlayerNavProps {
  onPrev?:     () => void
  onNext?:     () => void
  onComplete?: () => void
  hasPrev:     boolean
  hasNext:     boolean
  isComplete:  boolean
  /** 'lesson' for quiz-gated verticals (Personal), 'module' for reflection verticals (Educators/Business) */
  mode?: 'lesson' | 'module'
}

const BTN_BASE: React.CSSProperties = {
  display:       'flex',
  alignItems:    'center',
  gap:           6,
  padding:       '10px 20px',
  border:        '1px solid var(--p-border)',
  borderRadius:  8,
  background:    'transparent',
  color:         'var(--p-cream-dim)',
  fontSize:      12,
  fontWeight:    700,
  letterSpacing: '0.06em',
  cursor:        'pointer',
  transition:    'all 0.15s ease',
}

const BTN_ORANGE: React.CSSProperties = {
  ...BTN_BASE,
  background:   'var(--p-orange)',
  border:       '1px solid var(--p-orange)',
  color:        '#fff',
}

export function PlayerNav({ onPrev, onNext, onComplete, hasPrev, hasNext, isComplete, mode = 'lesson' }: PlayerNavProps) {
  const completeLabel = isComplete
    ? '✓ Complete'
    : mode === 'module'
    ? 'Complete Module →'
    : 'Mark Complete ✓'

  return (
    <div style={{
      display:         'flex',
      justifyContent:  'space-between',
      alignItems:      'center',
      borderTop:       '1px solid var(--p-border)',
      paddingTop:      24,
      marginTop:       32,
      gap:             12,
    }}>
      {/* Prev */}
      <button
        style={{ ...BTN_BASE, opacity: hasPrev ? 1 : 0.3 }}
        onClick={onPrev}
        disabled={!hasPrev}
        aria-label="Previous lesson"
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      {/* Complete */}
      {onComplete && (
        <button
          style={{ ...BTN_ORANGE, gap: 8, opacity: isComplete ? 0.7 : 1 }}
          onClick={onComplete}
          disabled={isComplete}
          aria-label={isComplete ? 'Already complete' : 'Mark as complete'}
        >
          {isComplete && <Check size={14} />}
          {completeLabel}
        </button>
      )}

      {/* Next */}
      <button
        style={{ ...BTN_BASE, opacity: hasNext ? 1 : 0.3 }}
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Next lesson"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
