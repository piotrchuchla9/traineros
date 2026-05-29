'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/context'

export function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const t = useT()

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('clients').delete().eq('id', clientId)
    if (error) {
      toast.error(t.client.deleteBtn.toastErr)
      setLoading(false)
      return
    }
    toast.success(t.client.deleteBtn.toastOk)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-background px-2.5 text-sm font-medium text-red-600 hover:bg-red-50 h-8 whitespace-nowrap transition-all">
        {t.client.deleteBtn.trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.client.deleteBtn.title}</DialogTitle>
          <DialogDescription>
            {t.client.deleteBtn.description(clientName)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            {t.client.deleteBtn.cancel}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? t.client.deleteBtn.deleting : t.client.deleteBtn.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
