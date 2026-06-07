'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  value: string       // always HH:MM (24h internally)
  onChange: (v: string) => void
  use12h: boolean
}

function parse(v: string) {
  const [h = 0, m = 0] = v.split(':').map(Number)
  return { h, m }
}

function toStr(h: number, m: number) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function TimeInput({ value, onChange, use12h }: Props) {
  if (!use12h) {
    return (
      <Input
        type="time"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-9"
      />
    )
  }

  const { h, m } = value ? parse(value) : { h: 0, m: 0 }
  const isPM = h >= 12
  const hour12 = h % 12 || 12

  function setHour(raw: string) {
    const h12 = Math.min(12, Math.max(1, parseInt(raw) || 1))
    const h24 = isPM ? (h12 === 12 ? 12 : h12 + 12) : (h12 === 12 ? 0 : h12)
    onChange(toStr(h24, m))
  }

  function setMinute(raw: string) {
    const min = Math.min(59, Math.max(0, parseInt(raw) || 0))
    const h24 = isPM ? (hour12 === 12 ? 12 : hour12 + 12) : (hour12 === 12 ? 0 : hour12)
    onChange(toStr(h24, min))
  }

  function setAmPm(period: string) {
    const h24 = period === 'PM'
      ? (hour12 === 12 ? 12 : hour12 + 12)
      : (hour12 === 12 ? 0 : hour12)
    onChange(toStr(h24, m))
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number" min="1" max="12"
        value={value ? hour12 : ''}
        onChange={e => setHour(e.target.value)}
        placeholder="12"
        className="h-9 w-16 text-center"
      />
      <span className="text-muted-foreground font-medium">:</span>
      <Input
        type="number" min="0" max="59"
        value={value ? String(m).padStart(2, '0') : ''}
        onChange={e => setMinute(e.target.value)}
        placeholder="00"
        className="h-9 w-16 text-center"
      />
      <Select value={isPM ? 'PM' : 'AM'} onValueChange={v => setAmPm(v ?? 'AM')}>
        <SelectTrigger className="h-9 w-20">
          <SelectValue>{isPM ? 'PM' : 'AM'}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export function formatTimeDisplay(time: string | null, use12h: boolean): string {
  if (!time) return ''
  const { h, m } = parse(time)
  if (!use12h) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  const isPM = h >= 12
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`
}
