import { useState } from 'react'
import { toast } from 'sonner'
import {
  CreditCard,
  Plus,
  Eye,
  CheckCircle2,
  Clock3,
  Download,
  AlertCircle,
  Building2,
  DollarSign,
  Smartphone,
  Wallet,
  ArrowRightLeft,
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
import { mockPayrollPayments as initialPayments } from '@/mocks/payrollData'
import { employees } from '@/mocks/data'
import { formatBDT } from '@/lib/payrollUtils'
import { usePayrollStore } from '@/hooks/use-payroll-store'
import type { PayrollPaymentRecord } from '@/types/payroll'

const statusStyles: Record<string, string> = {
  Paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200',
  'Partially Paid': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200',
  Unpaid: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200',
}

export default function PayrollPayments() {
  const payments = usePayrollStore((state) => state.payments)
  const addPayment = usePayrollStore((state) => state.addPayment)
  const [selectedPayment, setSelectedPayment] = useState<PayrollPaymentRecord | null>(null)
  const [isRecordOpen, setIsRecordOpen] = useState(false)
  const [recordState, setRecordState] = useState({
    employee: `${employees[0]!.firstName} ${employees[0]!.lastName}`,
    employeeId: employees[0]!.employeeId,
    department: employees[0]!.department,
    netSalary: 75000,
    paidAmount: 75000,
    paymentMethod: 'Bank Transfer' as PayrollPaymentRecord['paymentMethod'],
    paymentReference: '',
    paymentDate: new Date().toISOString().split('T')[0]!,
  })

  // KPI Calculations
  const totalNetObligation = payments.reduce((sum, p) => sum + p.netSalary, 0)
  const totalPaidAmount = payments.reduce((sum, p) => sum + p.paidAmount, 0)
  const totalRemainingBalance = payments.reduce((sum, p) => sum + p.remainingBalance, 0)
  const fullyPaidCount = payments.filter((p) => p.status === 'Paid').length

  const handleOpenRecord = () => {
    const emp = employees[0]!
    setRecordState({
      employee: `${emp.firstName} ${emp.lastName}`,
      employeeId: emp.employeeId,
      department: emp.department,
      netSalary: 75000,
      paidAmount: 75000,
      paymentMethod: 'Bank Transfer',
      paymentReference: '',
      paymentDate: new Date().toISOString().split('T')[0]!,
    })
    setIsRecordOpen(true)
  }

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (recordState.paidAmount <= 0) {
      toast.error('Please enter a valid disbursement amount')
      return
    }

    const remaining = Math.max(0, recordState.netSalary - recordState.paidAmount)
    const status: PayrollPaymentRecord['status'] =
      remaining === 0 ? 'Paid' : recordState.paidAmount > 0 ? 'Partially Paid' : 'Unpaid'

    const newPayment: PayrollPaymentRecord = {
      id: `pmt-custom-${Date.now()}`,
      employee: recordState.employee,
      employeeId: recordState.employeeId,
      department: recordState.department,
      batchName: 'November 2026 — Monthly',
      payslipReference: `PS-PAY-${Date.now().toString().slice(-6)}`,
      netSalary: Number(recordState.netSalary),
      paidAmount: Number(recordState.paidAmount),
      remainingBalance: remaining,
      paymentDate: recordState.paymentDate,
      paymentMethod: recordState.paymentMethod,
      paymentReference: recordState.paymentReference || `TXN-${Date.now().toString().slice(-6)}`,
      status,
    }

    addPayment(newPayment)
    setIsRecordOpen(false)
    toast.success(`Payment voucher recorded for ${newPayment.employee}`)
  }

  const filters: TableFilter<PayrollPaymentRecord>[] = [
    {
      key: 'status',
      label: 'Payment Status',
      options: ['Paid', 'Partially Paid', 'Unpaid'],
      value: (p) => p.status,
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      options: ['Bank Transfer', 'Cash', 'Mobile Banking'],
      value: (p) => p.paymentMethod,
    },
  ]

  const columns: Column<PayrollPaymentRecord>[] = [
    {
      key: 'employee',
      header: 'Employee',
      cell: (p) => (
        <div>
          <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
            {p.employee}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">{p.employeeId} · {p.department}</p>
        </div>
      ),
      sortValue: (p) => p.employee,
    },
    {
      key: 'payslipReference',
      header: 'Batch & Payslip Ref',
      cell: (p) => (
        <div>
          <span className="font-mono text-xs font-semibold text-primary">{p.payslipReference}</span>
          <p className="text-[10px] text-muted-foreground">{p.batchName}</p>
        </div>
      ),
      sortValue: (p) => p.payslipReference,
    },
    {
      key: 'netSalary',
      header: 'Net Salary',
      cell: (p) => <span className="font-mono text-xs font-semibold">{formatBDT(p.netSalary)}</span>,
      sortValue: (p) => p.netSalary,
    },
    {
      key: 'paidAmount',
      header: 'Paid Amount (BDT)',
      cell: (p) => (
        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {formatBDT(p.paidAmount)}
        </span>
      ),
      sortValue: (p) => p.paidAmount,
    },
    {
      key: 'remainingBalance',
      header: 'Balance',
      cell: (p) => (
        <span
          className={`font-mono text-xs ${
            p.remainingBalance > 0
              ? 'text-rose-600 dark:text-rose-400 font-bold'
              : 'text-muted-foreground'
          }`}
        >
          {p.remainingBalance > 0 ? formatBDT(p.remainingBalance) : 'Settled'}
        </span>
      ),
      sortValue: (p) => p.remainingBalance,
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      cell: (p) => (
        <Badge variant="outline" className="text-[10px]">
          {p.paymentMethod}
        </Badge>
      ),
      sortValue: (p) => p.paymentMethod,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (p) => (
        <Badge variant="outline" className={`text-xs px-2 py-0.5 ${statusStyles[p.status]}`}>
          {p.status}
        </Badge>
      ),
      sortValue: (p) => p.status,
    },
  ]

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Payroll Payments"
        description="Salary disbursement vouchers, multi-channel payment executions, electronic banking reconciliation, and payment logs."
        actions={
          <Button onClick={handleOpenRecord}>
            <Plus className="mr-1.5 h-4 w-4" />
            Record Payment
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Net Payroll"
          value={formatBDT(totalNetObligation)}
          icon={Wallet}
          tone="primary"
          description="Net salary payable for cycle"
        />
        <StatCard
          title="Total Disbursed"
          value={formatBDT(totalPaidAmount)}
          icon={CheckCircle2}
          tone="emerald"
          trend={7.8}
          description="Transferred to staff accounts"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatBDT(totalRemainingBalance)}
          icon={Clock3}
          tone="amber"
          description="Unpaid or partial remittances"
        />
        <StatCard
          title="Disbursement Rate"
          value={`${Math.round((fullyPaidCount / payments.length) * 100)}%`}
          icon={CreditCard}
          tone="sky"
          description={`${fullyPaidCount} of ${payments.length} staff cleared`}
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={payments}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search payments by employee or reference..."
        onRowClick={(p) => setSelectedPayment(p)}
        toolbar={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Disbursement log exported to CSV')}
            className="h-9 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export Log
          </Button>
        }
        rowActions={(p) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Inspect payment voucher"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedPayment(p)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      />

      {/* View Details Dialog */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <DialogTitle className="text-lg font-bold">{selectedPayment.employee}</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {selectedPayment.employeeId} · {selectedPayment.department}
                  </DialogDescription>
                </div>
                <Badge variant="outline" className={statusStyles[selectedPayment.status]}>
                  {selectedPayment.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="flex justify-between rounded-lg border p-3 bg-muted/20">
                <span className="text-muted-foreground">Disbursed Amount</span>
                <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {formatBDT(selectedPayment.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Total Net Salary</span>
                <span className="font-mono font-semibold">{formatBDT(selectedPayment.netSalary)}</span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Remaining Unpaid</span>
                <span className="font-mono font-semibold">{formatBDT(selectedPayment.remainingBalance)}</span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-semibold">{selectedPayment.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Bank / Transaction Ref</span>
                <span className="font-mono font-semibold">{selectedPayment.paymentReference}</span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Payment Date</span>
                <span className="font-semibold">{selectedPayment.paymentDate}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Record Payment Dialog */}
      <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Salary Payment</DialogTitle>
            <DialogDescription>
              Record an electronic fund transfer, mobile payment, or cash disbursement for an employee.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePayment} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="pmtEmp">Employee *</Label>
              <Select
                value={recordState.employee}
                onValueChange={(val) => {
                  const emp = employees.find((e) => `${e.firstName} ${e.lastName}` === val)
                  setRecordState({
                    ...recordState,
                    employee: val,
                    employeeId: emp ? emp.employeeId : recordState.employeeId,
                    department: emp ? emp.department : recordState.department,
                  })
                }}
              >
                <SelectTrigger id="pmtEmp">
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
                <Label htmlFor="pmtNet">Net Salary (BDT)</Label>
                <Input
                  id="pmtNet"
                  type="number"
                  value={recordState.netSalary}
                  onChange={(e) =>
                    setRecordState({ ...recordState, netSalary: Number(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pmtPaid">Amount to Disburse (BDT) *</Label>
                <Input
                  id="pmtPaid"
                  type="number"
                  value={recordState.paidAmount}
                  onChange={(e) =>
                    setRecordState({ ...recordState, paidAmount: Number(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pmtMethod">Payment Method</Label>
                <Select
                  value={recordState.paymentMethod}
                  onValueChange={(val) =>
                    setRecordState({
                      ...recordState,
                      paymentMethod: val as PayrollPaymentRecord['paymentMethod'],
                    })
                  }
                >
                  <SelectTrigger id="pmtMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer (BEFTN/NPSB)</SelectItem>
                    <SelectItem value="Mobile Banking">Mobile Banking (bKash/Nagad)</SelectItem>
                    <SelectItem value="Cash">Cash Disbursement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pmtDate">Payment Date</Label>
                <Input
                  id="pmtDate"
                  type="date"
                  value={recordState.paymentDate}
                  onChange={(e) => setRecordState({ ...recordState, paymentDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pmtRef">Bank / Transaction Reference #</Label>
              <Input
                id="pmtRef"
                placeholder="e.g. BEFTN-2026-9908"
                value={recordState.paymentReference}
                onChange={(e) => setRecordState({ ...recordState, paymentReference: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsRecordOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Record Disbursement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
