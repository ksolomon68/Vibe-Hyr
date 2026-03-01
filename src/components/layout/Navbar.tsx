'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { cn, getTierLabel } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/courses', label: 'Courses' },
  { href: '/journal', label: 'Journal' },
  { href: '/quizzes', label: 'Quizzes' },
  { href: '/community', label: 'Community' },
  { href: '/blog', label: 'Blog' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setProfile(data))
      }
    })
  }, [])

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          'border-b-2 border-[var(--orange)]',
          scrolled ? 'bg-black/95 backdrop-blur-sm' : 'bg-black'
        )}
      >
        <div className="flex items-center justify-between h-[68px] px-6 md:px-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/images/vhlogo.png"
              alt="Vibe Hyr"
              width={160}
              height={48}
              className="object-contain h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'font-mono text-[0.62rem] tracking-[0.18em] uppercase transition-colors duration-200',
                    pathname.startsWith(link.href)
                      ? 'text-[var(--orange)]'
                      : 'text-[var(--grey)] hover:text-[var(--orange)]'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {profile ? (
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full bg-[var(--black-3)] border-2 border-[var(--orange)] flex items-center justify-center">
                  <span className="font-display text-sm text-[var(--orange)]">
                    {profile.full_name?.[0] ?? profile.email[0].toUpperCase()}
                  </span>
                </div>
                <span className="font-mono text-[0.6rem] text-[var(--grey)] tracking-widest uppercase group-hover:text-[var(--orange)] transition-colors">
                  {getTierLabel(profile.membership_tier)}
                </span>
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="font-mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--grey)] hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link href="/auth/signup" className="btn-orange text-sm py-2.5 px-5">
                  Join Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white"
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black pt-[68px] md:hidden">
          <div className="flex flex-col p-8 gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-display text-3xl tracking-widest text-white hover:text-[var(--orange)] transition-colors"
              >
                {link.label.toUpperCase()}
              </Link>
            ))}
            <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
              {profile ? (
                <Link href="/dashboard" onClick={() => setOpen(false)} className="btn-orange text-center">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setOpen(false)} className="btn-outline text-center">
                    Log In
                  </Link>
                  <Link href="/auth/signup" onClick={() => setOpen(false)} className="btn-orange text-center">
                    Join Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
