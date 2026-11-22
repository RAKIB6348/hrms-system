import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Plus, X } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { leaveRequests } from '@/mocks/data'
import { formatDate, initials } from '@/lib/utils'
import type { LeaveRequest } from '@/types'

const filters: TableFilter<LeaveRequest>[] = [
  { key: 'status', label: 'Status', options: ['Pending', 'Approved', 'Rejected', 'Cancelled'], value: (r) => r.status },
  { key: 'leaveType', label: 'Leave Types', options: [...new Set(leaveRequests.map((r) => r.leaveType))], value: (r) => r.leaveType },
]

const columns: Column<LeaveRequest>[] = [
  {
    key: 'employee', header: 'Employee',
    cell: (r) => <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{initials(r.employee)}</span><div><p className="font-medium">{r.employee}</p><p className="text-xs text-muted-foreground">{r.department}</p></div></div>,
    sortValue: (r) => r.employee,
  },
  { key: 'leaveType', header: 'Leave Type', cell: (r) => r.leaveType, sortValue: (r) => r.leaveType },
  { key: 'startDate', header: 'From', cell: (r) => formatDate(r.startDate, { month: 'short', day: 'numeric' }), sortValue: (r) => r.startDate },
  { key: 'endDate', header: 'To', cell: (r) => formatDate(r.endDate, { month: 'short', day: 'numeric' }), sortValue: (r) => r.endDate },
  { key: 'days', header: 'Days', cell: (r) => r.days, sortValue: (r) => r.days },
  { key: 'appliedOn', header: 'Applied', cell: (r) => formatDate(r.appliedOn, { month: 'short', day: 'numeric' }), sortValue: (r) => r.appliedOn },
  { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
]

export default function LeaveRequests() {
  const [rows, setRows] = useState(leaveRequests)

  const update = (id: string, status: 'Approved' | 'Rejected') => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
    const employee = rows.find((r) => r.id === id)?.employee
    toast.success(`Leave request ${status.toLowerCase()} for ${employee}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Requests"
        description="Review, approve or reject employee leave requests."
        actions={<Button onClick={() => toast.info('New leave request form (demo)')}><Plus className="h-4 w-4" /> New Request</Button>}
      />
      <DemoNotice compact />
      <DataTable
        data={rows} columns={columns} filters={filters} searchPlaceholder="Search leave requests..."
        toolbar={<span className="text-xs text-muted-foreground">{rows.filter((r) => r.status === 'Pending').length} pending</span>}
        rowActions={(r) => r.status === 'Pending' ? (
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" title="Approve" onClick={() => update(r.id, 'Approved')}><Check className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Reject" onClick={() => update(r.id, 'Rejected')}><X className="h-4 w-4" /></Button>
          </div>
        ) : undefined}
      />
    </div>
  )
}
