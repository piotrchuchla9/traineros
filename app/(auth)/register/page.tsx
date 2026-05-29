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
import { toast } from 'sonner'

export default function RegisterPage() {
  const t = useT()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t.auth.register.passwordMismatch)
      return
    }

    setLoading(true)
    const code = promoCode.trim()

    if (code) {
      const check = await fetch(`/api/promo?code=${encodeURIComponent(code)}`)
      const { valid } = await check.json()
      if (!valid) {
        setError(t.auth.register.promoInvalid)
        setLoading(false)
        return
      }
    }

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, promo_code: code || null },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <LangSwitcher />
          <ThemeSwitcher />
        </div>
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="text-4xl mb-2">✉️</div>
            <CardTitle className="text-lg">{t.auth.register.checkEmailTitle}</CardTitle>
            <CardDescription>{t.auth.register.checkEmailDesc(email)}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t.auth.register.checkEmailHint}</p>
          </CardContent>
        </Card>
      </div>
    )
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
          <CardTitle className="text-lg">{t.auth.register.title}</CardTitle>
          <CardDescription>{t.auth.register.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">{t.auth.register.name}</Label>
              <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder={t.auth.register.namePlaceholder} required autoComplete="name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder={t.auth.register.emailPlaceholder} required autoComplete="email" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">{t.auth.register.password}</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder={t.auth.register.passwordPlaceholder} required minLength={6} autoComplete="new-password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm">{t.auth.register.confirmPassword}</Label>
              <Input id="confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder={t.auth.register.confirmPasswordPlaceholder} required minLength={6} autoComplete="new-password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="promo">{t.auth.register.promoCode}</Label>
              <Input id="promo" type="text" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                placeholder={t.auth.register.promoPlaceholder} autoComplete="off" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.auth.register.submitting : t.auth.register.submit}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t.auth.register.hasAccount}{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t.auth.register.login}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
