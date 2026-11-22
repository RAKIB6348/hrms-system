import { useState } from 'react'
import { toast } from 'sonner'
import { Download, Play } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { payrollBatches } from '@/mocks/data'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PayrollBatch } from '@/types'

const filters: TableFilter<PayrollBatch>[] = [
  { key: 'status', label: 'Status', options: ['Draft', 'Processing', 'Completed', 'Paid'], value: (r) => r.status },
]

export default function PayrollBatches() {
  const [rows, setRows] = useState(payrollBatches)

  const columns: Column<PayrollBatch>[] = [
    { key: 'name', header: 'Batch Name', cell: (b) => <span className="font-medium">{b.name}</span>, sortValue: (b) => b.name },
    { key: 'period', header: 'Period', cell: (b) => b.period, sortValue: (b) => b.period },
    { key: 'employees', header: 'Employees', cell: (b) => b.employees, sortValue: (b) => b.employees },
    { key: 'totalAmount', header: 'Total Amount', cell: (b) => formatCurrency(b.totalAmount), sortValue: (b) => b.totalAmount },
    { key: 'processedOn', header: 'Processed On', cell: (b) => formatDate(b.processedOn), sortValue: (b) => b.processedOn },
    { key: 'status', header: 'Status', cell: (b) => <StatusBadge status={b.status} /> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Batches"
        description="Process and track monthly payroll batches."
        actions={<Button onClick={() => toast.success('New payroll batch created (demo)')}><Play className="h-4 w-4" /> Create Batch</Button>}
      />
      <DemoNotice compact />
      <DataTable
        data={rows} columns={columns} filters={filters} searchPlaceholder="Search payroll batches..."
        rowActions={(b) => (
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {b.status === 'Processing' && (
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Mark as paid" onClick={() => {
                setRows((prev) => prev.map((r) => r.id === b.id ? { ...r, status: 'Paid' as const } : r))
                toast.success(`${b.name} marked as paid`)
              }}><Play className="h-4 w-4" /></Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Download" onClick={() => toast.success(`${b.name} export started (demo)`)}><Download className="h-4 w-4" /></Button>
          </div>
        )}
      />
    </div>
  )
}
