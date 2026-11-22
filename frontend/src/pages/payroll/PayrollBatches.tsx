import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Download,
  Play,
  Wallet,
  Clock3,
  Users,
  CreditCard,
  Eye,
  CheckCircle2,
  Calendar,
  Building,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
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
import { Progress } from '@/components/ui/progress'
import { GeneratePayslipsDialog } from '@/features/payroll/GeneratePayslipsDialog'
import { usePayrollStore } from '@/hooks/use-payroll-store'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PayrollBatch } from '@/types'

const filters: TableFilter<PayrollBatch>[] = [
  {
    key: 'status',
    label: 'Status',
    options: ['Draft', 'Processing', 'Completed', 'Paid'],
    value: (r) => r.status,
  },
]

export default function PayrollBatches() {
  const batches = usePayrollStore((state) => state.batches)
  const markBatchPaid = usePayrollStore((state) => state.markBatchPaid)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<PayrollBatch | null>(null)

  // Top KPI Metric Calculations
  const paidBatches = batches.filter((b) => b.status === 'Paid' || b.status === 'Completed')
  const totalDisbursedYTD = paidBatches.reduce((acc, b) => acc + b.totalAmount, 0)
  const processingCount = batches.filter((b) => b.status === 'Processing' || b.status === 'Draft').length
  const latestBatch = batches[0]
  const totalEmployeesCovered = latestBatch ? latestBatch.employees : 220
  const avgPayoutPerHead =
    latestBatch && latestBatch.employees > 0
      ? Math.round(latestBatch.totalAmount / latestBatch.employees)
      : 8386

  const handleMarkPaid = (batch: PayrollBatch) => {
    markBatchPaid(batch.id)
    if (selectedBatch?.id === batch.id) {
      setSelectedBatch({ ...batch, status: 'Paid' })
    }
    toast.success(`${batch.name} disbursed and marked as Paid`)
  }

  const columns: Column<PayrollBatch>[] = [
    {
      key: 'name',
      header: 'Batch Name',
      cell: (b) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {b.name}
            </p>
            <p className="text-xs text-muted-foreground">Cycle {b.period}</p>
          </div>
        </div>
      ),
      sortValue: (b) => b.name,
    },
    {
      key: 'period',
      header: 'Payroll Period',
      cell: (b) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-medium text-foreground">{b.period}</span>
        </div>
      ),
      sortValue: (b) => b.period,
    },
    {
      key: 'employees',
      header: 'Employees',
      cell: (b) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-semibold">{b.employees}</span>
        </div>
      ),
      sortValue: (b) => b.employees,
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      cell: (b) => (
        <span className="font-mono text-sm font-bold text-foreground">
          {formatCurrency(b.totalAmount)}
        </span>
      ),
      sortValue: (b) => b.totalAmount,
    },
    {
      key: 'processedOn',
      header: 'Processed On',
      cell: (b) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(b.processedOn, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
      sortValue: (b) => b.processedOn,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (b) => <StatusBadge status={b.status} />,
      sortValue: (b) => b.status,
    },
  ]

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Payroll Batches"
        description="Process, track, and disburse monthly employee payroll batches."
        actions={
          <Button onClick={() => setGenerateOpen(true)}>
            <Play className="mr-1.5 h-4 w-4" />
            Create Batch
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI Metrics StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Disbursed (YTD)"
          value={`$${(totalDisbursedYTD / 1000000).toFixed(2)}M`}
          icon={Wallet}
          tone="emerald"
          trend={6.4}
          description="Across completed payroll cycles"
        />
        <StatCard
          title="Active Processing"
          value={processingCount}
          icon={Clock3}
          tone="primary"
          description="Awaiting disbursement settlement"
        />
        <StatCard
          title="Employees Covered"
          value={totalEmployeesCovered}
          icon={Users}
          tone="violet"
          description="Active headcount on payroll"
        />
        <StatCard
          title="Avg Payout / Head"
          value={formatCurrency(avgPayoutPerHead)}
          icon={CreditCard}
          tone="sky"
          trend={2.1}
          description="Monthly average net disbursement"
        />
      </div>

      {/* Main DataTable */}
      <DataTable
        data={batches}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search payroll batches..."
        onRowClick={(b) => setSelectedBatch(b)}
        toolbar={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting batch records to CSV')}
            className="h-9 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
        rowActions={(b) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="View batch details"
              onClick={() => setSelectedBatch(b)}
            >
              <Eye className="h-4 w-4" />
            </Button>

            {b.status === 'Processing' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                title="Mark as paid / Disburse"
                onClick={() => handleMarkPaid(b)}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Download batch statement"
              onClick={() => toast.success(`${b.name} report downloaded (demo)`)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      {/* Batch Details Dialog */}
      {selectedBatch && (
        <Dialog open={!!selectedBatch} onOpenChange={(open) => !open && setSelectedBatch(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-start justify-between pr-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold">{selectedBatch.name}</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      Period: {selectedBatch.period} · Processed on {formatDate(selectedBatch.processedOn)}
                    </DialogDescription>
                  </div>
                </div>
                <StatusBadge status={selectedBatch.status} />
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Batch Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border p-3 bg-muted/20">
                  <span className="text-xs text-muted-foreground">Total Batch Amount</span>
                  <p className="font-mono text-lg font-bold text-primary mt-0.5">
                    {formatCurrency(selectedBatch.totalAmount)}
                  </p>
                </div>
                <div className="rounded-xl border p-3 bg-muted/20">
                  <span className="text-xs text-muted-foreground">Employees</span>
                  <p className="text-lg font-bold mt-0.5">{selectedBatch.employees}</p>
                </div>
                <div className="rounded-xl border p-3 bg-muted/20">
                  <span className="text-xs text-muted-foreground">Average / Head</span>
                  <p className="font-mono text-base font-semibold mt-0.5">
                    {formatCurrency(
                      selectedBatch.employees > 0
                        ? Math.round(selectedBatch.totalAmount / selectedBatch.employees)
                        : 0
                    )}
                  </p>
                </div>
              </div>

              {/* Department Allocation Breakdown */}
              <div className="rounded-xl border bg-slate-50 dark:bg-slate-900/50 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Department Payroll Distribution
                </p>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Engineering (52%)</span>
                      <span className="font-semibold">{formatCurrency(selectedBatch.totalAmount * 0.52)}</span>
                    </div>
                    <Progress value={52} className="h-2 bg-muted" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Sales & Marketing (24%)</span>
                      <span className="font-semibold">{formatCurrency(selectedBatch.totalAmount * 0.24)}</span>
                    </div>
                    <Progress value={24} className="h-2 bg-muted" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Human Resources (14%)</span>
                      <span className="font-semibold">{formatCurrency(selectedBatch.totalAmount * 0.14)}</span>
                    </div>
                    <Progress value={14} className="h-2 bg-muted" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Finance & Admin (10%)</span>
                      <span className="font-semibold">{formatCurrency(selectedBatch.totalAmount * 0.1)}</span>
                    </div>
                    <Progress value={10} className="h-2 bg-muted" />
                  </div>
                </div>
              </div>

              {/* Disbursement Note */}
              <div className="rounded-lg border p-3 flex items-center justify-between text-xs bg-muted/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    Direct automated ACH / SEPA batch file prepared
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Direct Deposit
                </Badge>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success(`Exported details for ${selectedBatch.name}`)}
              >
                <Download className="mr-1.5 h-4 w-4" />
                Export Statement
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedBatch(null)}>
                  Close
                </Button>
                {selectedBatch.status === 'Processing' && (
                  <Button size="sm" onClick={() => handleMarkPaid(selectedBatch)}>
                    <Play className="mr-1.5 h-4 w-4" />
                    Disburse & Mark Paid
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Generate Payslips Dialog */}
      <GeneratePayslipsDialog open={generateOpen} onOpenChange={setGenerateOpen} />
    </div>
  )
}
