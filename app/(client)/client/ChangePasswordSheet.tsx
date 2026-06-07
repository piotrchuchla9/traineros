'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/context'

export function ChangePasswordSheet() {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setPassword('')
    setConfirm('')
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError(t.clientPortal.passwordTooShort); return }
    if (password !== confirm) { setError(t.clientPortal.passwordMismatch); return }
    setSaving(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (err) { setError(err.message); return }
    toast.success(t.clientPortal.passwordChanged)
    setOpen(false)
    reset()
  }

  return (
    <Sheet open={open} onOpenChange={v => { setOpen(v); if (!v) reset() }}>
      <SheetTrigger render={<Button variant="ghost" size="sm" className="shrink-0 px-2 sm:px-3" />}>
        <span className="hidden sm:inline">{t.clientPortal.changePassword}</span>
        <span className="sm:hidden" title={t.clientPortal.changePassword}>🔑</span>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t.clientPortal.changePasswordTitle}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 px-4 pb-4">
          <div className="space-y-1">
            <Label>{t.clientPortal.newPassword}</Label>
            <Input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder={t.clientPortal.newPasswordPlaceholder}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1">
            <Label>{t.clientPortal.confirmPassword}</Label>
            <Input
              type="password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError('') }}
              placeholder={t.clientPortal.confirmPasswordPlaceholder}
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? t.clientPortal.savingPassword : t.clientPortal.savePassword}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.clientPortal.cancel}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
