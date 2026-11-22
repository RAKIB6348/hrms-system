import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Plus, X } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
        rowActions={(r) => (
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {(r.status === 'Pending' || r.status === 'Approved') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-md bg-[#15803D] text-white transition-colors duration-150 ${r.status === 'Pending' ? 'hover:bg-[#166534]' : 'cursor-default opacity-70'}`}
                    aria-label={r.status === 'Pending' ? 'Approve leave request' : 'Approved'}
                    aria-disabled={r.status !== 'Pending'}
                    onClick={r.status === 'Pending' ? () => update(r.id, 'Approved') : undefined}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{r.status === 'Pending' ? 'Approve' : 'Approved'}</TooltipContent>
              </Tooltip>
            )}
            {(r.status === 'Pending' || r.status === 'Rejected') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-md bg-[#B91C1C] text-white transition-colors duration-150 ${r.status === 'Pending' ? 'hover:bg-[#991B1B]' : 'cursor-default opacity-70'}`}
                    aria-label={r.status === 'Pending' ? 'Reject leave request' : 'Rejected'}
                    aria-disabled={r.status !== 'Pending'}
                    onClick={r.status === 'Pending' ? () => update(r.id, 'Rejected') : undefined}
                  >
                    <X className="h-4 w-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{r.status === 'Pending' ? 'Reject' : 'Rejected'}</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      />
    </div>
  )
}
