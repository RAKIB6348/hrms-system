import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, ArrowDownRight, ArrowUpRight, Users } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { ChartCard, axisProps, tooltipStyle } from '@/components/charts/ChartCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { departmentDistribution, employees } from '@/mocks/data'
import { formatNumber } from '@/lib/utils'

const headcount = [
  { month: 'Jun', count: 186 }, { month: 'Jul', count: 192 }, { month: 'Aug', count: 198 },
  { month: 'Sep', count: 203 }, { month: 'Oct', count: 211 }, { month: 'Nov', count: 220 },
]
const gender = [
  { name: 'Male', value: 118, color: '#6366f1' }, { name: 'Female', value: 94, color: '#ec4899' },
  { name: 'Other', value: 8, color: '#10b981' },
]
const attrition = [
  { month: 'Jun', rate: 2.1 }, { month: 'Jul', rate: 1.8 }, { month: 'Aug', rate: 2.4 },
  { month: 'Sep', rate: 1.5 }, { month: 'Oct', rate: 1.2 }, { month: 'Nov', rate: 1.1 },
]

export default function HrAnalytics() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Analytics"
        description="Workforce insights, demographics and attrition trends."
        actions={<Button variant="outline" onClick={() => toast.success('HR analytics report export started (demo)')}><Download className="h-4 w-4" /> Export Report</Button>}
      />
      <DemoNotice compact />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Headcount" value={220} icon={Users} tone="primary" trend={8.2} description="vs. last month" />
        <StatCard title="New Hires" value={34} icon={ArrowUpRight} tone="emerald" trend={12} description="this quarter" />
        <StatCard title="Attrition Rate" value="1.1%" icon={ArrowDownRight} tone="sky" trend={-0.3} description="monthly average" />
        <StatCard title="Avg. Tenure" value="3.4 yrs" icon={Activity} tone="violet" description="across workforce" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Headcount Growth" description="Employee headcount over six months">
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={headcount} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <defs><linearGradient id="hcGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} domain={[150, 230]} />
              <Tooltip {...tooltipStyle} />
              <Area isAnimationActive={false} type="monotone" dataKey="count" name="Employees" stroke="#6366f1" strokeWidth={2} fill="url(#hcGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gender Distribution" description="Workforce composition by gender">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie isAnimationActive={false} data={gender} dataKey="value" nameKey="name" innerRadius={60} outerRadius={88} paddingAngle={3} stroke="none">
                {gender.map((g) => <Cell key={g.name} fill={g.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4">
            {gender.map((g) => <span key={g.name} className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: g.color }} />{g.name}: {g.value}</span>)}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Department Headcount" description="Employees per department">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={departmentDistribution} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" {...axisProps} angle={-30} textAnchor="end" height={60} interval={0} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
              <Bar isAnimationActive={false} dataKey="value" name="Employees" fill="#8b5cf6" radius={[5, 5, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Attrition Trend" description="Monthly employee attrition rate (%)">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={attrition} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <defs><linearGradient id="attrGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 3]} />
              <Tooltip {...tooltipStyle} />
              <Area isAnimationActive={false} type="monotone" dataKey="rate" name="Attrition %" stroke="#f43f5e" strokeWidth={2} fill="url(#attrGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Employee Snapshot</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Snapshot label="Active Employees" value={formatNumber(198)} />
          <Snapshot label="On Probation" value={formatNumber(9)} />
          <Snapshot label="Inactive" value={formatNumber(13)} />
        </CardContent>
      </Card>
    </div>
  )
}

function Snapshot({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p><p className="text-[11px] text-muted-foreground">of {employees.length} sampled records</p></div>
}
