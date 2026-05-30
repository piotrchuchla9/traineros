import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/shared/AppLayout'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SettingsClient } from './SettingsClient'
import { ContactCard } from './ContactCard'
import { getServerT } from '@/lib/i18n/server'

function trialDaysLeft(endsAt: string | null): number {
  if (!endsAt) return 0
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000))
}

export default async function SettingsPage() {
  const t = await getServerT()
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trainer } = await supabase.from('trainers').select('*').eq('id', user.id).single()
  if (!trainer) redirect('/login')

  const daysLeft = trialDaysLeft(trainer.trial_ends_at)

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">{t.settings.title}</h1>

      <div className="grid gap-6 max-w-2xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t.settings.name}</CardTitle>
              <span className="text-sm font-medium">{trainer.name}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.settings.email}</span>
              <span className="font-medium">{trainer.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t.settings.currentPlan}</CardTitle>
              <Badge variant={trainer.plan === 'inactive' ? 'destructive' : 'default'}>
                {(t.settings.plans as Record<string, string>)[trainer.plan] ?? trainer.plan}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {trainer.plan === 'trial' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.settings.trialDaysLabel}</span>
                <span className="font-medium">{t.settings.trialDays(daysLeft)}</span>
              </div>
            )}
            <SettingsClient trainer={trainer} />
          </CardContent>
        </Card>

        <ContactCard />
      </div>
    </AppLayout>
  )
}
