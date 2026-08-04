// hooks/useCheckout.ts
// Drop this hook into any component that needs to trigger Stripe checkout.
// Usage: const { startCheckout, loading, error } = useCheckout()

'use client'

import { useState } from 'react'
import type { Tier, Segment, BillingCycle } from '@/lib/stripe/config'

interface CheckoutParams {
  tier: Tier
  segment?: Segment
  billingCycle: BillingCycle
  seats?: number
  orgName?: string
  orgDomain?: string
  adminEmail?: string
  userId?: string
  vertical?: 'education' | 'business' | 'leadership'
}

export function useCheckout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout(params: CheckoutParams) {
    setLoading(true)
    setError(null)

    // Defaults for individual checkout
    const finalParams = {
      segment: 'individual',
      seats: 1,
      orgName: 'Individual',
      orgDomain: 'individual.vibe',
      adminEmail: '',
      ...params
    }

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalParams),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  async function openBillingPortal(userId: string) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return { startCheckout, openBillingPortal, loading, error }
}
