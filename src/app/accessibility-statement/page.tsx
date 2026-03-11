import React from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'Accessibility Statement — Vibe Hyr',
  description: 'Our commitment to digital accessibility for all users.',
}

export default function AccessibilityStatementPage() {
  return (
    <main className="bg-black min-h-screen pt-20 text-white">
      <Navbar />
      
      <section className="py-20 px-6 md:px-14 max-w-4xl mx-auto">
        <h1 className="font-serif text-5xl md:text-6xl text-white mb-8">
          Accessibility <span className="text-orange-DEFAULT italic">Statement</span>
        </h1>
        
        <div className="space-y-8 text-white/70 leading-relaxed">
          <p>
            Vibe Hyr is committed to ensuring digital accessibility for all people, including those with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
          </p>

          <h2 className="text-3xl text-white font-serif mt-12 mb-4">Conformance Status</h2>
          <p>
            The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. Vibe Hyr is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard.
          </p>
          
          <h2 className="text-3xl text-white font-serif mt-12 mb-4">Feedback</h2>
          <p>
            We welcome your feedback on the accessibility of our platform. Please let us know if you encounter accessibility barriers on Vibe Hyr:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>E-mail: accessibility@vibehyr.com</li>
            <li>Postal address: 123 Vibe Hyr Way, Innovation City, TX 75000</li>
          </ul>
          <p className="mt-4">
            We try to respond to feedback within 5 business days.
          </p>

          <h2 className="text-3xl text-white font-serif mt-12 mb-4">Technical Specifications</h2>
          <p>
            Accessibility of Vibe Hyr relies on the following technologies to work with the particular combination of web browser and any assistive technologies or plugins installed on your computer:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>HTML</li>
            <li>WAI-ARIA</li>
            <li>CSS</li>
            <li>JavaScript</li>
          </ul>
          <p className="mt-4">
            These technologies are relied upon for conformance with the accessibility standards used.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
