'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Crown, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [password,     setPassword]     = useState('')
  const [confirm,      setConfirm]      = useState('')
  const [showPw,       setShowPw]       = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [done,         setDone]         = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const router = useRouter()

  // Guard: a valid recovery session must be present.
  // Two flows arrive here:
  //   PKCE (resetPasswordForEmail via /auth/callback) → session in cookies
  //   Implicit (admin.generateLink)                  → tokens in URL hash
  //
  // @supabase/ssr's createBrowserClient is cookie-first and does NOT
  // auto-detect hash tokens. For the implicit flow we parse the hash manually
  // and call setSession() to write the tokens to cookies before rendering.
  useEffect(() => {
    const supabase = createClient()

    async function bootstrap() {
      // 1. Cookie-based session (PKCE flow via /auth/callback)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSessionReady(true)
        return
      }

      // 2. Hash-based tokens (implicit flow from admin.generateLink)
      const hash   = window.location.hash.slice(1)
      const params = new URLSearchParams(hash)
      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (data.session) {
          // Clean the tokens out of the URL bar
          window.history.replaceState(null, '', window.location.pathname)
          setSessionReady(true)
        } else {
          console.error('[reset-password] setSession failed:', error)
          router.replace('/auth/login')
        }
        return
      }

      // 3. No session and no hash — invalid/expired link
      router.replace('/auth/login')
    }

    bootstrap()

    // Handle sign-out while lingering on this page
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/auth/login')
    })

    return () => subscription.unsubscribe()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    const supabase  = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    
    if (error) {
      if (error.message.includes('sub claim') || error.message.includes('does not exist')) {
        toast.error('Session expired or user deleted. Signing out...')
        await supabase.auth.signOut()
        setTimeout(() => router.push('/auth/login'), 2000)
      } else {
        toast.error(error.message)
      }
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    }
  }

  if (!sessionReady && !done) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-grey-dark font-mono text-[0.65rem] tracking-widest uppercase">Verifying…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-black-2 border-r-2 border-orange-DEFAULT p-14">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-widest text-orange-DEFAULT">
            VIBE<span className="text-white">HYR</span>
          </span>
          <Crown size={12} className="text-orange-DEFAULT -mt-3" />
        </Link>

        <div>
          <h2 className="font-display text-[5rem] leading-[0.92] tracking-[0.02em] mb-6 text-white">
            NEW<br />
            <span className="text-orange-DEFAULT">CHAPTER.</span>
          </h2>
          <p className="font-body italic text-grey-DEFAULT text-lg leading-relaxed max-w-xs">
            "Change your conception of yourself and you will automatically change the world in which you live."
          </p>
          <p className="font-mono text-[0.6rem] tracking-widest text-orange-DEFAULT mt-3">— Neville Goddard</p>
        </div>

        <div className="font-mono text-[0.55rem] tracking-[0.2em] text-grey-dark uppercase">
          vibehyr.com · Architecture of Reality
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <span className="font-display text-2xl tracking-widest text-orange-DEFAULT">
            VIBE<span className="text-white">HYR</span>
          </span>
        </Link>

        <div className="w-full max-w-md">
          {done ? (
            /* ── Success state ── */
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'var(--orange)', boxShadow: '0 0 30px rgba(255,127,48,0.4)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#000"/>
                </svg>
              </div>
              <h1 className="font-display text-3xl tracking-widest text-white mb-3">PASSWORD UPDATED</h1>
              <p className="font-body italic text-grey-DEFAULT mb-6">
                Your password has been changed. Redirecting you to your dashboard…
              </p>
            </div>
          ) : (
            /* ── Reset form ── */
            <>
              <div className="label mb-4">Password Reset</div>
              <h1 className="font-display text-4xl tracking-widest text-white mb-2">NEW PASSWORD</h1>
              <p className="font-body italic text-grey-DEFAULT mb-8">
                Choose a strong password to secure your account.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-grey-DEFAULT block mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input-dark pr-12"
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-dark hover:text-grey-DEFAULT transition-colors"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-grey-DEFAULT block mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="input-dark"
                    placeholder="Re-enter your password"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-orange mt-2">
                  {loading ? 'Updating…' : 'Set New Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
