import { useState } from 'react'
import { toast } from 'sonner'
import {
  ClockAlert,
  Clock,
  Eye,
  Pencil,
  CheckCircle2,
  XCircle,
  Download,
  AlertCircle,
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
import { mockLateDeductions as initialDeductions } from '@/mocks/payrollData'
import { employees } from '@/mocks/data'
import { formatBDT } from '@/lib/payrollUtils'
import type { LateDeductionRecord } from '@/types/payroll'

const statusStyles: Record<string, string> = {
  Applied: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200',
  Waived: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200',
  'Pending Review': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200',
}

export default function LateDeductions() {
  const [records, setRecords] = useState<LateDeductionRecord[]>(initialDeductions)
  const [selectedRecord, setSelectedRecord] = useState<LateDeductionRecord | null>(null)
  const [editingRecord, setEditingRecord] = useState<LateDeductionRecord | null>(null)
  const [editAmount, setEditAmount] = useState(500)
  const [editStatus, setEditStatus] = useState<LateDeductionRecord['status']>('Applied')

  // KPI Calculations
  const totalDeductionAmount = records
    .filter((r) => r.status === 'Applied')
    .reduce((sum, r) => sum + r.deductionAmount, 0)
  const appliedCount = records.filter((r) => r.status === 'Applied').length
  const waivedCount = records.filter((r) => r.status === 'Waived').length
  const pendingCount = records.filter((r) => r.status === 'Pending Review').length

  const handleOpenEdit = (rec: LateDeductionRecord) => {
    setEditingRecord(rec)
    setEditAmount(rec.deductionAmount)
    setEditStatus(rec.status)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecord) return

    setRecords((prev) =>
      prev.map((r) =>
        r.id === editingRecord.id
          ? {
              ...r,
              deductionAmount: Number(editAmount),
              status: editStatus,
            }
          : r
      )
    )
    toast.success(`Deduction record updated for ${editingRecord.employee}`)
    setEditingRecord(null)
  }

  const updateStatus = (id: string, status: LateDeductionRecord['status']) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    )
    if (selectedRecord?.id === id) {
      setSelectedRecord({ ...selectedRecord, status })
    }
    toast.success(`Late deduction marked as ${status}`)
  }

  const filters: TableFilter<LateDeductionRecord>[] = [
    {
      key: 'status',
      label: 'Status',
      options: ['Applied', 'Waived', 'Pending Review'],
      value: (r) => r.status,
    },
    {
      key: 'department',
      label: 'Departments',
      options: Array.from(new Set(employees.map((e) => e.department))),
      value: (r) => r.department,
    },
  ]

  const columns: Column<LateDeductionRecord>[] = [
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
      key: 'attendanceDate',
      header: 'Attendance Date',
      cell: (r) => <span className="text-xs text-muted-foreground">{r.attendanceDate}</span>,
      sortValue: (r) => r.attendanceDate,
    },
    {
      key: 'checkInTimes',
      header: 'Scheduled vs Actual',
      cell: (r) => (
        <div className="text-xs">
          <p className="text-muted-foreground font-mono text-[11px]">{r.scheduledCheckIn}</p>
          <p className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
            {r.actualCheckIn}
          </p>
        </div>
      ),
      sortValue: (r) => r.lateMinutes,
    },
    {
      key: 'lateMinutes',
      header: 'Late Duration',
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200">
            +{r.lateMinutes} mins
          </Badge>
          <span className="text-[10px] text-muted-foreground">({r.gracePeriodMinutes}m grace)</span>
        </div>
      ),
      sortValue: (r) => r.lateMinutes,
    },
    {
      key: 'deductionRule',
      header: 'Applied Rule',
      cell: (r) => <span className="text-xs text-muted-foreground">{r.deductionRule}</span>,
      sortValue: (r) => r.deductionRule,
    },
    {
      key: 'deductionAmount',
      header: 'Deduction Amount',
      cell: (r) => (
        <span
          className={`font-mono text-xs font-bold ${
            r.status === 'Applied'
              ? 'text-rose-600 dark:text-rose-400'
              : r.status === 'Waived'
              ? 'line-through text-muted-foreground'
              : 'text-foreground'
          }`}
        >
          {formatBDT(r.deductionAmount)}
        </span>
      ),
      sortValue: (r) => r.deductionAmount,
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
        title="Late Deductions"
        description="Automated and manual late check-in penalties, grace period rules, waiver reviews, and payroll adjustments."
      />

      <DemoNotice compact />

      {/* Top 4 KPI StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Late Penalties"
          value={formatBDT(totalDeductionAmount)}
          icon={AlertCircle}
          tone="rose"
          description="Deductions applied to payroll"
        />
        <StatCard
          title="Penalties Applied"
          value={appliedCount}
          icon={Clock}
          tone="amber"
          description="Recorded late check-in incidents"
        />
        <StatCard
          title="Waived by Management"
          value={waivedCount}
          icon={CheckCircle2}
          tone="emerald"
          description="Traffic / emergency justifications"
        />
        <StatCard
          title="Pending HR Review"
          value={pendingCount}
          icon={ClockAlert}
          tone="violet"
          description="Awaiting waiver or confirmation"
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={records}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search late deductions by employee or rule..."
        onRowClick={(r) => setSelectedRecord(r)}
        toolbar={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Late deductions exported to CSV')}
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
              title="View incident details"
              onClick={() => setSelectedRecord(r)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {r.status === 'Pending Review' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
                  title="Waive penalty"
                  onClick={() => updateStatus(r.id, 'Waived')}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-rose-600 hover:text-rose-700"
                  title="Confirm penalty"
                  onClick={() => updateStatus(r.id, 'Applied')}
                >
                  <AlertCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Edit deduction amount or status"
              onClick={() => handleOpenEdit(r)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      />

      {/* View Incident Dialog */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <DialogTitle className="text-lg font-bold">{selectedRecord.employee}</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {selectedRecord.employeeId} · {selectedRecord.department} · {selectedRecord.attendanceDate}
                  </DialogDescription>
                </div>
                <Badge variant="outline" className={statusStyles[selectedRecord.status]}>
                  {selectedRecord.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="flex justify-between rounded-lg border p-3 bg-muted/20">
                <span className="text-muted-foreground">Penalty Deduction</span>
                <span className="font-mono text-base font-bold text-rose-600 dark:text-rose-400">
                  {formatBDT(selectedRecord.deductionAmount)}
                </span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Scheduled Check-in</span>
                <span className="font-semibold">{selectedRecord.scheduledCheckIn}</span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Actual Timestamp</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {selectedRecord.actualCheckIn} (+{selectedRecord.lateMinutes} mins)
                </span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Grace Period Allowed</span>
                <span className="font-semibold">{selectedRecord.gracePeriodMinutes} mins</span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Company Deduction Rule</span>
                <span className="font-semibold">{selectedRecord.deductionRule}</span>
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
              {selectedRecord.status === 'Pending Review' && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => updateStatus(selectedRecord.id, 'Waived')}
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    Waive Penalty
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => updateStatus(selectedRecord.id, 'Applied')}
                  >
                    <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                    Apply to Payroll
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Deduction Dialog */}
      {editingRecord && (
        <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Late Deduction</DialogTitle>
              <DialogDescription>
                Adjust the penalty amount or update waiver status for {editingRecord.employee}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="editAmount">Penalty Amount (BDT)</Label>
                <Input
                  id="editAmount"
                  type="number"
                  min="0"
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editStatus}
                  onValueChange={(val) => setEditStatus(val as LateDeductionRecord['status'])}
                >
                  <SelectTrigger id="editStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applied">Applied (Deduct from Salary)</SelectItem>
                    <SelectItem value="Waived">Waived (No Penalty)</SelectItem>
                    <SelectItem value="Pending Review">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingRecord(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
