import type {
  SalaryComponent,
  BonusRecord,
  OvertimeRecord,
  LateDeductionRecord,
  PayrollPaymentRecord,
  PayrollSettingsConfig,
} from '@/types/payroll'

export const mockSalaryComponents: SalaryComponent[] = [
  { id: 'sc-1', name: 'Basic Salary', code: 'BSC', type: 'Allowance', calculationType: 'Fixed Amount', value: 50000, status: 'Active', description: 'Core base salary component' },
  { id: 'sc-2', name: 'House Rent Allowance (HRA)', code: 'HRA', type: 'Allowance', calculationType: 'Percentage', value: 50, status: 'Active', description: '50% of Basic Salary' },
  { id: 'sc-3', name: 'Medical Allowance', code: 'MED', type: 'Allowance', calculationType: 'Fixed Amount', value: 5000, status: 'Active', description: 'Monthly healthcare and medical stipend' },
  { id: 'sc-4', name: 'Conveyance Allowance', code: 'CNV', type: 'Allowance', calculationType: 'Fixed Amount', value: 4000, status: 'Active', description: 'Daily travel and commute allowance' },
  { id: 'sc-5', name: 'Special Allowance', code: 'SPC', type: 'Allowance', calculationType: 'Fixed Amount', value: 6500, status: 'Active', description: 'Role-based special duty stipend' },
  { id: 'sc-6', name: 'Tax Deducted at Source (TDS)', code: 'TDS', type: 'Deduction', calculationType: 'Percentage', value: 10, status: 'Active', description: 'Income tax withholding as per NBR rules' },
  { id: 'sc-7', name: 'Provident Fund (PF)', code: 'PF', type: 'Deduction', calculationType: 'Percentage', value: 8.33, status: 'Active', description: 'Statutory employee provident fund deduction' },
  { id: 'sc-8', name: 'Health Insurance Premium', code: 'INS', type: 'Deduction', calculationType: 'Fixed Amount', value: 1200, status: 'Active', description: 'Corporate group hospitalization insurance' },
  { id: 'sc-9', name: 'Late Attendance Penalty', code: 'LATE', type: 'Deduction', calculationType: 'Fixed Amount', value: 500, status: 'Active', description: 'Automated attendance penalty after grace' },
]

export const mockBonuses: BonusRecord[] = [
  { id: 'bon-1', name: 'Eid-ul-Fitr Festival Bonus 2026', type: 'Festival Bonus', targetScope: 'All Employees', targetValue: 'All Active Employees', calculationType: 'Percentage', amount: 100, effectiveDate: '2026-03-25', status: 'Paid', employeesCount: 220 },
  { id: 'bon-2', name: 'Annual Performance Bonus 2026', type: 'Performance Bonus', targetScope: 'Department', targetValue: 'Engineering & Product', calculationType: 'Fixed', amount: 45000, effectiveDate: '2026-12-15', status: 'Confirmed', employeesCount: 78 },
  { id: 'bon-3', name: 'Sales Target Milestone Incentive', type: 'Special Bonus', targetScope: 'Department', targetValue: 'Sales & BD', calculationType: 'Fixed', amount: 35000, effectiveDate: '2026-11-30', status: 'Confirmed', employeesCount: 24 },
  { id: 'bon-4', name: 'Excellence Award Q3', type: 'Special Bonus', targetScope: 'Individual', targetValue: 'Aarav Sharma & Diya Patel', calculationType: 'Fixed', amount: 25000, effectiveDate: '2026-10-15', status: 'Paid', employeesCount: 2 },
  { id: 'bon-5', name: 'Year-End Operational Bonus', type: 'Festival Bonus', targetScope: 'All Employees', targetValue: 'All Active Staff', calculationType: 'Percentage', amount: 50, effectiveDate: '2026-12-30', status: 'Draft', employeesCount: 220 },
]

export const mockOvertime: OvertimeRecord[] = [
  { id: 'ot-1', employeeId: 'PF-1001', employee: 'Aarav Sharma', department: 'Engineering', date: '2026-11-20', hours: 4.5, hourlyRate: 350, calculationMethod: '1.5x Standard Hourly', totalAmount: 2362, status: 'Approved', reason: 'Critical production release support' },
  { id: 'ot-2', employeeId: 'PF-1003', employee: 'Vihaan Mehta', department: 'Sales', date: '2026-11-19', hours: 3.0, hourlyRate: 320, calculationMethod: '1.5x Standard Hourly', totalAmount: 1440, status: 'Approved', reason: 'Late enterprise client proposal preparation' },
  { id: 'ot-3', employeeId: 'PF-1005', employee: 'Arjun Reddy', department: 'Engineering', date: '2026-11-18', hours: 6.0, hourlyRate: 380, calculationMethod: '2.0x Weekend Hourly', totalAmount: 4560, status: 'Approved', reason: 'Database migration and cloud DR testing' },
  { id: 'ot-4', employeeId: 'PF-1007', employee: 'Rohan Gupta', department: 'Design', date: '2026-11-17', hours: 2.5, hourlyRate: 310, calculationMethod: '1.5x Standard Hourly', totalAmount: 1162, status: 'Pending', reason: 'Brand asset turnaround for product launch' },
  { id: 'ot-5', employeeId: 'PF-1008', employee: 'Priya Verma', department: 'Customer Success', date: '2026-11-16', hours: 4.0, hourlyRate: 290, calculationMethod: '1.5x Standard Hourly', totalAmount: 1740, status: 'Pending', reason: 'Emergency customer onboarding weekend session' },
  { id: 'ot-6', employeeId: 'PF-1010', employee: 'Kabir Singh', department: 'Engineering', date: '2026-11-14', hours: 5.0, hourlyRate: 360, calculationMethod: '1.5x Standard Hourly', totalAmount: 2700, status: 'Rejected', reason: 'Unapproved extra hours logged' },
]

export const mockLateDeductions: LateDeductionRecord[] = [
  { id: 'ld-1', employeeId: 'PF-1005', employee: 'Arjun Reddy', department: 'Engineering', attendanceDate: '2026-11-22', scheduledCheckIn: '09:00 AM', actualCheckIn: '09:42 AM', lateMinutes: 42, gracePeriodMinutes: 15, deductionRule: 'Over 30 mins (৳500 / incident)', deductionAmount: 500, status: 'Applied' },
  { id: 'ld-2', employeeId: 'PF-1007', employee: 'Rohan Gupta', department: 'Design', attendanceDate: '2026-11-21', scheduledCheckIn: '09:00 AM', actualCheckIn: '09:35 AM', lateMinutes: 35, gracePeriodMinutes: 15, deductionRule: 'Over 30 mins (৳500 / incident)', deductionAmount: 500, status: 'Applied' },
  { id: 'ld-3', employeeId: 'PF-1003', employee: 'Vihaan Mehta', department: 'Sales', attendanceDate: '2026-11-20', scheduledCheckIn: '09:00 AM', actualCheckIn: '09:28 AM', lateMinutes: 28, gracePeriodMinutes: 15, deductionRule: '15-30 mins warning', deductionAmount: 250, status: 'Waived' },
  { id: 'ld-4', employeeId: 'PF-1009', employee: 'Neha Sharma', department: 'Human Resources', attendanceDate: '2026-11-18', scheduledCheckIn: '09:00 AM', actualCheckIn: '09:55 AM', lateMinutes: 55, gracePeriodMinutes: 15, deductionRule: 'Over 45 mins (Half Shift / ৳750)', deductionAmount: 750, status: 'Pending Review' },
  { id: 'ld-5', employeeId: 'PF-1002', employee: 'Diya Patel', department: 'Human Resources', attendanceDate: '2026-11-15', scheduledCheckIn: '09:00 AM', actualCheckIn: '09:40 AM', lateMinutes: 40, gracePeriodMinutes: 15, deductionRule: 'Over 30 mins (৳500 / incident)', deductionAmount: 500, status: 'Applied' },
]

export const mockPayrollPayments: PayrollPaymentRecord[] = [
  { id: 'pmt-1', employeeId: 'PF-1001', employee: 'Aarav Sharma', department: 'Engineering', batchName: 'November 2026 — Monthly', payslipReference: 'PS-PAY-66CPE2Z', netSalary: 75000, paidAmount: 75000, remainingBalance: 0, paymentDate: '2026-11-22', paymentMethod: 'Bank Transfer', paymentReference: 'BEFTN-2026-9901', status: 'Paid' },
  { id: 'pmt-2', employeeId: 'PF-1002', employee: 'Diya Patel', department: 'Human Resources', batchName: 'November 2026 — Monthly', payslipReference: 'PS-PAY-88B114X', netSalary: 68000, paidAmount: 68000, remainingBalance: 0, paymentDate: '2026-11-22', paymentMethod: 'Bank Transfer', paymentReference: 'BEFTN-2026-9902', status: 'Paid' },
  { id: 'pmt-3', employeeId: 'PF-1003', employee: 'Vihaan Mehta', department: 'Sales', batchName: 'November 2026 — Monthly', payslipReference: 'PS-PAY-33K990M', netSalary: 82000, paidAmount: 50000, remainingBalance: 32000, paymentDate: '2026-11-22', paymentMethod: 'Bank Transfer', paymentReference: 'BEFTN-2026-9903', status: 'Partially Paid' },
  { id: 'pmt-4', employeeId: 'PF-1004', employee: 'Ananya Iyer', department: 'Marketing', batchName: 'November 2026 — Monthly', payslipReference: 'PS-PAY-77D441Q', netSalary: 62000, paidAmount: 0, remainingBalance: 62000, paymentDate: '2026-11-22', paymentMethod: 'Bank Transfer', paymentReference: 'PENDING', status: 'Unpaid' },
  { id: 'pmt-5', employeeId: 'PF-1005', employee: 'Arjun Reddy', department: 'Engineering', batchName: 'November 2026 — Monthly', payslipReference: 'PS-PAY-55P229T', netSalary: 94000, paidAmount: 94000, remainingBalance: 0, paymentDate: '2026-11-22', paymentMethod: 'Mobile Banking', paymentReference: 'BKASH-CORP-4412', status: 'Paid' },
  { id: 'pmt-6', employeeId: 'PF-1006', employee: 'Meera Nair', department: 'Human Resources', batchName: 'November 2026 — Monthly', payslipReference: 'PS-PAY-11R004K', netSalary: 88000, paidAmount: 88000, remainingBalance: 0, paymentDate: '2026-11-22', paymentMethod: 'Bank Transfer', paymentReference: 'BEFTN-2026-9906', status: 'Paid' },
]

export const mockPayrollSettings: PayrollSettingsConfig = {
  defaultCurrency: 'BDT (৳)',
  payPeriod: 'Monthly (Calendar Month)',
  payDay: 28,
  overtimeRateMultiplier: 1.5,
  dailyLateGraceMinutes: 15,
  consecutiveLateDeductionDays: 3,
  bonusTaxDeductible: true,
  defaultPaymentMethod: 'Bank Transfer (BEFTN/RTGS)',
  approverRole: 'Finance Director & HR Head',
  autoGenerateBatch: false,
}
