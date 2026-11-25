import { useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Eye,
  Receipt,
  RotateCcw,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { ActionIconButton } from '@/components/common/ActionIconButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { formatDate } from '@/lib/utils'

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

export default function PaymentHistory() {
  const loans = useFinanceStore((s) => s.loans)
  const advances = useFinanceStore((s) => s.advances)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
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

      // 1. Loan Disbursements
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

      // 2. Loan Installment Payments
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

      // 3. Salary Advance Disbursements
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

      // 4. Salary Advance Repayments
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

  const dateFilteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (dateFrom && tx.paymentDate < dateFrom) return false
      if (dateTo && tx.paymentDate > dateTo) return false
      return true
    })
  }, [transactions, dateFrom, dateTo])

  const totalReceived = useMemo(
    () =>
      dateFilteredTransactions
        .filter((tx) => tx.direction === 'Received')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [dateFilteredTransactions],
  )

  const totalDisbursed = useMemo(
    () =>
      dateFilteredTransactions
        .filter((tx) => tx.direction === 'Disbursed')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [dateFilteredTransactions],
  )

  const filters = useMemo<TableFilter<FinanceTransaction>[]>(() => {
    const unique = (vals: string[]) => Array.from(new Set(vals)).sort()
    return [
      {
        key: 'employeeName',
        label: 'Employee',
        options: unique(transactions.map((t) => t.employeeName)),
        value: (t) => t.employeeName,
      },
      {
        key: 'paymentType',
        label: 'Payment Type',
        options: [
          'Loan Disbursement',
          'Loan Installment',
          'Salary Advance Disbursement',
          'Salary Advance Repayment',
        ],
        value: (t) => t.paymentType,
      },
      {
        key: 'paymentMethod',
        label: 'Payment Method',
        options: unique(transactions.map((t) => t.paymentMethod)),
        value: (t) => t.paymentMethod,
      },
      {
        key: 'direction',
        label: 'Direction',
        options: ['Received', 'Disbursed'],
        value: (t) => t.direction,
      },
      {
        key: 'status',
        label: 'Status',
        options: ['Paid'],
        value: (t) => t.status,
      },
    ]
  }, [transactions])

  const columns: Column<FinanceTransaction>[] = [
    {
      key: 'paymentReference',
      header: 'Payment Reference',
      cell: (t) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {t.paymentReference}
        </span>
      ),
      sortValue: (t) => t.paymentReference,
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      cell: (t) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(t.paymentDate)}
        </span>
      ),
      sortValue: (t) => t.paymentDate,
    },
    {
      key: 'employeeName',
      header: 'Employee Name',
      cell: (t) => <span className="font-medium text-foreground">{t.employeeName}</span>,
      sortValue: (t) => t.employeeName,
    },
    {
      key: 'employeeId',
      header: 'Employee ID',
      cell: (t) => (
        <span className="font-mono text-xs text-muted-foreground">{t.employeeId}</span>
      ),
      sortValue: (t) => t.employeeId,
    },
    {
      key: 'paymentType',
      header: 'Payment Type',
      cell: (t) => (
        <Badge variant="outline" className="text-[11px] font-medium whitespace-nowrap">
          {t.paymentType}
        </Badge>
      ),
      sortValue: (t) => t.paymentType,
    },
    {
      key: 'relatedReference',
      header: 'Related Ref',
      cell: (t) => (
        <span className="font-mono text-xs text-muted-foreground">{t.relatedReference}</span>
      ),
      sortValue: (t) => t.relatedReference,
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (t) => (
        <span className="font-mono font-bold text-foreground whitespace-nowrap">
          {formatBDT(t.amount)}
        </span>
      ),
      sortValue: (t) => t.amount,
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      cell: (t) => <span className="text-xs text-foreground">{t.paymentMethod}</span>,
      sortValue: (t) => t.paymentMethod,
    },
    {
      key: 'transactionReference',
      header: 'Transaction Reference',
      cell: (t) => (
        <span className="font-mono text-xs text-muted-foreground">
          {t.transactionReference}
        </span>
      ),
      sortValue: (t) => t.transactionReference,
    },
    {
      key: 'direction',
      header: 'Direction',
      cell: (t) =>
        t.direction === 'Received' ? (
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
        ),
      sortValue: (t) => t.direction,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (t) => (
        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white border-0 text-[11px] font-semibold">
          {t.status}
        </Badge>
      ),
      sortValue: (t) => t.status,
    },
  ]

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
          value={dateFilteredTransactions.length}
          icon={Receipt}
          tone="primary"
          description="Combined employee finance records"
        />
      </div>

      <Card>
        <CardContent className="p-5">
          <DataTable
            data={dateFilteredTransactions}
            columns={columns}
            filters={filters}
            searchPlaceholder="Search by reference, employee, or method..."
            pageSize={10}
            toolbar={
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                  <Input
                    type="date"
                    aria-label="From date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 w-36 rounded-lg text-xs"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="date"
                    aria-label="To date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9 w-36 rounded-lg text-xs"
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDateFrom('')
                      setDateTo('')
                    }}
                    className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Reset Dates
                  </Button>
                )}
              </div>
            }
            rowActions={(tx) => (
              <div className="flex items-center justify-end">
                <ActionIconButton
                  variant="view"
                  icon={Eye}
                  label={`View ${tx.paymentReference}`}
                  tooltip="View transaction details"
                  onClick={() => setViewing(tx)}
                />
              </div>
            )}
          />
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
