'use client'

import { useT } from '@/lib/i18n/context'
import type { ProgressEntry, BodyMeasurements } from '@/types/database'

const FIXED_KEYS = ['chest', 'waist', 'hips', 'bicep', 'thigh', 'calf']

export function MeasurementTrend({ entries }: { entries: ProgressEntry[] }) {
  const t = useT()

  const withMeas = [...entries]
    .filter(e => e.measurements && Object.values(e.measurements).some(v => v != null))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (withMeas.length < 2) return null

  const first = withMeas[0].measurements as BodyMeasurements
  const last = withMeas[withMeas.length - 1].measurements as BodyMeasurements

  const allKeys = Array.from(new Set([...Object.keys(first), ...Object.keys(last)]))
    .filter(k => (first[k] != null || last[k] != null))

  if (allKeys.length === 0) return null

  function label(key: string): string {
    if (key in t.progress.meas) return (t.progress.meas as Record<string, string>)[key]
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2">{t.progress.measurementTrend}</p>
      <div className="flex flex-wrap gap-2">
        {allKeys.map(key => {
          const fv = first[key]
          const lv = last[key]
          if (fv == null && lv == null) return null
          const delta = fv != null && lv != null ? lv - fv : null
          return (
            <div key={key} className="flex items-baseline gap-1.5 bg-muted rounded-lg px-2.5 py-1.5">
              <span className="text-xs text-muted-foreground">{label(key)}</span>
              <span className="text-sm font-semibold text-foreground">{lv ?? fv} cm</span>
              {delta != null && Math.abs(delta) >= 0.1 && (
                <span className="text-xs font-medium text-muted-foreground">
                  {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
