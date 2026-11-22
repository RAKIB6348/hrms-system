import { useState } from 'react'
import { toast } from 'sonner'
import { Flag, Plus, CalendarDays } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { goals } from '@/mocks/data'
import { formatDate } from '@/lib/utils'
import type { Goal } from '@/types'

export default function GoalsKpis() {
  const [tab, setTab] = useState('all')
  const [rows] = useState<Goal[]>(goals)
  const visible = tab === 'all' ? rows : rows.filter((g) => g.status === tab)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals & KPIs"
        description="Track individual objectives and key performance indicators."
        actions={<Button onClick={() => toast.success('New goal form opened (demo)')}><Plus className="h-4 w-4" /> Add Goal</Button>}
      />
      <DemoNotice compact />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="all">All Goals</TabsTrigger>
          <TabsTrigger value="On Track">On Track</TabsTrigger>
          <TabsTrigger value="At Risk">At Risk</TabsTrigger>
          <TabsTrigger value="Completed">Completed</TabsTrigger>
          <TabsTrigger value="Overdue">Overdue</TabsTrigger>
        </TabsList>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((goal) => (
            <Card key={goal.id} className="transition-shadow hover:shadow-md">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Flag className="h-4 w-4" /></div>
                  <Badge variant={goal.status === 'Completed' ? 'success' : goal.status === 'On Track' ? 'info' : goal.status === 'At Risk' ? 'warning' : 'destructive'}>{goal.status}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold leading-snug">{goal.title}</p>
                  <p className="text-xs text-muted-foreground">{goal.employee} · {goal.category}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Progress</span><span className="font-semibold">{goal.progress}%</span></div>
                  <Progress value={goal.progress} indicatorClassName={goal.progress === 100 ? 'bg-emerald-500' : goal.progress < 40 ? 'bg-rose-500' : undefined} />
                </div>
                <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatDate(goal.dueDate, { month: 'short', day: 'numeric' })}</span>
                  <Badge variant="outline" className="text-[10px]">{goal.priority}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
