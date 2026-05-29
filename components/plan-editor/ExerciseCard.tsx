'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useT, useLang } from '@/lib/i18n/context'
import { exName, exDesc } from '@/lib/i18n/exercise'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PlanExercise } from '@/types/database'

function getYoutubeId(url: string | null): string | null {
  if (!url) return null
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return match?.[1] ?? null
}

export function ExerciseCard({
  planExercise,
  onChange,
  onDelete,
}: {
  planExercise: PlanExercise
  onChange: (id: string, field: string, value: string | number) => void
  onDelete: (id: string) => void
}) {
  const t = useT()
  const { locale } = useLang()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: planExercise.id })

  const [videoOpen, setVideoOpen] = useState(false)
  const youtubeId = getYoutubeId(planExercise.exercise.youtube_url)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  function handleChange(field: string, value: string) {
    const numFields = ['sets', 'rest_seconds']
    onChange(planExercise.id, field, numFields.includes(field) ? (Number(value) || 0) : value)
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-card border border-border rounded-lg p-3 shadow-sm">
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-1 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          aria-label={t.planEditor.drag}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-sm text-foreground truncate">{exName(planExercise.exercise, locale)}</p>
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              {youtubeId && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setVideoOpen(true)}>
                  ▶ {t.exercises.video}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground/40 hover:text-destructive"
                onClick={() => onDelete(planExercise.id)}
              >
                ×
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">{t.planEditor.sets}</label>
              <Input
                type="number"
                min={1}
                value={planExercise.sets}
                onChange={e => handleChange('sets', e.target.value)}
                className="h-8 text-sm mt-0.5"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t.planEditor.reps}</label>
              <Input
                value={planExercise.reps}
                onChange={e => handleChange('reps', e.target.value)}
                placeholder="8-10"
                className="h-8 text-sm mt-0.5"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t.planEditor.rest}</label>
              <Input
                type="number"
                min={0}
                value={planExercise.rest_seconds ?? ''}
                onChange={e => handleChange('rest_seconds', e.target.value)}
                placeholder="90"
                className="h-8 text-sm mt-0.5"
              />
            </div>
          </div>

          <div className="mt-2">
            <label className="text-xs text-muted-foreground">{t.planEditor.notes}</label>
            <Textarea
              value={planExercise.notes ?? ''}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder={t.planEditor.notesPlaceholder}
              rows={2}
              className="text-sm mt-0.5 resize-none"
            />
          </div>
        </div>
      </div>

      {/* YouTube modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{exName(planExercise.exercise, locale)}</DialogTitle>
          </DialogHeader>
          {youtubeId && (
            <div className="aspect-video">
              <iframe
                className="w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {exDesc(planExercise.exercise, locale) && (
            <p className="text-sm text-muted-foreground">{exDesc(planExercise.exercise, locale)}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
