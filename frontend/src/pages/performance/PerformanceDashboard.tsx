import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, Award, CheckCircle2, Star, Target, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { ChartCard, axisProps, tooltipStyle } from '@/components/charts/ChartCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { goals, performanceReviews } from '@/mocks/data'
import { initials } from '@/lib/utils'

const ratings = [
  { name: '5 stars', value: 18, color: '#10b981' }, { name: '4 stars', value: 42, color: '#6366f1' },
  { name: '3 stars', value: 28, color: '#f59e0b' }, { name: '2 stars', value: 9, color: '#f43f5e' },
  { name: '1 star', value: 3, color: '#94a3b8' },
]
const deptPerformance = [
  { dept: 'Engineering', score: 4.4 }, { dept: 'Sales', score: 4.1 },
  { dept: 'Design', score: 4.6 }, { dept: 'Marketing', score: 3.9 },
  { dept: 'Finance', score: 4.2 }, { dept: 'Operations', score: 4.0 },
]

export default function PerformanceDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Dashboard"
        description="Track employee reviews, goal progress and team performance."
        actions={<Button asChild><Link to="/performance/reviews">Employee Reviews</Link></Button>}
      />
      <DemoNotice compact />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Avg. Rating" value="4.2 / 5" icon={Star} tone="amber" trend={4.5} description="this quarter" />
        <StatCard title="Reviews Completed" value={28} icon={CheckCircle2} tone="emerald" description="of 34 planned" />
        <StatCard title="Goals On Track" value={5} icon={Target} tone="primary" description="out of 8 active" />
        <StatCard title="Top Performers" value={12} icon={Award} tone="violet" description="rated 4.5+" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Rating Distribution" description="Performance ratings across all reviews">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie isAnimationActive={false} data={ratings} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                {ratings.map((r) => <Cell key={r.name} fill={r.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3">
            {ratings.map((r) => <span key={r.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />{r.name} ({r.value}%)</span>)}
          </div>
        </ChartCard>

        <ChartCard title="Department Performance" description="Average review score by department">
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={deptPerformance} layout="vertical" margin={{ top: 4, right: 16, left: 12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 5]} {...axisProps} />
              <YAxis type="category" dataKey="dept" {...axisProps} width={84} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
              <Bar isAnimationActive={false} dataKey="score" name="Avg. Score" fill="#6366f1" radius={[0, 5, 5, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Goal Progress</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/performance/goals">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.slice(0, 5).map((goal) => (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm"><span className="truncate">{goal.title}</span><span className="shrink-0 text-xs font-semibold">{goal.progress}%</span></div>
                <Progress value={goal.progress} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Top Performers</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/performance/reviews">Reviews <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {performanceReviews.slice(0, 5).map((review) => (
              <div key={review.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8"><AvatarFallback>{initials(review.employee)}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{review.employee}</p><p className="text-xs text-muted-foreground">{review.period}</p></div>
                <span className="flex items-center gap-1 text-sm font-semibold"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{review.rating.toFixed(1)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
        <TrendingUp className="h-5 w-5" /> Overall performance improved by 4.5% compared to the previous review cycle.
      </div>
    </div>
  )
}
