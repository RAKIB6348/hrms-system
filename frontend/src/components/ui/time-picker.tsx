import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimePickerProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

function parseTime24(value: string): { hour12: string; minute: string; period: 'AM' | 'PM' } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value?.trim() ?? '')
  if (!match) return null
  const h24 = Number(match[1])
  const min = Number(match[2])
  if (h24 < 0 || h24 > 23 || min < 0 || min > 59) return null
  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return {
    hour12: String(h12).padStart(2, '0'),
    minute: String(min).padStart(2, '0'),
    period,
  }
}

function toTime24(hour12: string, minute: string, period: 'AM' | 'PM'): string {
  let h = Number(hour12) % 12
  if (period === 'PM') h += 12
  return `${String(h).padStart(2, '0')}:${minute}`
}

export function TimePicker({
  id,
  value,
  onValueChange,
  placeholder = 'Select time',
  className,
  disabled = false,
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const parsed = useMemo(() => parseTime24(value), [value])
  const activeHour = parsed?.hour12 ?? '09'
  const activeMinute = parsed?.minute ?? '00'
  const activePeriod = parsed?.period ?? 'AM'

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const updatePart = (nextHour: string, nextMinute: string, nextPeriod: 'AM' | 'PM') => {
    onValueChange(toTime24(nextHour, nextMinute, nextPeriod))
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          'flex h-[42px] w-full items-center justify-between rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 px-3.5 text-sm shadow-2xs transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        <span className={cn('truncate text-left font-medium', !parsed && 'font-normal text-muted-foreground')}>
          {parsed ? `${parsed.hour12}:${parsed.minute} ${parsed.period}` : placeholder}
        </span>
        <Clock className="ml-2 h-4 w-4 shrink-0 text-muted-foreground opacity-70" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Time picker"
          className="absolute left-0 top-full z-50 mt-1.5 w-64 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95"
        >
          <div className="grid grid-cols-3 border-b border-slate-100 dark:border-slate-800 bg-muted/30 px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Hour</span>
            <span>Min</span>
            <span>Period</span>
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
            <div className="h-48 overflow-y-auto p-1.5 space-y-0.5">
              {HOURS_12.map((h) => {
                const selected = parsed ? parsed.hour12 === h : false
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => updatePart(h, activeMinute, activePeriod)}
                    className={cn(
                      'flex w-full items-center justify-center rounded-md py-1.5 text-xs font-medium transition-colors hover:bg-accent',
                      selected && 'bg-[#4F46E5] text-white hover:bg-[#4338CA]',
                    )}
                  >
                    {h}
                  </button>
                )
              })}
            </div>

            <div className="h-48 overflow-y-auto p-1.5 space-y-0.5">
              {MINUTES.map((m) => {
                const selected = parsed ? parsed.minute === m : false
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updatePart(activeHour, m, activePeriod)}
                    className={cn(
                      'flex w-full items-center justify-center rounded-md py-1.5 text-xs font-medium transition-colors hover:bg-accent',
                      selected && 'bg-[#4F46E5] text-white hover:bg-[#4338CA]',
                    )}
                  >
                    {m}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col gap-1 p-1.5">
              {(['AM', 'PM'] as const).map((p) => {
                const selected = parsed ? parsed.period === p : false
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updatePart(activeHour, activeMinute, p)}
                    className={cn(
                      'flex w-full items-center justify-center rounded-md py-2 text-xs font-semibold transition-colors hover:bg-accent',
                      selected && 'bg-[#4F46E5] text-white hover:bg-[#4338CA]',
                    )}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-muted/20 px-3 py-2">
            <span className="text-xs font-mono text-muted-foreground">
              {parsed ? `${value}` : '--:--'}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md bg-[#4F46E5] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#4338CA]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
