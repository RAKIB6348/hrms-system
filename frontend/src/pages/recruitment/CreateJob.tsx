import { type ComponentProps, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  MapPin,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DemoNotice } from '@/components/common/DemoNotice'
import { departments } from '@/mocks/data'
import { cn } from '@/lib/utils'

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
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      salaryRange: '',
      hiringManager: '',
      closesOn: '',
      description: '',
      requirements: '',
    },
  })

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    toast.success('Job opening created successfully (demo)')
    navigate('/recruitment/jobs')
  }

  const selectedDepartment = watch('department')
  const selectedType = watch('type')

  return (
    <div className="w-full space-y-6">
      {/* Page Header matching Employee Add Form */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/recruitment/jobs')}
            className="-ml-2 mb-1.5 h-8 gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to job openings
          </Button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-slate-100">
            Create Job Opening
          </h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-2xl">
            Define role parameters, organizational placement, compensation, and candidate requirements for your careers page.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start sm:self-center rounded-xl border border-indigo-100 bg-indigo-50/70 px-3.5 py-2 dark:border-indigo-950 dark:bg-indigo-950/40">
          <Sparkles className="h-4 w-4 text-[#4F46E5] dark:text-indigo-400" />
          <div className="text-xs">
            <span className="text-slate-500 dark:text-slate-400">Status: </span>
            <span className="font-semibold text-[#4F46E5] dark:text-indigo-400">New Opening</span>
          </div>
        </div>
      </div>

      <DemoNotice compact />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-28">
        {/* Card 1: Job Details */}
        <FormSection
          icon={BriefcaseBusiness}
          title="Role & Position Details"
          description="Core information about the open position, department, and work parameters."
        >
          <div className="space-y-6">
            {/* Position & Department */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Position & Organization
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Job Title" error={errors.title?.message} required>
                  <FormInput {...register('title')} placeholder="e.g. Senior Frontend Engineer" />
                </Field>

                <Field label="Department" error={errors.department?.message} required>
                  <Select
                    value={selectedDepartment}
                    onValueChange={(v) => setValue('department', v, { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-[42px] rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 shadow-2xs">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>

            {/* Location & Employment Terms */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Location & Employment Terms
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Location" error={errors.location?.message} required>
                  <FormInput {...register('location')} placeholder="e.g. Dhaka HQ / Remote" />
                </Field>

                <Field label="Employment Type" error={errors.type?.message} required>
                  <Select
                    value={selectedType}
                    onValueChange={(v) => setValue('type', v, { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-[42px] rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 shadow-2xs">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Full-time', 'Part-time', 'Contract', 'Intern'].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>

            {/* Compensation & Timeline (3 columns) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Compensation & Hiring Timeline
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Salary Range" error={errors.salaryRange?.message} required>
                  <FormInput {...register('salaryRange')} placeholder="e.g. ৳80,000 – ৳120,000" />
                </Field>

                <Field label="Hiring Manager" error={errors.hiringManager?.message} required>
                  <FormInput {...register('hiringManager')} placeholder="Full name of manager" />
                </Field>

                <Field label="Application Deadline" error={errors.closesOn?.message} required>
                  <FormInput type="date" {...register('closesOn')} />
                </Field>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Card 2: Description & Requirements */}
        <FormSection
          icon={FileText}
          title="Description & Candidate Requirements"
          description="Detail the core responsibilities, team impact, and required qualifications."
        >
          <div className="space-y-5">
            <Field label="Job Description" error={errors.description?.message} required>
              <FormTextarea
                {...register('description')}
                placeholder="Describe the mission of this role, day-to-day responsibilities, and team impact..."
                className="min-h-[140px]"
              />
            </Field>

            <Field label="Requirements (one per line)" error={errors.requirements?.message} hint="Press Enter for new line">
              <FormTextarea
                {...register('requirements')}
                placeholder={'5+ years of experience with React, TypeScript and modern CSS\nStrong proficiency in building responsive web applications\nExperience working with RESTful APIs and state management'}
                className="min-h-[120px]"
              />
            </Field>
          </div>
        </FormSection>

        {/* Sticky Action Footer matching Employee Form */}
        <div className="sticky bottom-0 z-30 rounded-xl border border-[#E2E8F0] bg-white/95 px-4 sm:px-6 py-3.5 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                New Job Opening
              </span>
              <span>•</span>
              <span>Complete required details and publish to careers page</span>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/recruitment/jobs')}
                className="h-[42px] px-4 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-[42px] px-6 rounded-lg text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/25 transition-all"
              >
                <BriefcaseBusiness className={cn('h-4 w-4 mr-1.5', isSubmitting && 'animate-pulse')} />
                {isSubmitting ? 'Publishing Job...' : 'Publish Job'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

/** Form Section Card matching 12px radius, #E2E8F0 border, 24px padding */
function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: any
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#4F46E5] ring-1 ring-indigo-500/10 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Icon className="h-5 w-5 stroke-[1.75]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-slate-100 leading-snug">
              {title}
            </h2>
            {description && (
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

function FormInput(props: ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className={cn(
        'h-[42px] rounded-lg border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors shadow-2xs',
        'hover:border-slate-400 focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-indigo-500/20',
        'dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus-visible:border-indigo-500',
        props.className,
      )}
    />
  )
}

function FormTextarea(props: ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      {...props}
      className={cn(
        'rounded-lg border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors leading-relaxed shadow-2xs',
        'hover:border-slate-400 focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-indigo-500/20',
        'dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus-visible:border-indigo-500',
        props.className,
      )}
    />
  )
}

function Field({
  label,
  error,
  required,
  hint,
  className,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  hint?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {label}
          {required && <span className="ml-1 text-rose-500 font-bold">*</span>}
        </Label>
        {hint && <span className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1 animate-fade-in">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
