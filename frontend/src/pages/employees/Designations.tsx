import { CrudPage, type FormFieldDef } from '@/components/common/CrudPage'
import { Badge } from '@/components/ui/badge'
import { designations, departments } from '@/mocks/data'
import type { Designation } from '@/types'

const fields: FormFieldDef[] = [
  { key: 'title', label: 'Designation Title', required: true, placeholder: 'e.g. Product Manager' },
  { key: 'department', label: 'Department', type: 'select', options: departments.map((d) => d.name), required: true },
  { key: 'level', label: 'Job Level', type: 'select', options: ['L1', 'L2', 'L3', 'L4', 'M1', 'M2'], required: true },
  { key: 'employees', label: 'Employee Count', type: 'number', required: true },
]

export default function Designations() {
  return (
    <CrudPage
      title="Designations"
      description="Define job titles, levels and their reporting structure."
      data={designations}
      entityName="Designation"
      fields={fields}
      searchPlaceholder="Search designations..."
      filters={[{ key: 'department', label: 'Departments', options: departments.map((d) => d.name), value: (r: Designation) => r.department }]}
      columns={[
        { key: 'title', header: 'Title', cell: (d) => <span className="font-medium">{d.title}</span>, sortValue: (d) => d.title },
        { key: 'department', header: 'Department', cell: (d) => d.department, sortValue: (d) => d.department },
        { key: 'level', header: 'Level', cell: (d) => <Badge variant="outline">{d.level}</Badge>, sortValue: (d) => d.level },
        { key: 'employees', header: 'Employees', cell: (d) => <Badge variant="secondary">{d.employees}</Badge>, sortValue: (d) => d.employees },
      ]}
      toValues={(d: Designation) => ({ title: d.title, department: d.department, level: d.level, employees: String(d.employees) })}
      fromValues={(v, id): Designation => ({
        id, title: v.title!, department: v.department!, level: v.level!, employees: Number(v.employees),
      })}
    />
  )
}
