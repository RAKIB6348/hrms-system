import { useState } from 'react'
import { toast } from 'sonner'
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Download,
  Building2,
  DollarSign,
  ArrowRightLeft,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { mockPaymentTransactions as initialTransactions } from '@/mocks/accountingData'
import { formatBDT } from './accountingUtils'
import type { PaymentTransaction } from '@/types/accounting'

export default function PaymentsTransactions() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(initialTransactions)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newTxn, setNewTxn] = useState({
    payee: '',
    category: 'Vendor Payment',
    paymentMethod: 'Bank Transfer' as PaymentTransaction['paymentMethod'],
    amount: 50000,
    reference: '',
    date: new Date().toISOString().split('T')[0]!,
  })

  // KPI Calculations
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
  const completedCount = transactions.filter((t) => t.status === 'Completed').length
  const pendingCount = transactions.filter((t) => t.status === 'Pending').length

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTxn.payee.trim() || newTxn.amount <= 0) {
      toast.error('Please enter payee and valid amount')
      return
    }

    const created: PaymentTransaction = {
      id: `pt-custom-${Date.now()}`,
      transactionId: `TXN-BDT-2026-${String(transactions.length + 1).padStart(3, '0')}`,
      date: newTxn.date,
      payee: newTxn.payee,
      category: newTxn.category,
      paymentMethod: newTxn.paymentMethod,
      amount: Number(newTxn.amount),
      status: 'Completed',
      reference: newTxn.reference || `REF-${Date.now().toString().slice(-5)}`,
    }

    setTransactions((prev) => [created, ...prev])
    setIsAddOpen(false)
    toast.success(`Payment voucher ${created.transactionId} recorded`)
  }

  const filters: TableFilter<PaymentTransaction>[] = [
    {
      key: 'status',
      label: 'Status',
      options: ['Completed', 'Pending', 'Failed'],
      value: (t) => t.status,
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      options: ['Bank Transfer', 'Cheque', 'Cash', 'Corporate Card'],
      value: (t) => t.paymentMethod,
    },
  ]

  const columns: Column<PaymentTransaction>[] = [
    {
      key: 'transactionId',
      header: 'Txn ID',
      cell: (t) => (
        <span className="font-mono text-xs font-bold text-primary">{t.transactionId}</span>
      ),
      sortValue: (t) => t.transactionId,
    },
    {
      key: 'payee',
      header: 'Payee / Beneficiary',
      cell: (t) => (
        <div>
          <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
            {t.payee}
          </p>
          <p className="text-[11px] text-muted-foreground">{t.category}</p>
        </div>
      ),
      sortValue: (t) => t.payee,
    },
    {
      key: 'date',
      header: 'Disbursement Date',
      cell: (t) => <span className="text-xs text-muted-foreground">{t.date}</span>,
      sortValue: (t) => t.date,
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      cell: (t) => <span className="text-xs font-medium">{t.paymentMethod}</span>,
      sortValue: (t) => t.paymentMethod,
    },
    {
      key: 'amount',
      header: 'Amount (BDT)',
      cell: (t) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {formatBDT(t.amount)}
        </span>
      ),
      sortValue: (t) => t.amount,
    },
    {
      key: 'reference',
      header: 'Reference #',
      cell: (t) => <span className="font-mono text-xs text-muted-foreground">{t.reference}</span>,
      sortValue: (t) => t.reference,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (t) => (
        <Badge
          variant="outline"
          className={
            t.status === 'Completed'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200'
          }
        >
          {t.status}
        </Badge>
      ),
      sortValue: (t) => t.status,
    },
  ]

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <PageHeader
        title="Payments & Transactions"
        description="Vendor disbursements, statutory tax payments, utility settle accounts, and electronic remittances."
        actions={
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Record Payment
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Payments (Q4)"
          value={formatBDT(totalAmount)}
          icon={CreditCard}
          tone="primary"
          trend={4.5}
          description="Disbursed via bank & card"
        />
        <StatCard
          title="Completed Transactions"
          value={completedCount}
          icon={CheckCircle2}
          tone="emerald"
          description="Settled and cleared vouchers"
        />
        <StatCard
          title="Pending Clearances"
          value={pendingCount}
          icon={Clock3}
          tone="amber"
          description="Awaiting bank acknowledgment"
        />
        <StatCard
          title="Settlement Mode"
          value="Bank ACH & EFT"
          icon={ArrowRightLeft}
          tone="sky"
          description="BEFTN / NPSB / RTGS"
        />
      </div>

      {/* Main DataTable */}
      <DataTable
        data={transactions}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search payments by payee, reference, or category..."
        toolbar={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Transactions statement exported to CSV')}
            className="h-9 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export Statement
          </Button>
        }
      />

      {/* Record Payment Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment Transaction</DialogTitle>
            <DialogDescription>
              Log an outgoing payment voucher for a vendor, tax bill, or operational expense.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="payee">Payee / Beneficiary *</Label>
              <Input
                id="payee"
                placeholder="e.g. Bangladesh Power Development Board"
                value={newTxn.payee}
                onChange={(e) => setNewTxn({ ...newTxn, payee: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g. Utilities"
                  value={newTxn.category}
                  onChange={(e) => setNewTxn({ ...newTxn, category: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={newTxn.paymentMethod}
                  onValueChange={(val) =>
                    setNewTxn({
                      ...newTxn,
                      paymentMethod: val as PaymentTransaction['paymentMethod'],
                    })
                  }
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer (BEFTN/RTGS)</SelectItem>
                    <SelectItem value="Corporate Card">Corporate Card</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount (BDT) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={newTxn.amount}
                  onChange={(e) => setNewTxn({ ...newTxn, amount: Number(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newTxn.date}
                  onChange={(e) => setNewTxn({ ...newTxn, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reference">Bill / Reference #</Label>
              <Input
                id="reference"
                placeholder="e.g. BILL-NOV-8812"
                value={newTxn.reference}
                onChange={(e) => setNewTxn({ ...newTxn, reference: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="mr-1.5 h-4 w-4" />
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
