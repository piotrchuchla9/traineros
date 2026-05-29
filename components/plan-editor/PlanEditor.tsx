'use client'

import { useState, useCallback, useRef } from 'react'
import { useT } from '@/lib/i18n/context'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DayColumn } from './DayColumn'
import { ExercisePicker } from './ExercisePicker'
import { createClient } from '@/lib/supabase/client'
import type { PlanState, PlanDayWithExercises, PlanExercise, Exercise } from '@/types/database'
import { nanoid } from 'nanoid'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function PlanEditor({ initialPlan }: { initialPlan: PlanState }) {
  const t = useT()
  const [plan, setPlan] = useState<PlanState>(initialPlan)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerDayId, setPickerDayId] = useState<string | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // ── Auto-save helpers ──────────────────────────────────────────────────
  const scheduleSave = useCallback((fn: () => Promise<void>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaveStatus('saving')
    saveTimerRef.current = setTimeout(async () => {
      try {
        await fn()
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      }
    }, 500)
  }, [])

  // ── Plan name ──────────────────────────────────────────────────────────
  function handlePlanNameChange(name: string) {
    setPlan(p => ({ ...p, name }))
    scheduleSave(async () => {
      await supabase.from('plans').update({ name }).eq('id', plan.id)
    })
  }

  // ── Days ───────────────────────────────────────────────────────────────
  async function handleAddDay() {
    const order = plan.days.length
    const { data } = await supabase.from('plan_days').insert({
      plan_id: plan.id,
      name: t.planEditor.dayDefault(order + 1),
      day_order: order,
    }).select().single()
    if (data) {
      setPlan(p => ({ ...p, days: [...p.days, { ...data, exercises: [] }] }))
    }
  }

  function handleDayNameChange(dayId: string, name: string) {
    setPlan(p => ({
      ...p,
      days: p.days.map(d => d.id === dayId ? { ...d, name } : d),
    }))
    scheduleSave(async () => {
      await supabase.from('plan_days').update({ name }).eq('id', dayId)
    })
  }

  async function handleDeleteDay(dayId: string) {
    await supabase.from('plan_days').delete().eq('id', dayId)
    setPlan(p => ({ ...p, days: p.days.filter(d => d.id !== dayId) }))
  }

  // ── Exercises ──────────────────────────────────────────────────────────
  function openPicker(dayId: string) {
    setPickerDayId(dayId)
    setPickerOpen(true)
  }

  async function handleExerciseSelected(exercise: Exercise) {
    if (!pickerDayId) return
    const day = plan.days.find(d => d.id === pickerDayId)
    if (!day) return
    const order = day.exercises.length

    const { data } = await supabase.from('plan_exercises').insert({
      day_id: pickerDayId,
      exercise_id: exercise.id,
      sets: 3,
      reps: '10',
      rest_seconds: 90,
      exercise_order: order,
    }).select().single()

    if (data) {
      const fullExercise: PlanExercise = { ...data, exercise }
      setPlan(p => ({
        ...p,
        days: p.days.map(d =>
          d.id === pickerDayId ? { ...d, exercises: [...d.exercises, fullExercise] } : d
        ),
      }))
    }
  }

  function handleExerciseChange(dayId: string, exerciseId: string, field: string, value: string | number) {
    setPlan(p => ({
      ...p,
      days: p.days.map(d =>
        d.id !== dayId ? d : {
          ...d,
          exercises: d.exercises.map(e => e.id === exerciseId ? { ...e, [field]: value } : e),
        }
      ),
    }))
    // Build a typed update object
    const allowedFields = ['sets', 'reps', 'rest_seconds', 'notes', 'exercise_order'] as const
    type AllowedField = typeof allowedFields[number]
    if (!allowedFields.includes(field as AllowedField)) return
    const update = { [field]: value } as Record<AllowedField, string | number>
    scheduleSave(async () => {
      await supabase.from('plan_exercises').update(update as any).eq('id', exerciseId)
    })
  }

  async function handleDeleteExercise(dayId: string, exerciseId: string) {
    await supabase.from('plan_exercises').delete().eq('id', exerciseId)
    setPlan(p => ({
      ...p,
      days: p.days.map(d =>
        d.id !== dayId ? d : { ...d, exercises: d.exercises.filter(e => e.id !== exerciseId) }
      ),
    }))
  }

  // ── Drag & Drop ────────────────────────────────────────────────────────
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    // Find source day
    const sourceDayIdx = plan.days.findIndex(d => d.exercises.some(e => e.id === active.id))
    if (sourceDayIdx === -1) return

    // Find target day (either an exercise's day or a day column itself)
    let targetDayIdx = plan.days.findIndex(d => d.exercises.some(e => e.id === over.id))
    if (targetDayIdx === -1) targetDayIdx = plan.days.findIndex(d => d.id === over.id)
    if (targetDayIdx === -1) return

    const newDays = [...plan.days]

    if (sourceDayIdx === targetDayIdx) {
      // Same day — reorder
      const day = newDays[sourceDayIdx]
      const oldIdx = day.exercises.findIndex(e => e.id === active.id)
      const newIdx = day.exercises.findIndex(e => e.id === over.id)
      const reordered = arrayMove(day.exercises, oldIdx, newIdx).map((e, i) => ({ ...e, exercise_order: i }))
      newDays[sourceDayIdx] = { ...day, exercises: reordered }
      setPlan(p => ({ ...p, days: newDays }))
      // Batch save orders
      scheduleSave(async () => {
        for (const e of reordered) {
          await supabase.from('plan_exercises').update({ exercise_order: e.exercise_order }).eq('id', e.id)
        }
      })
    } else {
      // Cross-day move
      const sourceDay = { ...newDays[sourceDayIdx] }
      const targetDay = { ...newDays[targetDayIdx] }
      const exerciseIdx = sourceDay.exercises.findIndex(e => e.id === active.id)
      const [moved] = sourceDay.exercises.splice(exerciseIdx, 1)
      moved.day_id = targetDay.id

      const targetInsertIdx = targetDay.exercises.findIndex(e => e.id === over.id)
      if (targetInsertIdx === -1) targetDay.exercises.push(moved)
      else targetDay.exercises.splice(targetInsertIdx, 0, moved)

      sourceDay.exercises = sourceDay.exercises.map((e, i) => ({ ...e, exercise_order: i }))
      targetDay.exercises = targetDay.exercises.map((e, i) => ({ ...e, exercise_order: i }))

      newDays[sourceDayIdx] = sourceDay
      newDays[targetDayIdx] = targetDay
      setPlan(p => ({ ...p, days: newDays }))

      scheduleSave(async () => {
        await supabase.from('plan_exercises').update({ day_id: targetDay.id }).eq('id', moved.id)
        for (const e of [...sourceDay.exercises, ...targetDay.exercises]) {
          await supabase.from('plan_exercises').update({ exercise_order: e.exercise_order }).eq('id', e.id)
        }
      })
    }
  }

  // ── Duplicate plan ─────────────────────────────────────────────────────
  async function handleDuplicate() {
    const newToken = nanoid(21)
    const { data: newPlan } = await supabase.from('plans').insert({
      client_id: plan.client_id,
      trainer_id: plan.trainer_id,
      name: `${plan.name} (${t.planEditor.duplicate})`,
      share_token: newToken,
      weeks: plan.weeks,
    }).select().single()
    if (!newPlan) return

    for (const day of plan.days) {
      const { data: newDay } = await supabase.from('plan_days').insert({
        plan_id: newPlan.id,
        name: day.name,
        day_order: day.day_order,
      }).select().single()
      if (!newDay) continue
      for (const ex of day.exercises) {
        await supabase.from('plan_exercises').insert({
          day_id: newDay.id,
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
          exercise_order: ex.exercise_order,
        })
      }
    }

    window.location.href = `/plans/${newPlan.id}/edit`
  }

  // ── Share link ─────────────────────────────────────────────────────────
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/plan/${plan.share_token}`

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between sticky top-14 z-30">
        <div className="flex items-center gap-4">
          <Input
            value={plan.name}
            onChange={e => handlePlanNameChange(e.target.value)}
            className="text-lg font-semibold border-transparent hover:border-border focus:border-primary h-9 w-72"
          />
          <span className={`text-xs ${
            saveStatus === 'saving' ? 'text-muted-foreground' :
            saveStatus === 'saved' ? 'text-green-600' :
            saveStatus === 'error' ? 'text-destructive' : 'text-transparent'
          }`}>
            {saveStatus === 'saving' ? t.planEditor.saving :
             saveStatus === 'saved' ? t.planEditor.saved :
             saveStatus === 'error' ? t.planEditor.saveError : '.'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { navigator.clipboard.writeText(shareUrl) }}
          >
            {t.planEditor.copyLink}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            {t.planEditor.duplicate}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 items-start">
            {plan.days.map(day => (
              <DayColumn
                key={day.id}
                day={day}
                onDayNameChange={handleDayNameChange}
                onDeleteDay={handleDeleteDay}
                onExerciseChange={handleExerciseChange}
                onDeleteExercise={handleDeleteExercise}
                onAddExercise={openPicker}
              />
            ))}
            <button
              onClick={handleAddDay}
              className="min-w-[200px] h-24 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center text-sm font-medium flex-shrink-0"
            >
              {t.planEditor.addDay}
            </button>
          </div>
        </DndContext>
      </div>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => { setPickerOpen(false); setPickerDayId(null) }}
        onSelect={handleExerciseSelected}
      />
    </div>
  )
}
