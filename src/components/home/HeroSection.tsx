'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

const STATS = [
  { num: '4',  label: 'Core Courses',      desc: 'RAS → SATS → Echo Theory' },
  { num: '3',  label: 'Membership Tiers',  desc: 'Free · $19 · $29 / mo' },
  { num: '5+', label: 'Diagnostic Tools',  desc: 'Identity Audit, Assumption Lab' },
  { num: '∞',  label: 'Reality Potential', desc: 'Rewritten one assumption at a time' },
]

/* ──────────────────────────────────────────────────────────────
   NEURAL CONSTELLATION
   Thousands of tiny outlined triangles forming an organic brain
   shape on pure black, plus an ambient drifting particle field.
   Palette is locked to the Vibe Hyr brand: orange family, gold,
   muted beige, and a handful of cream sparks. No violets, no
   full-spectrum colour — the void stays black, the accent stays
   orange.
   ────────────────────────────────────────────────────────────── */

/* Weighted by repetition — orange dominates, gold accents, rare cream sparks */
const PARTICLE_COLORS = [
  '#E8621A', '#E8621A', '#E8621A', '#E8621A',
  '#F07840', '#F07840', '#F07840',
  '#F59060', '#F59060',
  '#FFB86B',
  '#EAB308',
  '#C9A84C',
  '#dfbd8b',
  '#FFFFFF',
]

/* The mask is authored on a 200×160 grid and rasterised at 2× */
const GRID_W = 200
const GRID_H = 160
const MASK_W = GRID_W * 2
const MASK_H = GRID_H * 2

/* Gyri — the fold network that gives the cloud its neural read.
   Bands follow the curve of the cerebrum, connectors cross them. */
const GYRI: number[][][] = [
  // Bands arcing with the dome, outermost first
  [[26, 76], [32, 52], [50, 32], [78, 24], [106, 26], [128, 36], [144, 54], [151, 76]],
  [[31, 95], [38, 72], [56, 56], [80, 49], [104, 52], [124, 63], [135, 80], [138, 98]],
  [[38, 110], [48, 93], [66, 82], [88, 79], [109, 84], [123, 97], [128, 112]],
  [[50, 121], [66, 111], [86, 107], [104, 112], [115, 121]],
  // Connectors running down through the bands
  [[62, 28], [57, 50], [64, 72], [58, 94], [65, 116]],
  [[92, 22], [97, 46], [90, 69], [97, 92], [92, 114]],
  [[122, 29], [129, 53], [122, 75], [131, 96], [124, 112]],
  [[148, 44], [157, 63], [155, 84], [145, 101]],
  [[38, 60], [30, 80], [36, 100], [30, 114]],
  // Diagonal folds break the symmetry so the mass reads organic
  [[46, 46], [68, 60], [86, 46], [106, 62], [124, 50]],
  [[68, 90], [88, 102], [106, 92], [124, 104]],
  [[76, 36], [90, 52], [110, 44], [126, 60]],
  // Cerebellum ridges
  [[110, 121], [123, 114], [136, 116], [146, 123]],
  [[106, 130], [118, 125], [131, 128], [141, 133]],
  // Brain stem
  [[93, 126], [92, 136], [87, 141]],
]

/** Smooth curve through a list of points (quadratic midpoint interpolation). */
function curveThrough(c: CanvasRenderingContext2D, pts: number[][]) {
  if (pts.length < 2) return
  c.beginPath()
  c.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2
    const my = (pts[i][1] + pts[i + 1][1]) / 2
    c.quadraticCurveTo(pts[i][0], pts[i][1], mx, my)
  }
  const last = pts[pts.length - 1]
  c.lineTo(last[0], last[1])
  c.stroke()
}

function traceBrain(c: CanvasRenderingContext2D) {
  c.beginPath()
  c.moveTo(20, 70)
  c.bezierCurveTo(15, 34, 46, 12, 76, 15)     // frontal lobe, up and over
  c.bezierCurveTo(106, 8, 141, 20, 156, 46)   // crown
  c.bezierCurveTo(173, 69, 170, 91, 150, 106) // occipital
  c.bezierCurveTo(146, 121, 130, 129, 112, 124) // cerebellum
  c.bezierCurveTo(106, 138, 96, 141, 88, 132)   // brain stem
  c.bezierCurveTo(70, 141, 45, 133, 30, 116)    // underside
  c.bezierCurveTo(18, 106, 14, 88, 20, 70)      // back to the front
  c.closePath()
}

/** Renders the brain offscreen and returns its alpha map. */
function buildBrainMask(): Uint8ClampedArray | null {
  const off = document.createElement('canvas')
  off.width = MASK_W
  off.height = MASK_H
  const c = off.getContext('2d', { willReadFrequently: true })
  if (!c) return null

  c.scale(MASK_W / GRID_W, MASK_H / GRID_H)
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.strokeStyle = '#fff'
  c.fillStyle = '#fff'

  // Body — a whisper of interior fill so the mass isn't hollow
  c.globalAlpha = 0.17
  traceBrain(c)
  c.fill()

  // Silhouette rim — soft, so the shape emerges from density rather than
  // reading as a drawn outline
  c.globalAlpha = 0.6
  c.lineWidth = 3.4
  traceBrain(c)
  c.stroke()

  // Gyri — the densest structure, where the constellation concentrates
  c.globalAlpha = 1
  c.lineWidth = 4.6
  for (const fold of GYRI) curveThrough(c, fold)

  return c.getImageData(0, 0, MASK_W, MASK_H).data
}

type Particle = {
  x: number
  y: number
  size: number
  color: string
  alpha: number
  rot: number
  rotSpeed: number
  phase: number
  driftX: number
  driftY: number
  driftSpeed: number
  twinkle: number
  filled: boolean
  depth: number
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

function makeParticle(x: number, y: number, ambient: boolean): Particle {
  return {
    x,
    y,
    size: ambient ? rand(1.1, 2.4) : rand(1.3, 3.4),
    color: PARTICLE_COLORS[(Math.random() * PARTICLE_COLORS.length) | 0],
    alpha: ambient ? rand(0.1, 0.34) : rand(0.32, 0.95),
    rot: Math.random() * Math.PI * 2,
    rotSpeed: rand(-0.0004, 0.0004),
    phase: Math.random() * Math.PI * 2,
    driftX: ambient ? rand(4, 14) : rand(1.5, 6),
    driftY: ambient ? rand(4, 14) : rand(1.5, 6),
    driftSpeed: rand(0.00012, 0.00042),
    twinkle: rand(0.0004, 0.0016),
    filled: Math.random() < 0.16,
    depth: ambient ? rand(0.3, 1) : rand(0.15, 0.6),
  }
}

type Box = { x: number; y: number; w: number; h: number }
type Field = { particles: Particle[] }

function buildField(w: number, h: number, stage: Box, mask: Uint8ClampedArray): Field {
  const particles: Particle[] = []

  // Fit the brain inside the stage without distorting it
  const scale = Math.min(stage.w / MASK_W, stage.h / MASK_H)
  const boxW = MASK_W * scale
  const boxH = MASK_H * scale
  const boxX = stage.x + (stage.w - boxW) / 2
  const boxY = stage.y + (stage.h - boxH) / 2

  const target = Math.max(420, Math.min(1500, Math.round((boxW * boxH) / 150)))
  let placed = 0
  let attempts = 0
  const maxAttempts = target * 60

  while (placed < target && attempts < maxAttempts) {
    attempts++
    const u = Math.random()
    const v = Math.random()
    const mx = Math.min(MASK_W - 1, (u * MASK_W) | 0)
    const my = Math.min(MASK_H - 1, (v * MASK_H) | 0)
    const a = mask[(my * MASK_W + mx) * 4 + 3] / 255
    // Cubic weighting pushes the cloud onto the gyri and rim, leaving the
    // interior sparse — the structure is what reads, not the mass
    if (a < 0.04 || Math.random() > a * a * a) continue
    placed++
    const p = makeParticle(boxX + u * boxW, boxY + v * boxH, false)
    p.alpha *= 0.5 + a * 0.6
    particles.push(p)
  }

  const ambient = Math.max(40, Math.min(170, Math.round((w * h) / 9000)))
  for (let i = 0; i < ambient; i++) {
    particles.push(makeParticle(Math.random() * w, Math.random() * h, true))
  }

  return { particles }
}

function useNeuralConstellation(
  ref: React.RefObject<HTMLCanvasElement>,
  stageRef: React.RefObject<HTMLDivElement>,
) {
  useEffect(() => {
    if (!ref.current) return
    const rawCtx = ref.current.getContext('2d')
    if (!rawCtx) return
    const rawMask = buildBrainMask()
    if (!rawMask) return

    // Non-nullable aliases so the render closures below stay type-safe
    const el: HTMLCanvasElement = ref.current
    const ctx: CanvasRenderingContext2D = rawCtx
    const mask: Uint8ClampedArray = rawMask

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(pointer: fine)').matches

    let field: Field | null = null
    let width = 0
    let height = 0
    let raf = 0

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

    /** Where the brain sits: the measured stage element, or a centred
        fallback box behind the copy on narrow screens. */
    function stageBox(): Box {
      const stage = stageRef.current
      if (stage && stage.offsetParent !== null) {
        const s = stage.getBoundingClientRect()
        const c = el.getBoundingClientRect()
        if (s.width > 40 && s.height > 40) {
          return { x: s.left - c.left, y: s.top - c.top, w: s.width, h: s.height }
        }
      }
      const w = width * 0.96
      const h = height * 0.58
      return { x: (width - w) / 2, y: height * 0.5 - h / 2, w, h }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = el.offsetWidth || 1200
      height = el.offsetHeight || 800
      el.width = Math.round(width * dpr)
      el.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      field = buildField(width, height, stageBox(), mask)
    }

    function drawTriangle(p: Particle, x: number, y: number, alpha: number) {
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
      if (!field || width < 2 || height < 2) return
      // No bloom, no wash — the void stays pure black and the particles
      // are the only light in the section
      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = 1

      pointer.x += (pointer.tx - pointer.x) * 0.05
      pointer.y += (pointer.ty - pointer.y) * 0.05

      for (const p of field.particles) {
        const drift = t * p.driftSpeed + p.phase
        const x = p.x + Math.sin(drift) * p.driftX + pointer.x * p.depth
        const y = p.y + Math.cos(drift * 0.8) * p.driftY + pointer.y * p.depth
        const flicker = 0.62 + 0.38 * Math.sin(t * p.twinkle + p.phase)
        p.rot += p.rotSpeed * 16
        drawTriangle(p, x, y, p.alpha * flicker)
      }

      ctx.globalAlpha = 1
    }

    function frame(t: number) {
      render(t)
      raf = requestAnimationFrame(frame)
    }

    const ro = new ResizeObserver(() => {
      resize()
      if (reduceMotion) render(0)
    })
    ro.observe(el)
    if (stageRef.current) ro.observe(stageRef.current)
    resize()

    function onPointerMove(e: PointerEvent) {
      const rect = el.getBoundingClientRect()
      pointer.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 26
      pointer.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 20
    }

    if (reduceMotion) {
      render(0)
    } else {
      raf = requestAnimationFrame(frame)
      if (finePointer) window.addEventListener('pointermove', onPointerMove, { passive: true })
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [ref, stageRef])
}

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  useNeuralConstellation(canvasRef, stageRef)

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden dark-section-persistent">

      {/* Neural constellation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Copy scrim — keeps the left column legible over the particle field */}
      <div
        className="absolute inset-0 pointer-events-none hidden lg:block"
        style={{
          background:
            'linear-gradient(90deg, #000000 0%, rgba(0,0,0,0.88) 20%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0) 54%)',
        }}
        aria-hidden="true"
      />
      {/* Fade into the section below */}
      <div
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000000 100%)' }}
        aria-hidden="true"
      />

      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT z-10" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-14 py-24 lg:py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="label mb-6"
            >
              The Architecture of Reality
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-[clamp(4rem,9vw,8rem)] leading-[0.92] tracking-[0.02em] mb-8"
            >
              BUILD<br />
              YOUR<br />
              <span className="text-orange-DEFAULT">REALITY.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-body text-lg text-grey-DEFAULT max-w-[480px] leading-relaxed mb-10"
            >
              Where neuroscience meets Neville Goddard. Rewire the assumptions running underneath your life through structured courses, nightly revision journaling, and a community that gets it — then watch the outer world catch up.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/auth/signup" className="btn-orange flex items-center gap-2">
                Start Free <ArrowRight size={14} />
              </Link>
              <Link href="/personal" className="btn-outline">
                Explore Courses
              </Link>
            </motion.div>
          </div>

          {/* Constellation stage — deliberately empty. The canvas measures
              this box and draws the particle brain inside it, so the
              constellation is the only imagery in the hero. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.4 }}
            className="flex flex-col"
          >
            <div ref={stageRef} className="w-full h-[clamp(15rem,44vw,26rem)]" aria-hidden="true" />
            <div className="text-left lg:text-right mt-6">
              <div className="font-mono text-[0.6rem] tracking-[0.35em] uppercase text-orange-DEFAULT mb-3">
                Your Mind, Mapped
              </div>
              <p className="font-body text-sm italic text-grey-DEFAULT/80 max-w-[20rem] lg:ml-auto leading-relaxed">
                Every point is an assumption you are running. Change enough of them and the whole pattern resolves into a different life.
              </p>
            </div>
          </motion.div>

        </div>

        {/* Stats — borderless, floating on the void so the field shows through */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 mt-16 lg:mt-12"
        >
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
        </motion.div>
      </div>

    </section>
  )
}
