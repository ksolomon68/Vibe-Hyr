'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { cn, getTierLabel } from '@/lib/utils'

// ── Discovery courses — identical for all users regardless of auth ──────────
const COURSES = {
  personal: [
    { title: 'Programming the Gatekeeper',         tier: 'Free',           href: '/personal/programming-the-gatekeeper' },
    { title: 'Mastery of Assumption',               tier: 'Architect',      href: '/personal/mastery-of-the-law-of-assumption' },
    { title: 'SATS Reprogramming',                  tier: 'Architect',      href: '/personal/subconscious-reprogramming-sats' },
    { title: 'Echo Theory Delay',                   tier: 'Reality Master', href: '/personal/navigating-the-echo-theory-delay' },
  ],
  educators: [
    { title: 'The Educator Reset',      tier: 'All staff',            href: '/educators/the-educator-reset/ed01-m01' },
    { title: 'Vibrational Leadership',  tier: 'Admin & principals',   href: '/educators/vibrational-leadership/ed02-m01' },
    { title: 'Co-Regulation Mastery',   tier: 'Classroom teachers',   href: '/educators/co-regulation-mastery/ed03-m01' },
    { title: 'The Retained Educator',   tier: 'Districts & HR',       href: '/educators/the-retained-educator/ed04-m01' },
  ],
  business: [
    { title: 'Common Sense in the Workplace',   tier: 'Foundation',    href: '/business/common-sense-in-the-workplace/the-awareness-gap' },
    { title: 'From Reaction to Response',       tier: 'De-escalation', href: '/business/from-reaction-to-response/the-reactivity-spectrum' },
    { title: 'Know Yourself, Lead Yourself',    tier: 'Self mastery',  href: '/business/know-yourself-lead-yourself/identity-architecture' },
    { title: 'The High-Frequency Team',         tier: 'Team cohesion', href: '/business/the-high-frequency-team/team-frequency-mapping' },
  ],
}

const NAV_CATEGORIES = [
  { key: 'personal',  label: 'Personal',  href: '/personal' },
  { key: 'educators', label: 'Educators', href: '/educators' },
  { key: 'business',  label: 'Business',  href: '/business' },
]

const STATIC_LINKS = [
  { href: '/',        label: 'Home' },
  { href: '/personal', label: 'Courses' },
  { href: '/pricing', label: 'Membership' },
  { href: '/blog',    label: 'Blog' },
]

// ── Role helper ──────────────────────────────────────────────────────────────
function getUserRole(profile: Profile | null): 'individual' | 'orgAdmin' | 'superAdmin' {
  if (!profile) return 'individual'
  if (profile.role === 'super_admin') return 'superAdmin'
  if (profile.role === 'institution_admin') return 'orgAdmin'
  return 'individual'
}

export function Navbar() {
  const [open,           setOpen]           = useState(false)
  const [scrolled,       setScrolled]       = useState(false)
  const [profile,        setProfile]        = useState<Profile | null>(null)
  const [loggedIn,       setLoggedIn]       = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)

  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      setLoggedIn(!!user)
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setLoggedIn(!!user)
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
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

  const userRole = getUserRole(profile)

  return (
    <>
      <nav className={cn('navbar', scrolled ? 'shadow-[0_4px_24px_rgba(0,0,0,0.4)]' : '')}>
        <div className="flex items-center h-[68px] px-6 md:px-14 gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/vhlogo.png"
              alt="Vibe Hyr"
              width={160}
              height={48}
              className="object-contain h-10 w-auto"
              priority
            />
          </Link>

          {/* ── Desktop: Discovery nav ─────────────────────────────────────── */}
          <ul className="hidden md:flex items-center gap-6 xl:gap-8 flex-1 justify-center">

            {/* Static links */}
            {STATIC_LINKS.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'font-mono text-[0.62rem] tracking-[0.18em] uppercase transition-colors duration-200 relative pb-1',
                    (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href))
                      ? 'text-[var(--orange)] nav-active-dot'
                      : 'text-[var(--grey)] hover:text-[var(--orange)]'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Category dropdowns — courses only */}
            {NAV_CATEGORIES.map(({ key, label, href }) => {
              const courses = COURSES[key as keyof typeof COURSES]
              const isActive = pathname.startsWith(href)
              return (
                <li key={key} className="nav-item-group">
                  <Link
                    href={href}
                    className={cn(
                      'font-mono text-[0.62rem] tracking-[0.18em] uppercase transition-colors duration-200 flex items-center gap-1 select-none nav-link',
                      isActive ? 'text-[var(--orange)]' : 'text-[var(--grey)] hover:text-[var(--orange)]'
                    )}
                  >
                    {label}
                    <span className="nav-chevron">▾</span>
                  </Link>

                  <div className="nav-dropdown">
                    <div className="nav-dropdown-inner">
                      {courses.map(course => (
                        <Link key={course.href} href={course.href} className="nav-dropdown-item">
                          <span className="nav-dropdown-label">{course.title}</span>
                          <span className="nav-dropdown-desc">{course.tier}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* ── Desktop: Right — Auth / Profile utility ────────────────────── */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">

            {!loggedIn ? (
              /* Logged out */
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
            ) : !profile ? (
              /* Loading state */
              <div className="w-8 h-8 rounded-full bg-[var(--black-3)] border-2 border-[var(--orange)] animate-pulse" />
            ) : (
              /* Authenticated — Profile menu */
              <div className="nav-item-group">

                {/* Avatar trigger */}
                <button
                  className="flex items-center gap-2.5 group"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  aria-label="Open account menu"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--black-3)] border-2 border-[var(--orange)] flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-sm text-[var(--orange)] leading-none">
                      {profile.full_name?.[0] ?? profile.email[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="font-mono text-[0.6rem] text-[var(--grey)] tracking-widest uppercase group-hover:text-[var(--orange)] transition-colors hidden xl:block">
                    {getTierLabel(profile.membership_tier)}
                  </span>
                  <span className="nav-chevron text-[var(--grey)] group-hover:text-[var(--orange)] transition-colors">▾</span>
                </button>

                {/* Profile dropdown */}
                <div className="nav-dropdown" style={{ right: 0, left: 'auto' }}>
                  <div className="nav-dropdown-inner" style={{ minWidth: 220 }}>

                    {/* Identity header */}
                    <div className="px-3 py-2 mb-1 border-b border-white/8">
                      <p className="font-mono text-[0.6rem] tracking-widest uppercase text-[var(--orange)]">
                        {getTierLabel(profile.membership_tier)}
                      </p>
                      <p className="font-body text-xs text-[#9C8A70] truncate mt-0.5">{profile.email}</p>
                    </div>

                    {/* ── Standard links (all users) ── */}
                    <Link href="/dashboard" className="nav-dropdown-item">
                      <span className="nav-dropdown-label">My Courses</span>
                      <span className="nav-dropdown-desc">Progress &amp; learning</span>
                    </Link>
                    <Link href="/journal" className="nav-dropdown-item">
                      <span className="nav-dropdown-label">Nightly Journal</span>
                      <span className="nav-dropdown-desc">Revise &amp; rewire</span>
                    </Link>
                    <Link href="/community" className="nav-dropdown-item">
                      <span className="nav-dropdown-label">Community</span>
                      <span className="nav-dropdown-desc">Connect &amp; share wins</span>
                    </Link>
                    <Link href="/account" className="nav-dropdown-item">
                      <span className="nav-dropdown-label">Account Settings</span>
                      <span className="nav-dropdown-desc">Profile &amp; billing</span>
                    </Link>

                    {/* ── Org Admin extras ── */}
                    {userRole === 'orgAdmin' && (
                      <>
                        <hr className="nav-dropdown-divider" />
                        <Link href="/admin/institutional" className="nav-dropdown-item">
                          <span className="nav-dropdown-label" style={{ color: 'var(--orange)' }}>Organization Dashboard</span>
                          <span className="nav-dropdown-desc">Team overview &amp; stats</span>
                        </Link>
                        <Link href="/admin/users" className="nav-dropdown-item">
                          <span className="nav-dropdown-label" style={{ color: 'var(--orange)' }}>Manage Users</span>
                          <span className="nav-dropdown-desc">Add, remove &amp; assign seats</span>
                        </Link>
                      </>
                    )}

                    {/* ── Super Admin extras ── */}
                    {userRole === 'superAdmin' && (
                      <>
                        <hr className="nav-dropdown-divider" />
                        <Link href="/admin/super" className="nav-dropdown-item">
                          <span className="nav-dropdown-label" style={{ color: 'var(--orange)' }}>Platform Management</span>
                          <span className="nav-dropdown-desc">Users, orgs &amp; settings</span>
                        </Link>
                        <Link href="/admin/users" className="nav-dropdown-item">
                          <span className="nav-dropdown-label" style={{ color: 'var(--orange)' }}>Manage Users</span>
                          <span className="nav-dropdown-desc">All platform users</span>
                        </Link>
                        <Link href="/admin/super" className="nav-dropdown-item">
                          <span className="nav-dropdown-label" style={{ color: 'var(--orange)' }}>Global Analytics</span>
                          <span className="nav-dropdown-desc">Platform-wide metrics</span>
                        </Link>
                      </>
                    )}

                    {/* ── Logout ── */}
                    <hr className="nav-dropdown-divider" />
                    <button
                      onClick={handleLogout}
                      className="nav-dropdown-item w-full text-left"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <span className="nav-dropdown-label" style={{ color: 'rgba(240,234,224,0.5)' }}>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden ml-auto flex items-center gap-3">
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

      {/* ── Mobile Menu ───────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black pt-[68px] md:hidden overflow-y-auto overscroll-contain"
          role="dialog"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col p-8 gap-6">

            {/* Home Link at Top */}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="font-display text-3xl tracking-widest text-white hover:text-[var(--orange)] transition-colors py-2 min-h-[52px] flex items-center"
            >
              HOME
            </Link>

            {/* Category accordions — courses only */}
            {NAV_CATEGORIES.map(({ key, label, href }) => {
              const courses = COURSES[key as keyof typeof COURSES]
              const isExpanded = mobileExpanded === key
              return (
                <div key={key}>
                  <div className="flex items-center justify-between py-2 min-h-[52px]">
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className="font-display text-3xl tracking-widest text-white hover:text-[var(--orange)] transition-colors text-left"
                    >
                      {label.toUpperCase()}
                    </Link>
                    <button
                      onClick={() => setMobileExpanded(isExpanded ? null : key)}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label} courses`}
                      className="p-2 -mr-2"
                    >
                      <ChevronDown
                        size={20}
                        className={cn('transition-transform duration-200 text-[var(--orange)]', isExpanded ? 'rotate-180' : '')}
                      />
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pl-4 flex flex-col gap-4 border-l-2 border-[var(--orange)]">
                      {courses.map(course => (
                        <Link
                          key={course.href}
                          href={course.href}
                          onClick={() => setOpen(false)}
                          className="flex flex-col gap-1 hover:opacity-80 transition-opacity"
                        >
                          <span className="font-sans font-bold text-sm text-[var(--cream)]">{course.title}</span>
                          <span className="font-mono text-[0.55rem] tracking-widest text-[#8C7A60] uppercase">{course.tier}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Other Static links (excluding Home) */}
            {STATIC_LINKS.filter(link => link.href !== '/').map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-display text-3xl tracking-widest text-white hover:text-[var(--orange)] transition-colors py-2 min-h-[52px] flex items-center"
              >
                {link.label.toUpperCase()}
              </Link>
            ))}

            {/* Role-based utility section */}
            <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
              {!loggedIn ? (
                <>
                  <Link href="/auth/login"  onClick={() => setOpen(false)} className="btn-outline text-center">Log In</Link>
                  <Link href="/auth/signup" onClick={() => setOpen(false)} className="btn-orange text-center">Join Free</Link>
                </>
              ) : (
                <>
                  {/* Identity */}
                  {profile && (
                    <p className="font-mono text-[0.6rem] tracking-widest uppercase text-[var(--orange)] pb-1">
                      {getTierLabel(profile.membership_tier)}
                    </p>
                  )}

                  {/* Standard */}
                  <Link href="/dashboard"  onClick={() => setOpen(false)} className="btn-orange text-center">My Courses</Link>
                  <Link href="/journal"    onClick={() => setOpen(false)} className="btn-outline text-center">Nightly Journal</Link>
                  <Link href="/community"  onClick={() => setOpen(false)} className="btn-outline text-center">Community</Link>
                  <Link href="/account"    onClick={() => setOpen(false)} className="btn-outline text-center">Account Settings</Link>

                  {/* Org Admin */}
                  {userRole === 'orgAdmin' && (
                    <>
                      <Link href="/admin/institutional" onClick={() => setOpen(false)} className="btn-outline text-center" style={{ color: 'var(--orange)', borderColor: 'var(--orange)' }}>
                        Organization Dashboard
                      </Link>
                      <Link href="/admin/users" onClick={() => setOpen(false)} className="btn-outline text-center" style={{ color: 'var(--orange)', borderColor: 'var(--orange)' }}>
                        Manage Users
                      </Link>
                    </>
                  )}

                  {/* Super Admin */}
                  {userRole === 'superAdmin' && (
                    <>
                      <Link href="/admin/super"  onClick={() => setOpen(false)} className="btn-outline text-center" style={{ color: 'var(--orange)', borderColor: 'var(--orange)' }}>
                        Platform Management
                      </Link>
                      <Link href="/admin/users" onClick={() => setOpen(false)} className="btn-outline text-center" style={{ color: 'var(--orange)', borderColor: 'var(--orange)' }}>
                        Manage Users
                      </Link>
                    </>
                  )}

                  <button onClick={handleLogout} className="btn-outline text-center opacity-50">Log Out</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
