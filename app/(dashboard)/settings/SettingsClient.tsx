'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Trainer } from '@/types/database'
import { useT, useLang } from '@/lib/i18n/context'

export function SettingsClient({ trainer }: { trainer: Trainer }) {
  const [loading, setLoading] = useState<'basic' | 'pro' | 'portal' | null>(null)
  const t = useT()
  const { locale } = useLang()

  async function checkout(plan: 'basic' | 'pro') {
    setLoading(plan)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, locale }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(null)
  }

  async function openPortal() {
    setLoading('portal')
    const res = await fetch('/api/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(null)
  }

  function formatDate(iso: string | null) {
    if (!iso) return null
    return new Date(iso).toLocaleDateString(locale === 'pl' ? 'pl-PL' : 'en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  const endsDate = formatDate(trainer.subscription_ends_at)

  const invoicesButton = trainer.stripe_customer_id ? (
    <Button onClick={openPortal} disabled={loading === 'portal'} variant="ghost" size="sm" className="self-start text-muted-foreground">
      {loading === 'portal' ? t.settings.manageBtnLoading : `↗ ${t.settings.invoicesBtn}`}
    </Button>
  ) : null

  if (trainer.plan === 'basic' || trainer.plan === 'pro') {
    return (
      <div className="flex flex-col gap-3 pt-2">
        {endsDate && (
          <p className="text-sm text-muted-foreground">
            {trainer.cancel_at_period_end
              ? t.settings.expiresOn(endsDate)
              : t.settings.renewsOn(endsDate)}
          </p>
        )}
        <Button onClick={openPortal} disabled={loading === 'portal'} variant="outline">
          {loading === 'portal' ? t.settings.manageBtnLoading : t.settings.manageBtn}
        </Button>
        {invoicesButton}
      </div>
    )
  }

  if (trainer.plan === 'inactive') {
    return (
      <div className="flex flex-col gap-3 pt-2">
        {endsDate && (
          <p className="text-sm text-muted-foreground">
            {t.settings.expiresOn(endsDate)}
          </p>
        )}
        <p className="text-sm text-muted-foreground">{t.settings.expired}</p>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => checkout('basic')} disabled={loading !== null}>
            {t.settings.basicBtn(loading === 'basic')}
          </Button>
          <Button onClick={() => checkout('pro')} disabled={loading !== null} variant="outline">
            {t.settings.proBtn(loading === 'pro')}
          </Button>
        </div>
        {invoicesButton}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <p className="text-sm text-muted-foreground">{t.settings.upgradePrompt}</p>
      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => checkout('basic')} disabled={loading !== null}>
          {t.settings.basicBtn(loading === 'basic')}
        </Button>
        <Button onClick={() => checkout('pro')} disabled={loading !== null} variant="outline">
          {t.settings.proBtn(loading === 'pro')}
        </Button>
      </div>
      {invoicesButton}
    </div>
  )
}
