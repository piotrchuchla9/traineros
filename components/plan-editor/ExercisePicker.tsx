'use client'

import { useState, useEffect, useCallback } from 'react'
import { useT, useLang } from '@/lib/i18n/context'
import { exName } from '@/lib/i18n/exercise'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import type { Exercise, MuscleGroup } from '@/types/database'
import { MUSCLE_GROUPS } from '@/types/database'

const ALL_FILTER = 'all'

export function ExercisePicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (exercise: Exercise) => void
}) {
  const t = useT()
  const { locale } = useLang()
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState<string>(ALL_FILTER)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExercise, setNewExercise] = useState({ name: '', muscle_group: 'chest' as MuscleGroup, youtube_url: '', description: '' })

  const fetchExercises = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase.from('exercises').select('*').order('name')
    if (search.length >= 2) {
      query = locale === 'en'
        ? query.or(`name.ilike.%${search}%,name_en.ilike.%${search}%`)
        : query.ilike('name', `%${search}%`)
    }
    if (muscleFilter !== ALL_FILTER) query = query.eq('muscle_group', muscleFilter)
    const { data } = await query
    setExercises(data ?? [])
    setLoading(false)
  }, [search, muscleFilter])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(fetchExercises, search.length >= 2 || search.length === 0 ? 300 : 99999)
    return () => clearTimeout(timer)
  }, [search, muscleFilter, open, fetchExercises])

  useEffect(() => {
    if (open) {
      setSearch('')
      setMuscleFilter(ALL_FILTER)
      setShowAddForm(false)
      fetchExercises()
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddCustom(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('exercises').insert({
      trainer_id: user.id,
      name: newExercise.name.trim(),
      muscle_group: newExercise.muscle_group,
      youtube_url: newExercise.youtube_url.trim() || null,
      description: newExercise.description.trim() || null,
    }).select().single()
    if (data) {
      onSelect(data)
      onClose()
    }
  }

  const muscleLabel = (mg: string) =>
    (t.muscle as Record<string, string>)[mg] ?? mg

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t.planEditor.picker.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 flex-1 overflow-hidden">
          <Input
            placeholder={t.planEditor.picker.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />

          {/* Muscle filters */}
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant={muscleFilter === ALL_FILTER ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setMuscleFilter(ALL_FILTER)}
            >
              {t.planEditor.picker.all}
            </Badge>
            {MUSCLE_GROUPS.map(g => (
              <Badge
                key={g.value}
                variant={muscleFilter === g.value ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setMuscleFilter(g.value)}
              >
                {muscleLabel(g.value)}
              </Badge>
            ))}
          </div>

          {/* Results */}
          <div className="overflow-y-auto flex-1 space-y-1">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t.planEditor.picker.loading}</p>
            ) : exercises.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t.planEditor.picker.noResults}</p>
            ) : (
              exercises.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => { onSelect(ex); onClose() }}
                  className="w-full text-left px-3 py-2.5 rounded-md hover:bg-accent transition-colors flex items-center justify-between group"
                >
                  <span className="font-medium text-foreground text-sm">{exName(ex, locale)}</span>
                  <Badge variant="secondary" className="text-xs">{muscleLabel(ex.muscle_group)}</Badge>
                </button>
              ))
            )}
          </div>

          {/* Add custom */}
          {!showAddForm ? (
            <Button variant="outline" size="sm" className="self-start" onClick={() => setShowAddForm(true)}>
              {t.planEditor.picker.addCustom}
            </Button>
          ) : (
            <form onSubmit={handleAddCustom} className="border rounded-lg p-3 space-y-2 bg-muted/50">
              <p className="text-sm font-medium text-foreground">{t.planEditor.picker.title}</p>
              <Input
                placeholder={t.planEditor.picker.namePlaceholder}
                value={newExercise.name}
                onChange={e => setNewExercise(p => ({ ...p, name: e.target.value }))}
                required
              />
              <select
                className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background text-foreground"
                value={newExercise.muscle_group}
                onChange={e => setNewExercise(p => ({ ...p, muscle_group: e.target.value as MuscleGroup }))}
              >
                {MUSCLE_GROUPS.map(g => (
                  <option key={g.value} value={g.value}>{muscleLabel(g.value)}</option>
                ))}
              </select>
              <Input
                placeholder={t.exercises.addDialog.youtubePlaceholder}
                value={newExercise.youtube_url}
                onChange={e => setNewExercise(p => ({ ...p, youtube_url: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm">{t.planEditor.picker.saveCustom}</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>{t.planEditor.picker.cancelCustom}</Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
