import { useState } from 'react'
import { toast } from 'sonner'
import {
  Check,
  X,
  Plus,
  Coins,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle2,
  TrendingDown,
  Clock,
  Sparkles,
  Banknote,
  DollarSign,
  Smartphone,
  CreditCard,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
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
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { employees } from '@/mocks/data'
import { useFinanceStore, newAdvanceId } from '@/hooks/use-finance-store'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Advance } from '@/types'

const ADVANCE_REASONS = [
  'Medical emergency',
  'Home repairs',
  'Travel / Commute',
  'Wedding expenses',
  'Education fees',
  'Rent deposit',
  'Family urgent expense',
  'Festival celebration',
]

export default function SalaryAdvances() {
  const advances = useFinanceStore((s) => s.advances)
  const addAdvance = useFinanceStore((s) => s.addAdvance)
  const updateAdvanceStatus = useFinanceStore((s) => s.updateAdvanceStatus)

  // Modal states
  const [isGiveModalOpen, setIsGiveModalOpen] = useState(false)
  const [selectedAdvance, setSelectedAdvance] = useState<Advance | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Form states
  const [employeeName, setEmployeeName] = useState(
    `${employees[0]!.firstName} ${employees[0]!.lastName}`
  )
  const [amount, setAmount] = useState<number>(3000)
  const [reason, setReason] = useState('Medical emergency')
  const [customReason, setCustomReason] = useState('')
  const [recoveryMonths, setRecoveryMonths] = useState<number>(3)
  const [requestDate, setRequestDate] = useState('2026-11-22')
  const [payoutMethod, setPayoutMethod] = useState('Bank Transfer')
  const [status, setStatus] = useState<'Approved' | 'Pending'>('Approved')

  // Top KPI calculations
  const totalAdvancesSum = advances.reduce((s, a) => s + a.amount, 0)
  const pendingAdvances = advances.filter((a) => a.status === 'Pending')
  const approvedAdvances = advances.filter((a) => a.status === 'Approved')
  const recoveredAdvances = advances.filter((a) => a.status === 'Recovered')

  // Calculated monthly payroll deduction
  const monthlyDeduction =
    recoveryMonths > 0 ? Math.round(amount / recoveryMonths) : amount

  const handleOpenGiveModal = () => {
    const emp = employees[0]!
    setEmployeeName(`${emp.firstName} ${emp.lastName}`)
    setAmount(3000)
    setReason('Medical emergency')
    setCustomReason('')
    setRecoveryMonths(3)
    setRequestDate(new Date().toISOString().slice(0, 10))
    setPayoutMethod('Bank Transfer')
    setStatus('Approved')
    setIsGiveModalOpen(true)
  }

  const handleGiveAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeName.trim()) {
      toast.error('Please select an employee')
      return
    }

    if (amount <= 0) {
      toast.error('Advance amount must be greater than zero')
      return
    }

    if (recoveryMonths <= 0) {
      toast.error('Please select a valid recovery period')
      return
    }

    const finalReason = customReason.trim() || reason

    const newAdv: Advance = {
      id: newAdvanceId(),
      employee: employeeName,
      amount: Number(amount),
      reason: finalReason,
      requestDate,
      status,
      recoveryMonths: Number(recoveryMonths),
    }

    addAdvance(newAdv)
    setIsGiveModalOpen(false)
    toast.success(
      `Salary advance of ${formatCurrency(amount)} successfully granted to ${employeeName}`,
      {
        description: `Recovery: ${recoveryMonths} month${recoveryMonths > 1 ? 's' : ''} (${formatCurrency(monthlyDeduction)}/mo) · Status: ${status}`,
      }
    )
  }

  const handleUpdateStatus = (
    id: string,
    newStatus: 'Approved' | 'Rejected' | 'Recovered'
  ) => {
    updateAdvanceStatus(id, newStatus)
    toast.success(`Salary advance request marked as ${newStatus}`)
  }

  const filters: TableFilter<Advance>[] = [
    {
      key: 'status',
      label: 'Status',
      options: ['Pending', 'Approved', 'Rejected', 'Recovered'],
      value: (r) => r.status,
    },
  ]

  const columns: Column<Advance>[] = [
    {
      key: 'employee',
      header: 'Employee',
      cell: (a) => <span className="font-semibold text-foreground">{a.employee}</span>,
      sortValue: (a) => a.employee,
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (a) => (
        <span className="font-mono font-bold text-primary">
          {formatCurrency(a.amount)}
        </span>
      ),
      sortValue: (a) => a.amount,
    },
    {
      key: 'reason',
      header: 'Reason',
      cell: (a) => <span className="text-muted-foreground">{a.reason}</span>,
    },
    {
      key: 'requestDate',
      header: 'Requested Date',
      cell: (a) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(a.requestDate)}
        </span>
      ),
      sortValue: (a) => a.requestDate,
    },
    {
      key: 'recoveryMonths',
      header: 'Installments',
      cell: (a) => (
        <Badge variant="outline" className="text-xs font-mono font-medium">
          {a.recoveryMonths} {a.recoveryMonths > 1 ? 'Installments' : 'Installment'}
        </Badge>
      ),
      sortValue: (a) => a.recoveryMonths,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (a) => <StatusBadge status={a.status} />,
      sortValue: (a) => a.status,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Salary Advances"
        description="Review, approve, and grant salary advances against upcoming employee monthly payroll."
        actions={
          <Button
            onClick={handleOpenGiveModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Give Salary Advance
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Advances Disbursed"
          value={formatCurrency(totalAdvancesSum)}
          icon={Coins}
          tone="primary"
          description="Cumulative across all requests"
        />
        <StatCard
          title="Pending Review"
          value={pendingAdvances.length}
          icon={Clock}
          tone="amber"
          description="Awaiting admin approval"
        />
        <StatCard
          title="Active Approved Advances"
          value={approvedAdvances.length}
          icon={CheckCircle2}
          tone="emerald"
          description="Currently under recovery"
        />
        <StatCard
          title="Fully Recovered"
          value={recoveredAdvances.length}
          icon={TrendingDown}
          tone="violet"
          description="Deducted from past payrolls"
        />
      </div>

      {/* Main DataTable */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <DataTable
            data={advances}
            columns={columns}
            filters={filters}
            searchPlaceholder="Search advances by employee, reason..."
            onRowClick={(row) => {
              setSelectedAdvance(row)
              setIsViewModalOpen(true)
            }}
            rowActions={(a) => (
              <div
                className="flex items-center justify-end gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="View Advance Details"
                  onClick={() => {
                    setSelectedAdvance(a)
                    setIsViewModalOpen(true)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {a.status === 'Pending' && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      title="Approve Advance"
                      onClick={() => handleUpdateStatus(a.id, 'Approved')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Reject Advance"
                      onClick={() => handleUpdateStatus(a.id, 'Rejected')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {a.status === 'Approved' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    title="Mark Recovered"
                    onClick={() => handleUpdateStatus(a.id, 'Recovered')}
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Mark Recovered
                  </Button>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* 1. Give Salary Advance Dialog Modal */}
      <Dialog open={isGiveModalOpen} onOpenChange={setIsGiveModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto sm:rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Grant Salary Advance</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Disburse an immediate salary advance with monthly payroll deduction recovery.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleGiveAdvanceSubmit} className="space-y-4 py-2">
            {/* Employee Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="adv-emp" className="text-xs font-medium">
                Select Beneficiary Employee <span className="text-rose-500">*</span>
              </Label>
              <Select value={employeeName} onValueChange={setEmployeeName}>
                <SelectTrigger id="adv-emp" className="text-sm">
                  <SelectValue placeholder="Choose employee" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {employees.map((emp) => (
                    <SelectItem
                      key={emp.id}
                      value={`${emp.firstName} ${emp.lastName}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {emp.firstName} {emp.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          ({emp.employeeId} · {emp.department})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advance Amount & Installments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="adv-amount" className="text-xs font-semibold">
                  Advance Amount <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="adv-amount"
                    type="number"
                    min={200}
                    step={100}
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="h-10 pl-7 font-mono text-base font-bold text-foreground"
                    placeholder="3000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adv-tenure" className="text-xs font-semibold">
                  Installments <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={String(recoveryMonths)}
                  onValueChange={(val) => setRecoveryMonths(Number(val))}
                >
                  <SelectTrigger id="adv-tenure" className="h-10 text-sm bg-background">
                    <SelectValue placeholder="Select installments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Installment (Next Payroll)</SelectItem>
                    <SelectItem value="2">2 Installments (2 Months)</SelectItem>
                    <SelectItem value="3">3 Installments (3 Months)</SelectItem>
                    <SelectItem value="4">4 Installments (4 Months)</SelectItem>
                    <SelectItem value="5">5 Installments (5 Months)</SelectItem>
                    <SelectItem value="6">6 Installments (6 Months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Simple Modern Installment Summary Card */}
            <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    Installment Summary
                  </span>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono bg-background">
                  {recoveryMonths} Monthly Deductions
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Total Advance</span>
                  <span className="font-mono text-sm font-bold text-foreground">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Monthly Installment</span>
                  <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(monthlyDeduction)}{' '}
                    <span className="text-[10px] font-normal text-muted-foreground">/ mo</span>
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Installments</span>
                  <span className="font-medium text-foreground text-sm">
                    {recoveryMonths} {recoveryMonths === 1 ? 'Month' : 'Months'}
                  </span>
                </div>
              </div>
            </div>

            {/* Reason Category & Custom Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="adv-reason" className="text-xs font-medium">
                  Reason / Purpose Category <span className="text-rose-500">*</span>
                </Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger id="adv-reason" className="text-sm">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADVANCE_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adv-date" className="text-xs font-medium">
                  Request / Disbursement Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="adv-date"
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Payment Method & Initial Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="adv-method" className="text-xs font-medium">
                  Disbursement Channel
                </Label>
                <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                  <SelectTrigger id="adv-method" className="text-sm">
                    <SelectValue placeholder="Payout channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-emerald-600" />
                        <span>Direct Bank Wire (BEFTN)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Mobile Banking">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-violet-600" />
                        <span>Mobile Banking (bKash/Nagad)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Cash">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-amber-600" />
                        <span>Cash Disbursement Voucher</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adv-status" className="text-xs font-medium">
                  Initial Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(val: 'Approved' | 'Pending') => setStatus(val)}
                >
                  <SelectTrigger id="adv-status" className="text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approved">Approved (Grant Immediately)</SelectItem>
                    <SelectItem value="Pending">Pending (Requires Review)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGiveModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                Grant & Disburse Advance
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. View Advance Details Modal */}
      {selectedAdvance && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-md sm:rounded-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between pr-4">
                <DialogTitle className="text-lg font-bold">Salary Advance Details</DialogTitle>
                <StatusBadge status={selectedAdvance.status} />
              </div>
              <DialogDescription className="text-xs">
                Ref: {selectedAdvance.id.toUpperCase()} · Payroll Advance Record
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-xl border bg-muted/20 p-3.5 space-y-2">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Beneficiary</span>
                  <span className="font-semibold text-foreground">
                    {selectedAdvance.employee}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Advance Amount</span>
                  <span className="font-mono font-bold text-primary">
                    {formatCurrency(selectedAdvance.amount)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Reason / Purpose</span>
                  <span className="font-medium text-foreground">{selectedAdvance.reason}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Requested On</span>
                  <span className="font-medium text-foreground">
                    {formatDate(selectedAdvance.requestDate)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Installments</span>
                  <span className="font-semibold text-foreground">
                    {selectedAdvance.recoveryMonths} {selectedAdvance.recoveryMonths > 1 ? 'Installments' : 'Installment'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Monthly Installment</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(
                      Math.round(selectedAdvance.amount / selectedAdvance.recoveryMonths)
                    )}{' '}
                    / mo
                  </span>
                </div>
              </div>

              {selectedAdvance.status === 'Pending' && (
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      handleUpdateStatus(selectedAdvance.id, 'Approved')
                      setIsViewModalOpen(false)
                    }}
                  >
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Approve Advance
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                    onClick={() => {
                      handleUpdateStatus(selectedAdvance.id, 'Rejected')
                      setIsViewModalOpen(false)
                    }}
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Reject Advance
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
