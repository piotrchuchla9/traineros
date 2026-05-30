'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type') as 'email' | 'signup' | 'recovery' | null
    const next = searchParams.get('next') ?? '/dashboard'

    if (!tokenHash || !type) {
      router.replace('/login?error=auth')
      return
    }

    const supabase = createClient()
    supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ error }) => {
      if (error) {
        router.replace(`/login?error=auth&msg=${encodeURIComponent(error.message)}`)
        return
      }
      fetch('/api/auth/post-signup', { method: 'POST' }).finally(() => {
        router.replace(next)
      })
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground text-sm">Logging in...</div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  )
}
