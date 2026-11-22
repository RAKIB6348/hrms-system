import { useState } from 'react'
import { toast } from 'sonner'
import { CalendarDays, Clock3, Eye, Pencil, Settings2, Trash2, Users } from 'lucide-react'
import { CrudPage, type FormFieldDef } from '@/components/common/CrudPage'
import { ActionIconButton } from '@/components/common/ActionIconButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { shifts } from '@/mocks/data'
import type { Shift } from '@/types'

const fields: FormFieldDef[] = [
  { key: 'name', label: 'Shift Name', required: true, placeholder: 'e.g. Night Shift' },
  { key: 'startTime', label: 'Start Time', type: 'text', required: true, placeholder: '09:00' },
  { key: 'endTime', label: 'End Time', type: 'text', required: true, placeholder: '18:00' },
  { key: 'days', label: 'Working Days', required: true, placeholder: 'Mon – Fri' },
  { key: 'employees', label: 'Assigned Employees', type: 'number', required: true },
  { key: 'flexibility', label: 'Flexibility', type: 'select', options: ['Fixed', 'Flexible ±1h', 'Flexible ±2h'], required: true },
]

export default function Shifts() {
  const [viewing, setViewing] = useState<Shift | null>(null)

  return (
    <>
      <CrudPage
        title="Shift Management"
        description="Configure work shifts, timings and flexibility rules."
        data={shifts} entityName="Shift" fields={fields} searchPlaceholder="Search shifts..."
        actionsHeaderClassName="w-[132px] text-right"
        actionsHeaderLabel="Actions"
        onView={(shift) => setViewing(shift)}
        renderRowActions={(shift, handlers) => {
          const hasEmployees = shift.employees > 0
          return (
            <div className="flex items-center justify-end gap-1.5">
              <ActionIconButton variant="view" icon={Eye} label={`View ${shift.name}`} tooltip="View shift details" onClick={handlers.onView} />
              <ActionIconButton variant="edit" icon={Pencil} label={`Edit ${shift.name}`} tooltip="Edit shift" onClick={handlers.onEdit} />
              <ActionIconButton
                variant="delete"
                icon={Trash2}
                label={`Delete ${shift.name}`}
                tooltip={hasEmployees ? `Cannot delete: ${shift.employees} employees assigned` : 'Delete shift'}
                ariaDisabled={hasEmployees}
                onClick={() => {
                  if (hasEmployees) {
                    toast.warning(`${shift.name} has ${shift.employees} assigned employees — deletion is not allowed`)
                    return
                  }
                  handlers.onDelete()
                }}
              />
            </div>
          )
        }}
        columns={[
          { key: 'name', header: 'Shift Name', cell: (s) => <span className="font-medium">{s.name}</span>, sortValue: (s) => s.name },
          { key: 'timing', header: 'Timing', cell: (s) => `${s.startTime} – ${s.endTime}` },
          { key: 'days', header: 'Days', cell: (s) => s.days },
          { key: 'employees', header: 'Employees', cell: (s) => <Badge variant="secondary">{s.employees}</Badge>, sortValue: (s) => s.employees },
          { key: 'flexibility', header: 'Flexibility', cell: (s) => <Badge variant="outline">{s.flexibility}</Badge> },
        ]}
        toValues={(s: Shift) => ({ name: s.name, startTime: s.startTime, endTime: s.endTime, days: s.days, employees: String(s.employees), flexibility: s.flexibility })}
        fromValues={(v, id): Shift => ({ id, name: v.name!, startTime: v.startTime!, endTime: v.endTime!, days: v.days!, employees: Number(v.employees), flexibility: v.flexibility! })}
      />

      <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>Shift details · demonstration data</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail icon={Clock3} label="Start Time" value={viewing.startTime} />
              <Detail icon={Clock3} label="End Time" value={viewing.endTime} />
              <Detail icon={CalendarDays} label="Working Days" value={viewing.days} />
              <Detail icon={Settings2} label="Flexibility" value={viewing.flexibility} />
              <Detail icon={Users} label="Assigned Employees" value={`${viewing.employees}`} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Detail({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate font-semibold">{value}</p></div>
    </div>
  )
}
