'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useConstellationScene } from './constellationScene'
import styles from './hero.module.css'

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
  useConstellationScene(canvasRef, progressRef, reduceMotion)

  useEffect(() => {
    progressRef.current = scrollYProgress.get()
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
  const brainVisibility = useTransform(scrollYProgress, v => v < 0.20 ? 'visible' : 'hidden')
  const bulbVisibility = useTransform(scrollYProgress, v => v > 0.56 && v < 0.78 ? 'visible' : 'hidden')
  const orbVisibility = useTransform(scrollYProgress, v => v > 0.87 ? 'visible' : 'hidden')

  const scatterOpacity = useTransform(scrollYProgress, [0.24, 0.30, 0.44, 0.50], [0, 1, 1, 0])
  const scatterVisibility = useTransform(scrollYProgress, v => v > 0.24 && v < 0.50 ? 'visible' : 'hidden')
  const scatterY = useTransform(scrollYProgress, [0.24, 0.50], [60, -60])

  const leftScrim = useTransform(scrollYProgress, [0, 0.16, 0.20, 0.24], [1, 1, 1, 0])
  const rightScrim = useTransform(scrollYProgress, [0.50, 0.56, 0.90, 1], [0, 1, 1, 1])

  return (
    <section ref={wrapperRef} className={`${styles.hero} relative ${reduceMotion ? '' : 'h-[480svh]'}`}>
      <div className={`${styles.frame} ${reduceMotion ? 'relative' : 'sticky top-0'} overflow-hidden`}>

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
          style={{ opacity: reduceMotion ? 1 : brainOpacity, pointerEvents: reduceMotion ? 'auto' : brainPointerEvents, visibility: reduceMotion ? 'visible' : brainVisibility }}
          className={`${styles.copy} absolute inset-0 flex items-end lg:items-center px-6 md:px-14`}
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className={styles.introCopy}>
              <div className={`${styles.eyebrow} label`}>The Architecture of Reality</div>
              <h1 className={`${styles.title} font-display`}>
                BUILD{' '}<br className={styles.firstBreak} />
                YOUR<br />
                <span className="text-orange">REALITY.</span>
              </h1>
              <p className={`${styles.description} font-body max-w-[480px]`}>
                Where neuroscience meets Neville Goddard. Rewire the assumptions running underneath your life through structured courses, nightly revision journaling, and a community that gets it — then watch the outer world catch up.
              </p>
              <div className={`${styles.actions} flex gap-3`}>
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
          style={{ opacity: reduceMotion ? 0 : scatterOpacity, y: scatterY, visibility: reduceMotion ? 'hidden' : scatterVisibility }}
          className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none"
          aria-hidden={reduceMotion}
        >
          <div className="max-w-2xl text-center bg-black/40 p-6 md:p-10">
            <div className={`${styles.eyebrow} label`}>From Scattered Thoughts to Clarity</div>
            <p className={`${styles.scatterSentence} font-body text-white`}>
              Your assumptions shape the world you see.
              Change the pattern, and a new reality begins to take form.
            </p>
          </div>
        </motion.div>

        {/* Stage 2 — lightbulb: insight copy, right column */}
        <motion.div
          style={{ opacity: reduceMotion ? 0 : bulbOpacity, pointerEvents: reduceMotion ? 'none' : bulbPointerEvents, visibility: reduceMotion ? 'hidden' : bulbVisibility }}
          className={`${styles.copy} absolute inset-0 flex items-end lg:items-center px-6 md:px-14`}
        >
          <div className="max-w-7xl mx-auto w-full flex justify-end">
            <div className="max-w-md text-left lg:text-right">
              <div className="font-mono text-xs tracking-[0.3em] uppercase text-orange mb-4">
                Your Mind, Mapped
              </div>
              <h2 className={`${styles.insightTitle} font-display mb-6`}>
                EVERY ASSUMPTION<br />
                <span className="text-orange">IS A SPARK.</span>
              </h2>
              <p className="font-body text-base italic text-[#B5BBC4] leading-relaxed">
                Every point is an assumption you are running. Change enough of them and the whole pattern resolves into a different life.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stage 3 — orb: stats, right column */}
        <motion.div
          style={{ opacity: reduceMotion ? 0 : orbOpacity, pointerEvents: reduceMotion ? 'none' : orbPointerEvents, visibility: reduceMotion ? 'hidden' : orbVisibility }}
          className={`${styles.copy} absolute inset-0 flex items-end lg:items-center px-6 md:px-14`}
        >
          <div className="max-w-7xl mx-auto w-full flex justify-end">
            <div className={`${styles.stats} grid grid-cols-2 gap-x-8 gap-y-8 max-w-md`}>
              {STATS.map((s) => (
                <div key={s.label} className="border-t border-orange/30 pt-5">
                  <span className="font-display text-5xl text-orange block leading-none mb-2">
                    {s.num}
                  </span>
                  <span className={`${styles.statLabel} font-mono tracking-[0.15em] uppercase text-grey-light block mb-1`}>
                    {s.label}
                  </span>
                  <span className={`${styles.statDescription} font-body text-[#B5BBC4]`}>
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
