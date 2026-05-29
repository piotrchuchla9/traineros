import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/shared/AppLayout'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ExercisesClient } from './ExercisesClient'
import { getServerT } from '@/lib/i18n/server'

export default async function ExercisesPage() {
  const t = await getServerT()
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('name')

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t.exercises.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.exercises.subtitle}
        </p>
      </div>
      <ExercisesClient exercises={exercises ?? []} trainerId={user.id} />
    </AppLayout>
  )
}
