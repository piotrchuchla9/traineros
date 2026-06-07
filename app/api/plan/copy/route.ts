import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { planId, targetClientId } = await req.json()

  // Verify plan belongs to trainer
  const { data: plan } = await supabase
    .from('plans')
    .select('*')
    .eq('id', planId)
    .eq('trainer_id', user.id)
    .single()
  if (!plan) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // Verify target client belongs to trainer
  const { data: targetClient } = await supabase
    .from('clients')
    .select('id')
    .eq('id', targetClientId)
    .eq('trainer_id', user.id)
    .single()
  if (!targetClient) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // Fetch plan days with exercises
  const { data: days } = await supabase
    .from('plan_days')
    .select('*, plan_exercises(*)')
    .eq('plan_id', planId)
    .order('day_order')

  // Create new plan
  const { data: newPlan, error: planErr } = await supabase
    .from('plans')
    .insert({
      client_id: targetClientId,
      trainer_id: user.id,
      name: plan.name,
      share_token: crypto.randomUUID(),
      active: true,
      weeks: plan.weeks,
    })
    .select()
    .single()

  if (planErr || !newPlan) return NextResponse.json({ error: 'insert_failed' }, { status: 500 })

  // Copy days and exercises
  for (const day of days ?? []) {
    const { data: newDay } = await supabase
      .from('plan_days')
      .insert({ plan_id: newPlan.id, name: day.name, day_order: day.day_order })
      .select()
      .single()

    if (!newDay) continue

    const exercises = (day as any).plan_exercises ?? []
    if (exercises.length > 0) {
      await supabase.from('plan_exercises').insert(
        exercises.map((ex: any) => ({
          day_id: newDay.id,
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
          exercise_order: ex.exercise_order,
        }))
      )
    }
  }

  return NextResponse.json({ newPlanId: newPlan.id })
}
