import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Download, Eye, LayoutGrid, List, Mail, Pencil, Phone, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, DataTableToolbar, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ActionIconButton } from '@/components/common/ActionIconButton'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EmployeeForm, employeeFromFormValues } from '@/features/employees/EmployeeForm'
import { useEmployeeStore } from '@/hooks/use-employee-store'
import { departments } from '@/mocks/data'
import { cn, formatCurrency, initials } from '@/lib/utils'
import type { Employee } from '@/types'

const statusIndicatorConfig: Record<string, { dot: string; text: string }> = {
  Active: { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
  Inactive: { dot: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-400' },
  'On Leave': { dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
  Terminated: { dot: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-400' },
  Probation: { dot: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-400' },
}

function getStatusIndicator(status: string) {
  return statusIndicatorConfig[status] ?? { dot: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-400' }
}

const filters: TableFilter<Employee>[] = [
  { key: 'department', label: 'Departments', options: departments.map((d) => d.name), value: (r) => r.department },
  { key: 'status', label: 'Status', options: ['Active', 'On Leave', 'Probation', 'Inactive'], value: (r) => r.status },
]

type ViewMode = 'list' | 'kanban'
const VIEW_STORAGE_KEY = 'hrms-employee-view'

export default function EmployeeList() {
  const navigate = useNavigate()
  const rows = useEmployeeStore((state) => state.employees)
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee)
  const deleteEmployee = useEmployeeStore((state) => state.deleteEmployee)
  const [deleting, setDeleting] = useState<Employee | null>(null)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [query, setQuery] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'list'
    return window.localStorage.getItem(VIEW_STORAGE_KEY) === 'kanban' ? 'kanban' : 'list'
  })

  useEffect(() => {
    try { window.localStorage.setItem(VIEW_STORAGE_KEY, view) } catch { /* storage unavailable */ }
  }, [view])

  const visibleEmployees = useMemo(() => rows.filter((row) => {
    const matchesQuery = query.trim() === '' || JSON.stringify(row).toLowerCase().includes(query.trim().toLowerCase())
    return matchesQuery && filters.every((filter) => {
      const selected = filterValues[filter.key]
      return !selected || selected === 'all' || filter.value(row) === selected
    })
  }), [rows, query, filterValues])

  const columns: Column<Employee>[] = [
    {
      key: 'employee', header: 'Employee',
      cell: (emp) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback style={{ backgroundColor: emp.avatarColor, color: '#fff' }}>{initials(`${emp.firstName} ${emp.lastName}`)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{emp.firstName} {emp.lastName}</p>
            <p className="truncate text-xs text-muted-foreground">{emp.email}</p>
          </div>
        </div>
      ),
      sortValue: (e) => e.firstName,
    },
    { key: 'id', header: 'Employee ID', cell: (e) => <span className="font-mono text-xs text-muted-foreground">{e.employeeId}</span>, sortValue: (e) => e.employeeId },
    { key: 'department', header: 'Department', cell: (e) => e.department, sortValue: (e) => e.department },
    { key: 'designation', header: 'Designation', cell: (e) => <span className="text-muted-foreground">{e.designation}</span>, sortValue: (e) => e.designation },
    { key: 'location', header: 'Location', cell: (e) => <Badge variant="outline" className="text-[10px]">{e.location}</Badge> },
    { key: 'salary', header: 'Salary', cell: (e) => formatCurrency(e.salary), sortValue: (e) => e.salary },
    { key: 'status', header: 'Status', cell: (e) => <StatusBadge status={e.status} /> },
  ]

  const renderActions = (emp: Employee) => {
    const name = `${emp.firstName} ${emp.lastName}`
    return (
      <div className="flex items-center justify-end gap-1.5" onClick={(event) => event.stopPropagation()}>
        <ActionIconButton variant="view" icon={Eye} label={`View ${name}`} tooltip="View profile" onClick={() => navigate(`/employees/${emp.id}`)} />
        <ActionIconButton variant="edit" icon={Pencil} label={`Edit ${name}`} tooltip="Edit employee" onClick={() => setEditing(emp)} />
        <ActionIconButton variant="delete" icon={Trash2} label={`Delete ${name}`} tooltip="Delete employee" onClick={() => setDeleting(emp)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your workforce, profiles and organizational details."
        actions={
          <>
            <div className="flex items-center gap-0.5 rounded-lg border bg-card p-0.5">
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 gap-1.5 px-2.5"
                aria-label="List View"
                aria-pressed={view === 'list'}
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" /> <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant={view === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 gap-1.5 px-2.5"
                aria-label="Kanban View"
                aria-pressed={view === 'kanban'}
                onClick={() => setView('kanban')}
              >
                <LayoutGrid className="h-4 w-4" /> <span className="hidden sm:inline">Kanban</span>
              </Button>
            </div>
            <Button variant="outline" onClick={() => toast.success('Employee data export started (demo)')}><Download className="h-4 w-4" /> Export</Button>
            <Button asChild><Link to="/employees/new"><Plus className="h-4 w-4" /> Add Employee</Link></Button>
          </>
        }
      />
      <DemoNotice compact />

      {view === 'list' ? (
        <DataTable
          data={rows}
          columns={columns}
          filters={filters}
          searchPlaceholder="Search employees by name, email or ID..."
          search={query}
          onSearchChange={setQuery}
          filterValues={filterValues}
          onFilterValuesChange={setFilterValues}
          onRowClick={(emp) => navigate(`/employees/${emp.id}`)}
          rowActions={renderActions}
        />
      ) : (
        <div className="space-y-4">
          <DataTableToolbar<Employee>
            filters={filters}
            search={query}
            onSearchChange={setQuery}
            filterValues={filterValues}
            onFilterChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }))}
            searchPlaceholder="Search employees by name, email or ID..."
          />
          {visibleEmployees.length === 0 ? (
            <Card><EmptyState title="No employees found" description="Try adjusting your search or filters." /></Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {visibleEmployees.map((emp) => {
                const name = `${emp.firstName} ${emp.lastName}`
                const initialLetter = emp.firstName ? emp.firstName.charAt(0).toUpperCase() : 'E'
                const statusStyle = getStatusIndicator(emp.status)

                return (
                  <div
                    key={emp.id}
                    onClick={() => navigate(`/employees/${emp.id}`)}
                    className="group relative flex items-center p-3 gap-3 rounded-[10px] bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer overflow-hidden min-h-[125px] max-h-[145px]"
                  >
                    {/* Left: Square Avatar (approx 90 x 100px) */}
                    <div
                      className="relative flex h-[100px] w-[90px] shrink-0 items-center justify-center rounded-lg overflow-hidden select-none"
                      style={{ backgroundColor: emp.avatarColor || '#6366F1' }}
                    >
                      {emp.photoUrl ? (
                        <img src={emp.photoUrl} alt={name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold tracking-wider text-white">
                          {initialLetter}
                        </span>
                      )}
                    </div>

                    {/* Right: Employee Information */}
                    <div className="flex-1 min-w-0 h-[100px] flex flex-col justify-between py-0.5">
                      {/* Top Row: Name, ID and Status Indicator */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0 pr-1">
                          <p className="truncate text-sm font-bold text-[#0F172A] dark:text-slate-100 leading-tight group-hover:text-primary transition-colors">
                            {name}
                          </p>
                          <p className="font-mono text-[11px] text-[#64748B] dark:text-slate-400 leading-none mt-0.5">
                            {emp.employeeId}
                          </p>
                        </div>
                        {/* Status Indicator */}
                        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                          <span className={cn('h-2 w-2 rounded-full shrink-0', statusStyle.dot)} />
                          <span className={cn('text-[11px] font-medium leading-none', statusStyle.text)}>
                            {emp.status}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Designation & Department */}
                      <div className="min-w-0 leading-tight">
                        <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                          {emp.designation}
                        </p>
                        <p className="truncate text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                          {emp.department}
                        </p>
                      </div>

                      {/* Bottom Row: Contact Info & Action Buttons */}
                      <div className="flex items-end justify-between gap-2 mt-auto">
                        <div className="min-w-0 space-y-0.5">
                          <p className="flex items-center gap-1.5 truncate text-[11px] text-[#64748B] dark:text-slate-400 leading-none">
                            <Mail className="h-3 w-3 shrink-0 text-[#64748B] dark:text-slate-400" />
                            <span className="truncate">{emp.email}</span>
                          </p>
                          <p className="flex items-center gap-1.5 truncate text-[11px] text-[#64748B] dark:text-slate-400 leading-none">
                            <Phone className="h-3 w-3 shrink-0 text-[#64748B] dark:text-slate-400" />
                            <span className="truncate">{emp.phone}</span>
                          </p>
                        </div>

                        {/* Bottom-right Action Buttons */}
                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                aria-label={`View ${name}`}
                                onClick={() => navigate(`/employees/${emp.id}`)}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/80"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>View profile</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                aria-label={`Edit ${name}`}
                                onClick={() => setEditing(emp)}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-purple-50 text-purple-600 transition-colors hover:bg-purple-100 hover:text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 dark:hover:bg-purple-900/80"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Edit employee</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                aria-label={`Delete ${name}`}
                                onClick={() => setDeleting(emp)}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 dark:hover:bg-rose-900/80"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Delete employee</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete employee?"
        description={`Remove ${deleting?.firstName} ${deleting?.lastName} from the demo employee list?`}
        confirmLabel="Delete employee"
        onConfirm={() => { if (deleting) deleteEmployee(deleting.id); toast.success('Employee removed from demo list') }}
      />

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update details for {editing?.firstName} {editing?.lastName}. Changes are stored locally in this demo.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <EmployeeForm
              employeeId={editing.employeeId}
              submitLabel="Save Changes"
              excludeEmployeeId={editing.id}
              defaultValues={{
                photo: null,
                firstName: editing.firstName,
                middleName: editing.middleName ?? '',
                lastName: editing.lastName,
                dob: editing.dob,
                gender: editing.gender ?? '',
                maritalStatus: editing.maritalStatus ?? '',
                bloodGroup: editing.bloodGroup ?? '',
                nationality: editing.nationality ?? '',
                fatherName: editing.fatherName ?? '',
                motherName: editing.motherName ?? '',
                personalEmail: editing.personalEmail ?? '',
                workEmail: editing.email,
                primaryMobile: editing.phone,
                alternativeMobile: editing.alternativeMobile ?? '',
                presentAddress: editing.presentAddress ?? editing.address ?? '',
                permanentAddress: editing.permanentAddress ?? '',
                sameAsPresent: false,
                city: editing.city ?? '',
                district: editing.district ?? '',
                postalCode: editing.postalCode ?? '',
                country: editing.country ?? '',
                nidNumber: editing.nidNumber ?? '',
                birthRegistrationNumber: editing.birthRegistrationNumber ?? '',
                passportNumber: editing.passportNumber ?? '',
                passportExpiryDate: editing.passportExpiryDate ?? '',
                tin: editing.tin ?? '',
                employeeId: editing.employeeId,
                joinDate: editing.joinDate,
                department: editing.department,
                designation: editing.designation,
                employmentType: editing.employmentType,
                managerId: editing.managerId ?? '',
                manager: editing.manager,
                employmentStatus: editing.employeeStatus ?? editing.status,
                workLocation: editing.location,
                workMode: editing.workMode ?? 'On-site',
                probationStart: editing.probationStart ?? '',
                probationEnd: editing.probationEnd ?? '',
                confirmationDate: editing.confirmationDate ?? '',
                contractStart: editing.contractStart ?? '',
                contractEnd: editing.contractEnd ?? '',
                shift: editing.shift ?? '',
                weeklyWorkingDays: editing.weeklyWorkingDays ?? '',
                standardHours: editing.standardHours ?? '',
                attendancePolicy: editing.attendancePolicy ?? '',
                salaryType: editing.salaryType ?? 'Monthly',
                basicSalary: String(editing.grossSalary ?? Math.round(editing.salary / 12)),
                hra: String(editing.hra ?? 0),
                medicalAllowance: String(editing.medicalAllowance ?? 0),
                transportAllowance: String(editing.transportAllowance ?? 0),
                otherAllowances: String(editing.otherAllowances ?? 0),
                paymentMethod: editing.paymentMethod ?? 'Bank Transfer',
                education: editing.education ?? [],
                experience: editing.experience ?? [],
                emergencyContacts: editing.emergencyContacts ?? [],
              }}
              onCancel={() => setEditing(null)}
              onSubmit={(values) => {
                updateEmployee(editing.id, employeeFromFormValues(values, editing.employeeId, editing))
                toast.success(`${values.firstName} ${values.lastName} updated in the demo list`)
                setEditing(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
