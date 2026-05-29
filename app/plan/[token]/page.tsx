import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { DayAccordion } from '@/components/client-view/DayAccordion'
import { PlanPdfButton } from '@/components/client-view/PlanPdfButton'
import type { PlanDayWithExercises, PlanState } from '@/types/database'
import { getServerT } from '@/lib/i18n/server'

async function getPlanData(token: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: plan } = await supabase
    .from('plans')
    .select('*, clients(name)')
    .eq('share_token', token)
    .single()

  if (!plan || !plan.active) return null

  const { data: days } = await supabase
    .from('plan_days')
    .select('*')
    .eq('plan_id', plan.id)
    .order('day_order')

  const daysWithExercises: PlanDayWithExercises[] = []
  for (const day of days ?? []) {
    const { data: exercises } = await supabase
      .from('plan_exercises')
      .select('*, exercise:exercises(*)')
      .eq('day_id', day.id)
      .order('exercise_order')
    daysWithExercises.push({ ...day, exercises: (exercises ?? []) as any })
  }

  return { plan, client: (plan as any).clients, days: daysWithExercises }
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params
  const data = await getPlanData(token)
  const t = await getServerT()
  if (!data) return { title: t.clientView.title }
  return {
    title: `${data.plan.name} — ${data.client?.name ?? t.clientView.title}`,
    description: t.clientView.weeks(data.plan.weeks),
  }
}

export default async function ClientPlanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const data = await getPlanData(token)
  if (!data) notFound()

  const t = await getServerT()
  const { plan, client, days } = data
  const planState: PlanState = { ...plan, days }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-5">
        <div className="max-w-lg mx-auto">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.clientView.title}</p>
          <h1 className="text-2xl font-bold text-foreground">{plan.name}</h1>
          {client?.name && (
            <p className="text-muted-foreground mt-1">{t.clientView.for} {client.name}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{t.clientView.trainingDays(days.length)}</span>
              <span>·</span>
              <span>{t.clientView.weeks(plan.weeks)}</span>
            </div>
            <PlanPdfButton
              planId={plan.id}
              planName={plan.name}
              initialPlan={planState}
              clientName={client?.name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              ↓ {t.clientView.downloadPdf}
            </PlanPdfButton>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {days.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t.clientView.noExercisesInPlan}</p>
          </div>
        ) : (
          days.map((day, i) => (
            <DayAccordion key={day.id} day={day} index={i} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="max-w-lg mx-auto px-4 pb-10 text-center">
        <p className="text-xs text-muted-foreground">{t.clientView.footer}</p>
      </div>
    </div>
  )
}
