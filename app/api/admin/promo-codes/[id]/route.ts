import { NextResponse } from 'next/server'
import { checkAdminApi, getAdminSupabase } from '@/lib/admin'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await checkAdminApi()
  if (error) return error

  const { id } = await params
  const body = await req.json() as { active?: boolean }

  const admin = getAdminSupabase()
  const { data, error: dbError } = await admin
    .from('promo_codes')
    .update({ active: body.active ?? false })
    .eq('id', id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data)
}
