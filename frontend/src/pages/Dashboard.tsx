import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { ArrowRight, BriefcaseBusiness, CalendarDays, Cake, Clock3, UserRound, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ChartCard, axisProps, tooltipStyle } from '@/components/charts/ChartCard'
import { dashboardKpiConfig } from '@/features/dashboard/kpi-config'
import { useMockQuery } from '@/hooks/use-mock-query'
import {
  activities, attendanceOverview, dashboardKpis, departmentDistribution,
  employees, leaveRequests, recruitmentTrends, upcomingBirthdays,
} from '@/mocks/data'
import { initials } from '@/lib/utils'

const activityIcons = {
  employee: UserRound, leave: CalendarDays, payroll: Wallet,
  recruitment: BriefcaseBusiness, attendance: Clock3,
}

export default function Dashboard() {
  const { isLoading } = useMockQuery('dashboard', () => dashboardKpis)
  const recentEmployees = useMemo(() => employees.slice(0, 5), [])
  const pendingLeaves = useMemo(() => leaveRequests.filter((l) => l.status === 'Pending').slice(0, 4), [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Good morning, Meera 👋"
        description="Here's what's happening across your organization today — Monday, November 22, 2026."
        actions={
          <>
            <Button variant="outline" asChild><Link to="/reports">View reports</Link></Button>
            <Button asChild><Link to="/employees/new">Add employee</Link></Button>
          </>
        }
      />
      <DemoNotice />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {dashboardKpiConfig.map((kpi) => <StatCard key={kpi.title} {...kpi} />)}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Attendance Overview" description="Monthly present, absent and on-leave headcount" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={attendanceOverview} barGap={2} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
              <Bar isAnimationActive={false} dataKey="present" name="Present" fill="#6366f1" radius={[5, 5, 0, 0]} maxBarSize={26} />
              <Bar isAnimationActive={false} dataKey="absent" name="Absent" fill="#f43f5e" radius={[5, 5, 0, 0]} maxBarSize={26} />
              <Bar isAnimationActive={false} dataKey="leave" name="On Leave" fill="#f59e0b" radius={[5, 5, 0, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Employees by Department" description="Current workforce distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie isAnimationActive={false} data={departmentDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                {departmentDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {departmentDistribution.slice(0, 6).map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="truncate text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Monthly Recruitment Trends" description="Applications received vs. hires">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={recruitmentTrends} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="applications" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="hired" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Area isAnimationActive={false} type="monotone" dataKey="applications" name="Applications" stroke="#6366f1" strokeWidth={2} fill="url(#applications)" />
              <Area isAnimationActive={false} type="monotone" dataKey="hired" name="Hired" stroke="#10b981" strokeWidth={2} fill="url(#hired)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Employees</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/employees">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEmployees.map((emp) => (
              <Link key={emp.id} to={`/employees/${emp.id}`} className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-accent">
                <Avatar className="h-9 w-9">
                  <AvatarFallback style={{ backgroundColor: emp.avatarColor, color: '#fff' }}>{initials(`${emp.firstName} ${emp.lastName}`)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{emp.firstName} {emp.lastName}</p>
                  <p className="truncate text-xs text-muted-foreground">{emp.designation} · {emp.department}</p>
                </div>
                <Badge variant="outline" className="hidden shrink-0 text-[10px] sm:inline-flex">{emp.location}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Pending Leave Requests</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/leave/requests">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingLeaves.map((leave) => (
              <div key={leave.id} className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar className="h-8 w-8"><AvatarFallback>{initials(leave.employee)}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{leave.employee}</p>
                  <p className="truncate text-xs text-muted-foreground">{leave.leaveType} · {leave.days} days · {leave.startDate}</p>
                </div>
                <StatusBadge status={leave.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Upcoming Birthdays</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {upcomingBirthdays.map((person) => (
              <div key={person.name} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${person.color}20`, color: person.color }}>
                  <Cake className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{person.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{person.department}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">{person.date}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Recent Activities</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {activities.slice(0, 4).map((activity) => {
              const Icon = activityIcons[activity.type]
              return (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-xs font-medium">{activity.title}</p>
                    <p className="line-clamp-1 text-[11px] text-muted-foreground">{activity.description}</p>
                    <p className="text-[10px] text-muted-foreground/70">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
