'use client'

import { useT } from '@/lib/i18n/context'
import type { ProgressEntry, WorkoutLog } from '@/types/database'
import type { Plan } from '@/types/database'
import { ProgressTimeline } from './ProgressTimeline'
import { WorkoutLogsSection } from './WorkoutLogsSection'
import { AddProgressEntrySheet } from './AddProgressEntrySheet'
import { AddWorkoutLogSheet } from './AddWorkoutLogSheet'
import { WeightChart } from './WeightChart'
import { MeasurementTrend } from './MeasurementTrend'

interface Props {
  entries: ProgressEntry[]
  logs: WorkoutLog[]
  plans: Plan[]
  clientId: string
  trainerId: string
  restricted?: boolean
}

export function ProgressSection({ entries, logs, plans, clientId, trainerId, restricted = false }: Props) {
  const t = useT()

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{t.progress.progressPhotos}</h2>
          {!restricted && <AddProgressEntrySheet clientId={clientId} trainerId={trainerId} />}
        </div>
        {entries.length >= 2 && (
          <div className="mb-6 space-y-4">
            <WeightChart entries={entries} />
            <MeasurementTrend entries={entries} />
          </div>
        )}
        <ProgressTimeline entries={entries} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{t.progress.workoutLogs}</h2>
          {!restricted && <AddWorkoutLogSheet clientId={clientId} trainerId={trainerId} plans={plans} />}
        </div>
        <WorkoutLogsSection logs={logs} />
      </div>
    </div>
  )
}
