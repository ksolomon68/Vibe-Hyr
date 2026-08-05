'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight, Lock, CheckCircle2, Beaker,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { COURSES, TIER_ACCESS } from '@/lib/leadership/curriculum'
import { createClient } from '@/lib/supabase/client'
import { getCourseRoute } from '@/lib/constants/verticalRoutes'
import { PersonalCheckoutModal } from '@/components/pricing/PersonalCheckoutModal'
import type { PersonalTier } from '@/components/pricing/PersonalCheckoutModal'
import { TIER_CONFIG } from '@/lib/stripe/config'

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
}

const STATS = [
  { val: '11', unit: 'M', desc: 'bits of data your brain filters every second down to roughly 40 conscious bits — the RAS decides which 40 confirm your leadership identity.' },
  { val: '66', unit: ' days', desc: 'of consistent private practice before a leadership habit becomes automatic and neurologically unconscious (Lally, 2010).' },
  { val: '60–90', unit: ' days', desc: 'the Echo Theory delay — the gap between installing a new internal assumption and seeing it reflected in your community.' },
]

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

const TIER_LABELS: Record<string, string> = {
  free:      'Seeker',
  architect: 'Architect',
  elite:     'Reality Master',
}

export default function LeadershipPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userTier, setUserTier] = useState('free')
  const [hasFullAccess, setHasFullAccess] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTier, setModalTier] = useState<PersonalTier>('architect')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setIsLoggedIn(true)
      supabase
        .from('profiles')
        .select('membership_type, membership_tier, is_super_admin, is_bypassed')
        .eq('id', user.id)
        .single()
        .then(({ data: profile }) => {
          if (!profile) return
          if (profile.membership_tier) setUserTier(profile.membership_tier)
          setHasFullAccess(!!profile.is_super_admin || !!profile.is_bypassed)
          if (!profile.membership_type) return
          const correctRoute = getCourseRoute(profile.membership_type, null)
          if (correctRoute !== '/leadership') {
            router.replace(correctRoute)
          }
        })
    })
  }, [router])

  const handleUpgrade = (tier: string) => {
    const personalTier: PersonalTier = tier === 'elite' ? 'reality-master' : 'architect'
    setModalTier(personalTier)
    setModalOpen(true)
  }

  const course1 = COURSES[0]
  const course1Bullets = course1.lessons.map(l => l.keyConcepts[0])

  return (
    <main className="bg-black min-h-screen pt-20 text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center px-6 md:px-14 overflow-hidden">
        <div className="absolute inset-0 z-0 h-full w-full">
          <div className="absolute top-0 right-0 w-[70%] h-full bg-radial-at-tr from-orange-DEFAULT/15 via-transparent to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[50%] h-[60%] bg-radial-at-bl from-gold/5 via-transparent to-transparent blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-[1px] bg-orange-DEFAULT" />
              <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-semibold">Vibe Hyr Leadership</span>
            </div>
            <h1 className="font-display text-[clamp(3.2rem,7vw,6.5rem)] leading-[0.9] tracking-[0.02em] mb-8 text-white">
              THE ARCHITECTURE<br />
              OF <span className="text-orange-bright">IMPACT</span>
            </h1>
            <p className="font-body text-lg text-white/60 max-w-lg mb-12 leading-relaxed">
              Community Leadership programs designed to shift the internal state of a leader to affect their
              external environment. Built for organizations that train leaders to govern from identity—not effort.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                href={`/leadership/leadership_course_1/the-responsibility-formula`}
                className="btn-open-app"
              >
                Start Course 1 Free
              </Link>
              <a href="#curriculum" className="px-8 py-4 border border-white/20 hover:border-orange-DEFAULT hover:text-orange-DEFAULT text-white text-[0.75rem] uppercase tracking-widest font-semibold rounded-sm transition-all">
                See the Curriculum
              </a>
            </div>
            <div className="flex flex-wrap gap-6 pt-10 border-t border-white/10">
              {['Identity-Level Leadership', 'RAS Programming', 'Echo Theory', 'The Multiplier Effect'].map(tag => (
                <span key={tag} className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40 font-bold">{tag}</span>
              ))}
            </div>
          </motion.div>

          {/* Stat Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-10 md:p-14 rounded-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-DEFAULT via-gold to-transparent" />
            <p className="text-gold text-[0.7rem] uppercase tracking-[0.3em] font-bold mb-12">The Neuroscience of Leadership</p>
            <div className="space-y-10">
              {STATS.map((stat, idx) => (
                <div key={idx} className="flex items-baseline gap-2 pb-6 border-b border-white/5 last:border-0 last:pb-0">
                  <span className="font-display text-4xl md:text-5xl text-orange-bright whitespace-nowrap">{stat.val}{stat.unit}</span>
                  <p className="text-white/40 text-xs ml-4">{stat.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-24 md:py-32 px-6 md:px-14 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <motion.div {...FADE_UP} className="mb-20">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-bold mb-4 block">The Operating System</span>
            <h2 className="font-display text-4xl md:text-6xl text-white leading-tight max-w-2xl">
              Four pillars. <span className="text-orange-bright">One identity shift.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-sm overflow-hidden border border-white/5">
            {PILLARS.map((p, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-zinc-900 p-10 hover:bg-zinc-800 transition-colors group"
              >
                <span className="text-orange-DEFAULT text-3xl mb-8 block">{p.icon}</span>
                <h3 className="font-display text-xl text-white mb-4 group-hover:text-orange-DEFAULT transition-colors">{p.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CURRICULUM / COURSES */}
      <section id="curriculum" className="py-24 md:py-32 px-6 md:px-14 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div {...FADE_UP} className="mb-20">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-bold mb-4 block">The Curriculum</span>
            <h2 className="font-display text-4xl md:text-6xl text-white leading-tight">
              4 Courses.<br />
              <span className="text-orange-DEFAULT">Identity Rewired.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COURSES.map((course, idx) => {
              const hasAccess = hasFullAccess || (isLoggedIn && (TIER_ACCESS[userTier] ?? TIER_ACCESS.free).includes(course.id))
              const pills = course.lessons.slice(0, 3).map(l => l.title)

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`relative p-10 md:p-14 rounded-sm border transition-all hover:-translate-y-1 ${
                    idx === 0 ? 'bg-zinc-900 border-orange-DEFAULT/20 text-white' : 'bg-zinc-900/50 border-white/5 text-white'
                  }`}
                >
                  <span className={`absolute top-8 right-10 font-display text-8xl opacity-10 ${idx === 0 ? 'text-orange-DEFAULT' : 'text-white'}`}>
                    {String(course.num).padStart(2, '0')}
                  </span>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span
                      className="text-[0.6rem] uppercase tracking-widest font-bold px-3 py-1 rounded-full"
                      style={{ background: `${course.color}18`, color: course.color }}
                    >
                      {TIER_LABELS[course.tierRequired] ?? course.tierRequired}
                    </span>
                    <span className="text-[0.6rem] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-white/5 text-white/40">
                      {course.durationEstimate}
                    </span>
                    {!hasAccess && <Lock size={14} className="text-white/30 self-center" />}
                  </div>
                  <h3 className="font-display text-3xl mb-4 text-white">{course.title}</h3>
                  <p className="italic text-sm text-white/50 mb-4">{course.subtitle}</p>
                  <p className="text-sm leading-relaxed mb-8 max-w-md text-white/50">{course.description}</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {pills.map(pill => (
                      <span key={pill} className="text-[0.65rem] px-3 py-1 rounded-sm border bg-orange-DEFAULT/10 border-orange-DEFAULT/20 text-orange-bright">{pill}</span>
                    ))}
                  </div>

                  {hasAccess ? (
                    <Link href={`/leadership/${course.id}`} className="btn-outline-orange inline-flex items-center gap-2">
                      View Course <ArrowRight size={12} />
                    </Link>
                  ) : isLoggedIn ? (
                    <Link href="#pricing" className="btn-outline-orange inline-flex items-center gap-2">
                      <Lock size={12} /> Upgrade to Unlock
                    </Link>
                  ) : (
                    <Link href={`/auth/login?redirect=/leadership/${course.id}`} className="btn-outline-orange inline-flex items-center gap-2">
                      <Lock size={12} /> Log In to Access
                    </Link>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FLAGSHIP DETAIL — Course 1 */}
      <section className="bg-ink py-24 md:py-32 px-6 md:px-14 relative overflow-hidden" style={{ background: '#0E0C08' }}>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[60%] bg-radial-gradient from-orange-DEFAULT/10 via-transparent to-transparent pointer-events-none blur-3xl opacity-50" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <motion.div {...FADE_UP}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-[0.7rem] uppercase tracking-widest font-bold mb-8">
              Featured Course — Always Free
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-8 leading-tight">
              <span className="text-orange-bright">{course1.title}</span><br />
              — curriculum modules
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-12 max-w-xl">
              {course1.description}
            </p>
            <div className="space-y-6 mb-12">
              {course1Bullets.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <div className="p-1 rounded-full bg-orange-DEFAULT/20 border border-orange-DEFAULT/40">
                    <CheckCircle2 size={14} className="text-orange-DEFAULT" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            <Link href={`/leadership/${course1.id}/${course1.lessons[0].id}`} className="btn-open-app">
              Start Course 1 Free
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 p-10 md:p-14 rounded-sm backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-orange-DEFAULT to-transparent" />
            <p className="text-gold text-[0.7rem] uppercase tracking-[0.3em] font-bold mb-10">Course 1 Curriculum</p>
            <div className="space-y-8">
              {course1.lessons.map((lesson) => (
                <div key={lesson.id} className="flex gap-6 pb-6 border-b border-white/10 last:border-0 last:pb-0">
                  <span className="font-display text-xl text-orange-DEFAULT">{lesson.num}</span>
                  <div>
                    <h4 className="text-white font-medium mb-1">{lesson.title}</h4>
                    <p className="text-xs text-white/40 line-clamp-2">{lesson.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ASSUMPTION LABS */}
      <section className="py-24 md:py-32 px-6 md:px-14 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <motion.div {...FADE_UP} className="text-center mb-20 max-w-3xl mx-auto">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-bold mb-4 block">Applied Practice</span>
            <h2 className="font-display text-4xl md:text-6xl text-white leading-tight">
              Every course ends with an <br />
              <span className="text-orange-DEFAULT">interactive Assumption Lab.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {COURSES.map((course, idx) => (
              <motion.div
                key={course.assumptionLab.labId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-10 rounded-sm border transition-all ${
                  idx === 0
                    ? 'bg-zinc-900 border-orange-DEFAULT/40 shadow-2xl shadow-orange-DEFAULT/5 relative'
                    : 'bg-zinc-900/50 border-white/5'
                }`}
              >
                {idx === 0 && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-DEFAULT via-gold to-orange-DEFAULT" />
                )}
                <div className="mb-8 text-orange-bright"><Beaker className="w-8 h-8" /></div>
                <span className="text-[0.6rem] uppercase tracking-widest font-bold text-orange-DEFAULT mb-2 block">Course {course.num}</span>
                <h3 className="font-display text-2xl text-white mb-4">{course.assumptionLab.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{course.assumptionLab.prompt}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 md:py-32 px-6 md:px-14" style={{ background: '#0E0C08' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div {...FADE_UP} className="text-center mb-20 max-w-2xl mx-auto">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-bold mb-4 block">Investment</span>
            <h2 className="font-display text-5xl md:text-6xl text-white leading-tight">
              Simple pricing <br />
              <span className="text-orange-DEFAULT">for every leader.</span>
            </h2>
            <p className="text-sm mt-6" style={{ color: '#A39785' }}>Individual pricing · Course 1 always free</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* SEEKER */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col p-10 rounded-sm"
              style={{ background: '#1E1610', border: '1px solid #2E2416' }}
            >
              <div className="mb-8">
                <span className="font-mono text-[0.6rem] uppercase tracking-widest font-bold" style={{ color: '#A39785' }}>Seeker</span>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="font-display text-6xl" style={{ color: '#E8621A' }}>Free</span>
                </div>
                <p className="text-xs mt-2" style={{ color: '#A39785' }}>No card required</p>
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {['Course 1: The Internal Authority', 'Radical Ownership Assumption Lab', 'Core Content Library', 'Basic Progress Tracking'].map(f => (
                  <li key={f} className="flex gap-3 items-start text-sm" style={{ color: '#E2D9C8' }}>
                    <CheckCircle2 size={14} className="text-orange-DEFAULT mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={`/leadership/${course1.id}/${course1.lessons[0].id}`} className="btn-outline-orange w-full text-center">
                Start Free
              </Link>
            </motion.div>

            {/* ARCHITECT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col p-10 rounded-sm relative -translate-y-2 shadow-2xl"
              style={{ background: '#1A1208', border: '1px solid #E8621A', boxShadow: '0 0 40px rgba(232,98,26,0.12)' }}
            >
              <div className="absolute top-0 left-0 w-full h-[2px] rounded-t-sm" style={{ background: 'linear-gradient(90deg, #E8621A, #C9A84C, #E8621A)' }} />
              <div className="mb-2">
                <span className="font-mono text-[0.55rem] uppercase tracking-widest font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}>Most Popular</span>
              </div>
              <div className="mb-8">
                <span className="font-mono text-[0.6rem] uppercase tracking-widest font-bold" style={{ color: '#E8621A' }}>Architect</span>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="font-display text-6xl text-white">${TIER_CONFIG.architect.perSeatPricing.individual.monthly}</span>
                  <span className="text-sm" style={{ color: '#A39785' }}>/mo</span>
                </div>
                <p className="text-xs mt-2" style={{ color: '#A39785' }}>or ${TIER_CONFIG.architect.perSeatPricing.individual.annual}/yr</p>
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {['Everything in Seeker', 'Courses 1–3 (Internal Authority, Visionary Architecture, Bridge of Incidents)', 'Full Assumption Lab access', 'Progress tracking + certificates'].map(f => (
                  <li key={f} className="flex gap-3 items-start text-sm" style={{ color: '#F7F2EA' }}>
                    <CheckCircle2 size={14} className="text-orange-DEFAULT mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleUpgrade('architect')} className="btn-orange w-full text-center">
                Get Started
              </button>
            </motion.div>

            {/* REALITY MASTER */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col p-10 rounded-sm"
              style={{ background: '#1E1610', border: '1px solid #2E2416' }}
            >
              <div className="mb-8">
                <span className="font-mono text-[0.6rem] uppercase tracking-widest font-bold" style={{ color: '#A39785' }}>Reality Master</span>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="font-display text-6xl" style={{ color: '#E8621A' }}>${TIER_CONFIG['reality-master'].perSeatPricing.individual.monthly}</span>
                  <span className="text-sm" style={{ color: '#A39785' }}>/mo</span>
                </div>
                <p className="text-xs mt-2" style={{ color: '#A39785' }}>or ${TIER_CONFIG['reality-master'].perSeatPricing.individual.annual}/yr</p>
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {['Everything in Architect', 'Course 4: Echo Theory Mastery', 'Full Assumption Lab library', 'Priority community access'].map(f => (
                  <li key={f} className="flex gap-3 items-start text-sm" style={{ color: '#E2D9C8' }}>
                    <CheckCircle2 size={14} className="text-orange-DEFAULT mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleUpgrade('elite')} className="btn-outline-orange w-full text-center">
                Get Started
              </button>
            </motion.div>
          </div>

          <motion.div {...FADE_UP} className="mt-12 text-center">
            <Link href="/pricing" className="text-orange-DEFAULT text-[0.7rem] uppercase tracking-widest font-bold hover:text-orange-bright transition-colors">
              View Full Pricing Details →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 md:py-48 px-6 md:px-14 text-center bg-black relative overflow-hidden">
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[20vw] text-white opacity-[0.015] pointer-events-none whitespace-nowrap">VIBE HYR</span>
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div {...FADE_UP}>
            <h2 className="font-display text-4xl md:text-6xl text-white leading-[0.95] mb-8">
              The community you lead<br />
              <span className="text-orange-bright">is the echo of who you assume yourself to be.</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="#pricing" className="btn-open-app">
                View Pricing
              </Link>
              <Link href={`/leadership/${course1.id}/${course1.lessons[0].id}`} className="px-12 py-6 border border-white/10 hover:border-white/30 text-white text-[0.8rem] uppercase tracking-widest font-bold rounded-sm transition-all inline-block">
                Start Free →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      <PersonalCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTier={modalTier}
      />
    </main>
  )
}
