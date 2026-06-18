import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar'
import type { TrainingSession } from '@/types/database'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const { session } = await req.json() as { session: TrainingSession }
  const service = createSupabaseServiceClient()

  try {
    let googleEventId: string | null = session.google_event_id ?? null

    if (googleEventId) {
      await updateCalendarEvent(user.id, googleEventId, session)
    } else {
      googleEventId = await createCalendarEvent(user.id, session)
      if (googleEventId) {
        await (service as any)
          .from('training_sessions')
          .update({ google_event_id: googleEventId })
          .eq('id', session.id)
      }
    }

    return NextResponse.json({ ok: true, googleEventId })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const { googleEventId } = await req.json() as { googleEventId: string }

  try {
    await deleteCalendarEvent(user.id, googleEventId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
