import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

// Service role client (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLAN_FROM_PRICE: Record<string, string> = {
  [process.env.NEXT_PUBLIC_STRIPE_ARCHITECT_PRICE_ID!]: 'architect',
  [process.env.NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID!]:     'elite',
}

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession
      const userId  = session.metadata?.userId
      const plan    = session.metadata?.plan

      if (userId && plan) {
        await supabase.from('profiles').update({
          membership_tier:       plan,
          stripe_customer_id:    session.customer as string,
          stripe_subscription_id: session.subscription as string,
        }).eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub      = event.data.object as Stripe.Subscription
      const priceId  = sub.items.data[0]?.price.id
      const newPlan  = PLAN_FROM_PRICE[priceId] ?? 'free'
      const custId   = sub.customer as string

      await supabase.from('profiles').update({
        membership_tier: sub.status === 'active' ? newPlan : 'free',
      }).eq('stripe_customer_id', custId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub    = event.data.object as Stripe.Subscription
      const custId = sub.customer as string

      await supabase.from('profiles').update({
        membership_tier:       'free',
        stripe_subscription_id: null,
      }).eq('stripe_customer_id', custId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
