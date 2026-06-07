'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/context'
import type { WorkoutLog } from '@/types/database'

interface Props {
  logs: WorkoutLog[]
}

export function WorkoutLogsSection({ logs }: Props) {
  const t = useT()
  const router = useRouter()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function confirmDelete() {
    if (!pendingDeleteId) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('workout_logs').delete().eq('id', pendingDeleteId)
    setDeleting(false)
    setPendingDeleteId(null)
    if (error) {
      toast.error(t.progress.toastDeleteErr)
      return
    }
    toast.success(t.progress.toastDeleteOk)
    router.refresh()
  }

  if (logs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground text-sm">{t.progress.noLogs}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {logs.map(log => (
          <Card key={log.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">
                      {new Date(log.date).toLocaleDateString(t.schedule.locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {log.plan_name && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {log.plan_name}
                      </span>
                    )}
                    {log.day_name && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {log.day_name}
                      </span>
                    )}
                  </div>

                  {log.exercises.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {log.exercises.map(ex => (
                        <div key={ex.id} className="text-sm flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="text-foreground font-medium">{ex.exercise_name}</span>
                          {ex.planned_sets && ex.planned_reps && (
                            <span className="text-muted-foreground text-xs">plan: {ex.planned_sets}×{ex.planned_reps}</span>
                          )}
                          {(ex.actual_weight || ex.actual_reps) && (
                            <span className="text-foreground text-xs">
                              {[ex.actual_weight, ex.actual_reps].filter(Boolean).join(' · ')}
                            </span>
                          )}
                          {ex.notes && (
                            <span className="text-muted-foreground text-xs italic">{ex.notes}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {log.notes && (
                    <p className="text-sm text-muted-foreground">{log.notes}</p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => setPendingDeleteId(log.id)}
                >
                  {t.progress.deleteLog}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!pendingDeleteId} onOpenChange={v => !v && setPendingDeleteId(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t.progress.deleteLog}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t.progress.deleteConfirm}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDeleteId(null)}>
              {t.progress.deleteCancel}
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={confirmDelete}>
              {deleting ? '...' : t.progress.deleteLog}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
