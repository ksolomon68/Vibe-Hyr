'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'

export interface PlayerTopbarProps {
  vertical: 'personal' | 'educators' | 'business'
  verticalLabel: string      // 'PERSONAL' | 'EDUCATORS' | 'BUSINESS'
  contentTitle: string       // current course/program/track name
  completionPct: number      // 0–100
  onToggleSidebar: () => void
}

const TOPBAR: React.CSSProperties = {
  position:       'sticky',
  top:            0,
  zIndex:         100,
  height:         52,
  background:     'var(--p-bg-mid)',
  borderBottom:   '1px solid var(--p-border)',
  display:        'flex',
  alignItems:     'center',
  padding:        '0 16px',
  gap:            12,
}

export function PlayerTopbar({
  vertical,
  verticalLabel,
  contentTitle,
  completionPct,
  onToggleSidebar,
}: PlayerTopbarProps) {
  const pct = Math.min(100, Math.max(0, Math.round(completionPct)))

  return (
    <header style={TOPBAR} aria-label="Player navigation">
      {/* Skip nav */}
      <a href="#main-content" className="skip-nav">Skip to content</a>

      {/* Hamburger */}
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--p-gray)', padding: 6, display: 'flex', alignItems: 'center' }}
      >
        <Menu size={20} />
      </button>

      {/* Logo */}
      <Link
        href="https://vibehyr.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Vibe Hyr home"
        style={{ textDecoration: 'none' }}
      >
        <span style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", serif)', fontSize: 20, letterSpacing: '0.12em', color: 'var(--p-orange)', whiteSpace: 'nowrap' }}>
          VIBE HYR
        </span>
      </Link>

      {/* Divider */}
      <span style={{ color: 'var(--p-muted)', fontSize: 14 }}>/</span>

      {/* Vertical badge */}
      <span style={{
        fontSize:       9,
        padding:        '3px 10px',
        background:     'var(--p-orange-dim)',
        color:          'var(--p-orange)',
        border:         '1px solid var(--p-orange-mid)',
        borderRadius:   10,
        fontWeight:     700,
        letterSpacing:  '0.1em',
        whiteSpace:     'nowrap',
      }}>
        {verticalLabel}
      </span>

      {/* Divider */}
      <span style={{ color: 'var(--p-muted)', fontSize: 14 }}>/</span>

      {/* Content title */}
      <span style={{ fontSize: 12, color: 'var(--p-cream-dim)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
        {contentTitle}
      </span>

      {/* Spacer */}
      <span style={{ flex: 1 }} />

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 120, height: 3, background: 'var(--p-border)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height:     '100%',
            width:      `${pct}%`,
            background: 'linear-gradient(90deg, var(--p-orange), var(--p-gold))',
            borderRadius: 2,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--p-gray)', fontWeight: 600, minWidth: 30, textAlign: 'right' }}>{pct}%</span>
      </div>

      {/* Open App */}
      <Link href="https://vibehyr.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        <button
          aria-label="Open full Vibe Hyr app"
          style={{
            padding:       '7px 14px',
            background:    'var(--p-orange)',
            color:         '#fff',
            border:        'none',
            borderRadius:  8,
            fontSize:      12,
            fontWeight:    700,
            letterSpacing: '0.06em',
            cursor:        'pointer',
            display:       'flex',
            alignItems:    'center',
            gap:           4,
            whiteSpace:    'nowrap',
          }}
        >
          Open App ↗
        </button>
      </Link>
    </header>
  )
}
