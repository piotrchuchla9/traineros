import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json() as { plan: 'basic' | 'pro' }
  const priceId = plan === 'pro'
    ? process.env.STRIPE_PRO_PRICE_ID!
    : process.env.STRIPE_BASIC_PRICE_ID!

  const { data: trainer } = await supabase.from('trainers').select('*').eq('id', user.id).single()
  if (!trainer) return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })

  const isFirstSubscription = !trainer.stripe_customer_id
  const trialDaysLeft = isFirstSubscription && trainer.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(trainer.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  const stripe = getStripe()
  const base = process.env.NEXT_PUBLIC_BASE_URL!
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    ...(trainer.stripe_customer_id
      ? { customer: trainer.stripe_customer_id }
      : { customer_email: trainer.email }),
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: trialDaysLeft > 0 ? trialDaysLeft : undefined,
    },
    success_url: `${base}/settings?success=1`,
    cancel_url: `${base}/settings`,
    metadata: { trainer_id: trainer.id, plan },
  })

  return NextResponse.json({ url: session.url })
}
