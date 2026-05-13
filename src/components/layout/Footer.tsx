'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Crown, Facebook, Youtube, Instagram } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const SOCIAL = [
  { label: 'Facebook',  href: 'https://www.facebook.com/vibehyr',                          Icon: Facebook  },
  { label: 'YouTube',   href: 'https://www.youtube.com/channel/UCMiPrWX7J7uNbZD0wG80b-Q', Icon: Youtube   },
  { label: 'Instagram', href: 'https://www.instagram.com/vibe_hyr/',                       Icon: Instagram },
]

const PLATFORM_LINKS = [
  { label: 'Personal',   href: '/personal'   },
  { label: 'Educators',  href: '/educators'  },
  { label: 'Business',   href: '/business'   },
  { label: 'Leadership', href: '/leadership' },
  { label: 'Journal',    href: '/journal'    },
  { label: 'Community',  href: '/community'  },
]

const LEARN_LINKS = [
  { label: 'Blog',            href: '/blog'          },
  { label: 'Free SATS Guide', href: '/blog/sats-guide' },
  { label: 'Pricing',         href: '/pricing'      },
]

export function Footer() {
  const [loggedIn, setLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user))
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setLoggedIn(false)
    router.push('/')
    router.refresh()
  }

  return (
    <footer className="border-t-2 border-[var(--orange)] bg-[var(--black-2)] pt-16 pb-8">
      <div className="vh-grid-container">
        
        {/* Brand */}
        <div className="vh-grid-qrtr mb-8 md:mb-0">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-display text-3xl tracking-widest text-[var(--orange)]">
              VIBE<span className="text-white">HYR</span>
            </span>
            <Crown size={12} className="text-[var(--orange)] -mt-3" />
          </div>
          <p className="font-body text-sm text-[var(--grey)] leading-relaxed mb-6">
            Master your internal state. Transform your external world. The Architecture of Reality starts here.
          </p>
          <blockquote className="font-body italic text-sm text-[var(--grey)] border-l-2 border-[var(--orange)] pl-4">
            "Assume the feeling of your wish fulfilled."
            <cite className="block font-mono text-[0.6rem] tracking-widest mt-2 text-[var(--orange)] not-italic">
              — Neville Goddard
            </cite>
          </blockquote>
          <div className="flex gap-4 mt-6">
            {SOCIAL.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-[var(--grey)] hover:text-[var(--orange)] transition-colors"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div className="vh-grid-qrtr">
          <h4 className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-[var(--orange)] mb-5">Platform</h4>
          <ul className="flex flex-col gap-3">
            {PLATFORM_LINKS.map(link => (
              <li key={link.href}>
                <Link href={link.href} className="font-body text-sm text-[var(--grey)] hover:text-[var(--orange)] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Learn */}
        <div className="vh-grid-qrtr">
          <h4 className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-[var(--orange)] mb-5">Learn</h4>
          <ul className="flex flex-col gap-3">
            {LEARN_LINKS.map(link => (
              <li key={link.href}>
                <Link href={link.href} className="font-body text-sm text-[var(--grey)] hover:text-[var(--orange)] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account — auth-aware */}
        <div className="vh-grid-qrtr">
          <h4 className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-[var(--orange)] mb-5">Account</h4>
          <ul className="flex flex-col gap-3">
            {loggedIn ? (
              <>
                <li>
                  <Link href="/dashboard" className="font-body text-sm text-[var(--grey)] hover:text-[var(--orange)] transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="font-body text-sm text-[var(--grey)] hover:text-[var(--orange)] transition-colors"
                  >
                    Log Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/auth/signup" className="font-body text-sm text-[var(--grey)] hover:text-[var(--orange)] transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="font-body text-sm text-[var(--grey)] hover:text-[var(--orange)] transition-colors">
                    Log In
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="font-body text-sm text-[var(--grey)] hover:text-[var(--orange)] transition-colors">
                    Dashboard
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Bottom Bar */}
        <div className="vh-grid-full mt-16 pt-8 border-t border-white/10 vh-flex-between flex-col md:flex-row gap-4">
          <p className="font-mono text-[0.55rem] tracking-[0.2em] text-[var(--grey-d)] uppercase">
            © {new Date().getFullYear()} Vibe Hyr · All Rights Reserved
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(/ /g, '-')}`}
                className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-[var(--grey-d)] hover:text-[var(--orange)] transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
