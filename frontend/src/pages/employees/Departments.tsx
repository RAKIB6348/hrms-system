import { useState } from 'react'
import { toast } from 'sonner'
import { Eye, Pencil, Trash2, UserRound, Users, Wallet } from 'lucide-react'
import { CrudPage, type FormFieldDef } from '@/components/common/CrudPage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { departments, employees } from '@/mocks/data'
import { formatCurrency, initials } from '@/lib/utils'
import type { Department } from '@/types'

const fields: FormFieldDef[] = [
  { key: 'name', label: 'Department Name', required: true, placeholder: 'e.g. Research' },
  { key: 'head', label: 'Department Head', required: true, placeholder: 'Full name' },
  { key: 'employees', label: 'Employee Count', type: 'number', required: true },
  { key: 'budget', label: 'Annual Budget', type: 'number', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
]

export default function Departments() {
  const [viewing, setViewing] = useState<Department | null>(null)
  const members = viewing ? employees.filter((employee) => employee.department === viewing.name) : []

  return (
    <>
      <CrudPage
        title="Departments"
        description="Organize employees into departments and manage department heads."
        data={departments}
        entityName="Department"
        fields={fields}
        searchPlaceholder="Search departments..."
        actionsHeaderClassName="w-[132px] text-right"
        actionsHeaderLabel="Actions"
        onView={(department) => setViewing(department)}
        renderRowActions={(department, handlers) => {
          const hasEmployees = department.employees > 0
          return (
            <div className="flex items-center justify-end gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-sky-600 hover:bg-sky-500/10 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                    aria-label={`View ${department.name}`}
                    onClick={handlers.onView}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View department details</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-violet-600 hover:bg-violet-500/10 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                    aria-label={`Edit ${department.name}`}
                    onClick={handlers.onEdit}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit department</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="icon" className={`h-8 w-8 text-destructive hover:bg-destructive/10 ${hasEmployees ? 'opacity-40' : ''}`}
                    aria-label={`Delete ${department.name}`}
                    aria-disabled={hasEmployees}
                    onClick={() => {
                      if (hasEmployees) {
                        toast.info(`${department.name} has ${department.employees} employees assigned — delete is unavailable`)
                        return
                      }
                      handlers.onDelete()
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {hasEmployees ? `Cannot delete: ${department.employees} employees assigned` : 'Delete department'}
                </TooltipContent>
              </Tooltip>
            </div>
          )
        }}
        columns={[
          { key: 'name', header: 'Department', cell: (d) => <span className="font-medium">{d.name}</span>, sortValue: (d) => d.name },
          { key: 'head', header: 'Head', cell: (d) => d.head, sortValue: (d) => d.head },
          { key: 'employees', header: 'Employees', cell: (d) => <Badge variant="secondary">{d.employees}</Badge>, sortValue: (d) => d.employees },
          { key: 'budget', header: 'Annual Budget', cell: (d) => formatCurrency(d.budget), sortValue: (d) => d.budget },
          { key: 'description', header: 'Description', cell: (d) => <span className="line-clamp-1 text-muted-foreground">{d.description}</span> },
        ]}
        toValues={(d: Department) => ({ name: d.name, head: d.head, employees: String(d.employees), budget: String(d.budget), description: d.description })}
        fromValues={(v, id): Department => ({
          id, name: v.name!, head: v.head!, employees: Number(v.employees), budget: Number(v.budget),
          description: v.description ?? '',
        })}
      />

      <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>Department details · demonstration data</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail icon={UserRound} label="Department Head" value={viewing.head} />
                <Detail icon={Users} label="Employees" value={`${viewing.employees}`} />
                <Detail icon={Wallet} label="Annual Budget" value={formatCurrency(viewing.budget)} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Description</p>
                <p className="text-sm text-muted-foreground">{viewing.description}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Employees in this department</p>
                <div className="scrollbar-thin max-h-44 space-y-2 overflow-y-auto">
                  {members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No employees are assigned to this department.</p>
                  ) : members.slice(0, 6).map((employee) => (
                    <div key={employee.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback style={{ backgroundColor: employee.avatarColor, color: '#fff' }}>
                          {initials(`${employee.firstName} ${employee.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{employee.firstName} {employee.lastName}</p>
                        <p className="truncate text-xs text-muted-foreground">{employee.designation}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{employee.employeeId}</Badge>
                    </div>
                  ))}
                  {members.length > 6 && (
                    <p className="text-xs text-muted-foreground">+ {members.length - 6} more employees in the demo data.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Detail({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate font-semibold">{value}</p></div>
    </div>
  )
}
