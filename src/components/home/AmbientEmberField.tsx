'use client'

import { useEffect, useRef } from 'react'

/* ──────────────────────────────────────────────────────────────
   AMBIENT EMBER FIELD
   A sparse, slow-drifting scatter of outlined triangle sparks,
   fixed behind the whole home page so the void reads as one
   continuous "constellation on black velvet" surface rather than
   the particle effect living only in the hero viewport. Very low
   density and opacity — it should read as atmosphere, never
   compete with copy or the hero's own denser brain constellation.
   Same brand-locked palette as HeroSection: orange family, gold,
   muted beige, rare cream — no violets, no full-spectrum colour.
   ────────────────────────────────────────────────────────────── */

const EMBER_COLORS = [
  '#E8621A', '#E8621A', '#E8621A',
  '#F07840', '#F07840',
  '#F59060',
  '#EAB308',
  '#C9A84C',
  '#dfbd8b',
]

type Ember = {
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
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

function makeEmber(x: number, y: number): Ember {
  return {
    x,
    y,
    size: rand(1, 2.2),
    color: EMBER_COLORS[(Math.random() * EMBER_COLORS.length) | 0],
    alpha: rand(0.06, 0.22),
    rot: Math.random() * Math.PI * 2,
    rotSpeed: rand(-0.0003, 0.0003),
    phase: Math.random() * Math.PI * 2,
    driftX: rand(5, 16),
    driftY: rand(5, 16),
    driftSpeed: rand(0.00008, 0.00028),
    twinkle: rand(0.0003, 0.0012),
    filled: Math.random() < 0.12,
  }
}

export function AmbientEmberField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = el.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let embers: Ember[] = []
    let width = 0
    let height = 0
    let raf = 0

    function resize() {
      if (!el || !ctx) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      el.width = Math.round(width * dpr)
      el.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.max(30, Math.min(90, Math.round((width * height) / 22000)))
      embers = Array.from({ length: count }, () => makeEmber(Math.random() * width, Math.random() * height))
    }

    function drawTriangle(e: Ember, x: number, y: number, alpha: number) {
      if (!ctx) return
      ctx.globalAlpha = alpha
      ctx.beginPath()
      for (let k = 0; k < 3; k++) {
        const a = e.rot + (k * Math.PI * 2) / 3 - Math.PI / 2
        const px = x + Math.cos(a) * e.size
        const py = y + Math.sin(a) * e.size
        if (k === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      if (e.filled) {
        ctx.fillStyle = e.color
        ctx.fill()
      } else {
        ctx.strokeStyle = e.color
        ctx.stroke()
      }
    }

    function render(t: number) {
      if (!ctx || width < 2 || height < 2) return
      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = 1
      for (const e of embers) {
        const drift = t * e.driftSpeed + e.phase
        const x = e.x + Math.sin(drift) * e.driftX
        const y = e.y + Math.cos(drift * 0.8) * e.driftY
        const flicker = 0.55 + 0.45 * Math.sin(t * e.twinkle + e.phase)
        e.rot += e.rotSpeed * 16
        drawTriangle(e, x, y, e.alpha * flicker)
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
      render(0)
    } else {
      raf = requestAnimationFrame(frame)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 w-screen h-screen pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    />
  )
}
