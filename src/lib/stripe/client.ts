// lib/stripe/client.ts
// Server-side Stripe singleton. Never import this in client components.
//
// The client is created lazily on first use, NOT at module scope. `next build`
// imports every route module during "Collecting page data", so constructing
// (or validating env for) Stripe at import time fails the whole build on any
// machine that doesn't have STRIPE_SECRET_KEY — even though nothing is
// actually calling Stripe. Missing config should fail the request, not the build.

import Stripe from 'stripe'

let client: Stripe | null = null

export function getStripe(): Stripe {
  if (client) return client

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable')
  }

  client = new Stripe(key, {
    apiVersion: '2024-04-10',
    typescript: true,
  })
  return client
}
