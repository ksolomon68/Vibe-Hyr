'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { COURSES } from '@/lib/leadership/curriculum'

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
}

const PILLARS = [
  {
    icon: '◈',
    title: 'RAS Programming',
    desc: "Retrain your brain's filter to scan for opportunity, ownership, and impact — not problems.",
  },
  {
    icon: '◉',
    title: 'SATS & Mental Rehearsal',
    desc: 'Use the hypnagogic threshold to install a living vision of the community you are building.',
  },
  {
    icon: '◆',
    title: 'Echo Theory',
    desc: 'Your current community is an echo of your past internal state. Change the state, change the community.',
  },
  {
    icon: '✦',
    title: 'The Multiplier Effect',
    desc: 'When a leader reaches identity-level mastery, the entire group elevates without deliberate effort.',
  },
]

export default function LeadershipPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#0E0C08] text-[#F7F2EA] min-h-screen">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative px-6 md:px-16 pt-28 pb-20 max-w-[1100px] mx-auto">
          <motion.div {...FADE_UP}>
            <p className="font-mono text-[0.6rem] tracking-[0.35em] uppercase text-[#E8621A] mb-4">
              ✦ Vibe Hyr Leadership
            </p>
            <h1 className="font-display text-[clamp(3.5rem,9vw,7rem)] leading-[0.9] tracking-[0.02em] mb-6">
              THE ARCHITECTURE<br />OF <em className="text-[#E8621A] not-italic">IMPACT</em>
            </h1>
            <p className="font-body text-lg md:text-xl text-[#F7F2EA]/60 max-w-2xl leading-relaxed mb-10">
              Community Leadership programs designed to shift the internal state of a leader to affect their
              external environment. Built for organizations that train leaders to govern from identity—not effort.
            </p>
            <Link
              href={`/leadership/leadership_course_1/the-responsibility-formula`}
              className="btn-orange inline-flex items-center gap-2"
            >
              Start Course 1 <ArrowRight size={14} />
            </Link>
          </motion.div>
        </section>

        {/* ── Pillars ──────────────────────────────────────────────────────── */}
        <section className="px-6 md:px-16 py-16 border-t border-white/5">
          <div className="max-w-[1100px] mx-auto">
            <motion.p
              {...FADE_UP}
              className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-[#C9A84C] mb-10"
            >
              The Four Pillars
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PILLARS.map((p, i) => (
                <motion.div
                  key={i}
                  {...FADE_UP}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="p-6 border border-white/8 bg-[#141008]"
                >
                  <div className="text-[#E8621A] text-2xl mb-4">{p.icon}</div>
                  <h3 className="font-display text-xl text-white mb-2">{p.title}</h3>
                  <p className="font-body text-sm text-[#F7F2EA]/50 leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Course cards ─────────────────────────────────────────────────── */}
        <section className="px-6 md:px-16 py-16 border-t border-white/5">
          <div className="max-w-[1100px] mx-auto">
            <motion.div {...FADE_UP} className="mb-10">
              <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-[#C9A84C] mb-2">
                The Curriculum
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-white">
                4 Courses. Identity Rewired.
              </h2>
            </motion.div>

            <div className="space-y-4">
              {COURSES.map((course, i) => {
                const tierLabels: Record<string, string> = {
                  seeker:        'Seeker',
                  architect:     'Architect',
                  reality_master:'Reality Master',
                }
                return (
                  <motion.div
                    key={course.id}
                    {...FADE_UP}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                    className="p-6 border border-white/8 bg-[#141008] flex flex-col md:flex-row md:items-center gap-6"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-display text-xl"
                      style={{ backgroundColor: `${course.color}18`, color: course.color, border: `1px solid ${course.color}40` }}
                    >
                      {String(course.num).padStart(2, '0')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span
                          className="font-mono text-[0.5rem] tracking-[0.25em] uppercase px-2 py-0.5 border"
                          style={{ color: course.color, borderColor: `${course.color}40` }}
                        >
                          {tierLabels[course.tierRequired] ?? course.tierRequired}
                        </span>
                        <span className="font-mono text-[0.5rem] tracking-widest text-white/30">
                          {course.durationEstimate}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl text-white mb-1">{course.title}</h3>
                      <p className="font-mono text-[0.6rem] tracking-[0.15em] text-[#C9A84C] mb-2">
                        {course.subtitle}
                      </p>
                      <p className="font-body text-sm text-[#F7F2EA]/50 leading-relaxed max-w-2xl">
                        {course.description}
                      </p>
                    </div>

                    <Link
                      href={`/leadership/${course.id}`}
                      className="btn-outline-orange flex-shrink-0 flex items-center gap-2 whitespace-nowrap"
                    >
                      View Course <ArrowRight size={12} />
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="px-6 md:px-16 py-20 border-t border-white/5 text-center">
          <motion.div {...FADE_UP}>
            <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-[#E8621A] mb-4">
              ✦ Ready to Lead from Identity?
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-6">
              The community you lead<br />is the echo of who you assume yourself to be.
            </h2>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/pricing" className="btn-orange">
                View Pricing
              </Link>
              <Link href={`/leadership/leadership_course_1/the-responsibility-formula`} className="btn-outline-orange">
                Start Free →
              </Link>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />
    </>
  )
}
