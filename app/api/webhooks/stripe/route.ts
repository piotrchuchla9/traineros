import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripe, getPlanFromPriceId } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

function subPeriodEnd(sub: unknown): string | null {
  const s = sub as Record<string, unknown>
  // try root field (pre-2024 API)
  if (typeof s.current_period_end === 'number') {
    return new Date(s.current_period_end * 1000).toISOString()
  }
  // try items[0].current_period_end (some API versions)
  const items = s.items as { data?: Array<Record<string, unknown>> } | undefined
  const item = items?.data?.[0]
  if (item && typeof item.current_period_end === 'number') {
    return new Date(item.current_period_end * 1000).toISOString()
  }
  // log unknown structure so we can fix it
  console.warn('[webhook] cannot find period end, sub keys:', Object.keys(s))
  return null
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('[webhook] event:', event.type)

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const plan = session.metadata?.plan === 'pro' ? 'pro' : 'basic'
      const trainerId = session.metadata?.trainer_id
      console.log('[webhook] checkout completed, trainer_id:', trainerId, 'plan:', plan)
      if (trainerId) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const subscription_ends_at = subPeriodEnd(sub)
        const { error } = await supabase.from('trainers').update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan,
          ...(subscription_ends_at && { subscription_ends_at }),
        }).eq('id', trainerId)
        if (error) console.error('[webhook] supabase update error:', error)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const priceId = sub.items.data[0].price.id
      const plan = getPlanFromPriceId(priceId)
      const subscription_ends_at = subPeriodEnd(sub)
      const s = sub as any
      const cancel_at_period_end = !!(s.cancel_at)
      const ends_at = s.cancel_at
        ? new Date(s.cancel_at * 1000).toISOString()
        : subscription_ends_at
      console.log('[webhook] subscription updated, sub_id:', sub.id, 'plan:', plan, 'cancel_at_period_end:', cancel_at_period_end)
      const { error } = await supabase.from('trainers').update({
        plan,
        cancel_at_period_end,
        ...(ends_at && { subscription_ends_at: ends_at }),
      }).eq('stripe_subscription_id', sub.id)
      if (error) console.error('[webhook] supabase update error:', error)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      console.log('[webhook] subscription deleted, sub_id:', sub.id)
      const { error } = await supabase.from('trainers').update({ plan: 'inactive', cancel_at_period_end: false }).eq('stripe_subscription_id', sub.id)
      if (error) console.error('[webhook] supabase update error:', error)
      break
    }
  }

  return NextResponse.json({ received: true })
}
