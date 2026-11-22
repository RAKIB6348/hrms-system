import type { ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, BriefcaseBusiness } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DemoNotice } from '@/components/common/DemoNotice'
import { departments } from '@/mocks/data'

const schema = z.object({
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

type FormValues = z.infer<typeof schema>

export default function CreateJob() {
  const navigate = useNavigate()
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', department: '', location: '', type: 'Full-time', salaryRange: '', hiringManager: '', closesOn: '', description: '', requirements: '' },
  })

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    toast.success('Job opening created successfully (demo)')
    navigate('/recruitment/jobs')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/recruitment/jobs')}><ArrowLeft className="h-4 w-4" /> Back to job openings</Button>
      <DemoNotice compact />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Create Job Opening</h1>
        <p className="text-sm text-muted-foreground">Define a new role and publish it to your careers page.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Job Details</CardTitle><CardDescription>Core information about the open role.</CardDescription></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Job Title" error={errors.title?.message} required><Input {...register('title')} placeholder="e.g. Senior Frontend Engineer" /></Field>
            <Field label="Department" error={errors.department?.message} required>
              <Select onValueChange={(v) => setValue('department', v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Location" error={errors.location?.message} required><Input {...register('location')} placeholder="e.g. New York / Remote" /></Field>
            <Field label="Employment Type" error={errors.type?.message} required>
              <Select defaultValue="Full-time" onValueChange={(v) => setValue('type', v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Full-time', 'Part-time', 'Contract', 'Intern'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Salary Range" error={errors.salaryRange?.message} required><Input {...register('salaryRange')} placeholder="$90k – $120k" /></Field>
            <Field label="Hiring Manager" error={errors.hiringManager?.message} required><Input {...register('hiringManager')} placeholder="Full name" /></Field>
            <Field label="Application Deadline" error={errors.closesOn?.message} required><Input type="date" {...register('closesOn')} /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Description & Requirements</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Job Description" error={errors.description?.message} required>
              <Textarea {...register('description')} placeholder="Describe the role, team and impact..." className="min-h-[120px]" />
            </Field>
            <Field label="Requirements (one per line)" error={errors.requirements?.message}>
              <Textarea {...register('requirements')} placeholder={'5+ years of experience\nStrong communication skills'} className="min-h-[100px]" />
            </Field>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/recruitment/jobs')}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            <BriefcaseBusiness className="h-4 w-4" />{isSubmitting ? 'Publishing...' : 'Publish Job'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{required && <span className="ml-0.5 text-destructive">*</span>}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
