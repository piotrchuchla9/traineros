import { google } from 'googleapis'
import { createSupabaseServiceClient } from './supabase/service'
import type { TrainingSession } from '@/types/database'

function makeOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
  )
}

async function getAuthClient(trainerId: string) {
  const supabase = createSupabaseServiceClient()
  const { data } = await (supabase as any)
    .from('trainer_google_tokens')
    .select('access_token, refresh_token, token_expiry, timezone')
    .eq('trainer_id', trainerId)
    .maybeSingle()

  if (!data?.refresh_token) return null

  const client = makeOAuth2Client()
  client.setCredentials({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: data.token_expiry ? new Date(data.token_expiry).getTime() : undefined,
  })

  client.on('tokens', async tokens => {
    await (supabase as any).from('trainer_google_tokens').update({
      ...(tokens.access_token && { access_token: tokens.access_token }),
      ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
      ...(tokens.expiry_date && { token_expiry: new Date(tokens.expiry_date).toISOString() }),
    }).eq('trainer_id', trainerId)
  })

  return { client, timezone: (data.timezone as string) ?? 'UTC' }
}

function sessionToEvent(session: TrainingSession, timezone: string) {
  const clientName = (session.client as any)?.name ?? 'Client'
  const timeStr = session.time ? session.time.slice(0, 5) : null

  if (!timeStr) {
    return {
      summary: clientName,
      location: session.location_name ?? '',
      description: session.notes ?? '',
      start: { date: session.date },
      end: { date: session.date },
    }
  }

  const startDT = `${session.date}T${timeStr}:00`
  const endMs = new Date(`${startDT}Z`).getTime() + session.duration_minutes * 60_000
  const end = new Date(endMs)
  const pad = (n: number) => String(n).padStart(2, '0')
  const endDT = `${end.getUTCFullYear()}-${pad(end.getUTCMonth() + 1)}-${pad(end.getUTCDate())}T${pad(end.getUTCHours())}:${pad(end.getUTCMinutes())}:00`

  return {
    summary: clientName,
    location: session.location_name ?? '',
    description: session.notes ?? '',
    start: { dateTime: startDT, timeZone: timezone },
    end: { dateTime: endDT, timeZone: timezone },
  }
}

export async function createCalendarEvent(trainerId: string, session: TrainingSession): Promise<string | null> {
  const auth = await getAuthClient(trainerId)
  if (!auth) return null
  const calendar = google.calendar({ version: 'v3', auth: auth.client })
  const { data } = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: sessionToEvent(session, auth.timezone),
  })
  return data.id ?? null
}

export async function updateCalendarEvent(trainerId: string, googleEventId: string, session: TrainingSession): Promise<void> {
  const auth = await getAuthClient(trainerId)
  if (!auth) return
  const calendar = google.calendar({ version: 'v3', auth: auth.client })
  await calendar.events.update({
    calendarId: 'primary',
    eventId: googleEventId,
    requestBody: sessionToEvent(session, auth.timezone),
  })
}

export async function deleteCalendarEvent(trainerId: string, googleEventId: string): Promise<void> {
  const auth = await getAuthClient(trainerId)
  if (!auth) return
  const calendar = google.calendar({ version: 'v3', auth: auth.client })
  await calendar.events.delete({ calendarId: 'primary', eventId: googleEventId })
}

export async function isGoogleConnected(trainerId: string): Promise<boolean> {
  const supabase = createSupabaseServiceClient()
  const { data } = await (supabase as any)
    .from('trainer_google_tokens')
    .select('trainer_id')
    .eq('trainer_id', trainerId)
    .maybeSingle()
  return !!data
}
