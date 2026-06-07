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
import { ProgressSection } from '@/components/progress/ProgressSection'
import { ClientAccountSection } from './ClientAccountSection'
import { ClientSessionsList } from './ClientSessionsList'
import { cn } from '@/lib/utils'
import { getServerT } from '@/lib/i18n/server'
import type { ProgressEntry, TrainerLocation, TrainingSession, WorkoutLog } from '@/types/database'

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

  // Avatar signed URL
  let avatarSignedUrl: string | null = null
  if (client.avatar_url) {
    const { data: avatarData } = await supabase.storage
      .from('client-avatars')
      .createSignedUrl(client.avatar_url, 3600)
    avatarSignedUrl = avatarData?.signedUrl ?? null
  }

  // Progress entries with photos
  type RawEntry = { id: string; client_id: string; trainer_id: string; date: string; weight_kg: number | null; measurements: Record<string, number | null> | null; notes: string | null; created_at: string; photos: { id: string; entry_id: string; storage_path: string; photo_order: number }[] }
  const { data: rawEntries } = await (supabase as any)
    .from('progress_entries')
    .select('*, photos:progress_photos(*)')
    .eq('client_id', id)
    .order('date', { ascending: false }) as { data: RawEntry[] | null }

  const entries: ProgressEntry[] = await Promise.all(
    (rawEntries ?? []).map(async entry => {
      const photos = await Promise.all(
        (entry.photos ?? [])
          .sort((a, b) => a.photo_order - b.photo_order)
          .map(async photo => {
            const { data } = await supabase.storage
              .from('progress-photos')
              .createSignedUrl(photo.storage_path, 3600)
            return { ...photo, url: data?.signedUrl ?? '' }
          })
      )
      return { ...entry, photos }
    })
  )

  // Workout logs with exercises
  type RawLog = { id: string; client_id: string; trainer_id: string; plan_id: string | null; plan_name: string | null; day_name: string | null; date: string; notes: string | null; created_at: string; exercises: { id: string; log_id: string; exercise_name: string; planned_sets: number | null; planned_reps: string | null; actual_weight: string | null; actual_reps: string | null; notes: string | null; exercise_order: number }[] }
  const { data: rawLogs } = await (supabase as any)
    .from('workout_logs')
    .select('*, exercises:workout_log_exercises(*)')
    .eq('client_id', id)
    .order('date', { ascending: false }) as { data: RawLog[] | null }

  const logs: WorkoutLog[] = (rawLogs ?? []).map(log => ({
    ...log,
    exercises: (log.exercises ?? []).sort((a, b) => a.exercise_order - b.exercise_order),
  }))

  const [{ data: sessions }, { data: locations }] = await Promise.all([
    (supabase as any)
      .from('training_sessions')
      .select('*, client:clients(id,name), location:trainer_locations(id,name)')
      .eq('client_id', id)
      .eq('trainer_id', user.id)
      .order('date', { ascending: false })
      .order('time', { ascending: false }) as { data: TrainingSession[] | null },
    (supabase as any).from('trainer_locations').select('*').eq('trainer_id', user.id).order('name') as { data: TrainerLocation[] | null },
  ])

  return (
    <AppLayout>
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">{t.client.back}</Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {avatarSignedUrl ? (
            <img src={avatarSignedUrl} alt={client.name} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg tracking-wide">
              {client.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
            {client.goal && <p className="text-muted-foreground">{client.goal}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/clients/${id}/plans/new`} className={cn(buttonVariants())}>
            {t.client.newPlan}
          </Link>
          <EditClientSheet client={{ ...client, avatarSignedUrl }} />
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
            <PlanCard key={plan.id} plan={plan} clientPhone={client.phone} clientId={id} />
          ))}
        </div>
      )}

      {/* Sessions */}
      <div className="mt-10">
        <ClientSessionsList
          initialSessions={sessions ?? []}
          client={client}
          locations={locations ?? []}
          trainerId={user.id}
        />
      </div>

      {/* Client account */}
      <div className="mt-10">
        <ClientAccountSection
          clientId={id}
          email={client.email}
          hasAccount={!!client.auth_user_id}
        />
      </div>

      {/* Progress */}
      <div className="mt-10">
        <ProgressSection
          entries={entries}
          logs={logs}
          plans={plans ?? []}
          clientId={id}
          trainerId={user.id}
        />
      </div>
    </AppLayout>
  )
}
