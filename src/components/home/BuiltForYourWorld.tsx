'use client'

import Link from 'next/link'
import { Building2, GraduationCap, Crown, CheckCircle } from 'lucide-react'

const CARDS = [
  {
    icon:    Building2,
    tag:     'Workplace',
    heading: 'For Organizations & Teams',
    body:    "Rewire your team's subconscious operating system. Shift from chronic stress and friction into sustainable flow states — and watch performance follow.",
    features: [
      'Eradicate Growth Ceilings',
      'Shift Organizational Culture',
      'Build Peak Performance',
    ],
    cta:  'Explore Workplace Programs',
    href: '/workplace',
  },
  {
    icon:    GraduationCap,
    tag:     'Educators',
    heading: 'For Educators & Institutions',
    body:    'Give educators the mental architecture for unshakeable classroom resilience, deep focus, and identity-level confidence — reducing burnout and turnover.',
    features: [
      'Overcome Educator Burnout',
      'Build Deep Focus',
      'Develop Unshakeable Confidence',
    ],
    cta:  'Explore Educator Programs',
    href: '/educators',
  },
  {
    icon:    Crown,
    tag:     'Leadership',
    heading: 'For Leaders & Executives',
    body:    'Build the internal architecture of leaders who move people without pushing. Replace authority-by-position with identity-level influence that compounds across every team it touches.',
    features: [
      'Develop Identity-Level Authority',
      'Create High-Performance Culture',
      'Lead from Aligned Conviction',
    ],
    cta:  'Explore Leadership Programs',
    href: '/leadership',
  },
]

export function BuiltForYourWorld() {
  return (
    <section className="py-24 px-6 md:px-14 bg-black dark-section-persistent">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="label mb-4">Extended Platform</div>
        <h2 className="font-display text-[clamp(3rem,6vw,5rem)] leading-[0.95] tracking-[0.02em] mb-4">
          BUILT FOR
          <br />
          <span className="text-orange-DEFAULT">YOUR WORLD</span>
        </h2>
        <p className="font-body italic text-[#D1D5DB] text-[15px] leading-[1.6] max-w-xl mb-12">
          Vibe Hyr is not just for individual practitioners. We bring the neuroscience of
          consciousness into every environment where human potential is lived.
        </p>

        <div className="orange-rule">✦</div>

        {/* Two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {CARDS.map(({ icon: Icon, tag, heading, body, features, cta, href }) => (
            <article
              key={tag}
              className="group relative flex flex-col bg-[#0D0D0D] border-l-4 border-[#F97316] p-8 md:p-10"
              style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(249,115,22,0.12)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              {/* Tag */}
              <div className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-orange-DEFAULT border border-orange-DEFAULT/40 px-2 py-0.5 self-start mb-6">
                {tag}
              </div>

              {/* Icon + Heading */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-orange-DEFAULT/10 border border-orange-DEFAULT/25 flex-shrink-0">
                  <Icon size={24} className="text-orange-DEFAULT" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl tracking-[0.03em] text-white leading-tight pt-1">
                  {heading}
                </h3>
              </div>

              {/* Body */}
              <p className="font-body text-[15px] leading-[1.6] text-[#D1D5DB] mb-6">
                {body}
              </p>

              {/* Feature list */}
              <ul className="flex flex-col gap-2.5 mb-8">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-3 font-body text-sm text-[#E5E7EB]">
                    <CheckCircle size={14} className="text-orange-DEFAULT flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={href} className="btn-orange self-start mt-auto">
                {cta}
              </Link>

              {/* Corner accent */}
              <div className="absolute bottom-0 right-0 font-display text-[4rem] text-orange-DEFAULT/5 leading-none select-none pointer-events-none pr-4 pb-2">
                {tag === 'Workplace' ? '⬡' : tag === 'Leadership' ? '♛' : '◈'}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
