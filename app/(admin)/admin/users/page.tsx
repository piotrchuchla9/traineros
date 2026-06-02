import { requireAdmin, getAdminSupabase } from '@/lib/admin'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PLAN_BADGE: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  trial: 'secondary',
  basic: 'default',
  pro: 'default',
  inactive: 'destructive',
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminUsersPage() {
  await requireAdmin()
  const admin = getAdminSupabase()

  const { data: trainers } = await admin
    .from('trainers')
    .select('*, clients(count)')
    .order('created_at', { ascending: false })

  const rows = (trainers ?? []) as Array<{
    id: string
    email: string
    name: string
    plan: string
    trial_ends_at: string | null
    subscription_ends_at: string | null
    stripe_customer_id: string | null
    created_at: string
    clients: { count: number }[]
  }>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Użytkownicy</h1>
          <p className="text-sm text-muted-foreground mt-1">{rows.length} trenerów łącznie</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Wszyscy trenerzy</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Trener</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Trial / Sub kończy się</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Klienci</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Stripe</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Rejestracja</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(t => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={PLAN_BADGE[t.plan] ?? 'secondary'}>
                        {t.plan}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {t.plan === 'trial'
                        ? fmtDate(t.trial_ends_at)
                        : fmtDate(t.subscription_ends_at)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {t.clients?.[0]?.count ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      {t.stripe_customer_id
                        ? <span className="text-xs text-muted-foreground font-mono">{t.stripe_customer_id.slice(0, 14)}…</span>
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {fmtDate(t.created_at)}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Brak użytkowników
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
