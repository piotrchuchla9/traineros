'use client'

import type { BodyMeasurements } from '@/types/database'
import { useT } from '@/lib/i18n/context'

const FIXED_KEYS = ['chest', 'waist', 'hips', 'bicep', 'thigh', 'calf']

export function BodyMeasurementsViz({ measurements }: { measurements: BodyMeasurements | null }) {
  const t = useT()
  if (!measurements) return null

  const fixedItems = [
    { key: 'chest', label: t.progress.meas.chest },
    { key: 'waist', label: t.progress.meas.waist },
    { key: 'hips',  label: t.progress.meas.hips  },
    { key: 'bicep', label: t.progress.meas.bicep },
    { key: 'thigh', label: t.progress.meas.thigh },
    { key: 'calf',  label: t.progress.meas.calf  },
  ].filter(({ key }) => { const v = measurements[key]; return v != null && v > 0 })

  const customItems = Object.entries(measurements)
    .filter(([k, v]) => !FIXED_KEYS.includes(k) && v != null && (v as number) > 0)
    .map(([k, v]) => ({
      key: k,
      label: k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' '),
      value: v as number,
    }))

  const items = [
    ...fixedItems.map(i => ({ ...i, value: measurements[i.key] as number })),
    ...customItems,
  ]

  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map(({ key, label, value }) => (
        <div key={key} className="flex items-baseline gap-1 bg-muted rounded-lg px-2.5 py-1.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-sm font-semibold text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground">cm</span>
        </div>
      ))}
    </div>
  )
}
