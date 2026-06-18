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
import { CopyPlanDialog } from '@/components/plan/CopyPlanDialog'

type Plan = {
  id: string
  name: string
  weeks: number
  active: boolean
  share_token: string
}

export function PlanCard({ plan, clientPhone, clientId, restricted = false }: { plan: Plan; clientPhone?: string | null; clientId: string; restricted?: boolean }) {
  const t = useT()
  const router = useRouter()
  const [active, setActive] = useState(plan.active)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [copyOpen, setCopyOpen] = useState(false)
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
        className={`hover:shadow-md transition-shadow ${!restricted ? 'cursor-pointer' : ''}`}
        onClick={() => !restricted && router.push(`/plans/${plan.id}/edit`)}
      >
        <CardContent className="py-4 px-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">{plan.name}</p>
            <p className="text-xs text-muted-foreground">{plan.weeks} {t.plan.weeksShort}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={active ? 'default' : 'secondary'}
              className={!restricted ? 'cursor-pointer' : ''}
              onClick={!restricted ? toggleActive : undefined}
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
            <Button
              variant="outline"
              size="sm"
              onClick={e => {
                e.stopPropagation()
                navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}/plan/${plan.share_token}`)
                toast.success(t.planEditor.copyLink)
              }}
            >
              {t.planEditor.copyLink}
            </Button>
            <PlanPdfButton
              planId={plan.id}
              planName={plan.name}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              PDF
            </PlanPdfButton>
            {clientPhone && (
              <a
                href={`https://wa.me/${clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`${t.plan.whatsappMsg(plan.name)}${process.env.NEXT_PUBLIC_BASE_URL}/plan/${plan.share_token}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-900 dark:hover:bg-green-950')}
              >
                {t.plan.whatsapp}
              </a>
            )}
            {!restricted && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => { e.stopPropagation(); setCopyOpen(true) }}
                >
                  {t.plan.copyTo}
                </Button>
                <button
                  onClick={e => { e.stopPropagation(); setConfirmOpen(true) }}
                  className="cursor-pointer text-muted-foreground/40 hover:text-destructive text-sm transition-colors"
                >
                  {t.plan.deleteBtn}
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <CopyPlanDialog open={copyOpen} onClose={() => setCopyOpen(false)} planId={plan.id} currentClientId={clientId} />

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
