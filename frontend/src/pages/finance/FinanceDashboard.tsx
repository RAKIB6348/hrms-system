import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, Banknote, CreditCard, HandCoins, PieChart as PieIcon, TrendingDown, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { ChartCard, axisProps, tooltipStyle } from '@/components/charts/ChartCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useFinanceStore } from '@/hooks/use-finance-store'
import { formatCurrency } from '@/lib/utils'

const recovery = [
  { month: 'Jun', loans: 18, advances: 9 }, { month: 'Jul', loans: 22, advances: 12 },
  { month: 'Aug', loans: 20, advances: 8 }, { month: 'Sep', loans: 26, advances: 15 },
  { month: 'Oct', loans: 24, advances: 11 }, { month: 'Nov', loans: 28, advances: 14 },
]

export default function FinanceDashboard() {
  const loans = useFinanceStore((s) => s.loans)
  const advances = useFinanceStore((s) => s.advances)
  const totalOutstanding = loans.reduce((sum, l) => sum + l.outstanding, 0)
  const pendingAdvances = advances.filter((a) => a.status === 'Pending')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance Dashboard"
        description="Employee loans, advances and recovery overview."
        actions={<Button asChild><Link to="/finance/loans">Manage Loans</Link></Button>}
      />
      <DemoNotice compact />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Outstanding Loans" value={formatCurrency(totalOutstanding)} icon={CreditCard} tone="primary" description={`${loans.filter((l) => l.status === 'Active').length} active loans`} />
        <StatCard title="Pending Advances" value={pendingAdvances.length} icon={HandCoins} tone="amber" description="awaiting approval" />
        <StatCard title="Monthly EMI Collected" value={formatCurrency(loans.reduce((s, l) => s + l.emi, 0))} icon={Banknote} tone="emerald" trend={3.2} description="this month" />
        <StatCard title="Total Advances" value={formatCurrency(advances.reduce((s, a) => s + a.amount, 0))} icon={PieIcon} tone="violet" description="across all requests" />
      </div>

      <ChartCard title="Recovery Trends" description="Loan EMIs and advance recoveries over six months">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={recovery} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
              <linearGradient id="advGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Area isAnimationActive={false} type="monotone" dataKey="loans" name="Loans" stroke="#6366f1" strokeWidth={2} fill="url(#loanGrad)" />
            <Area isAnimationActive={false} type="monotone" dataKey="advances" name="Advances" stroke="#f59e0b" strokeWidth={2} fill="url(#advGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Active Loans</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/finance/loans">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loans.filter((l) => l.status === 'Active').slice(0, 4).map((loan) => (
              <div key={loan.id} className="space-y-1.5">
                <div className="flex justify-between text-sm"><span className="font-medium">{loan.employee}</span><span className="text-xs text-muted-foreground">{formatCurrency(loan.outstanding)} left</span></div>
                <Progress value={((loan.amount - loan.outstanding) / loan.amount) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Advances</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/finance/advances">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {advances.slice(0, 5).map((advance) => (
              <div key={advance.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Wallet className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{advance.employee}</p><p className="truncate text-xs text-muted-foreground">{advance.reason}</p></div>
                <span className="text-sm font-semibold">{formatCurrency(advance.amount)}</span>
                <StatusBadge status={advance.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-700 dark:text-emerald-400">
        <TrendingDown className="h-5 w-5" /> Outstanding loan balance decreased by 6.4% this month.
      </div>
    </div>
  )
}
