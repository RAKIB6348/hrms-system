import { Link } from 'react-router-dom'
import {
  Landmark,
  Scale,
  Receipt,
  Coins,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  Clock3,
  Wallet,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/common/StatusBadge'
import {
  mockAccounts,
  mockJournalEntries,
  mockBankAccounts,
  mockExpenses,
  mockPayrollAccountingRecords,
} from '@/mocks/accountingData'
import { formatBDT } from './accountingUtils'

export default function AccountingDashboard() {
  const totalCashAndBank = mockBankAccounts.reduce((sum, b) => sum + b.balance, 0)
  const totalPayables = mockAccounts
    .filter((a) => a.type === 'Liability')
    .reduce((sum, a) => sum + a.balance, 0)
  const pendingExpenses = mockExpenses.filter((e) => e.status === 'Pending').length
  const totalPayrollAccrued = mockPayrollAccountingRecords.reduce((sum, p) => sum + p.totalGross, 0)

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <PageHeader
        title="Accounting Dashboard"
        description="Corporate financial overview, liquidity, payroll integration, and journal ledgers."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/accounting/journal-entries">
                <FileSpreadsheet className="mr-1.5 h-4 w-4" />
                Journal Entries
              </Link>
            </Button>
            <Button asChild>
              <Link to="/accounting/chart-of-accounts">
                <Scale className="mr-1.5 h-4 w-4" />
                Chart of Accounts
              </Link>
            </Button>
          </div>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Cash & Liquid Reserves"
          value={formatBDT(totalCashAndBank)}
          icon={Coins}
          tone="emerald"
          trend={5.4}
          description="Across 4 bank & cash accounts"
        />
        <StatCard
          title="Current Liabilities"
          value={formatBDT(totalPayables)}
          icon={CreditCard}
          tone="amber"
          description="Salaries, TDS, and vendor payables"
        />
        <StatCard
          title="Payroll Accruals (Q4)"
          value={formatBDT(totalPayrollAccrued)}
          icon={Wallet}
          tone="primary"
          description="Simulated payroll ledger staging"
        />
        <StatCard
          title="Pending Expense Claims"
          value={pendingExpenses}
          icon={Receipt}
          tone="violet"
          description="Awaiting finance verification"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/accounting/chart-of-accounts"
          className="group rounded-xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                  Chart of Accounts
                </h4>
                <p className="text-xs text-muted-foreground">{mockAccounts.length} active ledgers</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
          </div>
        </Link>

        <Link
          to="/accounting/cash-bank"
          className="group rounded-xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm group-hover:text-emerald-600 transition-colors">
                  Cash & Bank Accounts
                </h4>
                <p className="text-xs text-muted-foreground">{mockBankAccounts.length} accounts configured</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
          </div>
        </Link>

        <Link
          to="/accounting/payroll-accounting"
          className="group rounded-xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm group-hover:text-indigo-600 transition-colors">
                  Payroll Accounting
                </h4>
                <p className="text-xs text-muted-foreground">Salary journal integration</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
          </div>
        </Link>
      </div>

      {/* Two Column Grid: Recent Journal Entries & Cash/Bank Accounts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Journal Entries */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Recent Journal Entries</CardTitle>
              <p className="text-xs text-muted-foreground">Latest transaction vouchers</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/accounting/journal-entries">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockJournalEntries.map((je) => (
              <div
                key={je.id}
                className="flex items-center justify-between rounded-xl border p-3 bg-muted/10 hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {je.entryNumber}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {je.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                    {je.narration}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{je.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-foreground">
                    {formatBDT(je.totalDebit)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{je.lines.length} lines</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cash & Bank Balances */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Liquid Bank Balances</CardTitle>
              <p className="text-xs text-muted-foreground">Operating accounts & petty cash</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/accounting/cash-bank">
                Manage <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockBankAccounts.map((bank) => (
              <div
                key={bank.id}
                className="flex items-center justify-between rounded-xl border p-3 bg-muted/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-foreground">{bank.bankName}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {bank.accountNumber} · {bank.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatBDT(bank.balance)}
                  </p>
                  <span className="text-[10px] text-muted-foreground font-medium">BDT</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
