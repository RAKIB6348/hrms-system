import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, Users } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { ChartCard, axisProps, tooltipStyle } from '@/components/charts/ChartCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { applications, jobOpenings, recruitmentTrends } from '@/mocks/data'
import { initials } from '@/lib/utils'
import { StatusBadge } from '@/components/common/StatusBadge'

const funnel = [
  { stage: 'Applied', count: 143 }, { stage: 'Screened', count: 96 },
  { stage: 'Interviewed', count: 54 }, { stage: 'Offered', count: 21 }, { stage: 'Hired', count: 12 },
]
const funnelColors = ['#6366f1', '#8b5cf6', '#a855f7', '#10b981', '#0ea5e9']
const pipeline = [
  { name: 'Applied', value: 48, color: '#6366f1' },
  { name: 'Screening', value: 26, color: '#8b5cf6' },
  { name: 'Interview', value: 19, color: '#f59e0b' },
  { name: 'Offer', value: 8, color: '#10b981' },
]

export default function RecruitmentDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment Dashboard"
        description="Track hiring performance, open roles and candidate pipeline."
        actions={<Button asChild><Link to="/recruitment/jobs/new">Create Job</Link></Button>}
      />
      <DemoNotice compact />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Open Positions" value={12} icon={BriefcaseBusiness} tone="primary" trend={12} description="4 new this month" />
        <StatCard title="Total Applicants" value={143} icon={Users} tone="violet" trend={18} description="in November" />
        <StatCard title="Interviews Scheduled" value={19} icon={Clock3} tone="amber" description="this week" />
        <StatCard title="Hires This Month" value={12} icon={CheckCircle2} tone="emerald" trend={9} description="target: 15" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Hiring Funnel" description="Candidate progression across stages">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnel} layout="vertical" margin={{ top: 4, right: 16, left: 12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" {...axisProps} />
              <YAxis type="category" dataKey="stage" {...axisProps} width={78} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
              <Bar isAnimationActive={false} dataKey="count" name="Candidates" radius={[0, 5, 5, 0]} barSize={22}>
                {funnel.map((f, i) => <Cell key={f.stage} fill={funnelColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Candidate Pipeline" description="Active candidates by stage">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie isAnimationActive={false} data={pipeline} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                {pipeline.map((p) => <Cell key={p.name} fill={p.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3">
            {pipeline.map((p) => (
              <span key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />{p.name} ({p.value})
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Recruitment Trends" description="Applications and hires over the last six months">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={recruitmentTrends} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
            <Bar isAnimationActive={false} dataKey="applications" name="Applications" fill="#6366f1" radius={[5, 5, 0, 0]} maxBarSize={28} />
            <Bar isAnimationActive={false} dataKey="hired" name="Hired" fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Active Job Openings</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/recruitment/jobs">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobOpenings.filter((j) => j.status === 'Open').slice(0, 4).map((job) => (
              <Link key={job.id} to={`/recruitment/jobs/${job.id}`} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><BriefcaseBusiness className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{job.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{job.department} · {job.location}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">{job.applicants} applicants</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/recruitment/applications">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <div key={app.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8"><AvatarFallback>{initials(app.candidate)}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{app.candidate}</p><p className="truncate text-xs text-muted-foreground">{app.job}</p></div>
                <StatusBadge status={app.stage} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
