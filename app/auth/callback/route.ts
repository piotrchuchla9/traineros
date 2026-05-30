import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const redirectTo = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              redirectTo.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data } = await supabase.auth.exchangeCodeForSession(code)

    const promoCode = data.user?.user_metadata?.promo_code
    if (promoCode && data.user) {
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data: promo } = await admin
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .eq('active', true)
        .single()

      if (promo && promo.uses < promo.max_uses) {
        const newEndsAt = new Date(Date.now() + promo.trial_days * 86400000).toISOString()
        await admin.from('trainers').update({ trial_ends_at: newEndsAt }).eq('id', data.user.id)
        await admin.from('promo_codes').update({ uses: promo.uses + 1 }).eq('id', promo.id)
      }
    }

    return redirectTo
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
