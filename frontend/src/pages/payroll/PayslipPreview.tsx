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
  Mail,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
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
import { usePayrollStore } from '@/hooks/use-payroll-store'
import { formatCurrency, initials } from '@/lib/utils'
import type { PayrollRecord } from '@/types'

export default function PayslipPreview() {
  const records = usePayrollStore((state) => state.records)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const record = records.find((item) => item.id === selectedId) ?? records[0]
  const gross = record ? record.basic + record.allowances : 0

  // Top KPI Metric Calculations
  const totalNetDisbursed = records.reduce((acc, r) => acc + r.netPay, 0)
  const totalGrossPayroll = records.reduce((acc, r) => acc + (r.basic + r.allowances), 0)
  const totalDeductions = records.reduce((acc, r) => acc + r.deductions, 0)
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
    const tax = Math.round(targetRecord.deductions * 0.6)
    const providentFund = Math.round(targetRecord.deductions * 0.3)
    const otherDeductions = targetRecord.deductions - tax - providentFund
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Payslip ${targetRecord.employeeId} — ${targetRecord.month}</title>
<style>
 body{font-family:Arial,sans-serif;color:#111;max-width:720px;margin:40px auto;padding:0 16px}
 header{border-bottom:3px solid #4f46e5;padding-bottom:12px;margin-bottom:24px}
 h1{margin:0;font-size:22px} table{width:100%;border-collapse:collapse;margin:12px 0}
 th,td{text-align:left;padding:8px;border-bottom:1px solid #ddd} th{width:55%;color:#444}
 .total{font-weight:bold} .net{background:#eef2ff;padding:14px;border-radius:8px;margin-top:20px}
 footer{margin-top:28px;font-size:11px;color:#666}
</style></head><body>
<header><h1>PeopleFlow HRMS — Employee Payslip</h1><p>${targetRecord.month} · ${targetRecord.generated ? 'Demo generated record' : 'Demonstration record'}</p></header>
<p><strong>${targetRecord.employee}</strong> (${targetRecord.employeeId})<br>${targetRecord.department}</p>
<table>
 <tr><th>Basic Salary</th><td>${formatCurrency(targetRecord.basic)}</td></tr>
 <tr><th>Allowances</th><td>${formatCurrency(targetRecord.allowances)}</td></tr>
 <tr><th>Tax (TDS)</th><td>${formatCurrency(tax)}</td></tr>
 <tr><th>Provident Fund</th><td>${formatCurrency(providentFund)}</td></tr>
 <tr><th>Other deductions</th><td>${formatCurrency(otherDeductions)}</td></tr>
 <tr class="total"><th>Net Salary</th><td>${formatCurrency(targetRecord.netPay)}</td></tr>
</table>
<p>Payment status: ${targetRecord.status}</p>
<div class="net"><strong>Net Pay: ${formatCurrency(targetRecord.netPay)}</strong></div>
<footer>Demonstration payslip generated from fictional data. Not valid for any official or tax purpose.</footer>
</body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payslip-${targetRecord.employeeId}-${targetRecord.month.replace(/\s+/g, '-')}.html`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success('Payslip downloaded as a demo HTML file')
  }

  const columns: Column<PayrollRecord>[] = [
    {
      key: 'employee',
      header: 'Employee Name',
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
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
        <span className="font-mono text-xs">{formatCurrency(r.basic)}</span>
      ),
      sortValue: (r) => r.basic,
    },
    {
      key: 'allowances',
      header: 'Allowances',
      cell: (r) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatCurrency(r.allowances)}
        </span>
      ),
      sortValue: (r) => r.allowances,
    },
    {
      key: 'deductions',
      header: 'Deductions',
      cell: (r) => (
        <span className="font-mono text-xs text-rose-600 dark:text-rose-400">
          {formatCurrency(r.deductions)}
        </span>
      ),
      sortValue: (r) => r.deductions,
    },
    {
      key: 'netPay',
      header: 'Net Salary',
      cell: (r) => (
        <span className="font-mono text-sm font-bold text-primary">
          {formatCurrency(r.netPay)}
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
        title="Payslip Preview"
        description="Generate, browse, preview, and distribute employee monthly payslips."
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
          value={formatCurrency(totalNetDisbursed)}
          icon={Wallet}
          tone="emerald"
          trend={4.8}
          description="Net payout across all records"
        />
        <StatCard
          title="Total Gross Salary"
          value={formatCurrency(totalGrossPayroll)}
          icon={DollarSign}
          tone="primary"
          description="Base earnings + allowances"
        />
        <StatCard
          title="Statutory Deductions"
          value={formatCurrency(totalDeductions)}
          icon={Receipt}
          tone="amber"
          description="Tax (TDS) and Provident Fund"
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
            rowActions={(row) => (
              <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Preview payslip modal"
                  onClick={() => openDetails(row.id, true)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
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
            )}
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
                    Pay Period: {record.month} · Direct Deposit
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
                      <span className="text-muted-foreground">Payout Method</span>
                      <span className="font-semibold">Direct Deposit (ACH)</span>
                    </div>
                  </div>

                  {/* Actions for this payslip */}
                  <div className="flex flex-col gap-2 pt-2">
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

                {/* Right 8 Cols: Earnings & Deductions Breakdown */}
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
                          <span className="font-mono font-medium">{formatCurrency(record.basic)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">House Rent Allowance (HRA)</span>
                          <span className="font-mono font-medium">{formatCurrency(record.allowances)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm font-bold text-foreground">
                          <span>Gross Salary</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(gross)}
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
                            {formatCurrency(Math.round(record.deductions * 0.6))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Provident Fund (PF)</span>
                          <span className="font-mono font-medium">
                            {formatCurrency(Math.round(record.deductions * 0.3))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Other Deductions</span>
                          <span className="font-mono font-medium">
                            {formatCurrency(
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
                            {formatCurrency(record.deductions)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay Callout Banner */}
                  <div className="flex flex-col sm:flex-row items-center justify-between rounded-xl bg-primary/10 border border-primary/20 p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Total Take-Home Pay
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Direct electronic credit to employee bank account
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0 text-right">
                      <span className="font-mono text-3xl font-extrabold text-primary">
                        {formatCurrency(record.netPay)}
                      </span>
                    </div>
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
          <DialogContent className="max-w-2xl sm:rounded-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <DialogTitle className="text-xl font-bold">Employee Payslip</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Period: {record.month} · Reference: PS-{record.id.toUpperCase()}-PAY
                  </DialogDescription>
                </div>
                <StatusBadge status={record.status} />
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3.5 rounded-xl border bg-muted/20 p-3.5">
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

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border p-3.5 space-y-2 bg-muted/10">
                  <span className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Earnings
                  </span>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Basic Salary</span>
                    <span className="font-mono font-medium">{formatCurrency(record.basic)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">HRA</span>
                    <span className="font-mono font-medium">{formatCurrency(record.allowances)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Gross Salary</span>
                    <span className="font-mono">{formatCurrency(gross)}</span>
                  </div>
                </div>

                <div className="rounded-xl border p-3.5 space-y-2 bg-muted/10">
                  <span className="font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Deductions
                  </span>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Tax (TDS)</span>
                    <span className="font-mono font-medium">
                      {formatCurrency(Math.round(record.deductions * 0.6))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provident Fund</span>
                    <span className="font-mono font-medium">
                      {formatCurrency(Math.round(record.deductions * 0.3))}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Total Deductions</span>
                    <span className="font-mono">{formatCurrency(record.deductions)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-primary/10 p-4">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">Net Pay</span>
                  <p className="text-xs text-muted-foreground">Verified payroll calculation</p>
                </div>
                <span className="font-mono text-2xl font-bold text-primary">
                  {formatCurrency(record.netPay)}
                </span>
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
                <Button size="sm" onClick={() => window.print()}>
                  <Printer className="mr-1.5 h-4 w-4" />
                  Print Payslip
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
