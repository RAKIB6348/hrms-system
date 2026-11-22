import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { FilePlus2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DemoNotice } from '@/components/common/DemoNotice'
import { usePayrollStore, type GeneratePayslipsResult } from '@/hooks/use-payroll-store'
import { employees } from '@/mocks/data'
import { initials } from '@/lib/utils'

const MONTH_OPTIONS = ['December 2026', 'January 2027', 'February 2027', 'November 2026']

interface GeneratePayslipsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerated?: (result: GeneratePayslipsResult) => void
}

/**
 * Frontend-only demo workflow: creates sample payslip records from mock
 * employee and salary data. No payment is made and no backend is contacted.
 */
export function GeneratePayslipsDialog({ open, onOpenChange, onGenerated }: GeneratePayslipsDialogProps) {
  const generatePayslips = usePayrollStore((state) => state.generatePayslips)
  const [month, setMonth] = useState('December 2026')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return employees
    return employees.filter((employee) =>
      `${employee.firstName} ${employee.lastName} ${employee.employeeId} ${employee.department}`
        .toLowerCase()
        .includes(term),
    )
  }, [search])

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)))
  }

  const generate = () => {
    const result = generatePayslips({ employeeIds: selected, month })
    if (result.created === 0) {
      toast.info('No new payslips generated — those employees already have a record for this month')
      return
    }
    toast.success(`${result.created} demo payslip${result.created === 1 ? '' : 's'} generated`, {
      description: `Month: ${month} · Status: Processing (no payment has been made)`,
    })
    setSelected([])
    setSearch('')
    onOpenChange(false)
    onGenerated?.(result)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FilePlus2 className="h-5 w-5 text-primary" /> Generate Demo Payslips</DialogTitle>
          <DialogDescription>
            Create sample payslip records from the mock employee data. Generated records are local demo data only.
          </DialogDescription>
        </DialogHeader>

        <DemoNotice compact />

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Payroll Month</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{MONTH_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Employees</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{selected.length} selected</span>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelected(filteredEmployees.map((e) => e.employeeId))}>
                  Select all
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelected([])} disabled={selected.length === 0}>
                  Clear
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." className="pl-9" />
            </div>
            <div className="scrollbar-thin max-h-52 overflow-y-auto rounded-lg border">
              {filteredEmployees.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">No employees match your search.</p>
              ) : filteredEmployees.map((employee) => (
                <label
                  key={employee.id}
                  className="flex cursor-pointer items-center gap-3 border-b p-2.5 last:border-b-0 hover:bg-accent/60"
                >
                  <Checkbox
                    checked={selected.includes(employee.employeeId)}
                    onCheckedChange={(checked) => toggle(employee.employeeId, checked === true)}
                    aria-label={`Select ${employee.firstName} ${employee.lastName}`}
                  />
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {initials(`${employee.firstName} ${employee.lastName}`)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{employee.firstName} {employee.lastName}</span>
                    <span className="block truncate text-xs text-muted-foreground">{employee.employeeId} · {employee.department}</span>
                  </span>
                  <Badge variant="outline" className="shrink-0 text-[10px]">{employee.location}</Badge>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={generate} disabled={selected.length === 0}>
            Generate {selected.length || ''} Demo Payslip{selected.length === 1 ? '' : 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
