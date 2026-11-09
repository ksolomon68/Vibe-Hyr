'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useConstellationScene } from './constellationScene'

const STATS = [
  { num: '4',  label: 'Core Courses',      desc: 'RAS → SATS → Echo Theory' },
  { num: '3',  label: 'Membership Tiers',  desc: 'Free · $19 · $29 / mo' },
  { num: '5+', label: 'Diagnostic Tools',  desc: 'Identity Audit, Assumption Lab' },
  { num: '∞',  label: 'Reality Potential', desc: 'Rewritten one assumption at a time' },
]

const FEATURE_PREVIEW = [
  { num: '01', title: 'Structured Curriculum', desc: '4 progressive courses, quiz-gated' },
  { num: '02', title: 'Daily Revision Journal', desc: 'Nightly guided journaling & streaks' },
  { num: '03', title: 'Quizzes & Diagnostics',  desc: 'Identity Audit, Assumption Lab, more' },
]

// Each dot marks one hold window's center; keep in sync with KEYFRAMES in constellationScene.ts.
const SCROLL_STOPS = [0.08, 0.37, 0.67, 0.95]

/** Opacity curve for a copy block that holds fully visible between
    [holdStart, holdEnd] and fades in/out just outside that window. */
function holdRange(holdStart: number, holdEnd: number, fade = 0.04) {
  return [Math.max(0, holdStart - fade), holdStart, holdEnd, Math.min(1, holdEnd + fade)] as [number, number, number, number]
}

export function HeroSection() {
  const [reduceMotion, setReduceMotion] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
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

  const brainOpacity = useTransform(scrollYProgress, holdRange(0, 0.16), [1, 1, 1, 0])
  const bulbOpacity = useTransform(scrollYProgress, holdRange(0.60, 0.74), [0, 1, 1, 0])
  const orbOpacity = useTransform(scrollYProgress, holdRange(0.90, 1.0, 0.03), [0, 1, 1, 1])

  const brainPointerEvents = useTransform(scrollYProgress, [0, 0.16, 0.20], ["auto" as const, "auto" as const, "none" as const])
  const bulbPointerEvents = useTransform(scrollYProgress, [0.56, 0.60, 0.74, 0.78], ["none" as const, "auto" as const, "auto" as const, "none" as const])
  const orbPointerEvents = useTransform(scrollYProgress, [0.87, 0.90, 1.0], ["none" as const, "auto" as const, "auto" as const])

  const scatterOpacity = useTransform(scrollYProgress, [0.24, 0.30, 0.44, 0.50], [0, 1, 1, 0])
  const scatterY = useTransform(scrollYProgress, [0.24, 0.50], [60, -60])

  const leftScrim = useTransform(scrollYProgress, [0, 0.16, 0.20, 0.24], [1, 1, 1, 0])
  const rightScrim = useTransform(scrollYProgress, [0.50, 0.56, 0.90, 1], [0, 1, 1, 1])

  const cueOpacity = useTransform(scrollYProgress, [0, 0.03, 0.96, 1], [1, 1, 1, 0])

  return (
    <section ref={wrapperRef} className={`relative ${reduceMotion ? '' : 'h-[260svh]'}`}>
      <div className={`${reduceMotion ? 'relative' : 'sticky top-0'} h-[100svh] min-h-[720px] overflow-hidden dark-section-persistent`}>

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
          style={{ opacity: reduceMotion ? 1 : brainOpacity, pointerEvents: reduceMotion ? 'auto' : brainPointerEvents }}
          className="absolute inset-0 flex items-end pb-12 lg:pb-0 lg:items-center px-6 md:px-14"
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className="max-w-xl">
              <div className="label mb-6">The Architecture of Reality</div>
              <h1 className="font-display text-[clamp(4rem,9vw,8rem)] leading-[0.92] tracking-[0.02em] mb-8">
                BUILD<br />
                YOUR<br />
                <span className="text-orange">REALITY.</span>
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

        {/* The shape dissolves before the next idea takes form. */}
        <motion.div
          style={{ opacity: reduceMotion ? 0 : scatterOpacity, y: scatterY }}
          className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none"
        >
          <div className="max-w-2xl text-center bg-black/40 p-6 md:p-10">
            <div className="label mb-6">From Scattered Thoughts to Clarity</div>
            <p className="font-body text-2xl md:text-4xl leading-snug text-white">
              Your assumptions shape the world you see.
              Change the pattern, and a new reality begins to take form.
            </p>
          </div>
        </motion.div>

        {/* Stage 2 — lightbulb: insight copy, right column */}
        <motion.div
          style={{ opacity: reduceMotion ? 0 : bulbOpacity, pointerEvents: reduceMotion ? 'none' : bulbPointerEvents }}
          className="absolute inset-0 flex items-end pb-12 lg:pb-0 lg:items-center px-6 md:px-14"
        >
          <div className="max-w-7xl mx-auto w-full flex justify-end">
            <div className="max-w-md text-left">
              <div className="font-mono text-[0.6rem] tracking-[0.35em] uppercase text-orange mb-4">
                What You Get
              </div>
              <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-[0.02em] mb-6">
                A SYSTEM, NOT<br />
                <span className="text-orange">JUST A NOTION.</span>
              </h2>
              <div className="flex flex-col gap-4">
                {FEATURE_PREVIEW.map((f) => (
                  <div key={f.num} className="flex items-baseline gap-4 border-t border-orange/20 pt-3">
                    <span className="font-mono text-xs text-orange/70 shrink-0">{f.num}</span>
                    <div>
                      <div className="font-body text-sm text-white mb-0.5">{f.title}</div>
                      <div className="font-body text-xs text-grey-DEFAULT/70">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stage 3 — orb: stats, right column */}
        <motion.div
          style={{ opacity: reduceMotion ? 0 : orbOpacity, pointerEvents: reduceMotion ? 'none' : orbPointerEvents }}
          className="absolute inset-0 flex items-end pb-12 lg:pb-0 lg:items-center px-6 md:px-14"
        >
          <div className="max-w-7xl mx-auto w-full flex justify-end">
            <div className="grid grid-cols-2 gap-x-10 gap-y-10 max-w-md">
              {STATS.map((s) => (
                <div key={s.label} className="border-t border-orange/30 pt-5">
                  <span className="font-display text-5xl text-orange block leading-none mb-2">
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

        {/* Scroll cue + progress dots — tells visitors this section is scroll-driven and how far they are */}
        {!reduceMotion && (
          <motion.div
            style={{ opacity: cueOpacity }}
            className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3 pointer-events-none"
            aria-hidden="true"
          >
            <div className="flex items-center gap-2">
              {SCROLL_STOPS.map((center) => (
                <ScrollDot key={center} scrollYProgress={scrollYProgress} center={center} />
              ))}
            </div>
            <span className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-grey-DEFAULT/60">
              Scroll
            </span>
          </motion.div>
        )}

      </div>
    </section>
  )
}

function ScrollDot({ scrollYProgress, center }: { scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']; center: number }) {
  const scale = useTransform(scrollYProgress, [center - 0.1, center - 0.02, center + 0.02, center + 0.1], [1, 1.6, 1.6, 1])
  const opacity = useTransform(scrollYProgress, [center - 0.1, center - 0.02, center + 0.02, center + 0.1], [0.35, 1, 1, 0.35])
  return (
    <motion.span
      style={{ scale, opacity }}
      className="block w-1.5 h-1.5 rounded-full bg-orange"
    />
  )
}
