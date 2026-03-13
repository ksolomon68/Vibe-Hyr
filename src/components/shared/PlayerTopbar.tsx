'use client'

import Link from 'next/link'
import { Menu, ChevronLeft, ChevronRight, PanelRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PlayerTopbarProps {
  vertical: 'personal' | 'educators' | 'business'
  verticalLabel: string      // 'PERSONAL' | 'EDUCATORS' | 'BUSINESS'
  contentTitle: string       // current course/program/track name
  completionPct: number      // 0–100
  onToggleSidebar: () => void
  breadcrumb?: {
    label: string
    href: string
  }
}

export function PlayerTopbar({
  vertical,
  verticalLabel,
  contentTitle,
  completionPct,
  onToggleSidebar,
  breadcrumb
}: PlayerTopbarProps) {
  const pct = Math.min(100, Math.max(0, Math.round(completionPct)))

  return (
    <header 
      className="h-[64px] bg-[#0E0C08] border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 relative z-30"
      aria-label="Player navigation"
    >
      {/* Skip nav */}
      <a href="#main-content" className="skip-nav sr-only">Skip to content</a>

      {/* Left: back + breadcrumb */}
      <div className="flex items-center gap-4 min-w-0">
        <Link href="/" className="font-display text-xl tracking-widest text-[#E8621A] hover:opacity-80 transition-opacity hidden sm:block">
          VIBE<span className="text-white">HYR</span>
        </Link>
        <span className="text-white/10 text-xs flex-shrink-0 hidden sm:block">/</span>
        
        {breadcrumb && (
          <>
            <Link
              href={breadcrumb.href}
              className="flex items-center gap-2 text-white/40 hover:text-[#E8621A] transition-colors flex-shrink-0"
            >
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase hidden md:block">
                {breadcrumb.label}
              </span>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase md:hidden">
                Overview
              </span>
            </Link>
            <span className="text-white/10 text-xs flex-shrink-0">/</span>
          </>
        )}

        <span className="font-mono text-[0.65rem] tracking-[0.15em] text-white/90 truncate max-w-[200px] md:max-w-none uppercase">
          {contentTitle}
        </span>
      </div>

      {/* Center: progress bar (desktop only) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-4">
        <div className="w-40 h-[2px] bg-white/5 relative rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-[#E8621A] transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-[#E8621A] font-bold">
          {pct}%
        </span>
      </div>

      {/* Right: toggle sidebar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="text-white/40 hover:text-[#E8621A] transition-colors p-2 hover:bg-white/5 rounded-lg"
          aria-label="Toggle sidebar"
        >
          <PanelRight size={20} />
        </button>
      </div>
    </header>
  )
}
