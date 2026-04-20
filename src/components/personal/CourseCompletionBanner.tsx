'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Crown, ArrowRight } from 'lucide-react'
import type { MembershipTier } from '@/types'
import { getNextCourseLesson01Path, getVerticalOverviewPath } from '@/lib/constants/courses'

interface CourseCompletionBannerProps {
  courseName:         string
  courseOrderIndex:   number
  userTier:           MembershipTier
  isLoggedIn:         boolean
  currentSlug:        string
  vertical:           string
  certificateNumber?: string   // auto-issued cert number
  shareToken?:        string   // cert share token
}

interface Particle {
  id:    number
  x:     number
  y:     number
  color: string
  size:  number
  delay: number
}

const COLORS = ['#E8621A', '#C9A84C', '#22c55e', '#F97316', '#F0EAE0']

function generateParticles(n: number): Particle[] {
  return Array.from({ length: n }, (_, i) => ({
    id:    i,
    x:     Math.random() * 100,
    y:     Math.random() * 100,
    color: COLORS[i % COLORS.length],
    size:  Math.random() * 6 + 4,
    delay: Math.random() * 0.8,
  }))
}

export function CourseCompletionBanner({
  courseName,
  courseOrderIndex,
  userTier,
  isLoggedIn,
  currentSlug,
  vertical,
  certificateNumber,
  shareToken,
}: CourseCompletionBannerProps) {
  const [visible,   setVisible]   = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setParticles(generateParticles(12))
    setVisible(true)
  }, [])

  // Upsell: Architect tier completing Course 3
  const showUpsell = userTier === 'architect' && courseOrderIndex === 3

  // Next course navigation — link directly to Lesson 01
  const nextPath     = getNextCourseLesson01Path(currentSlug, vertical)
  const fallbackPath = getVerticalOverviewPath(vertical)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="completion-banner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full overflow-hidden border-2 border-[#E8621A] bg-black rounded-xl px-8 py-8 mt-6 mb-2"
          style={{ background: 'linear-gradient(135deg,#0A0804 0%,#1A0E04 100%)' }}
        >
          {/* — Confetti particles — */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {particles.map(p => (
              <motion.span
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left:   `${p.x}%`,
                  top:    `${p.y}%`,
                  width:  p.size,
                  height: p.size,
                  background: p.color,
                }}
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1.4, 0.6], y: [0, -24, -40] }}
                transition={{ delay: p.delay, duration: 1.4, ease: 'easeOut' }}
              />
            ))}
          </div>

          {/* — Content — */}
          <div className="relative z-10 text-center">
            {/* Orange accent line */}
            <div className="w-16 h-1 bg-[#E8621A] mx-auto mb-6 rounded-full" />

            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 18 }}
              className="w-16 h-16 rounded-full bg-[#22c55e]/20 border-2 border-[#22c55e] flex items-center justify-center mx-auto mb-5"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <motion.path
                  d="M4 12l5 5L20 7"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
                />
              </svg>
            </motion.div>

            <p className="font-mono text-[0.58rem] tracking-[0.3em] uppercase text-[#E8621A] mb-2">
              Achievement Unlocked
            </p>
            <h2
              className="text-4xl md:text-5xl text-white mb-3 tracking-wider"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              COURSE COMPLETE
            </h2>
            <p className="font-body italic text-[#B8A89A] text-base max-w-md mx-auto leading-relaxed">
              You&apos;ve completed <strong className="text-white">{courseName}</strong>.
              {' '}Your reality is being architected.
            </p>

            {/* ── Certificate CTA ── */}
            {certificateNumber && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="mt-6 p-5 bg-[#C9A84C]/10 border border-[#C9A84C]/40 rounded-lg max-w-sm mx-auto"
              >
                <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-[#C9A84C] mb-1">
                  Your Certificate Is Ready
                </p>
                <p className="font-mono text-[0.58rem] text-[#888] mb-4">
                  {certificateNumber}
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <a
                    href="/dashboard/certificates"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E8621A] text-white font-bold text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
                  >
                    View Certificate
                  </a>
                  {shareToken && (
                    <a
                      href={`/certificate/${shareToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#C9A84C]/50 text-[#C9A84C] font-bold text-xs tracking-widest uppercase hover:bg-[#C9A84C]/10 transition-colors"
                    >
                      Share Certificate
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Explore Next Course CTA ── */}
            {!showUpsell && isLoggedIn && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="mt-8 flex justify-center"
              >
                <Link
                  href={nextPath ?? fallbackPath}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E8621A] text-white font-bold text-xs tracking-widest uppercase hover:bg-[#E8621A]/90 transition-colors"
                >
                  {nextPath ? 'Explore Next Course' : 'View All Courses'} <ArrowRight size={12} />
                </Link>
              </motion.div>
            )}

            {/* Upsell for Architect on Course 3 */}
            {showUpsell && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="mt-8 p-5 bg-[#C9A84C]/10 border border-[#C9A84C]/40 rounded-lg max-w-sm mx-auto"
              >
                <Crown size={18} className="text-[#C9A84C] mx-auto mb-2" />
                <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-[#C9A84C] mb-1">
                  Ready for More?
                </p>
                <p className="font-body text-sm text-[#D4C4B7] mb-4 leading-relaxed">
                  Unlock Course 4: Navigating the Echo Theory Delay
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C9A84C] text-black font-bold text-xs tracking-widest uppercase hover:bg-[#C9A84C]/90 transition-colors"
                >
                  Upgrade to Reality Master <ArrowRight size={12} />
                </Link>
              </motion.div>
            )}

            {!isLoggedIn && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6"
              >
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8621A] text-black font-bold text-xs tracking-widest uppercase rounded-lg hover:bg-[#E8621A]/90 transition-colors"
                >
                  Create Account to Save Progress
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
