'use client'

import { useT } from '@/lib/i18n/context'
import { getCalendarDays, toDateStr, clientColor, formatTime } from './utils'
import { formatTimeDisplay } from './TimeInput'
import type { TrainingSession } from '@/types/database'

interface Props {
  year: number
  month: number
  sessions: TrainingSession[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
  use12h: boolean
}

export function CalendarView({ year, month, sessions, selectedDate, onSelectDate, use12h }: Props) {
  const t = useT()
  const days = getCalendarDays(year, month)
  const today = toDateStr(new Date())

  const byDate = sessions.reduce<Record<string, TrainingSession[]>>((acc, s) => {
    ;(acc[s.date] ??= []).push(s)
    return acc
  }, {})

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {t.schedule.daysShort.map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
        {days.map(({ date, currentMonth }) => {
          const ds = toDateStr(date)
          const daySessions = byDate[ds] ?? []
          const isToday = ds === today
          const isSelected = ds === selectedDate

          return (
            <button
              key={ds}
              type="button"
              onClick={() => onSelectDate(ds)}
              className={`
                relative bg-card min-h-[80px] p-1.5 text-left transition-colors hover:bg-accent
                ${isSelected ? 'bg-primary/5 ring-1 ring-inset ring-primary' : ''}
                ${!currentMonth ? 'opacity-40' : ''}
              `}
            >
              <span className={`
                inline-flex items-center justify-center w-6 h-6 text-xs rounded-full mb-1
                ${isToday ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground font-medium'}
              `}>
                {date.getDate()}
              </span>

              <div className="space-y-0.5">
                {daySessions.slice(0, 3).map(s => (
                  <div
                    key={s.id}
                    className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate ${clientColor(s.client_id)}`}
                  >
                    {s.time ? formatTimeDisplay(s.time, use12h) + ' ' : ''}{(s.client as any)?.name?.split(' ')[0] ?? ''}
                  </div>
                ))}
                {daySessions.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">+{daySessions.length - 3}</div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
