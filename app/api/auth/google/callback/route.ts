import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const trainerId = searchParams.get('state')
  const base = process.env.NEXT_PUBLIC_BASE_URL!

  if (!code || !trainerId) {
    return NextResponse.redirect(`${base}/schedule?gcal=error`)
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${base}/api/auth/google/callback`
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Fetch calendar timezone so events are created in the trainer's local time
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    const { data: calData } = await calendar.calendars.get({ calendarId: 'primary' })
    const timezone = calData.timeZone ?? 'UTC'

    const supabase = createSupabaseServiceClient()
    await (supabase as any).from('trainer_google_tokens').upsert({
      trainer_id: trainerId,
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token!,
      token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      timezone,
    })

    return NextResponse.redirect(`${base}/schedule?gcal=connected`)
  } catch (err) {
    console.error('[Google OAuth callback error]', err)
    return NextResponse.redirect(`${base}/schedule?gcal=error`)
  }
}
