import { NextResponse } from 'next/server'
import { checkAdminApi, getAdminSupabase } from '@/lib/admin'

export async function GET() {
  const { error } = await checkAdminApi()
  if (error) return error

  const admin = getAdminSupabase()
  const { data, error: dbError } = await admin
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { error } = await checkAdminApi()
  if (error) return error

  const { code, trial_days, max_uses, description } = await req.json() as {
    code: string
    trial_days: number
    max_uses: number
    description?: string
  }

  if (!code?.trim()) return NextResponse.json({ error: 'Kod jest wymagany' }, { status: 400 })
  if (!trial_days || trial_days < 1) return NextResponse.json({ error: 'Nieprawidłowa liczba dni' }, { status: 400 })
  if (!max_uses || max_uses < 1) return NextResponse.json({ error: 'Nieprawidłowa liczba użyć' }, { status: 400 })

  const admin = getAdminSupabase()
  const { data, error: dbError } = await admin
    .from('promo_codes')
    .insert({ code: code.trim().toUpperCase(), trial_days, max_uses, description: description?.trim() || null })
    .select()
    .single()

  if (dbError) {
    if (dbError.code === '23505') return NextResponse.json({ error: 'Kod już istnieje' }, { status: 409 })
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
