import { CrudPage, type FormFieldDef } from '@/components/common/CrudPage'
import { Badge } from '@/components/ui/badge'
import { leaveTypes } from '@/mocks/data'
import type { LeaveType } from '@/types'

const fields: FormFieldDef[] = [
  { key: 'name', label: 'Leave Name', required: true, placeholder: 'e.g. Casual Leave' },
  { key: 'code', label: 'Code', required: true, placeholder: 'CL' },
  { key: 'annualAllowance', label: 'Annual Allowance (days)', type: 'number', required: true },
  { key: 'carryForward', label: 'Carry Forward', type: 'select', options: ['Yes', 'No'], required: true },
  { key: 'color', label: 'Color (hex)', required: true, placeholder: '#6366f1' },
  { key: 'description', label: 'Description', type: 'textarea' },
]

export default function LeaveTypes() {
  return (
    <CrudPage
      title="Leave Types"
      description="Configure leave categories, allowances and carry-forward rules."
      data={leaveTypes} entityName="Leave Type" fields={fields} searchPlaceholder="Search leave types..."
      columns={[
        { key: 'name', header: 'Leave Type', cell: (l) => <span className="flex items-center gap-2 font-medium"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />{l.name}</span>, sortValue: (l) => l.name },
        { key: 'code', header: 'Code', cell: (l) => <Badge variant="outline">{l.code}</Badge> },
        { key: 'annualAllowance', header: 'Allowance', cell: (l) => `${l.annualAllowance} days`, sortValue: (l) => l.annualAllowance },
        { key: 'carryForward', header: 'Carry Forward', cell: (l) => l.carryForward ? 'Yes' : 'No' },
        { key: 'description', header: 'Description', cell: (l) => <span className="line-clamp-1 text-muted-foreground">{l.description}</span> },
      ]}
      toValues={(l: LeaveType) => ({ name: l.name, code: l.code, annualAllowance: String(l.annualAllowance), carryForward: l.carryForward ? 'Yes' : 'No', color: l.color, description: l.description })}
      fromValues={(v, id): LeaveType => ({ id, name: v.name!, code: v.code!, annualAllowance: Number(v.annualAllowance), carryForward: v.carryForward === 'Yes', color: v.color!, description: v.description ?? '' })}
    />
  )
}
