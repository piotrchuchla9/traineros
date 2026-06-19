import Link from 'next/link'
import { redirect } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppLayout } from '@/components/shared/AppLayout'
import { SubscriptionBanner } from '@/components/shared/SubscriptionBanner'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { getServerT } from '@/lib/i18n/server'
import { isRestricted } from '@/lib/access'

const CLIENT_LIMITS: Record<string, number> = { trial: 999, basic: 15, pro: 999, inactive: 0 }

export default async function DashboardPage() {
  const t = await getServerT()
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const tom = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const tomorrowStr = `${tom.getFullYear()}-${pad(tom.getMonth() + 1)}-${pad(tom.getDate())}`
  const limitStr = tomorrowStr

  const [{ data: trainer }, { data: clients }, { data: upcoming }] = await Promise.all([
    supabase.from('trainers').select('*').eq('id', user.id).single(),
    supabase.from('clients').select('*, plans(id)').eq('trainer_id', user.id).order('created_at', { ascending: false }),
    (supabase as any)
      .from('training_sessions')
      .select('id, client_id, date, time, duration_minutes, paid, location_name, client:clients(id,name), location:trainer_locations(id,name)')
      .eq('trainer_id', user.id)
      .gte('date', todayStr)
      .lte('date', limitStr)
      .order('date').order('time')
      .limit(30),
  ])

  if (!trainer) redirect('/login')

  // Generate signed URLs for client avatars
  const allClients = await Promise.all(
    (clients ?? []).map(async (client: any) => {
      if (!client.avatar_url) return { ...client, avatarSignedUrl: null }
      const { data } = await supabase.storage
        .from('client-avatars')
        .createSignedUrl(client.avatar_url, 3600)
      return { ...client, avatarSignedUrl: data?.signedUrl ?? null }
    })
  )
  const activeCount = allClients.filter((c: any) => c.active).length
  const limit = CLIENT_LIMITS[trainer.plan] ?? 0
  const restricted = isRestricted(trainer)
  const canAddClient = !restricted && activeCount < limit

  // Group upcoming sessions by date
  const upcomingList: any[] = upcoming ?? []
  const byDate = upcomingList.reduce<Record<string, any[]>>((acc, s) => {
    ;(acc[s.date] ??= []).push(s)
    return acc
  }, {})
  const dates = Object.keys(byDate).sort()

  function dateLabel(dateStr: string) {
    if (dateStr === todayStr) return t.schedule.today
    if (dateStr === tomorrowStr) return t.dashboard.tomorrow
    return new Date(dateStr + 'T12:00:00').toLocaleDateString(t.schedule.locale, { weekday: 'short', day: 'numeric', month: 'short' })
  }

  // Next session per client (for client card)
  const nextSessionMap: Record<string, { date: string; time: string | null }> = {}
  for (const s of upcomingList) {
    if (!nextSessionMap[s.client_id]) nextSessionMap[s.client_id] = { date: s.date, time: s.time }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t.dashboard.pageTitle}</h1>
        {canAddClient ? (
          <Link href="/clients/new" className={cn(buttonVariants())}>
            {t.dashboard.addClient}
          </Link>
        ) : (
          <span className={cn(buttonVariants(), 'pointer-events-none opacity-50')}>
            {t.dashboard.addClient}
          </span>
        )}
      </div>

      <SubscriptionBanner trainer={trainer} clientsCount={activeCount} clientsLimit={limit} />

      {/* Upcoming sessions panel */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">{t.dashboard.upcomingSessions}</h2>
          <Link href="/schedule" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t.dashboard.viewSchedule}
          </Link>
        </div>
        <Card>
          <CardContent className="py-4 px-5">
            {dates.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.dashboard.noUpcomingSessions}</p>
            ) : (
              <div className="space-y-4">
                {dates.map(dateStr => (
                  <div key={dateStr}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      {dateLabel(dateStr)}
                    </p>
                    <div className="space-y-1.5">
                      {byDate[dateStr].map((s: any) => {
                        const clientName = s.client?.name ?? ''
                        const locName = s.location?.name ?? s.location_name ?? ''
                        const isOnline = locName === 'Online'
                        return (
                          <div key={s.id} className="flex items-center gap-3 text-sm">
                            <span className="w-10 text-muted-foreground font-mono text-xs shrink-0">
                              {s.time ? s.time.slice(0, 5) : '–:––'}
                            </span>
                            <span className="font-medium text-foreground flex-1 truncate">{clientName}</span>
                            <span className="text-xs text-muted-foreground shrink-0">{s.duration_minutes} min</span>
                            {locName && (
                              <span className={`text-xs shrink-0 px-1.5 py-0.5 rounded-full ${isOnline ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300' : 'text-muted-foreground'}`}>
                                {locName}
                              </span>
                            )}
                            <span className={`text-xs shrink-0 ${s.paid ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                              {s.paid ? '✓' : '✗'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Clients list */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground">{t.dashboard.title}</h2>
        <p className="text-sm text-muted-foreground">{t.dashboard.active(activeCount)}</p>
      </div>

      {allClients.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">{t.dashboard.noClients}</p>
            <Link href="/clients/new" className={cn(buttonVariants())}>
              {t.dashboard.addClient}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {allClients.map((client: any) => (
            <Link key={client.id} href={`/clients/${client.id}`} className="block">
              <Card className="hover:bg-accent/50 hover:ring-foreground/30 transition-all cursor-pointer">
                <CardContent className="py-4 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {client.avatarSignedUrl ? (
                      <img src={client.avatarSignedUrl} alt={client.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{client.name}</p>
                      {client.goal && <p className="text-xs text-muted-foreground">{client.goal}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {nextSessionMap[client.id] ? (
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {t.dashboard.nextSession}: {new Date(nextSessionMap[client.id].date + 'T12:00:00').toLocaleDateString(t.schedule.locale, { weekday: 'short', day: 'numeric', month: 'short' })}
                        {nextSessionMap[client.id].time && ` ${t.schedule.at} ${nextSessionMap[client.id].time!.slice(0, 5)}`}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground hidden sm:block">
                        {t.dashboard.plans(client.plans?.length ?? 0)}
                      </span>
                    )}
                    <Badge variant={client.active ? 'default' : 'secondary'}>
                      {client.active ? t.client.activePlan : t.client.archivedPlan}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
