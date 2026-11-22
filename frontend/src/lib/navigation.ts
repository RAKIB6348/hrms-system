import {
  BarChart3, CalendarCheck, ClipboardList, FileBarChart, LayoutDashboard,
  Settings, ShieldCheck, Users, WalletCards, Wallet, type LucideIcon,
} from 'lucide-react'

export interface NavChild {
  title: string
  href: string
}

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  children?: NavChild[]
}

export const navigation: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    title: 'Employees', href: '/employees', icon: Users,
    children: [
      { title: 'Employee List', href: '/employees' },
      { title: 'Add Employee', href: '/employees/new' },
      { title: 'Departments', href: '/employees/departments' },
      { title: 'Designations', href: '/employees/designations' },
    ],
  },
  {
    title: 'Recruitment', href: '/recruitment', icon: ClipboardList,
    children: [
      { title: 'Recruitment Dashboard', href: '/recruitment' },
      { title: 'Job Openings', href: '/recruitment/jobs' },
      { title: 'Create Job', href: '/recruitment/jobs/new' },
      { title: 'Applications', href: '/recruitment/applications' },
      { title: 'Recruitment Pipeline', href: '/recruitment/pipeline' },
    ],
  },
  {
    title: 'Attendance', href: '/attendance', icon: CalendarCheck,
    children: [
      { title: 'Attendance Dashboard', href: '/attendance' },
      { title: 'Daily Attendance', href: '/attendance/daily' },
      { title: 'Attendance History', href: '/attendance/history' },
      { title: 'Shift Management', href: '/attendance/shifts' },
    ],
  },
  {
    title: 'Leave Management', href: '/leave', icon: CalendarCheck,
    children: [
      { title: 'Leave Dashboard', href: '/leave' },
      { title: 'Leave Requests', href: '/leave/requests' },
      { title: 'Leave Types', href: '/leave/types' },
      { title: 'Leave Calendar', href: '/leave/calendar' },
    ],
  },
  {
    title: 'Payroll', href: '/payroll', icon: WalletCards,
    children: [
      { title: 'Payroll Dashboard', href: '/payroll' },
      { title: 'Salary Structure', href: '/payroll/structures' },
      { title: 'Payroll Batches', href: '/payroll/batches' },
      { title: 'Payslip Preview', href: '/payroll/payslips' },
    ],
  },
  {
    title: 'Performance', href: '/performance', icon: BarChart3,
    children: [
      { title: 'Performance Dashboard', href: '/performance' },
      { title: 'Employee Reviews', href: '/performance/reviews' },
      { title: 'Goals & KPIs', href: '/performance/goals' },
    ],
  },
  {
    title: 'Employee Finance', href: '/finance', icon: Wallet,
    children: [
      { title: 'Finance Dashboard', href: '/finance' },
      { title: 'Employee Loans', href: '/finance/loans' },
      { title: 'Salary Advances', href: '/finance/advances' },
    ],
  },
  {
    title: 'Reports & Analytics', href: '/reports', icon: FileBarChart,
    children: [
      { title: 'HR Analytics', href: '/reports' },
      { title: 'Attendance Reports', href: '/reports/attendance' },
      { title: 'Payroll Reports', href: '/reports/payroll' },
    ],
  },
  {
    title: 'Administration', href: '/admin', icon: ShieldCheck,
    children: [
      { title: 'User Management', href: '/admin/users' },
      { title: 'Role Management', href: '/admin/roles' },
      { title: 'Permissions', href: '/admin/permissions' },
    ],
  },
  {
    title: 'Settings', href: '/settings', icon: Settings,
    children: [
      { title: 'Company Settings', href: '/settings/company' },
      { title: 'General Settings', href: '/settings/general' },
    ],
  },
]

export const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/profile': 'My Profile',
  '/employees': 'Employee List',
  '/employees/new': 'Add Employee',
  '/employees/departments': 'Departments',
  '/employees/designations': 'Designations',
  '/recruitment': 'Recruitment Dashboard',
  '/recruitment/jobs': 'Job Openings',
  '/recruitment/jobs/new': 'Create Job',
  '/recruitment/applications': 'Applications',
  '/recruitment/pipeline': 'Recruitment Pipeline',
  '/attendance': 'Attendance Dashboard',
  '/attendance/daily': 'Daily Attendance',
  '/attendance/history': 'Attendance History',
  '/attendance/shifts': 'Shift Management',
  '/leave': 'Leave Dashboard',
  '/leave/requests': 'Leave Requests',
  '/leave/types': 'Leave Types',
  '/leave/calendar': 'Leave Calendar',
  '/payroll': 'Payroll Dashboard',
  '/payroll/structures': 'Salary Structure',
  '/payroll/batches': 'Payroll Batches',
  '/payroll/payslips': 'Payslip Preview',
  '/performance': 'Performance Dashboard',
  '/performance/reviews': 'Employee Reviews',
  '/performance/goals': 'Goals & KPIs',
  '/finance': 'Finance Dashboard',
  '/finance/loans': 'Employee Loans',
  '/finance/advances': 'Salary Advances',
  '/reports': 'HR Analytics',
  '/reports/attendance': 'Attendance Reports',
  '/reports/payroll': 'Payroll Reports',
  '/admin/users': 'User Management',
  '/admin/roles': 'Role Management',
  '/admin/permissions': 'Permissions',
  '/settings/company': 'Company Settings',
  '/settings/general': 'General Settings',
}

export function titleForPath(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname]!
  if (pathname.startsWith('/employees/')) return 'Employee Profile'
  if (pathname.startsWith('/recruitment/jobs/')) return 'Job Details'
  return 'Dashboard'
}
