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

const CLIENT_LIMITS: Record<string, number> = { trial: 999, basic: 15, pro: 999, inactive: 0 }

export default async function DashboardPage() {
  const t = await getServerT()
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trainer } = await supabase.from('trainers').select('*').eq('id', user.id).single()
  const { data: clients } = await supabase
    .from('clients')
    .select('*, plans(id)')
    .eq('trainer_id', user.id)
    .order('created_at', { ascending: false })

  if (!trainer) redirect('/login')

  const allClients = clients ?? []
  const activeCount = allClients.filter(c => c.active).length
  const limit = CLIENT_LIMITS[trainer.plan] ?? 0
  const canAddClient = activeCount < limit

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.dashboard.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.dashboard.active(activeCount)}</p>
        </div>
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
          {allClients.map(client => (
            <Link key={client.id} href={`/clients/${client.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-primary font-semibold text-sm">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{client.name}</p>
                      {client.goal && <p className="text-xs text-muted-foreground">{client.goal}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {t.dashboard.plans((client as any).plans?.length ?? 0)}
                    </span>
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
