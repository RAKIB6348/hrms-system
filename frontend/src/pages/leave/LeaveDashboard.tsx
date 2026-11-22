import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, CheckCircle2, Clock3, Plane, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { ChartCard, axisProps, tooltipStyle } from '@/components/charts/ChartCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/common/StatusBadge'
import { leaveRequests, leaveTypes } from '@/mocks/data'
import { initials } from '@/lib/utils'

const usage = [
  { month: 'Jun', approved: 18, pending: 6 }, { month: 'Jul', approved: 22, pending: 4 },
  { month: 'Aug', approved: 15, pending: 9 }, { month: 'Sep', approved: 26, pending: 5 },
  { month: 'Oct', approved: 19, pending: 7 }, { month: 'Nov', approved: 24, pending: 5 },
]

export default function LeaveDashboard() {
  const pending = leaveRequests.filter((r) => r.status === 'Pending')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Dashboard"
        description="Overview of leave balances, requests and upcoming time off."
        actions={<Button asChild><Link to="/leave/requests">Review Requests</Link></Button>}
      />
      <DemoNotice compact />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Pending Requests" value={pending.length} icon={Clock3} tone="amber" description="awaiting approval" />
        <StatCard title="Approved This Month" value={24} icon={CheckCircle2} tone="emerald" trend={6} description="vs. last month" />
        <StatCard title="Rejected Requests" value={3} icon={XCircle} tone="rose" description="in November" />
        <StatCard title="Employees on Leave" value={13} icon={Plane} tone="violet" description="today" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Leave Request Trends" description="Approved vs. pending requests over six months">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={usage} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
              <Bar isAnimationActive={false} dataKey="approved" name="Approved" fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={28} />
              <Bar isAnimationActive={false} dataKey="pending" name="Pending" fill="#f59e0b" radius={[5, 5, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Leave Type Balances</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/leave/types">Manage <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {leaveTypes.slice(0, 5).map((type) => {
              const used = 3 + (leaveTypes.indexOf(type) * 2) % 9
              return (
                <div key={type.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: type.color }} />{type.name}</span>
                    <span className="text-xs text-muted-foreground">{type.annualAllowance - used} / {type.annualAllowance} days left</span>
                  </div>
                  <Progress value={(used / type.annualAllowance) * 100} indicatorClassName="" className="h-1.5" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Pending Leave Requests</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link to="/leave/requests">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {pending.map((request) => (
            <div key={request.id} className="flex items-center gap-3 rounded-lg border p-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{initials(request.employee)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{request.employee}</p>
                <p className="truncate text-xs text-muted-foreground">{request.leaveType} · {request.startDate} → {request.endDate} · {request.days} days</p>
              </div>
              <StatusBadge status={request.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
