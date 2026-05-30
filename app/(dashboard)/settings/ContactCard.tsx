'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useT } from '@/lib/i18n/context'

export function ContactCard() {
  const t = useT()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    if (res.ok) {
      setStatus('success')
      setMessage('')
    } else {
      setStatus('error')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.settings.contact}</CardTitle>
        <CardDescription>{t.settings.contactDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'success' ? (
          <p className="text-sm text-green-600">{t.settings.contactSuccess}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={t.settings.contactPlaceholder}
              rows={4}
              required
              minLength={5}
              disabled={status === 'loading'}
            />
            {status === 'error' && (
              <p className="text-sm text-destructive">{t.settings.contactError}</p>
            )}
            <Button type="submit" disabled={status === 'loading' || message.trim().length < 5}>
              {status === 'loading' ? t.settings.contactSending : t.settings.contactBtn}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
