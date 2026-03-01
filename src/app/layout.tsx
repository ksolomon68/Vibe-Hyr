import type { Metadata } from 'next'
import { Bebas_Neue, Barlow, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const barlow = Barlow({
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-barlow',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Vibe Hyr — Raise Your Reality',
    template: '%s | Vibe Hyr',
  },
  description: 'Master your internal state, transform your external world. Courses, quizzes, daily journaling, and a community built on the neuroscience of consciousness and the Law of Assumption.',
  keywords: ['law of assumption', 'neville goddard', 'manifestation', 'SATS', 'subconscious reprogramming', 'reality creation'],
  openGraph: {
    title: 'Vibe Hyr — Raise Your Reality',
    description: 'The Architecture of Reality — a membership platform where neuroscience meets manifestation.',
    url: 'https://vibehyr.com',
    siteName: 'Vibe Hyr',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${barlow.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-body antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid rgba(255,123,0,0.4)',
              fontFamily: 'var(--font-ibm-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
            },
          }}
        />
      </body>
    </html>
  )
}
