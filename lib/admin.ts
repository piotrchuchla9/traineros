import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)
}

export function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!adminEmails().includes(user.email ?? '')) redirect('/dashboard')
  return user
}

export async function checkAdminApi(): Promise<
  { user: User; error: null } | { user: null; error: NextResponse }
> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!adminEmails().includes(user.email ?? ''))
    return { user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { user, error: null }
}
