import type { ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ManagerSelect } from '@/features/employees/ManagerSelect'
import { departments, designations } from '@/mocks/data'

export const employeeFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  department: z.string().min(1, 'Select a department'),
  designation: z.string().min(1, 'Select a designation'),
  employmentType: z.string().min(1, 'Select an employment type'),
  joinDate: z.string().min(1, 'Select a joining date'),
  location: z.string().min(1, 'Enter a work location'),
  salary: z.string().min(1, 'Enter an annual salary'),
  manager: z.string().optional(),
  managerId: z.string().optional(),
  address: z.string().optional(),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>

const emptyValues: EmployeeFormValues = {
  firstName: '', lastName: '', email: '', phone: '', department: '', designation: '',
  employmentType: 'Full-time', joinDate: '', location: '', salary: '', manager: '', managerId: '', address: '',
}

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormValues>
  submitLabel: string
  submittingLabel?: string
  submitIcon?: ReactNode
  onCancel?: () => void
  excludeEmployeeId?: string
  onSubmit: (values: EmployeeFormValues) => void | Promise<void>
}

/** Shared validated employee form used by Add Employee and the Edit dialog. */
export function EmployeeForm({
  defaultValues, submitLabel, submittingLabel = 'Saving...', submitIcon,
  onCancel, excludeEmployeeId, onSubmit,
}: EmployeeFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: { ...emptyValues, ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Personal Information</CardTitle><CardDescription>Basic details and contact information.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="First Name" error={errors.firstName?.message} required><Input {...register('firstName')} placeholder="e.g. Aarav" /></Field>
          <Field label="Last Name" error={errors.lastName?.message} required><Input {...register('lastName')} placeholder="e.g. Sharma" /></Field>
          <Field label="Email Address" error={errors.email?.message} required><Input type="email" {...register('email')} placeholder="name@company.com" /></Field>
          <Field label="Phone Number" error={errors.phone?.message} required><Input {...register('phone')} placeholder="+1 (555) 000-0000" /></Field>
          <Field label="Date of Joining" error={errors.joinDate?.message} required><Input type="date" {...register('joinDate')} /></Field>
          <Field label="Work Location" error={errors.location?.message} required><Input {...register('location')} placeholder="e.g. New York" /></Field>
          <Field label="Address" error={errors.address?.message} className="sm:col-span-2"><Textarea {...register('address')} placeholder="Street address, city, postal code" /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Job Information</CardTitle><CardDescription>Department, role and reporting details.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Department" error={errors.department?.message} required>
            <Select value={watch('department')} onValueChange={(v) => setValue('department', v, { shouldValidate: true })}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Designation" error={errors.designation?.message} required>
            <Select value={watch('designation')} onValueChange={(v) => setValue('designation', v, { shouldValidate: true })}>
              <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
              <SelectContent>{designations.map((d) => <SelectItem key={d.id} value={d.title}>{d.title}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Employment Type" error={errors.employmentType?.message} required>
            <Select value={watch('employmentType')} onValueChange={(v) => setValue('employmentType', v, { shouldValidate: true })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{['Full-time', 'Part-time', 'Contract', 'Intern'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Reporting Manager" error={errors.managerId?.message}>
            <ManagerSelect
              value={watch('managerId') ?? ''}
              displayName={watch('manager')}
              excludeEmployeeId={excludeEmployeeId}
              onChange={(employee) => {
                setValue('managerId', employee?.id ?? '', { shouldValidate: true })
                setValue('manager', employee ? `${employee.firstName} ${employee.lastName}` : '', { shouldValidate: true })
              }}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Compensation</CardTitle><CardDescription>Annual salary information for payroll.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Annual Salary (USD)" error={errors.salary?.message} required><Input type="number" {...register('salary')} placeholder="75000" /></Field>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Save className="h-4 w-4 animate-pulse" /> : submitIcon ?? <Save className="h-4 w-4" />}
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
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
