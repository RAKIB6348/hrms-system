import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertCircle,
  CalendarPlus,
  Check,
  Clock3,
  Plus,
  Send,
  Sun,
  Sunrise,
  Sunset,
  UserCheck,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { employees, leaveRequests, leaveTypes } from '@/mocks/data'
import { cn, formatDate, initials, randomId } from '@/lib/utils'
import type { LeaveRequest } from '@/types'

const filters: TableFilter<LeaveRequest>[] = [
  {
    key: 'status',
    label: 'Status',
    options: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    value: (r) => r.status,
  },
  {
    key: 'leaveType',
    label: 'Leave Types',
    options: [...new Set(leaveRequests.map((r) => r.leaveType))],
    value: (r) => r.leaveType,
  },
]

const columns: Column<LeaveRequest>[] = [
  {
    key: 'employee',
    header: 'Employee',
    cell: (r) => {
      const emp = employees.find((e) => `${e.firstName} ${e.lastName}` === r.employee)
      return (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 ring-1 ring-black/5 dark:ring-white/10 shadow-2xs">
            <AvatarFallback
              style={{ backgroundColor: emp?.avatarColor ?? '#4F46E5', color: '#fff' }}
              className="text-[11px] font-bold"
            >
              {initials(r.employee)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-[#0F172A] dark:text-slate-100">{r.employee}</p>
            <p className="text-xs text-muted-foreground">{r.department}</p>
          </div>
        </div>
      )
    },
    sortValue: (r) => r.employee,
  },
  {
    key: 'leaveType',
    header: 'Leave Type',
    cell: (r) => {
      const type = leaveTypes.find((t) => t.name === r.leaveType)
      return (
        <span className="flex items-center gap-2 font-medium">
          {type?.color && (
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: type.color }}
            />
          )}
          {r.leaveType}
        </span>
      )
    },
    sortValue: (r) => r.leaveType,
  },
  {
    key: 'startDate',
    header: 'From',
    cell: (r) => formatDate(r.startDate, { month: 'short', day: 'numeric' }),
    sortValue: (r) => r.startDate,
  },
  {
    key: 'endDate',
    header: 'To',
    cell: (r) => formatDate(r.endDate, { month: 'short', day: 'numeric' }),
    sortValue: (r) => r.endDate,
  },
  { key: 'days', header: 'Days', cell: (r) => r.days, sortValue: (r) => r.days },
  {
    key: 'appliedOn',
    header: 'Applied',
    cell: (r) => formatDate(r.appliedOn, { month: 'short', day: 'numeric' }),
    sortValue: (r) => r.appliedOn,
  },
  { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
]

function calculateDays(start: string, end: string): number {
  if (!start || !end) return 1
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (isNaN(s) || isNaN(e)) return 1
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24))
  return diff >= 0 ? diff + 1 : 1
}

export default function LeaveRequests() {
  const [rows, setRows] = useState(leaveRequests)
  const [createOpen, setCreateOpen] = useState(false)

  // Form State for New Request
  const defaultEmployee = `${employees[0]?.firstName} ${employees[0]?.lastName}`
  const [form, setForm] = useState({
    employee: defaultEmployee,
    leaveType: leaveTypes[0]?.name ?? 'Casual Leave',
    startDate: '2026-11-21',
    endDate: '2026-11-24',
    reason: '',
  })
  const [durationOption, setDurationOption] = useState<'full' | 'first_half' | 'second_half'>('full')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const selectedEmp =
    employees.find((e) => `${e.firstName} ${e.lastName}` === form.employee) ?? employees[0]!
  const selectedLeaveType =
    leaveTypes.find((t) => t.name === form.leaveType) ?? leaveTypes[0]!

  const baseDays = calculateDays(form.startDate, form.endDate)
  const calculatedDays = useMemo(() => {
    if (durationOption === 'first_half' || durationOption === 'second_half') {
      return baseDays === 1 ? 0.5 : Math.max(0.5, baseDays - 0.5)
    }
    return baseDays
  }, [baseDays, durationOption])

  const update = (id: string, status: 'Approved' | 'Rejected') => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    const employee = rows.find((r) => r.id === id)?.employee
    toast.success(`Leave request ${status.toLowerCase()} for ${employee}`)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const errors: Record<string, string> = {}
    if (!form.employee.trim()) errors.employee = 'Employee is required'
    if (!form.leaveType.trim()) errors.leaveType = 'Leave type is required'
    if (!form.startDate) errors.startDate = 'Start date is required'
    if (!form.endDate) errors.endDate = 'End date is required'
    if (form.endDate < form.startDate) {
      errors.endDate = 'End date cannot be earlier than start date'
    }
    if (!form.reason.trim()) errors.reason = 'Reason for leave is required'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const sessionSuffix =
      durationOption === 'first_half'
        ? ' [First Half]'
        : durationOption === 'second_half'
          ? ' [Second Half]'
          : ''

    const newRequest: LeaveRequest = {
      id: randomId('lv'),
      employee: form.employee,
      department: selectedEmp?.department ?? 'Engineering',
      leaveType: `${form.leaveType}${sessionSuffix}`,
      startDate: form.startDate,
      endDate: form.endDate,
      days: calculatedDays,
      reason: form.reason.trim(),
      status: 'Pending',
      appliedOn: '2026-11-22',
      approver: selectedEmp?.manager ?? 'Meera Nair',
    }

    setRows((prev) => [newRequest, ...prev])
    toast.success(
      `Leave request submitted for ${form.employee} (${calculatedDays} ${calculatedDays === 1 ? 'day' : 'days'})`,
    )
    setCreateOpen(false)
    setForm({
      employee: defaultEmployee,
      leaveType: leaveTypes[0]?.name ?? 'Casual Leave',
      startDate: '2026-11-21',
      endDate: '2026-11-24',
      reason: '',
    })
    setDurationOption('full')
    setFormErrors({})
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Requests"
        description="Review, approve or reject employee leave requests."
        actions={
          <Button
            onClick={() => {
              setFormErrors({})
              setCreateOpen(true)
            }}
            className="h-[42px] px-5 rounded-lg text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/25 transition-all"
          >
            <Plus className="h-4 w-4 mr-1.5" /> New Request
          </Button>
        }
      />
      <DemoNotice compact />
      <DataTable
        data={rows}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search leave requests..."
        toolbar={
          <span className="text-xs text-muted-foreground font-medium">
            {rows.filter((r) => r.status === 'Pending').length} pending
          </span>
        }
        rowActions={(r) => (
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {(r.status === 'Pending' || r.status === 'Approved') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-md bg-[#15803D] text-white transition-colors duration-150 ${r.status === 'Pending' ? 'hover:bg-[#166534]' : 'cursor-default opacity-70'}`}
                    aria-label={r.status === 'Pending' ? 'Approve leave request' : 'Approved'}
                    aria-disabled={r.status !== 'Pending'}
                    onClick={r.status === 'Pending' ? () => update(r.id, 'Approved') : undefined}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{r.status === 'Pending' ? 'Approve' : 'Approved'}</TooltipContent>
              </Tooltip>
            )}
            {(r.status === 'Pending' || r.status === 'Rejected') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-md bg-[#B91C1C] text-white transition-colors duration-150 ${r.status === 'Pending' ? 'hover:bg-[#991B1B]' : 'cursor-default opacity-70'}`}
                    aria-label={r.status === 'Pending' ? 'Reject leave request' : 'Rejected'}
                    aria-disabled={r.status !== 'Pending'}
                    onClick={r.status === 'Pending' ? () => update(r.id, 'Rejected') : undefined}
                  >
                    <X className="h-4 w-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{r.status === 'Pending' ? 'Reject' : 'Rejected'}</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      />

      {/* New Leave Request Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[540px] rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#4F46E5] ring-1 ring-indigo-500/10 dark:bg-indigo-950/50 dark:text-indigo-400">
                <CalendarPlus className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
                  New Leave Request
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
                  Submit a new time-off application for manager approval.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 pb-1">
            {/* Employee Selection with Avatar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="employee" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Employee <span className="text-rose-500 font-bold">*</span>
                </Label>
                {selectedEmp && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedEmp.designation} · {selectedEmp.department}
                  </span>
                )}
              </div>
              <Select
                value={form.employee}
                onValueChange={(val) => {
                  setForm((prev) => ({ ...prev, employee: val }))
                  if (formErrors.employee) {
                    setFormErrors((prev) => ({ ...prev, employee: '' }))
                  }
                }}
              >
                <SelectTrigger
                  id="employee"
                  className="h-[44px] px-3 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs hover:border-slate-400 focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                >
                  <div className="flex items-center gap-2.5 truncate w-full">
                    {selectedEmp && (
                      <Avatar className="h-6 w-6 shrink-0 ring-1 ring-black/5 dark:ring-white/10">
                        <AvatarFallback
                          style={{ backgroundColor: selectedEmp.avatarColor, color: '#fff' }}
                          className="text-[10px] font-bold"
                        >
                          {initials(form.employee)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate">
                      {form.employee}
                    </span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal ml-auto shrink-0">
                      {selectedEmp?.department}
                    </Badge>
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {employees.map((emp) => {
                    const fullName = `${emp.firstName} ${emp.lastName}`
                    return (
                      <SelectItem key={emp.id} value={fullName}>
                        <div className="flex items-center gap-2.5 py-0.5">
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarFallback
                              style={{ backgroundColor: emp.avatarColor, color: '#fff' }}
                              className="text-[10px] font-bold"
                            >
                              {initials(fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-xs text-slate-900 dark:text-slate-100">{fullName}</p>
                            <p className="text-[10px] text-slate-500">
                              {emp.designation} · {emp.department}
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {formErrors.employee && (
                <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" /> {formErrors.employee}
                </p>
              )}
            </div>

            {/* Leave Type with Theme Dot & Allowance */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="leaveType" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Leave Type <span className="text-rose-500 font-bold">*</span>
                </Label>
                {selectedLeaveType && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Allowance: <strong className="font-semibold text-slate-700 dark:text-slate-300">{selectedLeaveType.annualAllowance} days/yr</strong>
                  </span>
                )}
              </div>
              <Select
                value={form.leaveType}
                onValueChange={(val) => {
                  setForm((prev) => ({ ...prev, leaveType: val }))
                  if (formErrors.leaveType) {
                    setFormErrors((prev) => ({ ...prev, leaveType: '' }))
                  }
                }}
              >
                <SelectTrigger
                  id="leaveType"
                  className="h-[44px] px-3 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs hover:border-slate-400 focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                >
                  <div className="flex items-center gap-2 truncate">
                    {selectedLeaveType && (
                      <span
                        className="h-3 w-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: selectedLeaveType.color }}
                      />
                    )}
                    <span className="font-medium text-xs text-slate-900 dark:text-slate-100">
                      {form.leaveType}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 ml-1">
                      {selectedLeaveType?.code}
                    </Badge>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      <div className="flex items-center justify-between w-full gap-4 py-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: t.color }}
                          />
                          <span className="font-medium text-xs">{t.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({t.code})</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium ml-4">
                          {t.annualAllowance}d allowed
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.leaveType && (
                <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" /> {formErrors.leaveType}
                </p>
              )}
            </div>

            {/* Unified Leave Schedule & Duration Card */}
            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Leave Schedule & Duration
                </span>
                <span className="text-[11px] font-bold text-[#4F46E5] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200/70 dark:border-indigo-800/70 flex items-center gap-1.5 shadow-2xs">
                  <Clock3 className="h-3 w-3" />
                  <span>{calculatedDays} {calculatedDays === 1 ? 'day' : 'days'} duration</span>
                </span>
              </div>

              {/* Quick Duration Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-0.5">
                  Durations:
                </span>
                {[
                  { label: 'Half Day (0.5d)', days: 0.5 },
                  { label: '1 Day', days: 1 },
                  { label: '2 Days', days: 2 },
                  { label: '3 Days', days: 3 },
                  { label: '4 Days', days: 4 },
                  { label: '1 Week (5d)', days: 5 },
                ].map((preset) => {
                  const isSelected = calculatedDays === preset.days
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        if (preset.days === 0.5) {
                          setForm((prev) => ({ ...prev, endDate: prev.startDate }))
                          setDurationOption('first_half')
                        } else {
                          const start = new Date(form.startDate)
                          const end = new Date(start)
                          end.setDate(start.getDate() + (preset.days - 1))
                          const endStr = end.toISOString().split('T')[0]!
                          setForm((prev) => ({ ...prev, endDate: endStr }))
                          setDurationOption('full')
                        }
                      }}
                      className={cn(
                        'text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all',
                        isSelected
                          ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
                      )}
                    >
                      {preset.label}
                    </button>
                  )
                })}
              </div>

              {/* From & To Date Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    From Date <span className="text-rose-500 font-bold">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => {
                      const newStart = e.target.value
                      setForm((prev) => ({
                        ...prev,
                        startDate: newStart,
                        endDate: prev.endDate < newStart ? newStart : prev.endDate,
                      }))
                      if (formErrors.startDate) {
                        setFormErrors((prev) => ({ ...prev, startDate: '' }))
                      }
                    }}
                    className="h-[40px] px-3 bg-white dark:bg-slate-900 rounded-lg text-xs font-medium border-slate-300 dark:border-slate-700 shadow-2xs hover:border-slate-400 focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                  />
                  {formErrors.startDate && (
                    <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {formErrors.startDate}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="endDate" className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    To Date <span className="text-rose-500 font-bold">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    min={form.startDate}
                    value={form.endDate}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, endDate: e.target.value }))
                      if (formErrors.endDate) {
                        setFormErrors((prev) => ({ ...prev, endDate: '' }))
                      }
                    }}
                    className="h-[40px] px-3 bg-white dark:bg-slate-900 rounded-lg text-xs font-medium border-slate-300 dark:border-slate-700 shadow-2xs hover:border-slate-400 focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                  />
                  {formErrors.endDate && (
                    <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {formErrors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Day Duration Session Options (Full Day, Morning, Afternoon) */}
              <div className="space-y-1.5 pt-0.5">
                <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Duration / Session Type
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDurationOption('full')}
                    className={cn(
                      'h-8 px-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5',
                      durationOption === 'full'
                        ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
                    )}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    <span>Full Day</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationOption('first_half')}
                    className={cn(
                      'h-8 px-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5',
                      durationOption === 'first_half'
                        ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
                    )}
                  >
                    <Sunrise className="h-3.5 w-3.5" />
                    <span>First Half (0.5d)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationOption('second_half')}
                    className={cn(
                      'h-8 px-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5',
                      durationOption === 'second_half'
                        ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
                    )}
                  >
                    <Sunset className="h-3.5 w-3.5" />
                    <span>Second Half (0.5d)</span>
                  </button>
                </div>
              </div>

              {/* Schedule Context Footer */}
              <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B] dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-[#4F46E5]" />
                  <span>
                    Timeframe:{' '}
                    <strong className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDate(form.startDate, { month: 'short', day: 'numeric' })} – {formatDate(form.endDate, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </strong>{' '}
                    · <span className="font-bold text-[#4F46E5]">{calculatedDays} {calculatedDays === 1 ? 'day' : 'days'} duration</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    Approver:{' '}
                    <strong className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedEmp?.manager ?? 'Department Head'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Reason Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="reason" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Reason for Leave <span className="text-rose-500 font-bold">*</span>
                </Label>
                <span className="text-[11px] text-slate-400">Required for approval</span>
              </div>
              <Textarea
                id="reason"
                placeholder="Please describe the purpose of this leave request (e.g. family event, medical appointment, relocation)..."
                value={form.reason}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, reason: e.target.value }))
                  if (formErrors.reason) {
                    setFormErrors((prev) => ({ ...prev, reason: '' }))
                  }
                }}
                className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs leading-relaxed shadow-2xs focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                rows={3}
              />
              {formErrors.reason && (
                <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" /> {formErrors.reason}
                </p>
              )}
            </div>

            <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="h-[42px] px-5 rounded-lg text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-[42px] px-6 rounded-lg text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5 mr-1" /> Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
