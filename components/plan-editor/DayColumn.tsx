'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n/context'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExerciseCard } from './ExerciseCard'
import type { PlanDayWithExercises, PlanExercise, Exercise } from '@/types/database'

export function DayColumn({
  day,
  onDayNameChange,
  onDeleteDay,
  onExerciseChange,
  onDeleteExercise,
  onAddExercise,
}: {
  day: PlanDayWithExercises
  onDayNameChange: (dayId: string, name: string) => void
  onDeleteDay: (dayId: string) => void
  onExerciseChange: (dayId: string, exerciseId: string, field: string, value: string | number) => void
  onDeleteExercise: (dayId: string, exerciseId: string) => void
  onAddExercise: (dayId: string) => void
}) {
  const t = useT()
  const [editingName, setEditingName] = useState(false)
  const { setNodeRef, isOver } = useDroppable({ id: day.id })

  return (
    <div
      ref={setNodeRef}
      className={`bg-muted/50 rounded-xl p-4 min-w-[280px] flex-shrink-0 border-2 transition-colors ${
        isOver ? 'border-primary/40 bg-primary/5' : 'border-transparent'
      }`}
    >
      {/* Day header */}
      <div className="flex items-center justify-between mb-3">
        {editingName ? (
          <Input
            autoFocus
            value={day.name}
            onChange={e => onDayNameChange(day.id, e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
            className="h-8 text-sm font-semibold"
          />
        ) : (
          <h3
            className="font-semibold text-foreground text-sm cursor-pointer hover:text-primary flex-1"
            onClick={() => setEditingName(true)}
            title={t.planEditor.dayEditTitle}
          >
            {day.name || t.planEditor.dayPlaceholder}
          </h3>
        )}
        <button
          onClick={() => onDeleteDay(day.id)}
          className="ml-2 text-muted-foreground/40 hover:text-red-500 text-lg leading-none"
          title={t.planEditor.deleteDay}
        >
          ×
        </button>
      </div>

      {/* Exercises */}
      <SortableContext
        items={day.exercises.map(e => e.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 min-h-[60px]">
          {day.exercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              planExercise={exercise}
              onChange={(id, field, value) => onExerciseChange(day.id, id, field, value)}
              onDelete={id => onDeleteExercise(day.id, id)}
            />
          ))}
        </div>
      </SortableContext>

      <Button
        variant="outline"
        size="sm"
        className="w-full mt-3 text-xs"
        onClick={() => onAddExercise(day.id)}
      >
        {t.planEditor.addExercise}
      </Button>
    </div>
  )
}
