import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar as CalendarIcon,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Plus,
  RotateCcw,
  Search,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { departments, employees, leaveRequests, leaveTypes } from '@/mocks/data'
import { cn, initials } from '@/lib/utils'
import type { LeaveRequest } from '@/types'

const weekdays = [
  { short: 'Sun', long: 'Sunday', isWeekend: true },
  { short: 'Mon', long: 'Monday', isWeekend: false },
  { short: 'Tue', long: 'Tuesday', isWeekend: false },
  { short: 'Wed', long: 'Wednesday', isWeekend: false },
  { short: 'Thu', long: 'Thursday', isWeekend: false },
  { short: 'Fri', long: 'Friday', isWeekend: false },
  { short: 'Sat', long: 'Saturday', isWeekend: true },
]

interface CalendarCell {
  day: number
  dateStr: string
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
}

function getLeaveTypeTheme(leaveTypeName: string) {
  switch (leaveTypeName) {
    case 'Casual Leave':
      return {
        bg: 'bg-indigo-50/95 dark:bg-indigo-950/40 hover:bg-indigo-100/90 dark:hover:bg-indigo-900/60',
        text: 'text-[#4F46E5] dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800/70',
        dot: 'bg-[#4F46E5]',
        badge: 'bg-indigo-100 text-[#4F46E5] dark:bg-indigo-900/60 dark:text-indigo-300',
        code: 'CL',
      }
    case 'Sick Leave':
      return {
        bg: 'bg-rose-50/95 dark:bg-rose-950/40 hover:bg-rose-100/90 dark:hover:bg-rose-900/60',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800/70',
        dot: 'bg-rose-500',
        badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
        code: 'SL',
      }
    case 'Earned Leave':
      return {
        bg: 'bg-emerald-50/95 dark:bg-emerald-950/40 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/60',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800/70',
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
        code: 'EL',
      }
    case 'Maternity Leave':
      return {
        bg: 'bg-fuchsia-50/95 dark:bg-fuchsia-950/40 hover:bg-fuchsia-100/90 dark:hover:bg-fuchsia-900/60',
        text: 'text-fuchsia-700 dark:text-fuchsia-300',
        border: 'border-fuchsia-200 dark:border-fuchsia-800/70',
        dot: 'bg-fuchsia-500',
        badge: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/60 dark:text-fuchsia-300',
        code: 'ML',
      }
    case 'Unpaid Leave':
      return {
        bg: 'bg-amber-50/95 dark:bg-amber-950/40 hover:bg-amber-100/90 dark:hover:bg-amber-900/60',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800/70',
        dot: 'bg-amber-500',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
        code: 'UL',
      }
    case 'Comp Off':
      return {
        bg: 'bg-sky-50/95 dark:bg-sky-950/40 hover:bg-sky-100/90 dark:hover:bg-sky-900/60',
        text: 'text-sky-700 dark:text-sky-300',
        border: 'border-sky-200 dark:border-sky-800/70',
        dot: 'bg-sky-500',
        badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
        code: 'CO',
      }
    default:
      return {
        bg: 'bg-slate-50/95 dark:bg-slate-800/40 hover:bg-slate-100/90 dark:hover:bg-slate-800/60',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-500',
        badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        code: 'LV',
      }
  }
}

export default function LeaveCalendar() {
  const [month, setMonth] = useState(10) // November (0-indexed)
  const [year, setYear] = useState(2026)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showAllStatuses, setShowAllStatuses] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Current calendar cells with real leading and trailing days
  const cells = useMemo<CalendarCell[]>(() => {
    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const list: CalendarCell[] = []

    // Previous month leading days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const prevDate = new Date(year, month - 1, d)
      const y = prevDate.getFullYear()
      const m = String(prevDate.getMonth() + 1).padStart(2, '0')
      const dayStr = String(d).padStart(2, '0')
      const dateStr = `${y}-${m}-${dayStr}`
      const isWeekend = prevDate.getDay() === 0 || prevDate.getDay() === 6
      list.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        isWeekend,
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const m = String(month + 1).padStart(2, '0')
      const dayStr = String(d).padStart(2, '0')
      const dateStr = `${year}-${m}-${dayStr}`
      const cellDate = new Date(year, month, d)
      const isToday = year === 2026 && month === 10 && d === 22 // Nov 22, 2026 is today
      const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6
      list.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        isToday,
        isWeekend,
      })
    }

    // Next month trailing days
    const remaining = (7 - (list.length % 7)) % 7
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d)
      const y = nextDate.getFullYear()
      const m = String(nextDate.getMonth() + 1).padStart(2, '0')
      const dayStr = String(d).padStart(2, '0')
      const dateStr = `${y}-${m}-${dayStr}`
      const isWeekend = nextDate.getDay() === 0 || nextDate.getDay() === 6
      list.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        isWeekend,
      })
    }

    return list
  }, [month, year])

  const monthName = new Date(year, month, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const shift = (dir: number) => {
    const date = new Date(year, month + dir, 1)
    setMonth(date.getMonth())
    setYear(date.getFullYear())
  }

  const goToToday = () => {
    setMonth(10)
    setYear(2026)
  }

  // Quick stats
  const todayDateStr = '2026-11-22'
  const onLeaveToday = useMemo(() => {
    return leaveRequests.filter(
      (r) => r.status === 'Approved' && r.startDate <= todayDateStr && r.endDate >= todayDateStr,
    )
  }, [todayDateStr])

  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const thisMonthApproved = useMemo(() => {
    return leaveRequests.filter(
      (r) =>
        r.status === 'Approved' &&
        (r.startDate.startsWith(currentMonthPrefix) || r.endDate.startsWith(currentMonthPrefix)),
    )
  }, [currentMonthPrefix])

  const pendingRequests = useMemo(() => {
    return leaveRequests.filter((r) => r.status === 'Pending')
  }, [])

  const upcomingLeaves = useMemo(() => {
    return leaveRequests.filter(
      (r) => r.status === 'Approved' && r.startDate >= todayDateStr && r.startDate <= '2026-11-29',
    )
  }, [todayDateStr])

  // Filter events for each calendar cell
  const getEventsForDate = (dateStr: string) => {
    return leaveRequests.filter((r) => {
      const matchesStatus = showAllStatuses ? true : r.status === 'Approved'
      if (!matchesStatus) return false
      if (selectedDept !== 'all' && r.department !== selectedDept) return false
      if (selectedType !== 'all' && r.leaveType !== selectedType) return false
      if (searchQuery.trim() && !r.employee.toLowerCase().includes(searchQuery.toLowerCase().trim()))
        return false
      return r.startDate <= dateStr && r.endDate >= dateStr
    })
  }

  // Selected Day Details for Dialog
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return []
    return leaveRequests.filter((r) => {
      const matchesStatus = showAllStatuses ? true : r.status === 'Approved'
      return matchesStatus && r.startDate <= selectedDate && r.endDate >= selectedDate
    })
  }, [selectedDate, showAllStatuses])

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return ''
    const [y, m, d] = selectedDate.split('-').map(Number)
    const dt = new Date(y!, m! - 1, d!)
    return dt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [selectedDate])

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedDept !== 'all' ||
    selectedType !== 'all' ||
    showAllStatuses

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedDept('all')
    setSelectedType('all')
    setShowAllStatuses(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Calendar"
        description="Visualize scheduled time off across your organization."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              asChild
              className="h-[42px] px-5 rounded-lg text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/25 transition-all"
            >
              <Link to="/leave/requests">
                <Plus className="h-4 w-4 mr-1.5" /> Request Leave
              </Link>
            </Button>
          </div>
        }
      />
      <DemoNotice compact />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#4F46E5] ring-1 ring-indigo-500/10 dark:bg-indigo-950/50 dark:text-indigo-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">On Leave Today</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
                {onLeaveToday.length}
              </span>
              <span className="text-xs text-[#64748B] dark:text-slate-400">
                {onLeaveToday.length === 1 ? 'employee' : 'employees'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/10 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">Scheduled Leaves</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
                {thisMonthApproved.length}
              </span>
              <span className="text-xs text-[#64748B] dark:text-slate-400">in {new Date(year, month).toLocaleString('en-US', { month: 'short' })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/10 dark:bg-amber-950/50 dark:text-amber-400">
            <Clock3 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">Pending Reviews</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
                {pendingRequests.length}
              </span>
              <span className="text-xs text-[#64748B] dark:text-slate-400">awaiting action</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-500/10 dark:bg-sky-950/50 dark:text-sky-400">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">Upcoming (7 Days)</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
                {upcomingLeaves.length}
              </span>
              <span className="text-xs text-[#64748B] dark:text-slate-400">starting soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar Card */}
      <Card className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Navigation & Toolbar Header */}
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Month switcher & Today button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => shift(-1)}
                  className="h-9 w-9 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  title="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => shift(1)}
                  className="h-9 w-9 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  title="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100 min-w-[170px]">
                {monthName}
              </h2>

              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="h-9 px-3 rounded-lg text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Today
              </Button>
            </div>

            {/* Right: Filters & Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative w-full sm:w-48 md:w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by employee..."
                  className="h-9 pl-9 pr-3 rounded-lg text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Department Filter */}
              <div className="w-36 sm:w-40">
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="h-9 rounded-lg text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Leave Type Filter */}
              <div className="w-36 sm:w-40">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-9 rounded-lg text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
                    <SelectValue placeholder="Leave Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Leave Types</SelectItem>
                    {leaveTypes.map((t) => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Toggle (Approved / All) */}
              <button
                type="button"
                onClick={() => setShowAllStatuses(!showAllStatuses)}
                className={cn(
                  'h-9 px-3 rounded-lg text-xs font-semibold border transition-all inline-flex items-center gap-1.5',
                  showAllStatuses
                    ? 'border-indigo-300 bg-indigo-50 text-[#4F46E5] dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                {showAllStatuses ? 'All Statuses' : 'Approved Only'}
              </button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Reset filters"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {weekdays.map((day) => (
              <div
                key={day.short}
                className={cn(
                  'py-2 px-1 rounded-lg text-xs font-semibold uppercase tracking-wider',
                  day.isWeekend
                    ? 'text-slate-400 dark:text-slate-500 bg-slate-50/60 dark:bg-slate-900/40'
                    : 'text-[#64748B] dark:text-slate-300 bg-slate-100/60 dark:bg-slate-800/40',
                )}
              >
                <span className="hidden sm:inline">{day.long}</span>
                <span className="sm:hidden">{day.short}</span>
              </div>
            ))}
          </div>

          {/* Monthly Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {cells.map((cell, index) => {
              const events = getEventsForDate(cell.dateStr)

              return (
                <div
                  key={`${cell.dateStr}-${index}`}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={cn(
                    'group min-h-[114px] sm:min-h-[126px] rounded-xl border p-2 flex flex-col justify-between transition-all cursor-pointer relative',
                    cell.isCurrentMonth
                      ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-[#4F46E5]/60 hover:shadow-md'
                      : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-900/60 text-slate-300 dark:text-slate-700 opacity-60 hover:opacity-100',
                    cell.isToday &&
                      'border-[#4F46E5] ring-2 ring-indigo-500/20 bg-indigo-50/15 dark:bg-indigo-950/20 shadow-xs',
                    cell.isWeekend && cell.isCurrentMonth && 'bg-slate-50/40 dark:bg-slate-900/40',
                  )}
                >
                  {/* Cell Header: Date Number + Event Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'text-xs font-bold inline-flex items-center justify-center transition-colors',
                          cell.isToday
                            ? 'h-6 px-1.5 rounded-md bg-[#4F46E5] text-white shadow-xs text-[11px]'
                            : cell.isCurrentMonth
                              ? 'text-[#0F172A] dark:text-slate-100 group-hover:text-[#4F46E5]'
                              : 'text-slate-400 dark:text-slate-600',
                        )}
                      >
                        {cell.day}
                      </span>
                      {cell.isToday && (
                        <span className="hidden md:inline-block text-[10px] font-semibold text-[#4F46E5] dark:text-indigo-400 uppercase tracking-wider">
                          Today
                        </span>
                      )}
                    </div>

                    {events.length > 0 && (
                      <span className="h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-semibold inline-flex items-center justify-center bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 group-hover:bg-indigo-100 group-hover:text-[#4F46E5] transition-colors">
                        {events.length}
                      </span>
                    )}
                  </div>

                  {/* Cell Events List */}
                  <div className="mt-1.5 space-y-1 flex-1">
                    {events.slice(0, 2).map((event) => {
                      const theme = getLeaveTypeTheme(event.leaveType)
                      const isPending = event.status === 'Pending'

                      return (
                        <div
                          key={event.id}
                          className={cn(
                            'rounded-md px-1.5 py-1 text-[11px] font-medium border flex items-center justify-between gap-1 transition-all shadow-2xs',
                            theme.bg,
                            theme.border,
                            theme.text,
                            isPending && 'border-dashed opacity-80',
                          )}
                          title={`${event.employee} (${event.department}) — ${event.leaveType} [${event.status}]`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', theme.dot)} />
                            <span className="truncate">{event.employee}</span>
                          </div>
                          <span className="text-[9px] font-bold tracking-tight opacity-75 shrink-0">
                            {theme.code}
                          </span>
                        </div>
                      )
                    })}

                    {events.length > 2 && (
                      <div className="text-[10px] font-semibold text-[#4F46E5] dark:text-indigo-400 hover:underline px-1 pt-0.5">
                        +{events.length - 2} more on leave
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Color-Coded Legend & Info Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[#64748B] dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">
                Leave Types:
              </span>
              {leaveTypes.map((type) => {
                const theme = getLeaveTypeTheme(type.name)
                return (
                  <div key={type.id} className="flex items-center gap-1.5">
                    <span className={cn('h-2 w-2 rounded-full', theme.dot)} />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {type.name}
                    </span>
                    <span className="text-[10px] text-slate-400">({type.code})</span>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-3 text-[#64748B] dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded border-2 border-[#4F46E5] bg-indigo-50" />
                <span>Today (Nov 22, 2026)</span>
              </div>
              <span>·</span>
              <span className="text-[11px]">Click any date to view scheduled details</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Details Dialog (Interactive on day click) */}
      <Dialog open={Boolean(selectedDate)} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#4F46E5] ring-1 ring-indigo-500/10 dark:bg-indigo-950/50 dark:text-indigo-400">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
                  {formattedSelectedDate}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
                  Scheduled time-off and active absences for this day.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* List of Leave Events for Selected Day */}
          <div className="py-3 space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {selectedDayEvents.length === 0 ? (
              <div className="py-10 text-center space-y-2.5">
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center mx-auto ring-1 ring-emerald-500/10">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#0F172A] dark:text-slate-100">
                    Full Team Available
                  </h4>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 max-w-xs mx-auto">
                    No employees have scheduled time off on this date.
                  </p>
                </div>
              </div>
            ) : (
              selectedDayEvents.map((req) => {
                const emp = employees.find((e) => `${e.firstName} ${e.lastName}` === req.employee)
                const theme = getLeaveTypeTheme(req.leaveType)

                return (
                  <div
                    key={req.id}
                    className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    {/* Top Row: Employee details + Leave Type Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-slate-800 shadow-2xs">
                          <AvatarFallback
                            style={{
                              backgroundColor: emp?.avatarColor ?? '#4F46E5',
                              color: '#fff',
                            }}
                            className="text-xs font-bold"
                          >
                            {initials(req.employee)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-sm text-[#0F172A] dark:text-slate-100">
                            {req.employee}
                          </h4>
                          <p className="text-xs text-[#64748B] dark:text-slate-400">
                            {emp?.designation ?? 'Team Member'} ·{' '}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {req.department}
                            </span>
                          </p>
                        </div>
                      </div>

                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 shrink-0',
                          theme.badge,
                          theme.border,
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', theme.dot)} />
                        {req.leaveType}
                      </span>
                    </div>

                    {/* Middle Row: Duration, Dates & Status */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                      <div>
                        <span className="text-[#64748B] dark:text-slate-400">Leave Period: </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {req.startDate} – {req.endDate}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#64748B] dark:text-slate-400">Total Duration: </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {req.days} {req.days === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    </div>

                    {/* Reason block */}
                    {req.reason && (
                      <div className="bg-white dark:bg-slate-900 rounded-lg p-2.5 border border-slate-200/80 dark:border-slate-800 text-xs text-[#64748B] dark:text-slate-400">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Reason:{' '}
                        </span>
                        “{req.reason}”
                      </div>
                    )}

                    {/* Status & Approver footer */}
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'h-2 w-2 rounded-full',
                            req.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500',
                          )}
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {req.status}
                        </span>
                      </span>
                      <span>Approved by {req.approver}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedDate(null)}
              className="h-[42px] px-5 rounded-lg text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
