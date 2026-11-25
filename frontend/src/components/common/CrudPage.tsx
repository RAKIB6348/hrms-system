import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { AlertCircle, MoreHorizontal, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select'
import { TimePicker } from '@/components/ui/time-picker'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn, randomId } from '@/lib/utils'

export interface FormFieldDef {
  key: string
  label: string
  type?: 'text' | 'number' | 'email' | 'date' | 'time' | 'select' | 'searchable-select' | 'textarea'
  options?: (string | SearchableSelectOption)[]
  placeholder?: string
  searchPlaceholder?: string
  required?: boolean
  colSpan?: 1 | 2
  icon?: any
  helperText?: string
}

interface CrudPageProps<T extends { id: string }> {
  title: string
  description?: string
  data: T[]
  columns: Column<T>[]
  filters?: TableFilter<T>[]
  fields: FormFieldDef[]
  entityName: string
  entityIcon?: any
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
  title, description, data, columns, filters = [], fields, entityName, entityIcon: EntityIcon, toValues, fromValues,
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
    setValues(
      Object.fromEntries(
        fields.map((f) => {
          if (f.type === 'select' && f.options?.[0]) {
            const first = f.options[0]
            return [f.key, typeof first === 'string' ? first : first.value]
          }
          return [f.key, '']
        }),
      ),
    )
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
        actions={
          <Button
            onClick={openCreate}
            className="h-[42px] px-5 rounded-lg text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/25 transition-all"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add {entityName}
          </Button>
        }
      />
      <DemoNotice compact />
      <DataTable
        data={rows} columns={[...columns, actionColumn]} filters={filters}
        searchPlaceholder={searchPlaceholder} pageSize={pageSize}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#4F46E5] ring-1 ring-indigo-500/10 dark:bg-indigo-950/50 dark:text-indigo-400">
                {editing ? <Pencil className="h-5 w-5" /> : (EntityIcon ? <EntityIcon className="h-5 w-5" /> : <Plus className="h-5 w-5" />)}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
                  {editing ? `Edit ${entityName}` : `Add ${entityName}`}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
                  {editing
                    ? `Update the details below for this ${entityName.toLowerCase()}.`
                    : `Fill in the details to create a new ${entityName.toLowerCase()} record.`} Changes are stored locally in this demo.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-3 sm:grid-cols-2">
            {fields.map((field) => {
              const FieldIcon = field.icon
              const isColSpan2 = field.type === 'textarea' || field.colSpan === 2
              return (
                <div
                  key={field.key}
                  className={cn('space-y-1.5', isColSpan2 ? 'sm:col-span-2' : '')}
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.key} className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {field.label}
                      {field.required && <span className="ml-1 text-rose-500 font-bold">*</span>}
                    </Label>
                  </div>

                  {field.type === 'select' ? (
                    <div className="relative">
                      {FieldIcon && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                          <FieldIcon className="h-4 w-4" />
                        </div>
                      )}
                      <Select
                        value={values[field.key] ?? ''}
                        onValueChange={(v) => {
                          setValues((prev) => ({ ...prev, [field.key]: v }))
                          if (errors[field.key]) setErrors((prev) => ({ ...prev, [field.key]: '' }))
                        }}
                      >
                        <SelectTrigger
                          id={field.key}
                          className={cn(
                            'h-[42px] rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-sm shadow-2xs transition-colors hover:border-slate-400 focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-indigo-500/20',
                            FieldIcon ? 'pl-9' : 'px-3.5',
                          )}
                        >
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((o) => {
                            const val = typeof o === 'string' ? o : o.value
                            const lbl = typeof o === 'string' ? o : o.label
                            return (
                              <SelectItem key={val} value={val}>
                                {lbl}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : field.type === 'searchable-select' ? (
                    <div className="relative">
                      {FieldIcon && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                          <FieldIcon className="h-4 w-4" />
                        </div>
                      )}
                      <SearchableSelect
                        id={field.key}
                        value={values[field.key] ?? ''}
                        options={field.options ?? []}
                        placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`}
                        searchPlaceholder={field.searchPlaceholder ?? `Search ${field.label.toLowerCase()}...`}
                        className={FieldIcon ? 'pl-9' : undefined}
                        onValueChange={(v) => {
                          setValues((prev) => ({ ...prev, [field.key]: v }))
                          if (errors[field.key]) setErrors((prev) => ({ ...prev, [field.key]: '' }))
                        }}
                      />
                    </div>
                  ) : field.type === 'time' ? (
                    <div className="relative">
                      {FieldIcon && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                          <FieldIcon className="h-4 w-4" />
                        </div>
                      )}
                      <TimePicker
                        id={field.key}
                        value={values[field.key] ?? ''}
                        placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`}
                        className={FieldIcon ? 'pl-9' : undefined}
                        onValueChange={(v) => {
                          setValues((prev) => ({ ...prev, [field.key]: v }))
                          if (errors[field.key]) setErrors((prev) => ({ ...prev, [field.key]: '' }))
                        }}
                      />
                    </div>
                  ) : field.type === 'textarea' ? (
                    <div className="relative">
                      {FieldIcon && (
                        <div className="pointer-events-none absolute top-3 left-3 text-slate-400 dark:text-slate-500">
                          <FieldIcon className="h-4 w-4" />
                        </div>
                      )}
                      <Textarea
                        id={field.key}
                        value={values[field.key] ?? ''}
                        placeholder={field.placeholder}
                        className={cn(
                          'rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-3 text-sm leading-relaxed shadow-2xs transition-colors hover:border-slate-400 focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-indigo-500/20',
                          FieldIcon ? 'pl-9' : 'px-3.5',
                        )}
                        onChange={(e) => {
                          setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                          if (errors[field.key]) setErrors((prev) => ({ ...prev, [field.key]: '' }))
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      {FieldIcon && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                          <FieldIcon className="h-4 w-4" />
                        </div>
                      )}
                      <Input
                        id={field.key}
                        type={field.type ?? 'text'}
                        value={values[field.key] ?? ''}
                        placeholder={field.placeholder}
                        className={cn(
                          'h-[42px] rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-sm shadow-2xs transition-colors hover:border-slate-400 focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-indigo-500/20',
                          FieldIcon ? 'pl-9' : 'px-3.5',
                        )}
                        onChange={(e) => {
                          setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                          if (errors[field.key]) setErrors((prev) => ({ ...prev, [field.key]: '' }))
                        }}
                      />
                    </div>
                  )}

                  {field.helperText && (
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">{field.helperText}</p>
                  )}

                  {errors[field.key] && (
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {errors[field.key]}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="h-[42px] px-4 rounded-lg text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={save}
              className="h-[42px] px-5 rounded-lg text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5"
            >
              {editing ? <Save className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              {editing ? 'Save Changes' : `Create ${entityName}`}
            </Button>
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
