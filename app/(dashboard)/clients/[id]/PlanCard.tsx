'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PlanPdfButton } from '@/components/client-view/PlanPdfButton'

type Plan = {
  id: string
  name: string
  weeks: number
  active: boolean
  share_token: string
}

export function PlanCard({ plan }: { plan: Plan }) {
  const t = useT()
  const router = useRouter()
  const [active, setActive] = useState(plan.active)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function toggleActive(e: React.MouseEvent) {
    e.stopPropagation()
    const supabase = createClient()
    const { error } = await supabase.from('plans').update({ active: !active }).eq('id', plan.id)
    if (!error) {
      setActive(v => !v)
      toast.success(!active ? t.plan.activated : t.plan.archived)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('plans').delete().eq('id', plan.id)
    if (error) {
      toast.error(t.plan.deleteErr)
      setDeleting(false)
      return
    }
    toast.success(t.plan.deleteOk)
    setConfirmOpen(false)
    router.refresh()
  }

  return (
    <>
      <Card
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => router.push(`/plans/${plan.id}/edit`)}
      >
        <CardContent className="py-4 px-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">{plan.name}</p>
            <p className="text-xs text-muted-foreground">{plan.weeks} {t.plan.weeksShort}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={active ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={toggleActive}
            >
              {active ? t.client.activePlan : t.client.archivedPlan}
            </Badge>
            <Link
              href={`/plan/${plan.share_token}`}
              target="_blank"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              onClick={e => e.stopPropagation()}
            >
              {t.client.preview}
            </Link>
            <PlanPdfButton
              planId={plan.id}
              planName={plan.name}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              PDF
            </PlanPdfButton>
            <button
              onClick={e => { e.stopPropagation(); setConfirmOpen(true) }}
              className="text-muted-foreground/40 hover:text-destructive text-sm transition-colors"
            >
              {t.plan.deleteBtn}
            </button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={v => { if (!v) setConfirmOpen(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.plan.deleteTitle}</DialogTitle>
            <DialogDescription>
              {t.plan.deleteDescription(plan.name)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>
              {t.plan.deleteCancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? t.plan.deleting : t.plan.deleteConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
