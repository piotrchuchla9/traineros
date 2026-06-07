'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/context'
import type { ProgressEntry } from '@/types/database'
import { BodyMeasurementsViz } from './BodyMeasurementsViz'
import { PhotoComparison } from './PhotoComparison'

interface Props {
  entries: ProgressEntry[]
  readOnly?: boolean
}

export function ProgressTimeline({ entries, readOnly = false }: Props) {
  const t = useT()
  const router = useRouter()
  const [pendingDelete, setPendingDelete] = useState<ProgressEntry | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [compareEntries, setCompareEntries] = useState<[ProgressEntry, ProgressEntry] | null>(null)

  function toggleSelect(id: string) {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 2) return prev
      const next = [...prev, id]
      if (next.length === 2) {
        const sorted = next.map(sid => entries.find(e => e.id === sid)!).sort((a, b) => a.date.localeCompare(b.date))
        setCompareEntries([sorted[0], sorted[1]])
      }
      return next
    })
  }

  function exitCompare() {
    setCompareMode(false)
    setSelected([])
    setCompareEntries(null)
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    const supabase = createClient()

    for (const photo of pendingDelete.photos) {
      await supabase.storage.from('progress-photos').remove([photo.storage_path])
    }
    const { error } = await supabase.from('progress_entries').delete().eq('id', pendingDelete.id)

    setDeleting(false)
    setPendingDelete(null)
    if (error) {
      toast.error(t.progress.toastDeleteErr)
      return
    }
    toast.success(t.progress.toastDeleteOk)
    router.refresh()
  }

  if (entries.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground text-sm">{t.progress.noEntries}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {entries.length >= 2 && (
        <div className="flex items-center gap-2 mb-3">
          {compareMode ? (
            <>
              <span className="text-xs text-muted-foreground">{t.progress.selectTwo} ({selected.length}/2)</span>
              <Button variant="ghost" size="sm" onClick={exitCompare}>{t.progress.cancelCompare}</Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setCompareMode(true)}>{t.progress.compare}</Button>
          )}
        </div>
      )}
      <div className="space-y-3">
        {entries.map(entry => (
          <Card
            key={entry.id}
            className={compareMode ? `cursor-pointer transition-all ${selected.includes(entry.id) ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'}` : ''}
            onClick={compareMode ? () => toggleSelect(entry.id) : undefined}
          >
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-foreground text-sm">
                      {new Date(entry.date + 'T12:00:00').toLocaleDateString(t.schedule.locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {entry.weight_kg && (
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {entry.weight_kg} {t.progress.kg}
                      </span>
                    )}
                  </div>
                  {entry.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {entry.photos.map(photo => (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => setLightbox(photo.url ?? '')}
                          className="focus:outline-none focus:ring-2 focus:ring-ring rounded"
                        >
                          <img
                            src={photo.url}
                            alt=""
                            className="w-16 h-16 object-cover rounded border border-border hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  {entry.measurements && (
                    <BodyMeasurementsViz measurements={entry.measurements} />
                  )}
                {entry.notes && (
                    <p className="text-sm text-muted-foreground">{entry.notes}</p>
                  )}
                </div>
                {!compareMode && !readOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => setPendingDelete(entry)}
                >
                  {t.progress.deleteEntry}
                </Button>
              )}
              {compareMode && selected.includes(entry.id) && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PhotoComparison entries={compareEntries} onClose={() => { setCompareEntries(null); setSelected([]) }} />

      <Dialog open={!!pendingDelete} onOpenChange={v => !v && setPendingDelete(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t.progress.deleteEntry}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t.progress.deleteConfirm}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              {t.progress.deleteCancel}
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={confirmDelete}>
              {deleting ? '...' : t.progress.deleteEntry}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            aria-label="Zamknij"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-full object-contain rounded"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
