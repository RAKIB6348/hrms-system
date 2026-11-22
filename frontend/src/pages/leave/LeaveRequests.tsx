import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Plus, X } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { LeaveRequestFormDialog } from '@/features/leave/LeaveRequestFormDialog'
import { useLeaveStore } from '@/hooks/use-leave-store'
import { employees, leaveRequests, leaveTypes } from '@/mocks/data'
import { formatDate, initials } from '@/lib/utils'
import type { LeaveRequest } from '@/types'

const filters: TableFilter<LeaveRequest>[] = [
  {
    key: 'status',
    label: 'Status',
    options: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    value: (r) => r.status,
  },
  {
    key: 'leaveType',
    label: 'Leave Types',
    options: [...new Set(leaveRequests.map((r) => r.leaveType))],
    value: (r) => r.leaveType,
  },
]

const columns: Column<LeaveRequest>[] = [
  {
    key: 'employee',
    header: 'Employee',
    cell: (r) => {
      const emp = employees.find((e) => `${e.firstName} ${e.lastName}` === r.employee)
      return (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 ring-1 ring-black/5 dark:ring-white/10 shadow-2xs">
            <AvatarFallback
              style={{ backgroundColor: emp?.avatarColor ?? '#4F46E5', color: '#fff' }}
              className="text-[11px] font-bold"
            >
              {initials(r.employee)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-[#0F172A] dark:text-slate-100">{r.employee}</p>
            <p className="text-xs text-muted-foreground">{r.department}</p>
          </div>
        </div>
      )
    },
    sortValue: (r) => r.employee,
  },
  {
    key: 'leaveType',
    header: 'Leave Type',
    cell: (r) => {
      const type = leaveTypes.find((t) => t.name === r.leaveType)
      return (
        <span className="flex items-center gap-2 font-medium">
          {type?.color && (
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: type.color }}
            />
          )}
          {r.leaveType}
        </span>
      )
    },
    sortValue: (r) => r.leaveType,
  },
  {
    key: 'startDate',
    header: 'From',
    cell: (r) => formatDate(r.startDate, { month: 'short', day: 'numeric' }),
    sortValue: (r) => r.startDate,
  },
  {
    key: 'endDate',
    header: 'To',
    cell: (r) => formatDate(r.endDate, { month: 'short', day: 'numeric' }),
    sortValue: (r) => r.endDate,
  },
  { key: 'days', header: 'Days', cell: (r) => r.days, sortValue: (r) => r.days },
  {
    key: 'appliedOn',
    header: 'Applied',
    cell: (r) => formatDate(r.appliedOn, { month: 'short', day: 'numeric' }),
    sortValue: (r) => r.appliedOn,
  },
  { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
]

export default function LeaveRequests() {
  const rows = useLeaveStore((state) => state.requests)
  const updateStatus = useLeaveStore((state) => state.updateStatus)
  const [createOpen, setCreateOpen] = useState(false)

  const update = (id: string, status: 'Approved' | 'Rejected') => {
    updateStatus(id, status)
    const employee = rows.find((r) => r.id === id)?.employee
    toast.success(`Leave request ${status.toLowerCase()} for ${employee}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Requests"
        description="Review, approve or reject employee leave requests."
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-[42px] px-5 rounded-lg text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/25 transition-all"
          >
            <Plus className="h-4 w-4 mr-1.5" /> New Request
          </Button>
        }
      />
      <DemoNotice compact />
      <DataTable
        data={rows}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search leave requests..."
        toolbar={
          <span className="text-xs text-muted-foreground font-medium">
            {rows.filter((r) => r.status === 'Pending').length} pending
          </span>
        }
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
      <LeaveRequestFormDialog key={createOpen ? 'new-request' : 'closed'} open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
