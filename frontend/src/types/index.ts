export type ID = string

export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive' | 'Probation'
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave'
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
export type JobStatus = 'Open' | 'Draft' | 'On Hold' | 'Closed'
export type ApplicationStage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected'
export type PayrollStatus = 'Draft' | 'Processing' | 'Completed' | 'Paid'
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical'

export interface Employee {
  id: ID
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  designation: string
  status: EmployeeStatus
  joinDate: string
  location: string
  manager: string
  salary: number
  avatarColor: string
  dob: string
  gender: 'Male' | 'Female' | 'Other'
  address: string
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern'
}

export interface Department {
  id: ID
  name: string
  head: string
  employees: number
  budget: number
  description: string
}

export interface Designation {
  id: ID
  title: string
  department: string
  level: string
  employees: number
}

export interface AttendanceRecord {
  id: ID
  employeeId: string
  employee: string
  department: string
  date: string
  checkIn: string
  checkOut: string
  hours: number
  status: AttendanceStatus
  shift: string
}

export interface Shift {
  id: ID
  name: string
  startTime: string
  endTime: string
  employees: number
  days: string
  flexibility: string
}

export interface LeaveRequest {
  id: ID
  employee: string
  department: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: LeaveStatus
  appliedOn: string
  approver: string
}

export interface LeaveType {
  id: ID
  name: string
  code: string
  annualAllowance: number
  carryForward: boolean
  color: string
  description: string
}

export interface JobOpening {
  id: ID
  title: string
  department: string
  location: string
  type: string
  status: JobStatus
  postedOn: string
  closesOn: string
  applicants: number
  salaryRange: string
  hiringManager: string
  description: string
  requirements: string[]
}

export interface Application {
  id: ID
  candidate: string
  job: string
  email: string
  appliedOn: string
  stage: ApplicationStage
  rating: number
  experience: string
  location: string
}

export interface PayrollRecord {
  id: ID
  employeeId: string
  employee: string
  department: string
  month: string
  basic: number
  allowances: number
  deductions: number
  netPay: number
  status: PayrollStatus
  /** True for records created through the in-app demo payslip generator. */
  generated?: boolean
}

export interface PayrollBatch {
  id: ID
  name: string
  period: string
  employees: number
  totalAmount: number
  status: PayrollStatus
  processedOn: string
}

export interface SalaryStructure {
  id: ID
  designation: string
  department: string
  basic: number
  hra: number
  allowances: number
  bonus: number
  total: number
}

export interface PerformanceReview {
  id: ID
  employee: string
  reviewer: string
  period: string
  rating: number
  status: 'Completed' | 'In Progress' | 'Pending'
  goals: number
  achieved: number
  comments: string
}

export interface Goal {
  id: ID
  title: string
  employee: string
  category: string
  progress: number
  dueDate: string
  priority: Priority
  status: 'On Track' | 'At Risk' | 'Completed' | 'Overdue'
}

export interface Loan {
  id: ID
  employee: string
  type: string
  amount: number
  outstanding: number
  emi: number
  startDate: string
  endDate: string
  status: 'Active' | 'Completed' | 'Pending'
}

export interface Advance {
  id: ID
  employee: string
  amount: number
  reason: string
  requestDate: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Recovered'
  recoveryMonths: number
}

export interface Activity {
  id: ID
  type: 'employee' | 'leave' | 'payroll' | 'recruitment' | 'attendance'
  title: string
  description: string
  time: string
}

export interface User {
  id: ID
  name: string
  email: string
  role: string
  status: 'Active' | 'Inactive'
  lastActive: string
  department: string
}

export interface Role {
  id: ID
  name: string
  description: string
  users: number
  permissions: number
  type: 'System' | 'Custom'
}

export interface Permission {
  id: ID
  module: string
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
  approve: boolean
}
