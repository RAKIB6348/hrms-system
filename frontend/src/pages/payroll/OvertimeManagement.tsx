import { useState } from 'react'
import { toast } from 'sonner'
import {
  Clock,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { mockOvertime as initialOvertime } from '@/mocks/payrollData'
import { employees } from '@/mocks/data'
import { formatBDT } from '@/lib/payrollUtils'
import type { OvertimeRecord } from '@/types/payroll'

const calcMethods = ['1.5x Standard Hourly', '2.0x Weekend Hourly', '1.0x Flat Rate']

const statusStyles: Record<string, string> = {
  Approved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200',
  Pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200',
  Rejected: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200',
}

export default function OvertimeManagement() {
  const [records, setRecords] = useState<OvertimeRecord[]>(initialOvertime)
  const [selectedRecord, setSelectedRecord] = useState<OvertimeRecord | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    employeeId: 'PF-1001',
    employee: `${employees[0]!.firstName} ${employees[0]!.lastName}`,
    department: employees[0]!.department,
    date: new Date().toISOString().split('T')[0]!,
    hours: 3.5,
    hourlyRate: 350,
    calculationMethod: '1.5x Standard Hourly',
    reason: '',
  })

  // KPI Calculations
  const totalHours = records.reduce((sum, r) => sum + r.hours, 0)
  const totalAmount = records.reduce((sum, r) => sum + r.totalAmount, 0)
  const approvedHours = records
    .filter((r) => r.status === 'Approved')
    .reduce((sum, r) => sum + r.hours, 0)
  const pendingCount = records.filter((r) => r.status === 'Pending').length

  const handleOpenAdd = () => {
    setEditingId(null)
    const emp = employees[0]!
    setFormState({
      employeeId: emp.employeeId,
      employee: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      date: new Date().toISOString().split('T')[0]!,
      hours: 3.5,
      hourlyRate: 350,
      calculationMethod: '1.5x Standard Hourly',
      reason: '',
    })
    setIsAddOpen(true)
  }

  const handleOpenEdit = (rec: OvertimeRecord) => {
    setEditingId(rec.id)
    setFormState({
      employeeId: rec.employeeId,
      employee: rec.employee,
      department: rec.department,
      date: rec.date,
      hours: rec.hours,
      hourlyRate: rec.hourlyRate,
      calculationMethod: rec.calculationMethod,
      reason: rec.reason || '',
    })
    setIsAddOpen(true)
  }

  const handleDelete = (rec: OvertimeRecord) => {
    setRecords((prev) => prev.filter((r) => r.id !== rec.id))
    toast.success(`Overtime record for ${rec.employee} removed`)
  }

  const updateStatus = (id: string, status: OvertimeRecord['status']) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    )
    if (selectedRecord?.id === id) {
      setSelectedRecord({ ...selectedRecord, status })
    }
    toast.success(`Overtime record marked as ${status}`)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (formState.hours <= 0 || formState.hourlyRate <= 0) {
      toast.error('Please enter valid hours and hourly rate')
      return
    }

    const multiplier = formState.calculationMethod.includes('2.0x')
      ? 2.0
      : formState.calculationMethod.includes('1.5x')
      ? 1.5
      : 1.0
    const totalAmount = Math.round(formState.hours * formState.hourlyRate * multiplier)

    if (editingId) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                employeeId: formState.employeeId,
                employee: formState.employee,
                department: formState.department,
                date: formState.date,
                hours: Number(formState.hours),
                hourlyRate: Number(formState.hourlyRate),
                calculationMethod: formState.calculationMethod,
                totalAmount,
                reason: formState.reason,
              }
            : r
        )
      )
      toast.success(`Overtime record for ${formState.employee} updated`)
    } else {
      const newRec: OvertimeRecord = {
        id: `ot-custom-${Date.now()}`,
        employeeId: formState.employeeId,
        employee: formState.employee,
        department: formState.department,
        date: formState.date,
        hours: Number(formState.hours),
        hourlyRate: Number(formState.hourlyRate),
        calculationMethod: formState.calculationMethod,
        totalAmount,
        status: 'Approved',
        reason: formState.reason,
      }
      setRecords((prev) => [newRec, ...prev])
      toast.success(`Overtime logged for ${newRec.employee}`)
    }

    setIsAddOpen(false)
  }

  const filters: TableFilter<OvertimeRecord>[] = [
    {
      key: 'status',
      label: 'Status',
      options: ['Approved', 'Pending', 'Rejected'],
      value: (r) => r.status,
    },
    {
      key: 'department',
      label: 'Departments',
      options: Array.from(new Set(employees.map((e) => e.department))),
      value: (r) => r.department,
    },
  ]

  const columns: Column<OvertimeRecord>[] = [
    {
      key: 'employee',
      header: 'Employee',
      cell: (r) => (
        <div>
          <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
            {r.employee}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">{r.employeeId} · {r.department}</p>
        </div>
      ),
      sortValue: (r) => r.employee,
    },
    {
      key: 'date',
      header: 'Date',
      cell: (r) => <span className="text-xs text-muted-foreground">{r.date}</span>,
      sortValue: (r) => r.date,
    },
    {
      key: 'hours',
      header: 'Overtime Hours',
      cell: (r) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {r.hours.toFixed(1)} hrs
        </span>
      ),
      sortValue: (r) => r.hours,
    },
    {
      key: 'calculationMethod',
      header: 'Calculation Rule',
      cell: (r) => (
        <div>
          <Badge variant="outline" className="text-[10px]">
            {r.calculationMethod}
          </Badge>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Base: {formatBDT(r.hourlyRate)}/hr
          </p>
        </div>
      ),
      sortValue: (r) => r.calculationMethod,
    },
    {
      key: 'totalAmount',
      header: 'Overtime Pay (BDT)',
      cell: (r) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {formatBDT(r.totalAmount)}
        </span>
      ),
      sortValue: (r) => r.totalAmount,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => (
        <Badge variant="outline" className={`text-xs px-2 py-0.5 ${statusStyles[r.status]}`}>
          {r.status}
        </Badge>
      ),
      sortValue: (r) => r.status,
    },
  ]

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Overtime Management"
        description="Employee extra hours logging, overtime rate multipliers, supervisor approvals, and payroll adjustments."
        actions={
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            Log Overtime
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Overtime Hours"
          value={`${totalHours.toFixed(1)} hrs`}
          icon={Clock}
          tone="primary"
          description="Logged in current period"
        />
        <StatCard
          title="Total Overtime Pay"
          value={formatBDT(totalAmount)}
          icon={DollarSign}
          tone="emerald"
          trend={6.5}
          description="Approved & pending compensation"
        />
        <StatCard
          title="Approved Hours"
          value={`${approvedHours.toFixed(1)} hrs`}
          icon={CheckCircle2}
          tone="violet"
          description="Cleared for payroll payout"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingCount}
          icon={Clock}
          tone="amber"
          description="Awaiting department verification"
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={records}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search overtime by employee name or reason..."
        onRowClick={(r) => setSelectedRecord(r)}
        toolbar={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Overtime records exported to CSV')}
            className="h-9 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
        rowActions={(r) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="View details"
              onClick={() => setSelectedRecord(r)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {r.status === 'Pending' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
                  title="Approve overtime"
                  onClick={() => updateStatus(r.id, 'Approved')}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-rose-600 hover:text-rose-700"
                  title="Reject overtime"
                  onClick={() => updateStatus(r.id, 'Rejected')}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Edit record"
              onClick={() => handleOpenEdit(r)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Delete record"
              onClick={() => handleDelete(r)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      />

      {/* View Details Dialog */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <DialogTitle className="text-lg font-bold">{selectedRecord.employee}</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {selectedRecord.employeeId} · {selectedRecord.department} · {selectedRecord.date}
                  </DialogDescription>
                </div>
                <Badge variant="outline" className={statusStyles[selectedRecord.status]}>
                  {selectedRecord.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="flex justify-between rounded-lg border p-3 bg-muted/20">
                <span className="text-muted-foreground">Computed Overtime Pay</span>
                <span className="font-mono text-base font-bold text-foreground">
                  {formatBDT(selectedRecord.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Logged Hours</span>
                <span className="font-semibold">{selectedRecord.hours} hours</span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Base Hourly Rate</span>
                <span className="font-semibold">{formatBDT(selectedRecord.hourlyRate)}/hr</span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Calculation Method</span>
                <span className="font-semibold">{selectedRecord.calculationMethod}</span>
              </div>
              {selectedRecord.reason && (
                <div className="space-y-1 pt-1">
                  <span className="text-muted-foreground font-semibold">Duty Justification</span>
                  <p className="rounded-lg border p-2.5 bg-muted/10 leading-relaxed">
                    {selectedRecord.reason}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
              {selectedRecord.status === 'Pending' && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => updateStatus(selectedRecord.id, 'Approved')}
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => updateStatus(selectedRecord.id, 'Rejected')}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Overtime Entry' : 'Log Employee Overtime'}
            </DialogTitle>
            <DialogDescription>
              Record extra hours worked for subsequent payroll compensation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="otEmp">Employee *</Label>
              <Select
                value={formState.employee}
                onValueChange={(val) => {
                  const emp = employees.find((e) => `${e.firstName} ${e.lastName}` === val)
                  setFormState({
                    ...formState,
                    employee: val,
                    employeeId: emp ? emp.employeeId : formState.employeeId,
                    department: emp ? emp.department : formState.department,
                  })
                }}
              >
                <SelectTrigger id="otEmp">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={`${e.firstName} ${e.lastName}`}>
                      {e.firstName} {e.lastName} ({e.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="otDate">Date</Label>
                <Input
                  id="otDate"
                  type="date"
                  value={formState.date}
                  onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="otHours">Hours *</Label>
                <Input
                  id="otHours"
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={formState.hours}
                  onChange={(e) =>
                    setFormState({ ...formState, hours: Number(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="otRate">Hourly Rate (BDT)</Label>
                <Input
                  id="otRate"
                  type="number"
                  min="50"
                  value={formState.hourlyRate}
                  onChange={(e) =>
                    setFormState({ ...formState, hourlyRate: Number(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="otMethod">Calculation Rule</Label>
                <Select
                  value={formState.calculationMethod}
                  onValueChange={(val) =>
                    setFormState({ ...formState, calculationMethod: val })
                  }
                >
                  <SelectTrigger id="otMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {calcMethods.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="otReason">Duty Justification / Reason</Label>
              <Input
                id="otReason"
                placeholder="e.g. Critical release support or server maintenance"
                value={formState.reason}
                onChange={(e) => setFormState({ ...formState, reason: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? 'Save Overtime' : 'Log Overtime'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
