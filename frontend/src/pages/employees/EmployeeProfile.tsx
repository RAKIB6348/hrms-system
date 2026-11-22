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
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
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
import { StatCard } from '@/components/common/StatCard'
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
    { id: 'doc-1', name: 'Employment Contract', type: 'PDF', size: '2.4 MB', date: '2026-01-15' },
    { id: 'doc-2', name: 'Identity Verification', type: 'PDF', size: '1.2 MB', date: '2026-01-15' },
    { id: 'doc-3', name: 'Tax Declaration Form', type: 'PDF', size: '850 KB', date: '2026-02-01' },
    { id: 'doc-4', name: 'Offer Letter & Acceptance', type: 'PDF', size: '1.8 MB', date: '2026-01-10' },
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
    workMode: employee?.workMode || 'On-site',
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
      workMode: employee.workMode ?? 'On-site',
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
      workMode: employee.workMode || 'On-site',
      dailyReminder: true,
    })
    setInitialAttendancePrefs({
      shift: employee.shift || 'General Shift',
      policy: employee.attendancePolicy || 'Standard 9-to-6 Policy',
      workMode: employee.workMode || 'On-site',
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
    toast.info('Editing cancelled — changes discarded')
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
      // If not currently editing, prompt/update directly
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
        size: `${Math.max(0.1, (file.size / (1024 * 1024))).toFixed(1)} MB`,
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
                size: `${Math.max(0.1, (file.size / (1024 * 1024))).toFixed(1)} MB`,
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
    <div className="space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to={id ? '/employees' : '/dashboard'}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {id ? 'Back to employees' : 'Back to dashboard'}
          </Link>
        </Button>

        {isEditing && (
          <Badge className="bg-indigo-600 text-white animate-pulse text-xs font-medium">
            Editing {getTabTitle(tab)}
          </Badge>
        )}
      </div>

      <DemoNotice compact />

      {/* Profile Header Banner */}
      <Card className="overflow-hidden border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="h-28 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        <CardContent className="relative pb-6">
          <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {/* Avatar & Identifiers */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative group self-start">
                <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-card shadow-lg overflow-hidden ring-2 ring-black/5 dark:ring-white/10">
                  {activePhoto ? (
                    <img src={activePhoto} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback
                      className="text-2xl sm:text-3xl font-bold"
                      style={{ backgroundColor: employee.avatarColor, color: '#fff' }}
                    >
                      {initials(name)}
                    </AvatarFallback>
                  )}
                </Avatar>

                {/* Camera upload button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className={cn(
                        'absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full shadow-md border-2 border-white dark:border-slate-900 transition-all',
                        isEditing
                          ? 'bg-[#4F46E5] text-white hover:bg-indigo-700 scale-100'
                          : 'bg-slate-900/90 text-white hover:bg-[#4F46E5] opacity-95 hover:opacity-100',
                      )}
                      aria-label="Upload profile photo"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Change profile photo</TooltipContent>
                </Tooltip>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="space-y-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {name}
                  </h1>
                  <StatusBadge status={employee.status} />
                  {isCurrentUser && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-medium"
                    >
                      You (Signed in)
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {employee.designation} · {employee.department}
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                    {employee.employeeId}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{employee.location}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Edit / Save / Cancel */}
            <div className="flex flex-wrap items-center gap-2 pb-1">
              {activePhoto && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removePhoto}
                  className="h-9 px-3 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
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
                    className="h-9 px-4 rounded-lg font-medium text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4 mr-1.5" /> Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={saveChanges}
                    className="h-9 px-5 rounded-lg font-semibold text-xs bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm shadow-indigo-500/25 transition-all"
                  >
                    <Check className="h-4 w-4 mr-1.5" /> Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => startEdit()}
                    className="h-9 px-4 rounded-lg font-medium text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5 text-[#4F46E5]" /> Edit Profile
                  </Button>
                  <Button
                    type="button"
                    onClick={() => toast.success(`Message sent to ${name} (demo)`)}
                    className="h-9 px-4 rounded-lg font-semibold text-xs bg-[#0F172A] hover:bg-slate-800 text-white shadow-2xs"
                  >
                    <Mail className="h-3.5 w-3.5 mr-1.5" /> Send message
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards (Read-only Summary) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Annual Salary" value={formatCurrency(employee.salary)} icon={Wallet} tone="primary" />
        <StatCard title="Department" value={employee.department} icon={BriefcaseBusiness} tone="violet" />
        <StatCard title="Work Location" value={employee.location} icon={MapPin} tone="sky" />
        <StatCard
          title="Joining Date"
          value={formatDate(employee.joinDate, { month: 'short', year: 'numeric' })}
          icon={CalendarDays}
          tone="emerald"
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={handleTabChange} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <TabsList className="w-full justify-start overflow-x-auto sm:w-auto bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg text-xs font-medium">
              Overview
            </TabsTrigger>
            <TabsTrigger value="personal" className="rounded-lg text-xs font-medium">
              Personal Details
            </TabsTrigger>
            <TabsTrigger value="registration" className="rounded-lg text-xs font-medium">
              Registration Details
            </TabsTrigger>
            <TabsTrigger value="documents" className="rounded-lg text-xs font-medium">
              Documents
            </TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-lg text-xs font-medium">
              Attendance
            </TabsTrigger>
          </TabsList>

          {/* Inline Edit Controls in Tab Bar */}
          {tab !== 'overview' && !isEditing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => startEdit(tab)}
              className="h-8 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 self-start sm:self-auto"
            >
              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit {getTabTitle(tab)}
            </Button>
          )}

          {isEditing && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-muted-foreground mr-1">
                {isDirty ? (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">Unsaved changes</span>
                ) : (
                  'No changes'
                )}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelEdit}
                className="h-8 text-xs font-medium"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={saveChanges}
                className="h-8 text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white"
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW (READ-ONLY + QUICK NAVIGATION)           */}
        {/* ======================================================== */}
        <TabsContent value="overview" className="grid gap-4 lg:grid-cols-2 mt-4">
          {/* Contact Summary Card */}
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
                <CardDescription className="text-xs">Summary of communication channels</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEdit('personal')}
                className="h-7 text-xs text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-medium"
              >
                <Pencil className="h-3 w-3" /> Edit in Personal
              </Button>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm">
              <InfoRow icon={Mail} label="Work Email" value={employee.email} />
              <InfoRow icon={Phone} label="Primary Phone" value={employee.phone} />
              <InfoRow icon={MapPin} label="Primary Address" value={employee.address || '—'} />
              <InfoRow icon={UserCheck} label="Reports To" value={employee.manager || 'Department Head'} />
            </CardContent>
          </Card>

          {/* Employment Summary Card */}
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Employment Details</CardTitle>
                <CardDescription className="text-xs">Organizational role & schedule</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEdit('registration')}
                className="h-7 text-xs text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-medium"
              >
                <Pencil className="h-3 w-3" /> Edit in Registration
              </Button>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm">
              <InfoRow icon={BriefcaseBusiness} label="Employment Type" value={employee.employmentType} />
              <InfoRow icon={CalendarDays} label="Date of Joining" value={formatDate(employee.joinDate)} />
              <InfoRow icon={Clock} label="Assigned Shift" value={employee.shift || 'General Shift'} />
              <InfoRow icon={Wallet} label="Annual Salary" value={formatCurrency(employee.salary)} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 2: PERSONAL DETAILS (INLINE EDITABLE)                */}
        {/* ======================================================== */}
        <TabsContent value="personal" className="space-y-4 mt-4">
          {isEditing && tab === 'personal' ? (
            /* --- EDIT MODE: PERSONAL DETAILS --- */
            <div className="space-y-5">
              {/* Personal Identification Card */}
              <Card className="border-indigo-200/80 dark:border-indigo-900/60 shadow-sm bg-card">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-[#4F46E5]" />
                        Identity Information
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Update employee personal names, date of birth and gender.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[11px] border-indigo-200 text-[#4F46E5] bg-indigo-50/50">
                      Inline Edit Mode
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* First Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-medium flex items-center">
                      First Name <span className="text-rose-500 ml-0.5">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formValues.firstName ?? ''}
                      onChange={(e) => setField('firstName', e.target.value)}
                      placeholder="e.g. Meera"
                      className={cn(
                        'h-9 rounded-lg text-sm bg-white dark:bg-slate-900',
                        errors.firstName && 'border-rose-500 focus-visible:ring-rose-500/20',
                      )}
                    />
                    {errors.firstName && (
                      <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Middle Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="middleName" className="text-xs font-medium">
                      Middle Name
                    </Label>
                    <Input
                      id="middleName"
                      value={formValues.middleName ?? ''}
                      onChange={(e) => setField('middleName', e.target.value)}
                      placeholder="Optional"
                      className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-medium flex items-center">
                      Last Name <span className="text-rose-500 ml-0.5">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formValues.lastName ?? ''}
                      onChange={(e) => setField('lastName', e.target.value)}
                      placeholder="e.g. Nair"
                      className={cn(
                        'h-9 rounded-lg text-sm bg-white dark:bg-slate-900',
                        errors.lastName && 'border-rose-500 focus-visible:ring-rose-500/20',
                      )}
                    />
                    {errors.lastName && (
                      <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.lastName}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <Label htmlFor="dob" className="text-xs font-medium flex items-center">
                      Date of Birth <span className="text-rose-500 ml-0.5">*</span>
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formValues.dob ?? ''}
                      onChange={(e) => setField('dob', e.target.value)}
                      className={cn(
                        'h-9 rounded-lg text-sm bg-white dark:bg-slate-900',
                        errors.dob && 'border-rose-500 focus-visible:ring-rose-500/20',
                      )}
                    />
                    {errors.dob && (
                      <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.dob}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <Label htmlFor="gender" className="text-xs font-medium">
                      Gender
                    </Label>
                    <Select
                      value={formValues.gender ?? 'Female'}
                      onValueChange={(val) => setField('gender', val as 'Male' | 'Female' | 'Other')}
                    >
                      <SelectTrigger id="gender" className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900">
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

                  {/* Marital Status */}
                  <div className="space-y-1.5">
                    <Label htmlFor="maritalStatus" className="text-xs font-medium">
                      Marital Status
                    </Label>
                    <Select
                      value={formValues.maritalStatus ?? 'Single'}
                      onValueChange={(val) => setField('maritalStatus', val)}
                    >
                      <SelectTrigger id="maritalStatus" className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900">
                        <SelectValue placeholder="Select marital status" />
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

              {/* Contact Information Card */}
              <Card className="border-indigo-200/80 dark:border-indigo-900/60 shadow-sm bg-card">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#4F46E5]" />
                    Communication & Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid gap-4 sm:grid-cols-2">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-medium flex items-center">
                      Primary Phone <span className="text-rose-500 ml-0.5">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formValues.phone ?? ''}
                      onChange={(e) => setField('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={cn(
                        'h-9 rounded-lg text-sm bg-white dark:bg-slate-900',
                        errors.phone && 'border-rose-500 focus-visible:ring-rose-500/20',
                      )}
                    />
                    {errors.phone && (
                      <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Personal Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="personalEmail" className="text-xs font-medium">
                      Personal Email
                    </Label>
                    <Input
                      id="personalEmail"
                      type="email"
                      value={formValues.personalEmail ?? ''}
                      onChange={(e) => setField('personalEmail', e.target.value)}
                      placeholder="e.g. personal@gmail.com"
                      className={cn(
                        'h-9 rounded-lg text-sm bg-white dark:bg-slate-900',
                        errors.personalEmail && 'border-rose-500 focus-visible:ring-rose-500/20',
                      )}
                    />
                    {errors.personalEmail && (
                      <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.personalEmail}
                      </p>
                    )}
                  </div>

                  {/* Present Address */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="presentAddress" className="text-xs font-medium">
                      Present Address
                    </Label>
                    <Textarea
                      id="presentAddress"
                      rows={2}
                      value={formValues.presentAddress ?? formValues.address ?? ''}
                      onChange={(e) => {
                        setField('presentAddress', e.target.value)
                        setField('address', e.target.value)
                      }}
                      placeholder="Street, Apartment / Suite, City, State, ZIP"
                      className="rounded-lg text-sm bg-white dark:bg-slate-900 resize-none"
                    />
                  </div>

                  {/* Permanent Address */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="permanentAddress" className="text-xs font-medium">
                      Permanent Address
                    </Label>
                    <Textarea
                      id="permanentAddress"
                      rows={2}
                      value={formValues.permanentAddress ?? ''}
                      onChange={(e) => setField('permanentAddress', e.target.value)}
                      placeholder="Permanent family address (if different)"
                      className="rounded-lg text-sm bg-white dark:bg-slate-900 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contacts Card */}
              <Card className="border-indigo-200/80 dark:border-indigo-900/60 shadow-sm bg-card">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-[#4F46E5]" />
                    Emergency Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Contact Person Name</Label>
                    <Input
                      value={formValues.emergencyContacts?.[0]?.name ?? ''}
                      onChange={(e) => setEmergencyContact('name', e.target.value)}
                      placeholder="e.g. Sanjay Nair"
                      className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Relationship</Label>
                    <Input
                      value={formValues.emergencyContacts?.[0]?.relationship ?? ''}
                      onChange={(e) => setEmergencyContact('relationship', e.target.value)}
                      placeholder="e.g. Spouse, Parent, Sibling"
                      className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Emergency Mobile</Label>
                    <Input
                      value={formValues.emergencyContacts?.[0]?.phone ?? ''}
                      onChange={(e) => setEmergencyContact('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Alternative Mobile</Label>
                    <Input
                      value={formValues.emergencyContacts?.[0]?.alternativePhone ?? ''}
                      onChange={(e) => setEmergencyContact('alternativePhone', e.target.value)}
                      placeholder="Optional secondary phone"
                      className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Bottom Sticky Action Bar */}
              <div className="sticky bottom-4 z-10 flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                  <span>You are editing Personal Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEdit}
                    className="h-8 text-xs border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveChanges}
                    className="h-8 text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Save Changes
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* --- READ-ONLY: PERSONAL DETAILS --- */
            <div className="space-y-4">
              <Card className="border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-semibold">Personal Details</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit('personal')}
                    className="h-7 text-xs text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-medium"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={UserRound} label="Full Name" value={name} />
                  <InfoRow icon={Cake} label="Date of Birth" value={formatDate(employee.dob)} />
                  <InfoRow icon={UserRound} label="Gender" value={employee.gender} />
                  <InfoRow icon={UserRound} label="Marital Status" value={employee.maritalStatus ?? 'Single'} />
                  <InfoRow icon={UserRound} label="Blood Group" value={employee.bloodGroup ?? 'O+'} />
                  <InfoRow icon={UserRound} label="Nationality" value={employee.nationality ?? 'American'} />
                  <InfoRow icon={Phone} label="Primary Phone" value={employee.phone} />
                  <InfoRow icon={Mail} label="Personal Email" value={employee.personalEmail || employee.email} />
                  <InfoRow icon={MapPin} label="Present Address" value={employee.presentAddress ?? employee.address} />
                  <InfoRow icon={MapPin} label="Permanent Address" value={employee.permanentAddress || 'Same as present'} />
                </CardContent>
              </Card>

              {/* Emergency Contacts Read-only */}
              <Card className="border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-semibold">Emergency Contacts</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit('personal')}
                    className="h-7 text-xs text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-medium"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {employee.emergencyContacts?.length ? (
                    employee.emergencyContacts.map((item, index) => (
                      <div key={index} className="rounded-lg border p-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.name} <span className="text-xs font-normal text-muted-foreground">({item.relationship})</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{item.phone}</p>
                        </div>
                        {item.alternativePhone && (
                          <span className="text-xs text-muted-foreground">Alt: {item.alternativePhone}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border p-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Sanjay Nair <span className="text-xs font-normal text-muted-foreground">(Spouse)</span>
                      </p>
                      <p className="text-xs text-muted-foreground">+1 (555) 234-8901</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 3: REGISTRATION DETAILS (INLINE EDITABLE)            */}
        {/* ======================================================== */}
        <TabsContent value="registration" className="space-y-4 mt-4">
          {isEditing && tab === 'registration' ? (
            /* --- EDIT MODE: REGISTRATION DETAILS --- */
            <div className="space-y-5">
              {/* Authorized Employment Info Card */}
              <Card className="border-indigo-200/80 dark:border-indigo-900/60 shadow-sm bg-card">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <BriefcaseBusiness className="h-4 w-4 text-[#4F46E5]" />
                        Organizational & Employment Assignment
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Authorized HR/Admin controls for department, designation, manager and shift.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[11px] border-emerald-300 text-emerald-700 bg-emerald-50/50">
                      <ShieldCheck className="h-3 w-3 mr-1" /> HR Authorized
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Employee ID (Read-only) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1 text-slate-500">
                      <Lock className="h-3 w-3 text-slate-400" /> Employee ID (System)
                    </Label>
                    <div className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 flex items-center justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      <span>{employee.employeeId}</span>
                      <span className="text-[10px] uppercase font-sans text-muted-foreground">Immutable</span>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-xs font-medium flex items-center">
                      Department <span className="text-rose-500 ml-0.5">*</span>
                    </Label>
                    <Select
                      value={formValues.department ?? employee.department}
                      onValueChange={(val) => setField('department', val)}
                    >
                      <SelectTrigger id="department" className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900">
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
                    <Label htmlFor="designation" className="text-xs font-medium flex items-center">
                      Designation <span className="text-rose-500 ml-0.5">*</span>
                    </Label>
                    <Select
                      value={formValues.designation ?? employee.designation}
                      onValueChange={(val) => setField('designation', val)}
                    >
                      <SelectTrigger id="designation" className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900">
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
                    <Label htmlFor="manager" className="text-xs font-medium">
                      Reporting Manager
                    </Label>
                    <Select
                      value={formValues.manager ?? employee.manager}
                      onValueChange={(val) => setField('manager', val)}
                    >
                      <SelectTrigger id="manager" className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900">
                        <SelectValue placeholder="Select reporting manager" />
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

                  {/* Employment Type */}
                  <div className="space-y-1.5">
                    <Label htmlFor="employmentType" className="text-xs font-medium">
                      Employment Type
                    </Label>
                    <Select
                      value={formValues.employmentType ?? employee.employmentType}
                      onValueChange={(val) => setField('employmentType', val as Employee['employmentType'])}
                    >
                      <SelectTrigger id="employmentType" className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900">
                        <SelectValue placeholder="Select employment type" />
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

                  {/* Work Location */}
                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-xs font-medium flex items-center">
                      Work Location <span className="text-rose-500 ml-0.5">*</span>
                    </Label>
                    <Select
                      value={formValues.location ?? employee.location}
                      onValueChange={(val) => setField('location', val)}
                    >
                      <SelectTrigger id="location" className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900">
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

                  {/* Work Mode */}
                  <div className="space-y-1.5">
                    <Label htmlFor="workMode" className="text-xs font-medium">
                      Work Mode
                    </Label>
                    <Select
                      value={formValues.workMode ?? employee.workMode ?? 'On-site'}
                      onValueChange={(val) => setField('workMode', val)}
                    >
                      <SelectTrigger id="workMode" className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900">
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
                    <Label htmlFor="shift" className="text-xs font-medium">
                      Assigned Shift
                    </Label>
                    <Select
                      value={formValues.shift ?? employee.shift ?? 'General Shift'}
                      onValueChange={(val) => setField('shift', val)}
                    >
                      <SelectTrigger id="shift" className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900">
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
                    <Label htmlFor="joinDate" className="text-xs font-medium flex items-center">
                      Date of Joining <span className="text-rose-500 ml-0.5">*</span>
                    </Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={formValues.joinDate ?? employee.joinDate}
                      onChange={(e) => setField('joinDate', e.target.value)}
                      className={cn(
                        'h-9 rounded-lg text-sm bg-white dark:bg-slate-900',
                        errors.joinDate && 'border-rose-500 focus-visible:ring-rose-500/20',
                      )}
                    />
                    {errors.joinDate && (
                      <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.joinDate}
                      </p>
                    )}
                  </div>

                  {/* Weekly Working Days */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="weeklyWorkingDays" className="text-xs font-medium">
                      Weekly Working Schedule
                    </Label>
                    <Input
                      id="weeklyWorkingDays"
                      value={formValues.weeklyWorkingDays ?? employee.weeklyWorkingDays ?? 'Mon – Fri (5 days)'}
                      onChange={(e) => setField('weeklyWorkingDays', e.target.value)}
                      placeholder="e.g. Mon – Fri (5 days)"
                      className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sensitive Salary & Allowances (Protected / Read-only) */}
              <Card className="border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 shadow-none">
                <CardHeader className="pb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-slate-400" />
                        Compensation & Financial Structure (Protected)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Compensation records are restricted to Payroll Administrators.
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                      Read-Only
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoRow icon={Wallet} label="Annual Base Salary" value={formatCurrency(employee.salary)} />
                  <InfoRow icon={Wallet} label="Monthly Gross" value={formatCurrency(employee.grossSalary ?? Math.round(employee.salary / 12))} />
                  <InfoRow icon={Wallet} label="House Rent Allowance" value={formatCurrency(employee.hra ?? 0)} />
                  <InfoRow icon={Wallet} label="Medical Allowance" value={formatCurrency(employee.medicalAllowance ?? 0)} />
                  <InfoRow icon={Wallet} label="Transport Allowance" value={formatCurrency(employee.transportAllowance ?? 0)} />
                  <InfoRow icon={Wallet} label="Salary Type" value={employee.salaryType ?? 'Monthly'} />
                </CardContent>
              </Card>

              {/* Bottom Sticky Action Bar */}
              <div className="sticky bottom-4 z-10 flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                  <span>You are editing Registration Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEdit}
                    className="h-8 text-xs border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveChanges}
                    className="h-8 text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Save Changes
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* --- READ-ONLY: REGISTRATION DETAILS --- */
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-semibold">Employment & Schedule</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit('registration')}
                    className="h-7 text-xs text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-medium"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
                  <InfoRow icon={UserRound} label="Employee ID" value={employee.employeeId} />
                  <InfoRow icon={Building2} label="Department" value={employee.department} />
                  <InfoRow icon={BriefcaseBusiness} label="Designation" value={employee.designation} />
                  <InfoRow icon={UserCheck} label="Reporting Manager" value={employee.manager} />
                  <InfoRow icon={MapPin} label="Work Location" value={employee.location} />
                  <InfoRow icon={BriefcaseBusiness} label="Work Mode" value={employee.workMode ?? 'On-site'} />
                  <InfoRow icon={Clock} label="Assigned Shift" value={employee.shift ?? 'General Shift'} />
                  <InfoRow icon={CalendarDays} label="Joining Date" value={formatDate(employee.joinDate)} />
                  <InfoRow icon={CalendarDays} label="Working Days" value={employee.weeklyWorkingDays ?? 'Mon – Fri (5 days)'} />
                  <InfoRow icon={BriefcaseBusiness} label="Employment Type" value={employee.employmentType} />
                </CardContent>
              </Card>

              <Card className="border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Compensation</CardTitle>
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                      Protected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
                  <InfoRow icon={Wallet} label="Salary Type" value={employee.salaryType ?? 'Monthly'} />
                  <InfoRow icon={Wallet} label="Monthly Gross" value={formatCurrency(employee.grossSalary ?? Math.round(employee.salary / 12))} />
                  <InfoRow icon={Wallet} label="House Rent Allowance" value={formatCurrency(employee.hra ?? 0)} />
                  <InfoRow icon={Wallet} label="Medical Allowance" value={formatCurrency(employee.medicalAllowance ?? 0)} />
                  <InfoRow icon={Wallet} label="Transport Allowance" value={formatCurrency(employee.transportAllowance ?? 0)} />
                  <InfoRow icon={Wallet} label="Annual Package" value={formatCurrency(employee.salary)} />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 4: DOCUMENTS (UPLOAD, REPLACE, REMOVE, PREVIEW)      */}
        {/* ======================================================== */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Employee Documents</CardTitle>
                <CardDescription className="text-xs">
                  Upload, preview, replace, or archive verified documentation.
                </CardDescription>
              </div>

              {/* Upload Document Button */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => docUploadInputRef.current?.click()}
                  className="h-8 px-3 rounded-lg text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-2xs"
                >
                  <FolderUp className="h-3.5 w-3.5 mr-1.5" /> Upload Document
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

            <CardContent className="space-y-3">
              {documents.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>No documents uploaded yet.</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => docUploadInputRef.current?.click()}
                    className="text-xs text-[#4F46E5] mt-1"
                  >
                    Upload your first document
                  </Button>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/50 dark:text-indigo-400 font-bold text-xs">
                        {doc.type}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {doc.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {doc.size} · Uploaded on {formatDate(doc.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 shrink-0">
                      {/* Preview Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreviewDoc(doc)}
                            className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-indigo-950/40"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Preview document</TooltipContent>
                      </Tooltip>

                      {/* Download Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toast.success(`Downloading ${doc.name}.${doc.type.toLowerCase()}`)}
                            className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-indigo-950/40"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download file</TooltipContent>
                      </Tooltip>

                      {/* Replace Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setReplacingDocId(doc.id)
                              docReplaceInputRef.current?.click()
                            }}
                            className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-indigo-950/40"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Replace file</TooltipContent>
                      </Tooltip>

                      {/* Delete Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingDoc(doc)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
        {/* TAB 5: ATTENDANCE (READ-ONLY LOGS + EDITABLE PREFERENCES) */}
        {/* ======================================================== */}
        <TabsContent value="attendance" className="space-y-4 mt-4">
          {/* Attendance Preferences Card (Editable in Edit Mode) */}
          <Card className={cn(
            "border shadow-2xs transition-all",
            isEditing && tab === 'attendance'
              ? "border-indigo-200/80 dark:border-indigo-900/60 bg-card"
              : "border-slate-200/80 dark:border-slate-800"
          )}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Attendance Preferences & Policies</CardTitle>
                <CardDescription className="text-xs">
                  Shift allocation, flexible policy window and notification alerts.
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit('attendance')}
                  className="h-7 text-xs text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-medium"
                >
                  <Pencil className="h-3 w-3" /> Edit Preferences
                </Button>
              ) : (
                <Badge variant="outline" className="text-[11px] border-indigo-200 text-[#4F46E5] bg-indigo-50/50">
                  Editing Preferences
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {isEditing && tab === 'attendance' ? (
                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="prefShift" className="text-xs font-medium">
                      Assigned Shift
                    </Label>
                    <Select
                      value={attendancePrefs.shift}
                      onValueChange={(val) => setAttendancePrefs((prev) => ({ ...prev, shift: val }))}
                    >
                      <SelectTrigger id="prefShift" className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900">
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
                    <Label htmlFor="prefPolicy" className="text-xs font-medium">
                      Attendance Policy
                    </Label>
                    <Select
                      value={attendancePrefs.policy}
                      onValueChange={(val) => setAttendancePrefs((prev) => ({ ...prev, policy: val }))}
                    >
                      <SelectTrigger id="prefPolicy" className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900">
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
                    <Label htmlFor="prefWorkMode" className="text-xs font-medium">
                      Default Work Mode
                    </Label>
                    <Select
                      value={attendancePrefs.workMode}
                      onValueChange={(val) => setAttendancePrefs((prev) => ({ ...prev, workMode: val }))}
                    >
                      <SelectTrigger id="prefWorkMode" className="h-9 rounded-lg text-sm bg-white dark:bg-slate-900">
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

                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div>
                      <p className="text-xs font-medium">Daily Attendance Reminder</p>
                      <p className="text-[11px] text-muted-foreground">Receive daily check-in prompt</p>
                    </div>
                    <Switch
                      checked={attendancePrefs.dailyReminder}
                      onCheckedChange={(checked) => setAttendancePrefs((prev) => ({ ...prev, dailyReminder: checked }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  <InfoRow icon={Clock} label="Assigned Shift" value={employee.shift || 'General Shift (09:00 - 18:00)'} />
                  <InfoRow icon={BriefcaseBusiness} label="Attendance Policy" value={employee.attendancePolicy || 'Standard 9-to-6 Policy'} />
                  <InfoRow icon={MapPin} label="Default Work Mode" value={employee.workMode || 'On-site'} />
                  <InfoRow icon={Check} label="Daily Notifications" value="Active (08:45 AM reminder)" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Read-Only Attendance Punch Logs */}
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Attendance Logs & Records</CardTitle>
                <CardDescription className="text-xs">
                  Biometric hardware timestamps and calculated daily hours.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                <Lock className="h-3 w-3 mr-1 text-slate-400" /> Read-Only Logs
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {attendance.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No attendance records available for this employee in the demo data.
                </p>
              ) : (
                attendance.slice(0, 7).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800/80 p-3 text-sm bg-white dark:bg-slate-900/50"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatDate(a.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.shift} · {a.checkIn} – {a.checkOut}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                        {a.hours} hrs
                      </span>
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                ))
              )}
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">
                Attendance records are automatically calculated by the time tracking gateway and cannot be modified manually.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Discard Unsaved Changes Confirmation Dialog */}
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

      {/* Document Delete Confirmation Dialog */}
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

      {/* Document Preview Modal */}
      <Dialog open={Boolean(previewDoc)} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-[#4F46E5] font-bold text-xs">
                {previewDoc?.type}
              </div>
              <div>
                <DialogTitle className="text-base">{previewDoc?.name}</DialogTitle>
                <DialogDescription className="text-xs">
                  {previewDoc?.size} · Uploaded {previewDoc ? formatDate(previewDoc.date) : ''}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Simulated Document Viewer */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 text-center space-y-3">
            <FileText className="h-12 w-12 mx-auto text-[#4F46E5]/70" />
            <div>
              <p className="text-sm font-semibold">{previewDoc?.name}.{previewDoc?.type.toLowerCase()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verified PeopleFlow HRMS Document
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
              <Check className="h-3 w-3 mr-1" /> Authenticity Verified
            </Badge>
          </div>

          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.success(`Downloading ${previewDoc?.name}`)
                setPreviewDoc(null)
              }}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white"
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  )
}
