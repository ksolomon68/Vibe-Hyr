'use client'

// /reset-password — standalone password-reset page.
// Supabase email links point here directly with ?token_hash=xxx&type=recovery.
// This page verifies the token itself (no /auth/callback needed).

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Crown, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function ResetForm() {
  const [password,   setPassword]   = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [done,       setDone]       = useState(false)
  const [ready,      setReady]      = useState(false)
  const [initError,  setInitError]  = useState<string | null>(null)

  const router       = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase  = createClient()
    const tokenHash = searchParams.get('token_hash')
    const type      = searchParams.get('type')
    const code      = searchParams.get('code')

    console.log('[reset-password] token_hash:', !!tokenHash, '| type:', type, '| code:', !!code)

    if (tokenHash && type === 'recovery') {
      // New PKCE-style link: verify the token and establish a session
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        .then(({ error }) => {
          if (error) {
            console.error('[reset-password] verifyOtp failed:', error.message)
            setInitError('This reset link has expired or is invalid.')
            setTimeout(() => router.replace('/auth/login'), 3000)
          } else {
            console.log('[reset-password] verifyOtp OK — session ready')
            setReady(true)
          }
        })
    } else if (code) {
      // Code-exchange link (OAuth-style)
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            console.error('[reset-password] exchangeCodeForSession failed:', error.message)
            setInitError('This reset link has expired or is invalid.')
            setTimeout(() => router.replace('/auth/login'), 3000)
          } else {
            console.log('[reset-password] code exchange OK — session ready')
            setReady(true)
          }
        })
    } else {
      // No token in URL — check for existing session (e.g. arrived via /auth/callback)
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('[reset-password] No token/code — existing session:', !!session)
        if (session) {
          setReady(true)
        } else {
          router.replace('/auth/login')
        }
      })
    }
  }, [router, searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 8)  { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const supabase  = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      setDone(true)
      console.log('[reset-password] password updated — redirecting to dashboard')
      setTimeout(() => router.push('/dashboard'), 2500)
    }
  }

  /* ── Verifying state ── */
  if (!ready && !done && !initError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-grey-dark font-mono text-[0.65rem] tracking-widest uppercase">
          Verifying reset link…
        </div>
      </div>
    )
  }

  /* ── Error state ── */
  if (initError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#EF4444"/>
            </svg>
          </div>
          <h1 className="font-display text-3xl tracking-widest text-white mb-4">LINK EXPIRED</h1>
          <p className="font-body text-grey-DEFAULT mb-2">{initError}</p>
          <p className="font-body text-sm text-grey-dark mb-6">Redirecting to login…</p>
          <Link href="/auth/forgot-password" className="btn-orange">
            Request New Link
          </Link>
        </div>
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
            &ldquo;Change your conception of yourself and you will automatically change the world in which you live.&rdquo;
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  )
}
