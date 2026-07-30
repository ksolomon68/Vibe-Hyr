// app/api/stripe/webhook/route.ts
// Stripe sends ALL payment events here. This is where access gets provisioned.
// CRITICAL: This must be a raw body handler — no JSON parsing middleware.

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { TIER_CONFIG } from '@/lib/stripe/config'
import type { Tier } from '@/lib/stripe/config'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Stripe from 'stripe'
import { sendEmail } from '@/lib/email/resend'
import {
  welcomePaidTemplate,
  paymentFailedTemplate,
  subscriptionCancelledTemplate,
} from '@/lib/email/templates'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('[webhook] Received event:', event.type)

  try {
    switch (event.type) {
      // ── Payment succeeded: provision access immediately ──────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status === 'paid') {
          await provisionAccess(session)
        }
        break
      }

      // ── Subscription renewed: extend expiry ──────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await handleRenewal(invoice)
        }
        break
      }

      // ── Payment failed: warn but don't revoke immediately ─────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      // ── Subscription cancelled or expired: revoke access ─────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await revokeAccess(sub)
        break
      }

      // ── Subscription updated: handle seat/tier changes ────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(sub)
        break
      }
    }
  } catch (err: any) {
    console.error(`[webhook] Handler error for ${event.type}:`, err)
    // Return 200 to prevent Stripe retrying — log and handle manually
    return NextResponse.json({ error: 'Handler error', detail: err.message }, { status: 200 })
  }

  return NextResponse.json({ received: true })
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVISION ACCESS — called after successful checkout
// Creates org, subscription record, and grants course access to admin
// ─────────────────────────────────────────────────────────────────────────────
async function provisionAccess(session: Stripe.Checkout.Session) {
  const meta = session.metadata!
  const {
    tier,
    segment,
    billingCycle,
    seats,
    orgName,
    orgDomain,
    adminEmail,
    userId,
  } = meta as Record<string, string>

  const seatsNum = parseInt(seats)
  const tierConfig = TIER_CONFIG[tier as Tier]

  // 1. Get the subscription ID from Stripe
  const subscriptionId = session.subscription as string
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
  const periodEnd = new Date(subscription.current_period_end * 1000)

  // 2. Create the organization
  const { data: org, error: orgError } = await getSupabaseAdmin()
    .from('organizations')
    .insert({
      name: orgName,
      domain: orgDomain.toLowerCase(),
      tier,
      segment,
      seats_purchased: seatsNum,
      seats_used: 1, // admin takes first seat
      billing_cycle: billingCycle,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      status: 'active',
      subscription_expires_at: periodEnd.toISOString(),
    })
    .select()
    .single()

  if (orgError) {
    console.error('[provisionAccess] Failed to create org:', orgError)
    throw orgError
  }

  // 3. Create subscription record
  await getSupabaseAdmin().from('subscriptions').insert({
    org_id: org.id,
    tier,
    segment,
    billing_cycle: billingCycle,
    seats: seatsNum,
    amount_paid: (session.amount_total ?? 0) / 100,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: session.customer as string,
    status: 'active',
    current_period_end: periodEnd.toISOString(),
  })

  // 4. Add admin as first org member
  await getSupabaseAdmin().from('organization_members').insert({
    org_id: org.id,
    user_id: userId,
    role: 'admin',
    is_active: true,
  })

  // 5. Grant course access to admin (based on tier)
  const courseAccess = tierConfig.courses.map((courseSlug) => ({
    user_id: userId,
    org_id: org.id,
    course_slug: courseSlug,
    granted_by: userId,
  }))
  await getSupabaseAdmin().from('course_access').insert(courseAccess)

  // 6. Send branded welcome email
  const recipientEmail = adminEmail || (
    await getSupabaseAdmin().from('profiles').select('email').eq('id', userId).single()
  ).data?.email
  if (recipientEmail) {
    const { data: profile } = await getSupabaseAdmin()
      .from('profiles').select('full_name').eq('id', userId).single()
    let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
    // Bulletproof sanitization: remove quotes, remove ALL existing protocol prefixes, and trailing slashes
    appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
    if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
    // Re-apply protocol
    appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`
    try {
      await sendEmail({
        to: recipientEmail,
        subject: `Welcome to Vibe Hyr — your ${tierConfig.name} plan is active`,
        html: welcomePaidTemplate(profile?.full_name ?? '', tier, `${appUrl}/dashboard`),
      })
    } catch (emailErr) {
      console.error('[provisionAccess] Welcome email failed (non-fatal):', emailErr)
    }
  }

  console.log(`[provisionAccess] ✓ Org "${orgName}" provisioned with ${seatsNum} seats, tier: ${tier}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLE RENEWAL — extend subscription period
// ─────────────────────────────────────────────────────────────────────────────
async function handleRenewal(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
  const periodEnd = new Date(subscription.current_period_end * 1000)

  await getSupabaseAdmin()
    .from('organizations')
    .update({
      status: 'active',
      subscription_expires_at: periodEnd.toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId)

  await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_end: periodEnd.toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId)

  console.log(`[handleRenewal] ✓ Subscription ${subscriptionId} renewed until ${periodEnd.toISOString()}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLE PAYMENT FAILED — set warning status, don't revoke yet
// Stripe will retry for several days before sending subscription.deleted
// ─────────────────────────────────────────────────────────────────────────────
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  const { data: org } = await getSupabaseAdmin()
    .from('organizations')
    .update({ status: 'payment_failed' })
    .eq('stripe_subscription_id', subscriptionId)
    .select('id, tier, name')
    .single()

  // Send payment-failed email to org admin
  if (org) {
    const { data: adminMember } = await getSupabaseAdmin()
      .from('organization_members')
      .select('user_id')
      .eq('org_id', org.id)
      .eq('role', 'admin')
      .single()
    if (adminMember) {
      const { data: profile } = await getSupabaseAdmin()
        .from('profiles')
        .select('email, full_name')
        .eq('id', adminMember.user_id)
        .single()
      if (profile?.email) {
        let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
        // Bulletproof sanitization: remove quotes, remove ALL existing protocol prefixes, and trailing slashes
        appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
        if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
        // Re-apply protocol
        appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`
        const tierConfig = TIER_CONFIG[org.tier as Tier]
        try {
          await sendEmail({
            to: profile.email,
            subject: 'Action required: payment issue with your Vibe Hyr subscription',
            html: paymentFailedTemplate(
              profile.full_name ?? '',
              tierConfig?.name ?? org.tier,
              `${appUrl}/dashboard`
            ),
          })
        } catch (emailErr) {
          console.error('[handlePaymentFailed] Email failed (non-fatal):', emailErr)
        }
      }
    }
  }

  console.log(`[handlePaymentFailed] ⚠ Payment failed for subscription ${subscriptionId}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// REVOKE ACCESS — subscription cancelled or expired
// ─────────────────────────────────────────────────────────────────────────────
async function revokeAccess(sub: Stripe.Subscription) {
  const subscriptionId = sub.id

  // Get the org with tier info for the email
  const { data: org } = await getSupabaseAdmin()
    .from('organizations')
    .select('id, tier')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!org) return

  // Deactivate org and all members
  await getSupabaseAdmin()
    .from('organizations')
    .update({ status: 'cancelled' })
    .eq('id', org.id)

  await getSupabaseAdmin()
    .from('organization_members')
    .update({ is_active: false })
    .eq('org_id', org.id)

  // Remove course access
  await getSupabaseAdmin()
    .from('course_access')
    .delete()
    .eq('org_id', org.id)

  // Send cancellation email to org admin
  const { data: adminMember } = await getSupabaseAdmin()
    .from('organization_members')
    .select('user_id')
    .eq('org_id', org.id)
    .eq('role', 'admin')
    .single()
  if (adminMember) {
    const { data: profile } = await getSupabaseAdmin()
      .from('profiles')
      .select('email, full_name')
      .eq('id', adminMember.user_id)
      .single()
    if (profile?.email) {
      let appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibehyr.com').trim()
      // Bulletproof sanitization: remove quotes, remove ALL existing protocol prefixes, and trailing slashes
      appUrl = appUrl.replace(/["]/g, '').replace(/https?:?\/+/gi, '').replace(/\/+$/, '')
      if (appUrl.includes('0.0.0.0')) appUrl = appUrl.replace('0.0.0.0', 'localhost')
      // Re-apply protocol
      appUrl = appUrl.startsWith('localhost') || appUrl.startsWith('127.0.0.1') ? `http://${appUrl}` : `https://${appUrl}`
      const tierConfig = TIER_CONFIG[org.tier as Tier]
      try {
        await sendEmail({
          to: profile.email,
          subject: 'Your Vibe Hyr subscription has been cancelled',
          html: subscriptionCancelledTemplate(
            profile.full_name ?? '',
            tierConfig?.name ?? org.tier,
            `${appUrl}/pricing`
          ),
        })
      } catch (emailErr) {
        console.error('[revokeAccess] Cancellation email failed (non-fatal):', emailErr)
      }
    }
  }

  console.log(`[revokeAccess] ✓ Access revoked for org ${org.id}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLE SUBSCRIPTION UPDATE — seat count or tier changes
// ─────────────────────────────────────────────────────────────────────────────
async function handleSubscriptionUpdate(sub: Stripe.Subscription) {
  const subscriptionId = sub.id
  const newSeats = sub.items.data[0]?.quantity ?? 0

  // Get org
  const { data: org } = await getSupabaseAdmin()
    .from('organizations')
    .select('id, tier, seats_used')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!org) return

  // Update seat count
  await getSupabaseAdmin()
    .from('organizations')
    .update({ seats_purchased: newSeats })
    .eq('id', org.id)

  // If seats were reduced below current usage, flag for admin review
  if (newSeats < org.seats_used) {
    await getSupabaseAdmin()
      .from('organizations')
      .update({ status: 'over_seat_limit' })
      .eq('id', org.id)
    console.warn(`[handleSubscriptionUpdate] ⚠ Org ${org.id} now over seat limit: ${org.seats_used}/${newSeats}`)
  }

  console.log(`[handleSubscriptionUpdate] ✓ Org ${org.id} updated to ${newSeats} seats`)
}
