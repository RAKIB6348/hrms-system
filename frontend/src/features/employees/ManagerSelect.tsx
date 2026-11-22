import { useMemo, useState } from 'react'
import { Check, ChevronDown, Search, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { employees } from '@/mocks/data'
import { initials, cn } from '@/lib/utils'
import type { Employee } from '@/types'

interface ManagerSelectProps {
  value: string
  displayName?: string
  onChange: (employee: Employee | null) => void
  excludeEmployeeId?: string
}

/** Searchable reporting-manager picker backed by the existing employee data. */
export function ManagerSelect({ value, displayName, onChange, excludeEmployeeId }: ManagerSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const candidates = useMemo(() => employees.filter((employee) =>
    employee.status !== 'Inactive' && employee.id !== excludeEmployeeId,
  ), [excludeEmployeeId])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return candidates
    return candidates.filter((employee) =>
      `${employee.firstName} ${employee.lastName} ${employee.employeeId}`.toLowerCase().includes(term),
    )
  }, [candidates, search])

  const selected = employees.find((employee) => employee.id === value)
  const label = selected
    ? `${selected.firstName} ${selected.lastName} · ${selected.employeeId}`
    : displayName || 'Select reporting manager'

  const choose = (employee: Employee | null) => {
    onChange(employee)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setSearch('') }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between font-normal', !selected && !displayName && 'text-muted-foreground')}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[340px] max-w-[90vw] p-2">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or employee ID..."
            className="pl-9"
          />
        </div>
        <div className="scrollbar-thin max-h-60 overflow-y-auto">
          <button
            type="button"
            onClick={() => choose(null)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
          >
            <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">No Reporting Manager</span>
            {!value && <Check className="h-4 w-4 text-primary" />}
          </button>
          {filtered.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">No matching employees found.</p>
          ) : filtered.map((employee) => {
            const name = `${employee.firstName} ${employee.lastName}`
            const isSelected = value === employee.id
            return (
              <button
                key={employee.id}
                type="button"
                onClick={() => choose(employee)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-accent"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback style={{ backgroundColor: employee.avatarColor, color: '#fff' }}>{initials(name)}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{employee.employeeId} · {employee.designation}</span>
                </span>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
