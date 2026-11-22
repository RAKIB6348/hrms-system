import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarCheck, CheckCircle2, Clock3, UserMinus } from 'lucide-react'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { ChartCard, axisProps, tooltipStyle } from '@/components/charts/ChartCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { attendanceOverview } from '@/mocks/data'

const byDepartment = [
  { name: 'Engineering', rate: 93 }, { name: 'Sales', rate: 89 },
  { name: 'Operations', rate: 91 }, { name: 'Marketing', rate: 95 },
  { name: 'Finance', rate: 97 }, { name: 'Design', rate: 92 },
]

export default function AttendanceReports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Reports"
        description="Department-level attendance rates and monthly trends."
        actions={<Button variant="outline" onClick={() => toast.success('Attendance report exported (demo)')}><Download className="h-4 w-4" /> Export Report</Button>}
      />
      <DemoNotice compact />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Avg. Attendance" value="92.4%" icon={CalendarCheck} tone="primary" trend={2.4} description="this month" />
        <StatCard title="Present Days" value="4,512" icon={CheckCircle2} tone="emerald" description="across all employees" />
        <StatCard title="Late Arrivals" value="38" icon={Clock3} tone="amber" trend={-8} description="vs. last month" />
        <StatCard title="Absent Days" value="186" icon={UserMinus} tone="rose" description="this month" />
      </div>

      <ChartCard title="Monthly Attendance Overview" description="Present, absent and on-leave headcount">
        <ResponsiveContainer width="100%" height={290}>
          <BarChart data={attendanceOverview} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
            <Bar isAnimationActive={false} dataKey="present" name="Present" fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={28} />
            <Bar isAnimationActive={false} dataKey="absent" name="Absent" fill="#f43f5e" radius={[5, 5, 0, 0]} maxBarSize={28} />
            <Bar isAnimationActive={false} dataKey="leave" name="On Leave" fill="#f59e0b" radius={[5, 5, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <Card>
        <CardHeader><CardTitle className="text-base">Attendance Rate by Department</CardTitle></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {byDepartment.map((dept) => (
            <div key={dept.name} className="space-y-2">
              <div className="flex justify-between text-sm"><span className="font-medium">{dept.name}</span><span className="font-semibold">{dept.rate}%</span></div>
              <Progress value={dept.rate} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
