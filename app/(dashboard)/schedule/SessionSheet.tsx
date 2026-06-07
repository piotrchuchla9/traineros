'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/context'
import { isPast } from './utils'
import { TimeInput } from './TimeInput'
import type { Client, TrainerLocation, TrainingSession } from '@/types/database'

const OTHER = '__other__'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: (session: TrainingSession, isNew: boolean) => void
  onDeleted: (id: string) => void
  session: TrainingSession | null // null = new
  clients: Client[]
  locations: TrainerLocation[]
  onLocationAdded: (loc: TrainerLocation) => void
  trainerId: string
  defaultDate?: string
}

export function SessionSheet({ open, onClose, onSaved, onDeleted, session, clients, locations, onLocationAdded, trainerId, defaultDate }: Props) {
  const t = useT()
  const [use12h, setUse12h] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('timeFormat') === '12h' : false
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [clientId, setClientId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('60')
  const [isOnline, setIsOnline] = useState(false)
  const [locationId, setLocationId] = useState('')
  const [customLocation, setCustomLocation] = useState('')
  const [saveLocation, setSaveLocation] = useState(false)
  const [notes, setNotes] = useState('')
  const [postNotes, setPostNotes] = useState('')
  const [paid, setPaid] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!open) return
    if (session) {
      setFormError('')
      setClientId(session.client_id)
      setDate(session.date)
      setTime(session.time ? session.time.slice(0, 5) : '')
      setDuration(String(session.duration_minutes))
      const online = session.location_name === 'Online' && !session.location_id
      setIsOnline(online)
      if (online) {
        setLocationId('')
        setCustomLocation('')
      } else if (session.location_id) {
        setLocationId(session.location_id)
        setCustomLocation('')
      } else if (session.location_name) {
        setLocationId(OTHER)
        setCustomLocation(session.location_name)
      } else {
        setLocationId('')
        setCustomLocation('')
      }
      setNotes(session.notes ?? '')
      setPostNotes(session.post_notes ?? '')
      setPaid(session.paid)
    } else {
      setClientId(clients[0]?.id ?? '')
      const now = new Date(); const pad = (n: number) => String(n).padStart(2,'0')
      const localToday = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`
      setDate(defaultDate ?? localToday)
      setTime('')
      setDuration('60')
      setIsOnline(false)
      setLocationId('')
      setCustomLocation('')
      setSaveLocation(false)
      setFormError('')
      setNotes('')
      setPostNotes('')
      setPaid(false)
    }
  }, [open, session])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!clientId) { setFormError('Wybierz klienta.'); return }
    if (!date) { setFormError('Wybierz datę.'); return }
    if (!time) { setFormError('Wpisz godzinę sesji.'); return }
    if (!isOnline && !locationId && !customLocation.trim()) { setFormError('Wybierz lub wpisz lokalizację albo zaznacz Online.'); return }
    setSaving(true)
    const supabase = createClient()

    let finalLocationId: string | null = null
    let finalLocationName: string | null = isOnline ? 'Online' : null

    if (!isOnline && locationId === OTHER && customLocation.trim()) {
      finalLocationName = customLocation.trim()
      if (saveLocation) {
        const { data: newLoc } = await supabase
          .from('trainer_locations')
          .insert({ trainer_id: trainerId, name: finalLocationName })
          .select()
          .single()
        if (newLoc) {
          finalLocationId = newLoc.id
          finalLocationName = newLoc.name  // keep name for denormalization
          onLocationAdded(newLoc as TrainerLocation)
        }
      }
    }

    if (!isOnline && locationId && locationId !== OTHER) {
      finalLocationId = locationId
      // denormalize name so client portal can read it without joining trainer_locations
      finalLocationName = locations.find(l => l.id === locationId)?.name ?? null
    }

    const payload = {
      client_id: clientId,
      trainer_id: trainerId,
      date,
      time: time || null,
      duration_minutes: parseInt(duration) || 60,
      location_id: finalLocationId,
      location_name: finalLocationName,
      notes: notes.trim() || null,
      post_notes: postNotes.trim() || null,
      paid,
    }

    let result: TrainingSession | null = null
    if (session) {
      const { data } = await (supabase as any)
        .from('training_sessions')
        .update(payload)
        .eq('id', session.id)
        .select('*, client:clients(id,name), location:trainer_locations(id,name)')
        .single()
      result = data
    } else {
      const { data } = await (supabase as any)
        .from('training_sessions')
        .insert(payload)
        .select('*, client:clients(id,name), location:trainer_locations(id,name)')
        .single()
      result = data
    }

    setSaving(false)
    if (result) {
      toast.success(session ? t.schedule.toastUpdated : t.schedule.toastAdded)
      onSaved(result, !session)
      onClose()
    } else {
      toast.error(t.schedule.toastErr)
    }
  }

  async function handleDelete() {
    if (!session) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('training_sessions').delete().eq('id', session.id)
    setDeleting(false)
    setConfirmDelete(false)
    if (error) {
      toast.error(t.schedule.toastErr)
      return
    }
    toast.success(t.schedule.toastDeleted)
    onDeleted(session.id)
    onClose()
  }

  const isEditing = !!session
  const showPostNotes = isEditing && isPast(date)

  return (
    <>
      <Sheet open={open} onOpenChange={v => !v && onClose()}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEditing ? t.schedule.editSession : t.schedule.addSessionTitle}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSave} className="mt-6 space-y-4 px-4 pb-4">
            {/* Client */}
            <div className="space-y-1">
              <Label>{t.schedule.clientLabel} <span className="text-destructive">*</span></Label>
              <Select value={clientId} onValueChange={v => setClientId(v ?? '')}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue>{clients.find(c => c.id === clientId)?.name ?? t.schedule.clientLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Date + Time */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>{t.schedule.dateLabel} <span className="text-destructive">*</span></Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <Label>{t.schedule.timeLabel} <span className="text-destructive">*</span></Label>
                  <div className="flex rounded-md border border-border overflow-hidden text-xs">
                    {(['24h', '12h'] as const).map(fmt => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => { const is12 = fmt === '12h'; setUse12h(is12); localStorage.setItem('timeFormat', fmt) }}
                        className={`px-2.5 py-0.5 transition-colors ${(fmt === '12h') === use12h ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
                <TimeInput value={time} onChange={setTime} use12h={use12h} />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <Label>{t.schedule.durationLabel} <span className="text-destructive">*</span></Label>
              <Input type="number" min="15" max="300" step="15" value={duration} onChange={e => setDuration(e.target.value)} required />
            </div>

            {/* Location */}
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <Label>{t.schedule.locationLabel} <span className="text-destructive">*</span></Label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOnline}
                  onClick={() => setIsOnline(v => !v)}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${isOnline ? 'bg-primary' : 'bg-muted'}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-background shadow transition-transform ${isOnline ? 'translate-x-4' : 'translate-x-0'}`} />
                  </span>
                  {t.schedule.online}
                </button>
              </div>
              {!isOnline && (
                <>
                  <Select value={locationId} onValueChange={v => setLocationId(v ?? '')}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue>
                        {locationId === OTHER ? t.schedule.locationOther
                          : locationId ? locations.find(l => l.id === locationId)?.name
                          : t.schedule.locationSelect}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                      <SelectItem value={OTHER}>{t.schedule.locationOther}</SelectItem>
                    </SelectContent>
                  </Select>
                  {locationId === OTHER && (
                    <div className="space-y-1.5 mt-1.5">
                      <Input
                        value={customLocation}
                        onChange={e => setCustomLocation(e.target.value)}
                        placeholder={t.schedule.locationPlaceholder}
                      />
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <input type="checkbox" checked={saveLocation} onChange={e => setSaveLocation(e.target.checked)} className="rounded" />
                        {t.schedule.addLocation}
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label>{t.schedule.notesLabel}</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Plan treningu, wskazówki..." />
            </div>

            {showPostNotes && (
              <div className="space-y-1">
                <Label>{t.schedule.postNotesLabel}</Label>
                <Textarea value={postNotes} onChange={e => setPostNotes(e.target.value)} rows={2} placeholder="Jak poszło, co poprawić..." />
              </div>
            )}

            {/* Paid */}
            <label className="flex items-center gap-2.5 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={paid}
                onChange={e => setPaid(e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
              <span className="text-sm font-medium text-foreground">{t.schedule.paidLabel}</span>
            </label>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? t.schedule.saving : t.schedule.save}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" className="text-destructive" onClick={() => setConfirmDelete(true)}>
                  {t.schedule.delete}
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>{t.newClient.cancel}</Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={confirmDelete} onOpenChange={v => !v && setConfirmDelete(false)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader><DialogTitle>{t.schedule.delete}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t.schedule.deleteConfirm}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>{t.schedule.deleteCancel}</Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? '...' : t.schedule.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
