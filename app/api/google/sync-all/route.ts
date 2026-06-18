import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { createCalendarEvent, updateCalendarEvent, isGoogleConnected } from '@/lib/google-calendar'
import type { TrainingSession } from '@/types/database'

export async function POST() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const connected = await isGoogleConnected(user.id)
  if (!connected) return NextResponse.json({ ok: false, reason: 'not_connected' }, { status: 400 })

  const service = createSupabaseServiceClient()
  const { data: sessions } = await (service as any)
    .from('training_sessions')
    .select('*, client:clients(id,name)')
    .eq('trainer_id', user.id)

  if (!sessions) return NextResponse.json({ ok: false }, { status: 500 })

  let synced = 0
  for (const session of sessions as TrainingSession[]) {
    try {
      if (session.google_event_id) {
        await updateCalendarEvent(user.id, session.google_event_id, session)
      } else {
        const googleEventId = await createCalendarEvent(user.id, session)
        if (googleEventId) {
          await (service as any)
            .from('training_sessions')
            .update({ google_event_id: googleEventId })
            .eq('id', session.id)
        }
      }
      synced++
    } catch {
      // continue with remaining sessions on error
    }
  }

  return NextResponse.json({ ok: true, synced })
}
