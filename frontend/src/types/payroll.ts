export interface SalaryComponent {
  id: string
  name: string
  code: string
  type: 'Allowance' | 'Deduction'
  calculationType: 'Fixed Amount' | 'Percentage'
  value: number
  status: 'Active' | 'Inactive'
  description?: string
}

export interface BonusRecord {
  id: string
  name: string
  type: 'Festival Bonus' | 'Performance Bonus' | 'Special Bonus'
  targetScope: 'All Employees' | 'Department' | 'Individual'
  targetValue: string
  calculationType: 'Fixed' | 'Percentage'
  amount: number
  effectiveDate: string
  status: 'Draft' | 'Confirmed' | 'Paid' | 'Cancelled'
  employeesCount: number
}

export interface OvertimeRecord {
  id: string
  employeeId: string
  employee: string
  department: string
  date: string
  hours: number
  hourlyRate: number
  calculationMethod: string
  totalAmount: number
  status: 'Approved' | 'Pending' | 'Rejected'
  reason?: string
}

export interface LateDeductionRecord {
  id: string
  employeeId: string
  employee: string
  department: string
  attendanceDate: string
  scheduledCheckIn: string
  actualCheckIn: string
  lateMinutes: number
  gracePeriodMinutes: number
  deductionRule: string
  deductionAmount: number
  status: 'Applied' | 'Waived' | 'Pending Review'
}

export interface PayrollPaymentRecord {
  id: string
  employeeId: string
  employee: string
  department: string
  batchName: string
  payslipReference: string
  netSalary: number
  paidAmount: number
  remainingBalance: number
  paymentDate: string
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Mobile Banking'
  paymentReference: string
  status: 'Paid' | 'Partially Paid' | 'Unpaid'
}

export interface PayrollSettingsConfig {
  defaultCurrency: string
  payPeriod: string
  payDay: number
  overtimeRateMultiplier: number
  dailyLateGraceMinutes: number
  consecutiveLateDeductionDays: number
  bonusTaxDeductible: boolean
  defaultPaymentMethod: string
  approverRole: string
  autoGenerateBatch: boolean
}
