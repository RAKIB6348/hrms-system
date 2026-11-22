import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { permissions } from '@/mocks/data'
import type { Permission } from '@/types'

const actions: (keyof Permission)[] = ['view', 'create', 'edit', 'delete', 'approve']

export default function Permissions() {
  const [rows, setRows] = useState(permissions)

  const toggle = (id: string, action: keyof Permission) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [action]: !r[action] } : r))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions"
        description="Configure module-level access rights for each role."
        actions={<Button onClick={() => toast.success('Permissions saved (demo)')}><CheckCircle2 className="h-4 w-4" /> Save Changes</Button>}
      />
      <DemoNotice compact />

      <Card>
        <div className="flex items-center gap-2 border-b p-4 text-sm">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="font-medium">Role: HR Admin</span>
          <span className="text-muted-foreground">— toggle actions granted per module</span>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Module</TableHead>
                {actions.map((a) => <TableHead key={a} className="text-center capitalize">{a}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.module}</TableCell>
                  {actions.map((action) => (
                    <TableCell key={action} className="text-center">
                      <Checkbox
                        checked={Boolean(row[action])}
                        onCheckedChange={() => toggle(row.id, action)}
                        aria-label={`${action} ${row.module}`}
                        className="mx-auto"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
