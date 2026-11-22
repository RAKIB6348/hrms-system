import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowRight, MoreHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { applications } from '@/mocks/data'
import { initials } from '@/lib/utils'
import type { Application, ApplicationStage } from '@/types'

const columns: ApplicationStage[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired']
const columnColors: Record<string, string> = {
  Applied: 'bg-indigo-500', Screening: 'bg-violet-500', Interview: 'bg-amber-500',
  Offer: 'bg-sky-500', Hired: 'bg-emerald-500',
}

export default function Pipeline() {
  const [rows, setRows] = useState(applications.filter((a) => a.stage !== 'Rejected').slice(0, 15))

  const move = (app: Application, direction: 1 | -1) => {
    const currentIndex = columns.indexOf(app.stage)
    const next = columns[currentIndex + direction]
    if (!next) { toast.info('Already at the end of the pipeline'); return }
    setRows((prev) => prev.map((r) => r.id === app.id ? { ...r, stage: next } : r))
    toast.success(`${app.candidate} moved to ${next}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Recruitment Pipeline" description="A visual kanban board of candidates across hiring stages." />
      <DemoNotice compact />
      <div className="scrollbar-thin -mx-1 flex gap-4 overflow-x-auto px-1 pb-4">
        {columns.map((stage) => {
          const stageRows = rows.filter((r) => r.stage === stage)
          return (
            <div key={stage} className="w-[280px] shrink-0">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${columnColors[stage]}`} />{stage}</span>
                    <Badge variant="secondary">{stageRows.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stageRows.length === 0 && (
                    <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">No candidates in this stage</div>
                  )}
                  {stageRows.map((app) => (
                    <div key={app.id} className="group rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px]">{initials(app.candidate)}</AvatarFallback></Avatar>
                          <div className="min-w-0"><p className="truncate text-sm font-medium">{app.candidate}</p><p className="truncate text-[11px] text-muted-foreground">{app.job}</p></div>
                        </div>
                        <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">{app.experience}</Badge>
                        <div className="flex gap-1">
                          {columns.indexOf(stage) > 0 && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 rotate-180" onClick={() => move(app, -1)} aria-label="Move back"><ArrowRight className="h-3.5 w-3.5" /></Button>
                          )}
                          {columns.indexOf(stage) < columns.length - 1 && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => move(app, 1)} aria-label="Move forward"><ArrowRight className="h-3.5 w-3.5" /></Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
