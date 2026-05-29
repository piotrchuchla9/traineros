'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/context'

export default function NewPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const t = useT()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [weeks, setWeeks] = useState(4)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    const { id: clientId } = await params
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const shareToken = nanoid(21)

    const { data, error: err } = await supabase.from('plans').insert({
      client_id: clientId,
      trainer_id: user.id,
      name: name.trim(),
      share_token: shareToken,
      weeks,
    }).select().single()

    if (err || !data) {
      toast.error(err?.message ?? t.newPlan.toastErr)
      setLoading(false)
      return
    }

    toast.success(t.newPlan.toastOk)
    router.push(`/plans/${data.id}/edit`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <Link href="/dashboard" className="text-lg font-bold text-foreground">TrainerOS</Link>
      </header>
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">{t.newPlan.back}</Link>
          <h1 className="text-2xl font-bold text-foreground mt-2">{t.newPlan.title}</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.newPlan.cardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">{t.newPlan.name}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t.newPlan.namePlaceholder}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="weeks">{t.newPlan.weeks}</Label>
                <Input
                  id="weeks"
                  type="number"
                  min={1}
                  max={52}
                  value={weeks}
                  onChange={e => setWeeks(Number(e.target.value))}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? t.newPlan.submitting : t.newPlan.submit}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
