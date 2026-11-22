import { CrudPage, type FormFieldDef } from '@/components/common/CrudPage'
import { designations, salaryStructures } from '@/mocks/data'
import { formatCurrency } from '@/lib/utils'
import type { SalaryStructure } from '@/types'

const fields: FormFieldDef[] = [
  { key: 'designation', label: 'Designation', type: 'select', options: designations.map((d) => d.title), required: true },
  { key: 'department', label: 'Department', type: 'select', options: [...new Set(designations.map((d) => d.department))], required: true },
  { key: 'basic', label: 'Basic Salary', type: 'number', required: true },
  { key: 'hra', label: 'House Rent Allowance', type: 'number', required: true },
  { key: 'allowances', label: 'Other Allowances', type: 'number', required: true },
  { key: 'bonus', label: 'Bonus / Performance Pay', type: 'number', required: true },
]

export default function SalaryStructure() {
  return (
    <CrudPage
      title="Salary Structure"
      description="Define compensation components for each designation."
      data={salaryStructures}
      entityName="Salary Component"
      fields={fields}
      searchPlaceholder="Search salary structures..."
      columns={[
        { key: 'designation', header: 'Designation', cell: (s) => <span className="font-medium">{s.designation}</span>, sortValue: (s) => s.designation },
        { key: 'department', header: 'Department', cell: (s) => s.department, sortValue: (s) => s.department },
        { key: 'basic', header: 'Basic', cell: (s) => formatCurrency(s.basic), sortValue: (s) => s.basic },
        { key: 'hra', header: 'HRA', cell: (s) => formatCurrency(s.hra), sortValue: (s) => s.hra },
        { key: 'allowances', header: 'Allowances', cell: (s) => formatCurrency(s.allowances), sortValue: (s) => s.allowances },
        { key: 'bonus', header: 'Bonus', cell: (s) => formatCurrency(s.bonus), sortValue: (s) => s.bonus },
        { key: 'total', header: 'Total / Month', cell: (s) => <span className="font-semibold text-primary">{formatCurrency(s.total)}</span>, sortValue: (s) => s.total },
      ]}
      toValues={(s: SalaryStructure) => ({ designation: s.designation, department: s.department, basic: String(s.basic), hra: String(s.hra), allowances: String(s.allowances), bonus: String(s.bonus) })}
      fromValues={(v, id): SalaryStructure => {
        const basic = Number(v.basic), hra = Number(v.hra), allowances = Number(v.allowances), bonus = Number(v.bonus)
        return { id, designation: v.designation!, department: v.department!, basic, hra, allowances, bonus, total: basic + hra + allowances + bonus }
      }}
    />
  )
}
