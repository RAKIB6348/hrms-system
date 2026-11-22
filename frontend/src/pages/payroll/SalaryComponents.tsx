import { useState } from 'react'
import { toast } from 'sonner'
import {
  Layers,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Download,
  Percent,
  DollarSign,
  AlertCircle,
  Sliders,
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
import { mockSalaryComponents as initialComponents } from '@/mocks/payrollData'
import { formatBDT } from '@/lib/payrollUtils'
import type { SalaryComponent } from '@/types/payroll'

export default function SalaryComponents() {
  const [components, setComponents] = useState<SalaryComponent[]>(initialComponents)
  const [selectedComp, setSelectedComp] = useState<SalaryComponent | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    name: '',
    code: '',
    type: 'Allowance' as 'Allowance' | 'Deduction',
    calculationType: 'Fixed Amount' as 'Fixed Amount' | 'Percentage',
    value: 5000,
    status: 'Active' as 'Active' | 'Inactive',
    description: '',
  })

  // KPI Calculations
  const totalComponents = components.length
  const allowanceCount = components.filter((c) => c.type === 'Allowance').length
  const deductionCount = components.filter((c) => c.type === 'Deduction').length
  const activeCount = components.filter((c) => c.status === 'Active').length

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormState({
      name: '',
      code: '',
      type: 'Allowance',
      calculationType: 'Fixed Amount',
      value: 5000,
      status: 'Active',
      description: '',
    })
    setIsAddOpen(true)
  }

  const handleOpenEdit = (comp: SalaryComponent) => {
    setEditingId(comp.id)
    setFormState({
      name: comp.name,
      code: comp.code,
      type: comp.type,
      calculationType: comp.calculationType,
      value: comp.value,
      status: comp.status,
      description: comp.description || '',
    })
    setIsAddOpen(true)
  }

  const handleDelete = (comp: SalaryComponent) => {
    setComponents((prev) => prev.filter((c) => c.id !== comp.id))
    toast.success(`Component ${comp.name} (${comp.code}) deleted`)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.name.trim() || !formState.code.trim()) {
      toast.error('Please enter component name and code')
      return
    }

    if (editingId) {
      setComponents((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: formState.name,
                code: formState.code.toUpperCase(),
                type: formState.type,
                calculationType: formState.calculationType,
                value: Number(formState.value),
                status: formState.status,
                description: formState.description,
              }
            : c
        )
      )
      toast.success(`Salary component ${formState.name} updated`)
    } else {
      const newComp: SalaryComponent = {
        id: `sc-custom-${Date.now()}`,
        name: formState.name,
        code: formState.code.toUpperCase(),
        type: formState.type,
        calculationType: formState.calculationType,
        value: Number(formState.value),
        status: formState.status,
        description: formState.description,
      }
      setComponents((prev) => [...prev, newComp])
      toast.success(`Salary component ${newComp.name} added`)
    }

    setIsAddOpen(false)
  }

  const filters: TableFilter<SalaryComponent>[] = [
    {
      key: 'type',
      label: 'Type',
      options: ['Allowance', 'Deduction'],
      value: (c) => c.type,
    },
    {
      key: 'status',
      label: 'Status',
      options: ['Active', 'Inactive'],
      value: (c) => c.status,
    },
  ]

  const columns: Column<SalaryComponent>[] = [
    {
      key: 'code',
      header: 'Code',
      cell: (c) => (
        <span className="font-mono text-xs font-bold text-primary">{c.code}</span>
      ),
      sortValue: (c) => c.code,
    },
    {
      key: 'name',
      header: 'Component Name',
      cell: (c) => (
        <div>
          <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
            {c.name}
          </p>
          {c.description && (
            <p className="text-[11px] text-muted-foreground truncate max-w-[280px]">
              {c.description}
            </p>
          )}
        </div>
      ),
      sortValue: (c) => c.name,
    },
    {
      key: 'type',
      header: 'Classification',
      cell: (c) => (
        <Badge
          variant="outline"
          className={
            c.type === 'Allowance'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200'
              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200'
          }
        >
          {c.type}
        </Badge>
      ),
      sortValue: (c) => c.type,
    },
    {
      key: 'calculationType',
      header: 'Calculation Method',
      cell: (c) => (
        <span className="text-xs text-muted-foreground">{c.calculationType}</span>
      ),
      sortValue: (c) => c.calculationType,
    },
    {
      key: 'value',
      header: 'Value / Rate',
      cell: (c) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {c.calculationType === 'Percentage' ? `${c.value}%` : formatBDT(c.value)}
        </span>
      ),
      sortValue: (c) => c.value,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (c) => (
        <Badge
          variant="outline"
          className={
            c.status === 'Active'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200'
              : 'bg-muted text-muted-foreground'
          }
        >
          {c.status}
        </Badge>
      ),
      sortValue: (c) => c.status,
    },
  ]

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Salary Components"
        description="Configure earnings allowances, statutory deductions, benefits, and calculation formulas."
        actions={
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Component
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Components"
          value={totalComponents}
          icon={Layers}
          tone="primary"
          description="Earning and deduction rules"
        />
        <StatCard
          title="Allowances"
          value={allowanceCount}
          icon={DollarSign}
          tone="emerald"
          description="Basic, HRA, Medical & Travel"
        />
        <StatCard
          title="Statutory Deductions"
          value={deductionCount}
          icon={Percent}
          tone="rose"
          description="TDS, Provident Fund, Insurance"
        />
        <StatCard
          title="Active Elements"
          value={activeCount}
          icon={CheckCircle2}
          tone="sky"
          description="Applied to salary structures"
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={components}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search components by name or code..."
        onRowClick={(c) => setSelectedComp(c)}
        toolbar={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Salary components exported to CSV')}
            className="h-9 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
        rowActions={(c) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="View details"
              onClick={() => setSelectedComp(c)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Edit component"
              onClick={() => handleOpenEdit(c)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Delete component"
              onClick={() => handleDelete(c)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      />

      {/* View Details Dialog */}
      {selectedComp && (
        <Dialog open={!!selectedComp} onOpenChange={(open) => !open && setSelectedComp(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <DialogTitle className="text-lg font-bold">
                    {selectedComp.name} ({selectedComp.code})
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Type: {selectedComp.type} · Method: {selectedComp.calculationType}
                  </DialogDescription>
                </div>
                <Badge variant="outline">{selectedComp.status}</Badge>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="flex justify-between rounded-lg border p-3 bg-muted/20">
                <span className="text-muted-foreground">Configured Value / Rate</span>
                <span className="font-mono text-base font-bold text-foreground">
                  {selectedComp.calculationType === 'Percentage'
                    ? `${selectedComp.value}% of Basic`
                    : formatBDT(selectedComp.value)}
                </span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Classification</span>
                <span className="font-semibold">{selectedComp.type}</span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Calculation Rule</span>
                <span className="font-semibold">{selectedComp.calculationType}</span>
              </div>
              {selectedComp.description && (
                <div className="space-y-1 pt-1">
                  <span className="text-muted-foreground font-semibold">Rule Purpose</span>
                  <p className="rounded-lg border p-2.5 bg-muted/10 leading-relaxed">
                    {selectedComp.description}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedComp(null)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedComp(null)
                  handleOpenEdit(selectedComp)
                }}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit Component
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
              {editingId ? 'Edit Salary Component' : 'Add Salary Component'}
            </DialogTitle>
            <DialogDescription>
              Configure an allowance or deduction component for the compensation system.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="compCode">Component Code *</Label>
                <Input
                  id="compCode"
                  placeholder="e.g. HRA"
                  value={formState.code}
                  onChange={(e) => setFormState({ ...formState, code: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="compType">Type *</Label>
                <Select
                  value={formState.type}
                  onValueChange={(val) =>
                    setFormState({ ...formState, type: val as 'Allowance' | 'Deduction' })
                  }
                >
                  <SelectTrigger id="compType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Allowance">Allowance (Earning)</SelectItem>
                    <SelectItem value="Deduction">Deduction (Withholding)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="compName">Component Name *</Label>
              <Input
                id="compName"
                placeholder="e.g. House Rent Allowance"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="calcType">Calculation Method</Label>
                <Select
                  value={formState.calculationType}
                  onValueChange={(val) =>
                    setFormState({
                      ...formState,
                      calculationType: val as 'Fixed Amount' | 'Percentage',
                    })
                  }
                >
                  <SelectTrigger id="calcType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed Amount">Fixed Amount (BDT)</SelectItem>
                    <SelectItem value="Percentage">Percentage of Basic (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="compValue">
                  {formState.calculationType === 'Percentage' ? 'Percentage (%) *' : 'Amount (BDT) *'}
                </Label>
                <Input
                  id="compValue"
                  type="number"
                  min="0"
                  value={formState.value}
                  onChange={(e) =>
                    setFormState({ ...formState, value: Number(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="compDesc">Description / Policy Rule</Label>
              <Input
                id="compDesc"
                placeholder="e.g. Standard 50% basic house rental subsidy"
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? 'Save Changes' : 'Create Component'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
