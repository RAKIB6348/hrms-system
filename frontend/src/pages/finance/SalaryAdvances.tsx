import { useState } from 'react'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { advances } from '@/mocks/data'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Advance } from '@/types'

const filters: TableFilter<Advance>[] = [
  { key: 'status', label: 'Status', options: ['Pending', 'Approved', 'Rejected', 'Recovered'], value: (r) => r.status },
]

const columns: Column<Advance>[] = [
  { key: 'employee', header: 'Employee', cell: (a) => <span className="font-medium">{a.employee}</span>, sortValue: (a) => a.employee },
  { key: 'amount', header: 'Amount', cell: (a) => formatCurrency(a.amount), sortValue: (a) => a.amount },
  { key: 'reason', header: 'Reason', cell: (a) => <span className="text-muted-foreground">{a.reason}</span> },
  { key: 'requestDate', header: 'Requested', cell: (a) => formatDate(a.requestDate), sortValue: (a) => a.requestDate },
  { key: 'recoveryMonths', header: 'Recovery', cell: (a) => `${a.recoveryMonths} months`, sortValue: (a) => a.recoveryMonths },
  { key: 'status', header: 'Status', cell: (a) => <StatusBadge status={a.status} /> },
]

export default function SalaryAdvances() {
  const [rows, setRows] = useState(advances)

  const update = (id: string, status: 'Approved' | 'Rejected') => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
    toast.success(`Advance request ${status.toLowerCase()}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Salary Advances" description="Review and approve employee salary advance requests." />
      <DemoNotice compact />
      <DataTable
        data={rows} columns={columns} filters={filters} searchPlaceholder="Search advances..."
        rowActions={(a) => a.status === 'Pending' ? (
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" title="Approve" onClick={() => update(a.id, 'Approved')}><Check className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Reject" onClick={() => update(a.id, 'Rejected')}><X className="h-4 w-4" /></Button>
          </div>
        ) : undefined}
      />
    </div>
  )
}
