'use client'

import { useT } from '@/lib/i18n/context'
import type { ProgressEntry } from '@/types/database'

export function WeightChart({ entries }: { entries: ProgressEntry[] }) {
  const t = useT()
  const pts = [...entries]
    .filter(e => e.weight_kg != null)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (pts.length < 2) return null

  const weights = pts.map(e => e.weight_kg!)
  const rawMin = Math.min(...weights)
  const rawMax = Math.max(...weights)
  const pad = Math.max((rawMax - rawMin) * 0.15, 0.5)
  const minW = rawMin - pad
  const maxW = rawMax + pad
  const range = maxW - minW

  const W = 480
  const H = 140
  const PL = 40, PR = 12, PT = 16, PB = 28
  const cW = W - PL - PR
  const cH = H - PT - PB

  const px = (i: number) => PL + (pts.length === 1 ? cW / 2 : (i / (pts.length - 1)) * cW)
  const py = (w: number) => PT + (1 - (w - minW) / range) * cH

  const coords = pts.map((e, i) => ({ x: px(i), y: py(e.weight_kg!), e }))
  const polyPts = coords.map(c => `${c.x},${c.y}`).join(' ')
  const areaPts = `${polyPts} ${coords[coords.length - 1].x},${PT + cH} ${PL},${PT + cH}`

  const gridVals = [rawMin, (rawMin + rawMax) / 2, rawMax]
  const showLabels = pts.length <= 6

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2">{t.progress.weightChart}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-foreground" overflow="visible">
        {/* Grid lines */}
        {gridVals.map((v, i) => (
          <g key={i}>
            <line x1={PL} y1={py(v)} x2={W - PR} y2={py(v)}
              stroke="currentColor" strokeOpacity="0.1" strokeWidth="1"
              strokeDasharray={i === 0 ? '0' : '4 3'} />
            <text x={PL - 5} y={py(v) + 4} textAnchor="end" fontSize="9" fill="currentColor" fillOpacity="0.45">
              {v % 1 === 0 ? v : v.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <polygon points={areaPts} fill="hsl(var(--primary))" fillOpacity="0.07" />

        {/* Line */}
        <polyline points={polyPts} fill="none" stroke="hsl(var(--primary))"
          strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots + optional value labels */}
        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r="3.5" fill="hsl(var(--primary))" />
            {showLabels && (
              <text x={c.x} y={c.y - 9} textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.65">
                {c.e.weight_kg}
              </text>
            )}
          </g>
        ))}

        {/* Date labels: first, last (+ middle if enough space) */}
        {coords
          .filter((_, i) => i === 0 || i === coords.length - 1 || (coords.length <= 4 && i > 0 && i < coords.length - 1))
          .map((c, i, arr) => (
            <text key={i} x={c.x} y={H - 4}
              textAnchor={c.x < PL + 40 ? 'start' : c.x > W - PR - 40 ? 'end' : 'middle'}
              fontSize="9" fill="currentColor" fillOpacity="0.45">
              {new Date(c.e.date + 'T12:00:00').toLocaleDateString(t.schedule.locale, { day: 'numeric', month: 'short' })}
            </text>
          ))}
      </svg>
    </div>
  )
}
