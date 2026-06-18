'use client'

import Link from 'next/link'
import type { Trainer } from '@/types/database'
import { useT } from '@/lib/i18n/context'

function daysUntil(dateStr: string | null): number {
  if (!dateStr) return 0
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function SubscriptionBanner({
  trainer,
  clientsCount,
  clientsLimit,
}: {
  trainer: Trainer
  clientsCount: number
  clientsLimit: number
}) {
  const t = useT()
  const trialDays = daysUntil(trainer.trial_ends_at)

  if (trainer.plan === 'inactive') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between mb-6">
        <p className="text-sm text-red-800 font-medium">
          {t.banner.inactive} {t.banner.readOnly}
        </p>
        <Link href="/settings" className="text-sm font-semibold text-red-900 underline shrink-0 ml-4">
          {t.banner.inactiveLink}
        </Link>
      </div>
    )
  }

  if (trainer.plan === 'trial') {
    if (trialDays === 0) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between mb-6">
          <p className="text-sm text-red-800 font-medium">
            {t.banner.trialExpired} {t.banner.readOnly}
          </p>
          <Link href="/settings" className="text-sm font-semibold text-red-900 underline shrink-0 ml-4">
            {t.banner.trialExpiredLink}
          </Link>
        </div>
      )
    }
    if (trialDays <= 3) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex items-center justify-between mb-6">
          <p className="text-sm text-yellow-800 font-medium">
            {t.banner.trialEnding(trialDays)}
          </p>
          <Link href="/settings" className="text-sm font-semibold text-yellow-900 underline">
            {t.banner.trialEndingLink}
          </Link>
        </div>
      )
    }
  }

  if (trainer.plan === 'basic' && clientsCount >= clientsLimit) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex items-center justify-between mb-6">
        <p className="text-sm text-yellow-800 font-medium">
          {t.banner.limitReached(clientsCount, clientsLimit)}
        </p>
        <Link href="/settings" className="text-sm font-semibold text-yellow-900 underline">
          {t.banner.limitLink}
        </Link>
      </div>
    )
  }

  return null
}
