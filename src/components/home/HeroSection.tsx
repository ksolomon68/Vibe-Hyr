'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

const STATS = [
  { num: '4',  label: 'Core Courses',      desc: 'RAS → SATS → Echo Theory' },
  { num: '3',  label: 'Membership Tiers',  desc: 'Free · $19 · $29 / mo' },
  { num: '5+', label: 'Diagnostic Tools',  desc: 'Identity Audit, Assumption Lab' },
  { num: '∞',  label: 'Reality Potential', desc: 'Rewritten one assumption at a time' },
]

/* ──────────────────────────────────────────────────────────────
   NEURAL CONSTELLATION — SCROLL STORY
   A pinned, scroll-driven particle field. The brain is fully formed
   on load — it's the hero image — then explodes and reforms into a
   lightbulb, then again into an orb, each shape carrying its own
   copy block (a radial "burst" plays at every shape-to-shape morph).
   Full-spectrum chromatic particles (violet, amber, teal, magenta,
   blue, white) against a pure black void — the constellation is the
   only light source, no bloom or wash.
   ────────────────────────────────────────────────────────────── */

const SPARK_COLORS = [
  '#8B5CF6', '#8B5CF6', '#8B5CF6',
  '#F0B429', '#F0B429', '#F0B429',
  '#14B8A6', '#14B8A6',
  '#E8621A', '#E8621A',
  '#EC4899',
  '#3B82F6',
  '#FFFFFF', '#FFFFFF',
]

/* Masks are authored on a square 200×200 grid, rasterised at 2× */
const GRID = 200
const MASK = GRID * 2

type Shape = 'chaos' | 'brain' | 'lightbulb' | 'orb'
type Home = { u: number; v: number }
type Box = { x: number; y: number; w: number; h: number }

function offscreen(): CanvasRenderingContext2D | null {
  const c = document.createElement('canvas')
  c.width = MASK
  c.height = MASK
  return c.getContext('2d', { willReadFrequently: true })
}

/* Front-on two-hemisphere brain (Lucide "Brain" glyph), same treatment as
   before: fill for mass, rim stroke, nested inward-scaled contours to
   simulate cortical folds, plus the icon's own interior fold lines. */
function buildBrainMask(): Uint8ClampedArray {
  const c = offscreen()!
  c.scale(MASK / GRID, MASK / GRID)
  const scale = (GRID * 0.86) / 24
  c.translate(GRID / 2 - 12 * scale, GRID / 2 - 11.5 * scale)
  c.scale(scale, scale)
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.strokeStyle = '#fff'
  c.fillStyle = '#fff'

  const hemis = [
    new Path2D('M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z'),
    new Path2D('M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z'),
  ]
  const folds = [
    'M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4',
    'M17.599 6.5a3 3 0 0 0 .399-1.375',
    'M6.003 5.125A3 3 0 0 0 6.401 6.5',
    'M3.477 10.896a4 4 0 0 1 .585-.396',
    'M19.938 10.5a4 4 0 0 1 .585.396',
    'M6 18a4 4 0 0 1-1.967-.516',
    'M19.967 17.484A4 4 0 0 1 18 18',
  ].map((d) => new Path2D(d))

  c.globalAlpha = 0.2
  for (const p of hemis) c.fill(p)
  c.globalAlpha = 0.75
  c.lineWidth = 0.55
  for (const p of hemis) c.stroke(p)
  c.globalAlpha = 0.9
  for (const s of [0.92, 0.82, 0.7, 0.56]) {
    c.save()
    c.translate(12, 11.5)
    c.scale(s, s)
    c.translate(-12, -11.5)
    c.lineWidth = 0.42 / s
    for (const p of hemis) c.stroke(p)
    c.restore()
  }
  c.globalAlpha = 1
  c.lineWidth = 0.5
  for (const p of folds) c.stroke(p)

  return c.getImageData(0, 0, MASK, MASK).data
}

/* Lightbulb glass (Lucide "Lightbulb" glyph, upper bulb only — the
   filament/base lines below become the fold detail), scaled up so the
   bulb dominates the frame the way the brain does. */
function buildLightbulbMask(): Uint8ClampedArray {
  const c = offscreen()!
  c.scale(MASK / GRID, MASK / GRID)
  const scale = (GRID * 1.55) / 24
  c.translate(GRID / 2 - 12 * scale, GRID / 2 - 10.5 * scale)
  c.scale(scale, scale)
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.strokeStyle = '#fff'
  c.fillStyle = '#fff'

  const bulb = new Path2D(
    'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5',
  )
  const base = ['M9 18h6', 'M10 22h4'].map((d) => new Path2D(d))

  c.globalAlpha = 0.22
  c.fill(bulb)
  c.globalAlpha = 0.78
  c.lineWidth = 0.6
  c.stroke(bulb)
  c.globalAlpha = 0.9
  for (const s of [0.9, 0.78, 0.64]) {
    c.save()
    c.translate(11, 9)
    c.scale(s, s)
    c.translate(-11, -9)
    c.lineWidth = 0.4 / s
    c.stroke(bulb)
    c.restore()
  }
  c.globalAlpha = 1
  c.lineWidth = 0.55
  for (const p of base) c.stroke(p)

  return c.getImageData(0, 0, MASK, MASK).data
}

/* Orb (Lucide "Globe" glyph) — a sphere with meridian + equator lines,
   plus nested inset rings so it carries the same layered-contour density
   as the other two shapes rather than reading as a flat ring of dots. */
function buildOrbMask(): Uint8ClampedArray {
  const c = offscreen()!
  c.scale(MASK / GRID, MASK / GRID)
  const scale = (GRID * 0.86) / 24
  c.translate(GRID / 2 - 12 * scale, GRID / 2 - 12 * scale)
  c.scale(scale, scale)
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.strokeStyle = '#fff'
  c.fillStyle = '#fff'

  const disc = new Path2D()
  disc.arc(12, 12, 10, 0, Math.PI * 2)
  const meridian = new Path2D('M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20')
  const equator = new Path2D('M2 12h20')

  c.globalAlpha = 0.2
  c.fill(disc)
  c.globalAlpha = 0.75
  c.lineWidth = 0.55
  c.stroke(disc)
  c.globalAlpha = 0.85
  for (const s of [0.85, 0.68, 0.5, 0.32]) {
    c.save()
    c.translate(12, 12)
    c.scale(s, s)
    c.translate(-12, -12)
    c.lineWidth = 0.4 / s
    c.stroke(disc)
    c.restore()
  }
  c.globalAlpha = 1
  c.lineWidth = 0.5
  c.stroke(meridian)
  c.stroke(equator)

  return c.getImageData(0, 0, MASK, MASK).data
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

/** Cubic-weighted rejection sampling onto a shape's alpha mask, producing
    N normalised (0..1) home points. Pads with uniform points if a sparse
    mask can't fill the quota — keeps particle count identical across
    every shape so the morph never gains or loses points mid-scroll. */
function sampleMask(mask: Uint8ClampedArray, n: number): Home[] {
  const pts: Home[] = []
  const maxAttempts = n * 80
  let attempts = 0
  while (pts.length < n && attempts < maxAttempts) {
    attempts++
    const mx = (Math.random() * MASK) | 0
    const my = (Math.random() * MASK) | 0
    const a = mask[(my * MASK + mx) * 4 + 3] / 255
    if (a < 0.04 || Math.random() > a * a * a) continue
    pts.push({ u: mx / MASK, v: my / MASK })
  }
  while (pts.length < n) pts.push({ u: Math.random(), v: Math.random() })
  return pts
}

type Particle = {
  homes: Record<Shape, Home>
  ambient: boolean
  size: number
  color: string
  baseAlpha: number
  rot: number
  rotSpeed: number
  phase: number
  twinkle: number
  filled: boolean
}

function buildParticles(structured: number, ambient: number): Particle[] {
  const brainMask = buildBrainMask()
  const bulbMask = buildLightbulbMask()
  const orbMask = buildOrbMask()

  const brainHomes = sampleMask(brainMask, structured)
  const bulbHomes = sampleMask(bulbMask, structured)
  const orbHomes = sampleMask(orbMask, structured)

  const particles: Particle[] = []

  for (let i = 0; i < structured; i++) {
    particles.push({
      homes: {
        chaos: { u: Math.random(), v: Math.random() },
        brain: brainHomes[i],
        lightbulb: bulbHomes[i],
        orb: orbHomes[i],
      },
      ambient: false,
      size: rand(1.2, 3.0),
      color: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0],
      baseAlpha: rand(0.35, 0.95),
      rot: Math.random() * Math.PI * 2,
      rotSpeed: rand(-0.0004, 0.0004),
      phase: Math.random() * Math.PI * 2,
      twinkle: rand(0.0004, 0.0016),
      filled: Math.random() < 0.16,
    })
  }

  for (let i = 0; i < ambient; i++) {
    const home = { u: Math.random(), v: Math.random() }
    particles.push({
      homes: { chaos: home, brain: home, lightbulb: home, orb: home },
      ambient: true,
      size: rand(1, 2.2),
      color: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0],
      baseAlpha: rand(0.08, 0.26),
      rot: Math.random() * Math.PI * 2,
      rotSpeed: rand(-0.0003, 0.0003),
      phase: Math.random() * Math.PI * 2,
      twinkle: rand(0.0003, 0.0012),
      filled: Math.random() < 0.1,
    })
  }

  return particles
}

/* Where each shape sits in the pinned viewport, as fractions. Desktop
   alternates left/right so the shape never sits under its own copy;
   mobile stacks everything into one centred column. */
const BOX_DESKTOP: Record<Shape, Box> = {
  chaos:     { x: 0,    y: 0,    w: 1,    h: 1 },
  brain:     { x: 0.48, y: 0.08, w: 0.47, h: 0.82 },
  lightbulb: { x: 0.05, y: 0.06, w: 0.42, h: 0.86 },
  orb:       { x: 0.08, y: 0.2,  w: 0.34, h: 0.62 },
}
const BOX_MOBILE: Record<Shape, Box> = {
  chaos:     { x: 0,    y: 0,    w: 1,    h: 1 },
  brain:     { x: 0.14, y: 0.04, w: 0.72, h: 0.46 },
  lightbulb: { x: 0.18, y: 0.02, w: 0.64, h: 0.5 },
  orb:       { x: 0.22, y: 0.06, w: 0.56, h: 0.4 },
}

const KEYFRAMES: { t: number; shape: Shape }[] = [
  { t: 0.0,  shape: 'brain' },
  { t: 0.24, shape: 'brain' },
  { t: 0.42, shape: 'lightbulb' },
  { t: 0.64, shape: 'lightbulb' },
  { t: 0.82, shape: 'orb' },
  { t: 1.0,  shape: 'orb' },
]

const smoothstep = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function useConstellationStory(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  progressRef: React.MutableRefObject<number>,
) {
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const ctx = el.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const structuredCount = window.innerWidth < 768 ? 650 : window.innerWidth < 1280 ? 950 : 1300
    const ambientCount = window.innerWidth < 768 ? 60 : 130
    const particles = buildParticles(structuredCount, ambientCount)

    let vw = 0
    let vh = 0
    let raf = 0
    let isMobile = window.innerWidth < 1024

    function resize() {
      if (!el || !ctx) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      vw = window.innerWidth
      vh = window.innerHeight
      el.width = Math.round(vw * dpr)
      el.height = Math.round(vh * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      isMobile = window.innerWidth < 1024
    }

    function currentShapes(t: number) {
      for (let i = 0; i < KEYFRAMES.length - 1; i++) {
        const a = KEYFRAMES[i]
        const b = KEYFRAMES[i + 1]
        if (t >= a.t && t <= b.t) {
          const localT = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t)
          return { shapeA: a.shape, shapeB: b.shape, localT: clamp01(localT) }
        }
      }
      return { shapeA: 'orb' as Shape, shapeB: 'orb' as Shape, localT: 0 }
    }

    function drawTriangle(p: Particle, x: number, y: number, alpha: number) {
      if (!ctx) return
      ctx.globalAlpha = alpha
      ctx.beginPath()
      for (let k = 0; k < 3; k++) {
        const a = p.rot + (k * Math.PI * 2) / 3 - Math.PI / 2
        const px = x + Math.cos(a) * p.size
        const py = y + Math.sin(a) * p.size
        if (k === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      if (p.filled) {
        ctx.fillStyle = p.color
        ctx.fill()
      } else {
        ctx.strokeStyle = p.color
        ctx.stroke()
      }
    }

    function render(t: number) {
      if (!ctx || vw < 2 || vh < 2) return
      ctx.clearRect(0, 0, vw, vh)
      ctx.lineWidth = 1

      const progress = progressRef.current
      const { shapeA, shapeB, localT } = currentShapes(progress)
      const eased = smoothstep(localT)
      const morphing = shapeA !== shapeB
      const boxes = isMobile ? BOX_MOBILE : BOX_DESKTOP
      const boxA = boxes[shapeA]
      const boxB = boxes[shapeB]
      const cx = vw / 2
      const cy = vh / 2

      for (const p of particles) {
        let x: number
        let y: number

        if (p.ambient) {
          const home = p.homes.chaos
          x = home.u * vw
          y = home.v * vh
        } else {
          const ha = p.homes[shapeA]
          const hb = p.homes[shapeB]
          const ax = (boxA.x + ha.u * boxA.w) * vw
          const ay = (boxA.y + ha.v * boxA.h) * vh
          const bx = (boxB.x + hb.u * boxB.w) * vw
          const by = (boxB.y + hb.v * boxB.h) * vh
          x = lerp(ax, bx, eased)
          y = lerp(ay, by, eased)

          if (morphing) {
            const dx = x - cx
            const dy = y - cy
            const len = Math.hypot(dx, dy) || 1
            const burst = Math.sin(Math.PI * eased) * 70
            x += (dx / len) * burst
            y += (dy / len) * burst
          }
        }

        if (!reduceMotion) {
          const drift = t * 0.00018 + p.phase
          x += Math.sin(drift) * (p.ambient ? 12 : 5)
          y += Math.cos(drift * 0.8) * (p.ambient ? 12 : 5)
        }

        const flicker = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(t * p.twinkle + p.phase)
        if (!reduceMotion) p.rot += p.rotSpeed * 16
        drawTriangle(p, x, y, p.baseAlpha * flicker)
      }

      ctx.globalAlpha = 1
    }

    function frame(t: number) {
      render(t)
      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)

    if (reduceMotion) {
      // Static render, re-drawn on scroll only — no continuous rAF loop.
      render(0)
      const onScroll = () => render(0)
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        window.removeEventListener('resize', resize)
        window.removeEventListener('scroll', onScroll)
      }
    }

    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [canvasRef, progressRef])
}

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
  useConstellationStory(canvasRef, progressRef)

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      progressRef.current = v
    })
    return unsub
  }, [scrollYProgress])

  const brainOpacity = useTransform(scrollYProgress, holdRange(0, 0.24), [1, 1, 1, 0])
  const bulbOpacity = useTransform(scrollYProgress, holdRange(0.42, 0.64), [0, 1, 1, 0])
  const orbOpacity = useTransform(scrollYProgress, holdRange(0.82, 1.0, 0.03), [0, 1, 1, 1])

  const leftScrim = useTransform(scrollYProgress, [0, 0.3, 0.38, 0.42], [1, 1, 1, 0])
  const rightScrim = useTransform(scrollYProgress, [0.3, 0.38, 1, 1], [0, 1, 1, 1])

  return (
    <section ref={wrapperRef} className="relative h-[340vh]">
      <div className="sticky top-0 h-screen overflow-hidden dark-section-persistent">

        {/* Neural constellation — brain → lightbulb → orb, brain visible on load */}
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
          style={{ opacity: brainOpacity }}
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
          style={{ opacity: bulbOpacity }}
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
          style={{ opacity: orbOpacity }}
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
