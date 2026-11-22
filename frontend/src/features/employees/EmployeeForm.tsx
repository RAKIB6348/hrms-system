import { Fragment, useEffect, useMemo, useRef, useState, type ChangeEvent, type ComponentProps, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, type FieldErrors } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  FolderUp,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  UserRound,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ManagerSelect } from '@/features/employees/ManagerSelect'
import { useEmployeeStore } from '@/hooks/use-employee-store'
import { useCompanyStore } from '@/hooks/use-company-settings'
import { departments, designations, shifts } from '@/mocks/data'
import { cn, formatCurrency, initials, randomId } from '@/lib/utils'
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
  title: string
  label: string
  icon: typeof UserRound
  fields: (keyof EmployeeFormValues)[]
}

const steps: Step[] = [
  {
    title: 'Personal & Contact Information',
    label: 'Personal & Contact',
    icon: UserRound,
    fields: ['photo', 'firstName', 'middleName', 'lastName', 'dob', 'gender', 'maritalStatus', 'bloodGroup',
      'nationality', 'fatherName', 'motherName', 'personalEmail', 'workEmail', 'primaryMobile',
      'alternativeMobile', 'presentAddress', 'permanentAddress', 'sameAsPresent', 'city', 'district', 'postalCode', 'country'],
  },
  {
    title: 'Employment & Work Information',
    label: 'Employment & Work',
    icon: BriefcaseBusiness,
    fields: ['nidNumber', 'birthRegistrationNumber', 'passportNumber', 'passportExpiryDate', 'tin', 'employeeId',
      'joinDate', 'department', 'designation', 'employmentType', 'managerId', 'manager', 'employmentStatus',
      'workLocation', 'workMode', 'probationStart', 'probationEnd', 'confirmationDate', 'contractStart',
      'contractEnd', 'shift', 'weeklyWorkingDays', 'standardHours', 'attendancePolicy'],
  },
  {
    title: 'Salary & Bank Information',
    label: 'Salary & Bank',
    icon: Wallet,
    fields: ['salaryType', 'basicSalary', 'hra', 'medicalAllowance', 'transportAllowance', 'otherAllowances',
      'grossSalary', 'paymentMethod', 'bankName', 'branchName', 'accountHolderName', 'accountNumber',
      'routingNumber', 'mobileProvider', 'mobileAccountNumber'],
  },
  {
    title: 'Education, Experience & Documents',
    label: 'Education & Docs',
    icon: GraduationCap,
    fields: ['education', 'experience', 'emergencyContacts', 'nidCopy', 'birthCertificate', 'passportCopy',
      'resume', 'educationalCertificates', 'experienceCertificates', 'appointmentLetter', 'otherDocuments'],
  },
  {
    title: 'Review & Create Employee',
    label: 'Review & Create',
    icon: CheckCircle2,
    fields: [],
  },
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

/** Premium SaaS-style step-based employee registration experience. */
export function EmployeeForm({
  employeeId, defaultValues, submitLabel, submittingLabel = 'Saving...', submitIcon,
  onCancel, excludeEmployeeId, onSubmit,
}: EmployeeFormProps) {
  const [step, setStep] = useState(0)
  const currency = useCompanyStore((state) => state.settings.currency) || 'BDT'
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

  // Active step validation error count
  const currentStepHasErrors = steps[step].fields.some((f) => f in errors)

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="w-full space-y-6 pb-28">
      {/* Horizontal Stepper */}
      <Stepper current={step} onSelect={(index) => { if (index <= step) setStep(index) }} />

      {/* STEP 1: Personal & Contact Information */}
      {step === 0 && (
        <div className="space-y-6 animate-fade-in">
          <FormSection
            icon={UserRound}
            title="Personal Information"
            description="Basic personal details, photo, and identity information."
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <PhotoUpload
                file={watch('photo')}
                onChange={(file) => handleFile('photo', file, IMAGE_TYPES)}
              />

              <Field label="First Name" error={errors.firstName?.message} required>
                <FormInput {...register('firstName')} placeholder="e.g. Tanvir" />
              </Field>

              <Field label="Middle Name">
                <FormInput {...register('middleName')} placeholder="e.g. Ahmed" />
              </Field>

              <Field label="Last Name" error={errors.lastName?.message} required>
                <FormInput {...register('lastName')} placeholder="e.g. Hossain" />
              </Field>

              <Field label="Date of Birth" error={errors.dob?.message} required>
                <FormInput type="date" {...register('dob')} />
              </Field>

              <Field label="Gender">
                <Select value={watch('gender') || ''} onValueChange={(v) => setValue('gender', v)}>
                  <SelectTrigger className="h-[42px] rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Male', 'Female', 'Other'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Marital Status">
                <Select value={watch('maritalStatus') || ''} onValueChange={(v) => setValue('maritalStatus', v)}>
                  <SelectTrigger className="h-[42px] rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Single', 'Married', 'Divorced', 'Widowed'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Blood Group">
                <Select value={watch('bloodGroup') || ''} onValueChange={(v) => setValue('bloodGroup', v)}>
                  <SelectTrigger className="h-[42px] rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Nationality">
                <FormInput {...register('nationality')} placeholder="e.g. Bangladeshi" />
              </Field>

              <Field label="Father's Name">
                <FormInput {...register('fatherName')} placeholder="Father's full name" />
              </Field>

              <Field label="Mother's Name">
                <FormInput {...register('motherName')} placeholder="Mother's full name" />
              </Field>
            </div>
          </FormSection>

          <FormSection
            icon={Mail}
            title="Contact Information"
            description="Communication channels, contact numbers, and residential address."
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Personal Email" error={errors.personalEmail?.message}>
                <FormInput type="email" {...register('personalEmail')} placeholder="name@personal.com" />
              </Field>

              <Field label="Work Email" error={errors.workEmail?.message} required>
                <FormInput type="email" {...register('workEmail')} placeholder="name@company.com" />
              </Field>

              <Field label="Primary Mobile Number" error={errors.primaryMobile?.message} required>
                <FormInput {...register('primaryMobile')} placeholder="+880 1712-345678" />
              </Field>

              <Field label="Alternative Mobile Number" error={errors.alternativeMobile?.message}>
                <FormInput {...register('alternativeMobile')} placeholder="+880 1812-345678" />
              </Field>

              <Field label="Present Address" className="sm:col-span-2">
                <FormTextarea {...register('presentAddress')} placeholder="Street address, house/flat number, road..." />
              </Field>

              <div className="flex flex-col justify-end pb-1.5 sm:col-span-2 lg:col-span-1">
                <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 transition-colors">
                  <Checkbox
                    checked={Boolean(sameAsPresent)}
                    onCheckedChange={(checked) => setValue('sameAsPresent', checked === true)}
                    className="data-[state=checked]:bg-[#4F46E5] data-[state=checked]:border-[#4F46E5]"
                  />
                  <span>Same as Present Address</span>
                </label>
              </div>

              <Field label="Permanent Address" className="sm:col-span-2">
                <FormTextarea {...register('permanentAddress')} placeholder="Permanent home address..." />
              </Field>

              <Field label="City">
                <FormInput {...register('city')} placeholder="e.g. Dhaka" />
              </Field>

              <Field label="District">
                <FormInput {...register('district')} placeholder="e.g. Dhaka" />
              </Field>

              <Field label="Postal Code">
                <FormInput {...register('postalCode')} placeholder="e.g. 1212" />
              </Field>

              <Field label="Country">
                <FormInput {...register('country')} placeholder="e.g. Bangladesh" />
              </Field>
            </div>
          </FormSection>
        </div>
      )}

      {/* STEP 2: Employment & Work Information */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <FormSection
            icon={ShieldCheck}
            title="Identity Documents"
            description="Official identification numbers and tax identification records."
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="National ID (NID) Number">
                <FormInput {...register('nidNumber')} placeholder="e.g. 19901234567890123" />
              </Field>

              <Field label="Birth Registration Number">
                <FormInput {...register('birthRegistrationNumber')} placeholder="e.g. 19901234567890123" />
              </Field>

              <Field label="Passport Number">
                <FormInput {...register('passportNumber')} placeholder="e.g. A01234567" />
              </Field>

              <Field label="Passport Expiry Date" error={errors.passportExpiryDate?.message}>
                <FormInput type="date" {...register('passportExpiryDate')} />
              </Field>

              <Field label="Tax Identification Number (TIN)">
                <FormInput {...register('tin')} placeholder="e.g. 123456789012" />
              </Field>
            </div>
          </FormSection>

          <FormSection
            icon={BriefcaseBusiness}
            title="Employment Information"
            description="Role details, departmental assignment, reporting line and work arrangement."
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Employee ID" required hint="Auto-generated">
                <div className="relative">
                  <FormInput
                    value={watch('employeeId') ?? employeeId}
                    readOnly
                    className="bg-slate-100 font-mono font-bold text-[#4F46E5] dark:bg-slate-800 dark:text-indigo-400 cursor-not-allowed"
                  />
                </div>
              </Field>

              <Field label="Date of Joining" error={errors.joinDate?.message} required>
                <FormInput type="date" {...register('joinDate')} />
              </Field>

              <Field label="Department" error={errors.department?.message} required>
                <Select value={watch('department') || ''} onValueChange={(v) => setValue('department', v, { shouldValidate: true })}>
                  <SelectTrigger className="h-[42px] rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Designation" error={errors.designation?.message} required>
                <Select value={watch('designation') || ''} onValueChange={(v) => setValue('designation', v, { shouldValidate: true })}>
                  <SelectTrigger className="h-[42px] rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {designations.map((d) => <SelectItem key={d.id} value={d.title}>{d.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Employment Type" error={errors.employmentType?.message} required>
                <Select value={watch('employmentType') || 'Full-time'} onValueChange={(v) => setValue('employmentType', v, { shouldValidate: true })}>
                  <SelectTrigger className="h-[42px] rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Full-time', 'Part-time', 'Contract', 'Intern'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
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
                <Select value={watch('employmentStatus') || 'Active'} onValueChange={(v) => setValue('employmentStatus', v)}>
                  <SelectTrigger className="h-[42px] rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Active', 'Probation', 'On Leave', 'Inactive'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Work Location">
                <FormInput {...register('workLocation')} placeholder="e.g. Dhaka HQ, Level 4" />
              </Field>

              <Field label="Work Mode">
                <Select value={watch('workMode') || 'On-site'} onValueChange={(v) => setValue('workMode', v)}>
                  <SelectTrigger className="h-[42px] rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
                    <SelectValue placeholder="Select work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {['On-site', 'Remote', 'Hybrid'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Probation Start Date" error={errors.probationStart?.message}>
                <FormInput type="date" {...register('probationStart')} />
              </Field>

              <Field label="Probation End Date" error={errors.probationEnd?.message}>
                <FormInput type="date" {...register('probationEnd')} />
              </Field>

              <Field label="Confirmation Date" error={errors.confirmationDate?.message}>
                <FormInput type="date" {...register('confirmationDate')} />
              </Field>

              <Field label="Contract Start Date" error={errors.contractStart?.message}>
                <FormInput type="date" {...register('contractStart')} />
              </Field>

              <Field label="Contract End Date" error={errors.contractEnd?.message}>
                <FormInput type="date" {...register('contractEnd')} />
              </Field>
            </div>
          </FormSection>

          <FormSection
            icon={Clock}
            title="Work Schedule & Attendance"
            description="Shift allocation, working hours, and organizational attendance policy."
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Assigned Shift">
                <Select value={watch('shift') || ''} onValueChange={(v) => setValue('shift', v)}>
                  <SelectTrigger className="h-[42px] rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((s) => <SelectItem key={s.id} value={s.name}>{s.name} ({s.startTime} – {s.endTime})</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Weekly Working Days">
                <FormInput {...register('weeklyWorkingDays')} placeholder="e.g. Sun – Thu" />
              </Field>

              <Field label="Standard Working Hours">
                <FormInput {...register('standardHours')} placeholder="e.g. 8 hours / day" />
              </Field>

              <Field label="Attendance Policy">
                <Select value={watch('attendancePolicy') || ''} onValueChange={(v) => setValue('attendancePolicy', v)}>
                  <SelectTrigger className="h-[42px] rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Standard', 'Flexible', 'Strict', 'Hybrid'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FormSection>
        </div>
      )}

      {/* STEP 3: Salary & Bank Information */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <FormSection
            icon={Wallet}
            title="Salary & Compensation"
            description={`Monthly earnings breakdown and automated salary calculations in ${currency}.`}
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Salary Type">
                <Select value={watch('salaryType') || 'Monthly'} onValueChange={(v) => setValue('salaryType', v)}>
                  <SelectTrigger className="h-[42px] rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
                    <SelectValue placeholder="Select salary type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Monthly', 'Daily', 'Hourly'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Basic Salary" error={errors.basicSalary?.message} required hint={`In ${currency}`}>
                <FormInput type="number" {...register('basicSalary')} placeholder="e.g. 50000" />
              </Field>

              <Field label="House Rent Allowance (HRA)" error={errors.hra?.message} hint={`In ${currency}`}>
                <FormInput type="number" {...register('hra')} placeholder="e.g. 25000" />
              </Field>

              <Field label="Medical Allowance" error={errors.medicalAllowance?.message} hint={`In ${currency}`}>
                <FormInput type="number" {...register('medicalAllowance')} placeholder="e.g. 5000" />
              </Field>

              <Field label="Transport Allowance" error={errors.transportAllowance?.message} hint={`In ${currency}`}>
                <FormInput type="number" {...register('transportAllowance')} placeholder="e.g. 5000" />
              </Field>

              <Field label="Other Allowances" error={errors.otherAllowances?.message} hint={`In ${currency}`}>
                <FormInput type="number" {...register('otherAllowances')} placeholder="e.g. 0" />
              </Field>

              {/* Gross Salary Highlight Card */}
              <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 p-5 shadow-xs dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-teal-950/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#059669] text-white shadow-sm shadow-emerald-600/30">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          Gross Salary
                        </span>
                        <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                          Auto-calculated
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                        Basic Salary + HRA + Medical + Transport + Other Allowances
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 dark:text-emerald-300 tracking-tight">
                      {formatCurrency(gross, currency)}
                    </p>
                    <p className="text-[11px] font-semibold text-emerald-700/70 dark:text-emerald-400/70">
                      Per month in {currency}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={Landmark}
            title="Payment & Banking Details"
            description="Salary disbursement mechanism, account numbers, and routing information."
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Payment Method">
                <Select value={watch('paymentMethod') || 'Bank Transfer'} onValueChange={(v) => setValue('paymentMethod', v)}>
                  <SelectTrigger className="h-[42px] rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Bank Transfer', 'Cash', 'Mobile Banking'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Bank Name">
                <FormInput {...register('bankName')} placeholder="e.g. BRAC Bank Limited" />
              </Field>

              <Field label="Branch Name">
                <FormInput {...register('branchName')} placeholder="e.g. Gulshan Branch" />
              </Field>

              <Field label="Account Holder Name">
                <FormInput {...register('accountHolderName')} placeholder="Name as per bank account" />
              </Field>

              <Field label="Account Number">
                <FormInput type="password" autoComplete="off" {...register('accountNumber')} placeholder="••••••••••••" />
              </Field>

              <Field label="Routing Number">
                <FormInput {...register('routingNumber')} placeholder="e.g. 060261234" />
              </Field>

              <Field label="Mobile Banking Provider">
                <FormInput {...register('mobileProvider')} placeholder="e.g. bKash, Nagad, Rocket" />
              </Field>

              <Field label="Mobile Banking Account Number">
                <FormInput type="password" autoComplete="off" {...register('mobileAccountNumber')} placeholder="••••••••••••" />
              </Field>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
              Banking and financial details remain session-only in this frontend demonstration. They are not persisted to permanent storage.
            </div>
          </FormSection>
        </div>
      )}

      {/* STEP 4: Education, Experience & Documents */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <FormSection
            icon={GraduationCap}
            title="Educational Qualifications"
            description="Academic degrees, diplomas, educational institutions, and scores."
          >
            <Repeatable
              fields={educationFields}
              onAdd={() => appendEducation({ degree: '', institution: '', subject: '', passingYear: '', result: '' })}
              onRemove={removeEducation}
              addLabel="Add Qualification"
              itemTitle={(idx) => `Qualification #${idx + 1}`}
              render={(_field, index) => (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Degree / Qualification">
                    <FormInput {...register(`education.${index}.degree`)} placeholder="e.g. Bachelor of Science" />
                  </Field>
                  <Field label="Institution Name">
                    <FormInput {...register(`education.${index}.institution`)} placeholder="e.g. University of Dhaka" />
                  </Field>
                  <Field label="Subject / Major">
                    <FormInput {...register(`education.${index}.subject`)} placeholder="e.g. Computer Science" />
                  </Field>
                  <Field label="Passing Year">
                    <FormInput {...register(`education.${index}.passingYear`)} placeholder="e.g. 2022" />
                  </Field>
                  <Field label="Result / CGPA / Grade">
                    <FormInput {...register(`education.${index}.result`)} placeholder="e.g. 3.85 / 4.00" />
                  </Field>
                </div>
              )}
            />
          </FormSection>

          <FormSection
            icon={Building2}
            title="Previous Employment History"
            description="Past job experience, organizations, roles held, and tenure."
          >
            <Repeatable
              fields={experienceFields}
              onAdd={() => appendExperience({ company: '', jobTitle: '', startDate: '', endDate: '', responsibilities: '' })}
              onRemove={removeExperience}
              addLabel="Add Employment Record"
              itemTitle={(idx) => `Employment #${idx + 1}`}
              render={(_field, index) => (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Company Name">
                    <FormInput {...register(`experience.${index}.company`)} placeholder="e.g. TechCorp Solutions" />
                  </Field>
                  <Field label="Job Title / Role">
                    <FormInput {...register(`experience.${index}.jobTitle`)} placeholder="e.g. Software Engineer" />
                  </Field>
                  <Field label="Start Date">
                    <FormInput type="date" {...register(`experience.${index}.startDate`)} />
                  </Field>
                  <Field label="End Date">
                    <FormInput type="date" {...register(`experience.${index}.endDate`)} />
                  </Field>
                  <Field label="Responsibilities & Achievements" className="sm:col-span-2 lg:col-span-3">
                    <FormTextarea
                      {...register(`experience.${index}.responsibilities`)}
                      placeholder="Summary of primary roles, key projects, and responsibilities handled..."
                    />
                  </Field>
                </div>
              )}
            />
          </FormSection>

          <FormSection
            icon={HeartHandshake}
            title="Emergency Contacts"
            description="Primary individuals to contact immediately in case of an emergency."
          >
            <Repeatable
              fields={contactFields}
              onAdd={() => appendContact({ name: '', relationship: '', phone: '', alternativePhone: '', address: '' })}
              onRemove={removeContact}
              addLabel="Add Emergency Contact"
              itemTitle={(idx) => `Emergency Contact #${idx + 1}`}
              render={(_field, index) => (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Contact Person Name">
                    <FormInput {...register(`emergencyContacts.${index}.name`)} placeholder="Full name" />
                  </Field>
                  <Field label="Relationship">
                    <FormInput {...register(`emergencyContacts.${index}.relationship`)} placeholder="e.g. Spouse, Parent, Sibling" />
                  </Field>
                  <Field label="Primary Phone Number">
                    <FormInput {...register(`emergencyContacts.${index}.phone`)} placeholder="+880 1712-345678" />
                  </Field>
                  <Field label="Alternative Phone Number">
                    <FormInput {...register(`emergencyContacts.${index}.alternativePhone`)} placeholder="Optional alternative phone" />
                  </Field>
                  <Field label="Address / Residence" className="sm:col-span-2">
                    <FormInput {...register(`emergencyContacts.${index}.address`)} placeholder="Contact person's residential address" />
                  </Field>
                </div>
              )}
            />
          </FormSection>

          <FormSection
            icon={FolderUp}
            title="Employee Documents"
            description="Upload scanned documents and verification records (JPG, PNG, WebP or PDF, up to 5 MB each)."
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <FileField
                label="National ID (NID) Copy"
                name="nidCopy"
                value={watch('nidCopy')}
                types={DOC_TYPES}
                onChange={(file) => handleFile('nidCopy', file, DOC_TYPES)}
              />
              <FileField
                label="Birth Certificate"
                name="birthCertificate"
                value={watch('birthCertificate')}
                types={DOC_TYPES}
                onChange={(file) => handleFile('birthCertificate', file, DOC_TYPES)}
              />
              <FileField
                label="Passport Copy"
                name="passportCopy"
                value={watch('passportCopy')}
                types={DOC_TYPES}
                onChange={(file) => handleFile('passportCopy', file, DOC_TYPES)}
              />
              <FileField
                label="Resume / Curriculum Vitae"
                name="resume"
                value={watch('resume')}
                types={DOC_TYPES}
                onChange={(file) => handleFile('resume', file, DOC_TYPES)}
              />
              <FileField
                label="Educational Certificates"
                name="educationalCertificates"
                value={watch('educationalCertificates')}
                types={DOC_TYPES}
                onChange={(file) => handleFile('educationalCertificates', file, DOC_TYPES)}
              />
              <FileField
                label="Experience Certificates"
                name="experienceCertificates"
                value={watch('experienceCertificates')}
                types={DOC_TYPES}
                onChange={(file) => handleFile('experienceCertificates', file, DOC_TYPES)}
              />
              <FileField
                label="Appointment / Offer Letter"
                name="appointmentLetter"
                value={watch('appointmentLetter')}
                types={DOC_TYPES}
                onChange={(file) => handleFile('appointmentLetter', file, DOC_TYPES)}
              />
              <FileField
                label="Other Supporting Documents"
                name="otherDocuments"
                value={watch('otherDocuments')}
                types={DOC_TYPES}
                onChange={(file) => handleFile('otherDocuments', file, DOC_TYPES)}
              />
            </div>
            <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
              Files are held in the browser session in demo mode. Document contents are not uploaded to external servers.
            </p>
          </FormSection>
        </div>
      )}

      {/* STEP 5: Review & Create Employee */}
      {step === 4 && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Profile Summary Banner */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-50 border-2 border-indigo-200 text-[#4F46E5] text-xl font-bold dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400">
                {initials(`${watch('firstName') ?? ''} ${watch('lastName') ?? ''}`) || <UserRound className="h-8 w-8" />}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-slate-100">
                    {`${watch('firstName') ?? ''} ${watch('middleName') ? watch('middleName') + ' ' : ''}${watch('lastName') ?? ''}`.trim() || 'New Employee'}
                  </h3>
                  <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800">
                    {watch('employeeId') ?? employeeId}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                    {watch('employmentStatus') || 'Active'}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {watch('designation') || 'No Designation'} · <span className="text-slate-500">{watch('department') || 'No Department'}</span>
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span>{watch('workEmail') || 'No work email'}</span>
                  <span>•</span>
                  <span>{watch('primaryMobile') || 'No mobile'}</span>
                  <span>•</span>
                  <span>{watch('workLocation') || 'HQ'} ({watch('workMode') || 'On-site'})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Breakdown Review */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* 1. Personal & Contact Review */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <UserRound className="h-4 w-4 text-[#4F46E5] dark:text-indigo-400" />
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-slate-100">Personal & Contact</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <SummaryItem label="Full Name" value={`${watch('firstName') ?? ''} ${watch('lastName') ?? ''}`.trim()} />
                <SummaryItem label="Date of Birth" value={watch('dob')} />
                <SummaryItem label="Gender" value={watch('gender')} />
                <SummaryItem label="Marital Status" value={watch('maritalStatus')} />
                <SummaryItem label="Blood Group" value={watch('bloodGroup')} />
                <SummaryItem label="Nationality" value={watch('nationality')} />
                <SummaryItem label="Work Email" value={watch('workEmail')} />
                <SummaryItem label="Primary Mobile" value={watch('primaryMobile')} />
                <SummaryItem label="Present Address" value={watch('presentAddress')} />
                <SummaryItem label="City & Country" value={[watch('city'), watch('country')].filter(Boolean).join(', ')} />
              </div>
            </div>

            {/* 2. Employment & Schedule Review */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <BriefcaseBusiness className="h-4 w-4 text-[#4F46E5] dark:text-indigo-400" />
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-slate-100">Employment & Schedule</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <SummaryItem label="Department" value={watch('department')} />
                <SummaryItem label="Designation" value={watch('designation')} />
                <SummaryItem label="Employment Type" value={watch('employmentType')} />
                <SummaryItem label="Date of Joining" value={watch('joinDate')} />
                <SummaryItem label="Reporting Manager" value={watch('manager') || 'None'} />
                <SummaryItem label="Work Mode" value={watch('workMode')} />
                <SummaryItem label="Work Location" value={watch('workLocation')} />
                <SummaryItem label="Assigned Shift" value={watch('shift')} />
                <SummaryItem label="Weekly Working Days" value={watch('weeklyWorkingDays')} />
                <SummaryItem label="Standard Hours" value={watch('standardHours')} />
              </div>
            </div>

            {/* 3. Salary & Banking Review */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Wallet className="h-4 w-4 text-[#4F46E5] dark:text-indigo-400" />
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-slate-100">Compensation & Banking</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <SummaryItem label="Salary Type" value={watch('salaryType')} />
                <SummaryItem label="Basic Salary" value={formatCurrency(Number(watch('basicSalary') || 0), currency)} />
                <SummaryItem label="House Rent (HRA)" value={formatCurrency(Number(watch('hra') || 0), currency)} />
                <SummaryItem label="Medical Allowance" value={formatCurrency(Number(watch('medicalAllowance') || 0), currency)} />
                <SummaryItem
                  label="Monthly Gross Salary"
                  value={formatCurrency(gross, currency)}
                  highlight
                />
                <SummaryItem label="Payment Method" value={watch('paymentMethod')} />
                <SummaryItem label="Bank Name" value={watch('bankName')} />
                <SummaryItem label="Account Holder" value={watch('accountHolderName')} />
              </div>
            </div>

            {/* 4. Records & Documents Review */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FolderUp className="h-4 w-4 text-[#4F46E5] dark:text-indigo-400" />
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-slate-100">Records & Documents</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <SummaryItem label="Qualifications Added" value={`${watch('education')?.length ?? 0} record(s)`} />
                <SummaryItem label="Previous Roles Added" value={`${watch('experience')?.length ?? 0} record(s)`} />
                <SummaryItem label="Emergency Contacts" value={`${watch('emergencyContacts')?.length ?? 0} contact(s)`} />
                <SummaryItem
                  label="Documents Attached"
                  value={`${[
                    watch('nidCopy'), watch('birthCertificate'), watch('passportCopy'), watch('resume'),
                    watch('educationalCertificates'), watch('experienceCertificates'), watch('appointmentLetter'), watch('otherDocuments'),
                  ].filter(Boolean).length} document(s)`}
                />
                <SummaryItem label="National ID (NID)" value={watch('nidNumber') || 'Not provided'} />
                <SummaryItem label="Tax ID (TIN)" value={watch('tin') || 'Not provided'} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p>
              Please verify all details carefully before submitting. In this frontend demo, employee records are added to your local session store.
            </p>
          </div>
        </div>
      )}

      {/* Sticky Action Footer */}
      <div className="sticky bottom-0 z-30 rounded-xl border border-[#E2E8F0] bg-white/95 px-4 sm:px-6 py-3.5 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Step {step + 1} of {steps.length}:
            </span>
            <span className="text-slate-500 dark:text-slate-400 truncate font-medium">
              {steps[step].title}
            </span>
            {currentStepHasErrors && (
              <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#DC2626]">
                <AlertCircle className="h-3.5 w-3.5" /> Check errors
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="h-[42px] px-4 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep((current) => Math.max(0, current - 1))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              disabled={step === 0}
              className="h-[42px] px-4 rounded-lg text-xs font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>

            {step < steps.length - 1 ? (
              <Button
                type="button"
                onClick={goNext}
                className="h-[42px] px-5 rounded-lg text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm shadow-indigo-500/20 transition-all"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-[42px] px-6 rounded-lg text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/25 transition-all"
              >
                {isSubmitting ? (
                  <Save className="h-4 w-4 mr-1.5 animate-pulse" />
                ) : (
                  submitIcon ?? <Save className="h-4 w-4 mr-1.5" />
                )}
                {isSubmitting ? submittingLabel : submitLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}

/** Horizontal Stepper with responsive mobile mode */
function Stepper({ current, onSelect }: { current: number; onSelect: (index: number) => void }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-3.5 sm:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Desktop & Tablet Stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((item, index) => {
          const isCompleted = index < current
          const isActive = index === current
          const isClickable = index <= current

          return (
            <Fragment key={item.label}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onSelect(index)}
                className={cn(
                  'group flex items-center gap-3 text-left transition-all rounded-lg p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50',
                  isClickable ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60' : 'cursor-not-allowed opacity-60',
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200',
                    isCompleted && 'bg-[#059669] text-white shadow-sm',
                    isActive && 'bg-[#4F46E5] text-white ring-4 ring-indigo-100 dark:ring-indigo-950/60 shadow-md shadow-indigo-500/20',
                    !isCompleted && !isActive && 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400',
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[2.5]" /> : index + 1}
                </div>
                <div className="min-w-0">
                  <p className={cn(
                    'text-[10px] font-semibold uppercase tracking-wider',
                    isActive ? 'text-[#4F46E5] dark:text-indigo-400 font-bold' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500',
                  )}>
                    Step {index + 1}
                  </p>
                  <p className={cn(
                    'text-xs font-semibold truncate',
                    isActive ? 'text-[#0F172A] dark:text-slate-100 font-bold' : isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500',
                  )}>
                    {item.label}
                  </p>
                </div>
              </button>

              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-3 h-0.5 relative bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      index < current ? 'w-full bg-[#059669]' : 'w-0',
                    )}
                  />
                </div>
              )}
            </Fragment>
          )
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4F46E5] text-xs font-bold text-white shadow-sm">
              {current + 1}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4F46E5] dark:text-indigo-400">
                Step {current + 1} of {steps.length}
              </p>
              <p className="text-sm font-bold text-[#0F172A] dark:text-slate-100">
                {steps[current].title}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {Math.round(((current + 1) / steps.length) * 100)}%
          </span>
        </div>
        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-[#4F46E5] transition-all duration-300 rounded-full"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>
        {/* Step dots */}
        <div className="flex justify-between items-center pt-1">
          {steps.map((item, idx) => (
            <button
              key={item.label}
              type="button"
              disabled={idx > current}
              onClick={() => onSelect(idx)}
              className={cn(
                'flex items-center gap-1 text-[11px] font-medium transition-colors',
                idx === current ? 'text-[#4F46E5] font-semibold dark:text-indigo-400' : idx < current ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400',
              )}
            >
              <span className={cn(
                'inline-block h-2 w-2 rounded-full',
                idx < current ? 'bg-emerald-500' : idx === current ? 'bg-[#4F46E5] ring-2 ring-indigo-200' : 'bg-slate-300 dark:bg-slate-700',
              )} />
              <span>Step {idx + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Form Section Card matching 12px radius, #E2E8F0 border, 24px padding */
function FormSection({
  icon: Icon,
  title,
  description,
  badge,
  children,
}: {
  icon: any
  title: string
  description?: string
  badge?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#4F46E5] ring-1 ring-indigo-500/10 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Icon className="h-5 w-5 stroke-[1.75]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-slate-100 leading-snug">
              {title}
            </h2>
            {description && (
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
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
        'h-[42px] rounded-lg border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors',
        'hover:border-slate-300 focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-indigo-500/20',
        'dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:focus-visible:border-indigo-500',
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
        'min-h-[92px] rounded-lg border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors leading-relaxed',
        'hover:border-slate-300 focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-indigo-500/20',
        'dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:focus-visible:border-indigo-500',
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
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required && <span className="ml-1 text-[#DC2626] font-semibold">*</span>}
        </Label>
        {hint && <span className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="text-xs font-medium text-[#DC2626] flex items-center gap-1 mt-1 animate-fade-in">
          <span className="inline-block h-1 w-1 rounded-full bg-[#DC2626]" />
          {error}
        </p>
      )}
    </div>
  )
}

function SummaryItem({ label, value, highlight }: { label: string; value?: string | number | null; highlight?: boolean }) {
  return (
    <div className={cn(
      'rounded-lg p-3 transition-colors',
      highlight
        ? 'border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/40 dark:bg-indigo-950/20'
        : 'border border-slate-100 bg-slate-50/60 dark:border-slate-800/60 dark:bg-slate-900/40',
    )}>
      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className={cn(
        'mt-0.5 truncate text-xs sm:text-sm font-semibold',
        highlight ? 'text-[#4F46E5] dark:text-indigo-400 font-bold' : 'text-[#0F172A] dark:text-slate-100',
      )}>
        {value || '—'}
      </p>
    </div>
  )
}

/** Professional Profile Photo Upload with circular preview */
function PhotoUpload({
  file,
  onChange,
}: {
  file: File | null | undefined
  onChange: (file: File | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setUrl(null)
      return
    }
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
    <div className="col-span-full mb-1 flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30">
      <div className="relative group shrink-0">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={file ? 'Replace profile photo' : 'Upload profile photo'}
          className={cn(
            'relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
            file
              ? 'border-indigo-500/40 bg-slate-100 shadow-sm'
              : 'border-slate-300 bg-white hover:border-[#4F46E5] hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500',
          )}
        >
          {url ? (
            <>
              <img src={url} alt="Profile preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-[1px]">
                <Camera className="h-5 w-5 mb-0.5" />
                <span className="text-[10px] font-semibold">Change</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 transition-colors group-hover:text-[#4F46E5] dark:text-slate-500 dark:group-hover:text-indigo-400">
              <UserRound className="h-10 w-10 stroke-[1.25]" />
              <span className="text-[10px] font-medium mt-1">Add Photo</span>
            </div>
          )}
        </button>
        {file && (
          <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#059669] text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_TYPES.join(',')}
        className="sr-only"
        onChange={selectPhoto}
      />

      <div className="flex-1 text-center sm:text-left space-y-2">
        <div>
          <h4 className="text-sm font-semibold text-[#0F172A] dark:text-slate-100">
            Profile Photo
          </h4>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Upload a clear headshot photograph for the employee's ID badge and profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-lg text-xs font-medium text-[#4F46E5] hover:bg-indigo-50 border-indigo-200 hover:text-indigo-700 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-3.5 w-3.5 mr-1.5" />
            {file ? 'Change Photo' : 'Upload Photo'}
          </Button>

          {file && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg text-xs font-medium text-[#DC2626] hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
              onClick={removePhoto}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Remove
            </Button>
          )}
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Supported formats: JPG, JPEG, PNG, WebP · Maximum file size: 2 MB
        </p>

        {error && (
          <p className="text-xs font-medium text-[#DC2626] flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="inline-block h-1 w-1 rounded-full bg-[#DC2626]" />
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

/** Repeatable Section with compact entry cards */
function Repeatable<T extends { id: string }>({
  fields,
  onAdd,
  onRemove,
  addLabel,
  itemTitle,
  render,
}: {
  fields: T[]
  onAdd: () => void
  onRemove: (index: number) => void
  addLabel: string
  itemTitle: (index: number) => string
  render: (field: T, index: number) => ReactNode
}) {
  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 px-4 text-center dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            No entries added yet.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Click the button below to add your first record.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative rounded-xl border border-[#E2E8F0] bg-slate-50/50 p-4 sm:p-5 shadow-xs transition-all dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className="mb-4 flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-400">
                    {index + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-slate-200">
                    {itemTitle(index)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-xs font-medium text-[#DC2626] hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                </Button>
              </div>
              {render(field, index)}
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAdd}
        className="h-9 rounded-lg border-dashed border-indigo-300 text-xs font-semibold text-[#4F46E5] hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-400 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
      >
        <Plus className="h-4 w-4 mr-1.5" /> {addLabel}
      </Button>
    </div>
  )
}

/** File upload card field */
function FileField({
  label,
  value,
  types,
  onChange,
}: {
  label: string
  name: string
  value: File | null | undefined
  types: string[]
  onChange: (file: File | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept={types.join(',')}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />

      {value ? (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#4F46E5] text-white">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                {value.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {(value.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-[#DC2626] hover:bg-red-100/60 dark:hover:bg-red-950/40"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = ''
              onChange(null)
            }}
            title="Remove document"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-[42px] w-full items-center justify-between rounded-lg border border-dashed border-slate-300 bg-white px-3 text-xs text-slate-600 transition-colors hover:border-[#4F46E5] hover:bg-indigo-50/20 hover:text-[#4F46E5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-indigo-500"
        >
          <span className="flex items-center gap-2 truncate">
            <FolderUp className="h-4 w-4 text-slate-400" />
            <span className="truncate">Choose file (PDF, PNG, JPG)</span>
          </span>
          <span className="shrink-0 text-[11px] font-semibold text-[#4F46E5] dark:text-indigo-400">
            Browse
          </span>
        </button>
      )}
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
