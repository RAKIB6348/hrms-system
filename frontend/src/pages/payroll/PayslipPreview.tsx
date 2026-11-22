import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Download,
  Eye,
  FilePlus2,
  Printer,
  Wallet,
  DollarSign,
  Receipt,
  FileText,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  History,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GeneratePayslipsDialog } from '@/features/payroll/GeneratePayslipsDialog'
import { RecordPaymentModal } from '@/features/payroll/RecordPaymentModal'
import { usePayrollStore } from '@/hooks/use-payroll-store'
import { initials } from '@/lib/utils'
import { formatBDT } from '@/lib/payrollUtils'
import type { PayrollRecord, PayslipPaymentItem } from '@/types'
import type { PayrollPaymentRecord } from '@/types/payroll'

export default function PayslipPreview() {
  const records = usePayrollStore((state) => state.records)
  const storePayments = usePayrollStore((state) => state.payments)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Payment Modal state
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [payingRecord, setPayingRecord] = useState<PayrollRecord | null>(null)

  const openPayModal = (rec: PayrollRecord) => {
    setPayingRecord(rec)
    setPayModalOpen(true)
  }

  const record = records.find((item) => item.id === selectedId) ?? records[0]
  const gross = record ? record.basic + record.allowances : 0

  // Calculate top KPI metrics dynamically from store
  const totalNetDisbursed = records.reduce((acc, r) => {
    const paid =
      r.paidAmount !== undefined
        ? r.paidAmount
        : r.status === 'Paid' || r.status === 'Completed'
          ? r.netPay
          : 0
    return acc + paid
  }, 0)

  const totalGrossPayroll = records.reduce((acc, r) => acc + (r.basic + r.allowances), 0)
  const totalDeductions = records.reduce((acc, r) => acc + r.deductions, 0)

  const totalOutstandingBalance = records.reduce((acc, r) => {
    const paid =
      r.paidAmount !== undefined
        ? r.paidAmount
        : r.status === 'Paid' || r.status === 'Completed'
          ? r.netPay
          : 0
    return acc + Math.max(0, r.netPay - paid)
  }, 0)

  const totalPayslipsCount = records.length

  const filters: TableFilter<PayrollRecord>[] = useMemo(
    () => [
      {
        key: 'employee',
        label: 'Employees',
        options: Array.from(new Set(records.map((r) => r.employee))),
        value: (r) => r.employee,
      },
      {
        key: 'month',
        label: 'Months',
        options: Array.from(new Set(records.map((r) => r.month))),
        value: (r) => r.month,
      },
      {
        key: 'status',
        label: 'Status',
        options: Array.from(new Set(records.map((r) => r.status))),
        value: (r) => r.status,
      },
    ],
    [records]
  )

  const openDetails = (id: string, openDialog = false) => {
    setSelectedId(id)
    if (openDialog) {
      setIsModalOpen(true)
    } else {
      window.setTimeout(
        () =>
          document.getElementById('payslip-detail')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          }),
        0
      )
    }
  }

  const downloadPayslip = (targetRecord = record) => {
    if (!targetRecord) return
    const grossVal = targetRecord.basic + targetRecord.allowances
    const tax = Math.round(targetRecord.deductions * 0.6)
    const providentFund = Math.round(targetRecord.deductions * 0.3)
    const otherDeductions = targetRecord.deductions - tax - providentFund

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Payslip - ${targetRecord.employee} (${targetRecord.month})</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #1e293b; max-width: 720px; margin: 0 auto; }
    .header { border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 22px; font-weight: bold; color: #4f46e5; }
    .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 13px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
    .box strong { display: block; color: #0f172a; margin-bottom: 4px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; color: #475569; font-weight: 600; }
    td:last-child { text-align: right; font-family: monospace; }
    .total { font-weight: bold; font-size: 14px; background: #eef2ff; color: #3730a3; }
    .net { text-align: right; font-size: 18px; color: #4f46e5; margin-top: 16px; padding: 16px; background: #eef2ff; border-radius: 8px; }
    .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">PeopleFlow HRMS</div>
      <div class="sub">Official Employee Payslip & Disbursement Voucher</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #64748b;">
      <div>Ref: PS-${targetRecord.id.toUpperCase()}-PAY</div>
      <div>Issued: ${new Date().toISOString().slice(0, 10)}</div>
    </div>
  </div>
  <div class="grid">
    <div class="box">
      <strong>${targetRecord.employee}</strong>
      <div>Employee ID: ${targetRecord.employeeId}</div>
      <div>Department: ${targetRecord.department}</div>
    </div>
    <div class="box">
      <strong>Payment Details</strong>
      <div>Month: ${targetRecord.month}</div>
      <div>Status: ${targetRecord.status}</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Earnings Component</th><th style="text-align: right">Amount (BDT)</th></tr></thead>
    <tbody>
      <tr><td>Basic Salary</td><td>${formatBDT(targetRecord.basic)}</td></tr>
      <tr><td>House Rent Allowance (HRA)</td><td>${formatBDT(targetRecord.allowances)}</td></tr>
      <tr class="total"><td>Gross Salary</td><td>${formatBDT(grossVal)}</td></tr>
    </tbody>
  </table>
  <table>
    <thead><tr><th>Deductions Component</th><th style="text-align: right">Amount (BDT)</th></tr></thead>
    <tbody>
      <tr><td>Tax (TDS)</td><td>${formatBDT(tax)}</td></tr>
      <tr><td>Provident Fund (PF)</td><td>${formatBDT(providentFund)}</td></tr>
      <tr><td>Other Deductions</td><td>${formatBDT(otherDeductions)}</td></tr>
      <tr class="total"><td>Total Deductions</td><td>${formatBDT(targetRecord.deductions)}</td></tr>
    </tbody>
  </table>
  <div class="net">
    Net Take-Home Salary: <strong>${formatBDT(targetRecord.netPay)}</strong>
  </div>
  <div class="footer">
    This is an official demonstration payslip generated by PeopleFlow HRMS. Currency: BDT (৳).
  </div>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payslip-${targetRecord.employee.toLowerCase().replace(/\s+/g, '-')}-${targetRecord.month.toLowerCase().replace(/\s+/g, '-')}.html`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Payslip HTML voucher downloaded for ${targetRecord.employee}`)
  }

  // Helper to extract payment history for current record
  const getRecordHistory = (targetRecord: PayrollRecord | null): PayslipPaymentItem[] => {
    if (!targetRecord) return []
    if (targetRecord.paymentHistory && targetRecord.paymentHistory.length > 0) {
      return targetRecord.paymentHistory
    }

    // Check store payments matching employee or reference
    const matching = storePayments.filter(
      (p) =>
        p.employeeId === targetRecord.employeeId ||
        p.payslipReference === `PS-${targetRecord.id.toUpperCase()}-PAY`
    )

    if (matching.length > 0) {
      return matching.map((p) => ({
        id: p.id,
        paymentDate: p.paymentDate,
        amount: p.paidAmount,
        paymentMethod: p.paymentMethod,
        paymentReference: p.paymentReference,
        status: p.status === 'Paid' ? 'Paid' : 'Partially Paid',
        note: p.note || 'Disbursed via corporate payroll channel',
      }))
    }

    // Default seeded fallback for already paid demo records
    if (targetRecord.status === 'Paid' || targetRecord.status === 'Completed') {
      return [
        {
          id: `pmt-init-${targetRecord.id}`,
          paymentDate: '2026-11-22',
          amount: targetRecord.netPay,
          paymentMethod: 'Bank Transfer',
          paymentReference: `BEFTN-2026-${targetRecord.employeeId}`,
          status: 'Paid',
          note: 'Direct deposit bank transfer (BEFTN)',
        },
      ]
    }

    return []
  }

  const currentRecordHistory = getRecordHistory(record)
  const recordCurrentPaid = record
    ? record.paidAmount !== undefined
      ? record.paidAmount
      : record.status === 'Paid' || record.status === 'Completed'
        ? record.netPay
        : 0
    : 0
  const recordRemainingDue = record ? Math.max(0, record.netPay - recordCurrentPaid) : 0

  const columns: Column<PayrollRecord>[] = [
    {
      key: 'employee',
      header: 'Employee Name',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 ring-1 ring-border">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {initials(r.employee)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {r.employee}
            </p>
            {r.generated && (
              <Badge variant="info" className="text-[10px] mt-0.5">
                Demo generated
              </Badge>
            )}
          </div>
        </div>
      ),
      sortValue: (r) => r.employee,
    },
    {
      key: 'employeeId',
      header: 'Employee ID',
      cell: (r) => (
        <span className="font-mono text-xs text-muted-foreground">{r.employeeId}</span>
      ),
      sortValue: (r) => r.employeeId,
    },
    {
      key: 'month',
      header: 'Payroll Month',
      cell: (r) => <span className="text-xs font-medium">{r.month}</span>,
      sortValue: (r) => r.month,
    },
    {
      key: 'basic',
      header: 'Basic Salary',
      cell: (r) => (
        <span className="font-mono text-xs">{formatBDT(r.basic)}</span>
      ),
      sortValue: (r) => r.basic,
    },
    {
      key: 'allowances',
      header: 'Allowances',
      cell: (r) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatBDT(r.allowances)}
        </span>
      ),
      sortValue: (r) => r.allowances,
    },
    {
      key: 'deductions',
      header: 'Deductions',
      cell: (r) => (
        <span className="font-mono text-xs text-rose-600 dark:text-rose-400">
          {formatBDT(r.deductions)}
        </span>
      ),
      sortValue: (r) => r.deductions,
    },
    {
      key: 'netPay',
      header: 'Net Salary',
      cell: (r) => (
        <span className="font-mono text-sm font-bold text-primary">
          {formatBDT(r.netPay)}
        </span>
      ),
      sortValue: (r) => r.netPay,
    },
    {
      key: 'status',
      header: 'Payment Status',
      cell: (r) => <StatusBadge status={r.status} />,
      sortValue: (r) => r.status,
    },
  ]

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Payslips"
        description="Generate, browse, disburse, and download employee monthly payslips with verifiable transaction logs."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setGenerateOpen(true)}>
              <FilePlus2 className="mr-1.5 h-4 w-4" />
              Generate Payslips
            </Button>
            <Button variant="outline" onClick={() => downloadPayslip(record)} disabled={!record}>
              <Download className="mr-1.5 h-4 w-4" />
              Download
            </Button>
            <Button onClick={() => window.print()} disabled={!record}>
              <Printer className="mr-1.5 h-4 w-4" />
              Print
            </Button>
          </div>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI Metrics StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Net Disbursed"
          value={formatBDT(totalNetDisbursed)}
          icon={Wallet}
          tone="emerald"
          trend={4.8}
          description="Net payout disbursed to staff"
        />
        <StatCard
          title="Total Gross Salary"
          value={formatBDT(totalGrossPayroll)}
          icon={DollarSign}
          tone="primary"
          description="Base earnings + allowances"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatBDT(totalOutstandingBalance)}
          icon={Receipt}
          tone="amber"
          description="Pending salary disbursement"
        />
        <StatCard
          title="Payslips Issued"
          value={totalPayslipsCount}
          icon={FileText}
          tone="sky"
          description="Ready for employee download"
        />
      </div>

      {/* Main DataTable */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <DataTable
            data={records}
            columns={columns}
            filters={filters}
            searchPlaceholder="Search by employee name, ID, month or status..."
            onRowClick={(row) => openDetails(row.id, true)}
            emptyTitle="No payslip records yet"
            rowActions={(row) => {
              const paid =
                row.paidAmount !== undefined
                  ? row.paidAmount
                  : row.status === 'Paid' || row.status === 'Completed'
                    ? row.netPay
                    : 0
              const remaining =
                row.remainingBalance !== undefined
                  ? row.remainingBalance
                  : Math.max(0, row.netPay - paid)
              const isPaid = row.status === 'Paid' || row.status === 'Completed' || remaining === 0

              return (
                <div
                  className="flex items-center gap-1.5"
                  onClick={(event) => event.stopPropagation()}
                >
                  {/* Action 1: Pay / Pay Remaining / Paid Button */}
                  {isPaid ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="h-8 px-2.5 text-xs font-semibold bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 cursor-not-allowed opacity-85 flex items-center gap-1.5"
                      title="Salary has been fully disbursed"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Paid
                    </Button>
                  ) : row.status === 'Partially Paid' ? (
                    <Button
                      size="sm"
                      className="h-8 px-2.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5"
                      title={`Pay remaining balance: ${formatBDT(remaining)}`}
                      onClick={() => openPayModal(row)}
                    >
                      <CreditCard className="h-3.5 w-3.5 text-white" />
                      Pay Remaining
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="h-8 px-2.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5"
                      title={`Disburse salary: ${formatBDT(remaining)}`}
                      onClick={() => openPayModal(row)}
                    >
                      <CreditCard className="h-3.5 w-3.5 text-white" />
                      Pay
                    </Button>
                  )}

                  {/* Action 2: View Preview Icon Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Preview payslip details"
                    onClick={() => openDetails(row.id, true)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {/* Action 3: Download Payslip Icon Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Download HTML payslip"
                    onClick={() => downloadPayslip(row)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )
            }}
            toolbar={
              <span className="text-xs text-muted-foreground">
                Showing <strong className="font-semibold text-foreground">{records.length}</strong> payslips
              </span>
            }
          />
        </CardContent>
      </Card>

      {/* Full-Width Interactive Payslip Preview Section */}
      <div id="payslip-detail" className="w-full scroll-mt-24">
        {!record ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={Wallet}
                title="No payslip to preview"
                description="Generate demo payslips to see an individual record here."
                actionLabel="Generate Payslips"
                onAction={() => setGenerateOpen(true)}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full overflow-hidden shadow-sm print:shadow-none">
            {/* Header Banner - Full Width */}
            <div className="flex flex-col gap-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold tracking-tight">PeopleFlow</p>
                    <span className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium">
                      Official Payslip
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">
                    Pay Period: {record.month} · Direct Deposit (BEFTN/ACH)
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end">
                <span className="text-xs text-white/70">Document Reference</span>
                <span className="font-mono text-sm font-bold tracking-wider">
                  PS-{record.id.toUpperCase()}-PAY
                </span>
              </div>
            </div>

            {/* Content: 2-Column Responsive Layout */}
            <CardContent className="p-6">
              <div className="grid gap-8 lg:grid-cols-12">
                {/* Left 4 Cols: Employee Profile & Status */}
                <div className="lg:col-span-4 space-y-5 border-b pb-6 lg:border-b-0 lg:border-r lg:pr-8">
                  <div className="flex items-center gap-3.5">
                    <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
                        {initials(record.employee)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-lg font-bold truncate text-foreground">{record.employee}</p>
                      <p className="text-xs text-muted-foreground truncate">{record.department}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Employee ID</span>
                      <span className="font-mono font-semibold">{record.employeeId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Pay Period</span>
                      <span className="font-semibold">{record.month}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Payment Status</span>
                      <StatusBadge status={record.status} />
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Already Paid</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatBDT(recordCurrentPaid)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Remaining Balance</span>
                      <span className="font-mono font-bold text-primary">
                        {formatBDT(recordRemainingDue)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Payout Method</span>
                      <span className="font-semibold">Corporate Bank Wire (BEFTN)</span>
                    </div>
                  </div>

                  {/* Actions for this payslip */}
                  <div className="flex flex-col gap-2 pt-2">
                    {/* Pay Button in preview panel */}
                    {recordRemainingDue === 0 || record.status === 'Paid' ? (
                      <Button
                        size="sm"
                        disabled
                        className="w-full text-xs justify-center bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 cursor-not-allowed font-semibold"
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Salary Fully Paid
                      </Button>
                    ) : record.status === 'Partially Paid' ? (
                      <Button
                        size="sm"
                        onClick={() => openPayModal(record)}
                        className="w-full text-xs justify-center bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                      >
                        <CreditCard className="mr-1.5 h-3.5 w-3.5 text-white" />
                        Pay Remaining Balance ({formatBDT(recordRemainingDue)})
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => openPayModal(record)}
                        className="w-full text-xs justify-center bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                      >
                        <CreditCard className="mr-1.5 h-3.5 w-3.5 text-white" />
                        Disburse / Pay Salary ({formatBDT(recordRemainingDue)})
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPayslip(record)}
                      className="w-full text-xs justify-center"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Download HTML Payslip
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      className="w-full text-xs justify-center"
                    >
                      <Printer className="mr-1.5 h-3.5 w-3.5" />
                      Print Statement
                    </Button>
                  </div>
                </div>

                {/* Right 8 Cols: Earnings & Deductions Breakdown and Payment History */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Earnings Breakdown */}
                    <div className="rounded-xl border p-4 bg-muted/10 space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Earnings
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">Amount</span>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Basic Salary</span>
                          <span className="font-mono font-medium">{formatBDT(record.basic)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">House Rent Allowance (HRA)</span>
                          <span className="font-mono font-medium">{formatBDT(record.allowances)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm font-bold text-foreground">
                          <span>Gross Salary</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">
                            {formatBDT(gross)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Deductions Breakdown */}
                    <div className="rounded-xl border p-4 bg-muted/10 space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                          Deductions
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">Amount</span>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax Deducted (TDS)</span>
                          <span className="font-mono font-medium">
                            {formatBDT(Math.round(record.deductions * 0.6))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Provident Fund (PF)</span>
                          <span className="font-mono font-medium">
                            {formatBDT(Math.round(record.deductions * 0.3))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Other Deductions</span>
                          <span className="font-mono font-medium">
                            {formatBDT(
                              record.deductions -
                                Math.round(record.deductions * 0.6) -
                                Math.round(record.deductions * 0.3)
                            )}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm font-bold text-foreground">
                          <span>Total Deductions</span>
                          <span className="font-mono text-rose-600 dark:text-rose-400">
                            {formatBDT(record.deductions)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay Callout Banner */}
                  <div className="flex flex-col sm:flex-row items-center justify-between rounded-xl bg-primary/10 border border-primary/20 p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Total Net Compensation
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Direct electronic credit to employee bank account (BDT)
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0 text-right">
                      <span className="font-mono text-3xl font-extrabold text-primary">
                        {formatBDT(record.netPay)}
                      </span>
                    </div>
                  </div>

                  {/* Section 5: Payment History */}
                  <div className="rounded-xl border p-5 bg-card space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold uppercase tracking-wider text-foreground">
                          Payment History & Disbursement Logs
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {currentRecordHistory.length}{' '}
                        {currentRecordHistory.length === 1 ? 'Record' : 'Records'}
                      </Badge>
                    </div>

                    {currentRecordHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground text-xs space-y-1">
                        <AlertCircle className="h-6 w-6 text-muted-foreground/60 mb-1" />
                        <p className="font-semibold text-foreground">
                          No payment transactions recorded yet
                        </p>
                        <p>
                          Click the green <strong>Pay</strong> button to record full or partial salary disbursement.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b text-muted-foreground font-semibold text-left">
                              <th className="pb-2">Payment Date</th>
                              <th className="pb-2">Disbursed Amount</th>
                              <th className="pb-2">Method</th>
                              <th className="pb-2">Reference</th>
                              <th className="pb-2">Status</th>
                              <th className="pb-2 text-right">Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {currentRecordHistory.map((item) => (
                              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                <td className="py-2.5 font-medium flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  {item.paymentDate}
                                </td>
                                <td className="py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  {formatBDT(item.amount)}
                                </td>
                                <td className="py-2.5">
                                  <span className="inline-flex items-center gap-1 font-medium">
                                    {item.paymentMethod === 'Bank Transfer' ? (
                                      <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                                    ) : item.paymentMethod === 'Mobile Banking' ? (
                                      <Smartphone className="h-3.5 w-3.5 text-violet-600" />
                                    ) : (
                                      <CreditCard className="h-3.5 w-3.5 text-amber-600" />
                                    )}
                                    {item.paymentMethod}
                                  </span>
                                </td>
                                <td className="py-2.5 font-mono text-muted-foreground font-semibold">
                                  {item.paymentReference}
                                </td>
                                <td className="py-2.5">
                                  <StatusBadge status={item.status} />
                                </td>
                                <td className="py-2.5 text-right text-muted-foreground truncate max-w-[150px]">
                                  {item.note || 'Direct disbursement'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Payslip Preview Dialog */}
      {record && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <DialogTitle className="text-xl font-bold">Employee Payslip Preview</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Period: {record.month} · Reference: PS-{record.id.toUpperCase()}-PAY
                  </DialogDescription>
                </div>
                <StatusBadge status={record.status} />
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center gap-3.5">
                  <Avatar className="h-12 w-12 ring-1 ring-border">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {initials(record.employee)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-base">{record.employee}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.department} · Employee ID: {record.employeeId}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Net Due</span>
                  <span className="font-mono text-lg font-bold text-primary">
                    {formatBDT(record.netPay)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border p-3.5 space-y-2 bg-muted/10">
                  <span className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Earnings
                  </span>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Basic Salary</span>
                    <span className="font-mono font-medium">{formatBDT(record.basic)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">HRA</span>
                    <span className="font-mono font-medium">{formatBDT(record.allowances)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Gross Salary</span>
                    <span className="font-mono">{formatBDT(gross)}</span>
                  </div>
                </div>

                <div className="rounded-xl border p-3.5 space-y-2 bg-muted/10">
                  <span className="font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Deductions
                  </span>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Tax (TDS)</span>
                    <span className="font-mono font-medium">
                      {formatBDT(Math.round(record.deductions * 0.6))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provident Fund</span>
                    <span className="font-mono font-medium">
                      {formatBDT(Math.round(record.deductions * 0.3))}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Total Deductions</span>
                    <span className="font-mono">{formatBDT(record.deductions)}</span>
                  </div>
                </div>
              </div>

              {/* Payment History inside Preview Modal */}
              <div className="rounded-xl border p-4 space-y-3 bg-card">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Payment History
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Paid: {formatBDT(recordCurrentPaid)} / Balance: {formatBDT(recordRemainingDue)}
                  </span>
                </div>
                {currentRecordHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No payment transactions recorded yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {currentRecordHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="font-semibold">{item.paymentDate}</span>
                          <span className="text-muted-foreground">via {item.paymentMethod}</span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            ({item.paymentReference})
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatBDT(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => downloadPayslip(record)}>
                <Download className="mr-1.5 h-4 w-4" />
                Download HTML
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                {recordRemainingDue > 0 && (
                  <Button
                    size="sm"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                    onClick={() => {
                      setIsModalOpen(false)
                      openPayModal(record)
                    }}
                  >
                    <CreditCard className="mr-1.5 h-4 w-4 text-white" />
                    {record.status === 'Partially Paid' ? 'Pay Remaining' : 'Pay Salary'}
                  </Button>
                )}
                <Button size="sm" onClick={() => window.print()}>
                  <Printer className="mr-1.5 h-4 w-4" />
                  Print Payslip
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Record Salary Payment Modal */}
      <RecordPaymentModal
        open={payModalOpen}
        onOpenChange={setPayModalOpen}
        record={payingRecord}
        onPaymentSuccess={(newPayment) => {
          // If paying the currently selected payslip, keep view active
          if (payingRecord && payingRecord.id === record?.id) {
            setSelectedId(payingRecord.id)
          }
        }}
      />

      {/* Generate Payslips Dialog */}
      <GeneratePayslipsDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        onGenerated={(result) => {
          if (result.created > 0) {
            const latest = usePayrollStore.getState().records[0]
            if (latest) openDetails(latest.id)
          }
        }}
      />
    </div>
  )
}
