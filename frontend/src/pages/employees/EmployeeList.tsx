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
import { EmployeeForm } from '@/features/employees/EmployeeForm'
import { employees, departments } from '@/mocks/data'
import { formatCurrency, initials } from '@/lib/utils'
import type { Employee } from '@/types'

const filters: TableFilter<Employee>[] = [
  { key: 'department', label: 'Departments', options: departments.map((d) => d.name), value: (r) => r.department },
  { key: 'status', label: 'Status', options: ['Active', 'On Leave', 'Probation', 'Inactive'], value: (r) => r.status },
]

type ViewMode = 'list' | 'kanban'
const VIEW_STORAGE_KEY = 'hrms-employee-view'

export default function EmployeeList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(employees)
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
    return filters.every((filter) => {
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleEmployees.map((emp) => {
                const name = `${emp.firstName} ${emp.lastName}`
                return (
                  <Card key={emp.id} className="p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarFallback style={{ backgroundColor: emp.avatarColor, color: '#fff' }}>{initials(name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{name}</p>
                          <p className="truncate font-mono text-xs text-muted-foreground">{emp.employeeId}</p>
                        </div>
                      </div>
                      <StatusBadge status={emp.status} />
                    </div>
                    <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                      <p className="truncate text-sm font-medium text-foreground">{emp.designation}</p>
                      <p className="truncate">{emp.department}</p>
                      <p className="flex items-center gap-1.5 truncate"><Mail className="h-3.5 w-3.5 shrink-0" />{emp.email}</p>
                      <p className="flex items-center gap-1.5 truncate"><Phone className="h-3.5 w-3.5 shrink-0" />{emp.phone}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-1.5 border-t pt-3">
                      <ActionIconButton variant="view" icon={Eye} label={`View ${name}`} tooltip="View profile" onClick={() => navigate(`/employees/${emp.id}`)} />
                      <ActionIconButton variant="edit" icon={Pencil} label={`Edit ${name}`} tooltip="Edit employee" onClick={() => setEditing(emp)} />
                      <ActionIconButton variant="delete" icon={Trash2} label={`Delete ${name}`} tooltip="Delete employee" onClick={() => setDeleting(emp)} />
                    </div>
                  </Card>
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
        onConfirm={() => { if (deleting) setRows((prev) => prev.filter((e) => e.id !== deleting.id)); toast.success('Employee removed from demo list') }}
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
              submitLabel="Save Changes"
              excludeEmployeeId={editing.id}
              defaultValues={{
                firstName: editing.firstName,
                lastName: editing.lastName,
                email: editing.email,
                phone: editing.phone,
                department: editing.department,
                designation: editing.designation,
                employmentType: editing.employmentType,
                joinDate: editing.joinDate,
                location: editing.location,
                salary: String(editing.salary),
                manager: editing.manager,
                managerId: editing.managerId ?? '',
                address: editing.address,
              }}
              onCancel={() => setEditing(null)}
              onSubmit={(values) => {
                setRows((prev) => prev.map((row) => row.id === editing.id ? {
                  ...row,
                  ...values,
                  employmentType: values.employmentType as Employee['employmentType'],
                  salary: Number(values.salary),
                  manager: values.manager ?? '',
                  address: values.address ?? '',
                } : row))
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
