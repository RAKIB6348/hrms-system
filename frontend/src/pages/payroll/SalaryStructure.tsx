import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  Receipt,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Download,
  Building,
  Sparkles,
  PieChart,
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
import { Progress } from '@/components/ui/progress'
import { designations, salaryStructures as initialData } from '@/mocks/data'
import { formatCurrency } from '@/lib/utils'
import type { SalaryStructure } from '@/types'

export default function SalaryStructurePage() {
  const [data, setData] = useState<SalaryStructure[]>(initialData)
  const [selectedItem, setSelectedItem] = useState<SalaryStructure | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form State
  const [formState, setFormState] = useState({
    designation: '',
    department: 'Engineering',
    basic: 5000,
    hra: 1250,
    allowances: 900,
    bonus: 500,
  })

  // Departments for filtering
  const departments = useMemo(() => {
    return Array.from(new Set(designations.map((d) => d.department)))
  }, [])

  const filters: TableFilter<SalaryStructure>[] = [
    {
      key: 'department',
      label: 'Departments',
      options: departments,
      value: (s) => s.department,
    },
  ]

  // KPI Calculations
  const totalDesignations = data.length
  const avgMonthlyTotal =
    data.length > 0 ? Math.round(data.reduce((acc, s) => acc + s.total, 0) / data.length) : 0
  const maxStructure =
    data.length > 0
      ? data.reduce((max, s) => (s.total > max.total ? s : max), data[0]!)
      : null
  const totalAnnualBaseline = data.reduce((acc, s) => acc + s.total, 0) * 12

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditingId(null)
    const defaultDes = designations[0]!
    setFormState({
      designation: defaultDes.title,
      department: defaultDes.department,
      basic: 5000,
      hra: 1250,
      allowances: 900,
      bonus: 500,
    })
    setIsEditOpen(true)
  }

  // Open Edit Dialog
  const handleOpenEdit = (item: SalaryStructure) => {
    setEditingId(item.id)
    setFormState({
      designation: item.designation,
      department: item.department,
      basic: item.basic,
      hra: item.hra,
      allowances: item.allowances,
      bonus: item.bonus,
    })
    setIsEditOpen(true)
  }

  // Save (Create or Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.designation.trim()) {
      toast.error('Please enter or select a designation')
      return
    }

    const total =
      Number(formState.basic) +
      Number(formState.hra) +
      Number(formState.allowances) +
      Number(formState.bonus)

    if (editingId) {
      setData((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                designation: formState.designation,
                department: formState.department,
                basic: Number(formState.basic),
                hra: Number(formState.hra),
                allowances: Number(formState.allowances),
                bonus: Number(formState.bonus),
                total,
              }
            : item
        )
      )
      toast.success(`Updated salary structure for ${formState.designation}`)
    } else {
      const newItem: SalaryStructure = {
        id: `sal-custom-${Date.now()}`,
        designation: formState.designation,
        department: formState.department,
        basic: Number(formState.basic),
        hra: Number(formState.hra),
        allowances: Number(formState.allowances),
        bonus: Number(formState.bonus),
        total,
      }
      setData((prev) => [newItem, ...prev])
      toast.success(`Created salary structure for ${formState.designation}`)
    }

    setIsEditOpen(false)
  }

  // Delete
  const handleDelete = (item: SalaryStructure) => {
    setData((prev) => prev.filter((s) => s.id !== item.id))
    toast.success(`Deleted salary structure for ${item.designation}`)
  }

  // Open Detail View
  const handleViewDetail = (item: SalaryStructure) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }

  // Table Columns
  const columns: Column<SalaryStructure>[] = [
    {
      key: 'designation',
      header: 'Designation',
      cell: (s) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {s.designation}
            </p>
            <p className="text-xs text-muted-foreground">{s.department}</p>
          </div>
        </div>
      ),
      sortValue: (s) => s.designation,
    },
    {
      key: 'department',
      header: 'Department',
      cell: (s) => (
        <Badge variant="outline" className="text-xs font-medium">
          {s.department}
        </Badge>
      ),
      sortValue: (s) => s.department,
    },
    {
      key: 'basic',
      header: 'Basic Salary',
      cell: (s) => <span className="font-mono text-xs font-medium">{formatCurrency(s.basic)}</span>,
      sortValue: (s) => s.basic,
    },
    {
      key: 'hra',
      header: 'HRA',
      cell: (s) => <span className="font-mono text-xs text-muted-foreground">{formatCurrency(s.hra)}</span>,
      sortValue: (s) => s.hra,
    },
    {
      key: 'allowances',
      header: 'Allowances',
      cell: (s) => <span className="font-mono text-xs text-muted-foreground">{formatCurrency(s.allowances)}</span>,
      sortValue: (s) => s.allowances,
    },
    {
      key: 'bonus',
      header: 'Bonus / Perf.',
      cell: (s) => <span className="font-mono text-xs text-muted-foreground">{formatCurrency(s.bonus)}</span>,
      sortValue: (s) => s.bonus,
    },
    {
      key: 'total',
      header: 'Total / Month',
      cell: (s) => (
        <span className="font-mono text-sm font-bold text-primary">
          {formatCurrency(s.total)}
        </span>
      ),
      sortValue: (s) => s.total,
    },
  ]

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Salary Structure"
        description="Define and manage compensation components and packages for each designation."
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Salary Component
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Average Monthly CTC"
          value={formatCurrency(avgMonthlyTotal)}
          icon={DollarSign}
          tone="primary"
          trend={3.8}
          description="Across all configured roles"
        />
        <StatCard
          title="Highest Package"
          value={maxStructure ? formatCurrency(maxStructure.total) : '$0'}
          icon={TrendingUp}
          tone="emerald"
          description={maxStructure ? `${maxStructure.designation}` : 'Top designation'}
        />
        <StatCard
          title="Configured Roles"
          value={totalDesignations}
          icon={Briefcase}
          tone="violet"
          description={`Across ${departments.length} departments`}
        />
        <StatCard
          title="Annualized Baseline"
          value={`$${(totalAnnualBaseline / 1000000).toFixed(2)}M`}
          icon={Receipt}
          tone="sky"
          description="Estimated baseline annual spend"
        />
      </div>

      {/* Main DataTable */}
      <DataTable
        data={data}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search designation or department..."
        onRowClick={(item) => handleViewDetail(item)}
        toolbar={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Salary structures exported to CSV')}
            className="h-9 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
        rowActions={(s) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="View breakdown"
              onClick={() => handleViewDetail(s)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Edit structure"
              onClick={() => handleOpenEdit(s)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Delete structure"
              onClick={() => handleDelete(s)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      />

      {/* Compensation Breakdown Dialog */}
      {selectedItem && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">{selectedItem.designation}</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {selectedItem.department} · Monthly Total: {formatCurrency(selectedItem.total)}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Component Percentages */}
              <div className="rounded-xl border bg-slate-50 dark:bg-slate-900/50 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Component Breakdown
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Basic Salary</span>
                    <span className="font-semibold">
                      {formatCurrency(selectedItem.basic)} ({Math.round((selectedItem.basic / selectedItem.total) * 100)}%)
                    </span>
                  </div>
                  <Progress value={(selectedItem.basic / selectedItem.total) * 100} className="h-2 bg-muted" />

                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">House Rent Allowance (HRA)</span>
                    <span className="font-semibold">
                      {formatCurrency(selectedItem.hra)} ({Math.round((selectedItem.hra / selectedItem.total) * 100)}%)
                    </span>
                  </div>
                  <Progress value={(selectedItem.hra / selectedItem.total) * 100} className="h-2 bg-muted" />

                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Other Allowances</span>
                    <span className="font-semibold">
                      {formatCurrency(selectedItem.allowances)} ({Math.round((selectedItem.allowances / selectedItem.total) * 100)}%)
                    </span>
                  </div>
                  <Progress value={(selectedItem.allowances / selectedItem.total) * 100} className="h-2 bg-muted" />

                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Performance Bonus</span>
                    <span className="font-semibold">
                      {formatCurrency(selectedItem.bonus)} ({Math.round((selectedItem.bonus / selectedItem.total) * 100)}%)
                    </span>
                  </div>
                  <Progress value={(selectedItem.bonus / selectedItem.total) * 100} className="h-2 bg-muted" />
                </div>
              </div>

              {/* Total Card */}
              <div className="flex items-center justify-between rounded-xl bg-primary/10 p-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Monthly CTC</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(selectedItem.total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-muted-foreground">Annual Gross</p>
                  <p className="text-base font-semibold">{formatCurrency(selectedItem.total * 12)}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsDetailOpen(false)
                  handleOpenEdit(selectedItem)
                }}
              >
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit Structure
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Salary Component' : 'Add Salary Component'}
            </DialogTitle>
            <DialogDescription>
              Configure the compensation structure and monthly components for a designation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="salDesignation">Designation *</Label>
                <Select
                  value={formState.designation}
                  onValueChange={(val) => {
                    const des = designations.find((d) => d.title === val)
                    setFormState({
                      ...formState,
                      designation: val,
                      department: des ? des.department : formState.department,
                    })
                  }}
                >
                  <SelectTrigger id="salDesignation">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {designations.map((d) => (
                      <SelectItem key={d.id} value={d.title}>
                        {d.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="salDepartment">Department *</Label>
                <Select
                  value={formState.department}
                  onValueChange={(val) => setFormState({ ...formState, department: val })}
                >
                  <SelectTrigger id="salDepartment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="salBasic">Basic Salary ($) *</Label>
                <Input
                  id="salBasic"
                  type="number"
                  min="0"
                  value={formState.basic}
                  onChange={(e) =>
                    setFormState({ ...formState, basic: Number(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="salHra">HRA ($) *</Label>
                <Input
                  id="salHra"
                  type="number"
                  min="0"
                  value={formState.hra}
                  onChange={(e) =>
                    setFormState({ ...formState, hra: Number(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="salAllowances">Other Allowances ($) *</Label>
                <Input
                  id="salAllowances"
                  type="number"
                  min="0"
                  value={formState.allowances}
                  onChange={(e) =>
                    setFormState({ ...formState, allowances: Number(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="salBonus">Bonus / Perf. ($) *</Label>
                <Input
                  id="salBonus"
                  type="number"
                  min="0"
                  value={formState.bonus}
                  onChange={(e) =>
                    setFormState({ ...formState, bonus: Number(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>

            {/* Calculated Monthly CTC Preview */}
            <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Computed Total Monthly CTC</span>
              <span className="text-base font-bold text-primary font-mono">
                {formatCurrency(
                  Number(formState.basic) +
                    Number(formState.hra) +
                    Number(formState.allowances) +
                    Number(formState.bonus)
                )}
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? 'Save Changes' : 'Create Structure'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
