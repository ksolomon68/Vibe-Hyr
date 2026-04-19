'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { generateCertificatePDF } from '@/lib/utils/generateCertificatePDF'
import { CertificateTemplate } from '@/components/certificates/CertificateTemplate'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Certificate {
  id:                 string
  course_id:          string
  vertical:           string
  certificate_number: string
  member_name:        string
  course_title:       string
  issued_at:          string
  share_token:        string
  is_valid:           boolean
}

interface Props {
  certificates: Certificate[]
  institutionType?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Vertical colors
// ─────────────────────────────────────────────────────────────────────────────
const VERTICAL_COLORS: Record<string, string> = {
  personal:   '#E8621A',
  business:   '#3B82F6',
  education:  '#10B981',
  leadership: '#8B5CF6',
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return iso }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function CertificateDashboard({ certificates, institutionType = 'individual' }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [copied,      setCopied]      = useState<string | null>(null)

  const browseLink = institutionType === 'education' ? '/education' :
                     institutionType === 'business'  ? '/business' :
                     institutionType === 'leadership'? '/leadership' :
                     '/personal'
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null)

  async function handleDownload(cert: Certificate) {
    setDownloading(cert.id)
    setPreviewCert(cert)
    // Wait one tick for the hidden template to mount
    await new Promise(r => setTimeout(r, 80))
    try {
      const filename = `${cert.member_name.replace(/\s+/g, '-')}-${cert.certificate_number}.pdf`
      await generateCertificatePDF('certificate-template', filename)
    } catch (e) {
      console.error(e)
    } finally {
      setDownloading(null)
      setPreviewCert(null)
    }
  }

  function handleCopyLink(cert: Certificate) {
    const url = `https://vibehyr.com/certificate/${cert.share_token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(cert.id)
      setTimeout(() => setCopied(null), 2500)
    })
  }

  const C = {
    s: { fontFamily: "'DM Sans', sans-serif", color: '#fff' },
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 28px 80px', ...C.s }}>
      {/* ── Head ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#E8621A', marginBottom: 8 }}>
          Your Achievements
        </p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: '0.06em', margin: 0 }}>
          YOUR CERTIFICATES
        </h1>
        <p style={{ color: '#888', fontSize: 15, marginTop: 8, lineHeight: 1.6 }}>
          Download or share your completed course certificates.
        </p>
      </div>

      {/* ── Empty state ────────────────────────────────────────────────── */}
      {certificates.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: 8, padding: '64px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.08em', marginBottom: 10 }}>
            No Certificates Yet
          </div>
          <p style={{ color: '#888', fontSize: 15, maxWidth: 380, margin: '0 auto', lineHeight: 1.7 }}>
            Complete a course to earn your first certificate. Your achievements will appear here.
          </p>
          <a href={browseLink} style={{
            display: 'inline-block', marginTop: 28,
            background: '#E8621A', color: '#fff',
            padding: '12px 28px', borderRadius: 4,
            fontWeight: 600, fontSize: 13, letterSpacing: '0.1em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Browse Courses →
          </a>
        </motion.div>
      )}

      {/* ── Grid ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
        gap: 20,
      }}>
        {certificates.map((cert, i) => {
          const verticalColor = VERTICAL_COLORS[cert.vertical] ?? '#E8621A'
          const isDownloading = downloading === cert.id
          const isCopied      = copied === cert.id

          return (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: 8, padding: 24,
                display: 'flex', flexDirection: 'column', gap: 14,
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Gold top line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />

              {/* Vertical badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20,
                background: `${verticalColor}18`, color: verticalColor,
                border: `1px solid ${verticalColor}40`, width: 'fit-content',
              }}>
                {cert.vertical}
              </span>

              {/* Course title */}
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '0.06em', lineHeight: 1.1 }}>
                {cert.course_title}
              </div>

              {/* Cert number + date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#888', fontFamily: 'monospace' }}>
                  {cert.certificate_number}
                </span>
                <span style={{ fontSize: 12, color: '#666' }}>
                  {formatDate(cert.issued_at)}
                </span>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleDownload(cert)}
                  disabled={isDownloading}
                  style={{
                    flex: 1, padding: '10px 0',
                    background: '#E8621A', color: '#fff',
                    border: 'none', borderRadius: 4, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                    fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
                    opacity: isDownloading ? 0.7 : 1, transition: 'opacity 0.2s',
                  }}
                >
                  {isDownloading ? 'Generating…' : '⬇ Download PDF'}
                </button>
                <button
                  onClick={() => handleCopyLink(cert)}
                  style={{
                    flex: 1, padding: '10px 0',
                    background: 'transparent', color: isCopied ? '#22c55e' : '#C9A84C',
                    border: `1px solid ${isCopied ? 'rgba(34,197,94,0.4)' : 'rgba(201,168,76,0.3)'}`,
                    borderRadius: 4, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                    fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
                    transition: 'all 0.2s',
                  }}
                >
                  {isCopied ? '✓ Copied!' : '🔗 Copy Link'}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Hidden template for PDF capture ───────────────────────────── */}
      {previewCert && (
        <div style={{ position: 'fixed', left: -9999, top: 0, zIndex: -1, pointerEvents: 'none' }}>
          <CertificateTemplate
            memberName={previewCert.member_name}
            courseTitle={previewCert.course_title}
            certificateNumber={previewCert.certificate_number}
            issuedAt={previewCert.issued_at}
            signatureUrl={null}
          />
        </div>
      )}
    </div>
  )
}
