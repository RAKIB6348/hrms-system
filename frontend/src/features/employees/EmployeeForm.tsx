import { Fragment, useEffect, useMemo, useRef, useState, type ChangeEvent, type ComponentProps, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, type FieldErrors } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  BriefcaseBusiness, Camera, Check, ChevronLeft, ChevronRight, FileText, GraduationCap,
  ImageIcon, Plus, Save, Trash2, UserRound, Wallet,
} from 'lucide-react'
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
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const PHOTO_TYPES = IMAGE_TYPES
const PHOTO_MAX_SIZE = 2 * 1024 * 1024
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

type Step = {
  label: string
  icon: typeof UserRound
  fields: (keyof EmployeeFormValues)[]
}

const steps: Step[] = [
  {
    label: 'Personal & Contact', icon: UserRound,
    fields: ['photo', 'firstName', 'middleName', 'lastName', 'dob', 'gender', 'maritalStatus', 'bloodGroup',
      'nationality', 'fatherName', 'motherName', 'personalEmail', 'workEmail', 'primaryMobile',
      'alternativeMobile', 'presentAddress', 'permanentAddress', 'sameAsPresent', 'city', 'district', 'postalCode', 'country'],
  },
  {
    label: 'Employment & Work', icon: BriefcaseBusiness,
    fields: ['nidNumber', 'birthRegistrationNumber', 'passportNumber', 'passportExpiryDate', 'tin', 'employeeId',
      'joinDate', 'department', 'designation', 'employmentType', 'managerId', 'manager', 'employmentStatus',
      'workLocation', 'workMode', 'probationStart', 'probationEnd', 'confirmationDate', 'contractStart',
      'contractEnd', 'shift', 'weeklyWorkingDays', 'standardHours', 'attendancePolicy'],
  },
  {
    label: 'Salary & Bank', icon: Wallet,
    fields: ['salaryType', 'basicSalary', 'hra', 'medicalAllowance', 'transportAllowance', 'otherAllowances',
      'grossSalary', 'paymentMethod', 'bankName', 'branchName', 'accountHolderName', 'accountNumber',
      'routingNumber', 'mobileProvider', 'mobileAccountNumber'],
  },
  {
    label: 'Education & Docs', icon: GraduationCap,
    fields: ['education', 'experience', 'emergencyContacts', 'nidCopy', 'birthCertificate', 'passportCopy',
      'resume', 'educationalCertificates', 'experienceCertificates', 'appointmentLetter', 'otherDocuments'],
  },
  { label: 'Review & Create', icon: FileText, fields: [] },
]

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

/** Premium step-based employee registration experience. */
export function EmployeeForm({
  employeeId, defaultValues, submitLabel, submittingLabel = 'Saving...', submitIcon,
  onCancel, excludeEmployeeId, onSubmit,
}: EmployeeFormProps) {
  const [step, setStep] = useState(0)
  const currency = useCompanyStore((state) => state.settings.currency)
  const storeEmployees = useEmployeeStore((state) => state.employees)
  const existingIds = useMemo(
    () => storeEmployees.filter((employee) => employee.id !== excludeEmployeeId).map((employee) => employee.employeeId),
    [storeEmployees, excludeEmployeeId],
  )
  const schema = useMemo(() => createEmployeeFormSchema(existingIds), [existingIds])

  const { register, control, handleSubmit, setValue, watch, trigger, formState: { errors, isSubmitting } } = useForm<EmployeeFormValues>({
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

  const goNext = async () => {
    const valid = await trigger(steps[step].fields, { shouldFocus: true })
    if (!valid) { toast.error('Please correct the highlighted fields'); return }
    setStep((current) => Math.min(steps.length - 1, current + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onInvalid = (formErrors: FieldErrors<EmployeeFormValues>) => {
    const firstStep = steps.findIndex((item) => item.fields.some((field) => field in formErrors))
    if (firstStep >= 0 && firstStep !== step) {
      setStep(firstStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    toast.error('Please correct the highlighted fields')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="w-full space-y-6 pb-24">
      <Stepper current={step} onSelect={(index) => { if (index <= step) setStep(index) }} />

      {step === 0 && (
        <div className="space-y-6">
          <FormSection icon={UserRound} title="Personal Information" description="Basic personal details and identity.">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <PhotoUpload file={watch('photo')} onChange={(file) => handleFile('photo', file, IMAGE_TYPES)} />
              <Field label="First Name" error={errors.firstName?.message} required><FormInput {...register('firstName')} /></Field>
              <Field label="Middle Name"><FormInput {...register('middleName')} /></Field>
              <Field label="Last Name" error={errors.lastName?.message} required><FormInput {...register('lastName')} /></Field>
              <Field label="Date of Birth" error={errors.dob?.message} required><FormInput type="date" {...register('dob')} /></Field>
              <Field label="Gender">
                <Select value={watch('gender')} onValueChange={(v) => setValue('gender', v)}>
                  <SelectTrigger className="h-[42px]"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>{['Male', 'Female', 'Other'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Marital Status">
                <Select value={watch('maritalStatus')} onValueChange={(v) => setValue('maritalStatus', v)}>
                  <SelectTrigger className="h-[42px]"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>{['Single', 'Married', 'Divorced', 'Widowed'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Blood Group"><FormInput {...register('bloodGroup')} placeholder="e.g. O+" /></Field>
              <Field label="Nationality"><FormInput {...register('nationality')} /></Field>
              <Field label="Father's Name"><FormInput {...register('fatherName')} /></Field>
              <Field label="Mother's Name"><FormInput {...register('motherName')} /></Field>
            </div>
          </FormSection>

          <FormSection icon={UserRound} title="Contact Information" description="Communication details and address.">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Personal Email" error={errors.personalEmail?.message}><FormInput type="email" {...register('personalEmail')} /></Field>
              <Field label="Work Email" error={errors.workEmail?.message} required><FormInput type="email" {...register('workEmail')} /></Field>
              <Field label="Primary Mobile Number" error={errors.primaryMobile?.message} required><FormInput {...register('primaryMobile')} /></Field>
              <Field label="Alternative Mobile Number" error={errors.alternativeMobile?.message}><FormInput {...register('alternativeMobile')} /></Field>
              <Field label="Present Address" className="sm:col-span-2"><FormTextarea {...register('presentAddress')} /></Field>
              <label className="flex items-end gap-2 pb-3 text-sm">
                <Checkbox checked={Boolean(sameAsPresent)} onCheckedChange={(checked) => setValue('sameAsPresent', checked === true)} />
                Same as Present Address
              </label>
              <Field label="Permanent Address"><FormTextarea {...register('permanentAddress')} /></Field>
              <Field label="City"><FormInput {...register('city')} /></Field>
              <Field label="District"><FormInput {...register('district')} /></Field>
              <Field label="Postal Code"><FormInput {...register('postalCode')} /></Field>
              <Field label="Country"><FormInput {...register('country')} /></Field>
            </div>
          </FormSection>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <FormSection icon={FileText} title="Identity Information" description="Optional identity documents — provide only what applies.">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="National ID (NID) Number"><FormInput {...register('nidNumber')} /></Field>
              <Field label="Birth Registration Number"><FormInput {...register('birthRegistrationNumber')} /></Field>
              <Field label="Passport Number"><FormInput {...register('passportNumber')} /></Field>
              <Field label="Passport Expiry Date" error={errors.passportExpiryDate?.message}><FormInput type="date" {...register('passportExpiryDate')} /></Field>
              <Field label="Tax Identification Number (TIN)"><FormInput {...register('tin')} /></Field>
            </div>
          </FormSection>

          <FormSection icon={BriefcaseBusiness} title="Employment Information" description="Employee ID is generated automatically and cannot be changed here.">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Employee ID" required><FormInput value={watch('employeeId') ?? employeeId} readOnly className="bg-muted font-mono" /></Field>
              <Field label="Date of Joining" error={errors.joinDate?.message} required><FormInput type="date" {...register('joinDate')} /></Field>
              <Field label="Department" error={errors.department?.message} required>
                <Select value={watch('department')} onValueChange={(v) => setValue('department', v, { shouldValidate: true })}>
                  <SelectTrigger className="h-[42px]"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Designation" error={errors.designation?.message} required>
                <Select value={watch('designation')} onValueChange={(v) => setValue('designation', v, { shouldValidate: true })}>
                  <SelectTrigger className="h-[42px]"><SelectValue placeholder="Select designation" /></SelectTrigger>
                  <SelectContent>{designations.map((d) => <SelectItem key={d.id} value={d.title}>{d.title}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Employment Type" error={errors.employmentType?.message} required>
                <Select value={watch('employmentType')} onValueChange={(v) => setValue('employmentType', v, { shouldValidate: true })}>
                  <SelectTrigger className="h-[42px]"><SelectValue /></SelectTrigger>
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
                  <SelectTrigger className="h-[42px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{['Active', 'Probation', 'On Leave', 'Inactive'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Work Location"><FormInput {...register('workLocation')} /></Field>
              <Field label="Work Mode">
                <Select value={watch('workMode')} onValueChange={(v) => setValue('workMode', v)}>
                  <SelectTrigger className="h-[42px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{['On-site', 'Remote', 'Hybrid'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Probation Start Date" error={errors.probationStart?.message}><FormInput type="date" {...register('probationStart')} /></Field>
              <Field label="Probation End Date" error={errors.probationEnd?.message}><FormInput type="date" {...register('probationEnd')} /></Field>
              <Field label="Confirmation Date" error={errors.confirmationDate?.message}><FormInput type="date" {...register('confirmationDate')} /></Field>
              <Field label="Contract Start Date" error={errors.contractStart?.message}><FormInput type="date" {...register('contractStart')} /></Field>
              <Field label="Contract End Date" error={errors.contractEnd?.message}><FormInput type="date" {...register('contractEnd')} /></Field>
            </div>
          </FormSection>

          <FormSection icon={BriefcaseBusiness} title="Work Schedule" description="Shift and attendance configuration.">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Assigned Shift">
                <Select value={watch('shift')} onValueChange={(v) => setValue('shift', v)}>
                  <SelectTrigger className="h-[42px]"><SelectValue placeholder="Select shift" /></SelectTrigger>
                  <SelectContent>{shifts.map((s) => <SelectItem key={s.id} value={s.name}>{s.name} ({s.startTime} – {s.endTime})</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Weekly Working Days"><FormInput {...register('weeklyWorkingDays')} placeholder="Mon – Fri" /></Field>
              <Field label="Standard Working Hours"><FormInput {...register('standardHours')} placeholder="8" /></Field>
              <Field label="Attendance Policy">
                <Select value={watch('attendancePolicy')} onValueChange={(v) => setValue('attendancePolicy', v)}>
                  <SelectTrigger className="h-[42px]"><SelectValue placeholder="Select policy" /></SelectTrigger>
                  <SelectContent>{['Standard', 'Flexible', 'Strict', 'Hybrid'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
          </FormSection>
        </div>
      )}

      {step === 2 && (
        <FormSection icon={Wallet} title="Salary & Compensation" description={`Amounts are shown in the selected company currency (${currency}).`}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Salary Type">
              <Select value={watch('salaryType')} onValueChange={(v) => setValue('salaryType', v)}>
                <SelectTrigger className="h-[42px]"><SelectValue /></SelectTrigger>
                <SelectContent>{['Monthly', 'Daily', 'Hourly'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Basic Salary" error={errors.basicSalary?.message} required><FormInput type="number" {...register('basicSalary')} /></Field>
            <Field label="House Rent Allowance" error={errors.hra?.message}><FormInput type="number" {...register('hra')} /></Field>
            <Field label="Medical Allowance" error={errors.medicalAllowance?.message}><FormInput type="number" {...register('medicalAllowance')} /></Field>
            <Field label="Transport Allowance" error={errors.transportAllowance?.message}><FormInput type="number" {...register('transportAllowance')} /></Field>
            <Field label="Other Allowances" error={errors.otherAllowances?.message}><FormInput type="number" {...register('otherAllowances')} /></Field>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/40">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Gross Salary (auto-calculated)</p>
              <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(gross, currency)}</p>
            </div>
            <Field label="Payment Method">
              <Select value={watch('paymentMethod')} onValueChange={(v) => setValue('paymentMethod', v)}>
                <SelectTrigger className="h-[42px]"><SelectValue /></SelectTrigger>
                <SelectContent>{['Bank Transfer', 'Cash', 'Mobile Banking'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Bank Name"><FormInput {...register('bankName')} /></Field>
            <Field label="Branch Name"><FormInput {...register('branchName')} /></Field>
            <Field label="Account Holder Name"><FormInput {...register('accountHolderName')} /></Field>
            <Field label="Account Number"><FormInput type="password" autoComplete="off" {...register('accountNumber')} /></Field>
            <Field label="Routing Number"><FormInput {...register('routingNumber')} /></Field>
            <Field label="Mobile Banking Provider"><FormInput {...register('mobileProvider')} /></Field>
            <Field label="Mobile Banking Account Number"><FormInput type="password" autoComplete="off" {...register('mobileAccountNumber')} /></Field>
          </div>
          <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
            Banking and identity details stay in this browser session only. They are not written to localStorage or saved in demo mode.
          </p>
        </FormSection>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <FormSection icon={GraduationCap} title="Educational Qualifications" description="Add one or more education records.">
            <Repeatable
              fields={educationFields}
              onAdd={() => appendEducation({ degree: '', institution: '', subject: '', passingYear: '', result: '' })}
              onRemove={removeEducation}
              addLabel="Add Qualification"
              render={(_field, index) => (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Qualification / Degree"><FormInput {...register(`education.${index}.degree`)} /></Field>
                  <Field label="Institution Name"><FormInput {...register(`education.${index}.institution`)} /></Field>
                  <Field label="Subject / Major"><FormInput {...register(`education.${index}.subject`)} /></Field>
                  <Field label="Passing Year"><FormInput {...register(`education.${index}.passingYear`)} placeholder="2024" /></Field>
                  <Field label="Result / CGPA"><FormInput {...register(`education.${index}.result`)} /></Field>
                </div>
              )}
            />
          </FormSection>

          <FormSection icon={BriefcaseBusiness} title="Previous Employment" description="Add one or more previous roles.">
            <Repeatable
              fields={experienceFields}
              onAdd={() => appendExperience({ company: '', jobTitle: '', startDate: '', endDate: '', responsibilities: '' })}
              onRemove={removeExperience}
              addLabel="Add Experience"
              render={(_field, index) => (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Company Name"><FormInput {...register(`experience.${index}.company`)} /></Field>
                  <Field label="Job Title"><FormInput {...register(`experience.${index}.jobTitle`)} /></Field>
                  <Field label="Start Date"><FormInput type="date" {...register(`experience.${index}.startDate`)} /></Field>
                  <Field label="End Date"><FormInput type="date" {...register(`experience.${index}.endDate`)} /></Field>
                  <Field label="Responsibilities" className="sm:col-span-2 lg:col-span-3"><FormTextarea {...register(`experience.${index}.responsibilities`)} /></Field>
                </div>
              )}
            />
          </FormSection>

          <FormSection icon={UserRound} title="Emergency Contacts" description="Add one or more people to contact in an emergency.">
            <Repeatable
              fields={contactFields}
              onAdd={() => appendContact({ name: '', relationship: '', phone: '', alternativePhone: '', address: '' })}
              onRemove={removeContact}
              addLabel="Add Emergency Contact"
              render={(_field, index) => (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Contact Person Name"><FormInput {...register(`emergencyContacts.${index}.name`)} /></Field>
                  <Field label="Relationship"><FormInput {...register(`emergencyContacts.${index}.relationship`)} /></Field>
                  <Field label="Phone Number"><FormInput {...register(`emergencyContacts.${index}.phone`)} /></Field>
                  <Field label="Alternative Phone"><FormInput {...register(`emergencyContacts.${index}.alternativePhone`)} /></Field>
                  <Field label="Address" className="sm:col-span-2"><FormInput {...register(`emergencyContacts.${index}.address`)} /></Field>
                </div>
              )}
            />
          </FormSection>

          <FormSection icon={FileText} title="Employee Documents" description="Images and PDFs up to 5 MB per file. Files are previewed locally.">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <FileField label="NID Copy" name="nidCopy" value={watch('nidCopy')} types={DOC_TYPES} onChange={(file) => handleFile('nidCopy', file, DOC_TYPES)} />
              <FileField label="Birth Certificate" name="birthCertificate" value={watch('birthCertificate')} types={DOC_TYPES} onChange={(file) => handleFile('birthCertificate', file, DOC_TYPES)} />
              <FileField label="Passport Copy" name="passportCopy" value={watch('passportCopy')} types={DOC_TYPES} onChange={(file) => handleFile('passportCopy', file, DOC_TYPES)} />
              <FileField label="Resume / CV" name="resume" value={watch('resume')} types={DOC_TYPES} onChange={(file) => handleFile('resume', file, DOC_TYPES)} />
              <FileField label="Educational Certificates" name="educationalCertificates" value={watch('educationalCertificates')} types={DOC_TYPES} onChange={(file) => handleFile('educationalCertificates', file, DOC_TYPES)} />
              <FileField label="Experience Certificates" name="experienceCertificates" value={watch('experienceCertificates')} types={DOC_TYPES} onChange={(file) => handleFile('experienceCertificates', file, DOC_TYPES)} />
              <FileField label="Appointment Letter" name="appointmentLetter" value={watch('appointmentLetter')} types={DOC_TYPES} onChange={(file) => handleFile('appointmentLetter', file, DOC_TYPES)} />
              <FileField label="Other Documents" name="otherDocuments" value={watch('otherDocuments')} types={DOC_TYPES} onChange={(file) => handleFile('otherDocuments', file, DOC_TYPES)} />
            </div>
            <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
              Files exist only in frontend demo mode until backend storage is integrated. No file content is persisted.
            </p>
          </FormSection>
        </div>
      )}

      {step === 4 && (
        <FormSection icon={Check} title="Review & Create Employee" description="Confirm the details below before saving.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <Summary label="Employee Name" value={`${watch('firstName') ?? ''} ${watch('lastName') ?? ''}`.trim()} />
            <Summary label="Employee ID" value={watch('employeeId') ?? employeeId} />
            <Summary label="Work Email" value={watch('workEmail') ?? ''} />
            <Summary label="Department" value={watch('department') ?? ''} />
            <Summary label="Designation" value={watch('designation') ?? ''} />
            <Summary label="Reporting Manager" value={watch('manager') || 'No Reporting Manager'} />
            <Summary label="Date of Joining" value={watch('joinDate') ?? ''} />
            <Summary label="Employment Status" value={watch('employmentStatus') ?? ''} />
            <Summary label="Gross Salary" value={formatCurrency(gross, currency)} />
            <Summary label="Education Records" value={`${watch('education')?.length ?? 0}`} />
            <Summary label="Experience Records" value={`${watch('experience')?.length ?? 0}`} />
            <Summary label="Emergency Contacts" value={`${watch('emergencyContacts')?.length ?? 0}`} />
          </div>
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
            Identity and banking details are session-only in this demo. They will not be saved to localStorage.
          </p>
        </FormSection>
      )}

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:-mx-6 sm:flex-row sm:items-center sm:justify-end sm:px-6 lg:-mx-8 lg:px-8">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="button" variant="outline" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button type="button" variant="outline" onClick={goNext} disabled={step === steps.length - 1}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
        <Button type="submit" disabled={step !== steps.length - 1 || isSubmitting}>
          {isSubmitting ? <Save className="h-4 w-4 animate-pulse" /> : submitIcon ?? <Save className="h-4 w-4" />}
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function Stepper({ current, onSelect }: { current: number; onSelect: (index: number) => void }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {steps.map((item, index) => (
          <Fragment key={item.label}>
            <button
              type="button"
              disabled={index > current}
              onClick={() => onSelect(index)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors',
                index === current ? 'text-indigo-600 dark:text-indigo-400' : index < current ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400',
                index > current && 'cursor-not-allowed',
              )}
            >
              <span className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all',
                index < current ? 'bg-emerald-500 text-white' : index === current ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800',
              )}>
                {index < current ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className="whitespace-nowrap text-xs font-semibold sm:text-sm">{item.label}</span>
            </button>
            {index < steps.length - 1 && <span className={cn('hidden h-px flex-1 sm:block', index < current ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700')} />}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

function FormSection({ icon: Icon, title, description, children }: {
  icon: typeof UserRound; title: string; description?: string; children: ReactNode
}) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="space-y-1 p-0 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <div>
            <CardTitle className="text-base text-slate-900 dark:text-slate-100">{title}</CardTitle>
            {description && <CardDescription className="text-[13px] text-slate-500 dark:text-slate-400">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  )
}

function FormInput(props: ComponentProps<typeof Input>) {
  return <Input {...props} className={cn('h-[42px] rounded-lg', props.className)} />
}

function FormTextarea(props: ComponentProps<typeof Textarea>) {
  return <Textarea {...props} className={cn('min-h-[84px] rounded-lg', props.className)} />
}

function Field({ label, error, required, className, children }: {
  label: string; error?: string; required?: boolean; className?: string; children: ReactNode
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-slate-700 dark:text-slate-300">{label}{required && <span className="ml-0.5 text-red-600">*</span>}</Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 truncate font-semibold text-slate-900 dark:text-slate-100">{value || '—'}</p>
    </div>
  )
}

function PhotoUpload({ file, onChange }: { file: File | null | undefined; onChange: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) { setUrl(null); return }
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const selectPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null
    event.target.value = ''
    if (!selected) return
    if (!PHOTO_TYPES.includes(selected.type)) {
      setError('Only JPG, JPEG, PNG or WebP images are allowed')
      return
    }
    if (selected.size > PHOTO_MAX_SIZE) {
      setError('Photo must be 2 MB or smaller')
      return
    }
    setError('')
    onChange(selected)
  }

  const removePhoto = () => {
    setError('')
    onChange(null)
  }

  return (
    <div className="flex flex-col items-center gap-2 sm:col-span-2 lg:col-span-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={file ? 'Replace profile photo' : 'Upload profile photo'}
        className="group relative flex h-[140px] w-[140px] max-w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 transition-all duration-150 hover:border-indigo-300 hover:bg-slate-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
      >
        {url ? (
          <img src={url} alt="Profile photo preview" className="h-full w-full object-cover" />
        ) : (
          <>
            <Camera className="h-14 w-14 text-slate-400 transition-colors group-hover:text-slate-500 dark:text-slate-500" strokeWidth={1.5} />
            <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-transform group-hover:scale-110 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <Plus className="h-4 w-4" />
            </span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_TYPES.join(',')}
        className="sr-only"
        onChange={selectPhoto}
      />
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400" onClick={() => inputRef.current?.click()}>
          {file ? 'Change' : 'Upload'}
        </Button>
        {file && (
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={removePhoto}>
            Remove Photo
          </Button>
        )}
      </div>
      <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">JPG, JPEG, PNG or WebP · max 2 MB</p>
      {error && <p className="text-center text-xs text-red-600">{error}</p>}
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
      {fields.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No records added yet.</p>}
      {fields.map((field, index) => (
        <div key={field.id} className="relative rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Entry {index + 1}</span>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => onRemove(index)}>
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </Button>
          </div>
          {render(field, index)}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={onAdd} className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-900 dark:text-indigo-400">
        <Plus className="h-4 w-4" /> {addLabel}
      </Button>
    </div>
  )
}

function FileField({ label, value, types, onChange }: {
  label: string
  value: File | null | undefined
  types: string[]
  onChange: (file: File | null) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-700 dark:text-slate-300">{label}</Label>
      <Input type="file" accept={types.join(',')} onChange={(event) => onChange(event.target.files?.[0] ?? null)} className="h-auto py-1.5 text-xs" />
      <div className="flex items-center gap-2">
        {value && (
          <>
            <ImageIcon className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate text-xs text-slate-500 dark:text-slate-400">{value.name}</span>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => onChange(null)}>Remove</Button>
          </>
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
