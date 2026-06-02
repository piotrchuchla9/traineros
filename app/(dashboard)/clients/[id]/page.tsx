import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

import { AppLayout } from '@/components/shared/AppLayout'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { DeleteClientButton } from './DeleteClientButton'
import { EditClientSheet } from './EditClientSheet'
import { PlanCard } from './PlanCard'
import { cn } from '@/lib/utils'
import { getServerT } from '@/lib/i18n/server'

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getServerT()
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('trainer_id', user.id)
    .single()

  if (!client) notFound()

  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false })

  return (
    <AppLayout>
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">{t.client.back}</Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-xl">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
            {client.goal && <p className="text-muted-foreground">{client.goal}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/clients/${id}/plans/new`} className={cn(buttonVariants())}>
            {t.client.newPlan}
          </Link>
          <EditClientSheet client={client} />
          <DeleteClientButton clientId={id} clientName={client.name} />
        </div>
      </div>

      {/* Info */}
      <Card className="mb-6">
        <CardContent className="py-4 grid grid-cols-2 gap-4 text-sm">
          {client.email && (
            <div>
              <span className="text-muted-foreground block">{t.client.email}</span>
              <span className="font-medium">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div>
              <span className="text-muted-foreground block">{t.client.phone}</span>
              <span className="font-medium">{client.phone}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground block">{t.client.status}</span>
            <Badge variant={client.active ? 'default' : 'secondary'}>
              {client.active ? t.client.active : t.client.inactive}
            </Badge>
          </div>
          {client.notes && (
            <div className="col-span-2">
              <span className="text-muted-foreground block">{t.client.notes}</span>
              <span className="font-medium">{client.notes}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <h2 className="text-lg font-semibold text-foreground mb-4">{t.client.plans}</h2>
      {(!plans || plans.length === 0) ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-4">{t.client.noPlans(client.name)}</p>
            <Link href={`/clients/${id}/plans/new`} className={cn(buttonVariants())}>
              {t.client.createPlan}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} clientPhone={client.phone} />
          ))}
        </div>
      )}
    </AppLayout>
  )
}
