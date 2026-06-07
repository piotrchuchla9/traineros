'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { LangSwitcher } from '@/components/shared/LangSwitcher'
import { ChangePasswordSheet } from './ChangePasswordSheet'
import { ProgressTimeline } from '@/components/progress/ProgressTimeline'
import { AddProgressEntrySheet } from '@/components/progress/AddProgressEntrySheet'
import { useT } from '@/lib/i18n/context'
import type { Client, Plan, ProgressEntry, TrainingSession } from '@/types/database'

interface Props {
  client: Client
  avatarSignedUrl: string | null
  plans: Plan[]
  entries: ProgressEntry[]
  trainerId: string
  upcomingSessions: TrainingSession[]
}

export function ClientDashboard({ client, avatarSignedUrl, plans, entries, trainerId, upcomingSessions }: Props) {
  const t = useT()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = client.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-foreground shrink-0">TrainerOS</span>
          <div className="flex items-center gap-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mr-1 min-w-0">
              {avatarSignedUrl ? (
                <img src={avatarSignedUrl} alt={client.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                  {initials}
                </div>
              )}
              <span className="hidden sm:inline truncate">{client.name}</span>
            </div>
            <LangSwitcher />
            <ThemeSwitcher />
            <ChangePasswordSheet />
            <Button variant="ghost" size="sm" className="shrink-0 px-2 sm:px-3" onClick={handleLogout}>{t.clientPortal.logout}</Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        {/* Upcoming sessions */}
        {upcomingSessions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">{t.schedule.myUpcoming}</h2>
            <div className="space-y-2">
              {upcomingSessions.map(s => {
                const locName = (s.location as any)?.name ?? s.location_name ?? ''
                return (
                  <Card key={s.id}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium text-foreground text-sm">
                          {new Date(s.date).toLocaleDateString(t.schedule.locale, { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                        {s.time && <span className="text-xs text-muted-foreground">{t.schedule.at} {s.time.slice(0,5)}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground mt-0.5">
                        <span>{t.schedule.duration(s.duration_minutes)}</span>
                        {locName && <><span>·</span><span>{locName}</span></>}
                      </div>
                      {s.notes && <p className="text-xs text-muted-foreground mt-1">{s.notes}</p>}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Plans */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">{t.clientPortal.myPlans}</h2>
          {plans.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">{t.clientPortal.noPlans}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {plans.map(plan => (
                <Card key={plan.id}>
                  <CardContent className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{plan.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.clientPortal.weeks(plan.weeks)}
                      </p>
                    </div>
                    <a
                      href={`/plan/${plan.share_token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline shrink-0"
                    >
                      {t.clientPortal.viewPlan} →
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Progress */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">{t.clientPortal.myProgress}</h2>
            <AddProgressEntrySheet clientId={client.id} trainerId={trainerId} />
          </div>
          <ProgressTimeline entries={entries} readOnly />
        </section>
      </main>
    </div>
  )
}
