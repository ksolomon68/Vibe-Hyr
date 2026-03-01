'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Crown, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const PLAN_INFO = {
  free:      { label: 'Seeker',        price: 'Free',  desc: 'Start free, upgrade anytime.' },
  architect: { label: 'Architect',     price: '$27/mo', desc: 'Full courses + daily tools.' },
  elite:     { label: 'Reality Master', price: '$67/mo', desc: 'Complete system, live Q&As.' },
}

export default function SignupPage() {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const router      = useRouter()
  const searchParams = useSearchParams()
  const plan = (searchParams.get('plan') ?? 'free') as keyof typeof PLAN_INFO
  const planInfo = PLAN_INFO[plan] ?? PLAN_INFO.free

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, selected_plan: plan },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (plan !== 'free' && data.user) {
      // Redirect to Stripe checkout (handled via API route)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId: data.user.id }),
      })
      const { url } = await res.json()
      if (url) { window.location.href = url; return }
    }

    toast.success('Account created! Check your email to verify. ✦')
    router.push('/dashboard')
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?plan=${plan}` },
    })
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-black-2 border-r-2 border-orange-DEFAULT p-14">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-widest text-orange-DEFAULT">
            VIBE<span className="text-white">HYR</span>
          </span>
          <Crown size={12} className="text-orange-DEFAULT -mt-3" />
        </Link>

        <div>
          <div className="inline-block bg-orange-DEFAULT text-black font-mono text-[0.6rem] tracking-[0.25em] uppercase px-4 py-2 font-bold mb-6">
            {planInfo.label} · {planInfo.price}
          </div>
          <h2 className="font-display text-[4.5rem] leading-[0.92] tracking-[0.02em] mb-6 text-white">
            YOUR REALITY<br />
            <span className="text-orange-DEFAULT">STARTS HERE.</span>
          </h2>
          <ul className="flex flex-col gap-3">
            {['4 progressive courses', 'Daily Revision Journal', 'Interactive quiz tools', 'Community of practitioners'].map(item => (
              <li key={item} className="flex items-center gap-3 font-body text-sm text-grey-DEFAULT">
                <Check size={14} className="text-orange-DEFAULT flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="font-body italic text-sm text-grey-dark">
          "Assume the feeling of your wish fulfilled."<br />
          <span className="font-mono text-[0.6rem] tracking-widest text-orange-DEFAULT not-italic">— Neville Goddard</span>
        </p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <span className="font-display text-2xl tracking-widest text-orange-DEFAULT">
            VIBE<span className="text-white">HYR</span>
          </span>
        </Link>

        <div className="w-full max-w-md">
          <div className="label mb-4">Create Account</div>
          <h1 className="font-display text-4xl tracking-widest text-white mb-2">JOIN FREE</h1>
          <p className="font-body italic text-grey-DEFAULT mb-8">{planInfo.desc}</p>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-grey-DEFAULT block mb-2">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="input-dark" placeholder="Your name" />
            </div>
            <div>
              <label className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-grey-DEFAULT block mb-2">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-dark" placeholder="you@example.com" />
            </div>
            <div>
              <label className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-grey-DEFAULT block mb-2">Password</label>
              <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="input-dark" placeholder="Min 8 characters" />
            </div>
            <button type="submit" disabled={loading} className="btn-orange mt-2">
              {loading ? 'Creating account…' : plan === 'free' ? 'Create Free Account' : `Join as ${planInfo.label}`}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="font-mono text-[0.55rem] tracking-widest text-grey-dark uppercase">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <button onClick={handleGoogle} className="btn-outline w-full flex items-center justify-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center font-body text-sm text-grey-dark mt-8">
            Already a member?{' '}
            <Link href="/auth/login" className="text-orange-DEFAULT hover:text-orange-light transition-colors">
              Log in
            </Link>
          </p>

          <p className="text-center font-mono text-[0.5rem] tracking-widest text-grey-dark uppercase mt-4">
            By joining you agree to our Terms of Service & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
