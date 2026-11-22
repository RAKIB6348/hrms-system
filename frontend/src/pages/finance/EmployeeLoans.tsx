import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { loans } from '@/mocks/data'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Loan } from '@/types'

const filters: TableFilter<Loan>[] = [
  { key: 'status', label: 'Status', options: ['Active', 'Completed', 'Pending'], value: (r) => r.status },
  { key: 'type', label: 'Types', options: [...new Set(loans.map((l) => l.type))], value: (r) => r.type },
]

const columns: Column<Loan>[] = [
  { key: 'employee', header: 'Employee', cell: (l) => <span className="font-medium">{l.employee}</span>, sortValue: (l) => l.employee },
  { key: 'type', header: 'Loan Type', cell: (l) => l.type, sortValue: (l) => l.type },
  { key: 'amount', header: 'Amount', cell: (l) => formatCurrency(l.amount), sortValue: (l) => l.amount },
  { key: 'outstanding', header: 'Outstanding', cell: (l) => <div className="w-32 space-y-1"><span className="text-xs font-medium">{formatCurrency(l.outstanding)}</span><Progress value={((l.amount - l.outstanding) / l.amount) * 100} className="h-1.5" /></div>, sortValue: (l) => l.outstanding },
  { key: 'emi', header: 'Monthly EMI', cell: (l) => formatCurrency(l.emi), sortValue: (l) => l.emi },
  { key: 'endDate', header: 'End Date', cell: (l) => formatDate(l.endDate, { month: 'short', year: 'numeric' }), sortValue: (l) => l.endDate },
  { key: 'status', header: 'Status', cell: (l) => <StatusBadge status={l.status} /> },
]

export default function EmployeeLoans() {
  return (
    <div className="space-y-6">
      <PageHeader title="Employee Loans" description="Track loans, EMIs and outstanding balances." />
      <DemoNotice compact />
      <DataTable data={loans} columns={columns} filters={filters} searchPlaceholder="Search loans..." />
    </div>
  )
}
