import { useState } from 'react'
import { toast } from 'sonner'
import {
  Receipt,
  Plus,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  Download,
  CreditCard,
  FileText,
  DollarSign,
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
import { Textarea } from '@/components/ui/textarea'
import { mockExpenses as initialExpenses } from '@/mocks/accountingData'
import { employees } from '@/mocks/data'
import { formatBDT } from './accountingUtils'
import type { ExpenseClaim } from '@/types/accounting'

const expenseCategories = [
  'Software Subscriptions',
  'Hardware & Accessories',
  'Office Supplies',
  'Travel & Conveyance',
  'Client Entertainment & Meals',
  'Recruitment & Job Portals',
  'Utilities & Internet',
]

const statusStyles: Record<string, string> = {
  Pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200',
  Approved: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200',
  Paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200',
  Rejected: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200',
}

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState<ExpenseClaim[]>(initialExpenses)
  const [selectedExpense, setSelectedExpense] = useState<ExpenseClaim | null>(null)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [newClaim, setNewClaim] = useState({
    employeeName: `${employees[0]!.firstName} ${employees[0]!.lastName}`,
    department: employees[0]!.department,
    category: expenseCategories[0]!,
    amount: 15000,
    date: new Date().toISOString().split('T')[0]!,
    description: '',
  })

  // KPI Calculations
  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
  const pendingCount = expenses.filter((e) => e.status === 'Pending').length
  const approvedCount = expenses.filter((e) => e.status === 'Approved').length
  const paidCount = expenses.filter((e) => e.status === 'Paid').length

  const updateStatus = (id: string, newStatus: ExpenseClaim['status']) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    )
    if (selectedExpense?.id === id) {
      setSelectedExpense({ ...selectedExpense, status: newStatus })
    }
    toast.success(`Expense claim updated to ${newStatus}`)
  }

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault()
    if (newClaim.amount <= 0 || !newClaim.description.trim()) {
      toast.error('Please provide a valid amount and description')
      return
    }

    const created: ExpenseClaim = {
      id: `exp-custom-${Date.now()}`,
      expenseNumber: `EXP-2026-${String(expenses.length + 80).padStart(3, '0')}`,
      employeeName: newClaim.employeeName,
      department: newClaim.department,
      category: newClaim.category,
      amount: Number(newClaim.amount),
      date: newClaim.date,
      status: 'Pending',
      description: newClaim.description,
      receiptAttached: true,
    }

    setExpenses((prev) => [created, ...prev])
    setIsSubmitOpen(false)
    toast.success(`Expense claim ${created.expenseNumber} submitted for approval`)
  }

  const filters: TableFilter<ExpenseClaim>[] = [
    {
      key: 'status',
      label: 'Status',
      options: ['Pending', 'Approved', 'Paid', 'Rejected'],
      value: (e) => e.status,
    },
    {
      key: 'category',
      label: 'Category',
      options: expenseCategories,
      value: (e) => e.category,
    },
  ]

  const columns: Column<ExpenseClaim>[] = [
    {
      key: 'expenseNumber',
      header: 'Claim #',
      cell: (e) => (
        <span className="font-mono text-xs font-bold text-primary">{e.expenseNumber}</span>
      ),
      sortValue: (e) => e.expenseNumber,
    },
    {
      key: 'employeeName',
      header: 'Employee',
      cell: (e) => (
        <div>
          <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
            {e.employeeName}
          </p>
          <p className="text-[11px] text-muted-foreground">{e.department}</p>
        </div>
      ),
      sortValue: (e) => e.employeeName,
    },
    {
      key: 'category',
      header: 'Category',
      cell: (e) => <span className="text-xs font-medium">{e.category}</span>,
      sortValue: (e) => e.category,
    },
    {
      key: 'date',
      header: 'Date',
      cell: (e) => <span className="text-xs text-muted-foreground">{e.date}</span>,
      sortValue: (e) => e.date,
    },
    {
      key: 'amount',
      header: 'Amount (BDT)',
      cell: (e) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {formatBDT(e.amount)}
        </span>
      ),
      sortValue: (e) => e.amount,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (e) => (
        <Badge variant="outline" className={`text-xs px-2 py-0.5 ${statusStyles[e.status]}`}>
          {e.status}
        </Badge>
      ),
      sortValue: (e) => e.status,
    },
  ]

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <PageHeader
        title="Expense Management"
        description="Employee business claims, travel conveyance vouchers, approvals, and reimbursements."
        actions={
          <Button onClick={() => setIsSubmitOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Submit Expense Claim
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Claims (YTD)"
          value={formatBDT(totalExpenseAmount)}
          icon={Receipt}
          tone="primary"
          description="Across all operating units"
        />
        <StatCard
          title="Pending Approval"
          value={pendingCount}
          icon={Clock3}
          tone="amber"
          description="Requires department sign-off"
        />
        <StatCard
          title="Approved for Payment"
          value={approvedCount}
          icon={CheckCircle2}
          tone="violet"
          description="Ready for cash/bank release"
        />
        <StatCard
          title="Disbursed & Settled"
          value={paidCount}
          icon={CreditCard}
          tone="emerald"
          description="Reimbursed to employee accounts"
        />
      </div>

      {/* Main DataTable */}
      <DataTable
        data={expenses}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search expense claims by employee, category, or note..."
        onRowClick={(e) => setSelectedExpense(e)}
        toolbar={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Expense claims exported to CSV')}
            className="h-9 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export Claims
          </Button>
        }
        rowActions={(e) => (
          <div className="flex items-center gap-1" onClick={(ev) => ev.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="View claim details"
              onClick={() => setSelectedExpense(e)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {e.status === 'Pending' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
                title="Approve claim"
                onClick={() => updateStatus(e.id, 'Approved')}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
            {e.status === 'Approved' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:text-primary/80"
                title="Mark as Paid"
                onClick={() => updateStatus(e.id, 'Paid')}
              >
                <CreditCard className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      />

      {/* Claim Details Dialog */}
      {selectedExpense && (
        <Dialog open={!!selectedExpense} onOpenChange={(open) => !open && setSelectedExpense(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <DialogTitle className="text-lg font-bold">
                    {selectedExpense.expenseNumber}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {selectedExpense.employeeName} ({selectedExpense.department})
                  </DialogDescription>
                </div>
                <Badge variant="outline" className={statusStyles[selectedExpense.status]}>
                  {selectedExpense.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="flex justify-between rounded-lg border p-3 bg-muted/20">
                <span className="text-muted-foreground">Claim Amount</span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {formatBDT(selectedExpense.amount)}
                </span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Category</span>
                <span className="font-semibold">{selectedExpense.category}</span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Claim Date</span>
                <span className="font-semibold">{selectedExpense.date}</span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-muted-foreground font-semibold">Description / Purpose</span>
                <p className="rounded-lg border p-2.5 bg-muted/10 leading-relaxed">
                  {selectedExpense.description}
                </p>
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => setSelectedExpense(null)}>
                Close
              </Button>
              <div className="flex items-center gap-2">
                {selectedExpense.status === 'Pending' && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => updateStatus(selectedExpense.id, 'Approved')}
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    Approve Claim
                  </Button>
                )}
                {selectedExpense.status === 'Approved' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus(selectedExpense.id, 'Paid')}
                  >
                    <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                    Disburse Reimbursement
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Submit Claim Dialog */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Expense Claim</DialogTitle>
            <DialogDescription>
              Submit an out-of-pocket business expense for review and reimbursement.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitClaim} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="claimEmp">Employee</Label>
                <Select
                  value={newClaim.employeeName}
                  onValueChange={(val) => {
                    const emp = employees.find((e) => `${e.firstName} ${e.lastName}` === val)
                    setNewClaim({
                      ...newClaim,
                      employeeName: val,
                      department: emp ? emp.department : newClaim.department,
                    })
                  }}
                >
                  <SelectTrigger id="claimEmp">
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

              <div className="space-y-1.5">
                <Label htmlFor="claimCat">Expense Category</Label>
                <Select
                  value={newClaim.category}
                  onValueChange={(val) => setNewClaim({ ...newClaim, category: val })}
                >
                  <SelectTrigger id="claimCat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="claimAmount">Amount (BDT) *</Label>
                <Input
                  id="claimAmount"
                  type="number"
                  min="1"
                  value={newClaim.amount}
                  onChange={(e) =>
                    setNewClaim({ ...newClaim, amount: Number(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="claimDate">Expense Incurred Date</Label>
                <Input
                  id="claimDate"
                  type="date"
                  value={newClaim.date}
                  onChange={(e) => setNewClaim({ ...newClaim, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="claimDesc">Business Justification & Note *</Label>
              <Textarea
                id="claimDesc"
                placeholder="e.g. Purchased software team licenses for new quarter project"
                value={newClaim.description}
                onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsSubmitOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="mr-1.5 h-4 w-4" />
                Submit Claim
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
