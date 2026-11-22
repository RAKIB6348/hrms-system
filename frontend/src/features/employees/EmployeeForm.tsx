import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { ImageIcon, Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ManagerSelect } from '@/features/employees/ManagerSelect'
import { useEmployeeStore } from '@/hooks/use-employee-store'
import { useCompanyStore } from '@/hooks/use-company-settings'
import { departments, designations, shifts } from '@/mocks/data'
import { cn, formatCurrency, randomId } from '@/lib/utils'
import type { Employee, EmployeeStatus } from '@/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+\d][\d\s()-]{6,}$/
const MAX_FILE_SIZE = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const DOC_TYPES = [...IMAGE_TYPES, 'application/pdf']

const optionalEmail = z.string().refine((v) => !v || EMAIL_RE.test(v), 'Enter a valid email address')
const requiredEmail = z.string().min(1, 'Work email is required').refine((v) => EMAIL_RE.test(v), 'Enter a valid email address')
const optionalPhone = z.string().refine((v) => !v || PHONE_RE.test(v), 'Enter a valid phone number')
const requiredPhone = z.string().min(1, 'Mobile number is required').refine((v) => PHONE_RE.test(v), 'Enter a valid phone number')
const optionalDate = z.string().refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Enter a valid date')
const money = z.string().refine((v) => !v || Number(v) >= 0, 'Amount must be zero or greater')

export function createEmployeeFormSchema(existingEmployeeIds: string[] = []) {
  return z.object({
    photo: z.any().optional(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    middleName: z.string().optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    dob: z.string().min(1, 'Date of birth is required'),
    gender: z.string().optional(),
    maritalStatus: z.string().optional(),
    bloodGroup: z.string().optional(),
    nationality: z.string().optional(),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),

    personalEmail: optionalEmail,
    workEmail: requiredEmail,
    primaryMobile: requiredPhone,
    alternativeMobile: optionalPhone,
    presentAddress: z.string().optional(),
    permanentAddress: z.string().optional(),
    sameAsPresent: z.boolean().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),

    nidNumber: z.string().optional(),
    birthRegistrationNumber: z.string().optional(),
    passportNumber: z.string().optional(),
    passportExpiryDate: optionalDate,
    tin: z.string().optional(),

    employeeId: z.string().min(1, 'Employee ID is required').refine(
      (value) => !existingEmployeeIds.includes(value), 'This Employee ID already exists',
    ),
    joinDate: z.string().min(1, 'Date of joining is required'),
    department: z.string().min(1, 'Select a department'),
    designation: z.string().min(1, 'Select a designation'),
    employmentType: z.string().min(1, 'Select an employment type'),
    managerId: z.string().optional(),
    manager: z.string().optional(),
    employmentStatus: z.string().optional(),
    workLocation: z.string().optional(),
    workMode: z.string().optional(),
    probationStart: optionalDate,
    probationEnd: optionalDate,
    confirmationDate: optionalDate,
    contractStart: optionalDate,
    contractEnd: optionalDate,

    shift: z.string().optional(),
    weeklyWorkingDays: z.string().optional(),
    standardHours: z.string().optional(),
    attendancePolicy: z.string().optional(),

    salaryType: z.string().optional(),
    basicSalary: z.string().min(1, 'Basic salary is required').refine((v) => Number(v) > 0, 'Basic salary must be greater than zero'),
    hra: money,
    medicalAllowance: money,
    transportAllowance: money,
    otherAllowances: money,
    grossSalary: z.string().optional(),
    paymentMethod: z.string().optional(),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    accountHolderName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    mobileProvider: z.string().optional(),
    mobileAccountNumber: z.string().optional(),

    education: z.array(z.object({
      degree: z.string(), institution: z.string(), subject: z.string(),
      passingYear: z.string(), result: z.string(),
    })),
    experience: z.array(z.object({
      company: z.string(), jobTitle: z.string(), startDate: z.string(),
      endDate: z.string(), responsibilities: z.string(),
    })),
    emergencyContacts: z.array(z.object({
      name: z.string(), relationship: z.string(), phone: z.string(),
      alternativePhone: z.string(), address: z.string(),
    })),

    nidCopy: z.any().optional(),
    birthCertificate: z.any().optional(),
    passportCopy: z.any().optional(),
    resume: z.any().optional(),
    educationalCertificates: z.any().optional(),
    experienceCertificates: z.any().optional(),
    appointmentLetter: z.any().optional(),
    otherDocuments: z.any().optional(),
  }).refine((data) => !data.probationEnd || !data.probationStart || Date.parse(data.probationEnd) >= Date.parse(data.probationStart), {
    path: ['probationEnd'], message: 'Probation end must be after the start date',
  }).refine((data) => !data.contractEnd || !data.contractStart || Date.parse(data.contractEnd) >= Date.parse(data.contractStart), {
    path: ['contractEnd'], message: 'Contract end must be after the start date',
  }).refine((data) => !data.dob || Date.parse(data.dob) < Date.now(), {
    path: ['dob'], message: 'Date of birth must be in the past',
  })
}

export type EmployeeFormValues = z.infer<ReturnType<typeof createEmployeeFormSchema>>

const emptyValues: EmployeeFormValues = {
  photo: null,
  firstName: '', middleName: '', lastName: '', dob: '', gender: '', maritalStatus: '',
  bloodGroup: '', nationality: '', fatherName: '', motherName: '',
  personalEmail: '', workEmail: '', primaryMobile: '', alternativeMobile: '',
  presentAddress: '', permanentAddress: '', sameAsPresent: false,
  city: '', district: '', postalCode: '', country: '',
  nidNumber: '', birthRegistrationNumber: '', passportNumber: '', passportExpiryDate: '', tin: '',
  employeeId: '', joinDate: '', department: '', designation: '', employmentType: 'Full-time',
  managerId: '', manager: '', employmentStatus: 'Active', workLocation: '', workMode: 'On-site',
  probationStart: '', probationEnd: '', confirmationDate: '', contractStart: '', contractEnd: '',
  shift: '', weeklyWorkingDays: '', standardHours: '', attendancePolicy: '',
  salaryType: 'Monthly', basicSalary: '', hra: '', medicalAllowance: '', transportAllowance: '',
  otherAllowances: '', grossSalary: '', paymentMethod: 'Bank Transfer',
  bankName: '', branchName: '', accountHolderName: '', accountNumber: '', routingNumber: '',
  mobileProvider: '', mobileAccountNumber: '',
  education: [], experience: [], emergencyContacts: [],
  nidCopy: null, birthCertificate: null, passportCopy: null, resume: null,
  educationalCertificates: null, experienceCertificates: null, appointmentLetter: null, otherDocuments: null,
}

interface EmployeeFormProps {
  employeeId: string
  defaultValues?: Partial<EmployeeFormValues>
  submitLabel: string
  submittingLabel?: string
  submitIcon?: ReactNode
  onCancel?: () => void
  excludeEmployeeId?: string
  onSubmit: (values: EmployeeFormValues) => void | Promise<void>
}

/** Complete HRMS employee registration form (create + edit). */
export function EmployeeForm({
  employeeId, defaultValues, submitLabel, submittingLabel = 'Saving...', submitIcon,
  onCancel, excludeEmployeeId, onSubmit,
}: EmployeeFormProps) {
  const currency = useCompanyStore((state) => state.settings.currency)
  const storeEmployees = useEmployeeStore((state) => state.employees)
  const existingIds = useMemo(
    () => storeEmployees.filter((employee) => employee.id !== excludeEmployeeId).map((employee) => employee.employeeId),
    [storeEmployees, excludeEmployeeId],
  )
  const schema = useMemo(() => createEmployeeFormSchema(existingIds), [existingIds])

  const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...emptyValues, employeeId, ...defaultValues },
  })

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({ control, name: 'education' })
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({ control, name: 'experience' })
  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({ control, name: 'emergencyContacts' })

  const presentAddress = watch('presentAddress') ?? ''
  const sameAsPresent = watch('sameAsPresent')
  useEffect(() => {
    if (sameAsPresent) setValue('permanentAddress', presentAddress)
  }, [sameAsPresent, presentAddress, setValue])

  const gross = ['basicSalary', 'hra', 'medicalAllowance', 'transportAllowance', 'otherAllowances']
    .reduce((sum, key) => sum + (Number(watch(key as keyof EmployeeFormValues) || 0)), 0)

  const handleFile = (name: string, file: File | null, types: string[]) => {
    if (!file) { setValue(name as never, null); return }
    if (!types.includes(file.type)) { toast.error('Unsupported file type'); return }
    if (file.size > MAX_FILE_SIZE) { toast.error('File must be 5 MB or smaller'); return }
    setValue(name as never, file as never, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      <Section title="Personal Information" description="Basic personal details and identification.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FileField label="Profile Photo" name="photo" value={watch('photo')} types={IMAGE_TYPES} preview onChange={(file) => handleFile('photo', file, IMAGE_TYPES)} />
          <Field label="First Name" error={errors.firstName?.message} required><Input {...register('firstName')} /></Field>
          <Field label="Middle Name"><Input {...register('middleName')} /></Field>
          <Field label="Last Name" error={errors.lastName?.message} required><Input {...register('lastName')} /></Field>
          <Field label="Date of Birth" error={errors.dob?.message} required><Input type="date" {...register('dob')} /></Field>
          <Field label="Gender">
            <Select value={watch('gender')} onValueChange={(v) => setValue('gender', v)}>
              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>{['Male', 'Female', 'Other'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Marital Status">
            <Select value={watch('maritalStatus')} onValueChange={(v) => setValue('maritalStatus', v)}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>{['Single', 'Married', 'Divorced', 'Widowed'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Blood Group"><Input {...register('bloodGroup')} placeholder="e.g. O+" /></Field>
          <Field label="Nationality"><Input {...register('nationality')} /></Field>
          <Field label="Father's Name"><Input {...register('fatherName')} /></Field>
          <Field label="Mother's Name"><Input {...register('motherName')} /></Field>
        </div>
      </Section>

      <Section title="Contact Information" description="Communication details and address.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Personal Email" error={errors.personalEmail?.message}><Input type="email" {...register('personalEmail')} /></Field>
          <Field label="Work Email" error={errors.workEmail?.message} required><Input type="email" {...register('workEmail')} /></Field>
          <Field label="Primary Mobile Number" error={errors.primaryMobile?.message} required><Input {...register('primaryMobile')} /></Field>
          <Field label="Alternative Mobile Number" error={errors.alternativeMobile?.message}><Input {...register('alternativeMobile')} /></Field>
          <Field label="Present Address" className="sm:col-span-2"><Textarea {...register('presentAddress')} /></Field>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <Checkbox checked={Boolean(sameAsPresent)} onCheckedChange={(checked) => setValue('sameAsPresent', checked === true)} />
            Same as Present Address
          </label>
          <Field label="Permanent Address"><Textarea {...register('permanentAddress')} /></Field>
          <Field label="City"><Input {...register('city')} /></Field>
          <Field label="District"><Input {...register('district')} /></Field>
          <Field label="Postal Code"><Input {...register('postalCode')} /></Field>
          <Field label="Country"><Input {...register('country')} /></Field>
        </div>
      </Section>

      <Section title="Identity Information" description="Optional identity documents — provide only what applies.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="National ID (NID) Number"><Input {...register('nidNumber')} /></Field>
          <Field label="Birth Registration Number"><Input {...register('birthRegistrationNumber')} /></Field>
          <Field label="Passport Number"><Input {...register('passportNumber')} /></Field>
          <Field label="Passport Expiry Date" error={errors.passportExpiryDate?.message}><Input type="date" {...register('passportExpiryDate')} /></Field>
          <Field label="Tax Identification Number (TIN)"><Input {...register('tin')} /></Field>
        </div>
      </Section>

      <Section title="Employment Information" description="Employee ID is generated automatically and cannot be changed here.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Employee ID" required><Input value={watch('employeeId') ?? employeeId} readOnly className="font-mono bg-muted" /></Field>
          <Field label="Date of Joining" error={errors.joinDate?.message} required><Input type="date" {...register('joinDate')} /></Field>
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
              <SelectContent>{['Full-time', 'Part-time', 'Contract', 'Intern'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
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
          <Field label="Employment Status">
            <Select value={watch('employmentStatus')} onValueChange={(v) => setValue('employmentStatus', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{['Active', 'Probation', 'On Leave', 'Inactive'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Work Location"><Input {...register('workLocation')} /></Field>
          <Field label="Work Mode">
            <Select value={watch('workMode')} onValueChange={(v) => setValue('workMode', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{['On-site', 'Remote', 'Hybrid'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Probation Start Date" error={errors.probationStart?.message}><Input type="date" {...register('probationStart')} /></Field>
          <Field label="Probation End Date" error={errors.probationEnd?.message}><Input type="date" {...register('probationEnd')} /></Field>
          <Field label="Confirmation Date" error={errors.confirmationDate?.message}><Input type="date" {...register('confirmationDate')} /></Field>
          <Field label="Contract Start Date" error={errors.contractStart?.message}><Input type="date" {...register('contractStart')} /></Field>
          <Field label="Contract End Date" error={errors.contractEnd?.message}><Input type="date" {...register('contractEnd')} /></Field>
        </div>
      </Section>

      <Section title="Work Schedule" description="Shift and attendance configuration.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Assigned Shift">
            <Select value={watch('shift')} onValueChange={(v) => setValue('shift', v)}>
              <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
              <SelectContent>{shifts.map((s) => <SelectItem key={s.id} value={s.name}>{s.name} ({s.startTime} – {s.endTime})</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Weekly Working Days"><Input {...register('weeklyWorkingDays')} placeholder="Mon – Fri" /></Field>
          <Field label="Standard Working Hours"><Input {...register('standardHours')} placeholder="8" /></Field>
          <Field label="Attendance Policy">
            <Select value={watch('attendancePolicy')} onValueChange={(v) => setValue('attendancePolicy', v)}>
              <SelectTrigger><SelectValue placeholder="Select policy" /></SelectTrigger>
              <SelectContent>{['Standard', 'Flexible', 'Strict', 'Hybrid'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Salary & Compensation" description={`Amounts are shown in the selected company currency (${currency}).`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Salary Type">
            <Select value={watch('salaryType')} onValueChange={(v) => setValue('salaryType', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{['Monthly', 'Daily', 'Hourly'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Basic Salary" error={errors.basicSalary?.message} required><Input type="number" {...register('basicSalary')} /></Field>
          <Field label="House Rent Allowance" error={errors.hra?.message}><Input type="number" {...register('hra')} /></Field>
          <Field label="Medical Allowance" error={errors.medicalAllowance?.message}><Input type="number" {...register('medicalAllowance')} /></Field>
          <Field label="Transport Allowance" error={errors.transportAllowance?.message}><Input type="number" {...register('transportAllowance')} /></Field>
          <Field label="Other Allowances" error={errors.otherAllowances?.message}><Input type="number" {...register('otherAllowances')} /></Field>
          <Field label="Gross Salary (auto-calculated)">
            <Input readOnly value={formatCurrency(gross, currency)} className="bg-muted font-semibold" />
          </Field>
          <Field label="Payment Method">
            <Select value={watch('paymentMethod')} onValueChange={(v) => setValue('paymentMethod', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{['Bank Transfer', 'Cash', 'Mobile Banking'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Bank Name"><Input {...register('bankName')} /></Field>
          <Field label="Branch Name"><Input {...register('branchName')} /></Field>
          <Field label="Account Holder Name"><Input {...register('accountHolderName')} /></Field>
          <Field label="Account Number"><Input {...register('accountNumber')} type="password" autoComplete="off" /></Field>
          <Field label="Routing Number"><Input {...register('routingNumber')} /></Field>
          <Field label="Mobile Banking Provider"><Input {...register('mobileProvider')} /></Field>
          <Field label="Mobile Banking Account Number"><Input {...register('mobileAccountNumber')} type="password" autoComplete="off" /></Field>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Banking and identity details stay in this browser session only. They are not written to localStorage or saved in demo mode.
        </p>
      </Section>

      <Section title="Educational Qualifications" description="Add one or more education records.">
        <Repeatable
          fields={educationFields}
          onAdd={() => appendEducation({ degree: '', institution: '', subject: '', passingYear: '', result: '' })}
          onRemove={removeEducation}
          addLabel="Add Qualification"
          render={(field, index) => (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Qualification / Degree"><Input {...register(`education.${index}.degree`)} /></Field>
              <Field label="Institution Name"><Input {...register(`education.${index}.institution`)} /></Field>
              <Field label="Subject / Major"><Input {...register(`education.${index}.subject`)} /></Field>
              <Field label="Passing Year"><Input {...register(`education.${index}.passingYear`)} placeholder="2024" /></Field>
              <Field label="Result / CGPA"><Input {...register(`education.${index}.result`)} /></Field>
            </div>
          )}
        />
      </Section>

      <Section title="Previous Employment" description="Add one or more previous roles.">
        <Repeatable
          fields={experienceFields}
          onAdd={() => appendExperience({ company: '', jobTitle: '', startDate: '', endDate: '', responsibilities: '' })}
          onRemove={removeExperience}
          addLabel="Add Experience"
          render={(field, index) => (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Company Name"><Input {...register(`experience.${index}.company`)} /></Field>
              <Field label="Job Title"><Input {...register(`experience.${index}.jobTitle`)} /></Field>
              <Field label="Start Date"><Input type="date" {...register(`experience.${index}.startDate`)} /></Field>
              <Field label="End Date"><Input type="date" {...register(`experience.${index}.endDate`)} /></Field>
              <Field label="Responsibilities" className="sm:col-span-2 lg:col-span-3"><Textarea {...register(`experience.${index}.responsibilities`)} /></Field>
            </div>
          )}
        />
      </Section>

      <Section title="Emergency Contacts" description="Add one or more people to contact in an emergency.">
        <Repeatable
          fields={contactFields}
          onAdd={() => appendContact({ name: '', relationship: '', phone: '', alternativePhone: '', address: '' })}
          onRemove={removeContact}
          addLabel="Add Emergency Contact"
          render={(field, index) => (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Contact Person Name"><Input {...register(`emergencyContacts.${index}.name`)} /></Field>
              <Field label="Relationship"><Input {...register(`emergencyContacts.${index}.relationship`)} /></Field>
              <Field label="Phone Number"><Input {...register(`emergencyContacts.${index}.phone`)} /></Field>
              <Field label="Alternative Phone"><Input {...register(`emergencyContacts.${index}.alternativePhone`)} /></Field>
              <Field label="Address" className="sm:col-span-2"><Input {...register(`emergencyContacts.${index}.address`)} /></Field>
            </div>
          )}
        />
      </Section>

      <Section title="Employee Documents" description="Upload optional files. Maximum 5 MB per file; images and PDFs are accepted.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FileField label="Employee Photo" name="photo" value={watch('photo')} types={IMAGE_TYPES} preview onChange={(file) => handleFile('photo', file, IMAGE_TYPES)} />
          <FileField label="NID Copy" name="nidCopy" value={watch('nidCopy')} types={DOC_TYPES} onChange={(file) => handleFile('nidCopy', file, DOC_TYPES)} />
          <FileField label="Birth Certificate" name="birthCertificate" value={watch('birthCertificate')} types={DOC_TYPES} onChange={(file) => handleFile('birthCertificate', file, DOC_TYPES)} />
          <FileField label="Passport Copy" name="passportCopy" value={watch('passportCopy')} types={DOC_TYPES} onChange={(file) => handleFile('passportCopy', file, DOC_TYPES)} />
          <FileField label="Resume / CV" name="resume" value={watch('resume')} types={DOC_TYPES} onChange={(file) => handleFile('resume', file, DOC_TYPES)} />
          <FileField label="Educational Certificates" name="educationalCertificates" value={watch('educationalCertificates')} types={DOC_TYPES} onChange={(file) => handleFile('educationalCertificates', file, DOC_TYPES)} />
          <FileField label="Experience Certificates" name="experienceCertificates" value={watch('experienceCertificates')} types={DOC_TYPES} onChange={(file) => handleFile('experienceCertificates', file, DOC_TYPES)} />
          <FileField label="Appointment Letter" name="appointmentLetter" value={watch('appointmentLetter')} types={DOC_TYPES} onChange={(file) => handleFile('appointmentLetter', file, DOC_TYPES)} />
          <FileField label="Other Documents" name="otherDocuments" value={watch('otherDocuments')} types={DOC_TYPES} onChange={(file) => handleFile('otherDocuments', file, DOC_TYPES)} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Files are previewed locally and exist only in frontend demo mode until backend storage is integrated. No file content is persisted.
        </p>
      </Section>

      <div className="sticky bottom-0 -mx-1 flex flex-col-reverse gap-2 border-t bg-background/95 px-1 py-4 backdrop-blur sm:flex-row sm:justify-end">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Save className="h-4 w-4 animate-pulse" /> : submitIcon ?? <Save className="h-4 w-4" />}
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle>{description && <CardDescription>{description}</CardDescription>}</CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function Field({ label, error, required, className, children }: {
  label: string; error?: string; required?: boolean; className?: string; children: ReactNode
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label>{label}{required && <span className="ml-0.5 text-destructive">*</span>}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function Repeatable<T extends { id: string }>({
  fields, onAdd, onRemove, addLabel, render,
}: {
  fields: T[]
  onAdd: () => void
  onRemove: (index: number) => void
  addLabel: string
  render: (field: T, index: number) => ReactNode
}) {
  return (
    <div className="space-y-3">
      {fields.length === 0 && <p className="text-sm text-muted-foreground">No records added yet.</p>}
      {fields.map((field, index) => (
        <div key={field.id} className="relative rounded-lg border p-4">
          <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8 text-destructive" onClick={() => onRemove(index)} aria-label={`Remove record ${index + 1}`}>
            <Trash2 className="h-4 w-4" />
          </Button>
          {render(field, index)}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={onAdd}><Plus className="h-4 w-4" /> {addLabel}</Button>
    </div>
  )
}

function FileField({ label, value, types, onChange, preview }: {
  label: string
  value: File | null | undefined
  types: string[]
  onChange: (file: File | null) => void
  preview?: boolean
}) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!value || !preview || !value.type.startsWith('image/')) { setUrl(null); return }
    const objectUrl = URL.createObjectURL(value)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [value, preview])

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="file" accept={types.join(',')} onChange={(event) => onChange(event.target.files?.[0] ?? null)} className="h-auto py-1.5 text-xs" />
      <div className="flex items-center gap-2">
        {url && <img src={url} alt={`${label} preview`} className="h-12 w-12 rounded-md object-cover" />}
        {value && (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {!url && <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />}
            <span className="truncate text-xs text-muted-foreground">{value.name}</span>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive" onClick={() => onChange(null)}>Remove</Button>
          </div>
        )}
      </div>
    </div>
  )
}

/** Maps validated form values to the shared Employee record (session-only). */
export function employeeFromFormValues(values: EmployeeFormValues, employeeId: string, existing?: Employee): Employee {
  const monthlyGross = ['basicSalary', 'hra', 'medicalAllowance', 'transportAllowance', 'otherAllowances']
    .reduce((sum, key) => sum + (Number(values[key as keyof EmployeeFormValues] || 0)), 0)

  return {
    id: existing?.id ?? randomId('emp'),
    employeeId,
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.workEmail,
    phone: values.primaryMobile,
    department: values.department,
    designation: values.designation,
    status: (values.employmentStatus as EmployeeStatus) ?? existing?.status ?? 'Active',
    joinDate: values.joinDate,
    location: values.workLocation || existing?.location || '',
    manager: values.manager ?? '',
    managerId: values.managerId || '',
    salary: monthlyGross * 12,
    avatarColor: existing?.avatarColor ?? '#6366f1',
    dob: values.dob,
    gender: (values.gender as Employee['gender']) || existing?.gender || 'Other',
    address: values.presentAddress || '',
    employmentType: values.employmentType as Employee['employmentType'],
    middleName: values.middleName,
    maritalStatus: values.maritalStatus,
    bloodGroup: values.bloodGroup,
    nationality: values.nationality,
    fatherName: values.fatherName,
    motherName: values.motherName,
    personalEmail: values.personalEmail,
    alternativeMobile: values.alternativeMobile,
    presentAddress: values.presentAddress,
    permanentAddress: values.permanentAddress,
    city: values.city,
    district: values.district,
    postalCode: values.postalCode,
    country: values.country,
    nidNumber: values.nidNumber,
    birthRegistrationNumber: values.birthRegistrationNumber,
    passportNumber: values.passportNumber,
    passportExpiryDate: values.passportExpiryDate,
    tin: values.tin,
    employeeStatus: (values.employmentStatus as EmployeeStatus) ?? 'Active',
    workMode: values.workMode,
    probationStart: values.probationStart,
    probationEnd: values.probationEnd,
    confirmationDate: values.confirmationDate,
    contractStart: values.contractStart,
    contractEnd: values.contractEnd,
    shift: values.shift,
    weeklyWorkingDays: values.weeklyWorkingDays,
    standardHours: values.standardHours,
    attendancePolicy: values.attendancePolicy,
    salaryType: values.salaryType,
    hra: Number(values.hra || 0),
    medicalAllowance: Number(values.medicalAllowance || 0),
    transportAllowance: Number(values.transportAllowance || 0),
    otherAllowances: Number(values.otherAllowances || 0),
    grossSalary: monthlyGross,
    education: values.education,
    experience: values.experience,
    emergencyContacts: values.emergencyContacts,
  }
}
