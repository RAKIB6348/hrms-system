import { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Receipt,
  RotateCcw,
  Search,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { ActionIconButton } from '@/components/common/ActionIconButton'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useFinanceStore, generateInstallmentSchedule } from '@/hooks/use-finance-store'
import { employees } from '@/mocks/data'
import { formatBDT } from '@/lib/payrollUtils'
import { cn, formatDate } from '@/lib/utils'

type PaymentType =
  | 'Loan Disbursement'
  | 'Loan Installment'
  | 'Salary Advance Disbursement'
  | 'Salary Advance Repayment'

type TransactionDirection = 'Received' | 'Disbursed'

interface FinanceTransaction {
  id: string
  paymentReference: string
  paymentDate: string
  employeeName: string
  employeeId: string
  paymentType: PaymentType
  relatedReference: string
  amount: number
  paymentMethod: string
  transactionReference: string
  direction: TransactionDirection
  status: 'Paid'
  note?: string
}

type SortKey =
  | 'paymentReference'
  | 'paymentDate'
  | 'employeeName'
  | 'employeeId'
  | 'paymentType'
  | 'relatedReference'
  | 'amount'
  | 'paymentMethod'
  | 'transactionReference'
  | 'direction'
  | 'status'

const PAGE_SIZE = 10

export default function PaymentHistory() {
  const loans = useFinanceStore((s) => s.loans)
  const advances = useFinanceStore((s) => s.advances)

  const [search, setSearch] = useState('')
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [directionFilter, setDirectionFilter] = useState<'all' | TransactionDirection>('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'paymentDate',
    dir: 'desc',
  })
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState<FinanceTransaction | null>(null)

  const employeeIdByName = useMemo(() => {
    const map = new Map<string, string>()
    employees.forEach((emp) => {
      map.set(`${emp.firstName} ${emp.lastName}`, emp.employeeId)
    })
    return map
  }, [])

  const transactions = useMemo<FinanceTransaction[]>(() => {
    const items: FinanceTransaction[] = []

    loans.forEach((loan) => {
      const empId = employeeIdByName.get(loan.employee) ?? '—'
      const loanRef = loan.id.toUpperCase()

      if (loan.status === 'Active' || loan.status === 'Completed') {
        items.push({
          id: `loan-disb-${loan.id}`,
          paymentReference: `PAY-${loanRef}`,
          paymentDate: loan.startDate,
          employeeName: loan.employee,
          employeeId: empId,
          paymentType: 'Loan Disbursement',
          relatedReference: loanRef,
          amount: loan.amount,
          paymentMethod: 'Bank Transfer',
          transactionReference: `DISB-${loanRef}`,
          direction: 'Disbursed',
          status: 'Paid',
          note: `${loan.type} principal disbursement`,
        })
      }

      const installments =
        loan.installments && loan.installments.length > 0
          ? loan.installments
          : generateInstallmentSchedule(
              loan.amount,
              loan.totalInstallments || (loan.emi > 0 ? Math.round(loan.amount / loan.emi) : 12),
              loan.startDate,
              loan.paidInstallments || 0,
            )

      installments
        .filter((inst) => inst.status === 'Paid')
        .forEach((inst) => {
          const ref = inst.paymentReference || `EMI-${loanRef}-${inst.number}`
          items.push({
            id: `loan-inst-${loan.id}-${inst.number}`,
            paymentReference: ref,
            paymentDate: inst.paidDate || inst.dueDate,
            employeeName: loan.employee,
            employeeId: empId,
            paymentType: 'Loan Installment',
            relatedReference: `${loanRef} (#${inst.number})`,
            amount: inst.amount,
            paymentMethod: inst.paymentMethod || 'Salary Deduction',
            transactionReference: inst.paymentReference || '—',
            direction: 'Received',
            status: 'Paid',
            note: `Installment #${inst.number} for ${loan.type}`,
          })
        })
    })

    advances.forEach((adv) => {
      const empId = employeeIdByName.get(adv.employee) ?? '—'
      const advRef = adv.id.toUpperCase()

      if (adv.status === 'Approved' || adv.status === 'Recovered') {
        items.push({
          id: `adv-disb-${adv.id}`,
          paymentReference: `PAY-${advRef}`,
          paymentDate: adv.requestDate,
          employeeName: adv.employee,
          employeeId: empId,
          paymentType: 'Salary Advance Disbursement',
          relatedReference: advRef,
          amount: adv.amount,
          paymentMethod: 'Bank Transfer',
          transactionReference: `ADV-${advRef}`,
          direction: 'Disbursed',
          status: 'Paid',
          note: adv.reason,
        })
      }

      if (adv.status === 'Recovered') {
        items.push({
          id: `adv-rep-${adv.id}`,
          paymentReference: `REC-${advRef}`,
          paymentDate: adv.requestDate,
          employeeName: adv.employee,
          employeeId: empId,
          paymentType: 'Salary Advance Repayment',
          relatedReference: advRef,
          amount: adv.amount,
          paymentMethod: 'Salary Deduction',
          transactionReference: `PAYROLL-${advRef}`,
          direction: 'Received',
          status: 'Paid',
          note: `Recovered via ${adv.recoveryMonths} payroll installment(s)`,
        })
      }
    })

    return items.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
  }, [loans, advances, employeeIdByName])

  const employeeOptions = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.employeeName))).sort(),
    [transactions],
  )
  const methodOptions = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.paymentMethod))).sort(),
    [transactions],
  )

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase()
    return transactions
      .filter((tx) => {
        if (employeeFilter !== 'all' && tx.employeeName !== employeeFilter) return false
        if (typeFilter !== 'all' && tx.paymentType !== typeFilter) return false
        if (methodFilter !== 'all' && tx.paymentMethod !== methodFilter) return false
        if (directionFilter !== 'all' && tx.direction !== directionFilter) return false
        if (statusFilter !== 'all' && tx.status !== statusFilter) return false
        if (dateFrom && tx.paymentDate < dateFrom) return false
        if (dateTo && tx.paymentDate > dateTo) return false
        if (q) {
          const haystack = [
            tx.paymentReference,
            tx.employeeName,
            tx.employeeId,
            tx.paymentType,
            tx.relatedReference,
            tx.paymentMethod,
            tx.transactionReference,
          ]
            .join(' ')
            .toLowerCase()
          if (!haystack.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => {
        const av = a[sort.key]
        const bv = b[sort.key]
        const cmp =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv))
        return sort.dir === 'asc' ? cmp : -cmp
      })
  }, [
    transactions,
    employeeFilter,
    typeFilter,
    methodFilter,
    directionFilter,
    statusFilter,
    dateFrom,
    dateTo,
    search,
    sort,
  ])

  const totalReceived = useMemo(
    () =>
      filteredTransactions
        .filter((tx) => tx.direction === 'Received')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions],
  )

  const totalDisbursed = useMemo(
    () =>
      filteredTransactions
        .filter((tx) => tx.direction === 'Disbursed')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions],
  )

  const hasActiveFilters =
    Boolean(search) ||
    employeeFilter !== 'all' ||
    typeFilter !== 'all' ||
    methodFilter !== 'all' ||
    directionFilter !== 'all' ||
    statusFilter !== 'all' ||
    Boolean(dateFrom) ||
    Boolean(dateTo)

  const resetFilters = () => {
    setSearch('')
    setEmployeeFilter('all')
    setTypeFilter('all')
    setMethodFilter('all')
    setDirectionFilter('all')
    setStatusFilter('all')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'paymentDate' ? 'desc' : 'asc' },
    )
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedRows = filteredTransactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <button
      type="button"
      onClick={() => toggleSort(sortKey)}
      className="inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-foreground"
    >
      <span>{label}</span>
      {sort.key === sortKey ? (
        sort.dir === 'asc' ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
      )}
    </button>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment History"
        description="Centralized ledger of all employee loan disbursements, installment payments, and salary advance transactions."
      />

      <DemoNotice compact />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Received"
          value={formatBDT(totalReceived)}
          icon={ArrowDownLeft}
          tone="emerald"
          description="Loan installments & advance repayments"
        />
        <StatCard
          title="Total Disbursed"
          value={formatBDT(totalDisbursed)}
          icon={ArrowUpRight}
          tone="amber"
          description="Loans & salary advances granted"
        />
        <StatCard
          title="Total Transactions"
          value={filteredTransactions.length}
          icon={Receipt}
          tone="primary"
          description="Combined employee finance records"
        />
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          {/* Structured 2-Row Filter Bar */}
          <div className="space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-wrap items-center gap-2.5">
                <div className="relative w-full sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    placeholder="Search reference, employee, method..."
                    className="h-9 rounded-lg pl-9 text-sm"
                  />
                </div>

                {/* Quick Direction Segmented Control */}
                <div className="inline-flex items-center rounded-lg border bg-muted/40 p-0.5">
                  {(['all', 'Received', 'Disbursed'] as const).map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => {
                        setDirectionFilter(dir)
                        setPage(1)
                      }}
                      className={cn(
                        'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                        directionFilter === dir
                          ? 'bg-background text-foreground shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {dir === 'all' ? 'All' : dir}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range + Reset */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                  <Input
                    type="date"
                    aria-label="From date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value)
                      setPage(1)
                    }}
                    className="h-9 w-36 rounded-lg text-xs"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="date"
                    aria-label="To date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value)
                      setPage(1)
                    }}
                    className="h-9 w-36 rounded-lg text-xs"
                  />
                </div>
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* 4 Equal-Width Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <Select
                value={employeeFilter}
                onValueChange={(v) => {
                  setEmployeeFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-9 rounded-lg text-xs" aria-label="Employee">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employeeOptions.map((emp) => (
                    <SelectItem key={emp} value={emp}>
                      {emp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={typeFilter}
                onValueChange={(v) => {
                  setTypeFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-9 rounded-lg text-xs" aria-label="Payment Type">
                  <SelectValue placeholder="All Payment Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Types</SelectItem>
                  <SelectItem value="Loan Disbursement">Loan Disbursement</SelectItem>
                  <SelectItem value="Loan Installment">Loan Installment</SelectItem>
                  <SelectItem value="Salary Advance Disbursement">
                    Salary Advance Disbursement
                  </SelectItem>
                  <SelectItem value="Salary Advance Repayment">
                    Salary Advance Repayment
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={methodFilter}
                onValueChange={(v) => {
                  setMethodFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-9 rounded-lg text-xs" aria-label="Payment Method">
                  <SelectValue placeholder="All Payment Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Methods</SelectItem>
                  {methodOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-9 rounded-lg text-xs" aria-label="Status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clean Single-Line Scrollable Ledger Table */}
          <div className="overflow-x-auto rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="whitespace-nowrap">
                    <SortHeader label="Payment Ref" sortKey="paymentReference" />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <SortHeader label="Payment Date" sortKey="paymentDate" />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <SortHeader label="Employee Name" sortKey="employeeName" />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <SortHeader label="Employee ID" sortKey="employeeId" />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <SortHeader label="Payment Type" sortKey="paymentType" />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <SortHeader label="Related Ref" sortKey="relatedReference" />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <SortHeader label="Amount" sortKey="amount" />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <SortHeader label="Payment Method" sortKey="paymentMethod" />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <SortHeader label="Transaction Ref" sortKey="transactionReference" />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <SortHeader label="Direction" sortKey="direction" />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <SortHeader label="Status" sortKey="status" />
                  </TableHead>
                  <TableHead className="w-16 text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="p-0">
                      <EmptyState title="No matching payment transactions found" />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/30">
                      <TableCell className="whitespace-nowrap font-mono text-xs font-semibold text-foreground">
                        {tx.paymentReference}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(tx.paymentDate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium text-foreground">
                        {tx.employeeName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                        {tx.employeeId}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className="text-[11px] font-medium">
                          {tx.paymentType}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                        {tx.relatedReference}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono font-bold tabular-nums text-foreground">
                        {formatBDT(tx.amount)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-foreground">
                        {tx.paymentMethod}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                        {tx.transactionReference}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {tx.direction === 'Received' ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-semibold gap-1"
                          >
                            <ArrowDownLeft className="h-3 w-3" />
                            Received
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[11px] font-semibold gap-1"
                          >
                            <ArrowUpRight className="h-3 w-3" />
                            Disbursed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white border-0 text-[11px] font-semibold">
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <ActionIconButton
                          variant="view"
                          icon={Eye}
                          label={`View ${tx.paymentReference}`}
                          tooltip="View transaction details"
                          onClick={() => setViewing(tx)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing{' '}
                <strong className="text-foreground">
                  {(currentPage - 1) * PAGE_SIZE + 1}
                </strong>
                –
                <strong className="text-foreground">
                  {Math.min(currentPage * PAGE_SIZE, filteredTransactions.length)}
                </strong>{' '}
                of <strong className="text-foreground">{filteredTransactions.length}</strong>{' '}
                transactions
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Previous
                </Button>
                <span className="px-2 font-medium text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {viewing && (
        <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
          <DialogContent className="max-w-md sm:rounded-2xl p-6">
            <DialogHeader className="border-b pb-3">
              <div className="flex items-center justify-between pr-4">
                <div>
                  <DialogTitle className="text-lg font-bold">Transaction Details</DialogTitle>
                  <DialogDescription className="text-xs font-mono mt-0.5">
                    {viewing.paymentReference}
                  </DialogDescription>
                </div>
                <Badge className="bg-emerald-600 text-white border-0 text-xs font-semibold">
                  {viewing.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="rounded-xl border bg-muted/20 p-4 space-y-2.5">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Employee</span>
                  <span className="font-semibold text-foreground">
                    {viewing.employeeName} ({viewing.employeeId})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Payment Type</span>
                  <span className="font-medium text-foreground">{viewing.paymentType}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Related Reference</span>
                  <span className="font-mono font-medium text-foreground">
                    {viewing.relatedReference}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatBDT(viewing.amount)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Direction</span>
                  <span className="font-medium text-foreground">{viewing.direction}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium text-foreground">{viewing.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Transaction Reference</span>
                  <span className="font-mono text-foreground">{viewing.transactionReference}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Payment Date</span>
                  <span className="font-medium text-foreground">
                    {formatDate(viewing.paymentDate)}
                  </span>
                </div>
                {viewing.note && (
                  <div className="flex justify-between gap-4 pt-2 border-t">
                    <span className="text-muted-foreground shrink-0">Note</span>
                    <span className="text-right text-foreground">{viewing.note}</span>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setViewing(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
