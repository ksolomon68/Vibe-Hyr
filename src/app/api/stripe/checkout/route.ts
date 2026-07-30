import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'

const PRICE_IDS: Record<string, string> = {
  architect: process.env.NEXT_PUBLIC_STRIPE_ARCHITECT_PRICE_ID!,
  elite:     process.env.NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID!,
}

export async function POST(req: NextRequest) {
  const { plan, userId } = await req.json()

  const priceId = PRICE_IDS[plan]
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
  // Bulletproof sanitization: remove quotes, remove ALL existing protocol prefixes, and trailing slashes
  appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
  if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
  // Re-apply protocol
  appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`

  const session = await getStripe().checkout.sessions.create({
    mode:               'subscription',
    payment_method_types: ['card'],
    line_items:         [{ price: priceId, quantity: 1 }],
    success_url:        `${appUrl}/dashboard?welcome=true`,
    cancel_url:         `${appUrl}/#pricing`,
    metadata:           { userId, plan },
    subscription_data:  { trial_period_days: 7 },
  })

  return NextResponse.json({ url: session.url })
}
