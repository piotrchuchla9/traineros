'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/context'

interface Props {
  open: boolean
  onClose: () => void
  planId: string
  currentClientId: string
}

interface ClientOption { id: string; name: string }

export function CopyPlanDialog({ open, onClose, planId, currentClientId }: Props) {
  const t = useT()
  const router = useRouter()
  const [clients, setClients] = useState<ClientOption[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelectedId('')
    setFetching(true)
    const supabase = createClient()
    supabase
      .from('clients')
      .select('id, name')
      .eq('active', true)
      .neq('id', currentClientId)
      .order('name')
      .then(({ data }) => {
        setClients(data ?? [])
        setFetching(false)
      })
  }, [open, currentClientId])

  async function handleCopy() {
    if (!selectedId) return
    setLoading(true)
    const res = await fetch('/api/plan/copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, targetClientId: selectedId }),
    })
    setLoading(false)
    if (!res.ok) {
      toast.error(t.plan.copyToErr)
      return
    }
    const { newPlanId } = await res.json()
    toast.success(t.plan.copyToOk)
    onClose()
    router.push(`/clients/${selectedId}`)
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t.plan.copyToTitle}</DialogTitle>
        </DialogHeader>

        {fetching ? (
          <div className="h-9 bg-muted animate-pulse rounded-lg" />
        ) : clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.plan.copyToNoClients}</p>
        ) : (
          <Select value={selectedId} onValueChange={v => setSelectedId(v ?? '')}>
            <SelectTrigger className="w-full h-9">
              <SelectValue>
                {selectedId ? clients.find(c => c.id === selectedId)?.name : t.plan.copyToSelect}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {clients.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t.newClient.cancel}</Button>
          <Button disabled={!selectedId || loading} onClick={handleCopy}>
            {loading ? t.plan.copyToLoading : t.plan.copyToConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
