import { BriefcaseBusiness, CalendarDays, UserCheck, UserMinus, Users, Wallet, type LucideIcon } from 'lucide-react'
import { dashboardKpis } from '@/mocks/data'
import { formatCurrency } from '@/lib/utils'

export interface KpiConfig {
  title: string
  value: string | number
  icon: LucideIcon
  tone: 'primary' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet'
  trend?: number
  description?: string
}

/** Shared dashboard KPI definitions — kept out of the page for reuse in widgets. */
export const dashboardKpiConfig: KpiConfig[] = [
  { title: 'Total Employees', value: dashboardKpis.totalEmployees, icon: Users, tone: 'primary', trend: 8.2, description: 'vs. last month' },
  { title: 'Present Today', value: dashboardKpis.presentToday, icon: UserCheck, tone: 'emerald', trend: 2.4, description: '90% attendance' },
  { title: 'Absent Today', value: dashboardKpis.absentToday, icon: UserMinus, tone: 'rose', trend: -1.1, description: '4% of workforce' },
  { title: 'On Leave', value: dashboardKpis.onLeave, icon: CalendarDays, tone: 'amber', description: '6 approved requests' },
  { title: 'Monthly Payroll', value: formatCurrency(dashboardKpis.monthlyPayroll), icon: Wallet, tone: 'violet', trend: 3.6, description: 'November 2026' },
  { title: 'Open Positions', value: dashboardKpis.openPositions, icon: BriefcaseBusiness, tone: 'sky', trend: 12, description: '4 new this month' },
]
