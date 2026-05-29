'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useT } from '@/lib/i18n/context'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { LangSwitcher } from '@/components/shared/LangSwitcher'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const t = useT()
  const rp = t.auth.resetPassword
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError(rp.mismatch); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) {
      setError(err.code === 'same_password' ? rp.samePassword : rp.error)
      setLoading(false)
      return
    }
    toast.success(rp.success)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-1"><LangSwitcher /><ThemeSwitcher /></div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold text-foreground mb-1 hover:opacity-70 transition-opacity">{t.auth.appName}</Link>
          <CardTitle className="text-lg">{rp.title}</CardTitle>
          <CardDescription>{rp.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="password">{rp.newPassword}</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 znaków" required minLength={6} autoComplete="new-password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm">{rp.confirmPassword}</Label>
              <Input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Powtórz hasło" required minLength={6} autoComplete="new-password" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? rp.submitting : rp.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
