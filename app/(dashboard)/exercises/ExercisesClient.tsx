'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Exercise, MuscleGroup } from '@/types/database'
import { MUSCLE_GROUPS } from '@/types/database'
import { useT, useLang } from '@/lib/i18n/context'
import { exName, exDesc } from '@/lib/i18n/exercise'

const ALL = 'all'

export function ExercisesClient({ exercises: initial, trainerId, restricted = false }: { exercises: Exercise[]; trainerId: string; restricted?: boolean }) {
  const t = useT()
  const { locale } = useLang()
  const [exercises, setExercises] = useState(initial)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(ALL)
  const [myOnly, setMyOnly] = useState(false)
  const [open, setOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({ name: '', muscle_group: 'chest' as MuscleGroup, youtube_url: '', description: '' })
  const [saving, setSaving] = useState(false)

  const filtered = exercises.filter(e => {
    const displayName = exName(e, locale).toLowerCase()
    const matchSearch = displayName.includes(search.toLowerCase())
    const matchMuscle = filter === ALL || e.muscle_group === filter
    const matchOwner = !myOnly || e.trainer_id === trainerId
    return matchSearch && matchMuscle && matchOwner
  })

  async function handleAdd(ev: React.FormEvent) {
    ev.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('exercises').insert({
      trainer_id: trainerId,
      name: form.name.trim(),
      muscle_group: form.muscle_group,
      youtube_url: form.youtube_url.trim() || null,
      description: form.description.trim() || null,
    }).select().single()
    if (data) {
      setExercises(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setOpen(false)
      setForm({ name: '', muscle_group: 'chest', youtube_url: '', description: '' })
      toast.success(t.exercises.toastAdded)
    } else {
      toast.error(t.exercises.toastAddErr)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('exercises').delete().eq('id', deleteTarget.id)
    setExercises(prev => prev.filter(e => e.id !== deleteTarget.id))
    toast.success(t.exercises.toastDeleted)
    setDeleteTarget(null)
    setDeleting(false)
  }

  function muscleLabel(mg: string) {
    return t.muscle[mg as keyof typeof t.muscle] ?? mg
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder={t.exercises.search}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <button
          type="button"
          role="switch"
          aria-checked={myOnly}
          onClick={() => setMyOnly(v => !v)}
          className="cursor-pointer flex items-center gap-2 text-sm text-foreground select-none"
        >
          <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${myOnly ? 'bg-primary' : 'bg-muted'}`}>
            <span className={`inline-block h-4 w-4 rounded-full bg-background shadow transition-transform ${myOnly ? 'translate-x-4' : 'translate-x-0'}`} />
          </span>
          {t.exercises.myOnly}
        </button>
        {!restricted && <Button onClick={() => setOpen(true)}>{t.exercises.add}</Button>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge
          variant={filter === ALL ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter(ALL)}
        >
          {t.exercises.all} ({exercises.length})
        </Badge>
        {MUSCLE_GROUPS.map(g => {
          const count = exercises.filter(e => e.muscle_group === g.value).length
          return (
            <Badge
              key={g.value}
              variant={filter === g.value ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilter(g.value)}
            >
              {t.muscle[g.value as keyof typeof t.muscle] ?? g.value} ({count})
            </Badge>
          )
        })}
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">{t.exercises.noResults}</p>
            )}
            {filtered.map(ex => (
              <div key={ex.id} className="flex items-center justify-between px-4 py-3 hover:bg-accent">
                <div>
                  <p className="font-medium text-foreground text-sm">{exName(ex, locale)}</p>
                  {exDesc(ex, locale) && <p className="text-xs text-muted-foreground mt-0.5">{exDesc(ex, locale)}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{muscleLabel(ex.muscle_group)}</Badge>
                  {ex.youtube_url && (
                    <a href={ex.youtube_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      {t.exercises.video}
                    </a>
                  )}
                  {ex.trainer_id === trainerId && !restricted && (
                    <button onClick={() => setDeleteTarget(ex)} className="cursor-pointer text-muted-foreground/40 hover:text-destructive text-sm transition-colors">
                      {t.exercises.deleteBtn}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.exercises.deleteDialog.title}</DialogTitle>
            <DialogDescription>
              {t.exercises.deleteDialog.description(deleteTarget?.name ?? '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              {t.exercises.deleteDialog.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? t.exercises.deleteDialog.deleting : t.exercises.deleteDialog.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.exercises.addDialog.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1">
              <Label>{t.exercises.addDialog.name}</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder={t.exercises.addDialog.namePlaceholder} />
            </div>
            <div className="space-y-1">
              <Label>{t.exercises.addDialog.muscle}</Label>
              <Select
                value={form.muscle_group}
                onValueChange={v => setForm(p => ({ ...p, muscle_group: v as MuscleGroup }))}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue>
                    {t.muscle[form.muscle_group as keyof typeof t.muscle]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {MUSCLE_GROUPS.map(g => (
                    <SelectItem key={g.value} value={g.value}>{t.muscle[g.value as keyof typeof t.muscle] ?? g.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t.exercises.addDialog.youtube}</Label>
              <Input value={form.youtube_url} onChange={e => setForm(p => ({ ...p, youtube_url: e.target.value }))} placeholder={t.exercises.addDialog.youtubePlaceholder} />
            </div>
            <div className="space-y-1">
              <Label>{t.exercises.addDialog.description}</Label>
              <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder={t.exercises.addDialog.descriptionPlaceholder} />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? t.exercises.addDialog.submitting : t.exercises.addDialog.submit}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
