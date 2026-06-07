import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { clientId } = await req.json()

  const { data: client } = await supabase
    .from('clients')
    .select('id, email, name, auth_user_id')
    .eq('id', clientId)
    .eq('trainer_id', user.id)
    .single()

  if (!client) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (!client.email) return NextResponse.json({ error: 'no_email' }, { status: 400 })
  if (client.auth_user_id) return NextResponse.json({ error: 'already_exists' }, { status: 400 })

  const password = generatePassword()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: client.email,
    password,
    email_confirm: true,
    user_metadata: { name: client.name, role: 'client' },
  })

  if (authError || !authData.user) {
    console.error('[create-account]', authError)
    const msg = authError?.message ?? ''
    if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered')) {
      return NextResponse.json({ error: 'email_taken' }, { status: 400 })
    }
    return NextResponse.json({ error: msg || 'auth_failed' }, { status: 500 })
  }

  const { error: updateError } = await admin
    .from('clients')
    .update({ auth_user_id: authData.user.id })
    .eq('id', clientId)

  if (updateError) {
    console.error('[create-account] update error', updateError)
    // rollback: delete the created auth user
    await admin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }

  return NextResponse.json({ password })
}
