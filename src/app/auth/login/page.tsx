'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Crown, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function LoginForm() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const router      = useRouter()
  const searchParams = useSearchParams()
  const redirect    = searchParams.get('redirect') ?? '/dashboard'
  const isCheckoutSuccess = searchParams.get('checkout') === 'success'
  const checkoutEmail = searchParams.get('email')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      // Notify super admin
      fetch('/api/email/superadmin-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'login', userEmail: email })
      }).catch(() => {})

      toast.success('Welcome back. ✦')
      router.push(redirect)
      router.refresh()
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
            WELCOME<br />
            <span className="text-orange-DEFAULT">BACK.</span>
          </h2>
          <p className="font-body italic text-grey-DEFAULT text-lg leading-relaxed max-w-xs">
            "You have free will to choose the state you will occupy, but no free will to change the events that state yields."
          </p>
          <p className="font-mono text-[0.6rem] tracking-widest text-orange-DEFAULT mt-3">— Neville Goddard</p>
        </div>

        <div className="font-mono text-[0.55rem] tracking-[0.2em] text-grey-dark uppercase">
          vibehyr.com · Architecture of Reality
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <span className="font-display text-2xl tracking-widest text-orange-DEFAULT">
            VIBE<span className="text-white">HYR</span>
          </span>
        </Link>

        <div className="w-full max-w-md">
          <div className="label mb-4">Account Access</div>
          <h1 className="font-display text-4xl tracking-widest text-white mb-2">LOG IN</h1>
          <p className="font-body italic text-grey-DEFAULT mb-8">
            Continue building your reality.
          </p>

          {isCheckoutSuccess && (
            <div className="mb-6 p-4 rounded-sm border border-orange-DEFAULT bg-orange-DEFAULT/10">
              <p className="font-body text-sm text-orange-DEFAULT">
                <strong>Purchase successful!</strong> We couldn't sign you in automatically — please check your email
                {checkoutEmail ? ` (${checkoutEmail})` : ''} for a secure link to set up your password and access your account.
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-grey-DEFAULT">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="font-mono text-[0.55rem] tracking-widest uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-dark pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-dark hover:text-grey-DEFAULT transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-orange mt-2">
              {loading ? 'Signing In…' : 'Log In'}
            </button>
          </form>



          <p className="text-center font-body text-sm text-grey-dark mt-8">
            Don't have an account?{' '}
            <Link href="/pricing" className="text-orange-DEFAULT hover:text-orange-light transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
