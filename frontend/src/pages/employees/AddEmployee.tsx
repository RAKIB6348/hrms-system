import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, UserPlus } from 'lucide-react'
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
      <Button variant="ghost" size="sm" asChild><Link to="/employees"><ArrowLeft className="h-4 w-4" /> Back to employees</Link></Button>
      <DemoNotice compact />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Employee Registration</h1>
        <p className="text-sm text-muted-foreground">
          Complete the employee details below. Identity and banking details remain session-only in this frontend demo.
        </p>
      </div>

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
