import { useState } from 'react'
import { BriefcaseBusiness, Eye, Layers, Pencil, Trash2, Users } from 'lucide-react'
import { CrudPage, type FormFieldDef } from '@/components/common/CrudPage'
import { ActionIconButton } from '@/components/common/ActionIconButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { designations, departments, employees } from '@/mocks/data'
import { initials } from '@/lib/utils'
import type { Designation } from '@/types'

const fields: FormFieldDef[] = [
  { key: 'title', label: 'Designation Title', required: true, placeholder: 'e.g. Product Manager' },
  { key: 'department', label: 'Department', type: 'select', options: departments.map((d) => d.name), required: true },
  { key: 'level', label: 'Job Level', type: 'select', options: ['L1', 'L2', 'L3', 'L4', 'M1', 'M2'], required: true },
  { key: 'employees', label: 'Employee Count', type: 'number', required: true },
]

export default function Designations() {
  const [viewing, setViewing] = useState<Designation | null>(null)
  const members = viewing ? employees.filter((employee) => employee.designation === viewing.title) : []

  return (
    <>
      <CrudPage
        title="Designations"
        description="Define job titles, levels and their reporting structure."
        data={designations}
        entityName="Designation"
        fields={fields}
        searchPlaceholder="Search designations..."
        filters={[{ key: 'department', label: 'Departments', options: departments.map((d) => d.name), value: (r: Designation) => r.department }]}
        actionsHeaderClassName="w-[132px] text-right"
        actionsHeaderLabel="Actions"
        onView={(designation) => setViewing(designation)}
        renderRowActions={(designation, handlers) => (
          <div className="flex items-center justify-end gap-1.5">
            <ActionIconButton variant="view" icon={Eye} label={`View ${designation.title}`} tooltip="View designation details" onClick={handlers.onView} />
            <ActionIconButton variant="edit" icon={Pencil} label={`Edit ${designation.title}`} tooltip="Edit designation" onClick={handlers.onEdit} />
            <ActionIconButton variant="delete" icon={Trash2} label={`Delete ${designation.title}`} tooltip="Delete designation" onClick={handlers.onDelete} />
          </div>
        )}
        columns={[
          { key: 'title', header: 'Title', cell: (d) => <span className="font-medium">{d.title}</span>, sortValue: (d) => d.title },
          { key: 'department', header: 'Department', cell: (d) => d.department, sortValue: (d) => d.department },
          { key: 'level', header: 'Level', cell: (d) => <Badge variant="outline">{d.level}</Badge>, sortValue: (d) => d.level },
          { key: 'employees', header: 'Employees', cell: (d) => <Badge variant="secondary">{d.employees}</Badge>, sortValue: (d) => d.employees },
        ]}
        toValues={(d: Designation) => ({ title: d.title, department: d.department, level: d.level, employees: String(d.employees) })}
        fromValues={(v, id): Designation => ({
          id, title: v.title!, department: v.department!, level: v.level!, employees: Number(v.employees),
        })}
      />

      <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
            <DialogDescription>Designation details · demonstration data</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail icon={BriefcaseBusiness} label="Department" value={viewing.department} />
                <Detail icon={Layers} label="Job Level" value={viewing.level} />
                <Detail icon={Users} label="Employees" value={`${viewing.employees}`} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Employees in this role</p>
                <div className="scrollbar-thin max-h-44 space-y-2 overflow-y-auto">
                  {members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No employees are assigned to this designation.</p>
                  ) : members.slice(0, 6).map((employee) => (
                    <div key={employee.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback style={{ backgroundColor: employee.avatarColor, color: '#fff' }}>
                          {initials(`${employee.firstName} ${employee.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{employee.firstName} {employee.lastName}</p>
                        <p className="truncate text-xs text-muted-foreground">{employee.department}</p>
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
