import { useState } from 'react'
import { toast } from 'sonner'
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  Gift,
  Clock,
  AlertCircle,
  PieChart,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { ChartCard, axisProps, tooltipStyle } from '@/components/charts/ChartCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatBDT } from '@/lib/payrollUtils'
import { departments } from '@/mocks/data'

const monthlyTrend = [
  { month: 'Jun', gross: 1650000, net: 1380000 },
  { month: 'Jul', gross: 1680000, net: 1410000 },
  { month: 'Aug', gross: 1694000, net: 1420000 },
  { month: 'Sep', gross: 1738000, net: 1460000 },
  { month: 'Oct', gross: 1792000, net: 1510000 },
  { month: 'Nov', gross: 1845000, net: 1550000 },
]

const departmentPayroll = [
  { name: 'Engineering', employees: 85, gross: 820000, net: 690000, avg: 9647 },
  { name: 'Human Resources', employees: 22, gross: 210000, net: 176000, avg: 9545 },
  { name: 'Sales & BD', employees: 42, gross: 410000, net: 345000, avg: 9761 },
  { name: 'Design & UX', employees: 28, gross: 245000, net: 206000, avg: 8750 },
  { name: 'Marketing', employees: 25, gross: 215000, net: 181000, avg: 8600 },
  { name: 'Finance & Admin', employees: 18, gross: 165000, net: 139000, avg: 9166 },
]

export default function PayrollReports() {
  const [activeReport, setActiveReport] = useState('summary')

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Payroll Reports"
        description="Comprehensive payroll analytics, department wage distribution, bonus & overtime summaries, and cost trends."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success('Payroll summary report exported to Excel')}
            >
              <Download className="mr-1.5 h-4 w-4" />
              Export Reports
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="mr-1.5 h-4 w-4" />
              Print Reports
            </Button>
          </div>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Annual Payroll Spend"
          value={formatBDT(21450000)}
          icon={DollarSign}
          tone="primary"
          trend={6.4}
          description="Cumulative gross payroll YTD"
        />
        <StatCard
          title="Monthly Run Rate"
          value={formatBDT(1845000)}
          icon={TrendingUp}
          tone="emerald"
          description="November 2026 total disbursement"
        />
        <StatCard
          title="Total Bonuses Disbursed"
          value={formatBDT(1240000)}
          icon={Gift}
          tone="violet"
          description="Festival & performance awards"
        />
        <StatCard
          title="Net Overtime & Penalties"
          value={`+${formatBDT(14200)}`}
          icon={Clock}
          tone="sky"
          description="Overtime pay less late deductions"
        />
      </div>

      {/* Payroll Cost Trend Chart */}
      <ChartCard title="Payroll Cost Trend" description="Monthly gross vs net salary disbursement over the last 6 months">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthlyTrend} margin={{ top: 8, right: 8, left: 12, bottom: 0 }}>
            <defs>
              <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              {...tooltipStyle}
              formatter={(value, name) => [
                formatBDT(Number(value)),
                name === 'gross' ? 'Gross Payroll' : 'Net Disbursed',
              ]}
            />
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey="gross"
              name="gross"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#grossGradient)"
            />
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey="net"
              name="net"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#netGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Report Tabs */}
      <Tabs value={activeReport} onValueChange={setActiveReport} className="space-y-4">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="summary" className="text-xs">
            Monthly Summary Report
          </TabsTrigger>
          <TabsTrigger value="departments" className="text-xs">
            Department-wise Salary
          </TabsTrigger>
          <TabsTrigger value="paid-unpaid" className="text-xs">
            Paid vs Unpaid Salary
          </TabsTrigger>
          <TabsTrigger value="bonus-overtime" className="text-xs">
            Bonus & Overtime Report
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Monthly Summary */}
        <TabsContent value="summary" className="space-y-4">
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Monthly Payroll Summary Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-bold">Period</TableHead>
                    <TableHead className="text-xs font-bold text-right">Headcount</TableHead>
                    <TableHead className="text-xs font-bold text-right">Gross Salary (BDT)</TableHead>
                    <TableHead className="text-xs font-bold text-right">Allowances (BDT)</TableHead>
                    <TableHead className="text-xs font-bold text-right">Deductions (TDS/PF)</TableHead>
                    <TableHead className="text-xs font-bold text-right">Net Disbursed (BDT)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {monthlyTrend.map((m) => (
                    <TableRow key={m.month}>
                      <TableCell className="font-semibold">{m.month} 2026</TableCell>
                      <TableCell className="text-right font-mono">220 staff</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{formatBDT(m.gross)}</TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">{formatBDT(Math.round(m.gross * 0.28))}</TableCell>
                      <TableCell className="text-right font-mono text-rose-600">{formatBDT(Math.round(m.gross * 0.16))}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatBDT(m.net)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Department-wise */}
        <TabsContent value="departments" className="space-y-4">
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Department-wise Salary Allocation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-bold">Department</TableHead>
                    <TableHead className="text-xs font-bold text-right">Headcount</TableHead>
                    <TableHead className="text-xs font-bold text-right">Gross Allocation</TableHead>
                    <TableHead className="text-xs font-bold text-right">Net Payout</TableHead>
                    <TableHead className="text-xs font-bold text-right">Average / Head</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {departmentPayroll.map((d) => (
                    <TableRow key={d.name}>
                      <TableCell className="font-semibold">{d.name}</TableCell>
                      <TableCell className="text-right font-mono">{d.employees} employees</TableCell>
                      <TableCell className="text-right font-mono">{formatBDT(d.gross)}</TableCell>
                      <TableCell className="text-right font-mono font-semibold text-emerald-600">{formatBDT(d.net)}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-primary">{formatBDT(d.avg)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Paid vs Unpaid */}
        <TabsContent value="paid-unpaid" className="space-y-4">
          <Card className="shadow-sm p-6 space-y-4">
            <h4 className="font-bold text-base">Disbursement Status Comparison</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border p-4 bg-emerald-500/10 border-emerald-200">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Paid & Settled</span>
                <p className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatBDT(1780000)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">212 of 220 employees cleared</p>
              </div>
              <div className="rounded-xl border p-4 bg-amber-500/10 border-amber-200">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Partially Paid / In Flight</span>
                <p className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatBDT(32000)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">3 bank accounts pending reconciliation</p>
              </div>
              <div className="rounded-xl border p-4 bg-rose-500/10 border-rose-200">
                <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Unpaid / On Hold</span>
                <p className="font-mono text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{formatBDT(65000)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">5 staff accounts pending bank routing</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 4: Bonus & Overtime */}
        <TabsContent value="bonus-overtime" className="space-y-4">
          <Card className="shadow-sm p-6 space-y-4 text-xs">
            <h4 className="font-bold text-base">Incentives, Bonus & Extra Duty Summary</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border p-4 space-y-2">
                <p className="font-bold text-foreground">Festival & Performance Bonus Pool</p>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Eid-ul-Fitr Bonus</span><span className="font-mono font-semibold">{formatBDT(850000)}</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Annual Performance Award</span><span className="font-mono font-semibold">{formatBDT(390000)}</span></div>
                <div className="flex justify-between pt-1 font-bold"><span className="text-foreground">Total Bonus Expense</span><span className="font-mono text-primary font-bold">{formatBDT(1240000)}</span></div>
              </div>

              <div className="rounded-xl border p-4 space-y-2">
                <p className="font-bold text-foreground">Overtime Compensation vs Late Deductions</p>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Gross Overtime Hours Pay</span><span className="font-mono font-semibold text-emerald-600">+{formatBDT(18200)}</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Attendance Late Penalties</span><span className="font-mono font-semibold text-rose-600">-{formatBDT(4000)}</span></div>
                <div className="flex justify-between pt-1 font-bold"><span className="text-foreground">Net Supplemental Adjustment</span><span className="font-mono text-emerald-600 font-bold">+{formatBDT(14200)}</span></div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
