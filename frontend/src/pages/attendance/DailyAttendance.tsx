import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCheck, RefreshCw, Save } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { attendanceRecords, employees } from '@/mocks/data'
import { formatDate, initials } from '@/lib/utils'
import type { AttendanceRecord } from '@/types'

const filters: TableFilter<AttendanceRecord>[] = [
  { key: 'status', label: 'Status', options: ['Present', 'Absent', 'Late', 'Half Day', 'On Leave'], value: (r) => r.status },
  { key: 'department', label: 'Departments', options: [...new Set(employees.map((e) => e.department))], value: (r) => r.department },
]

export default function DailyAttendance() {
  const [date, setDate] = useState('2026-11-22')
  const [shift, setShift] = useState('all')
  const [rows, setRows] = useState(attendanceRecords)

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'employee', header: 'Employee',
      cell: (r) => <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{initials(r.employee)}</span><div><p className="font-medium">{r.employee}</p><p className="text-xs text-muted-foreground">{r.department}</p></div></div>,
      sortValue: (r) => r.employee,
    },
    { key: 'checkIn', header: 'Check In', cell: (r) => r.checkIn },
    { key: 'checkOut', header: 'Check Out', cell: (r) => r.checkOut },
    { key: 'hours', header: 'Hours', cell: (r) => `${r.hours.toFixed(1)}h`, sortValue: (r) => r.hours },
    { key: 'shift', header: 'Shift', cell: (r) => <span className="text-muted-foreground">{r.shift}</span> },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Daily Attendance" description="Review and manage attendance records for a specific date." />
      <DemoNotice compact />

      <Card>
        <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-end">
          <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-48" /></div>
          <div className="space-y-1.5"><Label>Shift</Label>
            <Select value={shift} onValueChange={setShift}>
              <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All shifts</SelectItem><SelectItem value="General Shift">General Shift</SelectItem><SelectItem value="Morning Shift">Morning Shift</SelectItem><SelectItem value="Evening Shift">Evening Shift</SelectItem></SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => toast.success('Attendance data refreshed (demo)')}><RefreshCw className="h-4 w-4" /> Refresh</Button>
          <p className="ml-auto text-xs text-muted-foreground">Showing demo records · {formatDate(date)}</p>
        </CardContent>
      </Card>

      <DataTable
        data={rows} columns={columns} filters={filters} searchPlaceholder="Search attendance records..."
        toolbar={<Button size="sm" onClick={() => toast.success('Attendance saved (demo)')}><Save className="h-4 w-4" /> Save Changes</Button>}
        rowActions={(r) => (
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Mark present" onClick={() => {
            setRows((prev) => prev.map((row) => row.id === r.id ? { ...row, status: 'Present', checkIn: row.checkIn === '—' ? '09:00' : row.checkIn, checkOut: row.checkOut === '—' ? '18:00' : row.checkOut } : row))
            toast.success(`${r.employee} marked present`)
          }}><CheckCheck className="h-4 w-4" /></Button>
        )}
      />
    </div>
  )
}
