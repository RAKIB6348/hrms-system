import { useState } from 'react'
import { toast } from 'sonner'
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  Scale,
  Building2,
  DollarSign,
  PieChart,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatBDT } from './accountingUtils'

export default function FinancialReports() {
  const [activeTab, setActiveTab] = useState('pnl')

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <PageHeader
        title="Financial Reports"
        description="Statutory financial statements, profit & loss, balance sheets, and cash flow summaries."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success('Financial report exported to Excel (demo)')}
            >
              <Download className="mr-1.5 h-4 w-4" />
              Export Statements
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
          title="Net Operating Income (YTD)"
          value={formatBDT(3350000)}
          icon={TrendingUp}
          tone="emerald"
          trend={12.4}
          description="Revenue less operating expenses"
        />
        <StatCard
          title="Total Balance Sheet Size"
          value={formatBDT(11970000)}
          icon={Scale}
          tone="primary"
          description="Total assets under management"
        />
        <StatCard
          title="Operating Cash Flow"
          value={formatBDT(2150000)}
          icon={DollarSign}
          tone="sky"
          trend={4.1}
          description="Net liquidity generation"
        />
        <StatCard
          title="Gross Profit Margin"
          value="41.3%"
          icon={PieChart}
          tone="violet"
          description="Software and consulting mix"
        />
      </div>

      {/* Financial Statement Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="pnl" className="text-xs">
            Profit & Loss (Income Statement)
          </TabsTrigger>
          <TabsTrigger value="balance-sheet" className="text-xs">
            Balance Sheet (Financial Position)
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="text-xs">
            Statement of Cash Flows
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profit & Loss */}
        <TabsContent value="pnl" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
              <div>
                <CardTitle className="text-base font-bold">Statement of Profit & Loss</CardTitle>
                <p className="text-xs text-muted-foreground">For the period ended November 22, 2026 · Currency: BDT (৳)</p>
              </div>
              <span className="text-xs text-muted-foreground">Comparative: FY 2026 vs FY 2025</span>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-bold">Account Category</TableHead>
                    <TableHead className="text-xs font-bold text-right">Current Period (BDT)</TableHead>
                    <TableHead className="text-xs font-bold text-right">Previous Period (BDT)</TableHead>
                    <TableHead className="text-xs font-bold text-right">Variance (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {/* Revenue */}
                  <TableRow className="bg-muted/10 font-bold">
                    <TableCell colSpan={4}>Revenue & Incomes</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Software Services Subscription Fees</TableCell>
                    <TableCell className="font-mono text-right">{formatBDT(6850000)}</TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">{formatBDT(5900000)}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-semibold">+16.1%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Consulting & Implementation Services</TableCell>
                    <TableCell className="font-mono text-right">{formatBDT(1250000)}</TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">{formatBDT(1100000)}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-semibold">+13.6%</TableCell>
                  </TableRow>
                  <TableRow className="font-bold border-b border-t bg-muted/20">
                    <TableCell>Total Operating Revenue</TableCell>
                    <TableCell className="font-mono text-right text-primary">{formatBDT(8100000)}</TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">{formatBDT(7000000)}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-bold">+15.7%</TableCell>
                  </TableRow>

                  {/* Expenses */}
                  <TableRow className="bg-muted/10 font-bold">
                    <TableCell colSpan={4}>Operating Expenses</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Salaries & Allowances Expense</TableCell>
                    <TableCell className="font-mono text-right">{formatBDT(3450000)}</TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">{formatBDT(3100000)}</TableCell>
                    <TableCell className="text-right text-rose-600 font-semibold">+11.3%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Office Rent & Facilities Lease</TableCell>
                    <TableCell className="font-mono text-right">{formatBDT(650000)}</TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">{formatBDT(600000)}</TableCell>
                    <TableCell className="text-right text-rose-600 font-semibold">+8.3%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Cloud Infrastructure & Software Licences</TableCell>
                    <TableCell className="font-mono text-right">{formatBDT(420000)}</TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">{formatBDT(380000)}</TableCell>
                    <TableCell className="text-right text-rose-600 font-semibold">+10.5%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Utilities & Internet Service</TableCell>
                    <TableCell className="font-mono text-right">{formatBDT(95000)}</TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">{formatBDT(90000)}</TableCell>
                    <TableCell className="text-right text-rose-600 font-semibold">+5.5%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Travel & Conveyance Reimbursement</TableCell>
                    <TableCell className="font-mono text-right">{formatBDT(135000)}</TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">{formatBDT(120000)}</TableCell>
                    <TableCell className="text-right text-rose-600 font-semibold">+12.5%</TableCell>
                  </TableRow>
                  <TableRow className="font-bold border-b border-t bg-muted/20">
                    <TableCell>Total Operating Expenses</TableCell>
                    <TableCell className="font-mono text-right text-rose-600 dark:text-rose-400">{formatBDT(4750000)}</TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">{formatBDT(4290000)}</TableCell>
                    <TableCell className="text-right text-rose-600 font-bold">+10.7%</TableCell>
                  </TableRow>

                  {/* Net Profit */}
                  <TableRow className="font-bold bg-primary/10 text-sm">
                    <TableCell>Net Profit Before Tax</TableCell>
                    <TableCell className="font-mono text-right text-primary font-extrabold">{formatBDT(3350000)}</TableCell>
                    <TableCell className="font-mono text-right text-muted-foreground">{formatBDT(2710000)}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-bold">+23.6%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Balance Sheet */}
        <TabsContent value="balance-sheet" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
              <div>
                <CardTitle className="text-base font-bold">Balance Sheet</CardTitle>
                <p className="text-xs text-muted-foreground">Assets, Liabilities & Equity as of November 22, 2026</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-bold">Classification</TableHead>
                    <TableHead className="text-xs font-bold text-right">Amount (BDT)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  <TableRow className="bg-muted/10 font-bold"><TableCell colSpan={2}>Assets</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Cash & Bank Balances (City Bank & BRAC Bank)</TableCell><TableCell className="font-mono text-right font-semibold">{formatBDT(8050000)}</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Petty Cash Reserves</TableCell><TableCell className="font-mono text-right font-semibold">{formatBDT(120000)}</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Accounts Receivable</TableCell><TableCell className="font-mono text-right font-semibold">{formatBDT(1850000)}</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Office Equipment & Hardware (Net of Depr.)</TableCell><TableCell className="font-mono text-right font-semibold">{formatBDT(1950000)}</TableCell></TableRow>
                  <TableRow className="font-bold bg-muted/20 border-b border-t"><TableCell>Total Assets</TableCell><TableCell className="font-mono text-right text-primary font-bold">{formatBDT(11970000)}</TableCell></TableRow>

                  <TableRow className="bg-muted/10 font-bold"><TableCell colSpan={2}>Liabilities</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Accounts Payable (Vendors)</TableCell><TableCell className="font-mono text-right font-semibold">{formatBDT(940000)}</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Salaries & Wages Payable</TableCell><TableCell className="font-mono text-right font-semibold">{formatBDT(2850000)}</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">TDS Tax & Provident Fund Payable</TableCell><TableCell className="font-mono text-right font-semibold">{formatBDT(600000)}</TableCell></TableRow>
                  <TableRow className="font-bold bg-muted/20 border-b border-t"><TableCell>Total Liabilities</TableCell><TableCell className="font-mono text-right text-rose-600 dark:text-rose-400 font-bold">{formatBDT(4390000)}</TableCell></TableRow>

                  <TableRow className="bg-muted/10 font-bold"><TableCell colSpan={2}>Equity</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Paid-up Share Capital</TableCell><TableCell className="font-mono text-right font-semibold">{formatBDT(5000000)}</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Retained Earnings & Current Period Surplus</TableCell><TableCell className="font-mono text-right font-semibold">{formatBDT(2580000)}</TableCell></TableRow>
                  <TableRow className="font-bold bg-emerald-500/10 border-b border-t text-sm"><TableCell>Total Liabilities & Shareholders' Equity</TableCell><TableCell className="font-mono text-right text-emerald-600 font-extrabold">{formatBDT(11970000)}</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Cash Flow */}
        <TabsContent value="cash-flow" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Statement of Cash Flows</CardTitle>
              <p className="text-xs text-muted-foreground">Operating, Investing, and Financing activities (Direct Method)</p>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-2 border-b pb-3">
                <p className="font-bold text-foreground">Cash Flows from Operating Activities</p>
                <div className="flex justify-between text-muted-foreground"><span>Receipts from Customers</span><span className="font-mono font-semibold text-foreground">{formatBDT(7650000)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Payments to Employees (Salaries)</span><span className="font-mono font-semibold text-rose-600">-{formatBDT(3200000)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Payments to Suppliers & Utilities</span><span className="font-mono font-semibold text-rose-600">-{formatBDT(1180000)}</span></div>
                <div className="flex justify-between font-bold pt-1 border-t text-emerald-600"><span>Net Cash from Operating Activities</span><span className="font-mono">{formatBDT(3270000)}</span></div>
              </div>

              <div className="space-y-2 border-b pb-3">
                <p className="font-bold text-foreground">Cash Flows from Capital & Financing Activities</p>
                <div className="flex justify-between text-muted-foreground"><span>Capital Equipment Acquisitions (Hardware)</span><span className="font-mono font-semibold text-rose-600">-{formatBDT(450000)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Inter-bank Treasury Placements</span><span className="font-mono font-semibold text-foreground">{formatBDT(0)}</span></div>
                <div className="flex justify-between font-bold pt-1 border-t text-foreground"><span>Net Cash Used in Capital Activities</span><span className="font-mono">-{formatBDT(450000)}</span></div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10">
                <span className="font-bold text-sm">Net Increase in Cash & Bank Reserves:</span>
                <span className="font-mono text-xl font-bold text-primary">{formatBDT(2820000)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
