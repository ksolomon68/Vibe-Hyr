import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility Statement | Vibe Hyr',
  description: 'Vibe Hyr is committed to ensuring digital accessibility for people with disabilities. Learn about our conformance status, measures taken, and how to report barriers.',
}

const SECTIONS = [
  {
    heading: 'Our Commitment',
    body: 'Vibe Hyr is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.',
  },
  {
    heading: 'Conformance Status',
    body: 'We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. WCAG defines requirements for designers and developers to improve accessibility for people with disabilities.',
  },
  {
    heading: 'Measures Taken',
    body: 'Vibe Hyr includes an on-page accessibility toolbar that allows users to:',
    list: [
      'Adjust text size (increase or decrease)',
      'Enable high contrast mode',
      'Activate a dyslexia-friendly font (OpenDyslexic)',
      'Reduce or disable motion and animations',
      'Apply grayscale for color-sensitive users',
    ],
    body2: 'All interactive elements — buttons, links, dropdowns, and form fields — are keyboard navigable with visible focus indicators.',
  },
  {
    heading: 'Known Limitations',
    body: 'We are actively working to address the following areas:',
    list: [
      'Improving closed captions and transcripts on video lesson content',
      'Expanding alternative text descriptions on all instructional imagery',
      'Enhancing screen reader compatibility within interactive quiz modules',
    ],
  },
  {
    heading: 'Technical Information',
    body: 'This platform relies on HTML, CSS, and JavaScript technologies. We use semantic HTML5 elements, ARIA roles and labels, and visible focus management to support assistive technologies including screen readers (NVDA, VoiceOver, JAWS) and keyboard-only navigation.',
  },
  {
    heading: 'Feedback & Contact',
    body: 'If you experience any accessibility barriers on this platform, we want to know. Please contact us at:',
    contact: 'accessibility@vibehyr.com',
  },
  {
    heading: 'Last Reviewed',
    body: 'March 2026',
  },
]

export default function AccessibilityPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[68px] min-h-screen bg-black">
        {/* Hero */}
        <section className="py-20 px-6 md:px-14 border-b border-white/8">
          <div className="max-w-4xl mx-auto">
            <div className="label mb-4">Legal &amp; Policies</div>
            <h1 className="font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] tracking-[0.02em] mb-6">
              ACCESSIBILITY
              <br />
              <span className="text-orange-DEFAULT">STATEMENT</span>
            </h1>
            <p className="font-body text-lg text-grey-DEFAULT leading-relaxed max-w-2xl">
              Vibe Hyr is committed to making this platform usable by everyone,
              regardless of disability, assistive technology, or browsing environment.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-6 md:px-14">
          <div className="max-w-4xl mx-auto space-y-12">
            {SECTIONS.map((s) => (
              <div key={s.heading} className="border-l-2 border-orange-DEFAULT/30 pl-8">
                <h2 className="font-display text-2xl md:text-3xl tracking-[0.04em] text-orange-DEFAULT mb-4">
                  {s.heading.toUpperCase()}
                </h2>
                {s.body && (
                  <p className="font-body text-base text-[#D1D5DB] leading-[1.75] mb-4">
                    {s.body}
                  </p>
                )}
                {s.list && (
                  <ul className="flex flex-col gap-3 mb-4 pl-0">
                    {s.list.map((item) => (
                      <li key={item} className="flex items-start gap-3 font-body text-base text-[#D1D5DB] leading-relaxed">
                        <span className="text-orange-DEFAULT mt-1.5 text-xs flex-shrink-0">■</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.body2 && (
                  <p className="font-body text-base text-[#D1D5DB] leading-[1.75]">
                    {s.body2}
                  </p>
                )}
                {s.contact && (
                  <a
                    href={`mailto:${s.contact}`}
                    className="font-mono text-sm text-orange-DEFAULT underline underline-offset-4 hover:text-orange-bright transition-colors"
                  >
                    {s.contact}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* WCAG Standards reference */}
        <section className="py-12 px-6 md:px-14 border-t border-white/8">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-grey-DEFAULT uppercase">
              Standards Reference: WCAG 2.1 Level AA · Section 508 · ADA Title III
            </p>
            <a
              href="https://www.w3.org/TR/WCAG21/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[0.65rem] tracking-[0.18em] uppercase text-orange-DEFAULT hover:text-orange-bright transition-colors"
            >
              View WCAG 2.1 Guidelines →
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
