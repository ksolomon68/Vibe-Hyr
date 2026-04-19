'use client'

import Link from 'next/link'
import { Lock, Building2, ArrowRight } from 'lucide-react'
import type { AccessDeniedReason } from '@/lib/courseAccess'

interface Props {
  reason: AccessDeniedReason
  courseSlug: string
  sectionLabel?: string  // e.g. 'PERSONAL', 'BUSINESS', 'EDUCATION'
  backHref?: string      // override the secondary "go back" link
  backLabel?: string     // override the secondary link label
  adminEmail?: string    // institution admin email for institution_blocked screens
}

export function CourseLockedScreen({
  reason,
  courseSlug,
  sectionLabel = 'PERSONAL',
  backHref,
  backLabel,
  adminEmail,
}: Props) {
  const isInstitutionBlocked = reason === 'institution_blocked'
  const resolvedBackHref  = backHref  ?? `/personal/${courseSlug}`
  const resolvedBackLabel = backLabel ?? 'View Course Details'

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--dark, #0E0C08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        paddingTop: '100px',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          background: 'var(--panel, #141008)',
          border: '1px solid var(--border, #2E2416)',
          borderRadius: '12px',
          padding: '3rem 2.5rem',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(232,98,26,0.12)',
            border: '2px solid var(--orange, #E8621A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
          }}
        >
          {isInstitutionBlocked
            ? <Building2 size={32} color="var(--orange, #E8621A)" />
            : <Lock size={32} color="var(--orange, #E8621A)" />
          }
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)',
            fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
            letterSpacing: '0.08em',
            color: 'var(--cream, #F7F2EA)',
            marginBottom: '1rem',
            lineHeight: 1.1,
          }}
        >
          {isInstitutionBlocked ? 'Course Unavailable' : 'Upgrade to Unlock'}
        </h1>

        {/* Message */}
        <p
          style={{
            fontFamily: 'var(--font-dm, "DM Sans", sans-serif)',
            fontSize: '1rem',
            color: 'rgba(247,242,234,0.65)',
            lineHeight: 1.7,
            marginBottom: '2rem',
          }}
        >
          {isInstitutionBlocked
            ? "This course is not included in your institution\u2019s plan. Contact your administrator to request access."
            : `This course is available to a higher \u201c${sectionLabel}\u201d membership tier. Upgrade your plan to continue your journey.`}
        </p>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'var(--border, #2E2416)',
            marginBottom: '2rem',
          }}
        />

        {/* CTA */}
        {isInstitutionBlocked ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-ibm-mono, "IBM Plex Mono", monospace)',
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--gold, #C9A84C)',
              }}
            >
              Administrator Contact Required
            </p>
            {/* Primary action — contact admin or support */}
            <a
              href={`mailto:${adminEmail ?? 'support@vibehyr.com'}?subject=Course%20Access%20Request&body=Hi%2C%0A%0AI%20would%20like%20to%20request%20access%20to%20a%20course%20that%20is%20currently%20unavailable%20on%20my%20plan.%0A%0AThanks`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--orange, #E8621A)',
                color: '#fff',
                padding: '0.85rem 2rem',
                borderRadius: '6px',
                fontFamily: 'var(--font-ibm-mono, "IBM Plex Mono", monospace)',
                fontSize: '0.75rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'opacity 0.2s',
              }}
            >
              {adminEmail ? 'Contact Your Administrator' : 'Contact Support'}
            </a>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-ibm-mono, "IBM Plex Mono", monospace)',
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(247,242,234,0.5)',
                textDecoration: 'none',
              }}
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            <Link
              href="/pricing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--orange, #E8621A)',
                color: '#fff',
                padding: '0.85rem 2rem',
                borderRadius: '6px',
                fontFamily: 'var(--font-ibm-mono, "IBM Plex Mono", monospace)',
                fontSize: '0.75rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'opacity 0.2s',
              }}
            >
              Upgrade Plan <ArrowRight size={14} />
            </Link>
            <Link
              href={resolvedBackHref}
              style={{
                fontFamily: 'var(--font-ibm-mono, "IBM Plex Mono", monospace)',
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(247,242,234,0.45)',
                textDecoration: 'none',
              }}
            >
              {resolvedBackLabel}
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
