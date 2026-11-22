import { useState } from 'react'
import { toast } from 'sonner'
import { Mail, Star } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { applications } from '@/mocks/data'
import { formatDate, initials } from '@/lib/utils'
import type { Application, ApplicationStage } from '@/types'

const stages: ApplicationStage[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected']

const filters: TableFilter<Application>[] = [
  { key: 'stage', label: 'Stages', options: stages, value: (r) => r.stage },
  { key: 'job', label: 'Jobs', options: [...new Set(applications.map((a) => a.job))], value: (r) => r.job },
]

export default function Applications() {
  const [rows, setRows] = useState(applications)

  const columns: Column<Application>[] = [
    {
      key: 'candidate', header: 'Candidate',
      cell: (a) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9"><AvatarFallback>{initials(a.candidate)}</AvatarFallback></Avatar>
          <div className="min-w-0"><p className="truncate font-medium">{a.candidate}</p><p className="truncate text-xs text-muted-foreground">{a.email}</p></div>
        </div>
      ), sortValue: (a) => a.candidate,
    },
    { key: 'job', header: 'Job', cell: (a) => <span className="text-muted-foreground">{a.job}</span>, sortValue: (a) => a.job },
    { key: 'experience', header: 'Experience', cell: (a) => a.experience, sortValue: (a) => parseInt(a.experience) },
    { key: 'rating', header: 'Rating', cell: (a) => <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{a.rating}.0</div>, sortValue: (a) => a.rating },
    { key: 'appliedOn', header: 'Applied On', cell: (a) => formatDate(a.appliedOn, { month: 'short', day: 'numeric' }), sortValue: (a) => a.appliedOn },
    { key: 'stage', header: 'Stage', cell: (a) => <StatusBadge status={a.stage} /> },
  ]

  const advance = (app: Application, stage: string) => {
    setRows((prev) => prev.map((r) => r.id === app.id ? { ...r, stage: stage as ApplicationStage } : r))
    toast.success(`${app.candidate} moved to ${stage}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Applications" description="Review candidates and manage their pipeline stage." />
      <DemoNotice compact />
      <DataTable
        data={rows} columns={columns} filters={filters} searchPlaceholder="Search candidates..."
        toolbar={
          <span className="text-xs text-muted-foreground">Use the column dropdown to advance candidates</span>
        }
        rowActions={(app) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info(`Email drafted for ${app.candidate} (demo)`)}><Mail className="h-4 w-4" /></Button>
            <Select value={app.stage} onValueChange={(v) => advance(app, v)}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{stages.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
      />
    </div>
  )
}
