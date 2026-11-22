import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Scale,
  CheckCircle2,
  Download,
  Printer,
  Calendar,
  Building2,
  DollarSign,
  Layers,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockTrialBalance } from '@/mocks/accountingData'
import { formatBDT } from './accountingUtils'
import type { AccountType } from '@/types/accounting'

export default function TrialBalance() {
  const [selectedType, setSelectedType] = useState<string>('all')

  const totalDebit = mockTrialBalance.reduce((sum, item) => sum + item.debit, 0)
  const totalCredit = mockTrialBalance.reduce((sum, item) => sum + item.credit, 0)
  const isBalanced = totalDebit === totalCredit

  const filteredItems = useMemo(() => {
    if (selectedType === 'all') return mockTrialBalance
    return mockTrialBalance.filter((i) => i.type === selectedType)
  }, [selectedType])

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <PageHeader
        title="Trial Balance"
        description="Verification worksheet proving mathematical equality of total debits and credits."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success('Trial balance exported to CSV')}
            >
              <Download className="mr-1.5 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="mr-1.5 h-4 w-4" />
              Print Worksheet
            </Button>
          </div>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Debit Balance"
          value={formatBDT(totalDebit)}
          icon={Scale}
          tone="emerald"
          description="Sum of all debit ledgers"
        />
        <StatCard
          title="Total Credit Balance"
          value={formatBDT(totalCredit)}
          icon={Scale}
          tone="primary"
          description="Sum of all credit ledgers"
        />
        <StatCard
          title="Worksheet Status"
          value={isBalanced ? 'Balanced' : 'Unbalanced'}
          icon={CheckCircle2}
          tone="emerald"
          description="0.00 BDT mathematical difference"
        />
        <StatCard
          title="Accounts Surveyed"
          value={mockTrialBalance.length}
          icon={Layers}
          tone="sky"
          description="All active balance accounts"
        />
      </div>

      {/* Filter Tabs Card */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Filter Class:</span>
            {['all', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs rounded-full px-3"
                onClick={() => setSelectedType(type)}
              >
                {type === 'all' ? 'All Classes' : type}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>As of November 22, 2026</span>
          </div>
        </CardContent>
      </Card>

      {/* Trial Balance Worksheet Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-24 text-xs font-bold">Code</TableHead>
                <TableHead className="text-xs font-bold">Account Description</TableHead>
                <TableHead className="w-32 text-xs font-bold">Classification</TableHead>
                <TableHead className="text-xs font-bold text-right w-44">Debit (BDT)</TableHead>
                <TableHead className="text-xs font-bold text-right w-44">Credit (BDT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((row) => (
                <TableRow key={row.accountCode} className="hover:bg-muted/20">
                  <TableCell className="font-mono text-xs font-bold text-primary">
                    {row.accountCode}
                  </TableCell>
                  <TableCell className="font-medium text-xs text-foreground">
                    {row.accountName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {row.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-right font-semibold">
                    {row.debit > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {formatBDT(row.debit)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-right font-semibold">
                    {row.credit > 0 ? formatBDT(row.credit) : '—'}
                  </TableCell>
                </TableRow>
              ))}

              {/* Summary Totals Row */}
              <TableRow className="bg-muted/40 font-bold border-t-2 text-sm">
                <TableCell colSpan={3} className="text-right text-xs">
                  Grand Total Balance (As of Current Period):
                </TableCell>
                <TableCell className="font-mono text-xs text-right text-emerald-600 dark:text-emerald-400 font-bold">
                  {formatBDT(totalDebit)}
                </TableCell>
                <TableCell className="font-mono text-xs text-right text-foreground font-bold">
                  {formatBDT(totalCredit)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
