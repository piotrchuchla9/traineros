import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const base = process.env.NEXT_PUBLIC_BASE_URL!

  // Verify CSRF nonce and extract trainerId from cookie
  const nonceCookie = req.cookies.get('gcal_oauth_nonce')?.value
  if (!code || !state || !nonceCookie) {
    return NextResponse.redirect(`${base}/schedule?gcal=error`)
  }

  const [nonce, trainerId] = nonceCookie.split(':')
  if (state !== nonce || !trainerId) {
    return NextResponse.redirect(`${base}/schedule?gcal=error`)
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${base}/api/auth/google/callback`
  )

  const res = NextResponse.redirect(`${base}/schedule?gcal=connected`)
  // Clear the nonce cookie immediately
  res.cookies.set('gcal_oauth_nonce', '', { maxAge: 0, path: '/' })

  try {
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(`${base}/schedule?gcal=error`)
    }

    oauth2Client.setCredentials(tokens)

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    const { data: calData } = await calendar.calendars.get({ calendarId: 'primary' })
    const timezone = calData.timeZone ?? 'UTC'

    const supabase = createSupabaseServiceClient()
    await (supabase as any).from('trainer_google_tokens').upsert({
      trainer_id: trainerId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      timezone,
    })

    return res
  } catch (err) {
    console.error('[Google OAuth callback error]', err)
    return NextResponse.redirect(`${base}/schedule?gcal=error`)
  }
}
