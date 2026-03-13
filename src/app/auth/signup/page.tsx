'use client'

import { Suspense, useState } from 'react'
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

function SignupForm() {
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

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
