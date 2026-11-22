import { useState } from 'react'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { users } from '@/mocks/data'
import { initials } from '@/lib/utils'
import type { User } from '@/types'

const filters: TableFilter<User>[] = [
  { key: 'status', label: 'Status', options: ['Active', 'Inactive'], value: (r) => r.status },
  { key: 'role', label: 'Roles', options: [...new Set(users.map((u) => u.role))], value: (r) => r.role },
]

const columns: Column<User>[] = [
  {
    key: 'name', header: 'User',
    cell: (u) => <div className="flex items-center gap-2.5"><Avatar className="h-8 w-8"><AvatarFallback>{initials(u.name)}</AvatarFallback></Avatar><div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div></div>,
    sortValue: (u) => u.name,
  },
  { key: 'role', header: 'Role', cell: (u) => <Badge variant="secondary">{u.role}</Badge>, sortValue: (u) => u.role },
  { key: 'department', header: 'Department', cell: (u) => <span className="text-muted-foreground">{u.department}</span> },
  { key: 'lastActive', header: 'Last Active', cell: (u) => u.lastActive },
  { key: 'status', header: 'Status', cell: (u) => <StatusBadge status={u.status} /> },
]

export default function UserManagement() {
  const [rows, setRows] = useState(users)

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage system users, access and account status."
        actions={<Button onClick={() => toast.success('New user invitation sent (demo)')}><UserPlus className="h-4 w-4" /> Add User</Button>}
      />
      <DemoNotice compact />
      <DataTable
        data={rows} columns={columns} filters={filters} searchPlaceholder="Search users..."
        rowActions={(user) => (
          <Button
            variant="ghost" size="sm" className="h-8 text-xs" onClick={(e) => {
              e.stopPropagation()
              setRows((prev) => prev.map((r) => r.id === user.id ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r))
              toast.success(`${user.name} ${user.status === 'Active' ? 'deactivated' : 'activated'}`)
            }}
          >
            {user.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
        )}
      />
    </div>
  )
}
