import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  CreditCard,
  Plus,
  Eye,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Banknote,
  DollarSign,
  TrendingDown,
  Building,
  User,
  Clock,
  Sparkles,
  ChevronRight,
  Receipt,
  Check,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Progress } from '@/components/ui/progress'
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
import { Separator } from '@/components/ui/separator'
import { employees } from '@/mocks/data'
import {
  useFinanceStore,
  newLoanId,
  generateInstallmentSchedule,
} from '@/hooks/use-finance-store'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Loan, LoanInstallment } from '@/types'

const LOAN_TYPES = [
  'Personal Loan',
  'Home Loan',
  'Vehicle Loan',
  'Education Loan',
  'Emergency Medical Loan',
]

const INSTALLMENT_OPTIONS = [
  { value: 6, label: '6 Installments (6 Months)' },
  { value: 12, label: '12 Installments (1 Year)' },
  { value: 18, label: '18 Installments (1.5 Years)' },
  { value: 24, label: '24 Installments (2 Years)' },
  { value: 36, label: '36 Installments (3 Years)' },
  { value: 48, label: '48 Installments (4 Years)' },
  { value: 60, label: '60 Installments (5 Years)' },
]

const LOAN_PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'bKash',
  'Nagad',
  'Cheque',
  'Salary Deduction',
] as const

const METHODS_WITH_REFERENCE = new Set(['Bank Transfer', 'bKash', 'Nagad', 'Cheque'])

export default function EmployeeLoans() {
  const loans = useFinanceStore((s) => s.loans)
  const addLoan = useFinanceStore((s) => s.addLoan)
  const updateLoanStatus = useFinanceStore((s) => s.updateLoanStatus)
  const recordLoanInstallment = useFinanceStore((s) => s.recordLoanInstallment)

  // Dialog states
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isPayInstallmentOpen, setIsPayInstallmentOpen] = useState(false)
  const [loanToPay, setLoanToPay] = useState<Loan | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [transactionReference, setTransactionReference] = useState('')

  // Form states
  const [employeeName, setEmployeeName] = useState(
    `${employees[0]!.firstName} ${employees[0]!.lastName}`
  )
  const [loanType, setLoanType] = useState('Personal Loan')
  const [amount, setAmount] = useState<number>(20000)
  const [installmentsCount, setInstallmentsCount] = useState<number>(12)
  const [startDate, setStartDate] = useState('2026-11-22')
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState<'Active' | 'Pending'>('Active')

  // Top KPI calculations
  const totalLoanAmount = loans.reduce((sum, l) => sum + l.amount, 0)
  const totalOutstanding = loans.reduce((sum, l) => sum + l.outstanding, 0)
  const activeLoans = loans.filter((l) => l.status === 'Active')
  const totalMonthlyEmi = activeLoans.reduce((sum, l) => sum + l.emi, 0)

  // Auto-calculated monthly installment & maturity date
  const calculatedEmi =
    installmentsCount > 0 ? Math.round(amount / installmentsCount) : 0

  const calculatedEndDate = useMemo(() => {
    try {
      const d = new Date(startDate || '2026-11-22')
      d.setMonth(d.getMonth() + Number(installmentsCount || 12))
      return d.toISOString().slice(0, 10)
    } catch {
      return '2027-11-22'
    }
  }, [startDate, installmentsCount])

  const handleOpenIssueModal = () => {
    const emp = employees[0]!
    setEmployeeName(`${emp.firstName} ${emp.lastName}`)
    setLoanType('Personal Loan')
    setAmount(20000)
    setInstallmentsCount(12)
    setStartDate(new Date().toISOString().slice(0, 10))
    setReason('')
    setStatus('Active')
    setIsIssueModalOpen(true)
  }

  const handleIssueLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeName.trim()) {
      toast.error('Please select an employee')
      return
    }

    if (amount <= 0) {
      toast.error('Please enter a valid loan amount greater than zero')
      return
    }

    if (installmentsCount <= 0) {
      toast.error('Please specify a valid number of installments')
      return
    }

    const fullSchedule = generateInstallmentSchedule(
      amount,
      installmentsCount,
      startDate,
      0
    )

    const newLoan: Loan = {
      id: newLoanId(),
      employee: employeeName,
      type: loanType,
      amount: Number(amount),
      outstanding: Number(amount),
      emi: calculatedEmi,
      startDate,
      endDate: calculatedEndDate,
      status,
      totalInstallments: Number(installmentsCount),
      paidInstallments: 0,
      installments: fullSchedule,
    }

    addLoan(newLoan)
    setIsIssueModalOpen(false)
    toast.success(
      `Loan of ${formatCurrency(amount)} successfully issued to ${employeeName}`,
      {
        description: `${installmentsCount} Monthly Installments of ${formatCurrency(calculatedEmi)} · Status: ${status}`,
      }
    )
  }

  // Handle Pay Installment
  const handleOpenPayInstallment = (loan: Loan) => {
    setLoanToPay(loan)
    setPaymentMethod('')
    setTransactionReference('')
    setIsPayInstallmentOpen(true)
  }

  const handleConfirmInstallmentPayment = () => {
    if (!loanToPay || !paymentMethod) return

    const installmentNum = (loanToPay.paidInstallments || 0) + 1
    const emiAmount = Math.min(loanToPay.emi, loanToPay.outstanding)
    const trimmedRef = METHODS_WITH_REFERENCE.has(paymentMethod)
      ? transactionReference.trim() || undefined
      : undefined

    recordLoanInstallment(loanToPay.id, emiAmount, trimmedRef, paymentMethod)

    setIsPayInstallmentOpen(false)
    toast.success(
      `Installment #${installmentNum} of ${formatCurrency(emiAmount)} recorded for ${loanToPay.employee}`,
      {
        description: `Method: ${paymentMethod} · Remaining balance: ${formatCurrency(Math.max(0, loanToPay.outstanding - emiAmount))}`,
      }
    )
  }

  const filters: TableFilter<Loan>[] = [
    {
      key: 'status',
      label: 'Status',
      options: ['Active', 'Completed', 'Pending'],
      value: (r) => r.status,
    },
    {
      key: 'type',
      label: 'Loan Types',
      options: Array.from(new Set(loans.map((l) => l.type))),
      value: (r) => r.type,
    },
  ]

  const columns: Column<Loan>[] = [
    {
      key: 'employee',
      header: 'Employee',
      cell: (l) => (
        <div>
          <span className="font-semibold text-foreground block">{l.employee}</span>
          <span className="text-[11px] text-muted-foreground">{l.type}</span>
        </div>
      ),
      sortValue: (l) => l.employee,
    },
    {
      key: 'amount',
      header: 'Principal',
      cell: (l) => (
        <span className="font-mono font-medium">{formatCurrency(l.amount)}</span>
      ),
      sortValue: (l) => l.amount,
    },
    {
      key: 'outstanding',
      header: 'Outstanding Balance',
      cell: (l) => {
        const repaid = Math.max(0, l.amount - l.outstanding)
        const percent = l.amount > 0 ? Math.round((repaid / l.amount) * 100) : 100
        return (
          <div className="w-36 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-mono font-bold text-primary">
                {formatCurrency(l.outstanding)}
              </span>
              <span className="text-[10px] text-muted-foreground">{percent}% repaid</span>
            </div>
            <Progress value={percent} className="h-1.5" />
          </div>
        )
      },
      sortValue: (l) => l.outstanding,
    },
    {
      key: 'emi',
      header: 'Monthly Installment (EMI)',
      cell: (l) => (
        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(l.emi)}
        </span>
      ),
      sortValue: (l) => l.emi,
    },
    {
      key: 'installments',
      header: 'Installments Progress',
      cell: (l) => {
        const total = l.totalInstallments || (l.emi > 0 ? Math.round(l.amount / l.emi) : 12)
        const paid = l.paidInstallments !== undefined
          ? l.paidInstallments
          : l.emi > 0
            ? Math.min(total, Math.round((l.amount - l.outstanding) / l.emi))
            : 0
        const isFinished = paid >= total || l.outstanding === 0

        return (
          <div className="w-32 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-foreground">
                {paid} / {total} Paid
              </span>
              <span className="text-muted-foreground text-[10px]">
                {Math.max(0, total - paid)} left
              </span>
            </div>
            <Progress
              value={total > 0 ? Math.round((paid / total) * 100) : 0}
              className={`h-1.5 ${isFinished ? '[&>div]:bg-emerald-500' : ''}`}
            />
          </div>
        )
      },
      sortValue: (l) => l.paidInstallments ?? 0,
    },
    {
      key: 'endDate',
      header: 'End Date',
      cell: (l) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(l.endDate, { month: 'short', year: 'numeric' })}
        </span>
      ),
      sortValue: (l) => l.endDate,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (l) => <StatusBadge status={l.status} />,
      sortValue: (l) => l.status,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header with Action Button */}
      <PageHeader
        title="Employee Loans"
        description="Track loans, manage monthly installment schedules, and issue corporate loans with automated payroll deductions."
        actions={
          <Button
            onClick={handleOpenIssueModal}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium shadow-md shadow-indigo-500/20 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Issue Loan
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Loans Granted"
          value={formatCurrency(totalLoanAmount)}
          icon={CreditCard}
          tone="primary"
          description="Cumulative principal disbursed"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(totalOutstanding)}
          icon={TrendingDown}
          tone="amber"
          description="Pending repayment across staff"
        />
        <StatCard
          title="Monthly Installment Inflow"
          value={formatCurrency(totalMonthlyEmi)}
          icon={Banknote}
          tone="emerald"
          trend={3.8}
          description="Deducted monthly via payroll"
        />
        <StatCard
          title="Active Loan Accounts"
          value={activeLoans.length}
          icon={DollarSign}
          tone="violet"
          description={`${loans.length} total loan applications`}
        />
      </div>

      {/* Main DataTable */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <DataTable
            data={loans}
            columns={columns}
            filters={filters}
            searchPlaceholder="Search loans by employee, type..."
            onRowClick={(row) => {
              setSelectedLoan(row)
              setIsViewModalOpen(true)
            }}
            rowActions={(row) => {
              const totalInst =
                row.totalInstallments ||
                (row.emi > 0 ? Math.round(row.amount / row.emi) : 12)
              const paidInst =
                row.paidInstallments !== undefined
                  ? row.paidInstallments
                  : row.emi > 0
                    ? Math.min(totalInst, Math.round((row.amount - row.outstanding) / row.emi))
                    : 0
              const canPayInstallment =
                row.status === 'Active' && row.outstanding > 0 && paidInst < totalInst

              return (
                <div
                  className="flex items-center justify-end gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Action 1: Pay Installment Button */}
                  {canPayInstallment && (
                    <Button
                      size="sm"
                      className="h-8 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1"
                      title="Record this month's installment deduction"
                      onClick={() => handleOpenPayInstallment(row)}
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      Pay Installment
                    </Button>
                  )}

                  {/* Action 2: View Details / Schedule Modal */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="View Installment Schedule & Details"
                    onClick={() => {
                      setSelectedLoan(row)
                      setIsViewModalOpen(true)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {/* Action 3: Approve if Pending */}
                  {row.status === 'Pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      title="Approve & Activate Loan"
                      onClick={() => {
                        updateLoanStatus(row.id, 'Active')
                        toast.success(`Loan for ${row.employee} marked as Active`)
                      }}
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Approve
                    </Button>
                  )}
                </div>
              )
            }}
          />
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* 1. MODERN ISSUE LOAN MODAL                                     */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
        <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto sm:rounded-2xl p-6">
          <DialogHeader className="pb-3 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  Issue Employee Loan
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Grant a new corporate loan account with scheduled payroll deductions.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleIssueLoanSubmit} className="space-y-4 pt-3">
            {/* Beneficiary Employee Picker */}
            <div className="space-y-1.5">
              <Label htmlFor="loan-emp" className="text-xs font-semibold text-foreground">
                Select Beneficiary Employee <span className="text-rose-500">*</span>
              </Label>
              <Select value={employeeName} onValueChange={setEmployeeName}>
                <SelectTrigger id="loan-emp" className="h-10 text-sm bg-background">
                  <SelectValue placeholder="Choose employee" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {employees.map((emp) => (
                    <SelectItem
                      key={emp.id}
                      value={`${emp.firstName} ${emp.lastName}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-foreground">
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

            {/* Loan Type & Principal Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="loan-type" className="text-xs font-semibold">
                  Loan Type <span className="text-rose-500">*</span>
                </Label>
                <Select value={loanType} onValueChange={setLoanType}>
                  <SelectTrigger id="loan-type" className="h-10 text-sm bg-background">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Principal Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="loan-amount" className="text-xs font-semibold">
                  Principal Amount <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="loan-amount"
                    type="number"
                    min={500}
                    step={500}
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="h-10 pl-7 font-mono text-base font-bold text-foreground"
                    placeholder="20000"
                  />
                </div>
              </div>
            </div>

            {/* Installments & Disbursement Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Installments Select */}
              <div className="space-y-1.5">
                <Label htmlFor="loan-installments" className="text-xs font-semibold">
                  Installments <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={String(installmentsCount)}
                  onValueChange={(val) => setInstallmentsCount(Number(val))}
                >
                  <SelectTrigger id="loan-installments" className="h-10 text-sm bg-background">
                    <SelectValue placeholder="Select installments" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTALLMENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Disbursement Date */}
              <div className="space-y-1.5">
                <Label htmlFor="loan-date" className="text-xs font-semibold">
                  Disbursement Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="loan-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 text-sm bg-background"
                />
              </div>
            </div>

            {/* MODERN LIVE INSTALLMENT SUMMARY CARD */}
            <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    Installment Summary
                  </span>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono bg-background">
                  {installmentsCount} Monthly Deductions
                </Badge>
              </div>

              {/* 3-Column Modern Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Principal</span>
                  <span className="font-mono text-sm font-bold text-foreground">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Monthly Installment</span>
                  <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(calculatedEmi)}{' '}
                    <span className="text-[10px] font-normal text-muted-foreground">/ mo</span>
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Maturity Date</span>
                  <span className="font-medium text-foreground text-sm">
                    {calculatedEndDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Loan Purpose */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="loan-status" className="text-xs font-semibold">
                  Initial Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(val: 'Active' | 'Pending') => setStatus(val)}
                >
                  <SelectTrigger id="loan-status" className="h-10 text-sm bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active (Disburse Immediately)</SelectItem>
                    <SelectItem value="Pending">Pending Approval</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="loan-reason" className="text-xs font-semibold">
                  Loan Purpose / Note{' '}
                  <span className="text-muted-foreground text-[10px]">(Optional)</span>
                </Label>
                <Input
                  id="loan-reason"
                  placeholder="e.g. Home purchase, Emergency urgent"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-10 text-sm bg-background"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsIssueModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                Issue & Disburse Loan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* 2. RECORD / PAY INSTALLMENT DIALOG                             */}
      {/* ------------------------------------------------------------- */}
      {loanToPay && (
        <Dialog open={isPayInstallmentOpen} onOpenChange={setIsPayInstallmentOpen}>
          <DialogContent className="max-w-md sm:rounded-2xl p-6">
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">
                    Record Loan Installment Payment
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Deduct scheduled monthly installment against employee loan balance.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-xl border bg-muted/20 p-4 space-y-2.5">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Borrower</span>
                  <span className="font-semibold text-foreground text-sm">
                    {loanToPay.employee}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Installment Target</span>
                  <Badge variant="outline" className="font-mono text-xs font-semibold">
                    Installment #{(loanToPay.paidInstallments || 0) + 1} of{' '}
                    {loanToPay.totalInstallments || Math.round(loanToPay.amount / loanToPay.emi)}
                  </Badge>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Installment Amount Due</span>
                  <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(Math.min(loanToPay.emi, loanToPay.outstanding))}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Current Outstanding</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatCurrency(loanToPay.outstanding)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Balance After Payment</span>
                  <span className="font-mono font-bold text-primary">
                    {formatCurrency(
                      Math.max(0, loanToPay.outstanding - Math.min(loanToPay.emi, loanToPay.outstanding))
                    )}
                  </span>
                </div>
              </div>

              {/* Payment Method (Required) */}
              <div className="space-y-1.5">
                <Label htmlFor="installment-payment-method" className="text-xs font-semibold">
                  Payment Method <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(val) => {
                    setPaymentMethod(val)
                    if (!METHODS_WITH_REFERENCE.has(val)) {
                      setTransactionReference('')
                    }
                  }}
                >
                  <SelectTrigger id="installment-payment-method" className="h-10 text-sm bg-background">
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Reference (Optional for Bank Transfer, bKash, Nagad, Cheque) */}
              {METHODS_WITH_REFERENCE.has(paymentMethod) && (
                <div className="space-y-1.5">
                  <Label htmlFor="installment-tx-ref" className="text-xs font-semibold">
                    Transaction Reference{' '}
                    <span className="text-muted-foreground text-[10px]">(Optional)</span>
                  </Label>
                  <Input
                    id="installment-tx-ref"
                    placeholder="e.g. TXN-123456 or Cheque #"
                    value={transactionReference}
                    onChange={(e) => setTransactionReference(e.target.value)}
                    className="h-10 text-sm bg-background font-mono"
                  />
                </div>
              )}

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>
                  This installment will be logged as paid in the loan ledger and deducted from the outstanding principal balance.
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPayInstallmentOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!paymentMethod}
                onClick={handleConfirmInstallmentPayment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                Confirm Installment Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. VIEW LOAN DETAILS & FULL INSTALLMENT SCHEDULE MODAL        */}
      {/* ------------------------------------------------------------- */}
      {selectedLoan && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-2xl p-6">
            <DialogHeader className="border-b pb-3">
              <div className="flex items-center justify-between pr-4">
                <div>
                  <DialogTitle className="text-xl font-bold">
                    Loan Account & Installment Ledger
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Ref: {selectedLoan.id.toUpperCase()} · {selectedLoan.type}
                  </DialogDescription>
                </div>
                <StatusBadge status={selectedLoan.status} />
              </div>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Borrower & Principal Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border bg-muted/20 p-4 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Borrower</span>
                  <span className="font-semibold text-foreground text-sm block truncate">
                    {selectedLoan.employee}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Principal</span>
                  <span className="font-mono font-bold text-foreground text-sm block">
                    {formatCurrency(selectedLoan.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Outstanding</span>
                  <span className="font-mono font-bold text-primary text-sm block">
                    {formatCurrency(selectedLoan.outstanding)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Monthly EMI</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm block">
                    {formatCurrency(selectedLoan.emi)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">
                    Installment Repayment Progress
                  </span>
                  <span className="font-mono font-bold">
                    {selectedLoan.paidInstallments ||
                      Math.round(
                        (selectedLoan.amount - selectedLoan.outstanding) / selectedLoan.emi
                      )}{' '}
                    of{' '}
                    {selectedLoan.totalInstallments ||
                      Math.round(selectedLoan.amount / selectedLoan.emi)}{' '}
                    Installments Settled
                  </span>
                </div>
                <Progress
                  value={
                    selectedLoan.amount > 0
                      ? Math.round(
                          ((selectedLoan.amount - selectedLoan.outstanding) /
                            selectedLoan.amount) *
                            100
                        )
                      : 100
                  }
                  className="h-2.5"
                />
              </div>

              {/* Full Installment Schedule Table */}
              <div className="rounded-xl border p-4 space-y-3 bg-card">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Receipt className="h-4 w-4 text-primary" />
                    Installment Payment Schedule
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatCurrency(selectedLoan.emi)} / installment
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b text-[10px] font-bold uppercase text-muted-foreground">
                        <th className="pb-2">Installment #</th>
                        <th className="pb-2">Due Date</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Method</th>
                        <th className="pb-2 text-right">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(
                        selectedLoan.installments ||
                        generateInstallmentSchedule(
                          selectedLoan.amount,
                          selectedLoan.totalInstallments ||
                            Math.round(selectedLoan.amount / selectedLoan.emi),
                          selectedLoan.startDate,
                          selectedLoan.paidInstallments || 0
                        )
                      ).map((inst) => (
                        <tr key={inst.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2 font-mono font-medium">
                            Installment #{inst.number}
                          </td>
                          <td className="py-2 text-muted-foreground">{inst.dueDate}</td>
                          <td className="py-2 font-mono font-bold text-foreground">
                            {formatCurrency(inst.amount)}
                          </td>
                          <td className="py-2">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold ${
                                inst.status === 'Paid'
                                  ? 'bg-emerald-600 text-white border-0'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {inst.status}
                            </Badge>
                          </td>
                          <td className="py-2 text-muted-foreground">
                            {inst.paymentMethod || (inst.status === 'Paid' ? 'Salary Deduction' : '—')}
                          </td>
                          <td className="py-2 text-right font-mono text-[11px] text-muted-foreground">
                            {inst.paymentReference || 'Scheduled'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center">
              {selectedLoan.status === 'Active' && selectedLoan.outstanding > 0 && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5"
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleOpenPayInstallment(selectedLoan)
                  }}
                >
                  <Receipt className="h-3.5 w-3.5" />
                  Pay Next Installment
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
