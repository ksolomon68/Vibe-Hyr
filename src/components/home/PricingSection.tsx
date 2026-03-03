import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    id:       'free',
    name:     'SEEKER',
    price:    'Free',
    period:   'Always free · No card required',
    tagline:  'Enough to feel the transformation. Not enough to complete it.',
    featured: false,
    cta:      'Begin Free',
    href:     '/auth/signup',
    features: [
      { text: 'Course 1: Programming the Gatekeeper', included: true  },
      { text: 'Identity Audit Mini (3 questions)',    included: true  },
      { text: 'Blog & YouTube content hub',           included: true  },
      { text: '1 free SATS guided audio session',     included: true  },
      { text: 'Community read-only access',           included: true  },
      { text: 'Full course library (Courses 2–4)',    included: false },
      { text: 'Daily Revision Journal',               included: false },
      { text: 'Community posting & DMs',              included: false },
    ],
  },
  {
    id:       'architect',
    name:     'ARCHITECT',
    price:    '$27',
    period:   'per month · Cancel anytime',
    tagline:  'The serious practitioner. Full curriculum, daily tools, and community.',
    featured: true,
    cta:      'Become an Architect',
    href:     '/auth/signup?plan=architect',
    features: [
      { text: 'Everything in Seeker',                    included: true },
      { text: 'Courses 1, 2 & 3 (full access)',          included: true },
      { text: 'Daily Revision Journal (full)',           included: true },
      { text: 'Identity Audit (full 25 questions)',      included: true },
      { text: 'SATS Mastery Diagnostic',                 included: true },
      { text: 'Community full posting + DMs',            included: true },
      { text: 'SATS audio library (3 sessions)',         included: true },
      { text: 'Course 4 & Elite features',               included: false},
    ],
  },
  {
    id:       'elite',
    name:     'REALITY MASTER',
    price:    '$67',
    period:   'per month · Priority access',
    tagline:  'The complete system. Every course, every tool, every month.',
    featured: false,
    cta:      'Claim Mastery',
    href:     '/auth/signup?plan=elite',
    features: [
      { text: 'Everything in Architect',                     included: true },
      { text: 'Course 4: Echo Theory (Elite only)',          included: true },
      { text: 'Full Assumption Lab simulator',               included: true },
      { text: 'Monthly Life Mastery Score + roadmap',        included: true },
      { text: 'Full SATS audio library (7 nights)',          included: true },
      { text: 'Monthly live Q&A with host',                  included: true },
      { text: 'Priority community badge',                    included: true },
      { text: 'Early access to new courses',                 included: true },
    ],
  },
]

export function PricingSection() {
  return (
    <section className="py-24 px-6 md:px-14 bg-black-2" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="label mb-4">Membership</div>
        <h2 className="font-display text-[clamp(3rem,6vw,5rem)] leading-[0.95] tracking-[0.02em] mb-4">
          CHOOSE YOUR<br />
          <span className="text-orange-DEFAULT">LEVEL OF MASTERY</span>
        </h2>
        <p className="font-body italic text-grey-DEFAULT max-w-xl mb-12">
          Start free and explore. Go deeper when you're ready. Every tier is designed for exactly where you are on the path.
        </p>

        <div className="orange-rule">♛</div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-orange-DEFAULT border-2 border-orange-DEFAULT">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'bg-black-2 p-10 flex flex-col transition-colors duration-200',
                plan.featured && 'bg-black-3 relative border-2 border-orange-DEFAULT -m-[2px] z-10',
                !plan.featured && 'hover:bg-black-3'
              )}
            >
              {plan.featured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-DEFAULT text-black font-mono text-[0.55rem] tracking-[0.25em] uppercase px-5 py-1.5 font-bold whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <p className="font-display text-sm tracking-[0.15em] text-grey-DEFAULT mb-3">
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-display text-6xl text-white leading-none">
                    {plan.price}
                  </span>
                </div>
                <p className="font-mono text-[0.6rem] tracking-[0.15em] text-grey-DEFAULT mb-5">
                  {plan.period}
                </p>
                <p className="font-body text-sm italic text-grey-DEFAULT pb-6 border-b border-white/8">
                  {plan.tagline}
                </p>
              </div>

              <ul className="flex flex-col gap-3 mb-10 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className={cn('flex items-start gap-3 text-sm', !f.included && 'opacity-40')}>
                    {f.included
                      ? <Check size={14} className="text-orange-DEFAULT mt-0.5 flex-shrink-0" />
                      : <X size={14} className="text-grey-dark mt-0.5 flex-shrink-0" />
                    }
                    <span className="font-body">{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={cn(
                  'text-center text-[0.65rem]',
                  plan.featured ? 'btn-orange' : 'btn-outline-orange'
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <p className="text-center font-mono text-[0.6rem] tracking-[0.2em] text-grey-dark uppercase mt-8">
          ✦ 7-Day money-back guarantee on all paid plans · No questions asked ✦
        </p>
      </div>
    </section>
  )
}
