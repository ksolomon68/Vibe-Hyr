'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { cn, getTierLabel } from '@/lib/utils'
import { useTheme } from '@/app/providers/ThemeProvider'

const NAV_ITEMS = [
  {
    label: 'Personal',
    href: '/personal',
    dropdown: [
      { label: 'All Courses',               href: '/personal',                                              desc: 'Browse the full library' },
      { label: 'Programming the Gatekeeper',href: '/personal/programming-the-gatekeeper/c01-l01',          desc: 'Free · Start here' },
      { label: 'Mastery of Assumption',     href: '/personal/mastery-of-the-law-of-assumption/c02-l01',    desc: 'Architect tier' },
      { label: 'SATS Reprogramming',        href: '/personal/subconscious-reprogramming-sats/c03-l01',     desc: 'Architect tier' },
      { label: 'Echo Theory Delay',         href: '/personal/navigating-the-echo-theory-delay/c04-l01',    desc: 'Reality Master' },
    ]
  },
  {
    label: 'Educators',
    href: '/educators',
    dropdown: [
      { label: 'All Programs',              href: '/educators',                                             desc: 'Browse educator programs' },
      { label: 'The Educator Reset',        href: '/educators/the-educator-reset/ed01-m01',                desc: 'All K–12 staff' },
      { label: 'Vibrational Leadership',    href: '/educators/vibrational-leadership/ed02-m01',            desc: 'Admin & principals' },
      { label: 'Co-Regulation Mastery',     href: '/educators/co-regulation-mastery/ed03-m01',             desc: 'Classroom teachers' },
      { label: 'The Retained Educator',     href: '/educators/the-retained-educator/ed04-m01',             desc: 'Districts & HR' },
    ]
  },
  {
    label: 'Business',
    href: '/business',
    dropdown: [
      { label: 'All Tracks',                href: '/business',                                              desc: 'Browse training tracks' },
      { label: 'Common Sense in the Workplace', href: '/business/learn/t1/t1l1',                           desc: 'Foundation' },
      { label: 'From Reaction to Response', href: '/business/learn/t2/t2l1',                               desc: 'De-escalation' },
      { label: 'Know Yourself, Lead Yourself',  href: '/business/learn/t3/t3l1',                           desc: 'Self mastery' },
      { label: 'Vibing as a Unit',          href: '/business/learn/t4/t4l1',                               desc: 'Team cohesion' },
    ]
  },
]

const STATIC_LINKS = [
  { href: '/journal', label: 'Journal' },
  { href: '/community', label: 'Community' },
  { href: '/blog', label: 'Blog' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  // Which dropdown is expanded on mobile? (null if none)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)

  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const supabase = createClient()

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      setLoggedIn(!!user)
      if (user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setProfile(data))
      }
    })

    // Keep in sync with auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setLoggedIn(!!user)
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

    return () => subscription.unsubscribe()
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
          'border-b-2 border-[var(--orange)] dark-section-persistent',
          scrolled ? 'bg-black/95 backdrop-blur-sm' : 'bg-black'
        )}
      >
        <div className="flex items-center gap-6 h-[68px] px-6 md:px-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
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
          <ul className="hidden md:flex items-center gap-6 xl:gap-8 flex-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href)
              
              return (
                <li key={item.label} className="nav-item-group">

                  <Link href={item.href} className={cn(
                    'font-mono text-[0.62rem] tracking-[0.18em] uppercase transition-colors duration-200 flex items-center gap-1 select-none nav-link',
                    isActive ? 'text-[var(--orange)]' : 'text-[var(--grey)] hover:text-[var(--orange)]'
                  )}>
                    {item.label}
                    <span className="nav-chevron">▾</span>
                  </Link>

                  <div className="nav-dropdown">
                    <div className="nav-dropdown-inner">
                      {item.dropdown.map(sub => (
                        <Link key={sub.href} href={sub.href} className="nav-dropdown-item">
                          <span className="nav-dropdown-label">{sub.label}</span>
                          <span className="nav-dropdown-desc">{sub.desc}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </li>
              )
            })}
            
            {STATIC_LINKS.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'font-mono text-[0.62rem] tracking-[0.18em] uppercase transition-colors duration-200 relative pb-1',
                    pathname.startsWith(link.href)
                      ? 'text-[var(--orange)] nav-active-dot'
                      : 'text-[var(--grey)] hover:text-[var(--orange)]'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex flex-1" />

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button onClick={toggleTheme} aria-label="Toggle dark/light mode"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--cream)', padding: '6px 8px' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {loggedIn && profile ? (
              <div className="nav-item-group">
                {/* Profile trigger */}
                <button className="flex items-center gap-3 group" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <div className="w-8 h-8 rounded-full bg-[var(--black-3)] border-2 border-[var(--orange)] flex items-center justify-center">
                    <span className="font-display text-sm text-[var(--orange)]">
                      {profile.full_name?.[0] ?? profile.email[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="font-mono text-[0.6rem] text-[var(--grey)] tracking-widest uppercase group-hover:text-[var(--orange)] transition-colors">
                    {getTierLabel(profile.membership_tier)}
                    <span className="nav-chevron" style={{ marginLeft: 4 }}>▾</span>
                  </span>
                </button>

                {/* Profile dropdown */}
                <div className="nav-dropdown" style={{ right: 0, left: 'auto' }}>
                  <div className="nav-dropdown-inner" style={{ minWidth: 200 }}>
                    <Link href="/dashboard" className="nav-dropdown-item">
                      <span className="nav-dropdown-label">Dashboard</span>
                      <span className="nav-dropdown-desc">Your progress &amp; courses</span>
                    </Link>
                    {profile.is_super_admin && (
                      <Link href="/admin/super" className="nav-dropdown-item">
                        <span className="nav-dropdown-label" style={{ color: 'var(--orange)' }}>Super Admin</span>
                        <span className="nav-dropdown-desc">Platform management</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="nav-dropdown-item w-full text-left"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <span className="nav-dropdown-label">Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : loggedIn && !profile ? (
              /* Logged in but profile still loading — show just logout */
              <button
                onClick={handleLogout}
                className="font-mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--grey)] hover:text-white transition-colors"
              >
                Log Out
              </button>
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
          <div className="md:hidden ml-auto flex items-center gap-3">
            <button onClick={toggleTheme} aria-label="Toggle dark/light mode"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--cream)' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="text-[var(--white)]"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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
            {NAV_ITEMS.map((item) => {
              const isExpanded = mobileExpanded === item.label
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setMobileExpanded(isExpanded ? null : item.label)}
                    aria-expanded={isExpanded}
                    className="font-display text-3xl tracking-widest text-white hover:text-[var(--orange)] transition-colors flex items-center justify-between w-full text-left"
                  >
                    {item.label}
                    <ChevronDown
                      size={20}
                      className={cn(
                        'transition-transform duration-200 text-[var(--orange)]',
                        isExpanded ? 'rotate-180' : ''
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="mt-3 pl-4 flex flex-col gap-4 border-l-2 border-[var(--orange)]">
                      {item.dropdown.map(sub => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setOpen(false)}
                          className="flex flex-col gap-1 hover:opacity-80 transition-opacity"
                        >
                          <span className="font-sans font-bold text-sm text-[var(--cream)]">{sub.label}</span>
                          <span className="font-mono text-[0.55rem] tracking-widest text-[#8C7A60] uppercase">{sub.desc}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {STATIC_LINKS.map(link => (
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
              {loggedIn ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="btn-orange text-center">
                    Dashboard
                  </Link>
                  {profile && profile.is_super_admin && (
                    <Link href="/admin/super" onClick={() => setOpen(false)} className="btn-outline text-center" style={{ color: 'var(--orange)', borderColor: 'var(--orange)' }}>
                      Super Admin
                    </Link>
                  )}
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
