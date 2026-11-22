import { CrudPage, type FormFieldDef } from '@/components/common/CrudPage'
import { Badge } from '@/components/ui/badge'
import { departments } from '@/mocks/data'
import { formatCurrency } from '@/lib/utils'
import type { Department } from '@/types'

const fields: FormFieldDef[] = [
  { key: 'name', label: 'Department Name', required: true, placeholder: 'e.g. Research' },
  { key: 'head', label: 'Department Head', required: true, placeholder: 'Full name' },
  { key: 'employees', label: 'Employee Count', type: 'number', required: true },
  { key: 'budget', label: 'Annual Budget', type: 'number', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
]

export default function Departments() {
  return (
    <CrudPage
      title="Departments"
      description="Organize employees into departments and manage department heads."
      data={departments}
      entityName="Department"
      fields={fields}
      searchPlaceholder="Search departments..."
      columns={[
        { key: 'name', header: 'Department', cell: (d) => <span className="font-medium">{d.name}</span>, sortValue: (d) => d.name },
        { key: 'head', header: 'Head', cell: (d) => d.head, sortValue: (d) => d.head },
        { key: 'employees', header: 'Employees', cell: (d) => <Badge variant="secondary">{d.employees}</Badge>, sortValue: (d) => d.employees },
        { key: 'budget', header: 'Annual Budget', cell: (d) => formatCurrency(d.budget), sortValue: (d) => d.budget },
        { key: 'description', header: 'Description', cell: (d) => <span className="line-clamp-1 text-muted-foreground">{d.description}</span> },
      ]}
      toValues={(d: Department) => ({ name: d.name, head: d.head, employees: String(d.employees), budget: String(d.budget), description: d.description })}
      fromValues={(v, id): Department => ({
        id, name: v.name!, head: v.head!, employees: Number(v.employees), budget: Number(v.budget),
        description: v.description ?? '',
      })}
    />
  )
}
