'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/context'

interface Props {
  clientId: string
  email: string | null
  hasAccount: boolean
}

export function ClientAccountSection({ clientId, email, hasAccount: initialHasAccount }: Props) {
  const t = useT()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [hasAccount, setHasAccount] = useState(initialHasAccount)
  const [password, setPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCreate() {
    setLoading(true)
    const res = await fetch('/api/client/create-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    })
    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      if (json.error === 'already_exists') toast.error(t.clientAccount.alreadyExists)
      else if (json.error === 'email_taken') toast.error('Ten email jest już zarejestrowany w systemie.')
      else toast.error(`${t.clientAccount.toastCreateErr}: ${json.error ?? ''}`)
      return
    }

    setHasAccount(true)
    setPassword(json.password)
    toast.success(t.clientAccount.toastCreateOk)
    router.refresh()
  }

  async function handleReset() {
    setLoading(true)
    const res = await fetch('/api/client/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    })
    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      toast.error(t.clientAccount.toastResetErr)
      return
    }

    setPassword(json.password)
    toast.success(t.clientAccount.toastResetOk)
  }

  async function copyPassword() {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <h2 className="text-lg font-semibold text-foreground mb-4">{t.clientAccount.section}</h2>
      <Card>
        <CardContent className="py-4">
          {!email ? (
            <p className="text-sm text-muted-foreground">{t.clientAccount.noEmail}</p>
          ) : hasAccount ? (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">{t.clientAccount.active}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">{t.clientAccount.loginAs}:</span> {email}
                </p>
              </div>
              <Button variant="outline" size="sm" disabled={loading} onClick={handleReset}>
                {loading ? t.clientAccount.resetting : t.clientAccount.resetPassword}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-muted-foreground">{t.clientAccount.noAccount}</p>
              <Button size="sm" disabled={loading} onClick={handleCreate}>
                {loading ? t.clientAccount.creating : t.clientAccount.create}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password dialog */}
      <Dialog open={!!password} onOpenChange={v => !v && setPassword(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t.clientAccount.passwordDialog}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">{t.clientAccount.passwordHint}</p>
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2.5">
            <code className="flex-1 text-lg font-mono font-bold tracking-widest text-foreground select-all">
              {password}
            </code>
            <Button variant="outline" size="sm" onClick={copyPassword}>
              {copied ? t.clientAccount.copied : t.clientAccount.copyPassword}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setPassword(null)}>{t.clientAccount.close}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
