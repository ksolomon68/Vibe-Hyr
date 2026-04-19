// src/app/certificate/[token]/page.tsx
// PUBLIC route — no auth required.
// Renders a shared certificate by share_token.

import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { CertificateTemplate } from '@/components/certificates/CertificateTemplate'
import { CertificatePublicActions } from '@/components/certificates/CertificatePublicActions'
import { Navbar } from '@/components/layout/Navbar'

interface Props {
  params: { token: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const admin = createAdminClient()
  const { data: cert } = await admin
    .from('certificates')
    .select('member_name, course_title, is_valid')
    .eq('share_token', params.token)
    .maybeSingle()

  if (!cert || !cert.is_valid) {
    return {
      title: 'Certificate Not Found — Vibe Hyr',
      description: 'This certificate could not be found or has been revoked.',
    }
  }

  return {
    title:       `${cert.member_name} — Vibe Hyr Certificate of Completion`,
    description: `Certified in ${cert.course_title} · Neural Reality Architecture`,
    openGraph: {
      title:    `${cert.member_name} — Vibe Hyr Certificate`,
      description: `Certified in ${cert.course_title} · Neural Reality Architecture`,
      images: [{ url: 'https://vibehyr.com/og-certificate.png', width: 1200, height: 630 }],
    },
  }
}

export default async function CertificatePage({ params }: Props) {
  const admin = createAdminClient()

  // ── Fetch certificate ──────────────────────────────────────────────────────
  const { data: cert } = await admin
    .from('certificates')
    .select('*')
    .eq('share_token', params.token)
    .maybeSingle()

  // ── Fetch signature URL ────────────────────────────────────────────────────
  const { data: sigRow } = await admin
    .from('platform_settings')
    .select('value')
    .eq('key', 'founder_signature_url')
    .maybeSingle()

  const signatureUrl = sigRow?.value ?? null

  // ── Not found / revoked ────────────────────────────────────────────────────
  if (!cert || !cert.is_valid) {
    return (
      <>
        <Navbar />
        <main style={{
          minHeight: '100vh', background: '#0a0a0a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif",
          paddingTop: 80,
        }}>
          <div style={{ textAlign: 'center', maxWidth: 520, padding: '0 24px' }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 48, letterSpacing: '0.1em', color: '#fff', marginBottom: 12,
            }}>
              CERTIFICATE NOT FOUND
            </div>
            <p style={{ color: '#888', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
              This certificate could not be found or has been revoked by the platform administrator.
            </p>
            <a
              href="/dashboard"
              style={{
                display: 'inline-block',
                background: '#E8621A', color: '#fff',
                padding: '12px 32px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600, fontSize: 13,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: 4,
              }}
            >
              Return to Dashboard
            </a>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main style={{
        minHeight: '100vh', background: '#0a0a0a',
        paddingTop: 90, paddingBottom: 80,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 40, padding: '0 24px' }}>
          <p style={{
            fontFamily: 'monospace', fontSize: 11,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#E8621A', marginBottom: 8,
          }}>
            Verified Certificate
          </p>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 40, color: '#fff', letterSpacing: '0.08em',
            margin: 0,
          }}>
            {cert.member_name}
          </h1>
          <p style={{ color: '#888', fontSize: 15, marginTop: 6 }}>
            {cert.course_title}
          </p>
        </div>

        {/* ── Certificate canvas ─────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 12px' }}>
          <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
            <CertificateTemplate
              memberName={cert.member_name}
              courseTitle={cert.course_title}
              certificateNumber={cert.certificate_number}
              issuedAt={cert.issued_at}
              signatureUrl={signatureUrl}
            />
          </div>
        </div>

        {/* ── Actions (client component) ─────────────────────────────── */}
        <CertificatePublicActions
          certificateNumber={cert.certificate_number}
          issuedAt={cert.issued_at}
          memberName={cert.member_name}
          shareToken={params.token}
        />
      </main>
    </>
  )
}
