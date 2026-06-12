'use client'

import { useState, useEffect } from 'react'
import type { PlanDayWithExercises } from '@/types/database'
import { useT, useLang } from '@/lib/i18n/context'
import { exName, exDesc } from '@/lib/i18n/exercise'

function getYoutubeId(url: string | null): string | null {
  if (!url) return null
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return match?.[1] ?? null
}

export function DayAccordion({ day, index }: { day: PlanDayWithExercises; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const [videoId, setVideoId] = useState<string | null>(null)
  const t = useT()
  const { locale } = useLang()

  useEffect(() => {
    const mq = window.matchMedia('print')
    const handler = () => setOpen(true)
    mq.addEventListener('change', handler)
    window.addEventListener('beforeprint', handler)
    return () => {
      mq.removeEventListener('change', handler)
      window.removeEventListener('beforeprint', handler)
    }
  }, [])

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="cursor-pointer w-full flex items-center justify-between px-4 py-4 bg-card font-semibold text-left text-foreground"
        onClick={() => setOpen(o => !o)}
      >
        <span>{day.name}</span>
        <span className="text-muted-foreground text-lg">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="divide-y divide-border">
          {day.exercises.length === 0 && (
            <p className="text-sm text-muted-foreground px-4 py-3">{t.clientView.noExercises}</p>
          )}
          {day.exercises.map((ex, i) => {
            const ytId = getYoutubeId(ex.exercise.youtube_url)
            return (
              <div key={ex.id} className="px-4 py-4 bg-muted">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground text-base">{exName(ex.exercise, locale)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.muscle[ex.exercise.muscle_group as keyof typeof t.muscle] ?? ex.exercise.muscle_group}</p>
                  </div>
                  {ytId && (
                    <button
                      className="cursor-pointer text-sm text-blue-600 font-medium ml-4 flex-shrink-0 mt-1"
                      onClick={() => setVideoId(v => v === ytId ? null : ytId)}
                    >
                      {videoId === ytId ? t.clientView.hideVideo : t.clientView.watchVideo}
                    </button>
                  )}
                </div>

                {/* Video lazy-load */}
                {videoId === ytId && ytId && (
                  <div className="aspect-video mb-3 rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${ytId}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                <div className="flex gap-4 text-sm">
                  <div className="bg-card rounded-lg px-3 py-2 text-center border border-border">
                    <div className="text-lg font-bold text-foreground">{ex.sets}</div>
                    <div className="text-xs text-muted-foreground">{t.clientView.sets}</div>
                  </div>
                  <div className="bg-card rounded-lg px-3 py-2 text-center border border-border">
                    <div className="text-lg font-bold text-foreground">{ex.reps}</div>
                    <div className="text-xs text-muted-foreground">{t.clientView.reps}</div>
                  </div>
                  {ex.rest_seconds && (
                    <div className="bg-card rounded-lg px-3 py-2 text-center border border-border">
                      <div className="text-lg font-bold text-foreground">{ex.rest_seconds}s</div>
                      <div className="text-xs text-muted-foreground">{t.clientView.rest}</div>
                    </div>
                  )}
                </div>

                {ex.exercise.description && (
                  <p className="text-sm text-muted-foreground mt-2 italic">{exDesc(ex.exercise, locale)}</p>
                )}

                {ex.notes && (
                  <p className="text-sm text-foreground mt-2 bg-card rounded-lg px-3 py-2 border border-border">
                    💡 {ex.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
