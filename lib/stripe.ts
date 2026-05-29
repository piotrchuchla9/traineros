import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(key, { apiVersion: '2026-05-27.dahlia' })
  }
  return _stripe
}

export function getPlanFromPriceId(priceId: string): 'basic' | 'pro' | 'inactive' {
  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return 'basic'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  return 'inactive'
}
