import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Resend } from 'resend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message } = await req.json()
  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    return NextResponse.json({ error: 'Message too short' }, { status: 400 })
  }

  const { error } = await resend.emails.send({
    from: 'noreply@traineros.live',
    to: 'contact@traineros.live',
    subject: `Wiadomość od użytkownika: ${user.email}`,
    text: `Od: ${user.email}\n\n${message.trim()}`,
  })

  if (error) {
    console.error('[contact] resend error:', error)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
