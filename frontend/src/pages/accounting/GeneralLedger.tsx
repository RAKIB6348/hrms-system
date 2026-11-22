import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  BookText,
  Search,
  Download,
  Filter,
  Building2,
  Calendar,
  Scale,
  DollarSign,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockLedgerTransactions, mockAccounts } from '@/mocks/accountingData'
import { formatBDT } from './accountingUtils'
import type { LedgerTransaction } from '@/types/accounting'

export default function GeneralLedger() {
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>('all')

  const filteredTransactions = useMemo(() => {
    if (selectedAccountCode === 'all') return mockLedgerTransactions
    return mockLedgerTransactions.filter((t) => t.accountCode === selectedAccountCode)
  }, [selectedAccountCode])

  const totalDebits = filteredTransactions.reduce((sum, t) => sum + t.debit, 0)
  const totalCredits = filteredTransactions.reduce((sum, t) => sum + t.credit, 0)
  const netBalance = totalDebits - totalCredits

  const filters: TableFilter<LedgerTransaction>[] = [
    {
      key: 'accountCode',
      label: 'Accounts',
      options: Array.from(new Set(mockLedgerTransactions.map((t) => t.accountCode))),
      value: (t) => t.accountCode,
    },
  ]

  const columns: Column<LedgerTransaction>[] = [
    {
      key: 'date',
      header: 'Date',
      cell: (t) => <span className="text-xs text-muted-foreground">{t.date}</span>,
      sortValue: (t) => t.date,
    },
    {
      key: 'account',
      header: 'Account',
      cell: (t) => (
        <div>
          <span className="font-mono text-xs font-bold text-primary mr-1.5">{t.accountCode}</span>
          <span className="font-medium text-xs text-foreground">{t.accountName}</span>
        </div>
      ),
      sortValue: (t) => t.accountCode,
    },
    {
      key: 'entryNumber',
      header: 'Voucher #',
      cell: (t) => (
        <Badge variant="outline" className="font-mono text-[10px]">
          {t.entryNumber}
        </Badge>
      ),
      sortValue: (t) => t.entryNumber,
    },
    {
      key: 'description',
      header: 'Description',
      cell: (t) => (
        <span className="text-xs text-muted-foreground truncate max-w-[280px]">
          {t.description}
        </span>
      ),
      sortValue: (t) => t.description,
    },
    {
      key: 'debit',
      header: 'Debit (BDT)',
      cell: (t) => (
        <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {t.debit > 0 ? formatBDT(t.debit) : '—'}
        </span>
      ),
      sortValue: (t) => t.debit,
    },
    {
      key: 'credit',
      header: 'Credit (BDT)',
      cell: (t) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {t.credit > 0 ? formatBDT(t.credit) : '—'}
        </span>
      ),
      sortValue: (t) => t.credit,
    },
    {
      key: 'balance',
      header: 'Running Balance',
      cell: (t) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {formatBDT(t.balance)}
        </span>
      ),
      sortValue: (t) => t.balance,
    },
  ]

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <PageHeader
        title="General Ledger"
        description="Comprehensive audit trail of historical transactions and running account balances."
        actions={
          <Button
            variant="outline"
            onClick={() => toast.success('General ledger exported to CSV')}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export Ledger
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Debits Posted"
          value={formatBDT(totalDebits)}
          icon={Scale}
          tone="emerald"
          description="Debited to selected ledgers"
        />
        <StatCard
          title="Total Credits Posted"
          value={formatBDT(totalCredits)}
          icon={Scale}
          tone="primary"
          description="Credited to selected ledgers"
        />
        <StatCard
          title="Net Ledger Variance"
          value={formatBDT(Math.abs(netBalance))}
          icon={DollarSign}
          tone="violet"
          description="Active ledger movement"
        />
        <StatCard
          title="Active Accounts"
          value={mockAccounts.length}
          icon={Building2}
          tone="sky"
          description="Configured Chart of Accounts"
        />
      </div>

      {/* Filter by Account Card */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Filter by Ledger Account:
            </span>
            <div className="w-full sm:w-80">
              <Select value={selectedAccountCode} onValueChange={setSelectedAccountCode}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Ledger Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ledger Accounts</SelectItem>
                  {mockAccounts.map((a) => (
                    <SelectItem key={a.code} value={a.code}>
                      {a.code} — {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Showing <strong className="font-semibold text-foreground">{filteredTransactions.length}</strong> transactions
          </div>
        </CardContent>
      </Card>

      {/* Main DataTable */}
      <DataTable
        data={filteredTransactions}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search transactions by reference or description..."
      />
    </div>
  )
}
