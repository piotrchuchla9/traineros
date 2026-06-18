import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export async function POST() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const service = createSupabaseServiceClient()
  await (service as any).from('trainer_google_tokens').delete().eq('trainer_id', user.id)

  return NextResponse.json({ ok: true })
}
