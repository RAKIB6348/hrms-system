import { useMemo, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Check, Clock3, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEmployeeStore } from '@/hooks/use-employee-store'
import { useShiftStore } from '@/hooks/use-shift-store'
import { initials } from '@/lib/utils'
import type { Shift } from '@/types'

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

function toMinutes(value: string) {
  const [hours = '0', minutes = '0'] = value.split(':')
  return Number(hours) * 60 + Number(minutes)
}

export function createShiftSchema(existingCodes: string[]) {
  return z.object({
    name: z.string().min(2, 'Shift name must be at least 2 characters'),
    code: z.string().optional(),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    breakDuration: z.string().refine((v) => !v || Number(v) >= 0, 'Break duration cannot be negative'),
    workingDays: z.array(z.string()).min(1, 'Select at least one working day'),
    flexibilityType: z.enum(['Fixed', 'Flexible']),
    gracePeriod: z.string().refine((v) => !v || Number(v) >= 0, 'Grace period cannot be negative'),
    status: z.enum(['Active', 'Inactive']),
    earlyArrivalAllowance: z.string().optional(),
    lateArrivalAllowance: z.string().optional(),
    employeeIds: z.array(z.string()),
  })
    .refine((data) => !data.code || !existingCodes.includes(data.code.trim().toUpperCase()), {
      path: ['code'], message: 'This shift code already exists',
    })
    .refine((data) => {
      if (!data.startTime || !data.endTime) return true
      const start = toMinutes(data.startTime)
      const end = toMinutes(data.endTime)
      const duration = (end > start ? end - start : end + 24 * 60 - start) - Number(data.breakDuration || 0)
      return duration > 0
    }, { path: ['endTime'], message: 'Shift duration must be greater than zero (overnight shifts are supported)' })
}

export type ShiftFormValues = z.infer<ReturnType<typeof createShiftSchema>>

export interface ShiftFormSubmit {
  values: ShiftFormValues
  employeeIdsChanged: boolean
}

interface ShiftFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shift?: Shift | null
  onSubmit: (result: ShiftFormSubmit) => void
}

export function ShiftFormDialog({ open, onOpenChange, shift, onSubmit }: ShiftFormDialogProps) {
  const employees = useEmployeeStore((state) => state.employees)
  const shifts = useShiftStore((state) => state.shifts)
  const [search, setSearch] = useState('')

  const existingCodes = useMemo(
    () => shifts.filter((item) => item.id !== shift?.id && item.code).map((item) => item.code!.trim().toUpperCase()),
    [shifts, shift?.id],
  )
  const schema = useMemo(() => createShiftSchema(existingCodes), [existingCodes])

  const initialEmployeeIds = useMemo(
    () => employees.filter((employee) => shift && employee.shift === shift.name).map((employee) => employee.id),
    [employees, shift],
  )

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting, dirtyFields } } = useForm<ShiftFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: shift?.name ?? '',
      code: shift?.code ?? '',
      startTime: shift?.startTime ?? '09:00',
      endTime: shift?.endTime ?? '18:00',
      breakDuration: String(shift?.breakDuration ?? 0),
      workingDays: shift?.workingDays ?? [...WEEK_DAYS.slice(0, 5)],
      flexibilityType: shift?.flexibilityType ?? (shift?.flexibility === 'Fixed' ? 'Fixed' : 'Flexible'),
      gracePeriod: String(shift?.gracePeriod ?? 0),
      status: shift?.status ?? 'Active',
      earlyArrivalAllowance: String(shift?.earlyArrivalAllowance ?? 0),
      lateArrivalAllowance: String(shift?.lateArrivalAllowance ?? 0),
      employeeIds: initialEmployeeIds,
    },
  })

  const workingDays = watch('workingDays') ?? []
  const flexibilityType = watch('flexibilityType')
  const employeeIds = watch('employeeIds') ?? []
  const selectedEmployees = employees.filter((employee) => employeeIds.includes(employee.id))
  const filteredEmployees = employees.filter((employee) => {
    const term = search.trim().toLowerCase()
    return !term || `${employee.firstName} ${employee.lastName} ${employee.employeeId}`.toLowerCase().includes(term)
  })

  const toggleDay = (day: string) => {
    setValue('workingDays', workingDays.includes(day) ? workingDays.filter((item) => item !== day) : [...workingDays, day], { shouldValidate: true })
  }

  const toggleEmployee = (id: string) => {
    if (employeeIds.includes(id)) {
      setValue('employeeIds', employeeIds.filter((item) => item !== id), { shouldValidate: true, shouldDirty: true })
    } else {
      setValue('employeeIds', [...employeeIds, id], { shouldValidate: true, shouldDirty: true })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[720px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <DialogHeader className="space-y-1 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/50 dark:text-indigo-400">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">{shift ? 'Edit Shift' : 'Add Shift'}</DialogTitle>
              <DialogDescription className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Configure timings, working days and assigned employees.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => onSubmit({ values, employeeIdsChanged: Boolean(dirtyFields.employeeIds) }))} className="space-y-5 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Shift Name" error={errors.name?.message} required><Input {...register('name')} className="h-[42px]" /></FormField>
            <FormField label="Shift Code" error={errors.code?.message}><Input {...register('code')} placeholder="e.g. GEN" className="h-[42px]" /></FormField>
            <FormField label="Start Time" error={errors.startTime?.message} required><Input type="time" {...register('startTime')} className="h-[42px]" /></FormField>
            <FormField label="End Time" error={errors.endTime?.message} required><Input type="time" {...register('endTime')} className="h-[42px]" /></FormField>
            <FormField label="Break Duration (minutes)" error={errors.breakDuration?.message}><Input type="number" min="0" {...register('breakDuration')} className="h-[42px]" /></FormField>
            <FormField label="Grace Period (minutes)" error={errors.gracePeriod?.message}><Input type="number" min="0" {...register('gracePeriod')} className="h-[42px]" /></FormField>
          </div>

          <FormField label="Working Days" error={errors.workingDays?.message} required>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => {
                const active = workingDays.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`h-9 min-w-11 rounded-lg border px-3 text-sm font-medium transition-colors ${active ? 'border-[#4F46E5] bg-[#4F46E5] text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Flexibility Type" required>
              <Select value={flexibilityType} onValueChange={(value) => setValue('flexibilityType', value as 'Fixed' | 'Flexible')}>
                <SelectTrigger className="h-[42px]"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Fixed">Fixed</SelectItem><SelectItem value="Flexible">Flexible</SelectItem></SelectContent>
              </Select>
            </FormField>
            <FormField label="Shift Status">
              <Select value={watch('status')} onValueChange={(value) => setValue('status', value as 'Active' | 'Inactive')}>
                <SelectTrigger className="h-[42px]"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </FormField>
            {flexibilityType === 'Flexible' && (
              <>
                <FormField label="Early Arrival Allowance (minutes)"><Input type="number" min="0" {...register('earlyArrivalAllowance')} className="h-[42px]" /></FormField>
                <FormField label="Late Arrival Allowance (minutes)"><Input type="number" min="0" {...register('lateArrivalAllowance')} className="h-[42px]" /></FormField>
              </>
            )}
          </div>

          <FormField label="Assigned Employees">
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" role="combobox" className="h-[42px] w-full justify-between font-normal">
                  <span>{selectedEmployees.length} employee{selectedEmployees.length === 1 ? '' : 's'} selected</span>
                  <Search className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[380px] max-w-[90vw] p-2">
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or employee ID..." className="mb-2 h-[38px]" />
                <div className="scrollbar-thin max-h-52 overflow-y-auto">
                  {filteredEmployees.map((employee) => {
                    const active = employeeIds.includes(employee.id)
                    return (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() => toggleEmployee(employee.id)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Avatar className="h-8 w-8"><AvatarFallback>{initials(`${employee.firstName} ${employee.lastName}`)}</AvatarFallback></Avatar>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{employee.firstName} {employee.lastName}</span>
                          <span className="block truncate text-xs text-slate-500">{employee.employeeId} · {employee.designation}</span>
                        </span>
                        {active && <Check className="h-4 w-4 text-[#4F46E5]" />}
                      </button>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedEmployees.map((employee) => (
                <Badge key={employee.id} variant="secondary" className="gap-1 pr-1.5">
                  {employee.firstName} {employee.lastName}
                  <button type="button" aria-label={`Remove ${employee.firstName}`} onClick={() => toggleEmployee(employee.id)} className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">Assigned employees are counted automatically from this selection.</p>
          </FormField>

          <DialogFooter className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#4F46E5] hover:bg-[#4338CA] text-white">
              {shift ? 'Save Changes' : 'Create Shift'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FormField({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">{label}{required && <span className="ml-1 text-rose-500">*</span>}</Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
