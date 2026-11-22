import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Mail,
  Star,
  Plus,
  Users,
  Clock3,
  BriefcaseBusiness,
  CheckCircle2,
  Kanban,
  Eye,
  MoreHorizontal,
  Calendar,
  MapPin,
  Briefcase,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  XCircle,
  Download,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { applications, jobOpenings } from '@/mocks/data'
import { formatDate, initials } from '@/lib/utils'
import type { Application, ApplicationStage } from '@/types'

const stages: ApplicationStage[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected']
const pipelineSteps: ApplicationStage[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired']

const stageStyles: Record<
  ApplicationStage,
  {
    dot: string
    badge: string
  }
> = {
  Applied: {
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  },
  Screening: {
    dot: 'bg-violet-500',
    badge: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
  },
  Interview: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  Offer: {
    dot: 'bg-sky-500',
    badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  },
  Hired: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  Rejected: {
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  },
}

export default function Applications() {
  const [rows, setRows] = useState<Application[]>(applications)
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null)

  // Add Candidate Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    job: jobOpenings[0]?.title || 'Senior Frontend Engineer',
    stage: 'Applied' as ApplicationStage,
    experience: '3 years',
    location: 'New York',
    rating: 4,
  })

  const jobOptions = useMemo(() => {
    return Array.from(new Set(jobOpenings.map((j) => j.title)))
  }, [])

  const filters: TableFilter<Application>[] = [
    { key: 'stage', label: 'Stages', options: stages, value: (r) => r.stage },
    { key: 'job', label: 'Jobs', options: jobOptions, value: (r) => r.job },
  ]

  const advance = (app: Application, targetStage: string) => {
    const next = targetStage as ApplicationStage
    setRows((prev) => prev.map((r) => (r.id === app.id ? { ...r, stage: next } : r)))
    if (selectedCandidate?.id === app.id) {
      setSelectedCandidate({ ...selectedCandidate, stage: next })
    }
    toast.success(`${app.candidate} moved to ${next}`)
  }

  const moveRelative = (app: Application, direction: 1 | -1) => {
    const currentIndex = pipelineSteps.indexOf(app.stage)
    if (currentIndex === -1) return
    const next = pipelineSteps[currentIndex + direction]
    if (!next) return
    advance(app, next)
  }

  const rejectCandidate = (app: Application) => {
    advance(app, 'Rejected')
    toast.error(`${app.candidate} has been rejected`)
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCandidate.name.trim() || !newCandidate.email.trim()) {
      toast.error('Please provide candidate name and email')
      return
    }

    const created: Application = {
      id: `app-custom-${Date.now()}`,
      candidate: newCandidate.name.trim(),
      email: newCandidate.email.trim(),
      job: newCandidate.job,
      stage: newCandidate.stage,
      experience: newCandidate.experience,
      location: newCandidate.location,
      rating: newCandidate.rating,
      appliedOn: new Date().toISOString().split('T')[0]!,
    }

    setRows((prev) => [created, ...prev])
    setIsAddOpen(false)
    toast.success(`${created.candidate} added to applications`)
  }

  const columns: Column<Application>[] = [
    {
      key: 'candidate',
      header: 'Candidate',
      cell: (a) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {initials(a.candidate)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
              {a.candidate}
            </p>
            <p className="truncate text-xs text-muted-foreground">{a.email}</p>
          </div>
        </div>
      ),
      sortValue: (a) => a.candidate,
    },
    {
      key: 'job',
      header: 'Job Opening',
      cell: (a) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-medium text-foreground truncate max-w-[200px]">{a.job}</span>
        </div>
      ),
      sortValue: (a) => a.job,
    },
    {
      key: 'experience',
      header: 'Experience',
      cell: (a) => (
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {a.experience}
        </span>
      ),
      sortValue: (a) => parseInt(a.experience),
    },
    {
      key: 'location',
      header: 'Location',
      cell: (a) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{a.location}</span>
        </div>
      ),
      sortValue: (a) => a.location,
    },
    {
      key: 'rating',
      header: 'Rating',
      cell: (a) => (
        <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-600 dark:text-amber-400">
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            {a.rating}.0
          </span>
        </div>
      ),
      sortValue: (a) => a.rating,
    },
    {
      key: 'appliedOn',
      header: 'Applied On',
      cell: (a) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{formatDate(a.appliedOn, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      ),
      sortValue: (a) => a.appliedOn,
    },
    {
      key: 'stage',
      header: 'Stage',
      cell: (a) => {
        const style = stageStyles[a.stage]
        return (
          <Badge variant="outline" className={`h-6 px-2 text-xs font-medium inline-flex items-center gap-1.5 ${style?.badge || ''}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${style?.dot || 'bg-slate-400'}`} />
            {a.stage}
          </Badge>
        )
      },
      sortValue: (a) => a.stage,
    },
  ]

  // Metrics
  const totalApplicants = rows.length
  const inPipeline = rows.filter((r) => r.stage === 'Screening' || r.stage === 'Interview').length
  const offersCount = rows.filter((r) => r.stage === 'Offer').length
  const hiredCount = rows.filter((r) => r.stage === 'Hired').length

  return (
    <div className="w-full space-y-6">
      {/* Page Header with Action Buttons */}
      <PageHeader
        title="Applications"
        description="Review candidates and manage their pipeline stage."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/recruitment/pipeline">
                <Kanban className="mr-1.5 h-4 w-4" />
                Pipeline Board
              </Link>
            </Button>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Candidate
            </Button>
          </div>
        }
      />

      <DemoNotice compact />

      {/* Top Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Applicants"
          value={totalApplicants}
          icon={Users}
          tone="primary"
          trend={18}
          description="across all active job openings"
        />
        <StatCard
          title="In Pipeline"
          value={inPipeline}
          icon={Clock3}
          tone="violet"
          description="Screening & technical interviews"
        />
        <StatCard
          title="Offers Extended"
          value={offersCount}
          icon={BriefcaseBusiness}
          tone="sky"
          description="Pending candidate decisions"
        />
        <StatCard
          title="Hired Candidates"
          value={hiredCount}
          icon={CheckCircle2}
          tone="emerald"
          trend={12}
          description="Target: 15 this quarter"
        />
      </div>

      {/* Applications Data Table */}
      <DataTable
        data={rows}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search candidates by name, job, or email..."
        onRowClick={(candidate) => setSelectedCandidate(candidate)}
        toolbar={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting candidates to CSV (demo)')}
            className="h-9 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
        rowActions={(app) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* View Profile Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setSelectedCandidate(app)}
              title="View profile"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Email Draft Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => toast.info(`Email drafted for ${app.candidate} (demo)`)}
              title="Draft email"
            >
              <Mail className="h-4 w-4" />
            </Button>

            {/* Stage Quick Advance / More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSelectedCandidate(app)}>
                  <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                  View Full Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Email drafted for ${app.candidate} (demo)`)}>
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {stages.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    disabled={app.stage === s}
                    onClick={() => advance(app, s)}
                  >
                    Move to {s}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => rejectCandidate(app)}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Candidate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      />

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-start justify-between pr-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                      {initials(selectedCandidate.candidate)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl font-bold">
                      {selectedCandidate.candidate}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      {selectedCandidate.job} · {selectedCandidate.email}
                    </DialogDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs px-2.5 py-1 ${stageStyles[selectedCandidate.stage]?.badge}`}
                >
                  {selectedCandidate.stage}
                </Badge>
              </div>
            </DialogHeader>

            {/* Pipeline Stage Progression Stepper */}
            <div className="my-2 rounded-xl border bg-slate-50 dark:bg-slate-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Pipeline Progression
              </p>
              <div className="grid grid-cols-5 gap-2">
                {pipelineSteps.map((step, idx) => {
                  const currentIdx = pipelineSteps.indexOf(selectedCandidate.stage)
                  const isCurrent = selectedCandidate.stage === step
                  const isPast = currentIdx > idx

                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => advance(selectedCandidate, step)}
                      className={`flex flex-col items-center justify-center rounded-lg p-2 text-center transition-all ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary ring-offset-2'
                          : isPast
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="text-[10px] font-medium opacity-75">Step {idx + 1}</span>
                      <span className="text-xs font-semibold">{step}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1 rounded-lg border p-3">
                <span className="text-xs font-medium text-muted-foreground">Experience</span>
                <p className="font-semibold">{selectedCandidate.experience}</p>
              </div>
              <div className="space-y-1 rounded-lg border p-3">
                <span className="text-xs font-medium text-muted-foreground">Location</span>
                <p className="font-semibold">{selectedCandidate.location}</p>
              </div>
              <div className="space-y-1 rounded-lg border p-3">
                <span className="text-xs font-medium text-muted-foreground">Applied Date</span>
                <p className="font-semibold">
                  {formatDate(selectedCandidate.appliedOn, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="space-y-1 rounded-lg border p-3">
                <span className="text-xs font-medium text-muted-foreground">Candidate Rating</span>
                <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  {selectedCandidate.rating}.0 / 5.0
                </div>
              </div>
            </div>

            {/* Recruiter Evaluation Summary */}
            <div className="rounded-lg border p-3 space-y-1.5 bg-muted/20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Recruitment Notes & Assessment
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Demonstrated strong domain competence in previous evaluations. Good communication, positive team cultural alignment, and matched expected compensation bands.
              </p>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center mt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => rejectCandidate(selectedCandidate)}
                className="w-full sm:w-auto"
              >
                <XCircle className="mr-1.5 h-4 w-4" />
                Reject Candidate
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button variant="outline" size="sm" onClick={() => setSelectedCandidate(null)}>
                  Close
                </Button>
                {pipelineSteps.indexOf(selectedCandidate.stage) < pipelineSteps.length - 1 && (
                  <Button
                    size="sm"
                    onClick={() => moveRelative(selectedCandidate, 1)}
                    className="w-full sm:w-auto"
                  >
                    Advance to Next Stage
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Candidate Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
            <DialogDescription>
              Enter the candidate details to register an application.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="appCandidateName">Candidate Full Name *</Label>
              <Input
                id="appCandidateName"
                placeholder="e.g. Alex Henderson"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="appCandidateEmail">Email Address *</Label>
              <Input
                id="appCandidateEmail"
                type="email"
                placeholder="e.g. alex.henderson@example.com"
                value={newCandidate.email}
                onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="appJobOpening">Job Position</Label>
                <Select
                  value={newCandidate.job}
                  onValueChange={(val) => setNewCandidate({ ...newCandidate, job: val })}
                >
                  <SelectTrigger id="appJobOpening">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jobOptions.map((job) => (
                      <SelectItem key={job} value={job}>
                        {job}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="appTargetStage">Initial Stage</Label>
                <Select
                  value={newCandidate.stage}
                  onValueChange={(val) =>
                    setNewCandidate({ ...newCandidate, stage: val as ApplicationStage })
                  }
                >
                  <SelectTrigger id="appTargetStage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="appExperience">Experience</Label>
                <Select
                  value={newCandidate.experience}
                  onValueChange={(val) => setNewCandidate({ ...newCandidate, experience: val })}
                >
                  <SelectTrigger id="appExperience">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 year">1 year</SelectItem>
                    <SelectItem value="2 years">2 years</SelectItem>
                    <SelectItem value="3 years">3 years</SelectItem>
                    <SelectItem value="5 years">5 years</SelectItem>
                    <SelectItem value="7+ years">7+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="appLocation">Location</Label>
                <Select
                  value={newCandidate.location}
                  onValueChange={(val) => setNewCandidate({ ...newCandidate, location: val })}
                >
                  <SelectTrigger id="appLocation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New York">New York</SelectItem>
                    <SelectItem value="London">London</SelectItem>
                    <SelectItem value="Bengaluru">Bengaluru</SelectItem>
                    <SelectItem value="Singapore">Singapore</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
