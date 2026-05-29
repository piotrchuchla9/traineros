import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: trainer } = await supabase.from('trainers').select('stripe_customer_id').eq('id', user.id).single()
  if (!trainer?.stripe_customer_id) return NextResponse.json({ error: 'No subscription found' }, { status: 404 })

  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: trainer.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
  })

  return NextResponse.json({ url: session.url })
}
