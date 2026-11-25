import { useState } from 'react'
import { toast } from 'sonner'
import {
  CalendarDays,
  Clock3,
  Eye,
  Moon,
  Pencil,
  Settings2,
  SlidersHorizontal,
  Sun,
  Trash2,
  Users,
} from 'lucide-react'
import { CrudPage, type FormFieldDef } from '@/components/common/CrudPage'
import { ActionIconButton } from '@/components/common/ActionIconButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { shifts } from '@/mocks/data'
import type { Shift } from '@/types'

const fields: FormFieldDef[] = [
  {
    key: 'name',
    label: 'Shift Name',
    required: true,
    placeholder: 'e.g. Regular Day Shift, Night Shift',
    colSpan: 2,
    icon: Clock3,
  },
  {
    key: 'startTime',
    label: 'Start Time',
    type: 'time',
    required: true,
    placeholder: 'Select start time',
    colSpan: 1,
    icon: Sun,
  },
  {
    key: 'endTime',
    label: 'End Time',
    type: 'time',
    required: true,
    placeholder: 'Select end time',
    colSpan: 1,
    icon: Moon,
  },
  {
    key: 'days',
    label: 'Working Days',
    required: true,
    placeholder: 'e.g. Mon – Fri',
    colSpan: 1,
    icon: CalendarDays,
  },
  {
    key: 'employees',
    label: 'Assigned Employees',
    type: 'number',
    required: true,
    placeholder: '0',
    colSpan: 1,
    icon: Users,
  },
  {
    key: 'flexibility',
    label: 'Flexibility Rule',
    type: 'select',
    options: ['Fixed', 'Flexible ±1h', 'Flexible ±2h'],
    required: true,
    colSpan: 2,
    icon: SlidersHorizontal,
  },
]

export default function Shifts() {
  const [viewing, setViewing] = useState<Shift | null>(null)

  return (
    <>
      <CrudPage
        title="Shift Management"
        description="Configure work shifts, timings and flexibility rules."
        data={shifts}
        entityName="Shift"
        entityIcon={Clock3}
        fields={fields}
        searchPlaceholder="Search shifts..."
        actionsHeaderClassName="w-[132px] text-right"
        actionsHeaderLabel="Actions"
        onView={(shift) => setViewing(shift)}
        renderRowActions={(shift, handlers) => {
          const hasEmployees = shift.employees > 0
          return (
            <div className="flex items-center justify-end gap-1.5">
              <ActionIconButton
                variant="view"
                icon={Eye}
                label={`View ${shift.name}`}
                tooltip="View shift details"
                onClick={handlers.onView}
              />
              <ActionIconButton
                variant="edit"
                icon={Pencil}
                label={`Edit ${shift.name}`}
                tooltip="Edit shift"
                onClick={handlers.onEdit}
              />
              <ActionIconButton
                variant="delete"
                icon={Trash2}
                label={`Delete ${shift.name}`}
                tooltip={
                  hasEmployees
                    ? `Cannot delete: ${shift.employees} employees assigned`
                    : 'Delete shift'
                }
                ariaDisabled={hasEmployees}
                onClick={() => {
                  if (hasEmployees) {
                    toast.warning(
                      `${shift.name} has ${shift.employees} assigned employees — deletion is not allowed`,
                    )
                    return
                  }
                  handlers.onDelete()
                }}
              />
            </div>
          )
        }}
        columns={[
          {
            key: 'name',
            header: 'Shift Name',
            cell: (s) => <span className="font-medium text-[#0F172A] dark:text-slate-100">{s.name}</span>,
            sortValue: (s) => s.name,
          },
          {
            key: 'timing',
            header: 'Timing',
            cell: (s) => (
              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                {s.startTime} – {s.endTime}
              </span>
            ),
          },
          { key: 'days', header: 'Days', cell: (s) => s.days },
          {
            key: 'employees',
            header: 'Employees',
            cell: (s) => (
              <Badge variant="secondary" className="font-semibold">
                {s.employees}
              </Badge>
            ),
            sortValue: (s) => s.employees,
          },
          {
            key: 'flexibility',
            header: 'Flexibility',
            cell: (s) => <Badge variant="outline">{s.flexibility}</Badge>,
          },
        ]}
        toValues={(s: Shift) => ({
          name: s.name,
          startTime: s.startTime,
          endTime: s.endTime,
          days: s.days,
          employees: String(s.employees),
          flexibility: s.flexibility,
        })}
        fromValues={(v, id): Shift => ({
          id,
          name: v.name!,
          startTime: v.startTime!,
          endTime: v.endTime!,
          days: v.days!,
          employees: Number(v.employees),
          flexibility: v.flexibility!,
        })}
      />

      {/* View Shift Modal */}
      <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#4F46E5] ring-1 ring-indigo-500/10 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
                  {viewing?.name}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
                  Shift schedule & flexibility rules
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {viewing && (
            <div className="grid gap-3 py-3 sm:grid-cols-2">
              <Detail icon={Sun} label="Start Time" value={viewing.startTime} />
              <Detail icon={Moon} label="End Time" value={viewing.endTime} />
              <Detail icon={CalendarDays} label="Working Days" value={viewing.days} />
              <Detail icon={Settings2} label="Flexibility" value={viewing.flexibility} />
              <div className="sm:col-span-2">
                <Detail
                  icon={Users}
                  label="Assigned Employees"
                  value={`${viewing.employees} active team members`}
                />
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewing(null)}
              className="h-[42px] px-5 rounded-lg text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#4F46E5] ring-1 ring-indigo-500/10 dark:bg-indigo-950/50 dark:text-indigo-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </div>
  )
}
