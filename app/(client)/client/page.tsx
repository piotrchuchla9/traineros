import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getServerT } from '@/lib/i18n/server'
import { ClientDashboard } from './ClientDashboard'
import type { ProgressEntry, TrainingSession } from '@/types/database'

export default async function ClientPage() {
  const supabase = await createSupabaseServerClient()
  const t = await getServerT()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!client) redirect('/login')

  let avatarSignedUrl: string | null = null
  if (client.avatar_url) {
    const { data } = await supabase.storage.from('client-avatars').createSignedUrl(client.avatar_url, 3600)
    avatarSignedUrl = data?.signedUrl ?? null
  }

  // Active plans
  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .eq('client_id', client.id)
    .eq('active', true)
    .order('created_at', { ascending: false })

  // Progress entries with photos
  type RawEntry = { id: string; client_id: string; trainer_id: string; date: string; weight_kg: number | null; measurements: Record<string, number | null> | null; notes: string | null; created_at: string; photos: { id: string; entry_id: string; storage_path: string; photo_order: number }[] }
  const { data: rawEntries } = await (supabase as any)
    .from('progress_entries')
    .select('*, photos:progress_photos(*)')
    .eq('client_id', client.id)
    .order('date', { ascending: false }) as { data: RawEntry[] | null }

  const entries: ProgressEntry[] = await Promise.all(
    (rawEntries ?? []).map(async entry => {
      const photos = await Promise.all(
        (entry.photos ?? [])
          .sort((a: { photo_order: number }, b: { photo_order: number }) => a.photo_order - b.photo_order)
          .map(async (photo: { id: string; entry_id: string; storage_path: string; photo_order: number }) => {
            // try client bucket path first, then trainer bucket path
            const { data } = await supabase.storage
              .from('progress-photos')
              .createSignedUrl(photo.storage_path, 3600)
            return { ...photo, url: data?.signedUrl ?? '' }
          })
      )
      return { ...entry, photos }
    })
  )

  // Upcoming sessions for client
  const now2 = new Date()
  const today = `${now2.getFullYear()}-${String(now2.getMonth()+1).padStart(2,'0')}-${String(now2.getDate()).padStart(2,'0')}`
  const { data: upcomingSessions } = await (supabase as any)
    .from('training_sessions')
    .select('*, location:trainer_locations(id,name)')
    .eq('client_id', client.id)
    .gte('date', today)
    .order('date').order('time')
    .limit(5) as { data: TrainingSession[] | null }

  return (
    <ClientDashboard
      client={client}
      avatarSignedUrl={avatarSignedUrl}
      plans={plans ?? []}
      entries={entries}
      trainerId={client.trainer_id}
      upcomingSessions={upcomingSessions ?? []}
    />
  )
}
