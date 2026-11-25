import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'

/* Dashboards & overview pages */
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const RecruitmentDashboard = lazy(() => import('@/pages/recruitment/RecruitmentDashboard'))
const AttendanceDashboard = lazy(() => import('@/pages/attendance/AttendanceDashboard'))
const LeaveDashboard = lazy(() => import('@/pages/leave/LeaveDashboard'))
const PayrollDashboard = lazy(() => import('@/pages/payroll/PayrollDashboard'))
const PerformanceDashboard = lazy(() => import('@/pages/performance/PerformanceDashboard'))
const FinanceDashboard = lazy(() => import('@/pages/finance/FinanceDashboard'))

/* Employees */
const EmployeeList = lazy(() => import('@/pages/employees/EmployeeList'))
const EmployeeProfile = lazy(() => import('@/pages/employees/EmployeeProfile'))
const AddEmployee = lazy(() => import('@/pages/employees/AddEmployee'))
const Departments = lazy(() => import('@/pages/employees/Departments'))
const Designations = lazy(() => import('@/pages/employees/Designations'))

/* Recruitment */
const JobOpenings = lazy(() => import('@/pages/recruitment/JobOpenings'))
const CreateJob = lazy(() => import('@/pages/recruitment/CreateJob'))
const JobDetails = lazy(() => import('@/pages/recruitment/JobDetails'))
const Applications = lazy(() => import('@/pages/recruitment/Applications'))
const Pipeline = lazy(() => import('@/pages/recruitment/Pipeline'))

/* Attendance */
const DailyAttendance = lazy(() => import('@/pages/attendance/DailyAttendance'))
const AttendanceHistory = lazy(() => import('@/pages/attendance/AttendanceHistory'))
const Shifts = lazy(() => import('@/pages/attendance/Shifts'))

/* Leave */
const LeaveRequests = lazy(() => import('@/pages/leave/LeaveRequests'))
const LeaveTypes = lazy(() => import('@/pages/leave/LeaveTypes'))
const LeaveCalendar = lazy(() => import('@/pages/leave/LeaveCalendar'))

/* Payroll */
const SalaryStructure = lazy(() => import('@/pages/payroll/SalaryStructure'))
const SalaryComponents = lazy(() => import('@/pages/payroll/SalaryComponents'))
const PayrollBatches = lazy(() => import('@/pages/payroll/PayrollBatches'))
const PayslipPreview = lazy(() => import('@/pages/payroll/PayslipPreview'))
const BonusManagement = lazy(() => import('@/pages/payroll/BonusManagement'))
const OvertimeManagement = lazy(() => import('@/pages/payroll/OvertimeManagement'))
const LateDeductions = lazy(() => import('@/pages/payroll/LateDeductions'))
const PayrollPayments = lazy(() => import('@/pages/payroll/PayrollPayments'))
const PayrollModuleReports = lazy(() => import('@/pages/payroll/PayrollReports'))
const PayrollSettings = lazy(() => import('@/pages/payroll/PayrollSettings'))

/* Accounting */
const AccountingDashboard = lazy(() => import('@/pages/accounting/AccountingDashboard'))
const ChartOfAccounts = lazy(() => import('@/pages/accounting/ChartOfAccounts'))
const JournalEntries = lazy(() => import('@/pages/accounting/JournalEntries'))
const GeneralLedger = lazy(() => import('@/pages/accounting/GeneralLedger'))
const TrialBalance = lazy(() => import('@/pages/accounting/TrialBalance'))
const CashBankManagement = lazy(() => import('@/pages/accounting/CashBankManagement'))
const ExpenseManagement = lazy(() => import('@/pages/accounting/ExpenseManagement'))
const PayrollAccounting = lazy(() => import('@/pages/accounting/PayrollAccounting'))
const PaymentsTransactions = lazy(() => import('@/pages/accounting/PaymentsTransactions'))
const FinancialReports = lazy(() => import('@/pages/accounting/FinancialReports'))
const AccountingSettings = lazy(() => import('@/pages/accounting/AccountingSettings'))


/* Performance */
const EmployeeReviews = lazy(() => import('@/pages/performance/EmployeeReviews'))
const GoalsKpis = lazy(() => import('@/pages/performance/GoalsKpis'))

/* Finance */
const EmployeeLoans = lazy(() => import('@/pages/finance/EmployeeLoans'))
const SalaryAdvances = lazy(() => import('@/pages/finance/SalaryAdvances'))
const PaymentHistory = lazy(() => import('@/pages/finance/PaymentHistory'))

/* Reports */
const HrAnalytics = lazy(() => import('@/pages/reports/HrAnalytics'))
const AttendanceReports = lazy(() => import('@/pages/reports/AttendanceReports'))
const PayrollReports = lazy(() => import('@/pages/reports/PayrollReports'))

/* Administration & settings */
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'))
const RoleManagement = lazy(() => import('@/pages/admin/RoleManagement'))
const Permissions = lazy(() => import('@/pages/admin/Permissions'))
const CompanySettings = lazy(() => import('@/pages/settings/CompanySettings'))
const GeneralSettings = lazy(() => import('@/pages/settings/GeneralSettings'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      { path: 'dashboard', element: <Dashboard /> },
      { path: 'profile', element: <EmployeeProfile /> },

      { path: 'employees', element: <EmployeeList /> },
      { path: 'employees/new', element: <AddEmployee /> },
      { path: 'employees/:id', element: <EmployeeProfile /> },
      { path: 'employees/departments', element: <Departments /> },
      { path: 'employees/designations', element: <Designations /> },

      { path: 'recruitment', element: <RecruitmentDashboard /> },
      { path: 'recruitment/jobs', element: <JobOpenings /> },
      { path: 'recruitment/jobs/new', element: <CreateJob /> },
      { path: 'recruitment/jobs/:id', element: <JobDetails /> },
      { path: 'recruitment/applications', element: <Applications /> },
      { path: 'recruitment/pipeline', element: <Pipeline /> },

      { path: 'attendance', element: <AttendanceDashboard /> },
      { path: 'attendance/daily', element: <DailyAttendance /> },
      { path: 'attendance/history', element: <AttendanceHistory /> },
      { path: 'attendance/shifts', element: <Shifts /> },

      { path: 'leave', element: <LeaveDashboard /> },
      { path: 'leave/requests', element: <LeaveRequests /> },
      { path: 'leave/types', element: <LeaveTypes /> },
      { path: 'leave/calendar', element: <LeaveCalendar /> },

      { path: 'payroll', element: <PayrollDashboard /> },
      { path: 'payroll/structures', element: <SalaryStructure /> },
      { path: 'payroll/components', element: <SalaryComponents /> },
      { path: 'payroll/batches', element: <PayrollBatches /> },
      { path: 'payroll/payslips', element: <PayslipPreview /> },
      { path: 'payroll/bonuses', element: <BonusManagement /> },
      { path: 'payroll/overtime', element: <OvertimeManagement /> },
      { path: 'payroll/late-deductions', element: <LateDeductions /> },
      { path: 'payroll/payments', element: <PayrollPayments /> },
      { path: 'payroll/reports', element: <PayrollModuleReports /> },
      { path: 'payroll/settings', element: <PayrollSettings /> },

      { path: 'accounting', element: <AccountingDashboard /> },
      { path: 'accounting/chart-of-accounts', element: <ChartOfAccounts /> },
      { path: 'accounting/journal-entries', element: <JournalEntries /> },
      { path: 'accounting/general-ledger', element: <GeneralLedger /> },
      { path: 'accounting/trial-balance', element: <TrialBalance /> },
      { path: 'accounting/cash-bank', element: <CashBankManagement /> },
      { path: 'accounting/expenses', element: <ExpenseManagement /> },
      { path: 'accounting/payroll-accounting', element: <PayrollAccounting /> },
      { path: 'accounting/transactions', element: <PaymentsTransactions /> },
      { path: 'accounting/financial-reports', element: <FinancialReports /> },
      { path: 'accounting/settings', element: <AccountingSettings /> },

      { path: 'performance', element: <PerformanceDashboard /> },
      { path: 'performance/reviews', element: <EmployeeReviews /> },
      { path: 'performance/goals', element: <GoalsKpis /> },

      { path: 'finance', element: <FinanceDashboard /> },
      { path: 'finance/loans', element: <EmployeeLoans /> },
      { path: 'finance/advances', element: <SalaryAdvances /> },
      { path: 'finance/payment-history', element: <PaymentHistory /> },

      { path: 'reports', element: <HrAnalytics /> },
      { path: 'reports/attendance', element: <AttendanceReports /> },
      { path: 'reports/payroll', element: <PayrollReports /> },

      { path: 'admin', element: <Navigate to="/admin/users" replace /> },
      { path: 'admin/users', element: <UserManagement /> },
      { path: 'admin/roles', element: <RoleManagement /> },
      { path: 'admin/permissions', element: <Permissions /> },

      { path: 'settings', element: <Navigate to="/settings/general" replace /> },
      { path: 'settings/company', element: <CompanySettings /> },
      { path: 'settings/general', element: <GeneralSettings /> },

      { path: '*', element: <NotFound /> },
    ],
  },
])
