'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/context'
import type { Plan, PlanDayWithExercises } from '@/types/database'

interface ExerciseInput {
  planExerciseId: string
  exerciseName: string
  plannedSets: number
  plannedReps: string
  actualWeight: string
  actualReps: string
  notes: string
}

interface Props {
  clientId: string
  trainerId: string
  plans: Plan[]
}

export function AddWorkoutLogSheet({ clientId, trainerId, plans }: Props) {
  const t = useT()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [selectedDayId, setSelectedDayId] = useState<string>('')
  const [days, setDays] = useState<PlanDayWithExercises[]>([])
  const [loadingDays, setLoadingDays] = useState(false)
  const [exerciseInputs, setExerciseInputs] = useState<ExerciseInput[]>([])
  const [generalNotes, setGeneralNotes] = useState('')

  useEffect(() => {
    if (!selectedPlanId) {
      setDays([])
      setSelectedDayId('')
      setExerciseInputs([])
      return
    }

    async function fetchDays() {
      setLoadingDays(true)
      const supabase = createClient()
      const { data: planDays } = await supabase
        .from('plan_days')
        .select('*')
        .eq('plan_id', selectedPlanId)
        .order('day_order')

      const daysWithEx: PlanDayWithExercises[] = []
      for (const day of planDays ?? []) {
        const { data: exercises } = await supabase
          .from('plan_exercises')
          .select('*, exercise:exercises(*)')
          .eq('day_id', day.id)
          .order('exercise_order')
        daysWithEx.push({ ...day, exercises: (exercises ?? []) as any })
      }

      setDays(daysWithEx)
      setSelectedDayId('')
      setExerciseInputs([])
      setLoadingDays(false)
    }

    fetchDays()
  }, [selectedPlanId])

  useEffect(() => {
    if (!selectedDayId) {
      setExerciseInputs([])
      return
    }
    const day = days.find(d => d.id === selectedDayId)
    if (!day) return
    setExerciseInputs(
      day.exercises.map(ex => ({
        planExerciseId: ex.id,
        exerciseName: ex.exercise.name,
        plannedSets: ex.sets,
        plannedReps: ex.reps,
        actualWeight: '',
        actualReps: '',
        notes: '',
      }))
    )
  }, [selectedDayId, days])

  function updateExercise(i: number, field: keyof ExerciseInput, value: string) {
    setExerciseInputs(prev => prev.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex))
  }

  function reset() {
    setDate(new Date().toISOString().split('T')[0])
    setSelectedPlanId('')
    setSelectedDayId('')
    setDays([])
    setExerciseInputs([])
    setGeneralNotes('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()

    const selectedPlan = plans.find(p => p.id === selectedPlanId)
    const selectedDay = days.find(d => d.id === selectedDayId)

    const { data: log, error: logErr } = await supabase
      .from('workout_logs')
      .insert({
        client_id: clientId,
        trainer_id: trainerId,
        plan_id: selectedPlanId || null,
        plan_name: selectedPlan?.name ?? null,
        day_name: selectedDay?.name ?? null,
        date,
        notes: generalNotes.trim() || null,
      })
      .select()
      .single()

    if (logErr || !log) {
      setSaving(false)
      toast.error(t.progress.toastLogErr)
      return
    }

    if (exerciseInputs.length > 0) {
      await supabase.from('workout_log_exercises').insert(
        exerciseInputs.map((ex, i) => ({
          log_id: log.id,
          exercise_name: ex.exerciseName,
          planned_sets: ex.plannedSets,
          planned_reps: ex.plannedReps,
          actual_weight: ex.actualWeight.trim() || null,
          actual_reps: ex.actualReps.trim() || null,
          notes: ex.notes.trim() || null,
          exercise_order: i,
        }))
      )
    }

    setSaving(false)
    toast.success(t.progress.toastLogOk)
    setOpen(false)
    reset()
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={v => { setOpen(v); if (!v) reset() }}>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        {t.progress.addLog}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t.progress.addLogTitle}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 px-4 pb-4">
          <div className="space-y-1">
            <Label>{t.progress.entryDate}</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          {plans.length > 0 && (
            <>
              <div className="space-y-1">
                <Label>{t.progress.selectPlan}</Label>
                <Select value={selectedPlanId} onValueChange={v => setSelectedPlanId(v ?? '')}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue>{selectedPlanId ? plans.find(p => p.id === selectedPlanId)?.name : t.progress.noPlan}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {plans.filter(p => p.active).map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlanId && (
                <div className="space-y-1">
                  <Label>{t.progress.dayLabel}</Label>
                  {loadingDays ? (
                    <div className="h-9 bg-muted animate-pulse rounded-lg" />
                  ) : (
                    <Select value={selectedDayId} onValueChange={v => setSelectedDayId(v ?? '')}>
                      <SelectTrigger className="w-full h-9">
                        <SelectValue>{selectedDayId ? days.find(d => d.id === selectedDayId)?.name : t.progress.selectDay}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {days.map(day => (
                          <SelectItem key={day.id} value={day.id}>{day.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </>
          )}

          {exerciseInputs.length > 0 && (
            <div className="space-y-3">
              <Label>{t.progress.exercisesLabel}</Label>
              {exerciseInputs.map((ex, i) => (
                <div key={ex.planExerciseId} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{ex.exerciseName}</span>
                    <span className="text-xs text-muted-foreground">{t.progress.plannedLabel}: {ex.plannedSets}×{ex.plannedReps}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">{t.progress.actualWeight}</Label>
                      <Input
                        value={ex.actualWeight}
                        onChange={e => updateExercise(i, 'actualWeight', e.target.value)}
                        placeholder={t.progress.actualWeightPlaceholder}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.progress.actualReps}</Label>
                      <Input
                        value={ex.actualReps}
                        onChange={e => updateExercise(i, 'actualReps', e.target.value)}
                        placeholder={t.progress.actualRepsPlaceholder}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <Input
                    value={ex.notes}
                    onChange={e => updateExercise(i, 'notes', e.target.value)}
                    placeholder={t.progress.notesPlaceholder}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1">
            <Label>{t.progress.notesLabel}</Label>
            <Textarea
              value={generalNotes}
              onChange={e => setGeneralNotes(e.target.value)}
              placeholder={t.progress.notesPlaceholder}
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? t.progress.saving : t.progress.save}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.newClient.cancel}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
