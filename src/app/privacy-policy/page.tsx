import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Vibe Hyr — how we collect, use, and protect your information.',
}

const LAST_UPDATED = 'March 1, 2025'

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[68px] min-h-screen">

        <section className="py-16 px-6 md:px-14 border-b-2 border-orange-DEFAULT/20 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          <div className="max-w-4xl mx-auto">
            <div className="label mb-3">Legal</div>
            <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[0.02em]">
              PRIVACY<br />
              <span className="text-orange-DEFAULT">POLICY</span>
            </h1>
            <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-DEFAULT mt-4">
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </section>

        <article className="py-14 px-6 md:px-14">
          <div className="max-w-4xl mx-auto prose-custom">

            {[
              {
                title: '1. Who We Are',
                body: 'Vibe Hyr ("we," "us," or "our") operates the website https://vibehyr.com and the Vibe Hyr membership platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or purchase a membership.',
              },
              {
                title: '2. Information We Collect',
                body: `We collect information you provide directly, including:

• **Account information:** name, email address, and password when you create an account.
• **Profile data:** membership tier, journal entries, quiz responses, and course progress.
• **Payment information:** processed securely by Stripe. We do not store your credit card details on our servers.
• **Communications:** messages you send us via email or contact forms.

We also collect information automatically:

• **Usage data:** pages visited, time spent, features used.
• **Device data:** browser type, IP address, operating system.
• **Cookies:** session tokens and preference data (see Section 6).`,
              },
              {
                title: '3. How We Use Your Information',
                body: `We use the information we collect to:

• Provide, maintain, and improve the Vibe Hyr platform.
• Process your subscription and send billing communications.
• Personalize your experience (course progress, journal streaks, dashboard).
• Send service-related emails (account confirmation, password reset, billing receipts).
• Respond to your support inquiries.
• Comply with legal obligations.

We do not sell, rent, or trade your personal information to third parties for marketing purposes.`,
              },
              {
                title: '4. Third-Party Services',
                body: `We use trusted third-party services to operate the platform:

• **Supabase** — database, authentication, and user management. Data is stored on Supabase's secure servers.
• **Stripe** — payment processing. Stripe's privacy policy governs how it handles your payment data.
• **Vercel / Hostinger** — hosting and infrastructure.

These services have their own privacy policies and we encourage you to review them.`,
              },
              {
                title: '5. Data Retention',
                body: 'We retain your account data for as long as your account is active. If you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain it by law (e.g., billing records).',
              },
              {
                title: '6. Cookies',
                body: 'We use essential cookies to maintain your login session and preferences. We do not use advertising or tracking cookies. You may disable cookies in your browser settings, but this may affect your ability to use the platform.',
              },
              {
                title: '7. Your Rights',
                body: `Depending on your location, you may have the right to:

• Access the personal data we hold about you.
• Request correction of inaccurate data.
• Request deletion of your account and data.
• Object to or restrict certain processing.
• Data portability (receive your data in a machine-readable format).

To exercise any of these rights, contact us at hello@vibehyr.com.`,
              },
              {
                title: '8. Data Security',
                body: 'We implement industry-standard security measures including encrypted connections (HTTPS), hashed passwords, and restricted database access. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.',
              },
              {
                title: '9. Children\'s Privacy',
                body: 'The Vibe Hyr platform is not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.',
              },
              {
                title: '10. Changes to This Policy',
                body: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a prominent notice on our website. Your continued use of the platform after changes constitutes acceptance of the updated policy.',
              },
              {
                title: '11. Contact Us',
                body: 'If you have questions or concerns about this Privacy Policy or how we handle your data, please contact us at:\n\nVibe Hyr\nhello@vibehyr.com\nhttps://vibehyr.com',
              },
            ].map(({ title, body }) => (
              <div key={title} className="mb-10">
                <h2 className="font-display text-2xl tracking-[0.03em] text-orange-DEFAULT mb-4">{title}</h2>
                <div className="font-body text-grey-DEFAULT leading-relaxed text-base space-y-3">
                  {body.split('\n\n').map((para, i) => {
                    if (para.includes('•')) {
                      return (
                        <ul key={i} className="space-y-2">
                          {para.split('\n').filter(l => l.trim()).map((line, j) => (
                            <li key={j} className="flex items-start gap-2">
                              {line.startsWith('•') ? (
                                <>
                                  <span className="text-orange-DEFAULT mt-1 flex-shrink-0">✦</span>
                                  <span dangerouslySetInnerHTML={{ __html: line.slice(1).trim().replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                                </>
                              ) : (
                                <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                              )}
                            </li>
                          ))}
                        </ul>
                      )
                    }
                    return <p key={i}>{para}</p>
                  })}
                </div>
              </div>
            ))}

          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
