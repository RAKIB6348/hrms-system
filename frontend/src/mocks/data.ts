/**
 * ---------------------------------------------------------------------------
 * DEMONSTRATION DATA ONLY
 * ---------------------------------------------------------------------------
 * Every record in this file is fictional sample data used to demonstrate the
 * HRMS interface. Nothing here connects to a database, API, or backend
 * service. Replace this module with real data-fetching functions when wiring
 * up a production API (see `src/hooks/use-mock-query.ts` for the seam).
 */
import type {
  Activity,
  Advance,
  Application,
  AttendanceRecord,
  Department,
  Designation,
  Employee,
  Goal,
  JobOpening,
  LeaveRequest,
  LeaveType,
  Loan,
  PayrollBatch,
  PayrollRecord,
  PerformanceReview,
  Permission,
  Role,
  SalaryStructure,
  Shift,
  User,
} from '@/types'

export const DEMO_NOTICE =
  'Demonstration data — all records shown are fictional sample data for UI preview only.'

const firstNames = [
  'Aarav', 'Diya', 'Vihaan', 'Ananya', 'Arjun', 'Meera', 'Rohan', 'Priya',
  'Kabir', 'Isha', 'Aditya', 'Neha', 'Vikram', 'Sanya', 'Rahul', 'Kavya',
  'Nikhil', 'Riya', 'Siddharth', 'Pooja', 'Dev', 'Naina', 'Arnav', 'Tara',
]
const lastNames = [
  'Sharma', 'Patel', 'Mehta', 'Iyer', 'Reddy', 'Nair', 'Gupta', 'Verma',
  'Singh', 'Kapoor', 'Rao', 'Joshi', 'Hegde', 'Malhotra', 'Chopra', 'Banerjee',
  'Das', 'Menon', 'Kulkarni', 'Shah', 'Pillai', 'Bose', 'Fernandes', 'Chauhan',
]
const avatarColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9',
  '#f43f5e', '#14b8a6', '#a855f7', '#f97316', '#3b82f6', '#84cc16',
]

export const departments: Department[] = [
  { id: 'dep-1', name: 'Engineering', head: 'Vikram Rao', employees: 68, budget: 4200000, description: 'Product development, platform and infrastructure.' },
  { id: 'dep-2', name: 'Human Resources', head: 'Meera Nair', employees: 14, budget: 780000, description: 'Talent acquisition, people operations and culture.' },
  { id: 'dep-3', name: 'Sales', head: 'Arjun Gupta', employees: 32, budget: 1950000, description: 'Revenue growth, accounts and partnerships.' },
  { id: 'dep-4', name: 'Marketing', head: 'Isha Kapoor', employees: 18, budget: 1120000, description: 'Brand, demand generation and content.' },
  { id: 'dep-5', name: 'Finance', head: 'Rahul Shah', employees: 12, budget: 690000, description: 'Accounting, compliance and financial planning.' },
  { id: 'dep-6', name: 'Operations', head: 'Priya Verma', employees: 24, budget: 980000, description: 'Business operations and customer support.' },
  { id: 'dep-7', name: 'Design', head: 'Naina Bose', employees: 11, budget: 640000, description: 'Product design, research and user experience.' },
  { id: 'dep-8', name: 'Customer Success', head: 'Sanya Menon', employees: 21, budget: 870000, description: 'Onboarding, retention and customer advocacy.' },
]

export const designations: Designation[] = [
  { id: 'des-1', title: 'Software Engineer', department: 'Engineering', level: 'L3', employees: 24 },
  { id: 'des-2', title: 'Senior Software Engineer', department: 'Engineering', level: 'L4', employees: 16 },
  { id: 'des-3', title: 'Engineering Manager', department: 'Engineering', level: 'M1', employees: 5 },
  { id: 'des-4', title: 'Product Manager', department: 'Engineering', level: 'L4', employees: 7 },
  { id: 'des-5', title: 'HR Business Partner', department: 'Human Resources', level: 'L3', employees: 5 },
  { id: 'des-6', title: 'Talent Acquisition Specialist', department: 'Human Resources', level: 'L2', employees: 4 },
  { id: 'des-7', title: 'Sales Executive', department: 'Sales', level: 'L2', employees: 18 },
  { id: 'des-8', title: 'Sales Manager', department: 'Sales', level: 'M1', employees: 6 },
  { id: 'des-9', title: 'Marketing Specialist', department: 'Marketing', level: 'L2', employees: 9 },
  { id: 'des-10', title: 'Financial Analyst', department: 'Finance', level: 'L3', employees: 6 },
  { id: 'des-11', title: 'Product Designer', department: 'Design', level: 'L3', employees: 7 },
  { id: 'des-12', title: 'Customer Success Manager', department: 'Customer Success', level: 'L3', employees: 12 },
  { id: 'des-13', title: 'Operations Associate', department: 'Operations', level: 'L1', employees: 14 },
  { id: 'des-14', title: 'QA Engineer', department: 'Engineering', level: 'L2', employees: 9 },
]

const designationByDept: Record<string, string> = {
  Engineering: 'Software Engineer',
  'Human Resources': 'HR Business Partner',
  Sales: 'Sales Executive',
  Marketing: 'Marketing Specialist',
  Finance: 'Financial Analyst',
  Operations: 'Operations Associate',
  Design: 'Product Designer',
  'Customer Success': 'Customer Success Manager',
}

const locations = ['New York', 'London', 'Bengaluru', 'Remote', 'Austin', 'Singapore']
const employmentTypes: Employee['employmentType'][] = ['Full-time', 'Full-time', 'Full-time', 'Contract', 'Part-time', 'Intern']

export const employees: Employee[] = Array.from({ length: 24 }, (_, i) => {
  const dept = departments[i % departments.length]!
  const first = firstNames[i]!
  const last = lastNames[i]!
  const isMeera = first === 'Meera' && last === 'Nair'
  const statuses: Employee['status'] = isMeera ? 'Active' : (i === 5 || i === 17 ? 'On Leave' : i === 21 ? 'Probation' : i === 23 ? 'Inactive' : 'Active')
  return {
    id: `emp-${i + 1}`,
    employeeId: `PF-${String(1001 + i)}`,
    firstName: first,
    lastName: last,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@peopleflow.io`,
    phone: `+1 (555) ${String(210 + i * 7).slice(0, 3)}-${String(1000 + i * 37).slice(0, 4)}`,
    department: isMeera ? 'Human Resources' : dept.name,
    designation: isMeera ? 'HR Administrator' : (designationByDept[dept.name] ?? 'Specialist'),
    status: statuses,
    joinDate: isMeera ? '2023-06-01' : `20${18 + (i % 7)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 27)).padStart(2, '0')}`,
    location: isMeera ? 'New York' : locations[i % locations.length]!,
    manager: isMeera ? 'Vikram Rao' : departments[(i + 1) % departments.length]!.head,
    salary: isMeera ? 95000 : 62000 + ((i * 7900) % 88000),
    avatarColor: avatarColors[i % avatarColors.length]!,
    dob: `19${85 + (i % 15)}-${String(1 + ((i * 3) % 12)).padStart(2, '0')}-${String(1 + ((i * 5) % 27)).padStart(2, '0')}`,
    gender: i % 3 === 0 ? 'Female' : i % 3 === 1 ? 'Male' : 'Other',
    address: `${100 + i * 7} Market Street, ${isMeera ? 'New York' : locations[i % locations.length]}`,
    employmentType: isMeera ? 'Full-time' : employmentTypes[i % employmentTypes.length]!,
  }
})

export const shifts: Shift[] = [
  { id: 'shift-1', name: 'General Shift', startTime: '09:00', endTime: '18:00', employees: 142, days: 'Mon – Fri', flexibility: 'Fixed' },
  { id: 'shift-2', name: 'Morning Shift', startTime: '07:00', endTime: '16:00', employees: 38, days: 'Mon – Sat', flexibility: 'Flexible ±1h' },
  { id: 'shift-3', name: 'Evening Shift', startTime: '14:00', endTime: '23:00', employees: 26, days: 'Mon – Fri', flexibility: 'Flexible ±1h' },
  { id: 'shift-4', name: 'Weekend Shift', startTime: '10:00', endTime: '19:00', employees: 14, days: 'Sat – Sun', flexibility: 'Fixed' },
]

const attendanceStatuses: AttendanceRecord['status'][] = ['Present', 'Present', 'Present', 'Present', 'Late', 'Present', 'Half Day', 'On Leave', 'Absent']

export const attendanceRecords: AttendanceRecord[] = Array.from({ length: 30 }, (_, i) => {
  const emp = employees[i % employees.length]!
  const status = attendanceStatuses[i % attendanceStatuses.length]!
  return {
    id: `att-${i + 1}`,
    employeeId: emp.id,
    employee: `${emp.firstName} ${emp.lastName}`,
    department: emp.department,
    date: `2026-11-${String(1 + (i % 22)).padStart(2, '0')}`,
    checkIn: status === 'Absent' || status === 'On Leave' ? '—' : status === 'Late' ? '09:42' : `08:${String(45 + (i % 12)).padStart(2, '0')}`,
    checkOut: status === 'Absent' || status === 'On Leave' ? '—' : status === 'Half Day' ? '13:30' : `17:${String(20 + (i % 35)).padStart(2, '0')}`,
    hours: status === 'Absent' || status === 'On Leave' ? 0 : status === 'Half Day' ? 4.5 : 8 + (i % 3) / 10,
    status,
    shift: shifts[i % shifts.length]!.name,
  }
})

export const leaveTypes: LeaveType[] = [
  { id: 'lt-1', name: 'Casual Leave', code: 'CL', annualAllowance: 12, carryForward: false, color: '#6366f1', description: 'Short planned absences for personal matters.' },
  { id: 'lt-2', name: 'Sick Leave', code: 'SL', annualAllowance: 10, carryForward: false, color: '#f43f5e', description: 'Leave for illness or medical appointments.' },
  { id: 'lt-3', name: 'Earned Leave', code: 'EL', annualAllowance: 15, carryForward: true, color: '#10b981', description: 'Accrued leave based on tenure.' },
  { id: 'lt-4', name: 'Maternity Leave', code: 'ML', annualAllowance: 26, carryForward: false, color: '#ec4899', description: 'Maternity and parental leave.' },
  { id: 'lt-5', name: 'Unpaid Leave', code: 'UL', annualAllowance: 30, carryForward: false, color: '#f59e0b', description: 'Leave without pay, subject to approval.' },
  { id: 'lt-6', name: 'Comp Off', code: 'CO', annualAllowance: 8, carryForward: true, color: '#0ea5e9', description: 'Compensatory off for weekend work.' },
]

const leaveReasons = ['Family vacation', 'Medical appointment', 'Personal matter', 'Home relocation', 'Wedding ceremony', 'Child school event']

export const leaveRequests: LeaveRequest[] = Array.from({ length: 16 }, (_, i) => {
  const emp = employees[(i + 2) % employees.length]!
  const statuses: LeaveRequest['status'] = i < 5 ? 'Pending' : i < 11 ? 'Approved' : i < 14 ? 'Rejected' : 'Cancelled'
  return {
    id: `lv-${i + 1}`,
    employee: `${emp.firstName} ${emp.lastName}`,
    department: emp.department,
    leaveType: leaveTypes[i % leaveTypes.length]!.name,
    startDate: `2026-11-${String(10 + (i % 18)).padStart(2, '0')}`,
    endDate: `2026-11-${String(12 + (i % 18)).padStart(2, '0')}`,
    days: 2 + (i % 4),
    reason: leaveReasons[i % leaveReasons.length]!,
    status: statuses,
    appliedOn: `2026-11-${String(1 + (i % 9)).padStart(2, '0')}`,
    approver: departments[i % departments.length]!.head,
  }
})

export const jobOpenings: JobOpening[] = [
  { id: 'job-1', title: 'Senior Frontend Engineer', department: 'Engineering', location: 'New York / Remote', type: 'Full-time', status: 'Open', postedOn: '2026-10-12', closesOn: '2026-12-15', applicants: 48, salaryRange: '$130k – $170k', hiringManager: 'Vikram Rao', description: 'Build and scale our next-generation HR platform with a modern React stack.', requirements: ['5+ years React & TypeScript', 'Design system experience', 'Strong testing discipline'] },
  { id: 'job-2', title: 'Product Designer', department: 'Design', location: 'London', type: 'Full-time', status: 'Open', postedOn: '2026-10-20', closesOn: '2026-12-01', applicants: 32, salaryRange: '$95k – $125k', hiringManager: 'Naina Bose', description: 'Own end-to-end product design for core HR workflows.', requirements: ['Portfolio of shipped products', 'Figma mastery', 'User research skills'] },
  { id: 'job-3', title: 'Talent Acquisition Specialist', department: 'Human Resources', location: 'Bengaluru', type: 'Full-time', status: 'Open', postedOn: '2026-11-01', closesOn: '2026-12-20', applicants: 21, salaryRange: '$55k – $75k', hiringManager: 'Meera Nair', description: 'Source and hire exceptional talent across engineering and product.', requirements: ['3+ years in tech recruiting', 'Sourcing tools expertise', 'Excellent communication'] },
  { id: 'job-4', title: 'Enterprise Account Executive', department: 'Sales', location: 'Austin', type: 'Full-time', status: 'Open', postedOn: '2026-10-05', closesOn: '2026-11-30', applicants: 17, salaryRange: '$90k – $140k', hiringManager: 'Arjun Gupta', description: 'Drive enterprise pipeline and close strategic accounts.', requirements: ['SaaS sales experience', 'Enterprise deal cycle knowledge', 'CRM proficiency'] },
  { id: 'job-5', title: 'DevOps Engineer', department: 'Engineering', location: 'Remote', type: 'Contract', status: 'On Hold', postedOn: '2026-09-18', closesOn: '2026-12-31', applicants: 29, salaryRange: '$110k – $145k', hiringManager: 'Vikram Rao', description: 'Improve our cloud infrastructure and delivery pipelines.', requirements: ['AWS & Kubernetes', 'Terraform', 'CI/CD expertise'] },
  { id: 'job-6', title: 'Financial Analyst', department: 'Finance', location: 'Singapore', type: 'Full-time', status: 'Draft', postedOn: '2026-11-10', closesOn: '2026-12-25', applicants: 0, salaryRange: '$70k – $95k', hiringManager: 'Rahul Shah', description: 'Support FP&A, forecasting and board reporting.', requirements: ['MBA or CFA', '3+ years FP&A', 'Advanced Excel'] },
  { id: 'job-7', title: 'Customer Success Manager', department: 'Customer Success', location: 'Remote', type: 'Full-time', status: 'Open', postedOn: '2026-10-28', closesOn: '2026-12-10', applicants: 14, salaryRange: '$65k – $85k', hiringManager: 'Sanya Menon', description: 'Champion customer adoption and long-term retention.', requirements: ['SaaS CSM experience', 'Customer empathy', 'Data-driven mindset'] },
  { id: 'job-8', title: 'Marketing Content Lead', department: 'Marketing', location: 'London', type: 'Part-time', status: 'Closed', postedOn: '2026-08-14', closesOn: '2026-10-01', applicants: 56, salaryRange: '$60k – $80k', hiringManager: 'Isha Kapoor', description: 'Lead content strategy across all marketing channels.', requirements: ['Editorial excellence', 'SEO knowledge', 'B2B SaaS writing'] },
]

const candidateNames = ['Oliver格兰', 'Ethan Brooks', 'Lucas Meyer', 'Maya Chen', 'Sofia Rossi', 'Noah Williams', 'Amelia Clarke', 'Liam O\'Connor', 'Ella Novak', 'James Taylor', 'Chloe Dubois', 'Henry Kim', 'Grace Silva', 'Jack Wilson', 'Zoe Martin']

export const applications: Application[] = Array.from({ length: 18 }, (_, i) => {
  const name = candidateNames[i % candidateNames.length]!.replace('格兰', 'Grant')
  const stages: Application['stage'][] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected']
  return {
    id: `app-${i + 1}`,
    candidate: name,
    job: jobOpenings[i % 5]!.title,
    email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@example.com`,
    appliedOn: `2026-11-${String(1 + (i % 20)).padStart(2, '0')}`,
    stage: stages[i % stages.length]!,
    rating: 2 + (i % 4),
    experience: `${2 + (i % 9)} years`,
    location: locations[i % locations.length]!,
  }
})

export const payrollRecords: PayrollRecord[] = Array.from({ length: 24 }, (_, i) => {
  const emp = employees[i]!
  const basic = Math.round(emp.salary / 12)
  const allowances = Math.round(basic * 0.28)
  const deductions = Math.round(basic * 0.16)
  const statuses: PayrollRecord['status'] = i < 3 ? 'Processing' : i < 18 ? 'Paid' : 'Completed'
  return {
    id: `pay-${i + 1}`,
    employeeId: emp.employeeId,
    employee: `${emp.firstName} ${emp.lastName}`,
    department: emp.department,
    month: 'November 2026',
    basic,
    allowances,
    deductions,
    netPay: basic + allowances - deductions,
    status: statuses,
  }
})

export const payrollBatches: PayrollBatch[] = [
  { id: 'pb-1', name: 'November 2026 — Monthly', period: 'Nov 2026', employees: 220, totalAmount: 1845000, status: 'Processing', processedOn: '2026-11-22' },
  { id: 'pb-2', name: 'October 2026 — Monthly', period: 'Oct 2026', employees: 216, totalAmount: 1792000, status: 'Paid', processedOn: '2026-10-25' },
  { id: 'pb-3', name: 'September 2026 — Monthly', period: 'Sep 2026', employees: 211, totalAmount: 1738000, status: 'Paid', processedOn: '2026-09-25' },
  { id: 'pb-4', name: 'August 2026 — Monthly', period: 'Aug 2026', employees: 205, totalAmount: 1694000, status: 'Paid', processedOn: '2026-08-25' },
  { id: 'pb-5', name: 'December 2025 — Bonus', period: 'Dec 2025', employees: 198, totalAmount: 845000, status: 'Completed', processedOn: '2025-12-20' },
]

export const salaryStructures: SalaryStructure[] = Array.from({ length: 10 }, (_, i) => {
  const des = designations[i]!
  const basic = 4500 + i * 780
  const hra = Math.round(basic * 0.25)
  const allowances = Math.round(basic * 0.18)
  const bonus = Math.round(basic * 0.1)
  return { id: `ss-${i + 1}`, designation: des.title, department: des.department, basic, hra, allowances, bonus, total: basic + hra + allowances + bonus }
})

export const performanceReviews: PerformanceReview[] = Array.from({ length: 14 }, (_, i) => {
  const emp = employees[i]!
  const statuses: PerformanceReview['status'] = i < 7 ? 'Completed' : i < 11 ? 'In Progress' : 'Pending'
  return {
    id: `pr-${i + 1}`,
    employee: `${emp.firstName} ${emp.lastName}`,
    reviewer: departments[(i + 1) % departments.length]!.head,
    period: i % 2 ? 'Q3 2026' : 'H1 2026',
    rating: 3 + (i % 3) / 2,
    status: statuses,
    goals: 5,
    achieved: 2 + (i % 4),
    comments: 'Consistent delivery and strong collaboration across teams.',
  }
})

export const goals: Goal[] = [
  { id: 'g-1', title: 'Launch HR analytics dashboard v2', employee: 'Vikram Rao', category: 'Product', progress: 85, dueDate: '2026-12-15', priority: 'High', status: 'On Track' },
  { id: 'g-2', title: 'Reduce time-to-hire to 28 days', employee: 'Meera Nair', category: 'Recruitment', progress: 62, dueDate: '2026-12-31', priority: 'High', status: 'At Risk' },
  { id: 'g-3', title: 'Improve NPS score to 70', employee: 'Sanya Menon', category: 'Customer', progress: 71, dueDate: '2027-01-31', priority: 'Medium', status: 'On Track' },
  { id: 'g-4', title: 'Migrate payroll to new engine', employee: 'Rahul Shah', category: 'Operations', progress: 100, dueDate: '2026-10-30', priority: 'Critical', status: 'Completed' },
  { id: 'g-5', title: 'Publish design system documentation', employee: 'Naina Bose', category: 'Design', progress: 45, dueDate: '2026-12-01', priority: 'Medium', status: 'On Track' },
  { id: 'g-6', title: 'Grow enterprise pipeline by 30%', employee: 'Arjun Gupta', category: 'Sales', progress: 38, dueDate: '2026-12-31', priority: 'High', status: 'At Risk' },
  { id: 'g-7', title: 'Automate monthly close process', employee: 'Rahul Shah', category: 'Finance', progress: 22, dueDate: '2026-11-30', priority: 'Low', status: 'Overdue' },
  { id: 'g-8', title: 'Onboard 15 new engineers', employee: 'Priya Verma', category: 'Operations', progress: 90, dueDate: '2026-12-15', priority: 'Medium', status: 'On Track' },
]

export const loans: Loan[] = [
  { id: 'ln-1', employee: 'Rahul Sharma', type: 'Personal Loan', amount: 25000, outstanding: 12500, emi: 1250, startDate: '2026-01-15', endDate: '2027-08-15', status: 'Active' },
  { id: 'ln-2', employee: 'Priya Patel', type: 'Home Loan', amount: 120000, outstanding: 96000, emi: 2400, startDate: '2025-03-01', endDate: '2030-02-01', status: 'Active' },
  { id: 'ln-3', employee: 'Arjun Mehta', type: 'Vehicle Loan', amount: 18000, outstanding: 0, emi: 900, startDate: '2024-05-10', endDate: '2026-04-10', status: 'Completed' },
  { id: 'ln-4', employee: 'Neha Iyer', type: 'Personal Loan', amount: 15000, outstanding: 11250, emi: 750, startDate: '2026-04-20', endDate: '2027-12-20', status: 'Active' },
  { id: 'ln-5', employee: 'Kabir Nair', type: 'Education Loan', amount: 40000, outstanding: 38000, emi: 1100, startDate: '2026-08-01', endDate: '2029-07-01', status: 'Active' },
  { id: 'ln-6', employee: 'Diya Gupta', type: 'Personal Loan', amount: 10000, outstanding: 10000, emi: 500, startDate: '2026-11-01', endDate: '2027-10-01', status: 'Pending' },
]

export const advances: Advance[] = [
  { id: 'adv-1', employee: 'Ananya Reddy', amount: 3500, reason: 'Medical emergency', requestDate: '2026-11-18', status: 'Pending', recoveryMonths: 3 },
  { id: 'adv-2', employee: 'Rohan Verma', amount: 2000, reason: 'Home repairs', requestDate: '2026-11-12', status: 'Approved', recoveryMonths: 2 },
  { id: 'adv-3', employee: 'Isha Singh', amount: 1500, reason: 'Travel', requestDate: '2026-11-05', status: 'Recovered', recoveryMonths: 1 },
  { id: 'adv-4', employee: 'Aditya Kapoor', amount: 5000, reason: 'Wedding expenses', requestDate: '2026-10-28', status: 'Approved', recoveryMonths: 5 },
  { id: 'adv-5', employee: 'Sanya Rao', amount: 1200, reason: 'Education fees', requestDate: '2026-10-20', status: 'Rejected', recoveryMonths: 2 },
  { id: 'adv-6', employee: 'Vikram Joshi', amount: 2800, reason: 'Rent deposit', requestDate: '2026-11-20', status: 'Pending', recoveryMonths: 3 },
]

export const users: User[] = [
  { id: 'usr-1', name: 'Meera Nair', email: 'meera.nair@peopleflow.io', role: 'HR Admin', status: 'Active', lastActive: '2 min ago', department: 'Human Resources' },
  { id: 'usr-2', name: 'Vikram Rao', email: 'vikram.rao@peopleflow.io', role: 'Manager', status: 'Active', lastActive: '1 hour ago', department: 'Engineering' },
  { id: 'usr-3', name: 'Rahul Shah', email: 'rahul.shah@peopleflow.io', role: 'Finance Admin', status: 'Active', lastActive: '3 hours ago', department: 'Finance' },
  { id: 'usr-4', name: 'Priya Verma', email: 'priya.verma@peopleflow.io', role: 'Manager', status: 'Active', lastActive: 'Yesterday', department: 'Operations' },
  { id: 'usr-5', name: 'Arjun Gupta', email: 'arjun.gupta@peopleflow.io', role: 'Manager', status: 'Inactive', lastActive: '5 days ago', department: 'Sales' },
  { id: 'usr-6', name: 'Naina Bose', email: 'naina.bose@peopleflow.io', role: 'Manager', status: 'Active', lastActive: '30 min ago', department: 'Design' },
  { id: 'usr-7', name: 'Isha Kapoor', email: 'isha.kapoor@peopleflow.io', role: 'Employee', status: 'Active', lastActive: '4 hours ago', department: 'Marketing' },
  { id: 'usr-8', name: 'Sanya Menon', email: 'sanya.menon@peopleflow.io', role: 'Manager', status: 'Active', lastActive: 'Today', department: 'Customer Success' },
]

export const roles: Role[] = [
  { id: 'role-1', name: 'Super Admin', description: 'Unrestricted access to all modules and settings.', users: 2, permissions: 32, type: 'System' },
  { id: 'role-2', name: 'HR Admin', description: 'Manage employees, attendance, leave and recruitment.', users: 5, permissions: 26, type: 'System' },
  { id: 'role-3', name: 'Manager', description: 'Manage team members, approvals and performance.', users: 18, permissions: 14, type: 'System' },
  { id: 'role-4', name: 'Finance Admin', description: 'Payroll, salary structures and employee finance.', users: 3, permissions: 18, type: 'System' },
  { id: 'role-5', name: 'Employee', description: 'Self-service access to personal HR information.', users: 192, permissions: 7, type: 'System' },
  { id: 'role-6', name: 'Recruiter', description: 'Manage job openings and candidate pipeline.', users: 4, permissions: 12, type: 'Custom' },
]

export const permissions: Permission[] = [
  { id: 'perm-1', module: 'Dashboard', view: true, create: false, edit: false, delete: false, approve: false },
  { id: 'perm-2', module: 'Employees', view: true, create: true, edit: true, delete: false, approve: false },
  { id: 'perm-3', module: 'Recruitment', view: true, create: true, edit: true, delete: true, approve: true },
  { id: 'perm-4', module: 'Attendance', view: true, create: true, edit: true, delete: false, approve: true },
  { id: 'perm-5', module: 'Leave Management', view: true, create: true, edit: true, delete: false, approve: true },
  { id: 'perm-6', module: 'Payroll', view: true, create: true, edit: true, delete: false, approve: true },
  { id: 'perm-7', module: 'Performance', view: true, create: true, edit: true, delete: false, approve: false },
  { id: 'perm-8', module: 'Employee Finance', view: true, create: true, edit: false, delete: false, approve: true },
  { id: 'perm-9', module: 'Reports & Analytics', view: true, create: false, edit: false, delete: false, approve: false },
  { id: 'perm-10', module: 'Administration', view: true, create: true, edit: true, delete: true, approve: true },
]

export const activities: Activity[] = [
  { id: 'act-1', type: 'employee', title: 'New employee onboarded', description: 'Tara Chauhan joined the Design department.', time: '12 min ago' },
  { id: 'act-2', type: 'leave', title: 'Leave request approved', description: 'Riya Malhotra — Casual Leave (3 days).', time: '48 min ago' },
  { id: 'act-3', type: 'recruitment', title: 'New application received', description: 'Ethan Brooks applied for Senior Frontend Engineer.', time: '2 hours ago' },
  { id: 'act-4', type: 'attendance', title: 'Attendance synced', description: '220 records imported for November 22, 2026.', time: '3 hours ago' },
  { id: 'act-5', type: 'payroll', title: 'Payroll batch processing', description: 'November 2026 batch is 68% complete.', time: '5 hours ago' },
  { id: 'act-6', type: 'employee', title: 'Employee profile updated', description: 'Aditya Kapoor changed designation.', time: 'Yesterday' },
]

/* --------------------------- Dashboard aggregates --------------------------- */

export const dashboardKpis = {
  totalEmployees: 220,
  presentToday: 198,
  absentToday: 9,
  onLeave: 13,
  monthlyPayroll: 1845000,
  openPositions: 12,
}

export const attendanceOverview = [
  { month: 'Jun', present: 182, absent: 14, leave: 12 },
  { month: 'Jul', present: 190, absent: 11, leave: 9 },
  { month: 'Aug', present: 176, absent: 18, leave: 15 },
  { month: 'Sep', present: 195, absent: 9, leave: 8 },
  { month: 'Oct', present: 201, absent: 7, leave: 10 },
  { month: 'Nov', present: 198, absent: 9, leave: 13 },
]

export const departmentDistribution = [
  { name: 'Engineering', value: 68, color: '#6366f1' },
  { name: 'Sales', value: 32, color: '#8b5cf6' },
  { name: 'Operations', value: 24, color: '#ec4899' },
  { name: 'Customer Success', value: 21, color: '#f59e0b' },
  { name: 'Marketing', value: 18, color: '#10b981' },
  { name: 'Human Resources', value: 14, color: '#0ea5e9' },
  { name: 'Finance', value: 12, color: '#f43f5e' },
  { name: 'Design', value: 11, color: '#14b8a6' },
]

export const recruitmentTrends = [
  { month: 'Jun', applications: 84, hired: 7 },
  { month: 'Jul', applications: 96, hired: 9 },
  { month: 'Aug', applications: 112, hired: 11 },
  { month: 'Sep', applications: 104, hired: 8 },
  { month: 'Oct', applications: 128, hired: 14 },
  { month: 'Nov', applications: 143, hired: 12 },
]

export const salaryTrend = [
  { month: 'Jun', amount: 1620000 },
  { month: 'Jul', amount: 1654000 },
  { month: 'Aug', amount: 1691000 },
  { month: 'Sep', amount: 1738000 },
  { month: 'Oct', amount: 1792000 },
  { month: 'Nov', amount: 1845000 },
]

export const upcomingBirthdays = [
  { name: 'Vihaan Sharma', department: 'Engineering', date: 'Nov 24', color: '#6366f1' },
  { name: 'Ananya Reddy', department: 'Marketing', date: 'Nov 26', color: '#ec4899' },
  { name: 'Rohan Gupta', department: 'Finance', date: 'Nov 28', color: '#f59e0b' },
  { name: 'Kavya Singh', department: 'Design', date: 'Dec 02', color: '#10b981' },
]
