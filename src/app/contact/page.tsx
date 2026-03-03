import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Mail, Instagram, Youtube, Facebook } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the Vibe Hyr team. We\'d love to hear from you.',
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[68px] min-h-screen">

        <section className="py-16 px-6 md:px-14 border-b-2 border-orange-DEFAULT/20 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          <div className="max-w-7xl mx-auto">
            <div className="label mb-3">Get In Touch</div>
            <h1 className="font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-[0.02em]">
              CONTACT<br />
              <span className="text-orange-DEFAULT">VIBE HYR</span>
            </h1>
            <p className="font-body italic text-grey-DEFAULT mt-4 max-w-xl text-lg leading-relaxed">
              Questions about the platform, membership, or the practice? We're here.
            </p>
          </div>
        </section>

        <div className="py-16 px-6 md:px-14">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">

            {/* Contact info */}
            <div>
              <h2 className="font-display text-3xl tracking-widest text-white mb-8">REACH US</h2>

              <div className="flex flex-col gap-6">
                <a
                  href="mailto:hello@vibehyr.com"
                  className="flex items-center gap-4 p-5 bg-black-2 border border-white/8 hover:border-orange-DEFAULT/40 transition-colors group"
                >
                  <div className="w-10 h-10 bg-orange-DEFAULT/10 border border-orange-DEFAULT/30 flex items-center justify-center flex-shrink-0">
                    <Mail size={18} className="text-orange-DEFAULT" />
                  </div>
                  <div>
                    <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-DEFAULT mb-0.5">Email</p>
                    <p className="font-body text-white group-hover:text-orange-DEFAULT transition-colors">hello@vibehyr.com</p>
                  </div>
                </a>

                <a
                  href="https://www.instagram.com/vibe_hyr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 bg-black-2 border border-white/8 hover:border-orange-DEFAULT/40 transition-colors group"
                >
                  <div className="w-10 h-10 bg-orange-DEFAULT/10 border border-orange-DEFAULT/30 flex items-center justify-center flex-shrink-0">
                    <Instagram size={18} className="text-orange-DEFAULT" />
                  </div>
                  <div>
                    <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-DEFAULT mb-0.5">Instagram</p>
                    <p className="font-body text-white group-hover:text-orange-DEFAULT transition-colors">@vibe_hyr</p>
                  </div>
                </a>

                <a
                  href="https://www.youtube.com/channel/UCMiPrWX7J7uNbZD0wG80b-Q"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 bg-black-2 border border-white/8 hover:border-orange-DEFAULT/40 transition-colors group"
                >
                  <div className="w-10 h-10 bg-orange-DEFAULT/10 border border-orange-DEFAULT/30 flex items-center justify-center flex-shrink-0">
                    <Youtube size={18} className="text-orange-DEFAULT" />
                  </div>
                  <div>
                    <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-DEFAULT mb-0.5">YouTube</p>
                    <p className="font-body text-white group-hover:text-orange-DEFAULT transition-colors">Vibe Hyr</p>
                  </div>
                </a>

                <a
                  href="https://www.facebook.com/vibehyr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 bg-black-2 border border-white/8 hover:border-orange-DEFAULT/40 transition-colors group"
                >
                  <div className="w-10 h-10 bg-orange-DEFAULT/10 border border-orange-DEFAULT/30 flex items-center justify-center flex-shrink-0">
                    <Facebook size={18} className="text-orange-DEFAULT" />
                  </div>
                  <div>
                    <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-DEFAULT mb-0.5">Facebook</p>
                    <p className="font-body text-white group-hover:text-orange-DEFAULT transition-colors">Vibe Hyr</p>
                  </div>
                </a>
              </div>

              <div className="mt-10 p-6 bg-black-2 border border-orange-DEFAULT/30">
                <p className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-orange-DEFAULT mb-2">Response Time</p>
                <p className="font-body text-sm text-grey-DEFAULT leading-relaxed">
                  We typically respond to email within 1–2 business days. For membership or billing questions, please include your account email so we can assist you faster.
                </p>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="font-display text-3xl tracking-widest text-white mb-8">QUICK ANSWERS</h2>
              <div className="flex flex-col gap-4">
                {[
                  {
                    q: 'How do I cancel my membership?',
                    a: 'You can cancel anytime from your Account Settings dashboard. Your access continues until the end of your billing period. No questions asked.',
                  },
                  {
                    q: 'Is there a free trial?',
                    a: 'Course 1 is permanently free — no card required. If you upgrade to a paid plan, we offer a 7-day money-back guarantee.',
                  },
                  {
                    q: 'I forgot my password. How do I reset it?',
                    a: 'Go to the login page and click "Forgot?" next to the password field. We\'ll send a reset link to your email immediately.',
                  },
                  {
                    q: 'Can I access the platform on mobile?',
                    a: 'Yes. Vibe Hyr is fully responsive and designed for both desktop and mobile. No app download required.',
                  },
                  {
                    q: 'What payment methods do you accept?',
                    a: 'We accept all major credit and debit cards through Stripe. All transactions are encrypted and secure.',
                  },
                ].map(({ q, a }) => (
                  <div key={q} className="p-5 bg-black-2 border border-white/8">
                    <p className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-orange-DEFAULT mb-2">{q}</p>
                    <p className="font-body text-sm text-grey-DEFAULT leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
