import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Download, MoreHorizontal, Pencil, Plus, Trash2, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
        rowActions={(emp) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => navigate(`/employees/${emp.id}`)}><UserRound className="h-4 w-4" /> View profile</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => toast.info('Edit employee form is available on the Add Employee page (demo)')}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onSelect={() => setDeleting(emp)}><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
      <ConfirmDialog
        open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete employee?"
        description={`Remove ${deleting?.firstName} ${deleting?.lastName} from the demo employee list?`}
        confirmLabel="Delete employee"
        onConfirm={() => { if (deleting) setRows((prev) => prev.filter((e) => e.id !== deleting.id)); toast.success('Employee removed from demo list') }}
      />
    </div>
  )
}
