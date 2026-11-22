import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { attendanceRecords } from '@/mocks/data'
import { formatDate, initials } from '@/lib/utils'
import type { AttendanceRecord } from '@/types'

const filters: TableFilter<AttendanceRecord>[] = [
  { key: 'status', label: 'Status', options: ['Present', 'Absent', 'Late', 'Half Day', 'On Leave'], value: (r) => r.status },
  { key: 'shift', label: 'Shifts', options: ['General Shift', 'Morning Shift', 'Evening Shift', 'Weekend Shift'], value: (r) => r.shift },
]

const columns: Column<AttendanceRecord>[] = [
  {
    key: 'employee', header: 'Employee',
    cell: (r) => <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{initials(r.employee)}</span><div><p className="font-medium">{r.employee}</p><p className="text-xs text-muted-foreground">{r.department}</p></div></div>,
    sortValue: (r) => r.employee,
  },
  { key: 'date', header: 'Date', cell: (r) => formatDate(r.date), sortValue: (r) => r.date },
  { key: 'checkIn', header: 'Check In', cell: (r) => r.checkIn },
  { key: 'checkOut', header: 'Check Out', cell: (r) => r.checkOut },
  { key: 'hours', header: 'Hours', cell: (r) => `${r.hours.toFixed(1)}h`, sortValue: (r) => r.hours },
  { key: 'shift', header: 'Shift', cell: (r) => r.shift, sortValue: (r) => r.shift },
  { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
]

export default function AttendanceHistory() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance History"
        description="Browse and export historical attendance records."
        actions={<Button variant="outline" onClick={() => toast.success('Attendance export started (demo)')}><Download className="h-4 w-4" /> Export CSV</Button>}
      />
      <DemoNotice compact />
      <DataTable data={attendanceRecords} columns={columns} filters={filters} searchPlaceholder="Search by employee, date or status..." />
    </div>
  )
}
