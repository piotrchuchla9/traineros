import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isRestricted } from '@/lib/access'
import { NewPlanForm } from './NewPlanForm'

export default async function NewPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trainer } = await supabase.from('trainers').select('plan, trial_ends_at').eq('id', user.id).single()
  if (trainer && isRestricted(trainer)) redirect('/settings')

  return <NewPlanForm params={params} />
}
