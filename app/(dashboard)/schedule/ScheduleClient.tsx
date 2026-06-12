'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useT } from '@/lib/i18n/context'
import { CalendarView } from './CalendarView'
import { SessionSheet } from './SessionSheet'
import { clientColor, getCalendarDays, toDateStr } from './utils'
import { formatTimeDisplay } from './TimeInput'
import type { Client, TrainerLocation, TrainingSession } from '@/types/database'

const ALL = '__all__'
const ONLINE_KEY = '__online__'

// Extracted outside ScheduleClient to keep stable reference across renders
interface CardProps {
  session: TrainingSession
  use12h: boolean
  locale: string
  atLabel: string
  durationFn: (n: number) => string
  paidOkLabel: string
  unpaidLabel: string
  onClick: () => void
  onPaidToggle: (id: string, paid: boolean) => void
}

function SessionCard({ session, use12h, locale, atLabel, durationFn, paidOkLabel, unpaidLabel, onClick, onPaidToggle }: CardProps) {
  const clientName = (session.client as any)?.name ?? ''
  const locName = (session.location as any)?.name ?? session.location_name ?? ''
  const isOnline = locName === 'Online'
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="py-3 px-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${clientColor(session.client_id)}`}>
              {clientName}
            </span>
            {isOnline && (
              <span className="text-xs bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 px-2 py-0.5 rounded-full font-medium">
                Online
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {new Date(session.date + 'T12:00:00').toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            {session.time && <span>{atLabel} {formatTimeDisplay(session.time, use12h)}</span>}
            <span>·</span>
            <span>{durationFn(session.duration_minutes)}</span>
            {locName && !isOnline && <><span>·</span><span>{locName}</span></>}
          </div>
          {session.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{session.notes}</p>}
        </div>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onPaidToggle(session.id, !session.paid) }}
          className={`cursor-pointer shrink-0 text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
            session.paid
              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
              : 'bg-muted text-muted-foreground hover:bg-green-50 hover:text-green-700'
          }`}
        >
          {session.paid ? `✓ ${paidOkLabel}` : unpaidLabel}
        </button>
      </CardContent>
    </Card>
  )
}

const PAID_KEY = '__paid__'
const UNPAID_KEY = '__unpaid__'

interface FiltersProps {
  filterClient: string
  filterLocation: string
  filterPaid: string
  clients: Client[]
  locations: TrainerLocation[]
  allClientsLabel: string
  allLocationsLabel: string
  allPaymentsLabel: string
  paidLabel: string
  unpaidLabel: string
  clearLabel: string
  onClientChange: (v: string) => void
  onLocationChange: (v: string) => void
  onPaidChange: (v: string) => void
  onClear: () => void
}

function SessionFilters({ filterClient, filterLocation, filterPaid, clients, locations, allClientsLabel, allLocationsLabel, allPaymentsLabel, paidLabel, unpaidLabel, clearLabel, onClientChange, onLocationChange, onPaidChange, onClear }: FiltersProps) {
  const hasFilter = filterClient !== ALL || filterLocation !== ALL || filterPaid !== ALL
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filterClient} onValueChange={v => onClientChange(v ?? ALL)}>
        <SelectTrigger className="h-8 w-40">
          <SelectValue>{filterClient === ALL ? allClientsLabel : clients.find(c => c.id === filterClient)?.name}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allClientsLabel}</SelectItem>
          {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filterLocation} onValueChange={v => onLocationChange(v ?? ALL)}>
        <SelectTrigger className="h-8 w-44">
          <SelectValue>
            {filterLocation === ALL ? allLocationsLabel : filterLocation === ONLINE_KEY ? 'Online' : locations.find(l => l.id === filterLocation)?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLocationsLabel}</SelectItem>
          <SelectItem value={ONLINE_KEY}>Online</SelectItem>
          {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filterPaid} onValueChange={v => onPaidChange(v ?? ALL)}>
        <SelectTrigger className="h-8 w-36">
          <SelectValue>
            {filterPaid === ALL ? allPaymentsLabel : filterPaid === PAID_KEY ? paidLabel : unpaidLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allPaymentsLabel}</SelectItem>
          <SelectItem value={PAID_KEY}>{paidLabel}</SelectItem>
          <SelectItem value={UNPAID_KEY}>{unpaidLabel}</SelectItem>
        </SelectContent>
      </Select>
      {hasFilter && (
        <button type="button" onClick={onClear} className="cursor-pointer text-xs text-muted-foreground hover:text-foreground underline">
          {clearLabel}
        </button>
      )}
    </div>
  )
}

interface Props {
  initialSessions: TrainingSession[]
  initialAllSessions: TrainingSession[]
  clients: Client[]
  locations: TrainerLocation[]
  trainerId: string
  initialYear: number
  initialMonth: number
}

export function ScheduleClient({ initialSessions, initialAllSessions, clients, locations: initialLocations, trainerId, initialYear, initialMonth }: Props) {
  const t = useT()
  const [tab, setTab] = useState<'calendar' | 'list'>('calendar')
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [sessions, setSessions] = useState<TrainingSession[]>(initialSessions)
  const [allSessions, setAllSessions] = useState<TrainingSession[]>(initialAllSessions)
  const [locations, setLocations] = useState<TrainerLocation[]>(initialLocations)
  const [selectedDate, setSelectedDate] = useState<string | null>(toDateStr(new Date()))
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editSession, setEditSession] = useState<TrainingSession | null>(null)
  const [listSubTab, setListSubTab] = useState<'upcoming' | 'past'>('upcoming')
  const [filterClient, setFilterClient] = useState(ALL)
  const [filterLocation, setFilterLocation] = useState(ALL)
  const [filterPaid, setFilterPaid] = useState(ALL)
  const [loading, setLoading] = useState(false)
  const [use12h, setUse12h] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('timeFormat') === '12h' : false
  )

  async function loadMonth(y: number, m: number) {
    setLoading(true)
    const supabase = createClient()
    const calDays = getCalendarDays(y, m)
    const from = toDateStr(calDays[0].date)
    const to = toDateStr(calDays[calDays.length - 1].date)
    const { data } = await (supabase as any)
      .from('training_sessions')
      .select('*, client:clients(id,name), location:trainer_locations(id,name)')
      .eq('trainer_id', trainerId)
      .gte('date', from)
      .lte('date', to)
      .order('date').order('time')
    setSessions(data ?? [])
    setLoading(false)
  }

  function prevMonth() {
    const y = month === 0 ? year - 1 : year
    const m = month === 0 ? 11 : month - 1
    setYear(y); setMonth(m); loadMonth(y, m)
  }

  function nextMonth() {
    const y = month === 11 ? year + 1 : year
    const m = month === 11 ? 0 : month + 1
    setYear(y); setMonth(m); loadMonth(y, m)
  }

  function goToday() {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    setYear(y); setMonth(m); loadMonth(y, m)
    setSelectedDate(toDateStr(now))
  }

  function handleSaved(session: TrainingSession, isNew: boolean) {
    const updateFn = (prev: TrainingSession[]) =>
      isNew ? [...prev, session] : prev.map(s => s.id === session.id ? session : s)
    setSessions(updateFn)
    setAllSessions(updateFn)
  }

  function handleDeleted(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id))
    setAllSessions(prev => prev.filter(s => s.id !== id))
  }

  async function handlePaidToggle(id: string, paid: boolean) {
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('training_sessions')
      .update({ paid })
      .eq('id', id)
      .select('*, client:clients(id,name), location:trainer_locations(id,name)')
      .single()
    if (data) {
      setSessions(prev => prev.map(s => s.id === id ? data : s))
      setAllSessions(prev => prev.map(s => s.id === id ? data : s))
    }
  }

  function matchesLocation(s: TrainingSession) {
    if (filterLocation === ALL) return true
    if (filterLocation === ONLINE_KEY) {
      const name = (s.location as any)?.name ?? s.location_name ?? ''
      return name === 'Online'
    }
    return s.location_id === filterLocation
  }

  function applyFilters(list: TrainingSession[]) {
    return list
      .filter(s => filterClient === ALL || s.client_id === filterClient)
      .filter(matchesLocation)
      .filter(s => filterPaid === ALL || (filterPaid === PAID_KEY ? s.paid : !s.paid))
  }

  const filteredSessions = applyFilters(sessions)
  const filteredAll = applyFilters(allSessions)

  const daySession = selectedDate ? filteredSessions.filter(s => s.date === selectedDate) : []

  const today = toDateStr(new Date())
  const upcoming = filteredAll
    .filter(s => s.date >= today)
    .sort((a, b) => `${a.date}${a.time ?? ''}`.localeCompare(`${b.date}${b.time ?? ''}`))
  const past = filteredAll
    .filter(s => s.date < today)
    .sort((a, b) => `${b.date}${b.time ?? ''}`.localeCompare(`${a.date}${a.time ?? ''}`))

  const cardProps = {
    use12h,
    locale: t.schedule.locale,
    atLabel: t.schedule.at,
    durationFn: t.schedule.duration,
    paidOkLabel: t.schedule.paidOk,
    unpaidLabel: t.schedule.unpaid,
    onPaidToggle: handlePaidToggle,
  }

  const filterProps = {
    filterClient,
    filterLocation,
    filterPaid,
    clients,
    locations,
    allClientsLabel: t.schedule.allClients,
    allLocationsLabel: t.schedule.allLocations,
    allPaymentsLabel: t.schedule.allPayments,
    paidLabel: t.schedule.filterPaid,
    unpaidLabel: t.schedule.filterUnpaid,
    clearLabel: t.schedule.clearFilters,
    onClientChange: setFilterClient,
    onLocationChange: setFilterLocation,
    onPaidChange: setFilterPaid,
    onClear: () => { setFilterClient(ALL); setFilterLocation(ALL); setFilterPaid(ALL) },
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t.schedule.title}</h1>
        <Button onClick={() => { setEditSession(null); setSheetOpen(true) }}>{t.schedule.addSession}</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        {(['calendar', 'list'] as const).map(v => (
          <button key={v} onClick={() => setTab(v)}
            className={`cursor-pointer px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === v ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {v === 'calendar' ? t.schedule.calendar : t.schedule.list}
          </button>
        ))}
      </div>

      {tab === 'calendar' && (
        <div className="space-y-4">
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="cursor-pointer p-2 hover:bg-muted rounded-lg transition-colors text-foreground">←</button>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-foreground">
                {t.schedule.months[month]} {year}
              </h2>
              <button
                onClick={goToday}
                className="cursor-pointer text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-0.5 transition-colors"
              >
                {t.schedule.today}
              </button>
            </div>
            <button onClick={nextMonth} className="cursor-pointer p-2 hover:bg-muted rounded-lg transition-colors text-foreground">→</button>
          </div>

          <SessionFilters {...filterProps} />

          {loading ? (
            <div className="h-64 bg-muted animate-pulse rounded-xl" />
          ) : (
            <CalendarView year={year} month={month} sessions={filteredSessions} selectedDate={selectedDate} onSelectDate={setSelectedDate} use12h={use12h} />
          )}

          {/* Day panel */}
          {selectedDate && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString(t.schedule.locale, { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <Button size="sm" variant="outline" onClick={() => { setEditSession(null); setSheetOpen(true) }}>
                  {t.schedule.addSession}
                </Button>
              </div>
              {daySession.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.schedule.noSessionsDay}</p>
              ) : (
                <div className="space-y-2">
                  {daySession.map(s => (
                    <SessionCard key={s.id} session={s} {...cardProps} onClick={() => { setEditSession(s); setSheetOpen(true) }} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'list' && (
        <div className="space-y-4">
          {/* Sub-tabs + filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1">
              {(['upcoming', 'past'] as const).map(v => (
                <button key={v} onClick={() => setListSubTab(v)}
                  className={`cursor-pointer px-3 py-1.5 text-sm rounded-lg transition-colors ${listSubTab === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  {v === 'upcoming' ? t.schedule.upcoming : t.schedule.past}
                </button>
              ))}
            </div>
            <SessionFilters {...filterProps} />
          </div>

          {listSubTab === 'upcoming' && (
            upcoming.length === 0
              ? <p className="text-sm text-muted-foreground">{t.schedule.noUpcoming}</p>
              : <div className="space-y-2">
                  {upcoming.map(s => (
                    <SessionCard key={s.id} session={s} {...cardProps} onClick={() => { setEditSession(s); setSheetOpen(true) }} />
                  ))}
                </div>
          )}
          {listSubTab === 'past' && (
            past.length === 0
              ? <p className="text-sm text-muted-foreground">{t.schedule.noPast}</p>
              : <div className="space-y-2">
                  {past.map(s => (
                    <SessionCard key={s.id} session={s} {...cardProps} onClick={() => { setEditSession(s); setSheetOpen(true) }} />
                  ))}
                </div>
          )}
        </div>
      )}

      <SessionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
        session={editSession}
        clients={clients}
        locations={locations}
        onLocationAdded={loc => setLocations(prev => [...prev, loc].sort((a, b) => a.name.localeCompare(b.name)))}
        trainerId={trainerId}
        defaultDate={selectedDate ?? undefined}
      />
    </div>
  )
}
