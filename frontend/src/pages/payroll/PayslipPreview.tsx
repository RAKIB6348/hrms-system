import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Download, Eye, FilePlus2, Printer, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { GeneratePayslipsDialog } from '@/features/payroll/GeneratePayslipsDialog'
import { usePayrollStore } from '@/hooks/use-payroll-store'
import { formatCurrency, initials } from '@/lib/utils'
import type { PayrollRecord } from '@/types'

export default function PayslipPreview() {
  const records = usePayrollStore((state) => state.records)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)

  const record = records.find((item) => item.id === selectedId) ?? records[0]
  const gross = record ? record.basic + record.allowances : 0

  const filters: TableFilter<PayrollRecord>[] = useMemo(() => [
    { key: 'employee', label: 'Employees', options: [...new Set(records.map((r) => r.employee))], value: (r) => r.employee },
    { key: 'month', label: 'Months', options: [...new Set(records.map((r) => r.month))], value: (r) => r.month },
    { key: 'status', label: 'Status', options: [...new Set(records.map((r) => r.status))], value: (r) => r.status },
  ], [records])

  const columns: Column<PayrollRecord>[] = [
    {
      key: 'employee', header: 'Employee Name',
      cell: (r) => (
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{r.employee}</span>
          {r.generated && <Badge variant="info" className="text-[10px]">Demo generated</Badge>}
        </span>
      ),
      sortValue: (r) => r.employee,
    },
    { key: 'employeeId', header: 'Employee ID', cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.employeeId}</span>, sortValue: (r) => r.employeeId },
    { key: 'month', header: 'Payroll Month', cell: (r) => r.month, sortValue: (r) => r.month },
    { key: 'basic', header: 'Basic Salary', cell: (r) => formatCurrency(r.basic), sortValue: (r) => r.basic },
    { key: 'allowances', header: 'Allowances', cell: (r) => formatCurrency(r.allowances), sortValue: (r) => r.allowances },
    { key: 'deductions', header: 'Deductions', cell: (r) => formatCurrency(r.deductions), sortValue: (r) => r.deductions },
    { key: 'netPay', header: 'Net Salary', cell: (r) => <span className="font-semibold text-primary">{formatCurrency(r.netPay)}</span>, sortValue: (r) => r.netPay },
    { key: 'status', header: 'Payment Status', cell: (r) => <StatusBadge status={r.status} /> },
  ]

  const openDetails = (id: string) => {
    setSelectedId(id)
    window.setTimeout(() => document.getElementById('payslip-detail')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0)
  }

  const downloadPayslip = () => {
    if (!record) return
    const tax = Math.round(record.deductions * 0.6)
    const providentFund = Math.round(record.deductions * 0.3)
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Payslip ${record.employeeId} — ${record.month}</title>
<style>
 body{font-family:Arial,sans-serif;color:#111;max-width:720px;margin:40px auto;padding:0 16px}
 header{border-bottom:3px solid #4f46e5;padding-bottom:12px;margin-bottom:24px}
 h1{margin:0;font-size:22px} table{width:100%;border-collapse:collapse;margin:12px 0}
 th,td{text-align:left;padding:8px;border-bottom:1px solid #ddd} th{width:55%;color:#444}
 .total{font-weight:bold} .net{background:#eef2ff;padding:14px;border-radius:8px;margin-top:20px}
 footer{margin-top:28px;font-size:11px;color:#666}
</style></head><body>
<header><h1>PeopleFlow HRMS — Employee Payslip</h1><p>${record.month} · ${record.generated ? 'Demo generated record' : 'Demonstration record'}</p></header>
<p><strong>${record.employee}</strong> (${record.employeeId})<br>${record.department}</p>
<table>
 <tr><th>Basic Salary</th><td>${formatCurrency(record.basic)}</td></tr>
 <tr><th>Allowances</th><td>${formatCurrency(record.allowances)}</td></tr>
 <tr><th>Tax (TDS)</th><td>${formatCurrency(tax)}</td></tr>
 <tr><th>Provident Fund</th><td>${formatCurrency(providentFund)}</td></tr>
 <tr><th>Other deductions</th><td>${formatCurrency(record.deductions - tax - providentFund)}</td></tr>
 <tr class="total"><th>Net Salary</th><td>${formatCurrency(record.netPay)}</td></tr>
</table>
<p>Payment status: ${record.status}</p>
<div class="net"><strong>Net Pay: ${formatCurrency(record.netPay)}</strong></div>
<footer>Demonstration payslip generated from fictional data. Not valid for any official or tax purpose.</footer>
</body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payslip-${record.employeeId}-${record.month.replace(/\s+/g, '-')}.html`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success('Payslip downloaded as a demo HTML file')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payslip Preview"
        description="Generate, browse, and preview employee payslip records."
        actions={
          <>
            <Button variant="outline" onClick={() => setGenerateOpen(true)}><FilePlus2 className="h-4 w-4" /> Generate Payslips</Button>
            <Button variant="outline" onClick={downloadPayslip} disabled={!record}><Download className="h-4 w-4" /> Download</Button>
            <Button onClick={() => window.print()} disabled={!record}><Printer className="h-4 w-4" /> Print</Button>
          </>
        }
      />
      <DemoNotice compact />

      <Card>
        <CardContent className="py-4">
          <DataTable
            data={records}
            columns={columns}
            filters={filters}
            searchPlaceholder="Search by employee name, ID, month or status..."
            onRowClick={(row) => openDetails(row.id)}
            emptyTitle="No payslip records yet"
            rowActions={(row) => (
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Open payslip details" onClick={(e) => { e.stopPropagation(); openDetails(row.id) }}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            toolbar={<span className="text-xs text-muted-foreground">{records.length} record{records.length === 1 ? '' : 's'} · demo data</span>}
          />
        </CardContent>
      </Card>

      <div id="payslip-detail" className="mx-auto max-w-3xl scroll-mt-24">
        {!record ? (
          <Card><CardContent><EmptyState icon={Wallet} title="No payslip to preview" description="Generate demo payslips to see an individual record here." actionLabel="Generate Payslips" onAction={() => setGenerateOpen(true)} /></CardContent></Card>
        ) : (
          <Card className="overflow-hidden print:shadow-none">
            <div className="flex flex-col gap-4 bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15"><Wallet className="h-6 w-6" /></div>
                <div><p className="text-lg font-bold">PeopleFlow</p><p className="text-xs text-white/70">Employee Payslip · {record.month}</p></div>
              </div>
              <div className="text-left sm:text-right"><p className="text-xs text-white/70">Payslip ID</p><p className="font-mono text-sm font-semibold">PS-{record.id.toUpperCase()}</p></div>
            </div>

            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-14 w-14"><AvatarFallback className="bg-primary/10 text-primary text-lg">{initials(record.employee)}</AvatarFallback></Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xl font-bold">{record.employee}</p>
                    {record.generated && <Badge variant="info" className="text-[10px]">Demo generated</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{record.department} · Employee ID {record.employeeId}</p>
                </div>
                <div className="text-left sm:text-right"><p className="text-xs text-muted-foreground">Pay Period</p><p className="font-semibold">{record.month}</p></div>
              </div>

              <Separator className="my-6" />

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="mb-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">Earnings</p>
                  <div className="space-y-3 text-sm">
                    <Row label="Basic Salary" value={record.basic} />
                    <Row label="House Rent Allowance" value={record.allowances} />
                    <Separator />
                    <div className="flex justify-between font-semibold"><span>Gross Salary</span><span>{formatCurrency(gross)}</span></div>
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-semibold text-rose-600 dark:text-rose-400">Deductions</p>
                  <div className="space-y-3 text-sm">
                    <Row label="Tax (TDS)" value={Math.round(record.deductions * 0.6)} />
                    <Row label="Provident Fund" value={Math.round(record.deductions * 0.3)} />
                    <Row label="Other" value={record.deductions - Math.round(record.deductions * 0.6) - Math.round(record.deductions * 0.3)} />
                    <Separator />
                    <div className="flex justify-between font-semibold"><span>Total Deductions</span><span>{formatCurrency(record.deductions)}</span></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between rounded-xl bg-primary/5 p-4">
                <div><p className="text-sm text-muted-foreground">Net Pay</p><p className="text-xs text-muted-foreground">Demonstration value — no payment has been made</p></div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(record.netPay)}</p>
              </div>

              <p className="mt-6 text-center text-[11px] text-muted-foreground">
                This is a demonstration payslip generated from fictional data. Not valid for any official or tax purpose.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

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

function Row({ label, value }: { label: string; value: number }) {
  return <div className="flex justify-between text-muted-foreground"><span>{label}</span><span className="font-medium text-foreground">{formatCurrency(value)}</span></div>
}
