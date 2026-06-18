import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AppLayout } from '@/components/shared/AppLayout'
import { ScheduleClient } from './ScheduleClient'
import { getCalendarDays, toDateStr } from './utils'
import { isRestricted } from '@/lib/access'
import type { Client, TrainerLocation } from '@/types/database'

export default async function SchedulePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const { data: trainer } = await supabase.from('trainers').select('plan, trial_ends_at').eq('id', user.id).single()
  const restricted = trainer ? isRestricted(trainer) : false
  const calDays = getCalendarDays(now.getFullYear(), now.getMonth())
  const calFrom = toDateStr(calDays[0].date)
  const calTo = toDateStr(calDays[calDays.length - 1].date)

  const [{ data: sessions }, { data: allSessions }, { data: clients }, { data: locations }] = await Promise.all([
    (supabase as any)
      .from('training_sessions')
      .select('*, client:clients(id,name), location:trainer_locations(id,name)')
      .eq('trainer_id', user.id)
      .gte('date', calFrom)
      .lte('date', calTo)
      .order('date').order('time'),
    (supabase as any)
      .from('training_sessions')
      .select('*, client:clients(id,name), location:trainer_locations(id,name)')
      .eq('trainer_id', user.id)
      .order('date').order('time'),
    supabase.from('clients').select('id,name').eq('trainer_id', user.id).eq('active', true).order('name'),
    supabase.from('trainer_locations').select('*').eq('trainer_id', user.id).order('name'),
  ])

  return (
    <AppLayout>
      <ScheduleClient
        initialSessions={sessions ?? []}
        initialAllSessions={allSessions ?? []}
        clients={(clients ?? []) as Client[]}
        locations={(locations ?? []) as TrainerLocation[]}
        trainerId={user.id}
        initialYear={now.getFullYear()}
        initialMonth={now.getMonth()}
        restricted={restricted}
      />
    </AppLayout>
  )
}
