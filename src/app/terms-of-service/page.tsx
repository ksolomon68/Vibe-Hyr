import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Vibe Hyr — please read before using the platform.',
}

const LAST_UPDATED = 'March 1, 2025'

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="pt-[68px] min-h-screen">

        <section className="py-16 px-6 md:px-14 border-b-2 border-orange-DEFAULT/20 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-DEFAULT" />
          <div className="max-w-4xl mx-auto">
            <div className="label mb-3">Legal</div>
            <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[0.02em]">
              TERMS OF<br />
              <span className="text-orange-DEFAULT">SERVICE</span>
            </h1>
            <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-grey-DEFAULT mt-4">
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </section>

        <article className="py-14 px-6 md:px-14">
          <div className="max-w-4xl mx-auto">

            <p className="font-body text-grey-DEFAULT leading-relaxed mb-10 text-base italic">
              Please read these Terms of Service carefully before using the Vibe Hyr platform. By accessing or using vibehyr.com, you agree to be bound by these terms.
            </p>

            {[
              {
                title: '1. Acceptance of Terms',
                body: 'By creating an account or purchasing a membership on Vibe Hyr ("Platform"), you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the Platform.',
              },
              {
                title: '2. Description of Service',
                body: 'Vibe Hyr is an online membership platform offering educational courses, interactive tools, journaling features, and community access focused on consciousness, the Law of Assumption, and personal development. Content is provided for educational and informational purposes only.',
              },
              {
                title: '3. Eligibility',
                body: 'You must be at least 13 years of age to use the Platform. By using Vibe Hyr, you represent that you meet this requirement. If you are under 18, you must have parental or guardian consent.',
              },
              {
                title: '4. Accounts',
                body: `You are responsible for:

• Maintaining the confidentiality of your account credentials.
• All activity that occurs under your account.
• Providing accurate information during registration.

You must notify us immediately at hello@vibehyr.com if you suspect unauthorized use of your account. We reserve the right to terminate accounts that violate these Terms.`,
              },
              {
                title: '5. Membership and Billing',
                body: `Vibe Hyr offers free and paid membership tiers:

• **Seeker (Free):** Access to Course 1 and selected free content. No credit card required.
• **Architect ($27/month):** Full access to Courses 1–3, daily tools, and community posting.
• **Reality Master ($67/month):** Complete platform access including all courses and live Q&As.

Paid subscriptions are billed monthly and renew automatically. You may cancel at any time. Cancellation takes effect at the end of your current billing period — you retain access until that date.

We offer a 7-day money-back guarantee on all paid plans. To request a refund, contact hello@vibehyr.com within 7 days of your first charge.`,
              },
              {
                title: '6. Intellectual Property',
                body: 'All content on the Platform — including courses, videos, written material, quizzes, journal frameworks, and design — is the property of Vibe Hyr and is protected by copyright law. You may not copy, reproduce, distribute, or create derivative works from any Platform content without express written permission.',
              },
              {
                title: '7. User-Generated Content',
                body: 'Content you create on the Platform (journal entries, community posts, forum replies) remains yours. By posting community content, you grant Vibe Hyr a non-exclusive license to display it on the Platform. You are solely responsible for the accuracy and appropriateness of content you post. We reserve the right to remove content that violates these Terms or our community guidelines.',
              },
              {
                title: '8. Prohibited Conduct',
                body: `You agree not to:

• Share your account credentials with others.
• Reproduce, resell, or distribute Platform content without permission.
• Post harmful, abusive, harassing, or unlawful content in community spaces.
• Attempt to hack, scrape, or disrupt the Platform or its servers.
• Impersonate other users or Vibe Hyr staff.
• Use the Platform for any commercial purpose without our written consent.

Violations may result in immediate account termination without refund.`,
              },
              {
                title: '9. Disclaimer of Warranties',
                body: 'The Platform is provided "as is" without warranties of any kind. We do not guarantee that course content will produce specific results. Personal development outcomes depend entirely on individual effort, consistency, and circumstances. Vibe Hyr is an educational platform — it is not a medical, psychological, or therapeutic service.',
              },
              {
                title: '10. Limitation of Liability',
                body: 'To the maximum extent permitted by law, Vibe Hyr shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform. Our total liability to you for any claim shall not exceed the amount you paid us in the three months preceding the claim.',
              },
              {
                title: '11. Third-Party Links',
                body: 'The Platform may contain links to third-party websites (including Stripe, Supabase, and social media). We are not responsible for the content or practices of those sites and encourage you to review their terms and privacy policies.',
              },
              {
                title: '12. Modifications to the Platform and Terms',
                body: 'We reserve the right to modify, suspend, or discontinue any feature of the Platform at any time. We may also update these Terms — we will notify you of material changes via email or a notice on the Platform. Continued use after changes constitutes acceptance.',
              },
              {
                title: '13. Governing Law',
                body: 'These Terms are governed by the laws of the United States. Any disputes arising from your use of the Platform shall be resolved through binding arbitration, except where prohibited by law.',
              },
              {
                title: '14. Contact',
                body: 'If you have questions about these Terms, please contact us at:\n\nVibe Hyr\nhello@vibehyr.com\nhttps://vibehyr.com',
              },
            ].map(({ title, body }) => (
              <div key={title} className="mb-10">
                <h2 className="font-display text-2xl tracking-[0.03em] text-orange-DEFAULT mb-4">{title}</h2>
                <div className="font-body text-grey-DEFAULT leading-relaxed text-base">
                  {body.split('\n\n').map((para, i) => {
                    if (para.includes('•')) {
                      return (
                        <ul key={i} className="space-y-2 mb-3">
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
                    return <p key={i} className="mb-3">{para}</p>
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
