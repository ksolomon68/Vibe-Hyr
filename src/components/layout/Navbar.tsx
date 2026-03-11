'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { cn, getTierLabel } from '@/lib/utils'

const WORKPLACE_TRACKS = [
  { href: '/workplace/learn/t1/t1l1', label: 'Track 01 — Common Sense', tag: 'T1' },
  { href: '/workplace/learn/t2/t2l1', label: 'Track 02 — De-Escalation', tag: 'T2' },
  { href: '/workplace/learn/t3/t3l1', label: 'Track 03 — Self Mastery', tag: 'T3' },
  { href: '/workplace/learn/t4/t4l1', label: 'Track 04 — Team Cohesion', tag: 'T4' },
]

const NAV_LINKS = [
  { href: '/courses', label: 'Courses' },
  { href: '/education', label: 'Education' },
  { href: '/workplace', label: 'Workplace', hasDropdown: true },
  { href: '/journal', label: 'Journal' },
  { href: '/community', label: 'Community' },
  { href: '/blog', label: 'Blog' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [workplaceOpen, setWorkplaceOpen] = useState(false)
  const [mobileWorkplaceOpen, setMobileWorkplaceOpen] = useState(false)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setWorkplaceOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setWorkplaceOpen(false)
    setOpen(false)
  }, [pathname])

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
      } else {
        setProfile(null)
      }
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)
    window.location.href = '/'
  }

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
            {NAV_LINKS.map((link) =>
              link.hasDropdown ? (
                <li key={link.href} className="relative" ref={dropdownRef}>
                  {/* Workplace trigger */}
                  <button
                    onClick={() => setWorkplaceOpen((v) => !v)}
                    onKeyDown={(e) => e.key === 'Escape' && setWorkplaceOpen(false)}
                    aria-haspopup="true"
                    aria-expanded={workplaceOpen}
                    aria-label="Workplace training tracks"
                    className={cn(
                      'font-mono text-[0.62rem] tracking-[0.18em] uppercase transition-colors duration-200 flex items-center gap-1',
                      pathname.startsWith(link.href)
                        ? 'text-[var(--orange)]'
                        : 'text-[var(--grey)] hover:text-[var(--orange)]'
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      size={11}
                      className={cn(
                        'transition-transform duration-200',
                        workplaceOpen ? 'rotate-180' : ''
                      )}
                    />
                  </button>

                  {/* Dropdown panel */}
                  {workplaceOpen && (
                    <div
                      role="menu"
                      className={cn(
                        'absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64',
                        'bg-[#0E0C08] border border-[#2E2416] rounded-xl shadow-2xl',
                        'overflow-hidden z-50'
                      )}
                    >
                      {/* Header row */}
                      <div className="px-4 py-3 border-b border-[#2E2416] flex items-center justify-between">
                        <Link
                          href="/workplace"
                          className="font-mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--grey)] hover:text-[var(--orange)] transition-colors"
                          role="menuitem"
                        >
                          Workplace Overview
                        </Link>
                        <span className="font-mono text-[0.5rem] text-[#5A4A34] tracking-widest">
                          4 TRACKS
                        </span>
                      </div>

                      {/* Track links */}
                      {WORKPLACE_TRACKS.map((t) => (
                        <Link
                          key={t.href}
                          href={t.href}
                          role="menuitem"
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 group',
                            'hover:bg-[#1A1208] transition-colors duration-150',
                            pathname === t.href ? 'bg-[#1A1208]' : ''
                          )}
                        >
                          <span
                            className={cn(
                              'font-mono text-[0.52rem] tracking-widest px-1.5 py-0.5 rounded',
                              'border border-[var(--orange)] text-[var(--orange)]',
                              'group-hover:bg-[var(--orange)] group-hover:text-black transition-all duration-150'
                            )}
                          >
                            {t.tag}
                          </span>
                          <span className="font-sans text-[0.75rem] text-[#8C7A60] group-hover:text-[#F7F2EA] transition-colors duration-150">
                            {t.label.split(' — ')[1]}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ) : (
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
              )
            )}
          </ul>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {profile ? (
              <div className="flex items-center gap-6">
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
                <button
                  onClick={handleLogout}
                  className="font-mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--grey)] hover:text-white transition-colors"
                >
                  Log Out
                </button>
              </div>
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
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black pt-[68px] md:hidden overflow-y-auto"
          role="dialog"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col p-8 gap-6">
            {NAV_LINKS.map((link) =>
              link.hasDropdown ? (
                <div key={link.href}>
                  <button
                    onClick={() => setMobileWorkplaceOpen((v) => !v)}
                    aria-expanded={mobileWorkplaceOpen}
                    className="font-display text-3xl tracking-widest text-white hover:text-[var(--orange)] transition-colors flex items-center gap-3 w-full text-left"
                  >
                    WORKPLACE
                    <ChevronDown
                      size={20}
                      className={cn(
                        'mt-1 transition-transform duration-200',
                        mobileWorkplaceOpen ? 'rotate-180' : ''
                      )}
                    />
                  </button>
                  {mobileWorkplaceOpen && (
                    <div className="mt-3 pl-4 flex flex-col gap-3 border-l-2 border-[var(--orange)]">
                      <Link
                        href="/workplace"
                        onClick={() => setOpen(false)}
                        className="font-mono text-xs tracking-widest text-[#8C7A60] hover:text-[var(--orange)] transition-colors uppercase"
                      >
                        Overview
                      </Link>
                      {WORKPLACE_TRACKS.map((t) => (
                        <Link
                          key={t.href}
                          href={t.href}
                          onClick={() => setOpen(false)}
                          className="font-sans text-base text-[#8C7A60] hover:text-[#F7F2EA] transition-colors"
                        >
                          <span className="font-mono text-xs text-[var(--orange)] mr-2">{t.tag}</span>
                          {t.label.split(' — ')[1]}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-3xl tracking-widest text-white hover:text-[var(--orange)] transition-colors"
                >
                  {link.label.toUpperCase()}
                </Link>
              )
            )}

            <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
              {profile ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="btn-orange text-center">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn-outline text-center">
                    Log Out
                  </button>
                </>
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
