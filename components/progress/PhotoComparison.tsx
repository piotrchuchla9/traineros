'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useT } from '@/lib/i18n/context'
import type { ProgressEntry, BodyMeasurements } from '@/types/database'

interface Props {
  entries: [ProgressEntry, ProgressEntry] | null
  onClose: () => void
}

function delta(a: number | null | undefined, b: number | null | undefined) {
  if (a == null || b == null) return null
  const d = b - a
  if (Math.abs(d) < 0.05) return null
  return d > 0 ? `+${d.toFixed(1)}` : d.toFixed(1)
}

const FIXED_KEYS: (keyof BodyMeasurements)[] = ['chest', 'waist', 'hips', 'bicep', 'thigh', 'calf']

export function PhotoComparison({ entries, onClose }: Props) {
  const t = useT()
  const [photoA, setPhotoA] = useState(0)
  const [photoB, setPhotoB] = useState(0)

  if (!entries) return null
  const [a, b] = entries

  const weightDelta = delta(a.weight_kg, b.weight_kg)

  // All measurement keys across both entries
  const allKeys = Array.from(new Set([
    ...Object.keys(a.measurements ?? {}),
    ...Object.keys(b.measurements ?? {}),
  ])).filter(k => {
    const va = a.measurements?.[k]
    const vb = b.measurements?.[k]
    return (va != null && (va as number) > 0) || (vb != null && (vb as number) > 0)
  })

  function measLabel(key: string) {
    if (key in t.progress.meas) return (t.progress.meas as Record<string, string>)[key]
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
  }

  function PhotoSide({ entry, selectedIdx, onSelect }: {
    entry: ProgressEntry
    selectedIdx: number
    onSelect: (i: number) => void
  }) {
    const photo = entry.photos[selectedIdx]
    return (
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Main photo */}
        <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
          {photo ? (
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              Brak zdjęcia
            </div>
          )}
        </div>
        {/* Thumbnail selectors */}
        {entry.photos.length > 1 && (
          <div className="flex gap-1 flex-wrap">
            {entry.photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(i)}
                className={`w-9 h-9 rounded overflow-hidden border-2 transition-colors ${i === selectedIdx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={!!entries} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg w-[calc(100vw-1rem)] max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{t.progress.compareTitle}</DialogTitle>
        </DialogHeader>

        {/* Dates + weight */}
        <div className="flex gap-3 text-sm">
          <div className="flex-1">
            <p className="text-muted-foreground text-xs">
              {new Date(a.date + 'T12:00:00').toLocaleDateString(t.schedule.locale, { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            {a.weight_kg && <p className="font-bold text-lg">{a.weight_kg} kg</p>}
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground text-xs">
              {new Date(b.date + 'T12:00:00').toLocaleDateString(t.schedule.locale, { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            {b.weight_kg && (
              <div className="flex items-baseline gap-2">
                <p className="font-bold text-lg">{b.weight_kg} kg</p>
                {weightDelta && (
                  <span className={`text-sm font-medium ${parseFloat(weightDelta) < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {weightDelta} kg
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Large photos side by side */}
        {(a.photos.length > 0 || b.photos.length > 0) && (
          <div className="flex gap-2 mt-1">
            <PhotoSide entry={a} selectedIdx={Math.min(photoA, Math.max(0, a.photos.length - 1))} onSelect={setPhotoA} />
            <PhotoSide entry={b} selectedIdx={Math.min(photoB, Math.max(0, b.photos.length - 1))} onSelect={setPhotoB} />
          </div>
        )}

        {/* Measurements comparison table */}
        {allKeys.length > 0 && (
          <div className="mt-2 space-y-1">
            {allKeys.map(key => {
              const va = a.measurements?.[key] as number | null | undefined
              const vb = b.measurements?.[key] as number | null | undefined
              const d = delta(va, vb)
              return (
                <div key={key} className="flex items-center justify-between text-sm py-0.5 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground text-xs w-16 shrink-0">{measLabel(key)}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{va != null ? `${va} cm` : '—'}</span>
                    <span>→</span>
                    <span className="font-medium text-foreground">{vb != null ? `${vb} cm` : '—'}</span>
                    {d && <span className="text-muted-foreground">{d}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Notes */}
        {(a.notes || b.notes) && (
          <div className="flex gap-3 text-xs text-muted-foreground italic mt-1">
            <p className="flex-1">{a.notes}</p>
            <p className="flex-1">{b.notes}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
