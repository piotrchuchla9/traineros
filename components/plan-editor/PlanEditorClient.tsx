'use client'

import dynamic from 'next/dynamic'
import type { PlanState } from '@/types/database'

const PlanEditor = dynamic(
  () => import('./PlanEditor').then(m => ({ default: m.PlanEditor })),
  { ssr: false }
)

export function PlanEditorClient({ initialPlan }: { initialPlan: PlanState }) {
  return <PlanEditor initialPlan={initialPlan} />
}
