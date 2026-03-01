'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const STATS = [
  { num: '4',   label: 'Core Courses',       desc: 'RAS → SATS → Mastery' },
  { num: '3',   label: 'Membership Tiers',   desc: 'Free · $27 · $67/mo' },
  { num: '5+',  label: 'Diagnostic Tools',   desc: 'Identity Audit & more' },
  { num: '∞',   label: 'Reality Potential',  desc: 'Your consciousness, elevated' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-[68px]">
      {/* Orange left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />

      {/* Large background circle */}
      <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-orange-DEFAULT/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-14 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="label mb-6"
            >
              Vibe Hyr 2.0 · The Architecture of Reality
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

          {/* Right: Stats grid + Logo */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Logo */}
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

            {/* Stats 2x2 grid */}
            <div
              className="grid grid-cols-2 gap-[2px] bg-orange-DEFAULT border-2 border-orange-DEFAULT"
            >
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="font-mono text-[0.5rem] tracking-[0.3em] uppercase text-grey-dark">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-orange-DEFAULT to-transparent" />
      </div>
    </section>
  )
}
