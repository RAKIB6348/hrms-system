import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { jobOpenings, departments } from '@/mocks/data'
import { formatDate } from '@/lib/utils'
import type { JobOpening } from '@/types'

const filters: TableFilter<JobOpening>[] = [
  { key: 'status', label: 'Status', options: ['Open', 'Draft', 'On Hold', 'Closed'], value: (r) => r.status },
  { key: 'department', label: 'Departments', options: departments.map((d) => d.name), value: (r) => r.department },
]

export default function JobOpenings() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(jobOpenings)
  const [deleting, setDeleting] = useState<JobOpening | null>(null)

  const columns: Column<JobOpening>[] = [
    { key: 'title', header: 'Job Title', cell: (j) => <span className="font-medium">{j.title}</span>, sortValue: (j) => j.title },
    { key: 'department', header: 'Department', cell: (j) => j.department, sortValue: (j) => j.department },
    { key: 'location', header: 'Location', cell: (j) => <span className="text-muted-foreground">{j.location}</span> },
    { key: 'type', header: 'Type', cell: (j) => <Badge>{j.type}</Badge> },
    { key: 'applicants', header: 'Applicants', cell: (j) => j.applicants, sortValue: (j) => j.applicants },
    { key: 'postedOn', header: 'Posted', cell: (j) => formatDate(j.postedOn, { month: 'short', day: 'numeric' }), sortValue: (j) => j.postedOn },
    { key: 'status', header: 'Status', cell: (j) => <StatusBadge status={j.status} /> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Openings"
        description="Create and manage job postings across all departments."
        actions={<Button asChild><Link to="/recruitment/jobs/new">Create Job</Link></Button>}
      />
      <DemoNotice compact />
      <DataTable
        data={rows} columns={columns} filters={filters}
        searchPlaceholder="Search job openings..."
        onRowClick={(job) => navigate(`/recruitment/jobs/${job.id}`)}
        rowActions={(job) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => navigate(`/recruitment/jobs/${job.id}`)}><Eye className="h-4 w-4" /> View details</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => toast.info('Job editing is available via Create Job (demo)')}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onSelect={() => setDeleting(job)}><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
      <ConfirmDialog
        open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete job opening?"
        description={`Remove "${deleting?.title ?? ''}" from the demo job list?`}
        confirmLabel="Delete"
        onConfirm={() => { if (deleting) setRows((prev) => prev.filter((j) => j.id !== deleting.id)); toast.success('Job opening deleted') }}
      />
    </div>
  )
}
