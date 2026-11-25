import { useMemo, useState, type DragEvent } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  Filter,
  Layers,
  LayoutGrid,
  List,
  Mail,
  MapPin,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Star,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { applications, jobOpenings } from '@/mocks/data'
import { cn, formatDate, initials } from '@/lib/utils'
import type { Application, ApplicationStage } from '@/types'

const DEFAULT_PIPELINE_STAGES: ApplicationStage[] = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
]

type GroupByOption = 'stage' | 'job' | 'location'
type ViewMode = 'kanban' | 'list'
type ColumnSort = 'default' | 'rating' | 'date'

const stageAccent: Record<
  ApplicationStage,
  { bar: string; dot: string; badge: string }
> = {
  Applied: {
    bar: 'bg-indigo-500',
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  },
  Screening: {
    bar: 'bg-violet-500',
    dot: 'bg-violet-500',
    badge: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
  },
  Interview: {
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  Offer: {
    bar: 'bg-sky-500',
    dot: 'bg-sky-500',
    badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  },
  Hired: {
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  Rejected: {
    bar: 'bg-rose-500',
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  },
}

function InteractiveStarRating({
  rating,
  onRate,
  size = 'sm',
}: {
  rating: number
  onRate: (value: number) => void
  size?: 'sm' | 'md'
}) {
  const iconCls = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <div
      className="inline-flex items-center gap-0.5"
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label={`Rating ${rating} of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating
        return (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            title={`Rate ${star} / 5`}
            className="rounded-xs p-0.5 transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={cn(
                iconCls,
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 dark:text-slate-600 hover:text-amber-300',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export default function Pipeline() {
  const [candidates, setCandidates] = useState<Application[]>(() =>
    applications.filter((a) => a.stage !== 'Rejected'),
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJob, setSelectedJob] = useState('all')
  const [minRating, setMinRating] = useState('all')
  const [groupBy, setGroupBy] = useState<GroupByOption>('stage')
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({})
  const [columnSorts, setColumnSorts] = useState<Record<string, ColumnSort>>({})

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

  // Configured stages derived dynamically from DEFAULT_PIPELINE_STAGES + any active candidate stages
  const configuredStages = useMemo<ApplicationStage[]>(() => {
    const extra = candidates
      .map((c) => c.stage)
      .filter((st) => st !== 'Rejected' && !DEFAULT_PIPELINE_STAGES.includes(st))
    return Array.from(new Set([...DEFAULT_PIPELINE_STAGES, ...extra]))
  }, [candidates])

  const jobOptions = useMemo(
    () => Array.from(new Set(jobOpenings.map((j) => j.title))),
    [],
  )

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return candidates.filter((c) => {
      const matchesSearch =
        !q ||
        c.candidate.toLowerCase().includes(q) ||
        c.job.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      const matchesJob = selectedJob === 'all' || c.job === selectedJob
      const matchesRating = minRating === 'all' || c.rating >= Number(minRating)
      return matchesSearch && matchesJob && matchesRating
    })
  }, [candidates, searchQuery, selectedJob, minRating])

  const boardColumns = useMemo(() => {
    if (groupBy === 'stage') {
      return configuredStages.map((stage) => ({
        key: stage,
        label: stage,
        stage,
      }))
    }
    if (groupBy === 'job') {
      const jobs = Array.from(
        new Set([...jobOptions, ...filteredCandidates.map((c) => c.job)]),
      )
      return jobs.map((job) => ({ key: job, label: job, stage: null as ApplicationStage | null }))
    }
    const locs = Array.from(new Set(filteredCandidates.map((c) => c.location))).sort()
    return locs.map((loc) => ({ key: loc, label: loc, stage: null as ApplicationStage | null }))
  }, [groupBy, configuredStages, jobOptions, filteredCandidates])

  const updateRating = (app: Application, nextRating: number) => {
    setCandidates((prev) =>
      prev.map((r) => (r.id === app.id ? { ...r, rating: nextRating } : r)),
    )
    if (selectedCandidate?.id === app.id) {
      setSelectedCandidate({ ...selectedCandidate, rating: nextRating })
    }
    toast.success(`Updated ${app.candidate}'s rating to ${nextRating}/5`)
  }

  const move = (app: Application, direction: 1 | -1) => {
    const currentIndex = configuredStages.indexOf(app.stage)
    const next = configuredStages[currentIndex + direction]
    if (!next) {
      toast.info(direction === 1 ? 'Already at final stage' : 'Already at initial stage')
      return
    }
    moveToStage(app, next)
  }

  const moveToStage = (app: Application, targetStage: ApplicationStage) => {
    if (app.stage === targetStage) return
    setCandidates((prev) =>
      prev.map((r) => (r.id === app.id ? { ...r, stage: targetStage } : r)),
    )
    if (selectedCandidate?.id === app.id) {
      setSelectedCandidate({ ...selectedCandidate, stage: targetStage })
    }
    toast.success(`${app.candidate} moved to ${targetStage}`)
  }

  const rejectCandidate = (app: Application) => {
    setCandidates((prev) => prev.filter((r) => r.id !== app.id))
    if (selectedCandidate?.id === app.id) {
      setSelectedCandidate(null)
    }
    toast.error(`${app.candidate} marked as Rejected and removed from active pipeline`)
  }

  const openAddModal = (stage: ApplicationStage = configuredStages[0] ?? 'Applied') => {
    setNewCandidate({
      name: '',
      email: '',
      job:
        selectedJob !== 'all'
          ? selectedJob
          : jobOpenings[0]?.title || 'Senior Frontend Engineer',
      stage,
      experience: '3 years',
      location: 'New York',
      rating: 4,
    })
    setIsAddOpen(true)
  }

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

  // Drag and Drop Handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, appId: string) => {
    setDraggedId(appId)
    e.dataTransfer.setData('text/plain', appId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>, colKey: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverColumn !== colKey) setDragOverColumn(colKey)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, colKey: string, targetStage: ApplicationStage | null) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') || draggedId
    setDragOverColumn(null)
    setDraggedId(null)
    if (!id) return
    const app = candidates.find((c) => c.id === id)
    if (!app) return

    if (groupBy === 'stage' && targetStage) {
      moveToStage(app, targetStage)
    } else if (groupBy === 'job' && app.job !== colKey) {
      setCandidates((prev) => prev.map((r) => (r.id === app.id ? { ...r, job: colKey } : r)))
      toast.success(`${app.candidate} reassigned to ${colKey}`)
    } else if (groupBy === 'location' && app.location !== colKey) {
      setCandidates((prev) => prev.map((r) => (r.id === app.id ? { ...r, location: colKey } : r)))
      toast.success(`${app.candidate} moved to ${colKey}`)
    }
  }

  // Compact KPI metrics
  const totalCandidates = candidates.length
  const screeningAndInterview = candidates.filter(
    (c) => c.stage === 'Screening' || c.stage === 'Interview',
  ).length
  const offersExtended = candidates.filter((c) => c.stage === 'Offer').length
  const hiredCount = candidates.filter((c) => c.stage === 'Hired').length
  const hasFilters = Boolean(searchQuery || selectedJob !== 'all' || minRating !== 'all')

  return (
    <div className="w-full space-y-3">
      {/* 1. Odoo-inspired Compact Control Panel */}
      <div className="rounded-lg border border-border/80 bg-card px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: New Candidate + Title */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              onClick={() => openAddModal(configuredStages[0] ?? 'Applied')}
              className="h-8 rounded-md px-3 text-xs font-semibold shadow-2xs"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Candidate
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-foreground">
                Recruitment Pipeline
              </h1>
              <span className="text-xs text-muted-foreground">
                ({filteredCandidates.length}/{candidates.length})
              </span>
            </div>
          </div>

          {/* Right: Search, Filters, Group By, View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 rounded-md pl-8 text-xs"
              />
            </div>

            {/* Filters Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-8 rounded-md px-2.5 text-xs gap-1.5',
                    (selectedJob !== 'all' || minRating !== 'all') &&
                      'border-primary/50 bg-primary/5 text-primary',
                  )}
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 p-2 space-y-2">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground px-1">
                    Job Position
                  </span>
                  <Select value={selectedJob} onValueChange={setSelectedJob}>
                    <SelectTrigger className="h-8 text-xs">
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
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground px-1">
                    Minimum Rating
                  </span>
                  <Select value={minRating} onValueChange={setMinRating}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Any Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Rating</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Group By Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 rounded-md px-2.5 text-xs gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  Group By:{' '}
                  <span className="font-semibold capitalize">{groupBy}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setGroupBy('stage')}>
                  Stage {groupBy === 'stage' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy('job')}>
                  Job Position {groupBy === 'job' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy('location')}>
                  Location {groupBy === 'location' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedJob('all')
                  setMinRating('all')
                }}
                className="h-8 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset
              </Button>
            )}

            {/* Kanban / List Switcher */}
            <div className="inline-flex items-center rounded-md border bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                title="Kanban view"
                className={cn(
                  'inline-flex items-center gap-1 rounded-xs px-2 py-1 text-xs font-medium transition-colors',
                  viewMode === 'kanban'
                    ? 'bg-background text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="List view"
                className={cn(
                  'inline-flex items-center gap-1 rounded-xs px-2 py-1 text-xs font-medium transition-colors',
                  viewMode === 'list'
                    ? 'bg-background text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Compact Recruitment KPI Summary Strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="flex items-center justify-between rounded-md border border-border/80 bg-card px-3.5 py-2">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Active Candidates</p>
            <p className="text-lg font-bold leading-tight text-foreground">{totalCandidates}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border/80 bg-card px-3.5 py-2">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Review & Interview</p>
            <p className="text-lg font-bold leading-tight text-foreground">{screeningAndInterview}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock3 className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border/80 bg-card px-3.5 py-2">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Offers Extended</p>
            <p className="text-lg font-bold leading-tight text-foreground">{offersExtended}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border/80 bg-card px-3.5 py-2">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Hired</p>
            <p className="text-lg font-bold leading-tight text-foreground">{hiredCount}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* 3. Kanban Board or List View */}
      {viewMode === 'kanban' ? (
        <div className="w-full overflow-x-auto pb-3 scrollbar-thin">
          <div className="flex min-w-full items-start gap-3">
            {boardColumns.map((col) => {
              const rawRows = filteredCandidates.filter((c) => {
                if (groupBy === 'stage') return c.stage === col.key
                if (groupBy === 'job') return c.job === col.key
                return c.location === col.key
              })

              const sortMode = columnSorts[col.key] ?? 'default'
              const stageRows = [...rawRows].sort((a, b) => {
                if (sortMode === 'rating') return b.rating - a.rating
                if (sortMode === 'date') return b.appliedOn.localeCompare(a.appliedOn)
                return 0
              })

              const isCollapsed = Boolean(collapsedColumns[col.key])
              const isDropTarget = dragOverColumn === col.key
              const pct =
                filteredCandidates.length > 0
                  ? Math.round((stageRows.length / filteredCandidates.length) * 100)
                  : 0
              const accent = col.stage
                ? stageAccent[col.stage]
                : { bar: 'bg-primary', dot: 'bg-primary', badge: '' }

              if (isCollapsed) {
                return (
                  <div
                    key={col.key}
                    onDragOver={(e) => handleDragOver(e, col.key)}
                    onDragLeave={() => setDragOverColumn(null)}
                    onDrop={(e) => handleDrop(e, col.key, col.stage)}
                    onClick={() =>
                      setCollapsedColumns((prev) => ({ ...prev, [col.key]: false }))
                    }
                    title={`Expand ${col.label}`}
                    className={cn(
                      'flex w-11 shrink-0 cursor-pointer flex-col items-center gap-3 rounded-md border border-border/70 bg-muted/30 py-3 transition-colors hover:bg-muted/60',
                      isDropTarget && 'ring-1 ring-primary bg-primary/5',
                    )}
                  >
                    <span className={cn('h-2 w-2 rounded-full', accent.dot)} />
                    <span className="text-xs font-semibold text-muted-foreground [writing-mode:vertical-rl] rotate-180">
                      {col.label} ({stageRows.length})
                    </span>
                  </div>
                )
              }

              return (
                <div
                  key={col.key}
                  onDragOver={(e) => handleDragOver(e, col.key)}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(e) => handleDrop(e, col.key, col.stage)}
                  className={cn(
                    'flex min-w-[270px] flex-1 flex-col rounded-md bg-muted/35 dark:bg-slate-900/40 p-2 transition-colors',
                    isDropTarget && 'ring-1 ring-primary/60 bg-primary/5',
                  )}
                >
                  {/* Column Header */}
                  <div className="px-1 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={cn('h-2 w-2 shrink-0 rounded-full', accent.dot)} />
                        <h3 className="truncate text-xs font-bold uppercase tracking-wide text-foreground">
                          {col.label}
                        </h3>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {stageRows.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-sm text-muted-foreground hover:text-foreground"
                          onClick={() => openAddModal(col.stage ?? 'Applied')}
                          title={`Add candidate to ${col.label}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-sm text-muted-foreground hover:text-foreground"
                              title={`${col.label} settings`}
                            >
                              <Settings2 className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 text-xs">
                            <DropdownMenuItem
                              onClick={() => openAddModal(col.stage ?? 'Applied')}
                            >
                              <Plus className="mr-2 h-3.5 w-3.5" />
                              Add Candidate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                setColumnSorts((prev) => ({ ...prev, [col.key]: 'rating' }))
                              }
                            >
                              Sort by Rating {sortMode === 'rating' && '✓'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setColumnSorts((prev) => ({ ...prev, [col.key]: 'date' }))
                              }
                            >
                              Sort by Date {sortMode === 'date' && '✓'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setColumnSorts((prev) => ({ ...prev, [col.key]: 'default' }))
                              }
                            >
                              Default Order {sortMode === 'default' && '✓'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                setCollapsedColumns((prev) => ({ ...prev, [col.key]: true }))
                              }
                            >
                              Fold Column
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Stage Progress Bar */}
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border/70">
                      <div
                        className={cn('h-full transition-all duration-300', accent.bar)}
                        style={{ width: `${Math.max(pct, stageRows.length > 0 ? 12 : 0)}%` }}
                      />
                    </div>
                  </div>

                  {/* Candidate Cards */}
                  <div className="flex flex-1 flex-col gap-2 min-h-[140px]">
                    {stageRows.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed border-border/70 bg-background/40 p-4 text-center text-xs text-muted-foreground">
                        <p className="font-medium">Empty stage</p>
                        <p className="mt-0.5 text-[11px] opacity-75">
                          Drag a candidate here or click +
                        </p>
                      </div>
                    ) : (
                      stageRows.map((app) => (
                        <div
                          key={app.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          onDragEnd={() => {
                            setDraggedId(null)
                            setDragOverColumn(null)
                          }}
                          onClick={() => setSelectedCandidate(app)}
                          className={cn(
                            'group relative cursor-pointer rounded-md border border-border/80 bg-card p-3 shadow-2xs transition-all hover:border-primary/40 hover:shadow-sm',
                            draggedId === app.id && 'opacity-50',
                          )}
                        >
                          {/* Top Row: Avatar, Name, Position, Menu */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <Avatar className="h-7 w-7 shrink-0 border border-border/60">
                                <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                                  {initials(app.candidate)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                                  {app.candidate}
                                </h4>
                                <p className="truncate text-xs text-muted-foreground mt-0.5">
                                  {app.job}
                                </p>
                              </div>
                            </div>

                            <div
                              className="shrink-0 -mr-1 -mt-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-sm text-muted-foreground hover:text-foreground"
                                    aria-label={`Actions for ${app.candidate}`}
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem onClick={() => setSelectedCandidate(app)}>
                                    <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toast.info(`Email drafted for ${app.candidate} (demo)`)
                                    }
                                  >
                                    <Mail className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {configuredStages.map((st) => (
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
                                    <XCircle className="mr-2 h-3.5 w-3.5" />
                                    Reject Candidate
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Compact Meta Row */}
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {app.experience}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {app.location}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(app.appliedOn, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          {/* Footer: Interactive Stars + Real Stage/Interview Indicator */}
                          <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2">
                            <InteractiveStarRating
                              rating={app.rating}
                              onRate={(val) => updateRating(app, val)}
                            />

                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              {app.stage === 'Interview' && (
                                <span
                                  className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400"
                                  title="In Interview stage"
                                >
                                  <CalendarCheck2 className="h-3.5 w-3.5" />
                                  Interview
                                </span>
                              )}
                              {app.stage === 'Offer' && (
                                <span
                                  className="inline-flex items-center gap-1 font-medium text-sky-600 dark:text-sky-400"
                                  title="Offer stage"
                                >
                                  <Clock3 className="h-3.5 w-3.5" />
                                  Offer
                                </span>
                              )}
                              {app.stage === 'Hired' && (
                                <span
                                  className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400"
                                  title="Hired"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Hired
                                </span>
                              )}
                              {groupBy !== 'stage' && (
                                <span className="text-[11px] font-medium text-muted-foreground">
                                  {app.stage}
                                </span>
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
      ) : (
        /* List View */
        <div className="overflow-x-auto rounded-md border border-border/80 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Candidate</TableHead>
                <TableHead>Applied Position</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-xs text-muted-foreground">
                    No candidates match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((app) => (
                  <TableRow
                    key={app.id}
                    onClick={() => setSelectedCandidate(app)}
                    className="cursor-pointer hover:bg-muted/30"
                  >
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 border border-border/60">
                          <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                            {initials(app.candidate)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{app.candidate}</p>
                          <p className="text-[11px] text-muted-foreground">{app.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-foreground">
                      {app.job}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={cn('text-[11px] font-medium', stageAccent[app.stage]?.badge)}
                      >
                        {app.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {app.experience}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {app.location}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <InteractiveStarRating
                        rating={app.rating}
                        onRate={(val) => updateRating(app, val)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(app.appliedOn, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell
                      className="whitespace-nowrap text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1">
                        {configuredStages.indexOf(app.stage) > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => move(app, -1)}
                            title="Move to previous stage"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {configuredStages.indexOf(app.stage) < configuredStages.length - 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => move(app, 1)}
                            title="Move to next stage"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <Dialog
          open={!!selectedCandidate}
          onOpenChange={(open) => !open && setSelectedCandidate(null)}
        >
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
                  className={cn('text-xs px-2.5 py-1', stageAccent[selectedCandidate.stage]?.badge)}
                >
                  {selectedCandidate.stage}
                </Badge>
              </div>
            </DialogHeader>

            {/* Pipeline Stage Progression Stepper */}
            <div className="my-2 rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Pipeline Progression
              </p>
              <div className="grid grid-cols-5 gap-2">
                {configuredStages.map((step, idx) => {
                  const currentIdx = configuredStages.indexOf(selectedCandidate.stage)
                  const isCurrent = selectedCandidate.stage === step
                  const isPast = currentIdx > idx

                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => moveToStage(selectedCandidate, step)}
                      className={cn(
                        'flex flex-col items-center justify-center rounded-md p-2 text-center transition-all',
                        isCurrent
                          ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary ring-offset-2'
                          : isPast
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-muted/70 text-muted-foreground hover:bg-muted',
                      )}
                    >
                      <span className="text-[10px] font-medium opacity-75">Step {idx + 1}</span>
                      <span className="text-xs font-semibold">{step}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1 rounded-md border p-3">
                <span className="text-xs font-medium text-muted-foreground">Experience</span>
                <p className="font-semibold">{selectedCandidate.experience}</p>
              </div>
              <div className="space-y-1 rounded-md border p-3">
                <span className="text-xs font-medium text-muted-foreground">Location</span>
                <p className="font-semibold">{selectedCandidate.location}</p>
              </div>
              <div className="space-y-1 rounded-md border p-3">
                <span className="text-xs font-medium text-muted-foreground">Applied Date</span>
                <p className="font-semibold">
                  {formatDate(selectedCandidate.appliedOn, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="space-y-1 rounded-md border p-3">
                <span className="text-xs font-medium text-muted-foreground">Candidate Rating</span>
                <div>
                  <InteractiveStarRating
                    rating={selectedCandidate.rating}
                    onRate={(val) => updateRating(selectedCandidate, val)}
                    size="md"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3 space-y-1.5 bg-muted/20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Candidate Stage Summary
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Currently in <strong className="text-foreground">{selectedCandidate.stage}</strong>{' '}
                for <strong className="text-foreground">{selectedCandidate.job}</strong>.
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
                {configuredStages.indexOf(selectedCandidate.stage) <
                  configuredStages.length - 1 && (
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
                    {configuredStages.map((st) => (
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
