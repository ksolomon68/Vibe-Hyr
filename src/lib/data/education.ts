// ── Education / Institutional Licensing Data ────────────────────────────────

export interface EducationBenefit {
  id: string
  icon: string
  title: string
  description: string
}

export interface EducationProgram {
  id: string
  name: string
  price: string
  priceNote: string
  audience: string
  featured: boolean
  features: string[]
  cta: string
}

export interface CertificationStep {
  step: string
  title: string
  description: string
  duration: string
}

export interface EducationTestimonial {
  id: string
  quote: string
  name: string
  role: string
  institution: string
}

export interface EducationFAQ {
  id: string
  question: string
  answer: string
}

export const EDUCATION_STATS = [
  { value: 150,  suffix: '+', label: 'Certified Educators'   },
  { value: 12000,suffix: '+', label: 'Students Reached'      },
  { value: 94,   suffix: '%', label: 'Educator Satisfaction' },
  { value: 40,   suffix: '+', label: 'Institutions'          },
]

export const EDUCATION_BENEFITS: EducationBenefit[] = [
  {
    id: 'curriculum',
    icon: 'BookOpen',
    title: 'Complete Curriculum Access',
    description: 'Full access to all four courses, lesson content, quizzes, and the Assumption Lab — adapted for classroom and workshop formats with facilitator guides.',
  },
  {
    id: 'training',
    icon: 'Award',
    title: 'Facilitation Certification',
    description: 'A structured certification program that trains you to lead Vibe Hyr sessions with confidence, including live practice and assessment.',
  },
  {
    id: 'support',
    icon: 'HeadphonesIcon',
    title: 'Ongoing Educator Support',
    description: 'Dedicated educator community, monthly facilitator calls, updated materials, and a direct line to the Vibe Hyr team for questions.',
  },
]

export const EDUCATION_PROGRAMS: EducationProgram[] = [
  {
    id: 'individual',
    name: 'Individual Educator',
    price: '$497',
    priceNote: 'one-time',
    audience: 'Teachers, coaches, therapists',
    featured: false,
    features: [
      'Personal platform access (all tiers)',
      'Educator certification course',
      'Printable classroom worksheets',
      'Community forum access',
      '1 year of updates',
    ],
    cta: 'Get Certified',
  },
  {
    id: 'classroom',
    name: 'Classroom Program',
    price: '$1,200',
    priceNote: 'per semester',
    audience: 'K-12, college, training centers',
    featured: true,
    features: [
      'Everything in Individual',
      'Up to 40 student accounts',
      'Student progress dashboard',
      'Lesson plan templates',
      'Live facilitator Q&A (monthly)',
      'Parent/guardian guides',
    ],
    cta: 'Most Popular',
  },
  {
    id: 'institutional',
    name: 'Institutional Partnership',
    price: 'Custom',
    priceNote: 'annual agreement',
    audience: 'Universities, nonprofits, districts',
    featured: false,
    features: [
      'Unlimited student accounts',
      'Multi-instructor licenses',
      'Branded learning environment',
      'API + LMS integration',
      'Dedicated partnership manager',
      'Co-marketing opportunities',
    ],
    cta: 'Partner With Us',
  },
]

export const CERTIFICATION_STEPS: CertificationStep[] = [
  {
    step: '01',
    title: 'Apply',
    description: 'Submit your partnership application with your institution details, teaching context, and intended student population.',
    duration: '5 min',
  },
  {
    step: '02',
    title: 'Complete the Course',
    description: 'Work through the full Vibe Hyr curriculum as a student first — building your own practice before teaching it.',
    duration: '4–6 weeks',
  },
  {
    step: '03',
    title: 'Facilitation Training',
    description: 'Complete the educator certification modules: facilitation techniques, student safety, adapting content for your context.',
    duration: '2 weeks',
  },
  {
    step: '04',
    title: 'Live Practicum',
    description: 'Deliver a practice session observed by a Vibe Hyr master facilitator. Receive detailed feedback and your certification.',
    duration: '1 session',
  },
]

export const EDUCATION_TESTIMONIALS: EducationTestimonial[] = [
  {
    id: 'et1',
    quote: 'I\'ve been a high school counselor for 14 years. The assumption-based framework is the first tool I\'ve seen that students actually internalize. The RAS lesson alone changed how three of my students approach academics.',
    name: 'Dr. Renee Okonkwo',
    role: 'School Counselor',
    institution: 'Westbridge Academy',
  },
  {
    id: 'et2',
    quote: 'We piloted the Classroom Program with our first-generation college students. The results were striking — not just in grades, but in how students talked about their own potential. This is the work that actually matters.',
    name: 'Prof. James Whitfield',
    role: 'Student Success Director',
    institution: 'Lakewood Community College',
  },
  {
    id: 'et3',
    quote: 'As a life coach, getting certified through Vibe Hyr gave me a structured, science-backed methodology to replace my patchwork of techniques. My clients get faster, deeper results. My practice doubled.',
    name: 'Imani Foster',
    role: 'Certified Life Coach',
    institution: 'Private Practice',
  },
]

export const EDUCATION_FAQS: EducationFAQ[] = [
  {
    id: 'efaq-1',
    question: 'Is this content appropriate for younger students?',
    answer: 'The Individual Educator and Classroom Programs include age-adapted materials. The neuroscience of the RAS is approachable for students as young as 12. We provide facilitator guidance for adjusting depth, language, and exercises by age group.',
  },
  {
    id: 'efaq-2',
    question: 'Does this conflict with religious or secular environments?',
    answer: 'The core curriculum is grounded in neuroscience and psychology — specifically the Reticular Activating System and cognitive behavioral patterns. Spiritual frameworks are referenced but never required. The content has been delivered successfully in secular schools, faith-based institutions, and everything in between.',
  },
  {
    id: 'efaq-3',
    question: 'How long does the certification process take?',
    answer: 'Most educators complete the certification in 6–8 weeks working part-time alongside their existing responsibilities. The practicum can be scheduled flexibly. Once certified, you keep your credentials permanently.',
  },
  {
    id: 'efaq-4',
    question: 'Can I use this in a private coaching practice?',
    answer: 'Yes. The Individual Educator license is perfect for coaches, therapists, and private practitioners. It gives you the framework, tools, and certification to formally integrate Vibe Hyr methodology into client sessions.',
  },
  {
    id: 'efaq-5',
    question: 'Does the Classroom Program integrate with our LMS?',
    answer: 'The Institutional Partnership tier includes LMS integration (Canvas, Blackboard, Google Classroom, and others). The Classroom Program uses the Vibe Hyr platform directly, which works on any device with no installation required.',
  },
  {
    id: 'efaq-6',
    question: 'What ongoing support is included?',
    answer: 'All educators get access to our private educator community, monthly facilitator calls with the Vibe Hyr team, and curriculum updates as we expand. Institutional partners also get a dedicated partnership manager.',
  },
]
