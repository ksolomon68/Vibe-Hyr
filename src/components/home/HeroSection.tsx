'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useConstellationScene } from './constellationScene'

const STATS = [
  { num: '4',  label: 'Core Courses',      desc: 'RAS → SATS → Echo Theory' },
  { num: '3',  label: 'Membership Tiers',  desc: 'Free · $19 · $29 / mo' },
  { num: '5+', label: 'Diagnostic Tools',  desc: 'Identity Audit, Assumption Lab' },
  { num: '∞',  label: 'Reality Potential', desc: 'Rewritten one assumption at a time' },
]

/** Opacity curve for a copy block that holds fully visible between
    [holdStart, holdEnd] and fades in/out just outside that window. */
function holdRange(holdStart: number, holdEnd: number, fade = 0.04) {
  return [Math.max(0, holdStart - fade), holdStart, holdEnd, Math.min(1, holdEnd + fade)] as [number, number, number, number]
}

export function HeroSection() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)

  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ['start start', 'end end'] })
  useConstellationScene(canvasRef, progressRef)

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      progressRef.current = v
    })
    return unsub
  }, [scrollYProgress])

  const brainOpacity = useTransform(scrollYProgress, holdRange(0, 0.24), [1, 1, 1, 0])
  const bulbOpacity = useTransform(scrollYProgress, holdRange(0.42, 0.64), [0, 1, 1, 0])
  const orbOpacity = useTransform(scrollYProgress, holdRange(0.82, 1.0, 0.03), [0, 1, 1, 1])

  const brainPointerEvents = useTransform(scrollYProgress, [0, 0.24, 0.28], ["auto" as const, "auto" as const, "none" as const])
  const bulbPointerEvents = useTransform(scrollYProgress, [0.38, 0.42, 0.64, 0.68], ["none" as const, "auto" as const, "auto" as const, "none" as const])
  const orbPointerEvents = useTransform(scrollYProgress, [0.79, 0.82, 1.0], ["none" as const, "auto" as const, "auto" as const])

  const leftScrim = useTransform(scrollYProgress, [0, 0.3, 0.38, 0.42], [1, 1, 1, 0])
  const rightScrim = useTransform(scrollYProgress, [0.3, 0.38, 1, 1], [0, 1, 1, 1])

  return (
    <section ref={wrapperRef} className="relative h-[340vh]">
      <div className="sticky top-0 h-screen overflow-hidden dark-section-persistent">

        {/* Neural constellation — real WebGL point cloud (brain → lightbulb → orb) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        />

        {/* Legibility scrims, cross-faded to whichever side copy is on */}
        <motion.div
          className="absolute inset-0 pointer-events-none hidden lg:block"
          style={{
            opacity: leftScrim,
            background: 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.85) 22%, rgba(0,0,0,0.3) 42%, rgba(0,0,0,0) 56%)',
          }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute inset-0 pointer-events-none hidden lg:block"
          style={{
            opacity: rightScrim,
            background: 'linear-gradient(270deg, #000 0%, rgba(0,0,0,0.85) 22%, rgba(0,0,0,0.3) 42%, rgba(0,0,0,0) 56%)',
          }}
          aria-hidden="true"
        />

        {/* Stage 1 — brain: full hero copy, left column, visible on load */}
        <motion.div
          style={{ opacity: brainOpacity, pointerEvents: brainPointerEvents }}
          className="absolute inset-0 flex items-center px-6 md:px-14"
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className="max-w-xl">
              <div className="label mb-6">The Architecture of Reality</div>
              <h1 className="font-display text-[clamp(4rem,9vw,8rem)] leading-[0.92] tracking-[0.02em] mb-8">
                BUILD<br />
                YOUR<br />
                <span className="text-orange-DEFAULT">REALITY.</span>
              </h1>
              <p className="font-body text-lg text-grey-DEFAULT max-w-[480px] leading-relaxed mb-10">
                Where neuroscience meets Neville Goddard. Rewire the assumptions running underneath your life through structured courses, nightly revision journaling, and a community that gets it — then watch the outer world catch up.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/auth/signup" className="btn-orange flex items-center gap-2">
                  Start Free <ArrowRight size={14} />
                </Link>
                <Link href="/personal" className="btn-outline">
                  Explore Courses
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stage 2 — lightbulb: insight copy, right column */}
        <motion.div
          style={{ opacity: bulbOpacity, pointerEvents: bulbPointerEvents }}
          className="absolute inset-0 flex items-center px-6 md:px-14"
        >
          <div className="max-w-7xl mx-auto w-full flex justify-end">
            <div className="max-w-md text-left lg:text-right">
              <div className="font-mono text-[0.6rem] tracking-[0.35em] uppercase text-orange-DEFAULT mb-4">
                Your Mind, Mapped
              </div>
              <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-[0.02em] mb-6">
                EVERY ASSUMPTION<br />
                <span className="text-orange-DEFAULT">IS A SPARK.</span>
              </h2>
              <p className="font-body text-base italic text-grey-DEFAULT/90 leading-relaxed">
                Every point is an assumption you are running. Change enough of them and the whole pattern resolves into a different life.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stage 3 — orb: stats, right column */}
        <motion.div
          style={{ opacity: orbOpacity, pointerEvents: orbPointerEvents }}
          className="absolute inset-0 flex items-center px-6 md:px-14"
        >
          <div className="max-w-7xl mx-auto w-full flex justify-end">
            <div className="grid grid-cols-2 gap-x-10 gap-y-10 max-w-md">
              {STATS.map((s) => (
                <div key={s.label} className="border-t border-orange-DEFAULT/30 pt-5">
                  <span className="font-display text-5xl text-orange-DEFAULT block leading-none mb-2">
                    {s.num}
                  </span>
                  <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-grey-light block mb-1">
                    {s.label}
                  </span>
                  <span className="font-body text-xs text-grey-DEFAULT/70">
                    {s.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
