import { useState } from 'react'
import { toast } from 'sonner'
import {
  Wallet,
  Scale,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Eye,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockPayrollAccountingRecords as initialRecords } from '@/mocks/accountingData'
import { formatBDT } from './accountingUtils'
import type { PayrollAccountingRecord } from '@/types/accounting'

export default function PayrollAccounting() {
  const [records, setRecords] = useState<PayrollAccountingRecord[]>(initialRecords)
  const [selectedRecord, setSelectedRecord] = useState<PayrollAccountingRecord | null>(null)
  const [isMappingOpen, setIsMappingOpen] = useState(false)

  // KPI Calculations
  const totalGrossStaged = records.reduce((sum, r) => sum + r.totalGross, 0)
  const totalNetPayable = records.reduce((sum, r) => sum + r.netPayable, 0)
  const totalTaxWithholding = records.reduce((sum, r) => sum + r.taxDeductions, 0)
  const totalProvidentFund = records.reduce((sum, r) => sum + r.providentFund, 0)

  const columns: Column<PayrollAccountingRecord>[] = [
    {
      key: 'period',
      header: 'Payroll Period',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            {r.period.slice(0, 3)}
          </div>
          <div>
            <span className="font-semibold text-xs text-foreground">{r.period}</span>
            <p className="font-mono text-[10px] text-muted-foreground">{r.payrollReference}</p>
          </div>
        </div>
      ),
      sortValue: (r) => r.period,
    },
    {
      key: 'totalGross',
      header: 'Gross Payroll (BDT)',
      cell: (r) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {formatBDT(r.totalGross)}
        </span>
      ),
      sortValue: (r) => r.totalGross,
    },
    {
      key: 'netPayable',
      header: 'Net Payable (BDT)',
      cell: (r) => (
        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {formatBDT(r.netPayable)}
        </span>
      ),
      sortValue: (r) => r.netPayable,
    },
    {
      key: 'taxDeductions',
      header: 'Tax (TDS) Withheld',
      cell: (r) => (
        <span className="font-mono text-xs text-amber-600 dark:text-amber-400">
          {formatBDT(r.taxDeductions)}
        </span>
      ),
      sortValue: (r) => r.taxDeductions,
    },
    {
      key: 'providentFund',
      header: 'Provident Fund',
      cell: (r) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatBDT(r.providentFund)}
        </span>
      ),
      sortValue: (r) => r.providentFund,
    },
    {
      key: 'status',
      header: 'Integration Status',
      cell: (r) => (
        <Badge
          variant="outline"
          className={
            r.status === 'Ready for Mapping'
              ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200'
              : 'bg-muted text-muted-foreground'
          }
        >
          {r.status}
        </Badge>
      ),
      sortValue: (r) => r.status,
    },
  ]

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <PageHeader
        title="Payroll Accounting"
        description="General ledger journal mappings, salary accruals, TDS withholding, and provident fund allocations."
        actions={
          <Button
            variant="outline"
            onClick={() => setIsMappingOpen(true)}
          >
            <Sliders className="mr-1.5 h-4 w-4" />
            Ledger Account Mappings
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Preparation sandbox callout notice */}
      <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-xs dark:border-indigo-900/60 dark:bg-indigo-950/20">
        <ShieldAlert className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
        <div className="space-y-1">
          <p className="font-semibold text-indigo-950 dark:text-indigo-300">
            Payroll to Accounting Integration Sandbox
          </p>
          <p className="text-indigo-800/80 dark:text-indigo-400/80 leading-relaxed">
            This module is architected to receive confirmed batches from the Payroll system. Demo records displayed below illustrate double-entry journal staging and are not posted to live financial ledgers.
          </p>
        </div>
      </div>

      {/* Top 4 KPI StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Gross Payroll Staging"
          value={formatBDT(totalGrossStaged)}
          icon={Wallet}
          tone="primary"
          description="Debited to Salaries Expense"
        />
        <StatCard
          title="Net Salaries Payable"
          value={formatBDT(totalNetPayable)}
          icon={CheckCircle2}
          tone="emerald"
          description="Credited to Salary Payable"
        />
        <StatCard
          title="Withholding Tax (TDS)"
          value={formatBDT(totalTaxWithholding)}
          icon={Scale}
          tone="amber"
          description="Statutory NBR liability"
        />
        <StatCard
          title="Provident Fund Pool"
          value={formatBDT(totalProvidentFund)}
          icon={FileSpreadsheet}
          tone="violet"
          description="Trust account allocation"
        />
      </div>

      {/* Active Mapping Schema Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Standard Payroll Journal Mapping Schema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <div className="rounded-lg border p-3 bg-muted/20">
              <span className="text-muted-foreground">Debit Account (Expense)</span>
              <p className="font-mono font-bold text-foreground mt-1">5010</p>
              <p className="text-[11px] text-muted-foreground">Salaries & Allowances Expense</p>
            </div>
            <div className="rounded-lg border p-3 bg-muted/20">
              <span className="text-muted-foreground">Credit Account (Disbursement)</span>
              <p className="font-mono font-bold text-foreground mt-1">2020</p>
              <p className="text-[11px] text-muted-foreground">Salaries & Wages Payable</p>
            </div>
            <div className="rounded-lg border p-3 bg-muted/20">
              <span className="text-muted-foreground">Tax Credit (Liability)</span>
              <p className="font-mono font-bold text-foreground mt-1">2030</p>
              <p className="text-[11px] text-muted-foreground">TDS Income Tax Payable</p>
            </div>
            <div className="rounded-lg border p-3 bg-muted/20">
              <span className="text-muted-foreground">PF Credit (Trust)</span>
              <p className="font-mono font-bold text-foreground mt-1">2040</p>
              <p className="text-[11px] text-muted-foreground">Provident Fund Payable</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main DataTable */}
      <DataTable
        data={records}
        columns={columns}
        searchPlaceholder="Search staged payroll periods..."
        onRowClick={(r) => setSelectedRecord(r)}
        toolbar={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Payroll staging schedule exported')}
            className="h-9 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export Schedule
          </Button>
        }
        rowActions={(r) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Inspect double-entry journal staging"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedRecord(r)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      />

      {/* Simulation Journal Dialog */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <DialogTitle className="text-lg font-bold">
                    Payroll Journal Staging: {selectedRecord.period}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Batch Ref: {selectedRecord.payrollReference} · Processed on{' '}
                    {selectedRecord.dateProcessed}
                  </DialogDescription>
                </div>
                <Badge variant="outline">{selectedRecord.status}</Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <p className="text-xs text-muted-foreground">
                Simulated journal entries demonstrating debit and credit account balances for this run:
              </p>

              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs">Account Code & Title</TableHead>
                      <TableHead className="text-xs text-right">Debit (BDT)</TableHead>
                      <TableHead className="text-xs text-right">Credit (BDT)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-xs">
                        <span className="font-mono font-bold text-primary mr-1">5010</span>{' '}
                        Salaries & Allowances Expense
                      </TableCell>
                      <TableCell className="font-mono text-xs text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatBDT(selectedRecord.totalGross)}
                      </TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground">—</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs">
                        <span className="font-mono font-bold text-primary mr-1">2020</span>{' '}
                        Salaries & Wages Payable (Net)
                      </TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground">—</TableCell>
                      <TableCell className="font-mono text-xs text-right font-bold text-foreground">
                        {formatBDT(selectedRecord.netPayable)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs">
                        <span className="font-mono font-bold text-primary mr-1">2030</span>{' '}
                        TDS Income Tax Payable
                      </TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground">—</TableCell>
                      <TableCell className="font-mono text-xs text-right font-bold text-foreground">
                        {formatBDT(selectedRecord.taxDeductions)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs">
                        <span className="font-mono font-bold text-primary mr-1">2040</span>{' '}
                        Provident Fund (PF) Payable
                      </TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground">—</TableCell>
                      <TableCell className="font-mono text-xs text-right font-bold text-foreground">
                        {formatBDT(selectedRecord.providentFund)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/30 font-bold border-t-2 text-xs">
                      <TableCell className="text-right">Balanced Total:</TableCell>
                      <TableCell className="font-mono text-right text-emerald-600 dark:text-emerald-400">
                        {formatBDT(selectedRecord.totalGross)}
                      </TableCell>
                      <TableCell className="font-mono text-right text-foreground">
                        {formatBDT(
                          selectedRecord.netPayable +
                            selectedRecord.taxDeductions +
                            selectedRecord.providentFund
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Account Mappings Config Dialog */}
      <Dialog open={isMappingOpen} onOpenChange={setIsMappingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payroll Ledger Account Mappings</DialogTitle>
            <DialogDescription>
              Configure default general ledger accounts for salary, tax withholding, and benefit expenses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <span className="font-semibold">Gross Salary Expense Account:</span>
              <p className="font-mono p-2 rounded-lg border bg-muted/20 font-bold">
                5010 — Salaries & Allowances Expense
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-semibold">Disbursement Payable Account:</span>
              <p className="font-mono p-2 rounded-lg border bg-muted/20 font-bold">
                2020 — Salaries & Wages Payable
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-semibold">Withholding Tax Liability Account:</span>
              <p className="font-mono p-2 rounded-lg border bg-muted/20 font-bold">
                2030 — Tax Deducted at Source (TDS) Payable
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-semibold">Provident Fund Liability Account:</span>
              <p className="font-mono p-2 rounded-lg border bg-muted/20 font-bold">
                2040 — Provident Fund (PF) Contribution Payable
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setIsMappingOpen(false)
                toast.success('Payroll account mappings verified')
              }}
            >
              Confirm Schema
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
