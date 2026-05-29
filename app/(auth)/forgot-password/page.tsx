'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useT } from '@/lib/i18n/context'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { LangSwitcher } from '@/components/shared/LangSwitcher'

export default function ForgotPasswordPage() {
  const t = useT()
  const fp = t.auth.forgotPassword
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-callback`,
    })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
        <div className="absolute top-4 right-4 flex items-center gap-1"><LangSwitcher /><ThemeSwitcher /></div>
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="text-4xl mb-2">✉️</div>
            <CardTitle className="text-lg">{fp.sent}</CardTitle>
            <CardDescription>{fp.sentDesc(email)}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{fp.sentHint}</p>
            <Link href="/login" className="text-sm text-primary hover:underline">{fp.backToLogin}</Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-1"><LangSwitcher /><ThemeSwitcher /></div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold text-foreground mb-1 hover:opacity-70 transition-opacity">{t.auth.appName}</Link>
          <CardTitle className="text-lg">{fp.title}</CardTitle>
          <CardDescription>{fp.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="trener@email.pl" required autoComplete="email" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? fp.submitting : fp.submit}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">{fp.backToLogin}</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
