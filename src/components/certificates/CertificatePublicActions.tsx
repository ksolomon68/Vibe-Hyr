'use client'

import { useState } from 'react'
import { generateCertificatePDF } from '@/lib/utils/generateCertificatePDF'

interface Props {
  certificateNumber: string
  issuedAt:          string
  memberName:        string
  shareToken:        string
}

export function CertificatePublicActions({ certificateNumber, issuedAt, memberName, shareToken }: Props) {
  const [copied,   setCopied]   = useState(false)
  const [verified, setVerified] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const shareUrl = `https://vibehyr.com/certificate/${shareToken}`

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    } catch { return iso }
  }

  async function handleDownload() {
    setPdfLoading(true)
    try {
      const filename = `${memberName.replace(/\s+/g, '-')}-Vibe-Hyr-Certificate.pdf`
      await generateCertificatePDF('certificate-template', filename)
    } catch (e) {
      console.error(e)
    } finally {
      setPdfLoading(false)
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const C = {
    btn: {
      padding: '12px 28px', borderRadius: 4, fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600, fontSize: 13, letterSpacing: '0.1em',
      textTransform: 'uppercase' as const, cursor: 'pointer', border: 'none',
      transition: 'opacity 0.2s',
    },
  }

  return (
    <div style={{ maxWidth: 760, margin: '36px auto 0', padding: '0 24px' }}>
      {/* ── Action buttons ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
        <button
          onClick={handleDownload}
          disabled={pdfLoading}
          style={{ ...C.btn, background: '#E8621A', color: '#fff', opacity: pdfLoading ? 0.7 : 1 }}
        >
          {pdfLoading ? 'Generating…' : '⬇ Download PDF'}
        </button>
        <button
          onClick={handleCopyLink}
          style={{ ...C.btn, background: 'transparent', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.4)' }}
        >
          {copied ? '✓ Copied!' : '🔗 Copy Share Link'}
        </button>
        <button
          onClick={() => setVerified(v => !v)}
          style={{ ...C.btn, background: 'transparent', color: '#888', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {verified ? 'Hide Verification' : 'Verify Certificate'}
        </button>
      </div>

      {/* ── Verification panel ─────────────────────────────────────────── */}
      {verified && (
        <div style={{
          background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: 6, padding: '24px 28px',
        }}>
          <div style={{
            fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#E8621A', marginBottom: 16,
          }}>
            Certificate Verification
          </div>
          {[
            { label: 'Certificate Number', value: certificateNumber },
            { label: 'Member Name',        value: memberName },
            { label: 'Issue Date',         value: formatDate(issuedAt) },
            { label: 'Status',             value: '✓ Valid & Authentic' },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ fontSize: 12, color: '#666', letterSpacing: '0.06em' }}>
                {row.label}
              </span>
              <span style={{ fontSize: 13, color: row.label === 'Status' ? '#22c55e' : '#ccc', fontFamily: row.label === 'Certificate Number' ? 'monospace' : 'inherit' }}>
                {row.value}
              </span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#555', marginTop: 14, lineHeight: 1.6 }}>
            This certificate was issued by Vibe Hyr and can be verified at{' '}
            <span style={{ color: '#E8621A' }}>{shareUrl}</span>
          </div>
        </div>
      )}
    </div>
  )
}
