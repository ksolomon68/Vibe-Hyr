// app/api/stripe/create-checkout/route.ts
// Creates a Stripe Checkout Session and returns the URL.
// Called from your pricing page when user clicks "Purchase".

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import type Stripe from 'stripe'
import { TIER_CONFIG, calculatePrice } from '@/lib/stripe/config'
import type { Tier, Segment, BillingCycle } from '@/lib/stripe/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      tier,
      segment,
      billingCycle,
      seats,
      orgName,
      orgDomain,
      adminEmail,
      userId, // Supabase user ID of the purchaser
    } = body as {
      tier: Tier
      segment: Segment
      billingCycle: BillingCycle
      seats: number
      orgName: string
      orgDomain: string
      adminEmail: string
      userId: string
    }

    // Validate inputs
    const isIndividual = segment === 'individual'
    if (!tier || !segment || !billingCycle || !seats || (!isIndividual && (!orgName || !orgDomain || !adminEmail))) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const config = TIER_CONFIG[tier]
    const minSeats = config.minSeats[segment]
    if (seats < minSeats) {
      return NextResponse.json(
        { error: `Minimum ${minSeats} seats required for ${segment} on ${config.name} tier` },
        { status: 400 }
      )
    }

    const pricing = calculatePrice(tier, segment, billingCycle, seats)
    const priceId = config.stripePriceIds[billingCycle]

    // Skip org check for individuals
    if (!isIndividual) {
      // Check if org domain already exists
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('domain', orgDomain.toLowerCase())
        .single()

      if (existingOrg) {
        return NextResponse.json(
          { error: 'An organization with this domain already exists. Contact support to manage your subscription.' },
          { status: 409 }
        )
      }
    }

    // Create or retrieve Stripe customer
    let customerId: string
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (existingCustomer?.stripe_customer_id) {
      customerId = existingCustomer.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: adminEmail || undefined,
        name: isIndividual ? 'Individual Subscriber' : orgName,
        metadata: {
          userId,
          orgDomain: isIndividual ? 'individual' : orgDomain.toLowerCase(),
          segment,
        },
      })
      customerId = customer.id

      // Save customer mapping
      await supabase.from('stripe_customers').insert({
        user_id: userId,
        stripe_customer_id: customerId,
      })
    }

    let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
    // Bulletproof sanitization: remove quotes, remove ALL existing protocol prefixes, and trailing slashes
    appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
    if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
    // Re-apply protocol
    appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`

    // Build the Stripe Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: seats,
        },
      ],
      // monthly = subscription, annual = subscription with annual interval
      mode: 'subscription',
      subscription_data: {
        metadata: {
          tier,
          segment,
          billingCycle,
          seats: seats.toString(),
          orgName: isIndividual ? 'Individual' : orgName,
          orgDomain: isIndividual ? 'individual' : orgDomain.toLowerCase(),
          adminEmail: isIndividual ? '' : adminEmail,
          userId,
          volumeDiscount: pricing.discount.toFixed(2),
        },
      },
      // Allow promo codes in checkout
      allow_promotion_codes: true,
      // Collect billing address for invoicing
      billing_address_collection: 'required',
      success_url: `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
      metadata: {
        tier,
        segment,
        billingCycle,
        seats: seats.toString(),
        orgName: isIndividual ? 'Individual' : orgName,
        orgDomain: isIndividual ? 'individual' : orgDomain.toLowerCase(),
        adminEmail: isIndividual ? '' : adminEmail,
        userId,
      },
    }

    // Add submit message only for orgs
    if (!isIndividual) {
      sessionParams.custom_text = {
        submit: {
          message: `You're purchasing ${seats} seats for ${orgName}. Users will get instant access after payment.`,
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error('[create-checkout]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
