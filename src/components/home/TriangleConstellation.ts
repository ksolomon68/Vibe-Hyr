'use client'

import { useEffect } from 'react'

/* ─────────────────────────────────────────────────────────────
   DALA-STYLE TRIANGLE CONSTELLATION  (2D Canvas)
   – Tiny hollow outlined triangles + a few filled ones
   – Full rainbow/holographic palette: yellow, orange, purple, teal, white
   – Scroll-driven morph: brain cluster → scattered head silhouette
   – Ambient drifting triangles across the entire black void
   – Mouse parallax on the cluster
   ───────────────────────────────────────────────────────────── */

// Full-spectrum palette — orange/gold dominant, with purple and white accents
const COLORS = [
  '#EAB308', '#EAB308', '#EAB308',  // Gold/yellow (dominant)
  '#F59E0B', '#F07840',              // Amber/orange
  '#E8621A', '#E8621A',              // Brand orange
  '#FFFFFF', '#FFFFFF',              // White
  '#FFB86B', '#C9A84C',             // Light orange/gold
  '#A78BFA', '#8B5CF6', '#7C3AED', // Purple/violet
  '#F97316', '#FB923C',             // Extra oranges
]

const PI2 = Math.PI * 2

type Tri = {
  // Morph targets
  bx: number; by: number   // brain position
  hx: number; hy: number   // head position
  // Animation
  driftX: number; driftY: number; driftSpd: number; phase: number
  // Visuals
  size: number; color: string; rot: number; rotSpd: number
  alpha: number; filled: boolean
  isAmbient: boolean; depth: number
  // For ambient — base position
  ax: number; ay: number
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)

// ─── Shape Builders ────────────────────────────────────────────────────────────

function shellBias(dist: number, r: number, innerFill = 0.2): boolean {
  return Math.random() < innerFill + (1 - innerFill) * (dist / r) ** 1.5
}

/** Brain: dense organic oval, biased to the rim */
function genBrain(n: number, cx: number, cy: number, r: number) {
  const pts: [number, number][] = []
  while (pts.length < n) {
    const a = Math.random() * PI2
    const rx = r * rand(0.82, 1.0)
    const ry = r * rand(0.65, 0.78)
    const rad = Math.sqrt(Math.random()) * rx
    const x = cx + rad * Math.cos(a)
    const y = (cy - r * 0.08) + rad * (ry / rx) * Math.sin(a)
    const d = Math.hypot(x - cx, y - (cy - r * 0.08))
    if (!shellBias(d, r, 0.18)) continue
    // Carve a thin vertical sulcus
    if (Math.abs(x - cx) < r * 0.04 && y < cy && Math.random() < 0.75) continue
    pts.push([x, y])
  }
  return pts
}

/** Human head silhouette: taller oval, slightly narrower — morphed shape on scroll */
function genHead(n: number, cx: number, cy: number, r: number) {
  const pts: [number, number][] = []
  while (pts.length < n) {
    const a = Math.random() * PI2
    const rx = r * 0.68
    const ry = r * 0.88
    const rad = Math.sqrt(Math.random()) * rx
    const x = cx + rad * Math.cos(a)
    const y = (cy - r * 0.04) + rad * (ry / rx) * Math.sin(a)
    const d = Math.hypot(x - cx, y - (cy - r * 0.04))
    if (!shellBias(d, r, 0.12)) continue
    pts.push([x, y])
  }
  return pts
}

// ─── Main Hook ─────────────────────────────────────────────────────────────────

export function useTriangleConstellation(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  getScroll: () => number,   // getter so we don't rebuild on scroll
) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0, W = 0, H = 0
    let tris: Tri[] = []
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 }

    function build() {
      W = canvas!.offsetWidth || 1200
      H = canvas!.offsetHeight || 800
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(W * dpr)
      canvas!.height = Math.round(H * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      tris = []

      const clusterR = Math.min(W, H) * 0.40
      // Cluster is placed in the right-center of the canvas, like the reference
      const cx = W * 0.62
      const cy = H * 0.46

      const N_CLUSTER = Math.max(1400, Math.min(4000, Math.round((W * H) / 220)))
      const N_AMBIENT  = Math.max(70,  Math.min(250, Math.round((W * H) / 7500)))

      const brainPts = genBrain(N_CLUSTER, cx, cy, clusterR)
      const headPts  = genHead(N_CLUSTER, cx, cy, clusterR)

      for (let i = 0; i < N_CLUSTER; i++) {
        const [bx, by] = brainPts[i]
        const [hx, hy] = headPts[i]
        tris.push({
          bx, by, hx, hy,
          ax: 0, ay: 0,    // unused for cluster
          driftX:   rand(-5, 5),
          driftY:   rand(-5, 5),
          driftSpd: rand(0.00022, 0.00058),
          phase:    Math.random() * PI2,
          size:     rand(2.2, 5.5),
          color:    COLORS[(Math.random() * COLORS.length) | 0],
          rot:      Math.random() * PI2,
          rotSpd:   rand(-0.002, 0.002),
          alpha:    rand(0.5, 1.0),
          filled:   Math.random() < 0.07,
          isAmbient: false,
          depth:    rand(0.05, 0.35),
        })
      }

      // Ambient triangles: scattered all over the dark background
      for (let i = 0; i < N_AMBIENT; i++) {
        tris.push({
          bx: 0, by: 0, hx: 0, hy: 0,
          ax: Math.random() * W,
          ay: Math.random() * H,
          driftX:   rand(-22, 22),
          driftY:   rand(-22, 22),
          driftSpd: rand(0.00008, 0.00025),
          phase:    Math.random() * PI2,
          size:     rand(5, 18),
          color:    COLORS[(Math.random() * COLORS.length) | 0],
          rot:      Math.random() * PI2,
          rotSpd:   rand(-0.0015, 0.0015),
          alpha:    rand(0.06, 0.22),
          filled:   Math.random() < 0.25,
          isAmbient: true,
          depth:    rand(0.5, 1.2),
        })
      }
    }

    function drawTri(px: number, py: number, tr: Tri, a: number) {
      ctx!.globalAlpha = a
      ctx!.beginPath()
      for (let k = 0; k < 3; k++) {
        const ang = tr.rot + (k * PI2) / 3 - Math.PI / 2
        const vx = px + Math.cos(ang) * tr.size
        const vy = py + Math.sin(ang) * tr.size
        k === 0 ? ctx!.moveTo(vx, vy) : ctx!.lineTo(vx, vy)
      }
      ctx!.closePath()
      if (tr.filled) {
        ctx!.fillStyle = tr.color; ctx!.fill()
      } else {
        ctx!.strokeStyle = tr.color; ctx!.stroke()
      }
    }

    function render(t: number) {
      if (!ctx || W < 2 || H < 2) return
      ctx.clearRect(0, 0, W, H)
      ctx.lineWidth = 1

      ptr.x += (ptr.tx - ptr.x) * 0.06
      ptr.y += (ptr.ty - ptr.y) * 0.06

      const scroll = Math.max(0, Math.min(1, getScroll()))

      for (const tr of tris) {
        const drift = t * tr.driftSpd + tr.phase
        let px: number, py: number

        if (tr.isAmbient) {
          px = tr.ax + Math.sin(drift) * tr.driftX + ptr.x * tr.depth
          py = tr.ay + Math.cos(drift * 0.7) * tr.driftY + ptr.y * tr.depth
        } else {
          // Lerp between brain and head morph targets
          const mx = tr.bx + (tr.hx - tr.bx) * scroll
          const my = tr.by + (tr.hy - tr.by) * scroll
          px = mx + Math.sin(drift) * tr.driftX * 0.4 + ptr.x * tr.depth
          py = my + Math.cos(drift * 0.7) * tr.driftY * 0.4 + ptr.y * tr.depth
        }

        tr.rot += tr.rotSpd
        const flicker = 0.75 + 0.25 * Math.sin(t * 0.0012 + tr.phase)
        drawTri(px, py, tr, tr.alpha * flicker)
      }

      ctx.globalAlpha = 1
    }

    function frame(t: number) {
      render(t)
      raf = requestAnimationFrame(frame)
    }

    const ro = new ResizeObserver(() => {
      build()
      if (reduceMotion) render(0)
    })
    ro.observe(canvas)
    build()

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      ptr.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 32
      ptr.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 22
    }

    if (reduceMotion) {
      render(0)
    } else {
      raf = requestAnimationFrame(frame)
      window.addEventListener('mousemove', onMouseMove, { passive: true })
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef])
}
