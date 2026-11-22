import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Sparkles, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DemoNotice } from '@/components/common/DemoNotice'
import { EmployeeForm, employeeFromFormValues } from '@/features/employees/EmployeeForm'
import { generateEmployeeId, useEmployeeStore } from '@/hooks/use-employee-store'

export default function AddEmployee() {
  const navigate = useNavigate()
  const addEmployee = useEmployeeStore((state) => state.addEmployee)
  const employeeId = useMemo(() => generateEmployeeId(), [])

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="-ml-2 mb-1.5 h-8 gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <Link to="/employees">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to employees
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-slate-100">
            Employee Registration
          </h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-2xl">
            Complete the multi-step onboarding wizard to register a new employee with organizational, compensation, and profile details.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start sm:self-center rounded-xl border border-indigo-100 bg-indigo-50/70 px-3.5 py-2 dark:border-indigo-950 dark:bg-indigo-950/40">
          <Sparkles className="h-4 w-4 text-[#4F46E5] dark:text-indigo-400" />
          <div className="text-xs">
            <span className="text-slate-500 dark:text-slate-400">System ID: </span>
            <span className="font-mono font-bold text-[#4F46E5] dark:text-indigo-400">{employeeId}</span>
          </div>
        </div>
      </div>

      <DemoNotice compact />

      <EmployeeForm
        employeeId={employeeId}
        submitLabel="Save Employee"
        submittingLabel="Saving..."
        submitIcon={<UserPlus className="h-4 w-4" />}
        onCancel={() => navigate('/employees')}
        onSubmit={(values) => {
          addEmployee(employeeFromFormValues(values, employeeId))
          toast.success('Employee registered successfully (demo)', {
            description: `${values.firstName} ${values.lastName} · ${employeeId}`,
          })
          navigate('/employees')
        }}
      />
    </div>
  )
}
