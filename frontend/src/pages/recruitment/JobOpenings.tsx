import { useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ActionIconButton } from '@/components/common/ActionIconButton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { jobOpenings, departments } from '@/mocks/data'
import { formatDate } from '@/lib/utils'
import type { JobOpening } from '@/types'

const filters: TableFilter<JobOpening>[] = [
  { key: 'status', label: 'Status', options: ['Open', 'Draft', 'On Hold', 'Closed'], value: (r) => r.status },
  { key: 'department', label: 'Departments', options: departments.map((d) => d.name), value: (r) => r.department },
]

const jobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  department: z.string().min(1, 'Select a department'),
  location: z.string().min(2, 'Enter a location'),
  type: z.string().min(1, 'Select an employment type'),
  salaryRange: z.string().min(2, 'Enter a salary range'),
  hiringManager: z.string().min(2, 'Enter a hiring manager'),
  closesOn: z.string().min(1, 'Select a closing date'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().optional(),
})

type JobFormValues = z.infer<typeof jobSchema>

export default function JobOpenings() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(jobOpenings)
  const [deleting, setDeleting] = useState<JobOpening | null>(null)
  const [editing, setEditing] = useState<JobOpening | null>(null)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '', department: '', location: '', type: 'Full-time', salaryRange: '',
      hiringManager: '', closesOn: '', description: '', requirements: '',
    },
  })

  const openEdit = (job: JobOpening) => {
    reset({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      salaryRange: job.salaryRange,
      hiringManager: job.hiringManager,
      closesOn: job.closesOn,
      description: job.description,
      requirements: job.requirements.join('\n'),
    })
    setEditing(job)
  }

  const saveEdit = (values: JobFormValues) => {
    if (!editing) return
    setRows((prev) => prev.map((job) => job.id === editing.id ? {
      ...job,
      title: values.title,
      department: values.department,
      location: values.location,
      type: values.type,
      salaryRange: values.salaryRange,
      hiringManager: values.hiringManager,
      closesOn: values.closesOn,
      description: values.description,
      requirements: values.requirements?.split('\n').map((line) => line.trim()).filter(Boolean) ?? [],
    } : job))
    toast.success(`${values.title} updated in the demo job list`)
    setEditing(null)
  }

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
          <div className="flex items-center justify-end gap-1.5">
            <ActionIconButton variant="view" icon={Eye} label={`View ${job.title}`} tooltip="View job details" onClick={() => navigate(`/recruitment/jobs/${job.id}`)} />
            <ActionIconButton variant="edit" icon={Pencil} label={`Edit ${job.title}`} tooltip="Edit job opening" onClick={() => openEdit(job)} />
            <ActionIconButton variant="delete" icon={Trash2} label={`Delete ${job.title}`} tooltip="Delete job opening" onClick={() => setDeleting(job)} />
          </div>
        )}
      />
      <ConfirmDialog
        open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete job opening?"
        description={`Remove "${deleting?.title ?? ''}" from the demo job list?`}
        confirmLabel="Delete"
        onConfirm={() => { if (deleting) setRows((prev) => prev.filter((j) => j.id !== deleting.id)); toast.success('Job opening deleted') }}
      />

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Opening</DialogTitle>
            <DialogDescription>Update "{editing?.title ?? ''}". Status and applicant records are preserved.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(saveEdit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job Title" error={errors.title?.message} required><Input {...register('title')} /></Field>
              <Field label="Department" error={errors.department?.message} required>
                <Select value={watch('department')} onValueChange={(v) => setValue('department', v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Location" error={errors.location?.message} required><Input {...register('location')} /></Field>
              <Field label="Employment Type" error={errors.type?.message} required>
                <Select value={watch('type')} onValueChange={(v) => setValue('type', v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Full-time', 'Part-time', 'Contract', 'Intern'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Salary Range" error={errors.salaryRange?.message} required><Input {...register('salaryRange')} /></Field>
              <Field label="Hiring Manager" error={errors.hiringManager?.message} required><Input {...register('hiringManager')} /></Field>
              <Field label="Application Deadline" error={errors.closesOn?.message} required><Input type="date" {...register('closesOn')} /></Field>
              <Field label="Description" error={errors.description?.message} required className="sm:col-span-2"><Textarea {...register('description')} /></Field>
              <Field label="Requirements (one per line)" error={errors.requirements?.message} className="sm:col-span-2"><Textarea {...register('requirements')} /></Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, error, required, className, children }: {
  label: string; error?: string; required?: boolean; className?: string; children: ReactNode
}) {
  return (
    <div className={('space-y-1.5 ' + (className ?? ''))}>
      <Label>{label}{required && <span className="ml-0.5 text-destructive">*</span>}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
