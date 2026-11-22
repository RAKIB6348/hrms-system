import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, CheckCircle2, Clock3, UserMinus, Users } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { ChartCard, axisProps, tooltipStyle } from '@/components/charts/ChartCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { attendanceOverview, attendanceRecords, employees } from '@/mocks/data'
import { initials } from '@/lib/utils'

const weeklyHours = [
  { day: 'Mon', hours: 8.2 }, { day: 'Tue', hours: 8.5 }, { day: 'Wed', hours: 7.9 },
  { day: 'Thu', hours: 8.8 }, { day: 'Fri', hours: 8.1 }, { day: 'Sat', hours: 6.4 },
]
const statusDistribution = [
  { name: 'Present', value: 198, color: '#10b981' }, { name: 'Absent', value: 9, color: '#f43f5e' },
  { name: 'On Leave', value: 13, color: '#f59e0b' },
]

export default function AttendanceDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Dashboard"
        description="Monitor today's attendance, work hours and team availability."
        actions={<Button asChild><Link to="/attendance/daily">Daily Attendance</Link></Button>}
      />
      <DemoNotice compact />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Workforce" value={220} icon={Users} tone="primary" description="across 8 departments" />
        <StatCard title="Present Today" value={198} icon={CheckCircle2} tone="emerald" trend={2.4} description="90% attendance" />
        <StatCard title="Average Hours" value="8.2h" icon={Clock3} tone="sky" description="per employee today" />
        <StatCard title="Absent / On Leave" value="22" icon={UserMinus} tone="rose" description="9 absent · 13 on leave" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Average Work Hours" description="Hours logged per day this week">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyHours} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="day" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 10]} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
              <Bar isAnimationActive={false} dataKey="hours" name="Hours" fill="#6366f1" radius={[5, 5, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Today's Status Breakdown" description="Headcount by attendance status">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie isAnimationActive={false} data={statusDistribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={88} paddingAngle={3} stroke="none">
                {statusDistribution.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4">
            {statusDistribution.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />{s.name}: {s.value}</span>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Monthly Attendance Trend" description="Present, absent and on-leave headcount over six months">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={attendanceOverview} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
            <Bar isAnimationActive={false} dataKey="present" name="Present" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={26} />
            <Bar isAnimationActive={false} dataKey="absent" name="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={26} />
            <Bar isAnimationActive={false} dataKey="leave" name="On Leave" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Today's Attendance</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link to="/attendance/history">View history <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {attendanceRecords.slice(0, 6).map((record) => {
            const emp = employees.find((e) => e.id === record.employeeId)
            return (
              <div key={record.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                <Avatar className="h-8 w-8"><AvatarFallback style={{ backgroundColor: emp?.avatarColor, color: '#fff' }}>{initials(record.employee)}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{record.employee}</p><p className="text-xs text-muted-foreground">{record.department} · {record.shift}</p></div>
                <div className="hidden text-right text-xs text-muted-foreground sm:block"><p>In {record.checkIn}</p><p>Out {record.checkOut}</p></div>
                <StatusBadge status={record.status} />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
