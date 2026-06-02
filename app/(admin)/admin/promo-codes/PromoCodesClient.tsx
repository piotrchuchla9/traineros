'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type PromoCode = {
  id: string
  code: string
  trial_days: number
  uses: number
  max_uses: number
  active: boolean
  description: string | null
  created_at: string
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function PromoCodesClient({ codes }: { codes: PromoCode[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ code: '', trial_days: '90', max_uses: '100', description: '' })
  const [creating, setCreating] = useState(false)
  const [deactivating, setDeactivating] = useState<string | null>(null)
  const [activating, setActivating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCreating(true)
    const res = await fetch('/api/admin/promo-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code.trim().toUpperCase(),
        trial_days: parseInt(form.trial_days),
        max_uses: parseInt(form.max_uses),
        description: form.description.trim() || undefined,
      }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) {
      setError(data.error ?? 'Błąd tworzenia kodu')
      return
    }
    setForm({ code: '', trial_days: '90', max_uses: '100', description: '' })
    router.refresh()
  }

  async function handleToggleActive(id: string, active: boolean) {
    if (active) setDeactivating(id)
    else setActivating(id)
    await fetch(`/api/admin/promo-codes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    setDeactivating(null)
    setActivating(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Nowy kod promo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Kod</label>
              <input
                type="text"
                placeholder="np. LAUNCH50"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                required
                className="border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring w-40 font-mono"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Dni trialu</label>
              <input
                type="number"
                min={1}
                max={365}
                value={form.trial_days}
                onChange={e => setForm(f => ({ ...f, trial_days: e.target.value }))}
                required
                className="border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring w-24"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Maks. użyć</label>
              <input
                type="number"
                min={1}
                value={form.max_uses}
                onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                required
                className="border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring w-24"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-48">
              <label className="text-xs text-muted-foreground">Opis (opcjonalny)</label>
              <textarea
                placeholder="np. Kod dla uczestników webinaru"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? 'Tworzę…' : 'Utwórz kod'}
            </Button>
          </form>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* Codes table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Kody ({codes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Kod</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Opis</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Dni trialu</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Użycia</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Utworzony</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {codes.map(c => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-foreground">{c.code}</td>
                    <td className="px-6 py-4 text-muted-foreground max-w-xs">
                      {c.description
                        ? <span className="whitespace-pre-wrap text-xs">{c.description}</span>
                        : <span className="text-muted-foreground/40 text-xs italic">—</span>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{c.trial_days} dni</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {c.uses} / {c.max_uses}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={c.active ? 'default' : 'secondary'}>
                        {c.active ? 'Aktywny' : 'Nieaktywny'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{fmtDate(c.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deactivating === c.id || activating === c.id}
                        onClick={() => handleToggleActive(c.id, c.active)}
                        className={c.active ? 'text-muted-foreground hover:text-destructive' : 'text-muted-foreground hover:text-green-500'}
                      >
                        {c.active
                          ? (deactivating === c.id ? '…' : 'Dezaktywuj')
                          : (activating === c.id ? '…' : 'Aktywuj')}
                      </Button>
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Brak kodów — utwórz pierwszy powyżej
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
