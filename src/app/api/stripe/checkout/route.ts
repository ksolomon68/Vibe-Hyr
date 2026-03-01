import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

const PRICE_IDS: Record<string, string> = {
  architect: process.env.NEXT_PUBLIC_STRIPE_ARCHITECT_PRICE_ID!,
  elite:     process.env.NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID!,
}

export async function POST(req: NextRequest) {
  const { plan, userId } = await req.json()

  const priceId = PRICE_IDS[plan]
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    mode:               'subscription',
    payment_method_types: ['card'],
    line_items:         [{ price: priceId, quantity: 1 }],
    success_url:        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?welcome=true`,
    cancel_url:         `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata:           { userId, plan },
    subscription_data:  { trial_period_days: 7 },
  })

  return NextResponse.json({ url: session.url })
}
