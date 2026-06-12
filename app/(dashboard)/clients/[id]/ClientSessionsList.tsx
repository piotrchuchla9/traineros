'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useT } from '@/lib/i18n/context'
import { SessionSheet } from '@/app/(dashboard)/schedule/SessionSheet'
import { formatTimeDisplay } from '@/app/(dashboard)/schedule/TimeInput'
import { toDateStr } from '@/app/(dashboard)/schedule/utils'
import type { Client, TrainerLocation, TrainingSession } from '@/types/database'

const ALL = '__all__'
const PAID_KEY = '__paid__'
const UNPAID_KEY = '__unpaid__'

interface Props {
  initialSessions: TrainingSession[]
  client: Client
  locations: TrainerLocation[]
  trainerId: string
}

export function ClientSessionsList({ initialSessions, client, locations: initialLocations, trainerId }: Props) {
  const t = useT()
  const [sessions, setSessions] = useState<TrainingSession[]>(initialSessions)
  const [locations, setLocations] = useState<TrainerLocation[]>(initialLocations)
  const [subTab, setSubTab] = useState<'upcoming' | 'past'>('upcoming')
  const [filterPaid, setFilterPaid] = useState(ALL)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editSession, setEditSession] = useState<TrainingSession | null>(null)
  const [use12h] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('timeFormat') === '12h' : false
  )

  function handleSaved(session: TrainingSession, isNew: boolean) {
    setSessions(prev => isNew ? [...prev, session] : prev.map(s => s.id === session.id ? session : s))
  }

  function handleDeleted(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  async function handlePaidToggle(id: string, paid: boolean) {
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('training_sessions')
      .update({ paid })
      .eq('id', id)
      .select('*, client:clients(id,name), location:trainer_locations(id,name)')
      .single()
    if (data) setSessions(prev => prev.map(s => s.id === id ? data : s))
  }

  const today = toDateStr(new Date())

  const filtered = sessions
    .filter(s => subTab === 'upcoming' ? s.date >= today : s.date < today)
    .filter(s => filterPaid === ALL || (filterPaid === PAID_KEY ? s.paid : !s.paid))
    .sort((a, b) => {
      const cmp = `${a.date}${a.time ?? ''}`.localeCompare(`${b.date}${b.time ?? ''}`)
      return subTab === 'upcoming' ? cmp : -cmp
    })

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">{t.client.sessions}</h2>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex gap-1">
          {(['upcoming', 'past'] as const).map(v => (
            <button key={v} onClick={() => setSubTab(v)}
              className={`cursor-pointer px-3 py-1.5 text-sm rounded-lg transition-colors ${subTab === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {v === 'upcoming' ? t.schedule.upcoming : t.schedule.past}
            </button>
          ))}
        </div>

        <Select value={filterPaid} onValueChange={v => setFilterPaid(v ?? ALL)}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue>
              {filterPaid === ALL ? t.schedule.allPayments : filterPaid === PAID_KEY ? t.schedule.filterPaid : t.schedule.filterUnpaid}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t.schedule.allPayments}</SelectItem>
            <SelectItem value={PAID_KEY}>{t.schedule.filterPaid}</SelectItem>
            <SelectItem value={UNPAID_KEY}>{t.schedule.filterUnpaid}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.client.noSessions}</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => {
            const locName = (s.location as any)?.name ?? s.location_name ?? ''
            const isOnline = locName === 'Online'
            return (
              <Card key={s.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => { setEditSession(s); setSheetOpen(true) }}>
                <CardContent className="py-3 px-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground text-sm">
                        {new Date(s.date + 'T12:00:00').toLocaleDateString(t.schedule.locale, { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      {s.time && <span>{t.schedule.at} {formatTimeDisplay(s.time, use12h)}</span>}
                      <span>·</span>
                      <span>{t.schedule.duration(s.duration_minutes)}</span>
                      {locName && (
                        <>
                          <span>·</span>
                          {isOnline ? (
                            <span className="bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 px-1.5 py-0.5 rounded-full">Online</span>
                          ) : (
                            <span>{locName}</span>
                          )}
                        </>
                      )}
                    </div>
                    {s.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{s.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handlePaidToggle(s.id, !s.paid) }}
                    className={`cursor-pointer shrink-0 text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                      s.paid
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                        : 'bg-muted text-muted-foreground hover:bg-green-50 hover:text-green-700'
                    }`}
                  >
                    {s.paid ? `✓ ${t.schedule.paidOk}` : t.schedule.unpaid}
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <SessionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
        session={editSession}
        clients={[client]}
        locations={locations}
        onLocationAdded={loc => setLocations(prev => [...prev, loc].sort((a, b) => a.name.localeCompare(b.name)))}
        trainerId={trainerId}
      />
    </div>
  )
}
