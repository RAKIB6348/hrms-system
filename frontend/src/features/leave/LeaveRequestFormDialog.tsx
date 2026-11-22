import { useState } from 'react'
import { toast } from 'sonner'
import { AlertCircle, Calendar, CalendarPlus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEmployeeStore } from '@/hooks/use-employee-store'
import { newLeaveRequestId, useLeaveStore } from '@/hooks/use-leave-store'
import { leaveTypes } from '@/mocks/data'
import type { LeaveRequest } from '@/types'

function calculateDays(start: string, end: string): number {
  if (!start || !end) return 0
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (isNaN(s) || isNaN(e)) return 0
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24))
  return diff >= 0 ? diff + 1 : 0
}

interface LeaveRequestFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeaveRequestFormDialog({ open, onOpenChange }: LeaveRequestFormDialogProps) {
  const employees = useEmployeeStore((state) => state.employees)
  const addRequest = useLeaveStore((state) => state.addRequest)

  const [employeeId, setEmployeeId] = useState('')
  const [leaveTypeName, setLeaveTypeName] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const employee = employees.find((item) => item.id === employeeId)
  const selectedLeaveType = leaveTypes.find((item) => item.name === leaveTypeName)

  // Calculations for Leave Balance (matches user mockup: Available, Requested, Remaining)
  const availableDays = selectedLeaveType?.annualAllowance ?? 12
  const requestedDays = fromDate && toDate ? calculateDays(fromDate, toDate) : 0
  const remainingDays = Math.max(0, availableDays - requestedDays)

  const clearError = (key: string) => setErrors((prev) => ({ ...prev, [key]: '' }))

  const submit = () => {
    const next: Record<string, string> = {}
    if (!employeeId) next.employee = 'Please select an employee'
    if (!leaveTypeName) next.leaveType = 'Please select a leave type'
    if (!fromDate) next.fromDate = 'Start date is required'
    if (!toDate) next.toDate = 'End date is required'
    if (fromDate && toDate && toDate < fromDate) next.toDate = 'End date cannot be earlier than start date'
    if (!reason.trim()) next.reason = 'Please describe your reason for leave'

    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    const duration = calculateDays(fromDate, toDate)
    const request: LeaveRequest = {
      id: newLeaveRequestId(),
      employeeId: employee?.id,
      approverId: employee?.manager,
      session: 'Full Day',
      employee: employee ? `${employee.firstName} ${employee.lastName}` : '',
      department: employee?.department ?? '',
      leaveType: leaveTypeName,
      startDate: fromDate,
      endDate: toDate,
      days: duration,
      reason: reason.trim(),
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]!,
      approver: employee?.manager || 'Department Head',
    }

    addRequest(request)
    toast.success(
      `Leave request submitted for ${request.employee} (${duration} ${duration === 1 ? 'day' : 'days'})`,
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[620px] w-full rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <DialogHeader className="p-0 space-y-0">
          <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CalendarPlus className="h-5 w-5 text-slate-800 dark:text-slate-100 mt-0.5 shrink-0" />
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                New Leave Request
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Submit a time-off application
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="space-y-5 pt-3"
        >
          {/* Row 1: Employee & Leave Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employee */}
            <div className="space-y-1.5">
              <Label htmlFor="employee" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Employee <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={employeeId}
                onValueChange={(val) => {
                  setEmployeeId(val)
                  clearError('employee')
                }}
              >
                <SelectTrigger
                  id="employee"
                  className="h-[44px] rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 shadow-2xs hover:border-slate-300 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400/20"
                >
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {employees.map((emp) => {
                    const fullName = `${emp.firstName} ${emp.lastName}`
                    return (
                      <SelectItem key={emp.id} value={emp.id}>
                        {fullName}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {errors.employee && (
                <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.employee}
                </p>
              )}
            </div>

            {/* Leave Type */}
            <div className="space-y-1.5">
              <Label htmlFor="leaveType" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Leave Type <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={leaveTypeName}
                onValueChange={(val) => {
                  setLeaveTypeName(val)
                  clearError('leaveType')
                }}
              >
                <SelectTrigger
                  id="leaveType"
                  className="h-[44px] rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 shadow-2xs hover:border-slate-300 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400/20"
                >
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: t.color }}
                        />
                        <span>{t.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.leaveType && (
                <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.leaveType}
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Leave Balance */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-slate-800 dark:text-slate-200">
              Leave Balance
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Available</p>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {availableDays} days
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Requested</p>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {requestedDays} {requestedDays === 1 ? 'day' : 'days'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Remaining</p>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {remainingDays} days
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Leave Schedule */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-slate-800 dark:text-slate-200">
              Leave Schedule
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* From Date */}
              <div className="space-y-1.5">
                <Label htmlFor="fromDate" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  From Date <span className="text-rose-500">*</span>
                </Label>
                <div className="relative flex items-center">
                  <Calendar className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="fromDate"
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value)
                      if (toDate && e.target.value > toDate) setToDate(e.target.value)
                      clearError('fromDate')
                    }}
                    className="w-full h-[44px] pl-10 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  {!fromDate && (
                    <span className="pointer-events-none absolute left-10 text-sm text-slate-400">
                      Start date
                    </span>
                  )}
                  <ChevronDown className="pointer-events-none absolute right-3.5 h-4 w-4 text-slate-400" />
                </div>
                {errors.fromDate && (
                  <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.fromDate}
                  </p>
                )}
              </div>

              {/* To Date */}
              <div className="space-y-1.5">
                <Label htmlFor="toDate" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  To Date <span className="text-rose-500">*</span>
                </Label>
                <div className="relative flex items-center">
                  <Calendar className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="toDate"
                    type="date"
                    min={fromDate}
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value)
                      clearError('toDate')
                    }}
                    className="w-full h-[44px] pl-10 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  {!toDate && (
                    <span className="pointer-events-none absolute left-10 text-sm text-slate-400">
                      End date
                    </span>
                  )}
                  <ChevronDown className="pointer-events-none absolute right-3.5 h-4 w-4 text-slate-400" />
                </div>
                {errors.toDate && (
                  <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.toDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Reason for Leave */}
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Reason for Leave <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                clearError('reason')
              }}
              placeholder="Describe your reason for leave..."
              className="h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 resize-none transition-all"
            />
            {errors.reason && (
              <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {errors.reason}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-[40px] px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-[40px] px-6 rounded-xl bg-[#0F172A] hover:bg-black text-white font-medium text-sm shadow-sm transition-all"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
