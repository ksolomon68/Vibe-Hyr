'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

const STATS = [
  { num: '4',   label: 'Core Courses',      desc: 'RAS → SATS → Mastery' },
  { num: '3',   label: 'Membership Tiers',  desc: 'Free · $27 · $67/mo' },
  { num: '5+',  label: 'Diagnostic Tools',  desc: 'Identity Audit & more' },
  { num: '∞',   label: 'Reality Potential', desc: 'Your consciousness, elevated' },
]

function useLightRays(ref: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = ref.current as HTMLCanvasElement
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf = 0

    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    })
    ro.observe(canvas)
    canvas.width  = canvas.offsetWidth  || 1200
    canvas.height = canvas.offsetHeight || 800

    function frame(t: number) {
      const W = canvas.width, H = canvas.height
      if (W < 2 || H < 2) { raf = requestAnimationFrame(frame); return }
      ctx.clearRect(0, 0, W, H)

      const ox = W * 0.82
      const oy = -H * 0.05
      const numRays = 14

      for (let i = 0; i < numRays; i++) {
        const baseAngle = Math.PI * 0.35 + (i / numRays) * Math.PI * 0.80
        const sway  = Math.sin(t * 0.0004 + i * 0.6) * 0.06
        const angle = baseAngle + sway
        const len   = Math.max(W, H) * 1.8
        const ex    = ox + Math.cos(angle) * len
        const ey    = oy + Math.sin(angle) * len
        const spread = 0.04 + (i % 3) * 0.025
        const perpX  = -Math.sin(angle) * len * spread
        const perpY  =  Math.cos(angle) * len * spread
        const bright = 0.5 + Math.sin(t * 0.0009 + i * 0.9) * 0.5
        const alpha  = (0.08 + bright * 0.24) * (1 - Math.abs(i - numRays / 2) / numRays * 0.55)

        const grad = ctx.createLinearGradient(ox, oy, ex, ey)
        grad.addColorStop(0,    `rgba(255,170,50,${Math.min(alpha * 2.8, 0.92)})`)
        grad.addColorStop(0.12, `rgba(255,123,0,${alpha})`)
        grad.addColorStop(0.5,  `rgba(255,100,0,${alpha * 0.4})`)
        grad.addColorStop(1,    'rgba(200,60,0,0)')
        ctx.beginPath()
        ctx.moveTo(ox, oy)
        ctx.lineTo(ex + perpX, ey + perpY)
        ctx.lineTo(ex - perpX, ey - perpY)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()
      }

      // Source bloom
      const bloom = ctx.createRadialGradient(ox, oy, 0, ox, oy, 220)
      bloom.addColorStop(0,    'rgba(255,220,90,0.75)')
      bloom.addColorStop(0.15, 'rgba(255,140,0,0.48)')
      bloom.addColorStop(0.45, 'rgba(255,80,0,0.16)')
      bloom.addColorStop(1,    'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.arc(ox, oy, 220, 0, Math.PI * 2)
      ctx.fillStyle = bloom
      ctx.fill()

      // Lens flare dot
      const fp = 1 + Math.sin(t * 0.003) * 0.2
      ctx.beginPath()
      ctx.arc(ox, oy, 7 * fp, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,245,190,0.98)'
      ctx.fill()

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])
}

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useLightRays(canvasRef)

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-[68px]">

      {/* Light rays canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(
            ellipse 85% 85% at 55% 50%,
            transparent 0%,
            rgba(10,10,10,0.08) 45%,
            rgba(10,10,10,0.65) 75%,
            rgba(10,10,10,0.92) 100%
          )`,
        }}
      />

      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT z-10" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-14 py-20 w-full">
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
              Where neuroscience meets Neville Goddard. Master your internal state through structured courses, daily journaling, and a community that gets it — and watch your external world catch up.
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
              <Link href="/courses" className="btn-outline">
                Explore Courses
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48">
                <Image
                  src="/images/vhlogo.png"
                  alt="Vibe Hyr"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[2px] bg-orange-DEFAULT border-2 border-orange-DEFAULT">
              {STATS.map((s) => (
                <div key={s.label} className="bg-black-2 p-7 hover:bg-black-3 transition-colors">
                  <span className="font-display text-5xl text-orange-DEFAULT block leading-none mb-1">
                    {s.num}
                  </span>
                  <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-grey-DEFAULT block mb-1">
                    {s.label}
                  </span>
                  <span className="font-body text-xs text-grey-DEFAULT/70">
                    {s.desc}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce z-10">
        <span className="font-mono text-[0.5rem] tracking-[0.3em] uppercase text-grey-dark">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-orange-DEFAULT to-transparent" />
      </div>

    </section>
  )
}
