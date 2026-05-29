'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { PlanPdfDocument } from './PlanPdfDocument'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/context'
import type { PlanState, PlanDayWithExercises } from '@/types/database'

async function fetchPlanData(planId: string): Promise<{ plan: PlanState; clientName?: string } | null> {
  const supabase = createClient()

  const { data: plan } = await supabase
    .from('plans')
    .select('*, clients(name)')
    .eq('id', planId)
    .single()

  if (!plan) return null

  const { data: days } = await supabase
    .from('plan_days')
    .select('*')
    .eq('plan_id', planId)
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

  return {
    plan: { ...plan, days: daysWithExercises },
    clientName: (plan as any).clients?.name,
  }
}

export function PlanPdfButton({
  planId,
  planName,
  initialPlan,
  clientName,
  className,
  children,
}: {
  planId: string
  planName: string
  initialPlan?: PlanState
  clientName?: string
  className?: string
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(false)
  const { locale } = useLang()

  async function handleDownload(e: React.MouseEvent) {
    e.stopPropagation()
    setLoading(true)
    try {
      const data = initialPlan
        ? { plan: initialPlan, clientName }
        : await fetchPlanData(planId)

      if (!data) return

      const blob = await pdf(
        <PlanPdfDocument plan={data.plan} clientName={data.clientName} locale={locale} />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${planName}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDownload} disabled={loading} className={className}>
      {loading ? '...' : children}
    </button>
  )
}
