import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, Banknote, CheckCircle2, Clock3, FileText, Users, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { ChartCard, axisProps, tooltipStyle } from '@/components/charts/ChartCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/common/StatusBadge'
import { payrollBatches, payrollRecords, salaryTrend } from '@/mocks/data'
import { formatCurrency } from '@/lib/utils'

export default function PayrollDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Dashboard"
        description="Monitor payroll cycles, disbursements and salary costs."
        actions={<Button asChild><Link to="/payroll/batches">View Batches</Link></Button>}
      />
      <DemoNotice compact />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Monthly Payroll" value={formatCurrency(1845000)} icon={Wallet} tone="primary" trend={3.6} description="November 2026" />
        <StatCard title="Employees Paid" value={216} icon={Users} tone="emerald" description="out of 220" />
        <StatCard title="Processing" value={4} icon={Clock3} tone="amber" description="records in progress" />
        <StatCard title="Avg. Salary" value={formatCurrency(7260)} icon={Banknote} tone="violet" trend={2.1} description="per employee / month" />
      </div>

      <ChartCard title="Salary Cost Trend" description="Total monthly payroll spend over six months">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={salaryTrend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
            <Tooltip {...tooltipStyle} formatter={(value) => [formatCurrency(Number(value)), 'Payroll']} />
            <Area isAnimationActive={false} type="monotone" dataKey="amount" name="Payroll" stroke="#8b5cf6" strokeWidth={2} fill="url(#salaryGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Payroll Batches</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/payroll/batches">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {payrollBatches.map((batch) => (
              <div key={batch.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{batch.name}</p><p className="text-xs text-muted-foreground">{batch.employees} employees · {formatCurrency(batch.totalAmount)}</p></div>
                <StatusBadge status={batch.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Current Batch Progress</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Salary calculation</span><span className="font-semibold">100%</span></div>
              <Progress value={100} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax & deductions</span><span className="font-semibold">92%</span></div>
              <Progress value={92} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Bank file generation</span><span className="font-semibold">68%</span></div>
              <Progress value={68} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Disbursement</span><span className="font-semibold">0%</span></div>
              <Progress value={0} />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> 216 of 220 employees processed successfully.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Latest Payroll Records</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link to="/payroll/payslips">View payslips <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {payrollRecords.slice(0, 6).map((record) => (
            <div key={record.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div><p className="font-medium">{record.employee}</p><p className="text-xs text-muted-foreground">{record.department}</p></div>
              <div className="flex items-center gap-4"><span className="font-semibold">{formatCurrency(record.netPay)}</span><StatusBadge status={record.status} /></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
