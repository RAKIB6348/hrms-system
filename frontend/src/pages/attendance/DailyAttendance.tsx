import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  CheckCheck,
  RefreshCw,
  Save,
  Clock3,
  Clock,
  CheckCircle2,
  UserMinus,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  MoreHorizontal,
  Download,
  Users,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { attendanceRecords, employees, shifts } from '@/mocks/data'
import { formatDate, initials } from '@/lib/utils'
import type { AttendanceRecord, AttendanceStatus } from '@/types'

const allStatuses: AttendanceStatus[] = ['Present', 'Late', 'Half Day', 'On Leave', 'Absent']

export default function DailyAttendance() {
  const [date, setDate] = useState('2026-11-22')
  const [shiftFilter, setShiftFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [rows, setRows] = useState<AttendanceRecord[]>(attendanceRecords)

  // Dialog State (Edit / Record Attendance)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)
  const [formState, setFormState] = useState({
    employee: '',
    department: '',
    shift: 'General Shift',
    status: 'Present' as AttendanceStatus,
    checkIn: '08:45',
    checkOut: '17:20',
    hours: 8.0,
    notes: '',
  })

  // Date Navigation (Previous / Next Day)
  const navigateDay = (offset: number) => {
    const current = new Date(date)
    current.setDate(current.getDate() + offset)
    const newDateStr = current.toISOString().split('T')[0]!
    setDate(newDateStr)
    toast.info(`Loaded records for ${formatDate(newDateStr)}`)
  }

  // Quick Status Filter
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchesShift = shiftFilter === 'all' || r.shift === shiftFilter
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      return matchesShift && matchesStatus
    })
  }, [rows, shiftFilter, statusFilter])

  // Top KPI Metrics
  const totalEmployees = rows.length
  const presentCount = rows.filter((r) => r.status === 'Present').length
  const lateCount = rows.filter((r) => r.status === 'Late').length
  const halfDayCount = rows.filter((r) => r.status === 'Half Day').length
  const onLeaveCount = rows.filter((r) => r.status === 'On Leave').length
  const absentCount = rows.filter((r) => r.status === 'Absent').length
  const attendanceRate = totalEmployees > 0 ? Math.round(((presentCount + lateCount) / totalEmployees) * 100) : 0

  // Open Edit Dialog for existing record
  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record)
    setFormState({
      employee: record.employee,
      department: record.department,
      shift: record.shift,
      status: record.status,
      checkIn: record.checkIn === '—' ? '09:00' : record.checkIn,
      checkOut: record.checkOut === '—' ? '18:00' : record.checkOut,
      hours: record.hours,
      notes: record.status === 'Late' ? 'Traffic delay reported' : record.status === 'On Leave' ? 'Approved casual leave' : '',
    })
    setIsDialogOpen(true)
  }

  // Open New Record Dialog
  const handleNewRecord = () => {
    setEditingRecord(null)
    const defaultEmp = employees[0]!
    setFormState({
      employee: `${defaultEmp.firstName} ${defaultEmp.lastName}`,
      department: defaultEmp.department,
      shift: 'General Shift',
      status: 'Present',
      checkIn: '09:00',
      checkOut: '18:00',
      hours: 8.5,
      notes: '',
    })
    setIsDialogOpen(true)
  }

  // Save Record (Edit or New)
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.employee) {
      toast.error('Please select an employee')
      return
    }

    if (editingRecord) {
      // Update existing
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingRecord.id
            ? {
                ...r,
                shift: formState.shift,
                status: formState.status,
                checkIn: formState.status === 'Absent' || formState.status === 'On Leave' ? '—' : formState.checkIn,
                checkOut: formState.status === 'Absent' || formState.status === 'On Leave' ? '—' : formState.checkOut,
                hours: formState.status === 'Absent' || formState.status === 'On Leave' ? 0 : Number(formState.hours),
              }
            : r
        )
      )
      toast.success(`Attendance updated for ${formState.employee}`)
    } else {
      // Add new record
      const newRec: AttendanceRecord = {
        id: `att-custom-${Date.now()}`,
        employeeId: `EMP-${Date.now().toString().slice(-4)}`,
        employee: formState.employee,
        department: formState.department || 'Operations',
        date,
        shift: formState.shift,
        status: formState.status,
        checkIn: formState.status === 'Absent' || formState.status === 'On Leave' ? '—' : formState.checkIn,
        checkOut: formState.status === 'Absent' || formState.status === 'On Leave' ? '—' : formState.checkOut,
        hours: formState.status === 'Absent' || formState.status === 'On Leave' ? 0 : Number(formState.hours),
      }
      setRows((prev) => [newRec, ...prev])
      toast.success(`Attendance record added for ${formState.employee}`)
    }

    setIsDialogOpen(false)
  }

  // Quick Change Status
  const updateStatus = (record: AttendanceRecord, newStatus: AttendanceStatus) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? {
              ...r,
              status: newStatus,
              checkIn:
                newStatus === 'Absent' || newStatus === 'On Leave'
                  ? '—'
                  : r.checkIn === '—'
                  ? '09:00'
                  : r.checkIn,
              checkOut:
                newStatus === 'Absent' || newStatus === 'On Leave'
                  ? '—'
                  : r.checkOut === '—'
                  ? '17:30'
                  : r.checkOut,
              hours:
                newStatus === 'Absent' || newStatus === 'On Leave'
                  ? 0
                  : newStatus === 'Half Day'
                  ? 4.0
                  : 8.0,
            }
          : r
      )
    )
    toast.success(`${record.employee} marked as ${newStatus}`)
  }

  // DataTable Filters (department)
  const filters: TableFilter<AttendanceRecord>[] = [
    {
      key: 'department',
      label: 'Departments',
      options: Array.from(new Set(employees.map((e) => e.department))),
      value: (r) => r.department,
    },
  ]

  // Columns
  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'employee',
      header: 'Employee',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {initials(r.employee)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
              {r.employee}
            </p>
            <p className="truncate text-xs text-muted-foreground">{r.department}</p>
          </div>
        </div>
      ),
      sortValue: (r) => r.employee,
    },
    {
      key: 'shift',
      header: 'Shift',
      cell: (r) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-medium text-foreground">{r.shift}</span>
        </div>
      ),
      sortValue: (r) => r.shift,
    },
    {
      key: 'checkIn',
      header: 'Check In',
      cell: (r) => {
        if (r.checkIn === '—') return <span className="text-muted-foreground">—</span>
        const isLate = r.status === 'Late'
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono text-xs font-semibold ${
                isLate
                  ? 'rounded-md bg-amber-500/10 px-1.5 py-0.5 text-amber-600 dark:text-amber-400'
                  : 'text-foreground'
              }`}
            >
              {r.checkIn}
            </span>
            {isLate && (
              <Badge variant="outline" className="h-4 border-amber-300 bg-amber-50 px-1 text-[10px] text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                Late
              </Badge>
            )}
          </div>
        )
      },
      sortValue: (r) => r.checkIn,
    },
    {
      key: 'checkOut',
      header: 'Check Out',
      cell: (r) => {
        if (r.checkOut === '—') return <span className="text-muted-foreground">—</span>
        const isHalfDay = r.status === 'Half Day'
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono text-xs font-semibold ${
                isHalfDay
                  ? 'rounded-md bg-orange-500/10 px-1.5 py-0.5 text-orange-600 dark:text-orange-400'
                  : 'text-foreground'
              }`}
            >
              {r.checkOut}
            </span>
            {isHalfDay && (
              <Badge variant="outline" className="h-4 border-orange-300 bg-orange-50 px-1 text-[10px] text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400">
                Half Day
              </Badge>
            )}
          </div>
        )
      },
      sortValue: (r) => r.checkOut,
    },
    {
      key: 'hours',
      header: 'Hours',
      cell: (r) => (
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${
            r.hours >= 8
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : r.hours > 0
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
              : 'text-muted-foreground'
          }`}
        >
          {r.hours.toFixed(1)}h
        </span>
      ),
      sortValue: (r) => r.hours,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge status={r.status} />,
      sortValue: (r) => r.status,
    },
  ]

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Daily Attendance"
        description="Review and manage employee daily check-in records, shift rosters, and work hours."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/attendance/shifts">
                <Layers className="mr-1.5 h-4 w-4" />
                Shift Rosters
              </Link>
            </Button>
            <Button onClick={handleNewRecord}>
              <Plus className="mr-1.5 h-4 w-4" />
              Record Attendance
            </Button>
          </div>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Present Today"
          value={presentCount}
          icon={CheckCircle2}
          tone="emerald"
          trend={4.2}
          description={`${attendanceRate}% attendance rate`}
        />
        <StatCard
          title="Late Arrivals"
          value={lateCount}
          icon={Clock3}
          tone="amber"
          description="Arrived after scheduled shift"
        />
        <StatCard
          title="On Leave & Half Day"
          value={onLeaveCount + halfDayCount}
          icon={UserMinus}
          tone="sky"
          description={`${onLeaveCount} on leave · ${halfDayCount} half day`}
        />
        <StatCard
          title="Absent"
          value={absentCount}
          icon={AlertCircle}
          tone="rose"
          description="Unexcused or missing check-in"
        />
      </div>

      {/* Date, Shift, and Status Filter Controls */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Date Navigation & Shift Selector */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Date navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => navigateDay(-1)}
                  title="Previous Day"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-9 w-40 text-sm font-medium"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => navigateDay(1)}
                  title="Next Day"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDate('2026-11-22')}
                  className="h-9 text-xs"
                >
                  Today
                </Button>
              </div>

              {/* Shift Filter Dropdown */}
              <div className="w-48">
                <Select value={shiftFilter} onValueChange={setShiftFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="All Shifts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shifts</SelectItem>
                    {shifts.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('Attendance records refreshed')}
                className="h-9 text-xs"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>

            {/* Right: Date Indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                Viewing records for:{' '}
                <strong className="font-semibold text-foreground">
                  {formatDate(date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </strong>
              </span>
            </div>
          </div>

          {/* Quick Status Chips Row */}
          <div className="flex flex-wrap items-center gap-1.5 border-t pt-3">
            <span className="text-xs font-medium text-muted-foreground mr-1">Filter by Status:</span>
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs rounded-full px-2.5"
              onClick={() => setStatusFilter('all')}
            >
              All ({rows.length})
            </Button>
            <Button
              variant={statusFilter === 'Present' ? 'default' : 'outline'}
              size="sm"
              className={`h-7 text-xs rounded-full px-2.5 ${
                statusFilter === 'Present'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'text-emerald-700 hover:text-emerald-800 dark:text-emerald-400'
              }`}
              onClick={() => setStatusFilter('Present')}
            >
              Present ({presentCount})
            </Button>
            <Button
              variant={statusFilter === 'Late' ? 'default' : 'outline'}
              size="sm"
              className={`h-7 text-xs rounded-full px-2.5 ${
                statusFilter === 'Late'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'text-amber-700 hover:text-amber-800 dark:text-amber-400'
              }`}
              onClick={() => setStatusFilter('Late')}
            >
              Late ({lateCount})
            </Button>
            <Button
              variant={statusFilter === 'Half Day' ? 'default' : 'outline'}
              size="sm"
              className={`h-7 text-xs rounded-full px-2.5 ${
                statusFilter === 'Half Day'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'text-orange-700 hover:text-orange-800 dark:text-orange-400'
              }`}
              onClick={() => setStatusFilter('Half Day')}
            >
              Half Day ({halfDayCount})
            </Button>
            <Button
              variant={statusFilter === 'On Leave' ? 'default' : 'outline'}
              size="sm"
              className={`h-7 text-xs rounded-full px-2.5 ${
                statusFilter === 'On Leave'
                  ? 'bg-sky-600 hover:bg-sky-700'
                  : 'text-sky-700 hover:text-sky-800 dark:text-sky-400'
              }`}
              onClick={() => setStatusFilter('On Leave')}
            >
              On Leave ({onLeaveCount})
            </Button>
            <Button
              variant={statusFilter === 'Absent' ? 'default' : 'outline'}
              size="sm"
              className={`h-7 text-xs rounded-full px-2.5 ${
                statusFilter === 'Absent'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'text-rose-700 hover:text-rose-800 dark:text-rose-400'
              }`}
              onClick={() => setStatusFilter('Absent')}
            >
              Absent ({absentCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Attendance DataTable */}
      <DataTable
        data={filteredRows}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search employee name or department..."
        onRowClick={(record) => handleEdit(record)}
        toolbar={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Attendance records exported to CSV')}
              className="h-9 text-xs"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success('All daily attendance records saved and synced')}
              className="h-9 text-xs"
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save Changes
            </Button>
          </div>
        }
        rowActions={(r) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Quick Mark Present */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-emerald-600"
              title="Quick mark Present"
              onClick={() => updateStatus(r, 'Present')}
            >
              <CheckCheck className="h-4 w-4" />
            </Button>

            {/* Edit Details */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Edit attendance"
              onClick={() => handleEdit(r)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>

            {/* More Status Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleEdit(r)}>
                  <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                  Edit Attendance
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {allStatuses.map((st) => (
                  <DropdownMenuItem
                    key={st}
                    disabled={r.status === st}
                    onClick={() => updateStatus(r, st)}
                  >
                    Mark as {st}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      />

      {/* Edit / Record Attendance Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? `Edit Attendance: ${editingRecord.employee}` : 'Record Manual Attendance'}
            </DialogTitle>
            <DialogDescription>
              {editingRecord
                ? 'Adjust clock-in, clock-out hours, or change status for this employee.'
                : 'Log manual attendance check-in for an employee.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRecord} className="space-y-4 py-2">
            {/* Employee Selection */}
            {!editingRecord ? (
              <div className="space-y-1.5">
                <Label htmlFor="employeeSelect">Employee *</Label>
                <Select
                  value={formState.employee}
                  onValueChange={(val) => {
                    const found = employees.find((e) => `${e.firstName} ${e.lastName}` === val)
                    setFormState({
                      ...formState,
                      employee: val,
                      department: found?.department || 'Engineering',
                    })
                  }}
                >
                  <SelectTrigger id="employeeSelect">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                        {emp.firstName} {emp.lastName} ({emp.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {initials(formState.employee)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{formState.employee}</p>
                  <p className="text-xs text-muted-foreground">{formState.department} · {editingRecord.shift}</p>
                </div>
              </div>
            )}

            {/* Shift and Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="shiftSelect">Assigned Shift</Label>
                <Select
                  value={formState.shift}
                  onValueChange={(val) => setFormState({ ...formState, shift: val })}
                >
                  <SelectTrigger id="shiftSelect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="statusSelect">Attendance Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(val) =>
                    setFormState({ ...formState, status: val as AttendanceStatus })
                  }
                >
                  <SelectTrigger id="statusSelect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allStatuses.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clock-In, Clock-Out, and Hours */}
            {formState.status !== 'Absent' && formState.status !== 'On Leave' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="checkInTime">Check In Time</Label>
                  <Input
                    id="checkInTime"
                    type="time"
                    value={formState.checkIn}
                    onChange={(e) => setFormState({ ...formState, checkIn: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="checkOutTime">Check Out Time</Label>
                  <Input
                    id="checkOutTime"
                    type="time"
                    value={formState.checkOut}
                    onChange={(e) => setFormState({ ...formState, checkOut: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hoursLogged">Total Hours</Label>
                  <Input
                    id="hoursLogged"
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    value={formState.hours}
                    onChange={(e) => setFormState({ ...formState, hours: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            )}

            {/* Justification / Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="remarksNotes">Remarks & Justification</Label>
              <Textarea
                id="remarksNotes"
                placeholder="e.g. Work from home approved, medical appointment, or remote check-in..."
                value={formState.notes}
                onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                rows={2}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-1.5 h-4 w-4" />
                Save Attendance Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
