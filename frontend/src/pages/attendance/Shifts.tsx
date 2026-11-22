import { CrudPage, type FormFieldDef } from '@/components/common/CrudPage'
import { Badge } from '@/components/ui/badge'
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
  return (
    <CrudPage
      title="Shift Management"
      description="Configure work shifts, timings and flexibility rules."
      data={shifts} entityName="Shift" fields={fields} searchPlaceholder="Search shifts..."
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
  )
}
