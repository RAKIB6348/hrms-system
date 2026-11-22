import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DemoNotice } from '@/components/common/DemoNotice'
import { EmployeeForm } from '@/features/employees/EmployeeForm'

export default function AddEmployee() {
  const navigate = useNavigate()

  return (
    <div className="w-full space-y-6 sm:px-1 lg:px-2">
      <Button variant="ghost" size="sm" asChild><Link to="/employees"><ArrowLeft className="h-4 w-4" /> Back to employees</Link></Button>
      <DemoNotice compact />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Add New Employee</h1>
        <p className="text-sm text-muted-foreground">Create a new employee record with validated information.</p>
      </div>

      <EmployeeForm
        submitLabel="Create Employee"
        submittingLabel="Creating..."
        submitIcon={<UserPlus className="h-4 w-4" />}
        onCancel={() => navigate('/employees')}
        onSubmit={async () => {
          await new Promise((resolve) => setTimeout(resolve, 500))
          toast.success('Employee created successfully (demo)', { description: 'The record would now be sent to your HR API.' })
          navigate('/employees')
        }}
      />
    </div>
  )
}
