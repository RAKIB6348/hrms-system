import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, BriefcaseBusiness, CalendarDays, CheckCircle2, Users, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/common/EmptyState'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatusBadge } from '@/components/common/StatusBadge'
import { applications, jobOpenings } from '@/mocks/data'
import { formatDate } from '@/lib/utils'

export default function JobDetails() {
  const { id } = useParams()
  const job = jobOpenings.find((j) => j.id === id)

  if (!job) return <EmptyState icon={BriefcaseBusiness} title="Job not found" description="This job opening does not exist in the demo data." actionLabel="Back to job openings" onAction={() => window.history.back()} />

  const related = applications.filter((a) => a.job === job.title).slice(0, 5)

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild><Link to="/recruitment/jobs"><ArrowLeft className="h-4 w-4" /> Back to job openings</Link></Button>
      <DemoNotice compact />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><BriefcaseBusiness className="h-6 w-6" /></div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight">{job.title}</h1><StatusBadge status={job.status} /></div>
                <p className="text-sm text-muted-foreground">{job.department} · {job.location} · {job.type}</p>
              </div>
            </div>
            <Button onClick={() => toast.success('Application link copied (demo)')}>Share Job</Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Detail icon={Users} label="Applicants" value={`${job.applicants}`} />
            <Detail icon={Wallet} label="Salary Range" value={job.salaryRange} />
            <Detail icon={CalendarDays} label="Posted On" value={formatDate(job.postedOn)} />
            <Detail icon={CheckCircle2} label="Closes On" value={formatDate(job.closesOn)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Job Description</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p className="text-muted-foreground">{job.description}</p>
            <Separator />
            <div>
              <p className="mb-2 font-semibold">Requirements</p>
              <ul className="space-y-2">
                {job.requirements.map((r) => <li key={r} className="flex items-start gap-2 text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{r}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Hiring Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Hiring Manager</span><span className="font-medium">{job.hiringManager}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span className="font-medium">{job.department}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="font-medium">{job.location}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Employment Type</span><Badge variant="secondary">{job.type}</Badge></div>
            <Separator />
            <Button className="w-full" onClick={() => toast.success(`${job.applicants} applicants loaded (demo)`)}>View All Applications</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Applications</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {related.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No applications for this role yet.</p> : related.map((app) => (
            <div key={app.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div><p className="font-medium">{app.candidate}</p><p className="text-xs text-muted-foreground">{app.experience} · {app.location}</p></div>
              <StatusBadge status={app.stage} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function Detail({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Icon className="h-5 w-5 text-primary" />
      <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate font-semibold">{value}</p></div>
    </div>
  )
}
