import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Banknote, Download, Receipt, TrendingUp, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { ChartCard, axisProps, tooltipStyle } from '@/components/charts/ChartCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { salaryTrend } from '@/mocks/data'
import { formatCurrency } from '@/lib/utils'

const byDepartment = [
  { name: 'Engineering', amount: 742000 }, { name: 'Sales', amount: 312000 },
  { name: 'Operations', amount: 228000 }, { name: 'Customer Success', amount: 196000 },
  { name: 'Marketing', amount: 174000 }, { name: 'Human Resources', amount: 136000 },
  { name: 'Finance', amount: 118000 }, { name: 'Design', amount: 107000 },
]

export default function PayrollReports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Reports"
        description="Salary distribution, payroll cost trends and department breakdown."
        actions={<Button variant="outline" onClick={() => toast.success('Payroll report exported (demo)')}><Download className="h-4 w-4" /> Export Report</Button>}
      />
      <DemoNotice compact />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Annual Payroll Cost" value={formatCurrency(21360000)} icon={Wallet} tone="primary" trend={5.2} description="projected" />
        <StatCard title="Monthly Average" value={formatCurrency(1780000)} icon={Banknote} tone="violet" description="last 6 months" />
        <StatCard title="Total Payslips" value="2,592" icon={Receipt} tone="sky" description="issued this year" />
        <StatCard title="Cost per Employee" value={formatCurrency(9709)} icon={TrendingUp} tone="emerald" trend={2.1} description="monthly average" />
      </div>

      <ChartCard title="Payroll Cost Trend" description="Monthly payroll expenditure over six months">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={salaryTrend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs><linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
            <Tooltip {...tooltipStyle} formatter={(v) => [formatCurrency(Number(v)), 'Payroll']} />
            <Area isAnimationActive={false} type="monotone" dataKey="amount" name="Payroll" stroke="#8b5cf6" strokeWidth={2} fill="url(#payGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Monthly Payroll by Department" description="Current month salary distribution">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={byDepartment} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" {...axisProps} angle={-25} textAnchor="end" height={60} interval={0} />
            <YAxis {...axisProps} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle} formatter={(v) => [formatCurrency(Number(v)), 'Payroll']} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
            <Bar isAnimationActive={false} dataKey="amount" name="Payroll" fill="#6366f1" radius={[5, 5, 0, 0]} maxBarSize={34} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <Card>
        <CardHeader><CardTitle className="text-base">Payroll Summary</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Summary label="Gross Salary" value={formatCurrency(2098000)} />
          <Summary label="Total Deductions" value={formatCurrency(253000)} />
          <Summary label="Net Disbursement" value={formatCurrency(1845000)} highlight />
        </CardContent>
      </Card>
    </div>
  )
}

function Summary({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={'rounded-lg border p-4 ' + (highlight ? 'border-primary/30 bg-primary/5' : '')}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={'mt-1 text-2xl font-bold ' + (highlight ? 'text-primary' : '')}>{value}</p>
    </div>
  )
}
