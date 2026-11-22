import { useState } from 'react'
import { toast } from 'sonner'
import { Download, Printer, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { payrollRecords } from '@/mocks/data'
import { formatCurrency, initials } from '@/lib/utils'

export default function PayslipPreview() {
  const [selectedId, setSelectedId] = useState(payrollRecords[0]!.id)
  const record = payrollRecords.find((r) => r.id === selectedId)!
  const gross = record.basic + record.allowances

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payslip Preview"
        description="Preview and download employee payslips."
        actions={
          <>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
              <SelectContent>{payrollRecords.map((r) => <SelectItem key={r.id} value={r.id}>{r.employee} · {r.month}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" onClick={() => toast.success('Payslip download started (demo)')}><Download className="h-4 w-4" /> Download</Button>
            <Button onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
          </>
        }
      />
      <DemoNotice compact />

      <div className="mx-auto max-w-3xl">
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
                <p className="text-xl font-bold">{record.employee}</p>
                <p className="text-sm text-muted-foreground">{record.department} · Employee ID PF-{record.id.slice(4)}</p>
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
              <div><p className="text-sm text-muted-foreground">Net Pay</p><p className="text-xs text-muted-foreground">Amount credited to employee account</p></div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(record.netPay)}</p>
            </div>

            <p className="mt-6 text-center text-[11px] text-muted-foreground">
              This is a demonstration payslip generated from fictional data. Not valid for any official or tax purpose.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return <div className="flex justify-between text-muted-foreground"><span>{label}</span><span className="font-medium text-foreground">{formatCurrency(value)}</span></div>
}
