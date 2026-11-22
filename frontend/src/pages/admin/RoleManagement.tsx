import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Shield, Users } from 'lucide-react'
import { DemoNotice } from '@/components/common/DemoNotice'
import { CrudPage, type FormFieldDef } from '@/components/common/CrudPage'
import { Badge } from '@/components/ui/badge'
import { roles } from '@/mocks/data'
import type { Role } from '@/types'

const fields: FormFieldDef[] = [
  { key: 'name', label: 'Role Name', required: true, placeholder: 'e.g. HR Manager' },
  { key: 'description', label: 'Description', type: 'textarea', required: true },
  { key: 'users', label: 'Users', type: 'number', required: true },
  { key: 'permissions', label: 'Permissions', type: 'number', required: true },
  { key: 'type', label: 'Type', type: 'select', options: ['System', 'Custom'], required: true },
]

export default function RoleManagement() {
  const [refresh] = useState(0)
  return (
    <div key={refresh} className="space-y-6">
      <CrudPage
        title="Role Management"
        description="Define access roles and their responsibility scope."
        data={roles} entityName="Role" fields={fields} searchPlaceholder="Search roles..."
        onAdd={() => toast.info('Role templates are predefined in this demo')}
        columns={[
          { key: 'name', header: 'Role', cell: (r) => <span className="flex items-center gap-2 font-medium"><Shield className="h-4 w-4 text-primary" />{r.name}</span>, sortValue: (r) => r.name },
          { key: 'description', header: 'Description', cell: (r) => <span className="line-clamp-1 text-muted-foreground">{r.description}</span> },
          { key: 'users', header: 'Users', cell: (r) => <Badge variant="secondary">{r.users}</Badge>, sortValue: (r) => r.users },
          { key: 'permissions', header: 'Permissions', cell: (r) => <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-muted-foreground" />{r.permissions}</span>, sortValue: (r) => r.permissions },
          { key: 'type', header: 'Type', cell: (r) => <Badge variant={r.type === 'System' ? 'outline' : 'info'}>{r.type}</Badge> },
        ]}
        toValues={(r: Role) => ({ name: r.name, description: r.description, users: String(r.users), permissions: String(r.permissions), type: r.type })}
        fromValues={(v, id): Role => ({ id, name: v.name!, description: v.description!, users: Number(v.users), permissions: Number(v.permissions), type: v.type as Role['type'] })}
      />
      <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
        <Plus className="h-3.5 w-3.5" /> Custom roles can be created locally in this demo.
      </div>
      <DemoNotice compact />
    </div>
  )
}
