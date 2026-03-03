'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase   = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`
    const { error }  = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
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
            RESET<br />
            <span className="text-orange-DEFAULT">ACCESS.</span>
          </h2>
          <p className="font-body italic text-grey-DEFAULT text-lg leading-relaxed max-w-xs">
            "Revision is the beginning of miracles."
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
          {sent ? (
            /* ── Success state ── */
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: '#FF7B00', boxShadow: '0 0 30px rgba(255,123,0,0.4)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#000"/>
                </svg>
              </div>
              <h1 className="font-display text-3xl tracking-widest text-white mb-3">CHECK YOUR EMAIL</h1>
              <p className="font-body italic text-grey-DEFAULT mb-2">
                A password reset link has been sent to
              </p>
              <p className="font-mono text-[0.7rem] tracking-widest text-orange-DEFAULT mb-6">{email}</p>
              <p className="font-body text-sm text-grey-dark mb-8">
                Click the link in that email to choose a new password. Check your spam folder if you don't see it within a few minutes.
              </p>
              <Link href="/auth/login" className="btn-outline-orange">
                ← Back to Log In
              </Link>
            </div>
          ) : (
            /* ── Request form ── */
            <>
              <div className="label mb-4">Password Reset</div>
              <h1 className="font-display text-4xl tracking-widest text-white mb-2">FORGOT PASSWORD</h1>
              <p className="font-body italic text-grey-DEFAULT mb-8">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-grey-DEFAULT block mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-dark"
                    placeholder="you@example.com"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-orange mt-2">
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center font-body text-sm text-grey-dark mt-8">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-orange-DEFAULT hover:text-orange-light transition-colors">
                  Log In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
