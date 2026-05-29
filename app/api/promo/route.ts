import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get('code')
  if (!code) return NextResponse.json({ valid: false })

  const { data } = await getAdmin()
    .from('promo_codes')
    .select('trial_days, uses, max_uses')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single()

  if (!data || data.uses >= data.max_uses) return NextResponse.json({ valid: false })
  return NextResponse.json({ valid: true, days: data.trial_days })
}

export async function POST(req: Request) {
  const { code } = await req.json() as { code: string }
  if (!code?.trim()) return NextResponse.json({ error: 'No code' }, { status: 400 })

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()

  const { data: promo } = await admin
    .from('promo_codes')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('active', true)
    .single()

  if (!promo) return NextResponse.json({ error: 'invalid' }, { status: 404 })
  if (promo.uses >= promo.max_uses) return NextResponse.json({ error: 'exhausted' }, { status: 410 })

  const newEndsAt = new Date(Date.now() + promo.trial_days * 86400000).toISOString()

  await admin.from('trainers').update({ trial_ends_at: newEndsAt, plan: 'trial' }).eq('id', user.id)
  await admin.from('promo_codes').update({ uses: promo.uses + 1 }).eq('id', promo.id)

  return NextResponse.json({ days: promo.trial_days })
}
