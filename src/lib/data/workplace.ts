// ── Workplace / Corporate Training Data ─────────────────────────────────────

export interface WorkplaceProgram {
  id: string
  icon: string
  title: string
  description: string
  highlights: string[]
}

export interface WorkplacePackage {
  id: string
  name: string
  price: string
  priceNote: string
  seats: string
  featured: boolean
  features: string[]
  cta: string
}

export interface WorkplaceTestimonial {
  id: string
  quote: string
  name: string
  role: string
  company: string
}

export interface WorkplaceFAQ {
  id: string
  question: string
  answer: string
}

export const WORKPLACE_STATS = [
  { value: 200,  suffix: '+', label: 'Teams Trained'        },
  { value: 87,   suffix: '%', label: 'Avg Productivity Lift' },
  { value: 4.9,  suffix: '',  label: 'Satisfaction Score'    },
  { value: 30,   suffix: '+', label: 'Industries Served'     },
]

export const WORKPLACE_PROGRAMS: WorkplaceProgram[] = [
  {
    id: 'team-onboarding',
    icon: 'Users',
    title: 'Team Onboarding Program',
    description: 'A structured 4-week program that aligns new and existing team members around a shared success identity — from day one.',
    highlights: [
      'Custom team identity blueprint',
      'Weekly group assumption labs',
      'Individual progress tracking',
      'Manager facilitation guides',
    ],
  },
  {
    id: 'custom-workshops',
    icon: 'Zap',
    title: 'Custom Workshops',
    description: 'Half-day or full-day intensive workshops designed around your organization\'s specific challenges, goals, and culture.',
    highlights: [
      'Fully customized curriculum',
      'Live facilitation by certified coach',
      'Pre/post assessment tools',
      'Follow-up resource kit',
    ],
  },
  {
    id: 'group-accountability',
    icon: 'Target',
    title: 'Group Accountability Circles',
    description: 'Ongoing bi-weekly sessions that keep teams practicing, reporting wins, and holding each other to their highest assumed reality.',
    highlights: [
      'Bi-weekly live sessions',
      'Dedicated Slack/Teams channel',
      'Win documentation system',
      'Monthly performance reports',
    ],
  },
  {
    id: 'leadership-mindset',
    icon: 'Crown',
    title: 'Leadership Mindset Track',
    description: 'A premium program for executives and managers covering advanced assumption architecture, team influence, and organizational culture transformation.',
    highlights: [
      '1:1 executive coaching sessions',
      'Leadership identity audit',
      'Culture change playbook',
      'Quarterly strategy reviews',
    ],
  },
]

export const WORKPLACE_PACKAGES: WorkplacePackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$2,500',
    priceNote: 'per cohort',
    seats: 'Up to 20 seats',
    featured: false,
    features: [
      '4-week onboarding program',
      'Group platform access',
      'Weekly live sessions (4)',
      'Manager dashboard',
      'Email support',
    ],
    cta: 'Get Started',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$6,500',
    priceNote: 'per cohort',
    seats: 'Up to 75 seats',
    featured: true,
    features: [
      'Everything in Starter',
      'Custom workshop (1 full day)',
      'Monthly accountability circles',
      'Dedicated success manager',
      'Slack integration',
      'Advanced analytics',
    ],
    cta: 'Most Popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    priceNote: 'annual contract',
    seats: 'Unlimited seats',
    featured: false,
    features: [
      'Everything in Growth',
      'Unlimited workshops',
      'White-label option',
      'Executive coaching track',
      'Culture transformation roadmap',
      'Priority support + SLA',
    ],
    cta: 'Contact Us',
  },
]

export const WORKPLACE_TESTIMONIALS: WorkplaceTestimonial[] = [
  {
    id: 't1',
    quote: 'We brought Vibe Hyr in during a company-wide reorganization. Within 8 weeks, team morale scores increased 34% and we saw our best Q3 in five years. The shift in how our people think about possibility is profound.',
    name: 'Marcus D.',
    role: 'Chief People Officer',
    company: 'NovaTech Solutions',
  },
  {
    id: 't2',
    quote: 'I was skeptical of anything "mindset-based," but the science-backed framework convinced me. The ROI was measurable: reduced conflict, faster decision-making, and a team that actually believes in what we\'re building.',
    name: 'Sandra W.',
    role: 'VP of Operations',
    company: 'Meridian Group',
  },
  {
    id: 't3',
    quote: 'Our sales team went from hitting 70% of target to 112% in one quarter after the Growth program. This isn\'t motivation fluff — it\'s deep identity work that creates lasting change.',
    name: 'Tyler R.',
    role: 'Head of Sales',
    company: 'Axiom Financial',
  },
]

export const WORKPLACE_FAQS: WorkplaceFAQ[] = [
  {
    id: 'faq-1',
    question: 'How is this different from standard corporate training?',
    answer: 'Most corporate training focuses on skills. We focus on the identity behind the skills. A team that has reengineered its assumptions about what\'s possible will outperform a team that\'s learned new techniques every time. Skills fade; identity compounds.',
  },
  {
    id: 'faq-2',
    question: 'How long before we see results?',
    answer: 'Teams typically report a shift in energy and communication within the first two weeks. Measurable performance changes — productivity, retention, satisfaction scores — usually appear by week 6 to 8 of consistent practice.',
  },
  {
    id: 'faq-3',
    question: 'Do team members need to believe in this to benefit?',
    answer: 'No. The RAS (Reticular Activating System) framework we teach is pure neuroscience. Even the most skeptical participant benefits from the attentional training and assumption auditing process. The results speak for themselves.',
  },
  {
    id: 'faq-4',
    question: 'Can we customize the content for our industry?',
    answer: 'Yes. The Growth and Enterprise packages include fully custom content workshops. We\'ve delivered programs for finance, tech, healthcare, retail, and non-profits — each with industry-specific scenarios, language, and outcomes.',
  },
  {
    id: 'faq-5',
    question: 'What format are the sessions delivered in?',
    answer: 'We offer in-person, virtual, and hybrid formats. All programs include the Vibe Hyr platform for async practice between live sessions. Our virtual facilitation is just as effective as in-person.',
  },
  {
    id: 'faq-6',
    question: 'Is there a minimum team size?',
    answer: 'Our Starter program works for teams of 5 or more. For very small teams (under 10), we sometimes recommend a hybrid approach combining group sessions with individual platform access.',
  },
]

export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Discovery',
    description: 'A 60-minute call to understand your team\'s challenges, goals, culture, and current mindset baseline.',
  },
  {
    step: '02',
    title: 'Customization',
    description: 'We build a tailored program — timeline, curriculum, tools — aligned to your specific outcomes and team size.',
  },
  {
    step: '03',
    title: 'Deployment',
    description: 'Live facilitation, platform access, and ongoing support. Your team transforms while you watch the metrics shift.',
  },
]
