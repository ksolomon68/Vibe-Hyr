'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  GraduationCap, 
  Zap, 
  Layers, 
  UserRound, 
  Waves, 
  CheckCircle2, 
  Download,
  BookOpen,
  Users,
  LayoutDashboard,
  ShieldCheck,
  BrainCircuit,
  HeartHandshake,
  ChevronRight
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { DiscoveryCallModal } from '@/components/business/DiscoveryCallModal'
import { CartPanel } from '@/components/pricing/CartPanel'
import type { Tier } from '@/components/pricing/CartPanel'
import { CourseCard } from '@/components/personal/CourseCard'
import { COURSES } from '@/lib/data/courses'
import { PersonalCheckoutModal } from '@/components/pricing/PersonalCheckoutModal'
import type { PersonalTier } from '@/components/pricing/PersonalCheckoutModal'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { MembershipTier } from '@/types'
import { EnergyFieldDiagram } from '@/components/education/EnergyFieldDiagram'

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
}

const STATS = [
  { val: '44', unit: '%', desc: 'of new teachers leave the profession within the first five years' },
  { val: '75', unit: '%', desc: 'of educators report seeing students struggle with dysregulation daily' },
  { val: '80', unit: '%', desc: 'of teachers experience chronic stress that impacts their classroom climate' }
]

const PROBLEMS = [
  { icon: '🔥', title: 'Chronic Educator Burnout', desc: 'The "empty cup" phenomenon where staff are expected to pour into students while their own emotional and physiological reserves are depleted.' },
  { icon: '⚡', title: 'Secondary Traumatic Stress', desc: 'Educators absorbing the dysregulated energy and trauma of their students without a framework to process or redirect it.' },
  { icon: '🧱', title: 'Reactive Management Loops', desc: 'Classroom management that relies on power dynamics and reactivity instead of nervous system awareness and co-regulation.' },
  { icon: '🔄', title: 'Disconnected Implementation', desc: 'Professional development that offers theory without the daily self-mastery tools needed to actually change classroom culture.' }
]

const PROGRAMS = [
  { number: '01', tag: 'Flagship Training', audience: 'All Staff', name: 'The Educator Reset', desc: 'Vibe Hyr\'s core staff program. Focuses on teacher wellness, nervous system literacy, and the energy of leadership.', pills: ['Nervous System Health', 'Emotional Resilience', 'Self-Mastery'], dark: true },
  { number: '02', tag: 'Leadership Track', audience: 'Admin & Principals', name: 'Vibrational Leadership', desc: 'How school leaders set the frequency for an entire building. Frameworks for supporting staff wellness from the top down.', pills: ['Culture Architecture', 'Wellness Advocacy', 'Conscious Leadership'], dark: false },
  { number: '03', tag: 'Co-Regulation', audience: 'Classroom Teachers', name: 'Co-Regulation Mastery', desc: 'The science of meeting a student\'s storm with your calm. Practical tools for de-escalating through presence.', pills: ['De-Escalation', 'Classroom Climate', 'Biology of Calm'], dark: false },
  { number: '04', tag: 'Sustainable Culture', audience: 'Districts & HR', name: 'The Retained Educator', desc: 'Systems-level approaches to reducing teacher turnover through culture-building and self-awareness integration.', pills: ['Staff Retention', 'Systemic Wellness', 'Culture ROI'], dark: false }
]

const MODULES = [
  { num: '01', name: 'The Regulated Leader', sub: 'Understanding that your internal state is your most powerful tool' },
  { num: '02', name: 'Nervous System Literacy', sub: 'The biology of stress/calm for adults — how to read your own body' },
  { num: '03', name: 'The Co-Regulation Move', sub: 'Meeting dysregulation without becoming dysregulated yourself' },
  { num: '04', name: 'The Gap Between stim/rx', sub: 'Redefining classroom management through personal self-awareness' },
  { num: '05', name: 'Compassion Without Fatigue', sub: 'Language and boundaries for holding space without burning out' },
  { num: '06', name: 'Elevating the Staff Room', sub: 'Building a peer culture that supports rather than drains energy' }
]

const DELIVERY = [
  { icon: <BookOpen className="w-8 h-8" />, tag: 'Self-Paced', name: 'Digital Professional Dev', desc: 'Video-based modules designed for busy staff. Includes reflection tools and actionable classroom protocols.', featured: false },
  { icon: <GraduationCap className="w-8 h-8" />, tag: 'High-Impact', name: 'Professional Staff Day', desc: 'Immersive workshops led by Vibe Hyr facilitators. Transforming staff rooms through shared language and experiences.', featured: false },
  { icon: <HeartHandshake className="w-8 h-8" />, tag: 'The Gold Standard', name: 'Annual Wellness Partnership', desc: 'A year-long integration including digital access, live coaching, and district-level wellness reporting.', featured: true }
]

export default function EducationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelTier, setPanelTier] = useState<Tier>('architect')
  const [userTier, setUserTier] = useState<MembershipTier>('free')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTier, setModalTier] = useState<PersonalTier>('architect')

  const handleOpenPanel = (tier: Tier) => {
    setPanelTier(tier)
    setPanelOpen(true)
  }

  const handleUpgrade = (tier: string) => {
    const personalTier: PersonalTier = tier === 'elite' ? 'reality-master' : 'architect'
    setModalTier(personalTier)
    setModalOpen(true)
  }

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from('profiles')
          .select('membership_tier')
          .eq('id', user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.membership_tier) setUserTier(profile.membership_tier as MembershipTier)
          })
      }
    })
  }, [])

  return (
    <main className="bg-black min-h-screen pt-20 text-white">
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
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-[1px] bg-orange-DEFAULT" />
              <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-semibold">For schools & institutions</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] mb-8">
              Empowering the <br/>
              <span className="text-orange-bright font-bold italic">educators who</span> <br/>
              shape reality.
            </h1>
            <p className="font-body-alt text-lg text-white/70 max-w-lg mb-12 leading-relaxed">
              Vibe Hyr provides neuroscience-backed self-mastery and co-regulation training for K–12 staff — because a regulated school culture starts with a regulated adult.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <a 
                href="#pricing"
                className="btn-open-app"
              >
                Get Training for Your Staff
              </a>
              <a href="#programs" className="px-8 py-4 border border-white/20 hover:border-orange-DEFAULT hover:text-orange-DEFAULT text-white text-[0.75rem] uppercase tracking-widest font-semibold rounded-sm transition-all">
                See the Programs
              </a>
            </div>
            <div className="flex flex-wrap gap-6 pt-10 border-t border-white/10">
              {['Teacher Wellness', 'Co-Regulation', 'Staff Retention', 'Self-Mastery'].map(tag => (
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
            <p className="text-gold text-[0.7rem] uppercase tracking-[0.3em] font-bold mb-12">The State of the Educator</p>
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
      <section className="py-24 md:py-32 px-6 md:px-14 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <motion.div {...FADE_UP} className="mb-20">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-bold mb-4 block">The Challenge</span>
            <h2 className="font-serif text-4xl md:text-6xl text-white leading-tight max-w-2xl">
              You can't give what you don't have — <br/>
              <span className="text-orange-bright italic">regulation starts from within.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-sm overflow-hidden border border-white/5">
            {PROBLEMS.map((prob, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-zinc-900 p-10 md:p-14 hover:bg-zinc-800 transition-colors group"
              >
                <span className="text-4xl mb-8 block grayscale group-hover:grayscale-0 transition-all">{prob.icon}</span>
                <h3 className="font-serif text-2xl text-white mb-4 group-hover:text-orange-DEFAULT transition-colors">{prob.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{prob.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="py-24 md:py-32 px-6 md:px-14 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div {...FADE_UP} className="mb-20">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-bold mb-4 block">Our Training</span>
            <h2 className="font-serif text-4xl md:text-6xl text-white leading-tight">
              Built for educators.<br/>
              <span className="text-orange-DEFAULT">Proven in classrooms.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROGRAMS.map((prog, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative p-10 md:p-14 rounded-sm border transition-all hover:-translate-y-1 cursor-pointer ${
                  prog.dark ? 'bg-zinc-900 border-orange-DEFAULT/20 text-white' : 'bg-zinc-900/50 border-white/5 text-white'
                }`}
              >
                <span className={`absolute top-8 right-10 font-display text-8xl opacity-10 ${prog.dark ? 'text-orange-DEFAULT' : 'text-white'}`}>
                  {prog.number}
                </span>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className={`text-[0.6rem] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                    prog.dark ? 'bg-gold/10 text-gold' : 'bg-orange-DEFAULT/10 text-orange-DEFAULT'
                  }`}>{prog.tag}</span>
                  <span className="text-[0.6rem] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-white/5 text-white/40">
                    {prog.audience}
                  </span>
                </div>
                <h3 className={`font-serif text-3xl mb-4 ${prog.dark ? 'text-white' : 'text-white'}`}>{prog.name}</h3>
                <p className={`text-sm leading-relaxed mb-8 max-w-md ${prog.dark ? 'text-white/60' : 'text-white/50'}`}>{prog.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {prog.pills.map(pill => (
                    <span key={pill} className={`text-[0.65rem] px-3 py-1 rounded-sm border ${
                      prog.dark ? 'bg-orange-DEFAULT/10 border-orange-DEFAULT/20 text-orange-bright' : 'bg-white/5 border-white/10 text-white/40'
                    }`}>{pill}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FLAGSHIP DETAIL */}
      <section className="bg-ink py-24 md:py-32 px-6 md:px-14 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[60%] bg-radial-gradient from-orange-DEFAULT/10 via-transparent to-transparent pointer-events-none blur-3xl opacity-50" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <motion.div {...FADE_UP}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-[0.7rem] uppercase tracking-widest font-bold mb-8">
              <GraduationCap size={16} />
              Featured Training
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-8 leading-tight">
              <span className="text-orange-bright font-bold italic">The Educator Reset</span><br/>
              — curriculum modules
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-12 max-w-xl">
              Six modules that equip staff with the self-mastery tools needed to transform classroom climate — using Vibe Hyr's signature blend of neuroscience and practical adult education. 
            </p>
            <div className="space-y-6 mb-12">
              {[
                'Nervous system co-regulation frameworks',
                'Protocols for reducing classroom conflict incidents',
                'Personal self-care tools for high-stress days',
                'Measurable improvement in staff retention rates',
                'Equitable discipline through adult awareness',
                'Wellness certifications for participating staff'
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <div className="p-1 rounded-full bg-orange-DEFAULT/20 border border-orange-DEFAULT/40">
                    <CheckCircle2 size={14} className="text-orange-DEFAULT" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">{item}</span>
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
            className="bg-white/5 border border-white/10 p-10 md:p-14 rounded-sm backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-orange-DEFAULT to-transparent" />
            <p className="text-gold text-[0.7rem] uppercase tracking-[0.3em] font-bold mb-10">Staff Curriculum</p>
            <div className="space-y-8">
              {MODULES.map((mod, idx) => (
                <div key={idx} className="flex gap-6 pb-6 border-b border-white/10 last:border-0 last:pb-0">
                  <span className="font-display text-xl text-orange-DEFAULT">{mod.num}</span>
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
      <section className="py-24 md:py-32 px-6 md:px-14 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <motion.div {...FADE_UP} className="text-center mb-20 max-w-3xl mx-auto">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-bold mb-4 block">Deployment</span>
            <h2 className="font-serif text-4xl md:text-6xl text-white leading-tight">
              Flexible for any district schedule. <br/>
              <span className="text-orange-DEFAULT">Structured to sustain wellness.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {DELIVERY.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-10 rounded-sm border transition-all ${
                  item.featured 
                    ? 'bg-zinc-900 border-orange-DEFAULT/40 shadow-2xl shadow-orange-DEFAULT/5 relative -translate-y-2' 
                    : 'bg-zinc-900/50 border-white/5'
                }`}
              >
                {item.featured && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-DEFAULT via-gold to-orange-DEFAULT" />
                )}
                <div className={`mb-8 ${item.featured ? 'text-orange-DEFAULT' : 'text-orange-bright'}`}>
                  {item.icon}
                </div>
                <span className="text-[0.6rem] uppercase tracking-widest font-bold text-orange-DEFAULT mb-2 block">{item.tag}</span>
                <h3 className="font-serif text-2xl text-white mb-4">{item.name}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ENERGY FIELD DIAGRAM */}
      <section className="bg-teal py-24 md:py-32 px-6 md:px-14 text-white overflow-hidden relative">
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div {...FADE_UP}>
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-bright font-bold mb-4 block">For Administration</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
              A thriving school culture starts — <br/>
              <span className="text-orange-bright font-bold italic">in the staff room.</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-12">
              Vibe Hyr integration metrics allow administration to see real-time engagement in wellness tools and correlate them with behavioral incident trends. We provide the data you need to advocate for your staff.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Staff Dashboards', icon: <LayoutDashboard size={20}/> },
                { label: 'Wellness Reporting', icon: <BrainCircuit size={20}/> },
                { label: 'Culture Metrics', icon: <Layers size={20}/> },
                { label: 'Retention Focus', icon: <Users size={20}/> }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-sm">
                  <div className="text-orange-bright">{item.icon}</div>
                  <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <EnergyFieldDiagram />
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 md:py-32 px-6 md:px-14" style={{ background: '#0E0C08' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div {...FADE_UP} className="text-center mb-20 max-w-2xl mx-auto">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-bold mb-4 block">Investment</span>
            <h2 className="font-display text-5xl md:text-6xl text-white leading-tight">
              Budget-friendly pricing <br/>
              <span className="text-orange-DEFAULT">for every district.</span>
            </h2>
            <p className="text-sm mt-6" style={{ color: '#A39785' }}>Education pricing · Annual billing · Volume discounts available</p>
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
                  <span className="font-display text-6xl" style={{ color: '#E8621A' }}>$19</span>
                  <span className="text-sm" style={{ color: '#A39785' }}>/seat/yr</span>
                </div>
                <p className="text-xs mt-2" style={{ color: '#A39785' }}>Min 50 seats · $950 annual floor</p>
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {['The Educator Reset (Track 1)', 'Staff Reflection Journal', 'Core Content Library', 'Basic Staff Progress Tracking'].map(f => (
                  <li key={f} className="flex gap-3 items-start text-sm" style={{ color: '#E2D9C8' }}>
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
                  <span className="font-display text-6xl text-white">$39</span>
                  <span className="text-sm" style={{ color: '#A39785' }}>/seat/yr</span>
                </div>
                <p className="text-xs mt-2" style={{ color: '#A39785' }}>Min 50 seats · $1,950 annual floor</p>
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {['Tracks 1–3 (Reset, Leadership, Co-Regulation)', 'Full Reflection Journal + SATS Tools', 'Staff Diagnostics Engine', 'Admin Dashboard & Wellness Reporting', 'Academic Leadership Tracker'].map(f => (
                  <li key={f} className="flex gap-3 items-start text-sm" style={{ color: '#F7F2EA' }}>
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
              className="flex flex-col p-10 rounded-sm"
              style={{ background: '#1E1610', border: '1px solid #2E2416' }}
            >
              <div className="mb-8">
                <span className="font-mono text-[0.6rem] uppercase tracking-widest font-bold" style={{ color: '#A39785' }}>Reality Master</span>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="font-display text-6xl" style={{ color: '#E8621A' }}>$49</span>
                  <span className="text-sm" style={{ color: '#A39785' }}>/seat/yr</span>
                </div>
                <p className="text-xs mt-2" style={{ color: '#A39785' }}>Min 50 seats · $2,450 annual floor</p>
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {['All 4 Staff Training Tracks', 'Live Weekly Q&As', 'Full Audio & SATS Library', 'Dedicated Wellness Coordinator', 'District-Level Culture Reporting'].map(f => (
                  <li key={f} className="flex gap-3 items-start text-sm" style={{ color: '#E2D9C8' }}>
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
            <p className="text-sm mb-4" style={{ color: '#A39785' }}>Volume discounts: 5% off (250+ seats) · ~10% off (500+ seats)</p>
            <Link href="/pricing" className="text-orange-DEFAULT text-[0.7rem] uppercase tracking-widest font-bold hover:text-orange-bright transition-colors">
              View Full Pricing Calculator →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 md:py-48 px-6 md:px-14 text-center bg-black relative overflow-hidden">
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[20vw] text-white opacity-[0.015] pointer-events-none whitespace-nowrap">VIBE HYR</span>
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div {...FADE_UP}>
            <h2 className="font-serif text-5xl md:text-7xl text-white leading-[0.95] mb-8">
              Your staff deserves tools <br/>
              <span className="text-orange-bright font-bold italic">that actually support them.</span>
            </h2>
            <p className="font-body-alt text-lg text-white/50 mb-12">
              Download the educator program guide to see training modules, implementation timelines, and staff retention case studies.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-open-app"
              >
                Book a Discovery Call
              </button>
              <a 
                href="/education.pdf"
                download
                className="px-12 py-6 border border-white/10 hover:border-white/30 text-white text-[0.8rem] uppercase tracking-widest font-bold rounded-sm transition-all inline-block"
              >
                Download the Brochure
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BROWSE COURSES */}
      <section className="py-24 md:py-32 px-6 md:px-14 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <motion.div {...FADE_UP} className="mb-10">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-orange-DEFAULT font-bold mb-4 block">For Individuals</span>
            <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
              Personal development courses<br />
              <span className="text-orange-bright italic">for every educator.</span>
            </h2>
            <p className="text-white/50 text-sm mt-4 max-w-xl">
              Beyond staff training — these self-paced courses support the individual growth of every educator on your team. Course 1 is always free.
            </p>
          </motion.div>

          {/* Tier key */}
          <div className="py-6 border-y border-white/8 mb-10 flex flex-wrap gap-6 items-center">
            <span className="font-mono text-[0.58rem] tracking-[0.25em] uppercase text-white/30">Access Key:</span>
            <div className="flex flex-wrap gap-4">
              <span className="badge-free">Free — Seeker</span>
              <span className="badge-architect">Pro — Architect ($27/mo)</span>
              <span className="badge-elite">Elite — Reality Master ($67/mo)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-orange-DEFAULT border-2 border-orange-DEFAULT">
            {COURSES.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                userTier={userTier}
                onUpgrade={handleUpgrade}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <DiscoveryCallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <CartPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        initialTier={panelTier}
        initialSegment="university"
        initialBilling="annual"
        vertical="education"
      />
      <PersonalCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTier={modalTier}
      />
    </main>
  )
}
