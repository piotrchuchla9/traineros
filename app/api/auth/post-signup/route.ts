import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const promoCode = user.user_metadata?.promo_code
  if (!promoCode) return NextResponse.json({ ok: true })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: promo } = await admin
    .from('promo_codes')
    .select('*')
    .eq('code', promoCode.trim().toUpperCase())
    .eq('active', true)
    .single()

  if (promo && promo.uses < promo.max_uses) {
    const newEndsAt = new Date(Date.now() + promo.trial_days * 86400000).toISOString()
    await admin.from('trainers').update({ trial_ends_at: newEndsAt }).eq('id', user.id)
    await admin.from('promo_codes').update({ uses: promo.uses + 1 }).eq('id', promo.id)
  }

  return NextResponse.json({ ok: true })
}
