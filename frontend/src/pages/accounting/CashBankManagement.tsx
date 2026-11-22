import { useState } from 'react'
import { toast } from 'sonner'
import {
  Building2,
  Coins,
  ArrowRightLeft,
  Plus,
  Download,
  CheckCircle2,
  Clock3,
  CreditCard,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { DataTable, type Column, type TableFilter } from '@/components/common/DataTable'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  mockBankAccounts as initialBankAccounts,
  mockBankTransactions as initialTransactions,
} from '@/mocks/accountingData'
import { formatBDT } from './accountingUtils'
import type { BankAccount, BankTransaction } from '@/types/accounting'

export default function CashBankManagement() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts)
  const [transactions, setTransactions] = useState<BankTransaction[]>(initialTransactions)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [transferState, setTransferState] = useState({
    fromAccount: 'bank-1',
    toAccount: 'bank-2',
    amount: 100000,
    reference: '',
    description: '',
  })

  // KPI Calculations
  const totalLiquidity = bankAccounts.reduce((sum, b) => sum + b.balance, 0)
  const operatingBalance = bankAccounts.find((b) => b.id === 'bank-1')?.balance || 0
  const payrollReserve = bankAccounts.find((b) => b.id === 'bank-2')?.balance || 0
  const pettyCash = bankAccounts.find((b) => b.type === 'Petty Cash')?.balance || 0

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault()
    if (transferState.fromAccount === transferState.toAccount) {
      toast.error('Source and destination accounts must be different')
      return
    }
    if (transferState.amount <= 0) {
      toast.error('Please enter a valid transfer amount')
      return
    }

    const from = bankAccounts.find((b) => b.id === transferState.fromAccount)
    const to = bankAccounts.find((b) => b.id === transferState.toAccount)

    if (from && from.balance < transferState.amount) {
      toast.error(`Insufficient balance in ${from.bankName}`)
      return
    }

    // Update balances
    setBankAccounts((prev) =>
      prev.map((b) => {
        if (b.id === transferState.fromAccount) return { ...b, balance: b.balance - transferState.amount }
        if (b.id === transferState.toAccount) return { ...b, balance: b.balance + transferState.amount }
        return b
      })
    )

    // Add transaction record
    const newTxn: BankTransaction = {
      id: `bt-custom-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]!,
      bankAccountId: transferState.fromAccount,
      bankAccountName: from ? from.bankName : 'Bank',
      type: 'Transfer',
      amount: transferState.amount,
      reference: transferState.reference || `TRF-${Date.now().toString().slice(-6)}`,
      description:
        transferState.description ||
        `Internal transfer from ${from?.bankName} to ${to?.bankName}`,
      status: 'Reconciled',
    }

    setTransactions((prev) => [newTxn, ...prev])
    setIsTransferOpen(false)
    toast.success(`Transferred ${formatBDT(transferState.amount)} successfully`)
  }

  const columns: Column<BankTransaction>[] = [
    {
      key: 'date',
      header: 'Date',
      cell: (t) => <span className="text-xs text-muted-foreground">{t.date}</span>,
      sortValue: (t) => t.date,
    },
    {
      key: 'bankAccountName',
      header: 'Bank / Source',
      cell: (t) => <span className="font-semibold text-xs text-foreground">{t.bankAccountName}</span>,
      sortValue: (t) => t.bankAccountName,
    },
    {
      key: 'type',
      header: 'Type',
      cell: (t) => (
        <Badge
          variant="outline"
          className={
            t.type === 'Deposit'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200'
              : t.type === 'Withdrawal'
              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200'
              : 'bg-primary/10 text-primary border-primary/20'
          }
        >
          {t.type}
        </Badge>
      ),
      sortValue: (t) => t.type,
    },
    {
      key: 'reference',
      header: 'Reference #',
      cell: (t) => <span className="font-mono text-xs">{t.reference}</span>,
      sortValue: (t) => t.reference,
    },
    {
      key: 'description',
      header: 'Description',
      cell: (t) => <span className="text-xs text-muted-foreground">{t.description}</span>,
      sortValue: (t) => t.description,
    },
    {
      key: 'amount',
      header: 'Amount (BDT)',
      cell: (t) => (
        <span
          className={`font-mono text-xs font-bold ${
            t.type === 'Deposit'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-foreground'
          }`}
        >
          {t.type === 'Deposit' ? '+' : '-'}
          {formatBDT(t.amount)}
        </span>
      ),
      sortValue: (t) => t.amount,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (t) => (
        <Badge variant="outline" className="text-[10px]">
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
        title="Cash & Bank Management"
        description="Monitor corporate bank balances, petty cash, inter-account transfers, and reconciliations."
        actions={
          <Button onClick={() => setIsTransferOpen(true)}>
            <ArrowRightLeft className="mr-1.5 h-4 w-4" />
            Transfer Funds
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Cash Liquidity"
          value={formatBDT(totalLiquidity)}
          icon={Coins}
          tone="emerald"
          trend={3.2}
          description="Available in bank & cash accounts"
        />
        <StatCard
          title="Main Corporate Account"
          value={formatBDT(operatingBalance)}
          icon={Building2}
          tone="primary"
          description="The City Bank Ltd (Operating)"
        />
        <StatCard
          title="Payroll Reserve Pool"
          value={formatBDT(payrollReserve)}
          icon={Wallet}
          tone="violet"
          description="BRAC Bank PLC (Salary)"
        />
        <StatCard
          title="Dhaka HQ Petty Cash"
          value={formatBDT(pettyCash)}
          icon={CreditCard}
          tone="sky"
          description="Immediate expense disbursements"
        />
      </div>

      {/* Bank Account Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bankAccounts.map((bank) => (
          <Card key={bank.id} className="shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">
                  {bank.type}
                </Badge>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {bank.status}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{bank.bankName}</h4>
                <p className="font-mono text-xs text-muted-foreground">{bank.accountNumber}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{bank.branch}</p>
              </div>
              <div className="pt-2 border-t flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Book Balance:</span>
                <span className="font-mono text-base font-bold text-foreground">
                  {formatBDT(bank.balance)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transaction History Table */}
      <DataTable
        data={transactions}
        columns={columns}
        searchPlaceholder="Search bank transactions by reference or description..."
        toolbar={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Bank statement exported to CSV')}
            className="h-9 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export Statement
          </Button>
        }
      />

      {/* Transfer Funds Dialog */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Inter-Account Fund Transfer</DialogTitle>
            <DialogDescription>
              Move liquidity between corporate bank accounts or replenish petty cash.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTransfer} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="fromBank">From Account (Source) *</Label>
              <Select
                value={transferState.fromAccount}
                onValueChange={(val) => setTransferState({ ...transferState, fromAccount: val })}
              >
                <SelectTrigger id="fromBank">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.bankName} ({formatBDT(b.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="toBank">To Account (Destination) *</Label>
              <Select
                value={transferState.toAccount}
                onValueChange={(val) => setTransferState({ ...transferState, toAccount: val })}
              >
                <SelectTrigger id="toBank">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.bankName} ({formatBDT(b.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trfAmount">Transfer Amount (BDT) *</Label>
              <Input
                id="trfAmount"
                type="number"
                min="1"
                value={transferState.amount}
                onChange={(e) =>
                  setTransferState({ ...transferState, amount: Number(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trfDesc">Purpose / Narration</Label>
              <Input
                id="trfDesc"
                placeholder="e.g. Monthly payroll allocation transfer"
                value={transferState.description}
                onChange={(e) =>
                  setTransferState({ ...transferState, description: e.target.value })
                }
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsTransferOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <ArrowRightLeft className="mr-1.5 h-4 w-4" />
                Execute Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
