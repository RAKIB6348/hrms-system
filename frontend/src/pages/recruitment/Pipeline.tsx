import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  Plus,
  Search,
  Eye,
  Star,
  Briefcase,
  MapPin,
  Calendar,
  Clock3,
  Users,
  CheckCircle2,
  BriefcaseBusiness,
  Mail,
  RotateCcw,
  Sparkles,
  ChevronRight,
  UserCheck,
  XCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent } from '@/components/ui/card'
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
import { initials, formatDate } from '@/lib/utils'
import type { Application, ApplicationStage } from '@/types'

const columns: ApplicationStage[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired']

const stageStyles: Record<
  ApplicationStage,
  {
    dot: string
    badge: string
    border: string
    hoverBorder: string
    bgTint: string
  }
> = {
  Applied: {
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    border: 'border-t-indigo-500',
    hoverBorder: 'hover:border-indigo-400',
    bgTint: 'bg-indigo-50/40 dark:bg-indigo-950/20',
  },
  Screening: {
    dot: 'bg-violet-500',
    badge: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    border: 'border-t-violet-500',
    hoverBorder: 'hover:border-violet-400',
    bgTint: 'bg-violet-50/40 dark:bg-violet-950/20',
  },
  Interview: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    border: 'border-t-amber-500',
    hoverBorder: 'hover:border-amber-400',
    bgTint: 'bg-amber-50/40 dark:bg-amber-950/20',
  },
  Offer: {
    dot: 'bg-sky-500',
    badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800',
    border: 'border-t-sky-500',
    hoverBorder: 'hover:border-sky-400',
    bgTint: 'bg-sky-50/40 dark:bg-sky-950/20',
  },
  Hired: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    border: 'border-t-emerald-500',
    hoverBorder: 'hover:border-emerald-400',
    bgTint: 'bg-emerald-50/40 dark:bg-emerald-950/20',
  },
  Rejected: {
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    border: 'border-t-rose-500',
    hoverBorder: 'hover:border-rose-400',
    bgTint: 'bg-rose-50/40 dark:bg-rose-950/20',
  },
}

export default function Pipeline() {
  const [candidates, setCandidates] = useState<Application[]>(() =>
    applications.filter((a) => a.stage !== 'Rejected')
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJob, setSelectedJob] = useState('all')
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null)

  // Add Candidate modal state
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

  // Unique job titles for filtering
  const jobOptions = useMemo(() => {
    return Array.from(new Set(jobOpenings.map((j) => j.title)))
  }, [])

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        searchQuery === '' ||
        c.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.job.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesJob = selectedJob === 'all' || c.job === selectedJob

      return matchesSearch && matchesJob
    })
  }, [candidates, searchQuery, selectedJob])

  // Move candidate relative stage
  const move = (app: Application, direction: 1 | -1) => {
    const currentIndex = columns.indexOf(app.stage)
    const next = columns[currentIndex + direction]
    if (!next) {
      toast.info(direction === 1 ? 'Already at final stage' : 'Already at initial stage')
      return
    }
    setCandidates((prev) =>
      prev.map((r) => (r.id === app.id ? { ...r, stage: next } : r))
    )
    if (selectedCandidate?.id === app.id) {
      setSelectedCandidate({ ...selectedCandidate, stage: next })
    }
    toast.success(`${app.candidate} moved to ${next}`)
  }

  // Move candidate to specific stage
  const moveToStage = (app: Application, targetStage: ApplicationStage) => {
    if (app.stage === targetStage) return
    setCandidates((prev) =>
      prev.map((r) => (r.id === app.id ? { ...r, stage: targetStage } : r))
    )
    if (selectedCandidate?.id === app.id) {
      setSelectedCandidate({ ...selectedCandidate, stage: targetStage })
    }
    toast.success(`${app.candidate} moved to ${targetStage}`)
  }

  // Reject candidate
  const rejectCandidate = (app: Application) => {
    setCandidates((prev) => prev.filter((r) => r.id !== app.id))
    if (selectedCandidate?.id === app.id) {
      setSelectedCandidate(null)
    }
    toast.error(`${app.candidate} marked as Rejected and removed from active pipeline`)
  }

  // Open Add Candidate Dialog with pre-selected stage
  const openAddModal = (stage: ApplicationStage = 'Applied') => {
    setNewCandidate({
      name: '',
      email: '',
      job: selectedJob !== 'all' ? selectedJob : jobOpenings[0]?.title || 'Senior Frontend Engineer',
      stage,
      experience: '3 years',
      location: 'New York',
      rating: 4,
    })
    setIsAddOpen(true)
  }

  // Handle Add Candidate submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCandidate.name.trim() || !newCandidate.email.trim()) {
      toast.error('Please enter candidate name and email')
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

    setCandidates((prev) => [created, ...prev])
    setIsAddOpen(false)
    toast.success(`${created.candidate} added to ${created.stage}`)
  }

  // Metric counts
  const totalCandidates = candidates.length
  const screeningAndInterview = candidates.filter(
    (c) => c.stage === 'Screening' || c.stage === 'Interview'
  ).length
  const offersExtended = candidates.filter((c) => c.stage === 'Offer').length
  const hiredCount = candidates.filter((c) => c.stage === 'Hired').length

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Recruitment Pipeline"
        description="A visual kanban board of candidates across hiring stages."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/recruitment/applications">
                <Users className="mr-1.5 h-4 w-4" />
                Applications Table
              </Link>
            </Button>
            <Button onClick={() => openAddModal('Applied')}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Candidate
            </Button>
          </div>
        }
      />

      <DemoNotice compact />

      {/* Top KPI Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Candidates"
          value={totalCandidates}
          icon={Users}
          tone="primary"
          trend={14}
          description="across all open positions"
        />
        <StatCard
          title="In Review & Interview"
          value={screeningAndInterview}
          icon={Clock3}
          tone="violet"
          description="Screening & technical evaluations"
        />
        <StatCard
          title="Offers Extended"
          value={offersExtended}
          icon={BriefcaseBusiness}
          tone="sky"
          description="Pending candidate response"
        />
        <StatCard
          title="Hired This Period"
          value={hiredCount}
          icon={CheckCircle2}
          tone="emerald"
          trend={8}
          description="Successfully joined team"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search candidates by name, job, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>

              {/* Job filter dropdown */}
              <div className="w-full sm:w-64">
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="All Positions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    {jobOptions.map((job) => (
                      <SelectItem key={job} value={job}>
                        {job}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset filter button */}
              {(searchQuery || selectedJob !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedJob('all')
                  }}
                  className="h-9 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Total count badge */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Showing <strong className="font-semibold text-foreground">{filteredCandidates.length}</strong> of{' '}
                <strong className="font-semibold text-foreground">{candidates.length}</strong> candidates
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board Container - Full Width Flexible Columns */}
      <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
        <div className="flex min-w-full gap-4">
          {columns.map((stage) => {
            const stageRows = filteredCandidates.filter((r) => r.stage === stage)
            const style = stageStyles[stage]

            return (
              <div
                key={stage}
                className="flex-1 min-w-[280px] flex flex-col rounded-xl border bg-slate-50/50 dark:bg-slate-900/40 p-3 shadow-sm transition-colors"
              >
                {/* Stage Header */}
                <div className="mb-3 flex items-center justify-between border-b pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                    <span className="text-sm font-semibold text-foreground">{stage}</span>
                    <Badge variant="outline" className={`h-5 px-1.5 text-[11px] font-medium ${style.badge}`}>
                      {stageRows.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-background"
                    onClick={() => openAddModal(stage)}
                    title={`Add candidate to ${stage}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Candidate Cards Column Content */}
                <div className="flex flex-1 flex-col space-y-3">
                  {stageRows.length === 0 ? (
                    <div className="flex flex-1 min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground bg-background/50">
                      <Users className="mb-2 h-6 w-6 opacity-30" />
                      <p className="font-medium">No candidates</p>
                      <p className="mt-0.5 text-[11px] opacity-75">
                        {searchQuery || selectedJob !== 'all'
                          ? 'Try adjusting your filters'
                          : `No applicants currently in ${stage}`}
                      </p>
                    </div>
                  ) : (
                    stageRows.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedCandidate(app)}
                        className={`group relative rounded-xl border bg-card p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${style.hoverBorder} cursor-pointer`}
                      >
                        {/* Top: Avatar, Name, Job, and Menu */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {initials(app.candidate)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <h4 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {app.candidate}
                              </h4>
                              <p className="truncate text-xs text-muted-foreground">{app.job}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => setSelectedCandidate(app)}>
                                  <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toast.info(`Email drafted for ${app.candidate} (demo)`)}
                                >
                                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {columns.map((st) => (
                                  <DropdownMenuItem
                                    key={st}
                                    disabled={app.stage === st}
                                    onClick={() => moveToStage(app, st)}
                                  >
                                    Move to {st}
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
                        </div>

                        {/* Mid Meta: Experience, Location, Rating */}
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            <Briefcase className="h-3 w-3" />
                            {app.experience}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {app.location}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            {app.rating}.0
                          </span>
                        </div>

                        {/* Footer Meta & Stage Advance Arrows */}
                        <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Calendar className="h-3 w-3" />
                            {formatDate(app.appliedOn, { month: 'short', day: 'numeric' })}
                          </span>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {columns.indexOf(stage) > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted"
                                onClick={() => move(app, -1)}
                                title="Move to previous stage"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {columns.indexOf(stage) < columns.length - 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted"
                                onClick={() => move(app, 1)}
                                title="Move to next stage"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

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
                {columns.map((step, idx) => {
                  const currentIdx = columns.indexOf(selectedCandidate.stage)
                  const isCurrent = selectedCandidate.stage === step
                  const isPast = currentIdx > idx

                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => moveToStage(selectedCandidate, step)}
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
                {columns.indexOf(selectedCandidate.stage) < columns.length - 1 && (
                  <Button
                    size="sm"
                    onClick={() => move(selectedCandidate, 1)}
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
              Enter the candidate details to introduce them to the recruitment pipeline.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="candidateName">Candidate Full Name *</Label>
              <Input
                id="candidateName"
                placeholder="e.g. Alex Henderson"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="candidateEmail">Email Address *</Label>
              <Input
                id="candidateEmail"
                type="email"
                placeholder="e.g. alex.henderson@example.com"
                value={newCandidate.email}
                onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="jobOpening">Job Position</Label>
                <Select
                  value={newCandidate.job}
                  onValueChange={(val) => setNewCandidate({ ...newCandidate, job: val })}
                >
                  <SelectTrigger id="jobOpening">
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
                <Label htmlFor="targetStage">Initial Stage</Label>
                <Select
                  value={newCandidate.stage}
                  onValueChange={(val) =>
                    setNewCandidate({ ...newCandidate, stage: val as ApplicationStage })
                  }
                >
                  <SelectTrigger id="targetStage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((st) => (
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
                <Label htmlFor="experience">Experience</Label>
                <Select
                  value={newCandidate.experience}
                  onValueChange={(val) => setNewCandidate({ ...newCandidate, experience: val })}
                >
                  <SelectTrigger id="experience">
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
                <Label htmlFor="location">Location</Label>
                <Select
                  value={newCandidate.location}
                  onValueChange={(val) => setNewCandidate({ ...newCandidate, location: val })}
                >
                  <SelectTrigger id="location">
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
                Add to Pipeline
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
