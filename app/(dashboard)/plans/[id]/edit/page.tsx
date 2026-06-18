import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PlanEditorClient } from '@/components/plan-editor/PlanEditorClient'
import { isRestricted } from '@/lib/access'
import type { PlanState, PlanDayWithExercises } from '@/types/database'
import { getServerT } from '@/lib/i18n/server'

export default async function PlanEditPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getServerT()
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trainer } = await supabase.from('trainers').select('plan, trial_ends_at').eq('id', user.id).single()
  if (trainer && isRestricted(trainer)) redirect('/settings')

  const { data: plan } = await supabase
    .from('plans')
    .select('*')
    .eq('id', id)
    .eq('trainer_id', user.id)
    .single()

  if (!plan) notFound()

  const { data: client } = await supabase
    .from('clients')
    .select('name')
    .eq('id', plan.client_id)
    .single()

  const { data: days } = await supabase
    .from('plan_days')
    .select('*')
    .eq('plan_id', id)
    .order('day_order')

  const daysWithExercises: PlanDayWithExercises[] = []

  for (const day of days ?? []) {
    const { data: exercises } = await supabase
      .from('plan_exercises')
      .select('*, exercise:exercises(*)')
      .eq('day_id', day.id)
      .order('exercise_order')

    daysWithExercises.push({
      ...day,
      exercises: (exercises ?? []) as any,
    })
  }

  const planState: PlanState = { ...plan, days: daysWithExercises }

  return (
    <div className="min-h-screen flex flex-col bg-card">
      <header className="bg-card border-b border-border px-6 py-3 flex items-center gap-4 sticky top-0 z-40">
        <Link href={`/clients/${plan.client_id}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← {client?.name ?? '...'}
        </Link>
        <span className="text-muted-foreground/40">|</span>
        <Link href="/" className="text-base font-bold text-foreground">TrainerOS</Link>
      </header>
      <div className="flex-1 flex flex-col">
        <PlanEditorClient initialPlan={planState} />
      </div>
    </div>
  )
}
