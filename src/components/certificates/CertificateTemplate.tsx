'use client'

import React from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// CertificateTemplate
//
// Fixed 900×636px landscape canvas. Refs are forwarded so the parent can
// pass the id="certificate-template" div to html2canvas for PDF export.
//
// Brand: #0a0a0a bg, #E8621A accent, #C9A84C gold border, Bebas Neue headings
// ─────────────────────────────────────────────────────────────────────────────

export interface CertificateTemplateProps {
  memberName:        string
  courseTitle:       string
  certificateNumber: string
  issuedAt:          string   // ISO string
  signatureUrl:      string | null
}

function formatIssueDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function CertificateTemplate({
  memberName,
  courseTitle,
  certificateNumber,
  issuedAt,
  signatureUrl,
}: CertificateTemplateProps) {
  return (
    <div
      id="certificate-template"
      style={{
        width:           900,
        height:          636,
        background:      '#0a0a0a',
        position:        'relative',
        overflow:        'hidden',
        fontFamily:      "'DM Sans', sans-serif",
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '0',
        boxSizing:       'border-box',
      }}
    >
      {/* ── Font loader — required for html2canvas capture ─────────── */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&display=swap');`}</style>

      {/* ── Outer gold border ─────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 20,
        border: '2px solid #C9A84C',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* ── Inner thin line ───────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 26,
        border: '1px solid rgba(201,168,76,0.25)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* ── Corner ornaments ──────────────────────────────────────────── */}
      {[
        { top: 14, left: 14 },
        { top: 14, right: 14 },
        { bottom: 14, left: 14 },
        { bottom: 14, right: 14 },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos,
          width: 18, height: 18,
          borderTop:    i < 2 ? '2px solid #C9A84C' : undefined,
          borderBottom: i >= 2 ? '2px solid #C9A84C' : undefined,
          borderLeft:   (i === 0 || i === 2) ? '2px solid #C9A84C' : undefined,
          borderRight:  (i === 1 || i === 3) ? '2px solid #C9A84C' : undefined,
          zIndex: 2,
        }} />
      ))}

      {/* ── Radial glow background ────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        padding: '48px 72px',
        width: '100%', height: '100%',
        boxSizing: 'border-box',
        justifyContent: 'space-between',
      }}>

        {/* Top: wordmark + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28, letterSpacing: '0.18em',
            color: '#E8621A',
            lineHeight: 1,
          }}>
            VIBE<span style={{ color: '#fff' }}>HYR</span>
          </div>
          <div style={{ fontSize: 13, color: '#888', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            Neural Reality Architecture
          </div>
          {/* Thin divider */}
          <div style={{
            width: 80, height: 1,
            background: 'rgba(201,168,76,0.4)',
            marginTop: 12,
          }} />
        </div>

        {/* Middle: cert content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 48, color: '#fff',
            letterSpacing: '0.12em', lineHeight: 1.05,
          }}>
            Certificate of Completion
          </div>

          <div style={{ fontSize: 14, color: '#888', letterSpacing: '0.06em', marginTop: 6 }}>
            This certifies that
          </div>

          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 36, color: '#E8621A',
            letterSpacing: '0.1em', lineHeight: 1.1,
            maxWidth: 640, wordBreak: 'break-word',
          }}>
            {memberName}
          </div>

          <div style={{ fontSize: 14, color: '#888', letterSpacing: '0.06em' }}>
            has successfully completed
          </div>

          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28, color: '#fff',
            letterSpacing: '0.08em', lineHeight: 1.15,
            maxWidth: 580, wordBreak: 'break-word',
          }}>
            {courseTitle}
          </div>

          <div style={{ fontSize: 13, color: '#888', marginTop: 8, letterSpacing: '0.04em' }}>
            {formatIssueDate(issuedAt)}
          </div>
        </div>

        {/* Bottom row: cert number (left) + signature (right) */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          width: '100%',
        }}>
          {/* Certificate number */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 3 }}>
              Certificate No.
            </div>
            <div style={{ fontSize: 12, color: '#888', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
              {certificateNumber}
            </div>
          </div>

          {/* Signature block */}
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            {signatureUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={signatureUrl}
                alt="Founder signature"
                style={{ maxWidth: 120, maxHeight: 50, objectFit: 'contain' }}
                crossOrigin="anonymous"
              />
            ) : (
              <div style={{ height: 40, width: 120, borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
            )}
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 500, letterSpacing: '0.04em' }}>
              Keisha Solomon
            </div>
            <div style={{ fontSize: 12, color: '#888', letterSpacing: '0.04em' }}>
              Founder, Vibe Hyr
            </div>
          </div>
        </div>

      </div>

      {/* ── Subtle background texture lines ───────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.012) 39px, rgba(255,255,255,0.012) 40px)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
