import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isRestricted } from '@/lib/access'
import { NewClientForm } from './NewClientForm'

export default async function NewClientPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trainer } = await supabase.from('trainers').select('plan, trial_ends_at').eq('id', user.id).single()
  if (trainer && isRestricted(trainer)) redirect('/settings')

  return <NewClientForm />
}
