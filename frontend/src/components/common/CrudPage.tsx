import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { cn, randomId } from '@/lib/utils'

export interface FormFieldDef {
  key: string
  label: string
  type?: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea'
  options?: string[]
  placeholder?: string
  required?: boolean
}

interface CrudPageProps<T extends { id: string }> {
  title: string
  description?: string
  data: T[]
  columns: Column<T>[]
  filters?: TableFilter<T>[]
  fields: FormFieldDef[]
  entityName: string
  toValues: (row: T) => Record<string, string>
  fromValues: (values: Record<string, string>, id: string) => T
  onAdd?: () => void
  onView?: (row: T) => void
  renderRowActions?: (row: T, handlers: {
    onView?: () => void
    onEdit: () => void
    onDelete: () => void
  }) => ReactNode
  actionsHeaderClassName?: string
  actionsHeaderLabel?: string
  searchPlaceholder?: string
  pageSize?: number
}

export function CrudPage<T extends { id: string }>({
  title, description, data, columns, filters = [], fields, entityName, toValues, fromValues,
  onAdd, onView, renderRowActions, actionsHeaderClassName, actionsHeaderLabel, searchPlaceholder, pageSize,
}: CrudPageProps<T>) {
  const [rows, setRows] = useState<T[]>(data)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleting, setDeleting] = useState<T | null>(null)

  const openCreate = () => {
    onAdd?.()
    setEditing(null)
    setValues(Object.fromEntries(fields.map((f) => [f.key, f.type === 'select' ? (f.options?.[0] ?? '') : ''])))
    setErrors({})
    setDialogOpen(true)
  }

  const openEdit = (row: T) => {
    setEditing(row)
    setValues(toValues(row))
    setErrors({})
    setDialogOpen(true)
  }

  const save = () => {
    const nextErrors: Record<string, string> = {}
    fields.forEach((f) => {
      if (f.required && !values[f.key]?.trim()) nextErrors[f.key] = `${f.label} is required`
    })
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return }
    if (editing) {
      setRows((prev) => prev.map((row) => row.id === editing.id ? fromValues(values, editing.id) : row))
      toast.success(`${entityName} updated successfully`)
    } else {
      setRows((prev) => [fromValues(values, randomId(entityName.toLowerCase())), ...prev])
      toast.success(`${entityName} created successfully`)
    }
    setDialogOpen(false)
  }

  const actionColumn: Column<T> = {
    key: 'actions', header: actionsHeaderLabel ?? '',
    className: cn('text-right', actionsHeaderClassName),
    cell: (row) => renderRowActions ? (
      renderRowActions(row, {
        onView: onView ? () => onView(row) : undefined,
        onEdit: () => openEdit(row),
        onDelete: () => setDeleting(row),
      })
    ) : (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => openEdit(row)}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onSelect={() => setDeleting(row)}><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add {entityName}</Button>}
      />
      <DemoNotice compact />
      <DataTable
        data={rows} columns={[...columns, actionColumn]} filters={filters}
        searchPlaceholder={searchPlaceholder} pageSize={pageSize}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${entityName}` : `Add ${entityName}`}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the information below.' : 'Fill in the details to create a new record.'} Changes are stored locally in this demo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className={('space-y-1.5 ' + (field.type === 'textarea' ? 'sm:col-span-2' : ''))}>
                <Label htmlFor={field.key}>
                  {field.label}{field.required && <span className="ml-0.5 text-destructive">*</span>}
                </Label>
                {field.type === 'select' ? (
                  <Select value={values[field.key] ?? ''} onValueChange={(v) => setValues((prev) => ({ ...prev, [field.key]: v }))}>
                    <SelectTrigger id={field.key}><SelectValue /></SelectTrigger>
                    <SelectContent>{field.options?.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                ) : field.type === 'textarea' ? (
                  <Textarea
                    id={field.key} value={values[field.key] ?? ''} placeholder={field.placeholder}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  />
                ) : (
                  <Input
                    id={field.key} type={field.type ?? 'text'} value={values[field.key] ?? ''} placeholder={field.placeholder}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  />
                )}
                {errors[field.key] && <p className="text-xs text-destructive">{errors[field.key]}</p>}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save Changes' : `Create ${entityName}`}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${entityName}?`}
        description={`This will remove "${deleting?.id ?? ''}" from the local demo list. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleting) { setRows((prev) => prev.filter((r) => r.id !== deleting.id)); toast.success(`${entityName} deleted`) }
        }}
      />
    </div>
  )
}
