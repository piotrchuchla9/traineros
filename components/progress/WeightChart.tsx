'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n/context'
import type { ProgressEntry } from '@/types/database'

const TW = 96
const TH = 34

export function WeightChart({ entries }: { entries: ProgressEntry[] }) {
  const t = useT()
  const [hovered, setHovered] = useState<number | null>(null)

  const pts = [...entries]
    .filter(e => e.weight_kg != null)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (pts.length < 2) return null

  const weights = pts.map(e => e.weight_kg!)
  const rawMin = Math.min(...weights)
  const rawMax = Math.max(...weights)
  const pad = Math.max((rawMax - rawMin) * 0.2, 1)
  const minW = rawMin - pad
  const maxW = rawMax + pad
  const range = maxW - minW

  const W = 480
  const H = 120
  const PL = 36, PR = 20, PT = 20, PB = 24
  const cW = W - PL - PR
  const cH = H - PT - PB

  const px = (i: number) => PL + (pts.length === 1 ? cW / 2 : (i / (pts.length - 1)) * cW)
  const py = (w: number) => PT + (1 - (w - minW) / range) * cH

  const coords = pts.map((e, i) => ({ x: px(i), y: py(e.weight_kg!), e }))
  const polyPts = coords.map(c => `${c.x},${c.y}`).join(' ')
  const areaPts = `${polyPts} ${coords[coords.length - 1].x},${PT + cH} ${PL},${PT + cH}`

  const gridVals = [rawMin, +((rawMin + rawMax) / 2).toFixed(1), rawMax]
  const fmt = (v: number) => Number.isInteger(v) ? String(v) : v.toFixed(1)

  const renderTooltip = (c: typeof coords[0]) => {
    const above = c.y - PT > TH + 10
    const ty = above ? c.y - TH - 8 : c.y + 8
    const tx = Math.max(PL, Math.min(c.x - TW / 2, W - PR - TW))
    const dateStr = new Date(c.e.date + 'T12:00:00').toLocaleDateString(
      t.schedule.locale, { day: 'numeric', month: 'short', year: 'numeric' }
    )
    return (
      <g style={{ pointerEvents: 'none' }}>
        <rect
          x={tx} y={ty} width={TW} height={TH} rx="4"
          style={{ fill: 'var(--card)' }}
          stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.75"
        />
        <text x={tx + 6} y={ty + 12} fontSize="7.5" fill="currentColor" fillOpacity="0.55">
          {t.progress.chartWeight}
        </text>
        <text x={tx + TW - 6} y={ty + 12} fontSize="7.5" fontWeight="600" fill="currentColor" textAnchor="end">
          {fmt(c.e.weight_kg!)} {t.progress.kg}
        </text>
        <text x={tx + 6} y={ty + 25} fontSize="7.5" fill="currentColor" fillOpacity="0.55">
          {t.progress.entryDate}
        </text>
        <text x={tx + TW - 6} y={ty + 25} fontSize="7.5" fontWeight="600" fill="currentColor" textAnchor="end">
          {dateStr}
        </text>
      </g>
    )
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{t.progress.weightChart}</p>
      <div className="text-primary">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" overflow="visible">
          {/* Grid lines */}
          {gridVals.map((v, i) => (
            <g key={i}>
              <line
                x1={PL} y1={py(v)} x2={W - PR} y2={py(v)}
                stroke="currentColor" strokeOpacity={i === 0 ? 0.25 : 0.12}
                strokeWidth="1" strokeDasharray={i === 0 ? undefined : '3 3'}
              />
              <text
                x={PL - 4} y={py(v) + 4}
                textAnchor="end" fontSize="8"
                fill="currentColor" fillOpacity="0.45"
              >
                {fmt(v)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <polygon points={areaPts} fill="currentColor" fillOpacity="0.08" />

          {/* Line */}
          <polyline
            points={polyPts} fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinejoin="round" strokeLinecap="round"
          />

          {/* Dots with value labels */}
          {coords.map((c, i) => {
            const labelBelow = c.y - PT < 14
            return (
              <g
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'crosshair' }}
              >
                {/* enlarged invisible hit area */}
                <circle cx={c.x} cy={c.y} r="10" fill="transparent" />
                <circle cx={c.x} cy={c.y} r="3.5" fill="currentColor" />
                <text
                  x={c.x}
                  y={labelBelow ? c.y + 12 : c.y - 7}
                  textAnchor={i === 0 ? 'start' : i === coords.length - 1 ? 'end' : 'middle'}
                  fontSize="8"
                  fontWeight="600"
                  fill="currentColor"
                  fillOpacity="0.85"
                >
                  {fmt(c.e.weight_kg!)}
                </text>
              </g>
            )
          })}

          {/* Tooltip */}
          {hovered !== null && renderTooltip(coords[hovered])}

          {/* Date labels: first and last only */}
          {[coords[0], coords[coords.length - 1]].map((c, i) => (
            <text
              key={i}
              x={c.x}
              y={H - 4}
              textAnchor={i === 0 ? 'start' : 'end'}
              fontSize="8"
              fill="currentColor" fillOpacity="0.45"
            >
              {new Date(c.e.date + 'T12:00:00').toLocaleDateString(t.schedule.locale, { day: 'numeric', month: 'short' })}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}
