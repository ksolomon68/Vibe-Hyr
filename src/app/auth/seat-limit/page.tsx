// app/auth/seat-limit/page.tsx
// Shown when a user tries to register under an org that's hit its seat cap.

'use client'

import { useSearchParams } from 'next/navigation'

export default function SeatLimitPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#111',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: 24,
    }}>
      <div style={{
        maxWidth: 480,
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ color: '#F97316', fontWeight: 900, fontSize: 28, letterSpacing: 2 }}>VIBE</span>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 28, letterSpacing: 2 }}>HYR</span>
        </div>

        {/* Icon */}
        <div style={{
          width: 64, height: 64,
          borderRadius: '50%',
          background: '#1a1a1a',
          border: '2px solid #F97316',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: 28,
        }}>🔒</div>

        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
          Seat Limit Reached
        </h1>
        <p style={{ color: '#aaa', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          Your organization has used all available seats on its current plan.
          Your administrator has been notified and can upgrade to add more seats.
        </p>

        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderLeft: '3px solid #F97316',
          borderRadius: 4,
          padding: '16px 20px',
          textAlign: 'left',
          marginBottom: 32,
        }}>
          <p style={{ color: '#F97316', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
            WHAT HAPPENS NEXT
          </p>
          <ul style={{ color: '#ccc', fontSize: 13, lineHeight: 2, margin: 0, paddingLeft: 16 }}>
            <li>Your admin receives an upgrade notification</li>
            <li>Once seats are added, you can sign in immediately</li>
            <li>Contact your admin to request access</li>
          </ul>
        </div>

        <a href="/" style={{
          display: 'inline-block',
          background: '#F97316',
          color: '#fff',
          padding: '12px 28px',
          borderRadius: 4,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1,
          textDecoration: 'none',
        }}>
          RETURN HOME
        </a>
      </div>
    </div>
  )
}
