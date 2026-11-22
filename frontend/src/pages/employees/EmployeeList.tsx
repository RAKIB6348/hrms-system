import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Download, Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EmployeeForm } from '@/features/employees/EmployeeForm'
import { employees, departments } from '@/mocks/data'
import { formatCurrency, initials } from '@/lib/utils'
import type { Employee } from '@/types'

const filters: TableFilter<Employee>[] = [
  { key: 'department', label: 'Departments', options: departments.map((d) => d.name), value: (r) => r.department },
  { key: 'status', label: 'Status', options: ['Active', 'On Leave', 'Probation', 'Inactive'], value: (r) => r.status },
]

export default function EmployeeList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(employees)
  const [deleting, setDeleting] = useState<Employee | null>(null)
  const [editing, setEditing] = useState<Employee | null>(null)

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your workforce, profiles and organizational details."
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success('Employee data export started (demo)')}><Download className="h-4 w-4" /> Export</Button>
            <Button asChild><Link to="/employees/new"><Plus className="h-4 w-4" /> Add Employee</Link></Button>
          </>
        }
      />
      <DemoNotice compact />
      <DataTable
        data={rows}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search employees by name, email or ID..."
        onRowClick={(emp) => navigate(`/employees/${emp.id}`)}
        rowActions={(emp) => {
          const name = `${emp.firstName} ${emp.lastName}`
          return (
            <div className="flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-sky-600 hover:bg-sky-500/10 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                    aria-label={`View ${name}`}
                    onClick={() => navigate(`/employees/${emp.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View profile</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-violet-600 hover:bg-violet-500/10 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                    aria-label={`Edit ${name}`}
                    onClick={() => setEditing(emp)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit employee</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    aria-label={`Delete ${name}`}
                    onClick={() => setDeleting(emp)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete employee</TooltipContent>
              </Tooltip>
            </div>
          )
        }}
      />

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
