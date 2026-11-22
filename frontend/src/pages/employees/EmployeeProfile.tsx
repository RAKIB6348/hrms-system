import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Cake,
  CalendarDays,
  Camera,
  Check,
  Clock,
  Download,
  Eye,
  FileText,
  FolderUp,
  HeartHandshake,
  Layers,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  Share2,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  Wallet,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { attendanceRecords, departments, designations, shifts } from '@/mocks/data'
import { useEmployeeStore } from '@/hooks/use-employee-store'
import { cn, formatCurrency, formatDate, initials } from '@/lib/utils'
import type { Employee, EmergencyContact } from '@/types'

const locations = ['New York', 'London', 'Bengaluru', 'Remote', 'Austin', 'Singapore']
const employmentTypes: Employee['employmentType'][] = ['Full-time', 'Part-time', 'Contract', 'Intern']
const workModes = ['On-site', 'Hybrid', 'Remote']
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed']
const genders: ('Male' | 'Female' | 'Other')[] = ['Male', 'Female', 'Other']
const attendancePolicies = [
  'Standard 9-to-6 Policy',
  'Flexible 8-Hour Daily Window',
  'Strict Shift-Based Biometric Punch',
  'Remote Trust-Based Logging',
]

interface ProfileDocument {
  id: string
  name: string
  type: string
  size: string
  date: string
}

function getTabTitle(tabKey: string): string {
  switch (tabKey) {
    case 'overview':
      return 'Overview'
    case 'personal':
      return 'Personal Details'
    case 'registration':
      return 'Registration Details'
    case 'documents':
      return 'Documents'
    case 'attendance':
      return 'Attendance'
    default:
      return 'Profile'
  }
}

export default function EmployeeProfile() {
  const { id } = useParams()
  const allEmployees = useEmployeeStore((state) => state.employees)
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee)

  // Current active tab
  const [tab, setTab] = useState('overview')

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editTab, setEditTab] = useState<string | null>(null)

  // Tab switching confirm dialog
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [pendingTab, setPendingTab] = useState<string | null>(null)

  // Documents state
  const [documents, setDocuments] = useState<ProfileDocument[]>([
    { id: 'doc-1', name: 'Executive Employment Contract', type: 'PDF', size: '2.4 MB', date: '2023-06-01' },
    { id: 'doc-2', name: 'Identity & Citizenship Verification', type: 'PDF', size: '1.2 MB', date: '2023-06-01' },
    { id: 'doc-3', name: 'Federal W-4 Tax Declaration', type: 'PDF', size: '850 KB', date: '2024-01-15' },
    { id: 'doc-4', name: 'Official Offer & Compensation Plan', type: 'PDF', size: '1.8 MB', date: '2023-05-18' },
  ])
  const [previewDoc, setPreviewDoc] = useState<ProfileDocument | null>(null)
  const [deletingDoc, setDeletingDoc] = useState<ProfileDocument | null>(null)
  const [replacingDocId, setReplacingDocId] = useState<string | null>(null)

  // Photo upload
  const photoInputRef = useRef<HTMLInputElement>(null)
  const docUploadInputRef = useRef<HTMLInputElement>(null)
  const docReplaceInputRef = useRef<HTMLInputElement>(null)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  // Resolve current employee (defaults to Meera Nair, 'emp-6')
  const employee = useMemo(() => {
    if (id) {
      return allEmployees.find((e) => e.id === id)
    }
    return (
      allEmployees.find((e) => e.email === 'meera.nair@peopleflow.io') ||
      allEmployees.find((e) => e.id === 'emp-6') ||
      allEmployees[0]
    )
  }, [allEmployees, id])

  // Working copy form values
  const [formValues, setFormValues] = useState<Partial<Employee>>({})
  const [initialValues, setInitialValues] = useState<Partial<Employee>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Attendance editable preferences
  const [attendancePrefs, setAttendancePrefs] = useState({
    shift: employee?.shift || 'General Shift',
    policy: employee?.attendancePolicy || 'Standard 9-to-6 Policy',
    workMode: employee?.workMode || 'Hybrid',
    dailyReminder: true,
  })
  const [initialAttendancePrefs, setInitialAttendancePrefs] = useState({ ...attendancePrefs })

  if (!employee) {
    return (
      <EmptyState
        icon={UserRound}
        title="Employee not found"
        description="This employee record does not exist in the demo data."
        actionLabel="Back to employees"
        onAction={() => window.history.back()}
      />
    )
  }

  const isCurrentUser = !id || employee.email === 'meera.nair@peopleflow.io' || employee.id === 'emp-6'
  const name = `${employee.firstName} ${employee.lastName}`
  const attendance = attendanceRecords.filter((a) => a.employeeId === employee.id)

  // Start inline editing on a target tab
  const startEdit = (targetTab?: string) => {
    const tabToEdit = targetTab || (tab === 'overview' ? 'personal' : tab)
    if (tab !== tabToEdit) {
      setTab(tabToEdit)
    }

    const currentData: Partial<Employee> = {
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName ?? '',
      dob: employee.dob,
      gender: employee.gender,
      phone: employee.phone,
      personalEmail: employee.personalEmail ?? '',
      email: employee.email,
      address: employee.address ?? '',
      presentAddress: employee.presentAddress ?? employee.address ?? '',
      permanentAddress: employee.permanentAddress ?? '',
      city: employee.city ?? '',
      district: employee.district ?? '',
      postalCode: employee.postalCode ?? '',
      country: employee.country ?? '',
      maritalStatus: employee.maritalStatus ?? 'Single',
      bloodGroup: employee.bloodGroup ?? 'O+',
      nationality: employee.nationality ?? 'American',
      fatherName: employee.fatherName ?? '',
      motherName: employee.motherName ?? '',
      nidNumber: employee.nidNumber ?? '',
      passportNumber: employee.passportNumber ?? '',
      tin: employee.tin ?? '',
      department: employee.department,
      designation: employee.designation,
      location: employee.location,
      employmentType: employee.employmentType,
      manager: employee.manager,
      joinDate: employee.joinDate,
      workMode: employee.workMode ?? 'Hybrid',
      shift: employee.shift ?? 'General Shift',
      weeklyWorkingDays: employee.weeklyWorkingDays ?? 'Mon – Fri (5 days)',
      status: employee.status,
      emergencyContacts: employee.emergencyContacts?.length
        ? [...employee.emergencyContacts]
        : [
            {
              name: 'Sanjay Nair',
              relationship: 'Spouse',
              phone: '+1 (555) 234-8901',
              alternativePhone: '+1 (555) 234-8902',
              address: employee.address || '100 Market St, New York',
            },
          ],
    }

    setFormValues(currentData)
    setInitialValues(currentData)
    setAttendancePrefs({
      shift: employee.shift || 'General Shift',
      policy: employee.attendancePolicy || 'Standard 9-to-6 Policy',
      workMode: employee.workMode || 'Hybrid',
      dailyReminder: true,
    })
    setInitialAttendancePrefs({
      shift: employee.shift || 'General Shift',
      policy: employee.attendancePolicy || 'Standard 9-to-6 Policy',
      workMode: employee.workMode || 'Hybrid',
      dailyReminder: true,
    })
    setErrors({})
    setIsEditing(true)
    setEditTab(tabToEdit)
  }

  // Cancel edit mode and restore values
  const cancelEdit = () => {
    setFormValues(initialValues)
    setAttendancePrefs(initialAttendancePrefs)
    setPreviewPhoto(null)
    setErrors({})
    setIsEditing(false)
    setEditTab(null)
    toast.info('Changes discarded')
  }

  // Check if active tab has unsaved changes
  const isDirty = useMemo(() => {
    if (!isEditing) return false
    if (previewPhoto) return true
    if (tab === 'attendance') {
      return JSON.stringify(attendancePrefs) !== JSON.stringify(initialAttendancePrefs)
    }
    return JSON.stringify(formValues) !== JSON.stringify(initialValues)
  }, [isEditing, previewPhoto, tab, attendancePrefs, initialAttendancePrefs, formValues, initialValues])

  // Handle switching tabs with unsaved check
  const handleTabChange = (nextTab: string) => {
    if (isEditing && isDirty) {
      setPendingTab(nextTab)
      setShowDiscardConfirm(true)
    } else {
      if (isEditing) {
        setIsEditing(false)
        setEditTab(null)
        setErrors({})
      }
      setTab(nextTab)
    }
  }

  // Save changes
  const saveChanges = () => {
    const nextErrors: Record<string, string> = {}

    if (tab === 'personal') {
      if (!formValues.firstName?.trim()) nextErrors.firstName = 'First name is required'
      if (!formValues.lastName?.trim()) nextErrors.lastName = 'Last name is required'
      if (!formValues.dob) nextErrors.dob = 'Date of birth is required'
      if (!formValues.phone?.trim()) nextErrors.phone = 'Phone number is required'
      if (formValues.personalEmail && !formValues.personalEmail.includes('@')) {
        nextErrors.personalEmail = 'Valid email is required'
      }
    } else if (tab === 'registration') {
      if (!formValues.department) nextErrors.department = 'Department is required'
      if (!formValues.designation) nextErrors.designation = 'Designation is required'
      if (!formValues.location) nextErrors.location = 'Location is required'
      if (!formValues.joinDate) nextErrors.joinDate = 'Joining date is required'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      toast.error('Please resolve the errors highlighted below')
      return
    }

    // Construct update payload
    const patch: Partial<Employee> = {
      ...formValues,
      ...(previewPhoto ? { photoUrl: previewPhoto } : {}),
    }

    if (tab === 'attendance') {
      patch.shift = attendancePrefs.shift
      patch.attendancePolicy = attendancePrefs.policy
      patch.workMode = attendancePrefs.workMode
    }

    updateEmployee(employee.id, patch)
    setInitialValues(formValues)
    setInitialAttendancePrefs(attendancePrefs)
    setIsEditing(false)
    setEditTab(null)
    setErrors({})
    toast.success(`${getTabTitle(tab)} updated successfully`)
  }

  // Profile photo handling
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewPhoto(url)
      if (!isEditing) {
        updateEmployee(employee.id, { photoUrl: url })
        toast.success('Profile photo updated')
      }
    }
  }

  const removePhoto = () => {
    setPreviewPhoto(null)
    updateEmployee(employee.id, { photoUrl: undefined })
    toast.success('Profile photo removed')
  }

  // Document upload & replacement
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const newDoc: ProfileDocument = {
        id: `doc-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: file.name.split('.').pop()?.toUpperCase() || 'PDF',
        size: `${Math.max(0.1, file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toISOString().split('T')[0]!,
      }
      setDocuments((prev) => [newDoc, ...prev])
      toast.success(`"${newDoc.name}" uploaded successfully`)
    }
    if (docUploadInputRef.current) docUploadInputRef.current.value = ''
  }

  const handleDocReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && replacingDocId) {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === replacingDocId
            ? {
                ...d,
                name: file.name.replace(/\.[^/.]+$/, ''),
                type: file.name.split('.').pop()?.toUpperCase() || 'PDF',
                size: `${Math.max(0.1, file.size / (1024 * 1024)).toFixed(1)} MB`,
                date: new Date().toISOString().split('T')[0]!,
              }
            : d,
        ),
      )
      toast.success('Document replaced successfully')
      setReplacingDocId(null)
    }
    if (docReplaceInputRef.current) docReplaceInputRef.current.value = ''
  }

  // Update nested form value
  const setField = <K extends keyof Employee>(key: K, value: Employee[K]) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key as string]) {
      setErrors((prev) => ({ ...prev, [key as string]: '' }))
    }
  }

  // Update emergency contact field
  const setEmergencyContact = (field: keyof EmergencyContact, value: string) => {
    setFormValues((prev) => {
      const contacts = [...(prev.emergencyContacts || [])]
      if (contacts[0]) {
        contacts[0] = { ...contacts[0], [field]: value }
      } else {
        contacts[0] = {
          name: '',
          relationship: '',
          phone: '',
          alternativePhone: '',
          address: '',
          [field]: value,
        }
      }
      return { ...prev, emergencyContacts: contacts }
    })
  }

  const activePhoto = previewPhoto || employee.photoUrl

  return (
    <div className="space-y-3.5 max-w-7xl mx-auto pb-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 -ml-2 h-7 px-2"
        >
          <Link to={id ? '/employees' : '/dashboard'}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            {id ? 'Back to employee directory' : 'Back to dashboard'}
          </Link>
        </Button>

        {isEditing && (
          <Badge className="bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold px-2.5 py-0.5 shadow-xs flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Editing {getTabTitle(tab)}
          </Badge>
        )}
      </div>

      <DemoNotice compact />

      {/* ======================================================== */}
      {/* PROFILE HEADER CARD (CLEAN WHITE, NO DECORATIVE BANNER)   */}
      {/* ======================================================== */}
      <Card className="border border-slate-200/80 dark:border-slate-800 shadow-2xs rounded-2xl bg-white dark:bg-slate-900">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Avatar & Personal Identity */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Profile Photo */}
              <div className="relative self-start sm:self-center shrink-0">
                <Avatar className="h-20 w-20 sm:h-22 sm:w-22 border border-slate-200/80 dark:border-slate-700 shadow-2xs overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800">
                  {activePhoto ? (
                    <img src={activePhoto} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback
                      className="text-2xl font-bold rounded-2xl"
                      style={{ backgroundColor: employee.avatarColor, color: '#fff' }}
                    >
                      {initials(name)}
                    </AvatarFallback>
                  )}
                </Avatar>

                {/* Camera upload badge */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className={cn(
                        'absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl shadow-md border-2 border-white dark:border-slate-900 transition-all duration-150',
                        isEditing
                          ? 'bg-[#4F46E5] text-white hover:bg-indigo-700 scale-105 ring-2 ring-indigo-500/20'
                          : 'bg-slate-900/90 text-white hover:bg-[#4F46E5] opacity-90 group-hover:opacity-100',
                      )}
                      aria-label="Upload profile photo"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Change profile picture</TooltipContent>
                </Tooltip>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Text block: 100% on card background, zero overlap with dark banner! */}
              <div className="space-y-0.5 pt-1 sm:pt-2">
                {/* Name & Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {name}
                  </h1>
                  <StatusBadge status={employee.status} />
                  {isCurrentUser && (
                    <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800">
                      You (Signed in)
                    </span>
                  )}
                </div>

                {/* Designation & Department */}
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {employee.designation}{' '}
                  <span className="text-slate-400 dark:text-slate-500 font-normal">·</span>{' '}
                  <span className="text-[#4F46E5] dark:text-indigo-400 font-medium">{employee.department}</span>
                </p>

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200/60 dark:border-slate-700/60">
                    {employee.employeeId}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {employee.location}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <BriefcaseBusiness className="h-3 w-3 text-slate-400" />
                    {employee.employmentType}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-slate-400" />
                    {employee.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0 shrink-0 self-start sm:self-center">
              {activePhoto && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removePhoto}
                  className="h-9 px-3 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove Photo
                </Button>
              )}

              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                    className="h-9 px-3.5 rounded-xl font-medium text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4 mr-1 text-slate-500" /> Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={saveChanges}
                    className="h-9 px-4 rounded-xl font-semibold text-xs bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm shadow-indigo-500/25 transition-all"
                  >
                    <Check className="h-4 w-4 mr-1" /> Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={() => startEdit()}
                    className="h-9 px-4 rounded-xl font-semibold text-xs bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm shadow-indigo-500/25 transition-all flex items-center gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit Profile
                  </Button>

                  {isCurrentUser ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => toast.success('Profile summary exported (demo)')}
                      className="h-9 px-3.5 rounded-xl font-medium text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" /> Export CV
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => toast.success(`Message sent to ${name} (demo)`)}
                      className="h-9 px-4 rounded-xl font-semibold text-xs bg-[#0F172A] hover:bg-slate-800 text-white shadow-2xs"
                    >
                      <Mail className="h-3.5 w-3.5 mr-1.5" /> Send message
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================== */}
      {/* 4 REFINED KPI SUMMARY CARDS (COMPACT)                    */}
      {/* ======================================================== */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Role & Team */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Role & Team
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                {employee.designation}
              </p>
              <p className="text-xs text-muted-foreground truncate">{employee.department}</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Work Location & Mode */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Location & Mode
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                {employee.location}
              </p>
              <p className="text-xs text-muted-foreground truncate">{employee.workMode || 'Hybrid'} · Head Office</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Tenure & Joining */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CalendarDays className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Tenure & Joining
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                {formatDate(employee.joinDate, { month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs text-muted-foreground truncate">Joined 3+ years ago</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Reporting Structure */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <UserCheck className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Reports To
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                {employee.manager || 'Executive Management'}
              </p>
              <p className="text-xs text-muted-foreground truncate">Chief Executive Officer</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================== */}
      {/* TABS CONTAINER                                           */}
      {/* ======================================================== */}
      <Tabs value={tab} onValueChange={handleTabChange} className="space-y-3">
        {/* Modern Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-2">
          <TabsList className="w-full justify-start overflow-x-auto sm:w-auto bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <TabsTrigger
              value="overview"
              className="rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#4F46E5] data-[state=active]:font-semibold data-[state=active]:shadow-2xs transition-all"
            >
              <Layers className="h-4 w-4 mr-1.5 shrink-0" /> Overview
            </TabsTrigger>
            <TabsTrigger
              value="personal"
              className="rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#4F46E5] data-[state=active]:font-semibold data-[state=active]:shadow-2xs transition-all"
            >
              <UserRound className="h-4 w-4 mr-1.5 shrink-0" /> Personal Details
            </TabsTrigger>
            <TabsTrigger
              value="registration"
              className="rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#4F46E5] data-[state=active]:font-semibold data-[state=active]:shadow-2xs transition-all"
            >
              <BriefcaseBusiness className="h-4 w-4 mr-1.5 shrink-0" /> Registration Details
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#4F46E5] data-[state=active]:font-semibold data-[state=active]:shadow-2xs transition-all"
            >
              <FileText className="h-4 w-4 mr-1.5 shrink-0" /> Documents
              <span className="ml-1.5 rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                {documents.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#4F46E5] data-[state=active]:font-semibold data-[state=active]:shadow-2xs transition-all"
            >
              <Clock className="h-4 w-4 mr-1.5 shrink-0" /> Attendance
            </TabsTrigger>
          </TabsList>

          {/* Quick Edit button in tab bar */}
          {tab !== 'overview' && !isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => startEdit(tab)}
              className="h-9 px-3.5 rounded-xl text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] border-indigo-200 hover:bg-indigo-50/60 dark:border-indigo-900/60 dark:hover:bg-indigo-950/40 self-start sm:self-auto shadow-2xs"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit {getTabTitle(tab)}
            </Button>
          )}

          {isEditing && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-muted-foreground mr-1">
                {isDirty ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" /> Unsaved changes
                  </span>
                ) : (
                  'No changes'
                )}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelEdit}
                className="h-8 rounded-lg text-xs font-medium"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={saveChanges}
                className="h-8 rounded-lg text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm shadow-indigo-500/20"
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW (READ-ONLY + CLEAN NAVIGATION)           */}
        {/* ======================================================== */}
        <TabsContent value="overview" className="grid gap-5 lg:grid-cols-2 mt-4">
          {/* Contact Information Card */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#4F46E5]" /> Contact Information
                </CardTitle>
                <CardDescription className="text-xs">Direct organizational communication details</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEdit('personal')}
                className="h-8 px-3 rounded-lg text-xs text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-semibold"
              >
                <Pencil className="h-3 w-3" /> Edit in Personal
              </Button>
            </CardHeader>
            <CardContent className="pt-3 divide-y divide-slate-100 dark:divide-slate-800/60">
              <InfoRow icon={Mail} label="Work Email" value={employee.email} />
              <InfoRow icon={Phone} label="Primary Phone" value={employee.phone} />
              <InfoRow icon={MapPin} label="Primary Address" value={employee.address || '100 Market Street, New York'} />
              <InfoRow icon={UserCheck} label="Reports To" value={employee.manager || 'Vikram Rao (CEO)'} />
            </CardContent>
          </Card>

          {/* Employment Details Card */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-[#4F46E5]" /> Employment Overview
                </CardTitle>
                <CardDescription className="text-xs">Schedule, contract status and designation</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEdit('registration')}
                className="h-8 px-3 rounded-lg text-xs text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-semibold"
              >
                <Pencil className="h-3 w-3" /> Edit in Registration
              </Button>
            </CardHeader>
            <CardContent className="pt-3 divide-y divide-slate-100 dark:divide-slate-800/60">
              <InfoRow icon={BriefcaseBusiness} label="Employment Type" value={employee.employmentType} />
              <InfoRow icon={CalendarDays} label="Date of Joining" value={formatDate(employee.joinDate)} />
              <InfoRow icon={Clock} label="Assigned Shift" value={employee.shift || 'General Shift (09:00 - 18:00)'} />
              <InfoRow icon={Building2} label="Department" value={employee.department} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 2: PERSONAL DETAILS (INLINE EDITABLE)                */}
        {/* ======================================================== */}
        <TabsContent value="personal" className="space-y-5 mt-4">
          {isEditing && tab === 'personal' ? (
            /* --- EDIT MODE: PERSONAL DETAILS --- */
            <div className="space-y-5">
              {/* Identity Form Card */}
              <Card className="rounded-2xl border-indigo-200 dark:border-indigo-900/60 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-[#4F46E5]" />
                        Identity & Demographics
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Modify personal profile details and legal naming.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[11px] border-indigo-200 text-[#4F46E5] bg-indigo-50/60 font-semibold">
                      Inline Edit Mode
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      First Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formValues.firstName ?? ''}
                      onChange={(e) => setField('firstName', e.target.value)}
                      placeholder="First name"
                      className={cn(
                        'h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs',
                        errors.firstName && 'border-rose-500 focus-visible:ring-rose-500/20',
                      )}
                    />
                    {errors.firstName && (
                      <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="middleName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Middle Name
                    </Label>
                    <Input
                      id="middleName"
                      value={formValues.middleName ?? ''}
                      onChange={(e) => setField('middleName', e.target.value)}
                      placeholder="Optional"
                      className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Last Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formValues.lastName ?? ''}
                      onChange={(e) => setField('lastName', e.target.value)}
                      placeholder="Last name"
                      className={cn(
                        'h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs',
                        errors.lastName && 'border-rose-500 focus-visible:ring-rose-500/20',
                      )}
                    />
                    {errors.lastName && (
                      <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.lastName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dob" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Date of Birth <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formValues.dob ?? ''}
                      onChange={(e) => setField('dob', e.target.value)}
                      className={cn(
                        'h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs',
                        errors.dob && 'border-rose-500 focus-visible:ring-rose-500/20',
                      )}
                    />
                    {errors.dob && (
                      <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.dob}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="gender" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Gender
                    </Label>
                    <Select
                      value={formValues.gender ?? 'Female'}
                      onValueChange={(val) => setField('gender', val as 'Male' | 'Female' | 'Other')}
                    >
                      <SelectTrigger id="gender" className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="maritalStatus" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Marital Status
                    </Label>
                    <Select
                      value={formValues.maritalStatus ?? 'Single'}
                      onValueChange={(val) => setField('maritalStatus', val)}
                    >
                      <SelectTrigger id="maritalStatus" className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {maritalStatuses.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Communication & Address Form Card */}
              <Card className="rounded-2xl border-indigo-200 dark:border-indigo-900/60 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#4F46E5]" />
                    Contact & Residential Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Primary Mobile Phone <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formValues.phone ?? ''}
                      onChange={(e) => setField('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={cn(
                        'h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs',
                        errors.phone && 'border-rose-500 focus-visible:ring-rose-500/20',
                      )}
                    />
                    {errors.phone && (
                      <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="personalEmail" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Personal Email
                    </Label>
                    <Input
                      id="personalEmail"
                      type="email"
                      value={formValues.personalEmail ?? ''}
                      onChange={(e) => setField('personalEmail', e.target.value)}
                      placeholder="e.g. personal@gmail.com"
                      className={cn(
                        'h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs',
                        errors.personalEmail && 'border-rose-500 focus-visible:ring-rose-500/20',
                      )}
                    />
                    {errors.personalEmail && (
                      <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.personalEmail}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="presentAddress" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Current Residential Address
                    </Label>
                    <Textarea
                      id="presentAddress"
                      rows={2}
                      value={formValues.presentAddress ?? formValues.address ?? ''}
                      onChange={(e) => {
                        setField('presentAddress', e.target.value)
                        setField('address', e.target.value)
                      }}
                      placeholder="Street address, apartment or suite, city, state, zip"
                      className="rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs resize-none"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="permanentAddress" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Permanent Address
                    </Label>
                    <Textarea
                      id="permanentAddress"
                      rows={2}
                      value={formValues.permanentAddress ?? ''}
                      onChange={(e) => setField('permanentAddress', e.target.value)}
                      placeholder="Permanent address (leave blank if same as residential)"
                      className="rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact Card */}
              <Card className="rounded-2xl border-indigo-200 dark:border-indigo-900/60 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-[#4F46E5]" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Primary Contact Person
                    </Label>
                    <Input
                      value={formValues.emergencyContacts?.[0]?.name ?? ''}
                      onChange={(e) => setEmergencyContact('name', e.target.value)}
                      placeholder="e.g. Sanjay Nair"
                      className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Relationship
                    </Label>
                    <Input
                      value={formValues.emergencyContacts?.[0]?.relationship ?? ''}
                      onChange={(e) => setEmergencyContact('relationship', e.target.value)}
                      placeholder="e.g. Spouse, Parent, Sibling"
                      className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Emergency Phone
                    </Label>
                    <Input
                      value={formValues.emergencyContacts?.[0]?.phone ?? ''}
                      onChange={(e) => setEmergencyContact('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Alternative Phone
                    </Label>
                    <Input
                      value={formValues.emergencyContacts?.[0]?.alternativePhone ?? ''}
                      onChange={(e) => setEmergencyContact('alternativePhone', e.target.value)}
                      placeholder="Optional alternative contact phone"
                      className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Floating Action Bar */}
              <div className="sticky bottom-4 z-10 flex items-center justify-between p-3.5 px-5 rounded-2xl bg-[#0F172A]/95 backdrop-blur-md text-white shadow-2xl border border-slate-700">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold">Unsaved edits in Personal Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEdit}
                    className="h-8 rounded-lg text-xs border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveChanges}
                    className="h-8 rounded-lg text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm shadow-indigo-500/20"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Save Changes
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* --- READ-ONLY: PERSONAL DETAILS --- */
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-[#4F46E5]" /> Personal Demographics
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit('personal')}
                    className="h-8 px-3 rounded-lg text-xs text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-semibold"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                </CardHeader>
                <CardContent className="pt-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                  <InfoRow icon={UserRound} label="Legal Full Name" value={name} />
                  <InfoRow icon={Cake} label="Date of Birth" value={formatDate(employee.dob)} />
                  <InfoRow icon={UserRound} label="Gender" value={employee.gender} />
                  <InfoRow icon={UserRound} label="Marital Status" value={employee.maritalStatus ?? 'Single'} />
                  <InfoRow icon={UserRound} label="Blood Group" value={employee.bloodGroup ?? 'O+'} />
                  <InfoRow icon={UserRound} label="Nationality" value={employee.nationality ?? 'American'} />
                </CardContent>
              </Card>

              <div className="space-y-5">
                {/* Contact Card */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
                  <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#4F46E5]" /> Communication & Address
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit('personal')}
                      className="h-8 px-3 rounded-lg text-xs text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-semibold"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                    <InfoRow icon={Phone} label="Primary Mobile" value={employee.phone} />
                    <InfoRow icon={Mail} label="Personal Email" value={employee.personalEmail || employee.email} />
                    <InfoRow icon={MapPin} label="Present Address" value={employee.presentAddress ?? employee.address} />
                    <InfoRow icon={MapPin} label="Permanent Address" value={employee.permanentAddress || 'Same as residential address'} />
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
                  <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <HeartHandshake className="h-4 w-4 text-[#4F46E5]" /> Emergency Contact
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit('personal')}
                      className="h-8 px-3 rounded-lg text-xs text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-semibold"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                    <InfoRow
                      icon={UserRound}
                      label="Contact Person"
                      value={employee.emergencyContacts?.[0]?.name ? `${employee.emergencyContacts[0].name} (${employee.emergencyContacts[0].relationship})` : 'Sanjay Nair (Spouse)'}
                    />
                    <InfoRow
                      icon={Phone}
                      label="Emergency Telephone"
                      value={employee.emergencyContacts?.[0]?.phone || '+1 (555) 234-8901'}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 3: REGISTRATION DETAILS (INLINE EDITABLE)            */}
        {/* ======================================================== */}
        <TabsContent value="registration" className="space-y-5 mt-4">
          {isEditing && tab === 'registration' ? (
            /* --- EDIT MODE: REGISTRATION DETAILS --- */
            <div className="space-y-5">
              <Card className="rounded-2xl border-indigo-200 dark:border-indigo-900/60 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <BriefcaseBusiness className="h-4 w-4 text-[#4F46E5]" />
                        Organizational Structure & Assignment
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Authorized enterprise configuration for department, designation, manager and shift.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[11px] border-emerald-300 text-emerald-700 bg-emerald-50/60 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> HR Authorized
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Immutable ID */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1 text-slate-500">
                      <Lock className="h-3 w-3 text-slate-400" /> Employee ID (System)
                    </Label>
                    <div className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/60 flex items-center justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      <span>{employee.employeeId}</span>
                      <span className="text-[10px] uppercase font-sans text-muted-foreground font-semibold">Locked</span>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Department <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      value={formValues.department ?? employee.department}
                      onValueChange={(val) => setField('department', val)}
                    >
                      <SelectTrigger id="department" className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Designation */}
                  <div className="space-y-1.5">
                    <Label htmlFor="designation" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Designation <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      value={formValues.designation ?? employee.designation}
                      onValueChange={(val) => setField('designation', val)}
                    >
                      <SelectTrigger id="designation" className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs">
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {designations.map((des) => (
                          <SelectItem key={des.id} value={des.title}>
                            {des.title} ({des.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reporting Manager */}
                  <div className="space-y-1.5">
                    <Label htmlFor="manager" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Reporting Manager
                    </Label>
                    <Select
                      value={formValues.manager ?? employee.manager}
                      onValueChange={(val) => setField('manager', val)}
                    >
                      <SelectTrigger id="manager" className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs">
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {allEmployees
                          .filter((e) => e.id !== employee.id)
                          .map((m) => (
                            <SelectItem key={m.id} value={`${m.firstName} ${m.lastName}`}>
                              {m.firstName} {m.lastName} ({m.department})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Work Location */}
                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Work Location <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      value={formValues.location ?? employee.location}
                      onValueChange={(val) => setField('location', val)}
                    >
                      <SelectTrigger id="location" className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Employment Type */}
                  <div className="space-y-1.5">
                    <Label htmlFor="employmentType" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Employment Type
                    </Label>
                    <Select
                      value={formValues.employmentType ?? employee.employmentType}
                      onValueChange={(val) => setField('employmentType', val as Employee['employmentType'])}
                    >
                      <SelectTrigger id="employmentType" className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Work Mode */}
                  <div className="space-y-1.5">
                    <Label htmlFor="workMode" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Work Mode
                    </Label>
                    <Select
                      value={formValues.workMode ?? employee.workMode ?? 'Hybrid'}
                      onValueChange={(val) => setField('workMode', val)}
                    >
                      <SelectTrigger id="workMode" className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs">
                        <SelectValue placeholder="Select work mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {workModes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assigned Shift */}
                  <div className="space-y-1.5">
                    <Label htmlFor="shift" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Assigned Shift
                    </Label>
                    <Select
                      value={formValues.shift ?? employee.shift ?? 'General Shift'}
                      onValueChange={(val) => setField('shift', val)}
                    >
                      <SelectTrigger id="shift" className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs">
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {shifts.map((s) => (
                          <SelectItem key={s.id} value={s.name}>
                            {s.name} ({s.startTime} - {s.endTime})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date of Joining */}
                  <div className="space-y-1.5">
                    <Label htmlFor="joinDate" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Date of Joining <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={formValues.joinDate ?? employee.joinDate}
                      onChange={(e) => setField('joinDate', e.target.value)}
                      className={cn(
                        'h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs',
                        errors.joinDate && 'border-rose-500 focus-visible:ring-rose-500/20',
                      )}
                    />
                    {errors.joinDate && (
                      <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.joinDate}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Protected Compensation Card */}
              <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 shadow-none">
                <CardHeader className="pb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-slate-400" />
                        Compensation & Financial Structure
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Restricted compensation policies managed via the Payroll module.
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono font-semibold">
                      Protected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoRow icon={Wallet} label="Annual Base Salary" value={formatCurrency(employee.salary)} />
                  <InfoRow icon={Wallet} label="Monthly Gross" value={formatCurrency(employee.grossSalary ?? Math.round(employee.salary / 12))} />
                  <InfoRow icon={Wallet} label="House Rent Allowance" value={formatCurrency(employee.hra ?? 1800)} />
                  <InfoRow icon={Wallet} label="Medical Allowance" value={formatCurrency(employee.medicalAllowance ?? 600)} />
                  <InfoRow icon={Wallet} label="Transport Allowance" value={formatCurrency(employee.transportAllowance ?? 400)} />
                  <InfoRow icon={Wallet} label="Salary Structure Type" value={employee.salaryType ?? 'Monthly Standard'} />
                </CardContent>
              </Card>

              {/* Floating Action Bar */}
              <div className="sticky bottom-4 z-10 flex items-center justify-between p-3.5 px-5 rounded-2xl bg-[#0F172A]/95 backdrop-blur-md text-white shadow-2xl border border-slate-700">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold">Unsaved edits in Registration Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEdit}
                    className="h-8 rounded-lg text-xs border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveChanges}
                    className="h-8 rounded-lg text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm shadow-indigo-500/20"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Save Changes
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* --- READ-ONLY: REGISTRATION DETAILS --- */
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4 text-[#4F46E5]" /> Organizational Alignment
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit('registration')}
                    className="h-8 px-3 rounded-lg text-xs text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-semibold"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                </CardHeader>
                <CardContent className="pt-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                  <InfoRow icon={Building2} label="Department" value={employee.department} />
                  <InfoRow icon={BriefcaseBusiness} label="Designation" value={employee.designation} />
                  <InfoRow icon={UserCheck} label="Reporting Manager" value={employee.manager || 'Executive Management'} />
                  <InfoRow icon={MapPin} label="Work Location" value={employee.location} />
                  <InfoRow icon={BriefcaseBusiness} label="Work Mode" value={employee.workMode ?? 'Hybrid'} />
                  <InfoRow icon={Clock} label="Assigned Shift" value={employee.shift ?? 'General Shift (09:00 - 18:00)'} />
                  <InfoRow icon={CalendarDays} label="Joining Date" value={formatDate(employee.joinDate)} />
                  <InfoRow icon={BriefcaseBusiness} label="Employment Type" value={employee.employmentType} />
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-emerald-600" /> Compensation & Structure
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono font-semibold">
                      Protected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                  <InfoRow icon={Wallet} label="Annual Package" value={formatCurrency(employee.salary)} />
                  <InfoRow icon={Wallet} label="Monthly Gross" value={formatCurrency(employee.grossSalary ?? Math.round(employee.salary / 12))} />
                  <InfoRow icon={Wallet} label="House Rent Allowance" value={formatCurrency(employee.hra ?? 1800)} />
                  <InfoRow icon={Wallet} label="Medical Allowance" value={formatCurrency(employee.medicalAllowance ?? 600)} />
                  <InfoRow icon={Wallet} label="Transport Allowance" value={formatCurrency(employee.transportAllowance ?? 400)} />
                  <InfoRow icon={Wallet} label="Salary Structure Type" value={employee.salaryType ?? 'Monthly Standard'} />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 4: DOCUMENTS (UPLOAD, REPLACE, REMOVE, PREVIEW)      */}
        {/* ======================================================== */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#4F46E5]" /> Verified Employee Documents
                </CardTitle>
                <CardDescription className="text-xs">
                  Official employment files, tax forms and legal contracts.
                </CardDescription>
              </div>

              {/* Upload Document Action */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => docUploadInputRef.current?.click()}
                  className="h-9 px-4 rounded-xl text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm shadow-indigo-500/20"
                >
                  <FolderUp className="h-4 w-4 mr-1.5" /> Upload Document
                </Button>
                <input
                  ref={docUploadInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleDocUpload}
                />
                <input
                  ref={docReplaceInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleDocReplace}
                />
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {documents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed rounded-2xl border-slate-200 dark:border-slate-800">
                  <FileText className="h-10 w-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No documents archived yet</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => docUploadInputRef.current?.click()}
                    className="text-xs text-[#4F46E5] mt-1"
                  >
                    Upload first document
                  </Button>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-400 font-bold text-xs shadow-2xs">
                        {doc.type}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {doc.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {doc.size} <span className="text-slate-300 dark:text-slate-600">·</span> Uploaded on {formatDate(doc.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreviewDoc(doc)}
                            className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-indigo-950/40 rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Preview document</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toast.success(`Downloading ${doc.name}.${doc.type.toLowerCase()}`)}
                            className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-indigo-950/40 rounded-lg"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download file</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setReplacingDocId(doc.id)
                              docReplaceInputRef.current?.click()
                            }}
                            className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-indigo-950/40 rounded-lg"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Replace file</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingDoc(doc)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove document</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 5: ATTENDANCE (READ-ONLY LOGS + EDITABLE POLICIES)   */}
        {/* ======================================================== */}
        <TabsContent value="attendance" className="space-y-5 mt-4">
          <Card className={cn(
            "rounded-2xl border shadow-2xs transition-all bg-white dark:bg-slate-900",
            isEditing && tab === 'attendance'
              ? "border-indigo-200 dark:border-indigo-900/60"
              : "border-slate-200/80 dark:border-slate-800"
          )}>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#4F46E5]" /> Attendance Configuration & Policies
                </CardTitle>
                <CardDescription className="text-xs">
                  Shift schedule window, remote policy and automated notifications.
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit('attendance')}
                  className="h-8 px-3 rounded-lg text-xs text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-semibold"
                >
                  <Pencil className="h-3 w-3" /> Edit Preferences
                </Button>
              ) : (
                <Badge variant="outline" className="text-[11px] border-indigo-200 text-[#4F46E5] bg-indigo-50/60 font-semibold">
                  Editing Preferences
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              {isEditing && tab === 'attendance' ? (
                <div className="grid gap-4 sm:grid-cols-2 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="prefShift" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Assigned Shift
                    </Label>
                    <Select
                      value={attendancePrefs.shift}
                      onValueChange={(val) => setAttendancePrefs((prev) => ({ ...prev, shift: val }))}
                    >
                      <SelectTrigger id="prefShift" className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs">
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {shifts.map((s) => (
                          <SelectItem key={s.id} value={s.name}>
                            {s.name} ({s.startTime} - {s.endTime})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prefPolicy" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Attendance Policy Window
                    </Label>
                    <Select
                      value={attendancePrefs.policy}
                      onValueChange={(val) => setAttendancePrefs((prev) => ({ ...prev, policy: val }))}
                    >
                      <SelectTrigger id="prefPolicy" className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs">
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        {attendancePolicies.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prefWorkMode" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Default Work Mode
                    </Label>
                    <Select
                      value={attendancePrefs.workMode}
                      onValueChange={(val) => setAttendancePrefs((prev) => ({ ...prev, workMode: val }))}
                    >
                      <SelectTrigger id="prefWorkMode" className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 shadow-2xs">
                        <SelectValue placeholder="Select work mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {workModes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Daily Attendance Alerts</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Receive 08:45 AM check-in prompt</p>
                    </div>
                    <Switch
                      checked={attendancePrefs.dailyReminder}
                      onCheckedChange={(checked) => setAttendancePrefs((prev) => ({ ...prev, dailyReminder: checked }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 text-sm divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
                  <div className="space-y-3">
                    <InfoRow icon={Clock} label="Assigned Shift" value={employee.shift || 'General Shift (09:00 - 18:00)'} />
                    <InfoRow icon={BriefcaseBusiness} label="Policy Rule" value={employee.attendancePolicy || 'Standard 9-to-6 Policy'} />
                  </div>
                  <div className="space-y-3 sm:pl-4 pt-3 sm:pt-0">
                    <InfoRow icon={MapPin} label="Work Mode" value={employee.workMode || 'Hybrid (3 days on-site)'} />
                    <InfoRow icon={Check} label="Daily Notifications" value="Active (08:45 AM prompt)" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Read-Only Attendance History */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#4F46E5]" /> Attendance Activity Logs
                </CardTitle>
                <CardDescription className="text-xs">
                  Biometric timestamps and calculated daily hours.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-[10px] uppercase font-mono font-semibold flex items-center gap-1">
                <Lock className="h-3 w-3 text-slate-400" /> Immutable
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              {attendance.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No attendance records available for this employee in the demo data.
                </p>
              ) : (
                attendance.slice(0, 6).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 text-sm bg-white dark:bg-slate-900/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatDate(a.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.shift} <span className="text-slate-300 dark:text-slate-600">·</span> {a.checkIn} – {a.checkOut}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {a.hours} hrs
                      </span>
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                ))
              )}
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">
                Attendance records are verified by the hardware biometric gateway and cannot be manually altered.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Discard Changes Confirm Dialog */}
      <ConfirmDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title="Discard unsaved changes?"
        description={`You have unsaved changes in the ${getTabTitle(tab)} tab. Switching tabs will discard your modifications.`}
        confirmLabel="Discard Changes"
        cancelLabel="Stay on Current Tab"
        destructive
        onConfirm={() => {
          setIsEditing(false)
          setEditTab(null)
          setFormValues(initialValues)
          setAttendancePrefs(initialAttendancePrefs)
          setPreviewPhoto(null)
          setErrors({})
          if (pendingTab) {
            setTab(pendingTab)
            setPendingTab(null)
          }
        }}
      />

      {/* Document Delete Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deletingDoc)}
        onOpenChange={(open) => !open && setDeletingDoc(null)}
        title="Remove document?"
        description={`Are you sure you want to remove "${deletingDoc?.name}" from this employee profile?`}
        confirmLabel="Remove Document"
        destructive
        onConfirm={() => {
          if (deletingDoc) {
            setDocuments((prev) => prev.filter((d) => d.id !== deletingDoc.id))
            toast.success(`"${deletingDoc.name}" removed`)
            setDeletingDoc(null)
          }
        }}
      />

      {/* Document Preview Dialog */}
      <Dialog open={Boolean(previewDoc)} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#4F46E5] font-bold text-xs shadow-2xs">
                {previewDoc?.type}
              </div>
              <div>
                <DialogTitle className="text-base font-bold">{previewDoc?.name}</DialogTitle>
                <DialogDescription className="text-xs">
                  {previewDoc?.size} · Uploaded {previewDoc ? formatDate(previewDoc.date) : ''}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 text-center space-y-3">
            <FileText className="h-12 w-12 mx-auto text-[#4F46E5]/70" />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {previewDoc?.name}.{previewDoc?.type.toLowerCase()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Official PeopleFlow HRMS Encrypted File
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 bg-emerald-50/50">
              <Check className="h-3 w-3 mr-1" /> Authenticity Verified
            </Badge>
          </div>

          <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)} className="rounded-xl text-xs">
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.success(`Downloading ${previewDoc?.name}`)
                setPreviewDoc(null)
              }}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Download File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3.5 py-2.5 px-2 rounded-xl transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-2xs">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
          {value}
        </p>
      </div>
    </div>
  )
}
