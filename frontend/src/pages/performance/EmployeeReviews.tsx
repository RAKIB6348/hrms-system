import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Star } from 'lucide-react'
import { performanceReviews } from '@/mocks/data'
import { initials } from '@/lib/utils'
import type { PerformanceReview } from '@/types'

const filters: TableFilter<PerformanceReview>[] = [
  { key: 'status', label: 'Status', options: ['Completed', 'In Progress', 'Pending'], value: (r) => r.status },
  { key: 'period', label: 'Periods', options: [...new Set(performanceReviews.map((r) => r.period))], value: (r) => r.period },
]

const columns: Column<PerformanceReview>[] = [
  {
    key: 'employee', header: 'Employee',
    cell: (r) => <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{initials(r.employee)}</span><span className="font-medium">{r.employee}</span></div>,
    sortValue: (r) => r.employee,
  },
  { key: 'reviewer', header: 'Reviewer', cell: (r) => <span className="text-muted-foreground">{r.reviewer}</span> },
  { key: 'period', header: 'Period', cell: (r) => r.period, sortValue: (r) => r.period },
  { key: 'rating', header: 'Rating', cell: (r) => <span className="flex items-center gap-1 font-semibold"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{r.rating.toFixed(1)}</span>, sortValue: (r) => r.rating },
  { key: 'goals', header: 'Goals Achieved', cell: (r) => `${r.achieved} / ${r.goals}`, sortValue: (r) => r.achieved },
  { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
]

export default function EmployeeReviews() {
  return (
    <div className="space-y-6">
      <PageHeader title="Employee Reviews" description="Review performance evaluations and ratings." />
      <DemoNotice compact />
      <DataTable data={performanceReviews} columns={columns} filters={filters} searchPlaceholder="Search reviews..." />
    </div>
  )
}
