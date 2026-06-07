'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/context'

interface Props {
  clientId: string
  trainerId: string
}

export function AddProgressEntrySheet({ clientId, trainerId }: Props) {
  const t = useT()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [weight, setWeight] = useState('')
  const [meas, setMeas] = useState({ chest: '', waist: '', hips: '', bicep: '', thigh: '', calf: '' })
  const [customMeas, setCustomMeas] = useState<{ name: string; value: string }[]>([])
  const [notes, setNotes] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setDate(new Date().toISOString().split('T')[0])
    setWeight('')
    setMeas({ chest: '', waist: '', hips: '', bicep: '', thigh: '', calf: '' })
    setCustomMeas([])
    setNotes('')
    setFiles([])
    setPreviews([])
  }

  function updateMeas(key: keyof typeof meas, val: string) {
    setMeas(prev => ({ ...prev, [key]: val }))
  }

  function addCustomMeas() {
    setCustomMeas(prev => [...prev, { name: '', value: '' }])
  }

  function updateCustomMeas(i: number, field: 'name' | 'value', val: string) {
    setCustomMeas(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m))
  }

  function removeCustomMeas(i: number) {
    setCustomMeas(prev => prev.filter((_, idx) => idx !== i))
  }

  function appendFiles(selected: FileList | null) {
    const arr = Array.from(selected ?? [])
    setFiles(prev => [...prev, ...arr])
    setPreviews(prev => [...prev, ...arr.map(f => URL.createObjectURL(f))])
  }

  function removeFile(i: number) {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()

    const { data: entry, error: entryErr } = await supabase
      .from('progress_entries')
      .insert({
        client_id: clientId,
        trainer_id: trainerId,
        date,
        weight_kg: weight ? parseFloat(weight) : null,
        measurements: (() => {
          const fixed = {
            chest: meas.chest ? parseFloat(meas.chest) : null,
            waist: meas.waist ? parseFloat(meas.waist) : null,
            hips:  meas.hips  ? parseFloat(meas.hips)  : null,
            bicep: meas.bicep ? parseFloat(meas.bicep) : null,
            thigh: meas.thigh ? parseFloat(meas.thigh) : null,
            calf:  meas.calf  ? parseFloat(meas.calf)  : null,
          }
          const custom = Object.fromEntries(
            customMeas
              .filter(c => c.name.trim() && c.value !== '')
              .map(c => [c.name.trim(), parseFloat(c.value)])
          )
          const merged = { ...fixed, ...custom }
          return Object.values(merged).some(v => v != null) ? merged : null
        })(),
        notes: notes.trim() || null,
      })
      .select()
      .single()

    if (entryErr || !entry) {
      setSaving(false)
      toast.error(t.progress.toastEntryErr)
      return
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${trainerId}/${clientId}/${entry.id}/${i}-${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('progress-photos')
        .upload(path, file)
      if (!uploadErr) {
        await supabase
          .from('progress_photos')
          .insert({ entry_id: entry.id, storage_path: path, photo_order: i })
      }
    }

    setSaving(false)
    toast.success(t.progress.toastEntryOk)
    setOpen(false)
    reset()
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={v => { setOpen(v); if (!v) reset() }}>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        {t.progress.addEntry}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t.progress.addEntryTitle}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 px-4 pb-4">
          <div className="space-y-1">
            <Label>{t.progress.entryDate}</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>{t.progress.weight}</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="500"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder={t.progress.weightPlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label>{t.progress.measurementsLabel}</Label>
            <div className="grid grid-cols-2 gap-2">
              {([
                ['chest', t.progress.meas.chest],
                ['waist', t.progress.meas.waist],
                ['hips',  t.progress.meas.hips],
                ['bicep', t.progress.meas.bicep],
                ['thigh', t.progress.meas.thigh],
                ['calf',  t.progress.meas.calf],
              ] as [keyof typeof meas, string][]).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="300"
                      value={meas[key]}
                      onChange={e => updateMeas(key, e.target.value)}
                      placeholder="—"
                      className="pr-8 h-8 text-sm"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">cm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom measurements */}
          {customMeas.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {customMeas.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={c.name}
                      onChange={e => updateCustomMeas(i, 'name', e.target.value)}
                      placeholder={t.progress.measurementName}
                      className="flex-1 h-7 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button type="button" onClick={() => removeCustomMeas(i)} className="text-muted-foreground hover:text-destructive text-sm leading-none px-1">×</button>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="500"
                      value={c.value}
                      onChange={e => updateCustomMeas(i, 'value', e.target.value)}
                      placeholder="—"
                      className="pr-8 h-8 text-sm"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">cm</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={addCustomMeas}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            {t.progress.addMeasurement}
          </button>

          <div className="space-y-2">
            <Label>{t.progress.photos}</Label>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="hidden"
              onChange={e => { appendFiles(e.target.files); e.target.value = '' }}
            />
            {previews.length === 0 ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileRef.current?.click()}
              >
                {t.progress.addPhotos}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} className="w-16 h-16 object-cover rounded border border-border" alt="" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  + Dodaj kolejne
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <Label>{t.progress.notesLabel}</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t.progress.notesPlaceholder}
              rows={3}
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
