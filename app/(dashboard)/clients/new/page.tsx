'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/context'

export default function NewClientPage() {
  const router = useRouter()
  const t = useT()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', goal: '', notes: '' })

  function update(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const emailValue = form.email.trim() || null

    if (emailValue) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('trainer_id', user.id)
        .eq('email', emailValue)
        .maybeSingle()
      if (existing) {
        setError(t.newClient.duplicateEmail)
        setLoading(false)
        return
      }
    }

    const { data, error: err } = await supabase.from('clients').insert({
      trainer_id: user.id,
      name: form.name.trim(),
      email: emailValue,
      phone: form.phone.trim() || null,
      goal: form.goal.trim() || null,
      notes: form.notes.trim() || null,
    }).select().single()

    if (err || !data) {
      if (err?.code === '23505') {
        setError(t.newClient.crossTrainerEmail)
      } else {
        toast.error(err?.message ?? t.newClient.toastErr)
      }
      setLoading(false)
      return
    }

    toast.success(t.newClient.toastOk)
    router.push(`/clients/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <Link href="/dashboard" className="text-lg font-bold text-foreground">TrainerOS</Link>
      </header>
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">{t.newClient.back}</Link>
          <h1 className="text-2xl font-bold text-foreground mt-2">{t.newClient.title}</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.newClient.cardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">{t.newClient.name}</Label>
                <Input id="name" value={form.name} onChange={e => update('name', e.target.value)} placeholder={t.newClient.namePlaceholder} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">{t.newClient.email}</Label>
                <Input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder={t.newClient.emailPlaceholder} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">{t.newClient.phone}</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder={t.newClient.phonePlaceholder} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="goal">{t.newClient.goal}</Label>
                <Input id="goal" value={form.goal} onChange={e => update('goal', e.target.value)} placeholder={t.newClient.goalPlaceholder} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="notes">{t.newClient.notesLabel}</Label>
                <Textarea id="notes" value={form.notes} onChange={e => update('notes', e.target.value)} placeholder={t.newClient.notesPlaceholder} rows={3} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? t.newClient.submitting : t.newClient.submit}
                </Button>
                <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline' }))}>
                  {t.newClient.cancel}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
