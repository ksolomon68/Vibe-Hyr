'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Briefcase, 
  Flame, 
  Eye, 
  MessageSquareOff, 
  ShieldCheck, 
  Zap, 
  Target, 
  Users, 
  Heart, 
  CheckCircle2, 
  Calendar,
  FileText,
  Video,
  Building2,
  Phone,
  ArrowRight,
  Sparkles,
  Search
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { DiscoveryCallModal } from '@/components/business/DiscoveryCallModal'
import { CartPanel } from '@/components/pricing/CartPanel'
import type { Tier } from '@/components/pricing/CartPanel'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
}

const STATS = [
  { val: '$359', unit: 'B', desc: 'lost annually in the U.S. due to workplace conflict and poor emotional management' },
  { val: '85', unit: '%', desc: 'of employees deal with conflict — most without any training on how to handle it' },
  { val: '3×', unit: '', desc: 'more productive when teams operate from self-awareness and emotional regulation' }
]

const PROBLEMS = [
  { icon: <Flame className="w-8 h-8"/>, title: 'Reactive Behavior', desc: 'Employees responding with aggression, defensiveness, or volatility instead of thoughtful communication.' },
  { icon: <Search className="w-8 h-8"/>, title: 'Low Self-Awareness', desc: 'People who don\'t recognize how their energy, tone, and presence affect the room. You can\'t train what you can\'t see.' },
  { icon: <MessageSquareOff className="w-8 h-8"/>, title: 'Communication Breakdown', desc: 'Assumptions, passive aggression, and chronic miscommunication eating away at productivity and psychological safety.' }
]

const COURSES = [
  { num: '01', tag: 'Foundation', name: 'Common Sense In The Workplace', desc: 'The baseline every team needs. Practical training on reading a room, boundaries, and emotional intelligence.', pills: ['Self-Regulation', 'Social Awareness', 'Boundaries'] },
  { num: '02', tag: 'De-Escalation', name: 'From Reaction to Response', desc: 'Neuroscience-backed tools for interrupting fight-or-flight loops. Learn to pause and choose your next move.', pills: ['Nervous System', 'Triggers', 'Recovery'] },
  { num: '03', tag: 'Self Mastery', name: 'Know Yourself, Lead Yourself', desc: 'Deep-dive into personal identity and subconscious patterns that show up in professional behavior.', pills: ['Identity Work', 'Subconscious', 'Mindset'] },
  { num: '04', tag: 'Team Cohesion', name: 'Vibing as a Unit', desc: 'Move from a group of individuals to a team operating at a higher frequency together. Shared language.', pills: ['Safety', 'Shared Values', 'Accountability'] }
]

const FLAGSHIP_MODULES = [
  { num: '01', name: 'The Mirror Principle', sub: 'Self-awareness as the foundation of workplace behavior' },
  { num: '02', name: 'Reading the Room', sub: 'Social intelligence and environmental awareness at work' },
  { num: '03', name: 'The Trigger Map', sub: 'Identifying personal escalation patterns before they explode' },
  { num: '04', name: 'Response vs. Reaction', sub: 'Neuroscience of choice under pressure — and how to access it' },
  { num: '05', name: 'Vibe Hygiene', sub: 'Daily practices to maintain emotional clarity' },
  { num: '06', name: 'Team Frequency Reset', sub: 'Group session: rebuilding trust and shared energy' }
]

const FORMATS = [
  { icon: <Video className="w-8 h-8" />, name: 'Self-Paced Digital', desc: 'Full course access through the Vibe Hyr platform. Video lessons, reflection prompts, and journaling tools.' },
  { icon: <Building2 className="w-8 h-8" />, name: 'Live Group Workshop', desc: 'In-person or virtual workshop led by a certified Vibe Hyr facilitator. High-impact immersive format.' },
  { icon: <Target className="w-8 h-8" />, name: 'Blended Program', desc: 'Combine digital coursework with live facilitated sessions for lasting culture change. Includes follow-up coaching.' }
]

export default function WorkplaceTrainingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelTier, setPanelTier] = useState<Tier>('architect')

  const handleOpenPanel = (tier: Tier) => {
    setPanelTier(tier)
    setPanelOpen(true)
  }

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  return (
    <main className="bg-black min-h-screen text-white pt-20">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[95vh] flex items-center px-6 md:px-14 overflow-hidden">
        {/* Dynamic BG */}
        <div className="absolute inset-0 z-0 h-full w-full">
            <div className="absolute top-0 right-0 w-[70%] h-full bg-radial-at-tr from-orange-DEFAULT/15 via-transparent to-transparent blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[60%] bg-radial-at-bl from-gold/5 via-transparent to-transparent blur-3xl" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10" />
        </div>

        {/* Diagonal Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-orange-DEFAULT/20 to-transparent rotate-12 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-[1px] bg-orange-DEFAULT" />
              <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-bold">For teams & organizations</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] mb-10">
              Raise the vibration <br/>
              <span className="text-orange-bright font-bold italic">of your entire team.</span>
            </h1>
            <p className="font-body-alt text-lg text-white/60 max-w-xl mb-12 leading-relaxed">
              When unresolved conflict, reactive behavior, and low self-awareness are costing you culture — and bottom line — Vibe Hyr's workplace training gives your people the tools to respond, not react.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#pricing"
                className="btn-open-app"
              >
                Get Training for Your Team
              </a>
              <a href="#curriculum" className="px-10 py-5 border border-white/20 hover:border-orange-DEFAULT hover:text-orange-DEFAULT text-white text-[0.8rem] uppercase tracking-widest font-bold rounded-sm transition-all flex items-center justify-center">
                See the Curriculum
              </a>
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
            <p className="text-gold text-[0.7rem] uppercase tracking-[0.3em] font-bold mb-12">Low Vibrational Workplace Costs</p>
            <div className="space-y-10">
              {STATS.map((stat, idx) => (
                <div key={idx} className="flex items-baseline gap-2 pb-6 border-b border-white/5 last:border-0 last:pb-0">
                  <span className="font-display text-5xl md:text-6xl text-orange-bright">{stat.val}</span>
                  <span className="text-2xl text-orange-DEFAULT font-bold">{stat.unit}</span>
                  <p className="text-white/40 text-xs ml-4 max-w-[200px]">{stat.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEMS */}
      <section className="py-24 md:py-32 px-6 md:px-14 bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div {...FADE_UP} className="mb-20">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-bold mb-4 block">What We Solve</span>
            <h2 className="font-serif text-4xl md:text-6xl text-white leading-tight max-w-2xl">
              Your team is capable of more. <br/>
              <span className="text-orange-bright italic">Something's blocking them.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-sm overflow-hidden border border-white/5">
            {PROBLEMS.map((prob, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-zinc-900 p-10 md:p-12 hover:bg-zinc-800 transition-colors group"
              >
                <div className="text-orange-DEFAULT mb-8 group-hover:scale-110 transition-transform origin-left">
                  {prob.icon}
                </div>
                <h3 className="font-serif text-2xl text-white mb-4">{prob.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{prob.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CURRICULUM */}
      <section id="curriculum" className="py-24 md:py-32 px-6 md:px-14">
        <div className="max-w-7xl mx-auto">
          <motion.div {...FADE_UP} className="max-w-3xl mb-24">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-bold mb-4 block">The Curriculum</span>
            <h2 className="font-serif text-4xl md:text-6xl text-white leading-tight">
              Four training tracks. <br/>
              <span className="text-orange-bright italic">One transformed culture.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {COURSES.map((course, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative bg-zinc-900 border border-white/5 p-12 md:p-16 rounded-sm hover:border-orange-DEFAULT/30 transition-all hover:-translate-y-1 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-0 h-[2px] bg-gradient-to-r from-orange-DEFAULT to-transparent group-hover:w-full transition-all duration-500" />
                <span className="absolute top-10 right-14 font-display text-8xl opacity-[0.03] text-orange-DEFAULT group-hover:opacity-10 transition-opacity">
                  {course.num}
                </span>
                
                <span className="text-gold text-[0.65rem] uppercase tracking-[0.2em] font-bold mb-6 block">{course.tag}</span>
                <h3 className="font-serif text-3xl text-white mb-6 leading-tight group-hover:text-orange-bright transition-colors">{course.name}</h3>
                <p className="text-white/50 text-base leading-relaxed mb-10 max-w-md">{course.desc}</p>
                
                <div className="flex flex-wrap gap-2">
                  {course.pills.map(pill => (
                    <span key={pill} className="text-[0.6rem] uppercase tracking-widest font-bold px-4 py-2 bg-orange-DEFAULT/5 border border-orange-DEFAULT/20 text-orange-DEFAULT/80 rounded-full">
                      {pill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FLAGSHIP RESET */}
      <section className="py-24 md:py-32 px-6 md:px-14 bg-zinc-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div {...FADE_UP}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-[0.7rem] uppercase tracking-widest font-bold mb-10">
              <Sparkles size={16} />
              Most Requested Training
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-8 leading-tight">
              The <span className="text-orange-bright font-bold italic">Common Sense Reset</span> <br/>
              — your team's starting point
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-12 max-w-xl">
              Designed for teams where tension is already high, behavior has escalated, or leadership needs a reset that goes deeper than a policy update. This isn't HR compliance — it's transformation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {[
                'Address behavior impacts',
                'De-escalation tools',
                'Shared team language',
                'Leadership modeling',
                'Measurable shift (90 days)',
                'Trust reconstruction'
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-DEFAULT/20 border border-orange-DEFAULT/40 flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-orange-DEFAULT" />
                  </div>
                  <span className="text-white/80 text-sm">{item}</span>
                </div>
              ))}
            </div>
            {user ? (
               <a 
                 href="#pricing"
                 className="btn-open-app"
               >
                 View Pricing
               </a>
            ) : (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-open-app"
              >
                Request This Training
              </button>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-black/40 backdrop-blur-md border border-white/10 p-12 md:p-16 rounded-sm relative"
          >
            <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-orange-DEFAULT to-transparent shadow-[0_0_15px_rgba(255,123,0,0.5)]" />
            <p className="text-gold text-[0.7rem] uppercase tracking-[0.3em] font-bold mb-12">Module Breakdown</p>
            <div className="space-y-10">
              {FLAGSHIP_MODULES.map((mod, idx) => (
                <div key={idx} className="flex gap-6 pb-6 border-b border-white/5 last:border-0 last:pb-0 group">
                  <span className="font-display text-xl text-orange-DEFAULT group-hover:scale-110 transition-transform origin-top">{mod.num}</span>
                  <div>
                    <h4 className="text-white font-medium mb-1">{mod.name}</h4>
                    <p className="text-xs text-white/40">{mod.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* DELIVERY */}
      <section className="py-24 md:py-32 px-6 md:px-14">
        <div className="max-w-7xl mx-auto">
          <motion.div {...FADE_UP} className="text-center mb-24 max-w-2xl mx-auto">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-bold mb-4 block">Delivery Options</span>
            <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
              Train your team <br/>
              <span className="text-orange-bright italic">how it works for you.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FORMATS.map((format, idx) => (
              <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: idx * 0.1 }}
                 className="bg-zinc-900/40 border border-white/5 p-12 rounded-sm text-center hover:border-orange-DEFAULT/20 transition-all hover:bg-zinc-900 group"
              >
                <div className="w-16 h-16 bg-orange-DEFAULT/5 rounded-full flex items-center justify-center text-orange-DEFAULT mx-auto mb-8 group-hover:scale-110 transition-transform">
                  {format.icon}
                </div>
                <h3 className="font-serif text-2xl text-white mb-6">{format.name}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{format.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 md:py-32 px-6 md:px-14 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <motion.div {...FADE_UP} className="text-center mb-20 max-w-2xl mx-auto">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-bold mb-4 block">Investment</span>
            <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
              Simple, transparent <br/>
              <span className="text-orange-bright italic">per-seat pricing.</span>
            </h2>
            <p className="text-white/50 text-sm mt-6">Corporate pricing · Annual billing · Volume discounts available</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* SEEKER */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-zinc-900/50 border border-white/5 p-10 rounded-sm flex flex-col"
            >
              <div className="mb-8">
                <span className="text-[0.6rem] uppercase tracking-widest font-bold text-white/40">Seeker</span>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="font-display text-5xl text-white">$29</span>
                  <span className="text-white/40 text-sm">/seat/yr</span>
                </div>
                <p className="text-white/30 text-xs mt-2">Min 25 seats · $725 annual floor</p>
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {['Course 1: Common Sense In The Workplace', 'Daily Revision Journal', 'Core Content Library', 'Basic Progress Tracking'].map(f => (
                  <li key={f} className="flex gap-3 items-start text-sm text-white/60">
                    <CheckCircle2 size={14} className="text-orange-DEFAULT mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleOpenPanel('seeker')}
                className="btn-outline-orange w-full text-center"
              >
                Get Started
              </button>
            </motion.div>

            {/* ARCHITECT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-zinc-900 border border-orange-DEFAULT/40 p-10 rounded-sm flex flex-col relative -translate-y-2 shadow-2xl shadow-orange-DEFAULT/5"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-DEFAULT via-gold to-orange-DEFAULT rounded-t-sm" />
              <div className="mb-2">
                <span className="text-[0.55rem] uppercase tracking-widest font-bold px-3 py-1 bg-gold/10 text-gold rounded-full">Most Popular</span>
              </div>
              <div className="mb-8">
                <span className="text-[0.6rem] uppercase tracking-widest font-bold text-orange-DEFAULT">Architect</span>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="font-display text-5xl text-white">$59</span>
                  <span className="text-white/40 text-sm">/seat/yr</span>
                </div>
                <p className="text-white/30 text-xs mt-2">Min 25 seats · $1,475 annual floor</p>
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {['Courses 1–3 (Foundation through Self Mastery)', 'Full Revision Journal + SATS Tools', 'Team Diagnostics Engine', 'Community Access', 'Leadership Progress Tracker'].map(f => (
                  <li key={f} className="flex gap-3 items-start text-sm text-white/70">
                    <CheckCircle2 size={14} className="text-orange-DEFAULT mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleOpenPanel('architect')}
                className="btn-orange w-full text-center"
              >
                Get Started
              </button>
            </motion.div>

            {/* REALITY MASTER */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-zinc-900/50 border border-white/5 p-10 rounded-sm flex flex-col"
            >
              <div className="mb-8">
                <span className="text-[0.6rem] uppercase tracking-widest font-bold text-white/40">Reality Master</span>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="font-display text-5xl text-white">$99</span>
                  <span className="text-white/40 text-sm">/seat/yr</span>
                </div>
                <p className="text-white/30 text-xs mt-2">Min 50 seats · $4,950 annual floor</p>
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {['All 4 Training Tracks', 'Live Weekly Group Sessions', 'Full Audio & SATS Library', 'Dedicated Culture Coach', 'Custom Organizational Onboarding'].map(f => (
                  <li key={f} className="flex gap-3 items-start text-sm text-white/60">
                    <CheckCircle2 size={14} className="text-orange-DEFAULT mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleOpenPanel('reality-master')}
                className="btn-outline-orange w-full text-center"
              >
                Get Started
              </button>
            </motion.div>
          </div>

          <motion.div {...FADE_UP} className="mt-12 text-center">
            <p className="text-white/30 text-sm mb-4">Volume discounts: 10% (100+ seats) · 18% (250+ seats) · 25% (500+ seats)</p>
            <Link href="/pricing" className="text-orange-DEFAULT text-[0.7rem] uppercase tracking-widest font-bold hover:text-orange-bright transition-colors">
              View Full Pricing Calculator →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 md:py-48 px-6 md:px-14 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[22vw] text-white opacity-[0.015] pointer-events-none whitespace-nowrap">VIBE HYR</div>
        <motion.div {...FADE_UP} className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-serif text-5xl md:text-7xl text-white leading-[0.95] mb-10">
            Ready to help your team <br/>
            <span className="text-orange-bright italic">vibe higher?</span>
          </h2>
          <p className="font-body-alt text-lg text-white/50 mb-12 max-w-xl mx-auto leading-relaxed">
            Whether you're dealing with an urgent culture problem or proactively investing in your people, we'll build the right program for your team.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-open-app"
            >
              Book a Discovery Call
            </button>
            <a 
              href="/business.pdf"
              download
              className="px-12 py-6 border border-white/10 hover:border-white/30 text-white text-[0.8rem] uppercase tracking-widest font-bold rounded-sm transition-all inline-block"
            >
              Download the Brochure
            </a>
          </div>
        </motion.div>
      </section>

      <Footer />
      <DiscoveryCallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <CartPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        initialTier={panelTier}
        initialSegment="corporate"
        initialBilling="annual"
      />
    </main>
  )
}
