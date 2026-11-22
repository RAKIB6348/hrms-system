import { useState } from 'react'
import { toast } from 'sonner'
import {
  Gift,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock3,
  Calendar,
  Users,
  Download,
  DollarSign,
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
import { mockBonuses as initialBonuses } from '@/mocks/payrollData'
import { departments } from '@/mocks/data'
import { formatBDT } from '@/lib/payrollUtils'
import type { BonusRecord } from '@/types/payroll'

const bonusTypes = ['Festival Bonus', 'Performance Bonus', 'Special Bonus']
const bonusStatuses = ['Draft', 'Confirmed', 'Paid', 'Cancelled']

const statusStyles: Record<string, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Confirmed: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200',
  Paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200',
  Cancelled: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200',
}

export default function BonusManagement() {
  const [bonuses, setBonuses] = useState<BonusRecord[]>(initialBonuses)
  const [selectedBonus, setSelectedBonus] = useState<BonusRecord | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    name: '',
    type: 'Festival Bonus' as BonusRecord['type'],
    targetScope: 'All Employees' as BonusRecord['targetScope'],
    targetValue: 'All Active Employees',
    calculationType: 'Percentage' as 'Fixed' | 'Percentage',
    amount: 100,
    effectiveDate: new Date().toISOString().split('T')[0]!,
    status: 'Confirmed' as BonusRecord['status'],
    employeesCount: 220,
  })

  // KPI Calculations
  const totalBonusPool = bonuses
    .filter((b) => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.calculationType === 'Fixed' ? b.amount * b.employeesCount : b.amount * 500 * b.employeesCount), 0)
  const confirmedCount = bonuses.filter((b) => b.status === 'Confirmed').length
  const paidCount = bonuses.filter((b) => b.status === 'Paid').length
  const totalEmployeesAwarded = bonuses.reduce((sum, b) => sum + b.employeesCount, 0)

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormState({
      name: '',
      type: 'Festival Bonus',
      targetScope: 'All Employees',
      targetValue: 'All Active Employees',
      calculationType: 'Percentage',
      amount: 100,
      effectiveDate: new Date().toISOString().split('T')[0]!,
      status: 'Confirmed',
      employeesCount: 220,
    })
    setIsAddOpen(true)
  }

  const handleOpenEdit = (bonus: BonusRecord) => {
    setEditingId(bonus.id)
    setFormState({
      name: bonus.name,
      type: bonus.type,
      targetScope: bonus.targetScope,
      targetValue: bonus.targetValue,
      calculationType: bonus.calculationType,
      amount: bonus.amount,
      effectiveDate: bonus.effectiveDate,
      status: bonus.status,
      employeesCount: bonus.employeesCount,
    })
    setIsAddOpen(true)
  }

  const handleDelete = (bonus: BonusRecord) => {
    setBonuses((prev) => prev.filter((b) => b.id !== bonus.id))
    toast.success(`Bonus policy ${bonus.name} removed`)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.name.trim()) {
      toast.error('Please enter bonus name')
      return
    }

    if (editingId) {
      setBonuses((prev) =>
        prev.map((b) =>
          b.id === editingId
            ? {
                ...b,
                name: formState.name,
                type: formState.type,
                targetScope: formState.targetScope,
                targetValue: formState.targetValue,
                calculationType: formState.calculationType,
                amount: Number(formState.amount),
                effectiveDate: formState.effectiveDate,
                status: formState.status,
                employeesCount: Number(formState.employeesCount),
              }
            : b
        )
      )
      toast.success(`Bonus policy ${formState.name} updated`)
    } else {
      const created: BonusRecord = {
        id: `bon-custom-${Date.now()}`,
        name: formState.name,
        type: formState.type,
        targetScope: formState.targetScope,
        targetValue: formState.targetValue,
        calculationType: formState.calculationType,
        amount: Number(formState.amount),
        effectiveDate: formState.effectiveDate,
        status: formState.status,
        employeesCount: Number(formState.employeesCount),
      }
      setBonuses((prev) => [created, ...prev])
      toast.success(`Bonus policy ${created.name} scheduled`)
    }

    setIsAddOpen(false)
  }

  const filters: TableFilter<BonusRecord>[] = [
    {
      key: 'type',
      label: 'Bonus Types',
      options: bonusTypes,
      value: (b) => b.type,
    },
    {
      key: 'status',
      label: 'Status',
      options: bonusStatuses,
      value: (b) => b.status,
    },
  ]

  const columns: Column<BonusRecord>[] = [
    {
      key: 'name',
      header: 'Bonus Title',
      cell: (b) => (
        <div>
          <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
            {b.name}
          </p>
          <p className="text-[11px] text-muted-foreground">{b.type}</p>
        </div>
      ),
      sortValue: (b) => b.name,
    },
    {
      key: 'targetScope',
      header: 'Beneficiary Scope',
      cell: (b) => (
        <div>
          <Badge variant="outline" className="text-[10px]">
            {b.targetScope}
          </Badge>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[180px]">
            {b.targetValue}
          </p>
        </div>
      ),
      sortValue: (b) => b.targetScope,
    },
    {
      key: 'amount',
      header: 'Bonus Rate / Amount',
      cell: (b) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {b.calculationType === 'Percentage' ? `${b.amount}% of Basic` : formatBDT(b.amount)}
        </span>
      ),
      sortValue: (b) => b.amount,
    },
    {
      key: 'employeesCount',
      header: 'Headcount',
      cell: (b) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-semibold">{b.employeesCount} staff</span>
        </div>
      ),
      sortValue: (b) => b.employeesCount,
    },
    {
      key: 'effectiveDate',
      header: 'Disbursement Date',
      cell: (b) => <span className="text-xs text-muted-foreground">{b.effectiveDate}</span>,
      sortValue: (b) => b.effectiveDate,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (b) => (
        <Badge variant="outline" className={`text-xs px-2 py-0.5 ${statusStyles[b.status]}`}>
          {b.status}
        </Badge>
      ),
      sortValue: (b) => b.status,
    },
  ]

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Bonus Management"
        description="Configure festival allowances, performance bonuses, and employee incentive cycles."
        actions={
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Bonus Policy
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Bonus Pool"
          value={formatBDT(totalBonusPool)}
          icon={Gift}
          tone="primary"
          trend={8.2}
          description="Festival & performance awards"
        />
        <StatCard
          title="Confirmed Cycles"
          value={confirmedCount}
          icon={Clock3}
          tone="violet"
          description="Scheduled for payroll release"
        />
        <StatCard
          title="Paid Bonuses"
          value={paidCount}
          icon={CheckCircle2}
          tone="emerald"
          description="Disbursed to employees"
        />
        <StatCard
          title="Awarded Headcount"
          value={totalEmployeesAwarded}
          icon={Users}
          tone="sky"
          description="Total bonus recipients"
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={bonuses}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search bonuses by name or scope..."
        onRowClick={(b) => setSelectedBonus(b)}
        toolbar={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Bonus report exported to CSV')}
            className="h-9 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
        rowActions={(b) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="View details"
              onClick={() => setSelectedBonus(b)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Edit bonus"
              onClick={() => handleOpenEdit(b)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Delete bonus"
              onClick={() => handleDelete(b)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      />

      {/* View Details Dialog */}
      {selectedBonus && (
        <Dialog open={!!selectedBonus} onOpenChange={(open) => !open && setSelectedBonus(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <DialogTitle className="text-lg font-bold">{selectedBonus.name}</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {selectedBonus.type} · Effective: {selectedBonus.effectiveDate}
                  </DialogDescription>
                </div>
                <Badge variant="outline" className={statusStyles[selectedBonus.status]}>
                  {selectedBonus.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="flex justify-between rounded-lg border p-3 bg-muted/20">
                <span className="text-muted-foreground">Rate / Payout Rule</span>
                <span className="font-mono text-base font-bold text-foreground">
                  {selectedBonus.calculationType === 'Percentage'
                    ? `${selectedBonus.amount}% of Basic Salary`
                    : formatBDT(selectedBonus.amount)}
                </span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Target Scope</span>
                <span className="font-semibold">{selectedBonus.targetScope}</span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Target Beneficiaries</span>
                <span className="font-semibold">{selectedBonus.targetValue}</span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Total Staff Covered</span>
                <span className="font-semibold">{selectedBonus.employeesCount} employees</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedBonus(null)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedBonus(null)
                  handleOpenEdit(selectedBonus)
                }}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Bonus Policy' : 'Create Bonus Policy'}
            </DialogTitle>
            <DialogDescription>
              Configure festival, performance, or custom incentive bonus awards.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="bonName">Bonus Title *</Label>
              <Input
                id="bonName"
                placeholder="e.g. Eid-ul-Fitr Festival Bonus 2026"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bonType">Bonus Type</Label>
                <Select
                  value={formState.type}
                  onValueChange={(val) =>
                    setFormState({ ...formState, type: val as BonusRecord['type'] })
                  }
                >
                  <SelectTrigger id="bonType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bonusTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bonScope">Beneficiary Scope</Label>
                <Select
                  value={formState.targetScope}
                  onValueChange={(val) => {
                    const scope = val as BonusRecord['targetScope']
                    setFormState({
                      ...formState,
                      targetScope: scope,
                      targetValue:
                        scope === 'All Employees'
                          ? 'All Active Staff'
                          : scope === 'Department'
                          ? 'Engineering'
                          : 'Selected Staff',
                      employeesCount: scope === 'All Employees' ? 220 : 50,
                    })
                  }}
                >
                  <SelectTrigger id="bonScope">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Employees">All Employees (Company-wide)</SelectItem>
                    <SelectItem value="Department">Department-wise</SelectItem>
                    <SelectItem value="Individual">Individual Employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bonCalc">Calculation Mode</Label>
                <Select
                  value={formState.calculationType}
                  onValueChange={(val) =>
                    setFormState({ ...formState, calculationType: val as 'Fixed' | 'Percentage' })
                  }
                >
                  <SelectTrigger id="bonCalc">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">Percentage of Basic (%)</SelectItem>
                    <SelectItem value="Fixed">Fixed Amount (BDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bonAmount">
                  {formState.calculationType === 'Percentage' ? 'Rate (%)' : 'Amount (BDT)'} *
                </Label>
                <Input
                  id="bonAmount"
                  type="number"
                  min="1"
                  value={formState.amount}
                  onChange={(e) =>
                    setFormState({ ...formState, amount: Number(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bonDate">Disbursement Date</Label>
                <Input
                  id="bonDate"
                  type="date"
                  value={formState.effectiveDate}
                  onChange={(e) => setFormState({ ...formState, effectiveDate: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bonStatus">Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(val) =>
                    setFormState({ ...formState, status: val as BonusRecord['status'] })
                  }
                >
                  <SelectTrigger id="bonStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bonusStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? 'Save Policy' : 'Create Policy'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
