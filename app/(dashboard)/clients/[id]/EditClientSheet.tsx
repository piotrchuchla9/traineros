'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/context'
import { formatPhone, isValidPhone } from '@/lib/phone'

type ClientData = {
  id: string
  name: string
  email: string | null
  phone: string | null
  goal: string | null
  notes: string | null
}

export function EditClientSheet({ client }: { client: ClientData }) {
  const t = useT()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [form, setForm] = useState({
    name: client.name,
    email: client.email ?? '',
    phone: client.phone ?? '',
    goal: client.goal ?? '',
    notes: client.notes ?? '',
  })

  function update(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (form.phone && !isValidPhone(form.phone)) {
      setPhoneError(t.newClient.phoneInvalid)
      return
    }
    setPhoneError('')
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('clients')
      .update({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        goal: form.goal.trim() || null,
        notes: form.notes.trim() || null,
      })
      .eq('id', client.id)

    setSaving(false)
    if (error) {
      toast.error(t.client.editErr)
      return
    }
    toast.success(t.client.editOk)
    setOpen(false)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">{t.client.editBtn}</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t.client.editTitle}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSave} className="mt-6 space-y-4 px-4 pb-4">
          <div className="space-y-1">
            <Label htmlFor="edit-name">{t.newClient.name}</Label>
            <Input id="edit-name" value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-email">{t.newClient.email}</Label>
            <Input id="edit-email" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-phone">{t.newClient.phone}</Label>
            <Input id="edit-phone" type="tel" value={form.phone} onChange={e => { update('phone', formatPhone(e.target.value)); setPhoneError('') }} placeholder={t.newClient.phonePlaceholder} />
            {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-goal">{t.newClient.goal}</Label>
            <Input id="edit-goal" value={form.goal} onChange={e => update('goal', e.target.value)} placeholder={t.newClient.goalPlaceholder} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-notes">{t.newClient.notesLabel}</Label>
            <Textarea id="edit-notes" value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} placeholder={t.newClient.notesPlaceholder} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? t.client.editSaving : t.client.editSave}
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
