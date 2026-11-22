import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { leaveRequests } from '@/mocks/data'
import { cn } from '@/lib/utils'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function LeaveCalendar() {
  const [month, setMonth] = useState(10) // November (0-indexed)
  const [year, setYear] = useState(2026)

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const result: (number | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [month, year])

  const monthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const shift = (dir: number) => {
    const date = new Date(year, month + dir, 1)
    setMonth(date.getMonth())
    setYear(date.getFullYear())
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Calendar"
        description="Visualize scheduled time off across your organization."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => shift(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="min-w-[150px] text-center text-sm font-semibold">{monthName}</span>
            <Button variant="outline" size="icon" onClick={() => shift(1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        }
      />
      <DemoNotice compact />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{monthName} — Leave Schedule</CardTitle>
          <p className="text-xs text-muted-foreground">Highlighted days indicate scheduled leave. Click a day to see details.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5">
            {weekdays.map((day) => (
              <div key={day} className="pb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">{day}</div>
            ))}
            {cells.map((day, index) => {
              if (day === null) return <div key={`empty-${index}`} className="min-h-[90px] rounded-lg bg-muted/20" />
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const events = leaveRequests.filter((r) => r.status === 'Approved' && r.startDate <= dateStr && r.endDate >= dateStr)
              const isToday = year === 2026 && month === 10 && day === 22
              return (
                <div key={day} className={cn('min-h-[90px] rounded-lg border p-2 transition-colors hover:bg-accent/50', isToday && 'border-primary bg-primary/5')}>
                  <div className="flex items-center justify-between">
                    <span className={cn('text-xs font-semibold', isToday && 'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white')}>{day}</span>
                    {events.length > 0 && <Badge variant="secondary" className="px-1.5 py-0 text-[9px]">{events.length}</Badge>}
                  </div>
                  <div className="mt-1.5 space-y-1">
                    {events.slice(0, 2).map((e) => (
                      <div key={e.id} className="truncate rounded bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary" title={`${e.employee} — ${e.leaveType}`}>
                        {e.employee.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-primary/20" /> Scheduled leave</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded border border-primary" /> Today</span>
        <span>Events shown are demonstration data.</span>
      </div>
    </div>
  )
}
