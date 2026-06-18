'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useT } from '@/lib/i18n/context'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { LangSwitcher } from '@/components/shared/LangSwitcher'

export default function LoginPage() {
  const router = useRouter()
  const t = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(t.auth.login.error)
      setLoading(false)
      return
    }

    const uid = signInData.user?.id
    // Client check takes priority — clients may also have a spurious trainer row
    const { data: clientRow } = await supabase
      .from('clients')
      .select('id')
      .eq('auth_user_id', uid)
      .maybeSingle()

    router.push(clientRow ? '/client' : '/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <LangSwitcher />
        <ThemeSwitcher />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold text-foreground mb-1 hover:opacity-70 transition-opacity">{t.auth.appName}</Link>
          <CardTitle className="text-lg">{t.auth.login.title}</CardTitle>
          <CardDescription>{t.auth.login.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.auth.login.emailPlaceholder}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t.auth.login.password}</Label>
                <Link href="/forgot-password" tabIndex={-1} className="text-xs text-muted-foreground hover:text-foreground">
                  {t.auth.forgotPassword.link}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.auth.login.submitting : t.auth.login.submit}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t.auth.login.noAccount}{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              {t.auth.login.register}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
