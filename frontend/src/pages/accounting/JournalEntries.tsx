import { useState } from 'react'
import { toast } from 'sonner'
import {
  FileSpreadsheet,
  Plus,
  Scale,
  CheckCircle2,
  Clock3,
  Eye,
  Download,
  AlertCircle,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockJournalEntries as initialEntries, mockAccounts } from '@/mocks/accountingData'
import { formatBDT } from './accountingUtils'
import type { JournalEntry, JournalLine } from '@/types/accounting'

export default function JournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0]!,
    reference: '',
    narration: '',
    debitAccount: '5010',
    creditAccount: '1010',
    amount: 10000,
  })

  // KPI Calculations
  const totalDebits = entries.reduce((sum, e) => sum + e.totalDebit, 0)
  const totalCredits = entries.reduce((sum, e) => sum + e.totalCredit, 0)
  const postedCount = entries.filter((e) => e.status === 'Posted').length
  const draftCount = entries.filter((e) => e.status === 'Draft').length

  const filters: TableFilter<JournalEntry>[] = [
    {
      key: 'status',
      label: 'Status',
      options: ['Posted', 'Draft', 'Pending Approval'],
      value: (e) => e.status,
    },
  ]

  const columns: Column<JournalEntry>[] = [
    {
      key: 'entryNumber',
      header: 'Voucher #',
      cell: (e) => (
        <span className="font-mono text-xs font-bold text-primary">{e.entryNumber}</span>
      ),
      sortValue: (e) => e.entryNumber,
    },
    {
      key: 'date',
      header: 'Posting Date',
      cell: (e) => <span className="text-xs text-muted-foreground">{e.date}</span>,
      sortValue: (e) => e.date,
    },
    {
      key: 'reference',
      header: 'Reference',
      cell: (e) => (
        <Badge variant="outline" className="font-mono text-[10px]">
          {e.reference}
        </Badge>
      ),
      sortValue: (e) => e.reference,
    },
    {
      key: 'narration',
      header: 'Narration / Description',
      cell: (e) => (
        <div>
          <p className="font-medium text-xs text-foreground truncate max-w-[320px]">
            {e.narration}
          </p>
          <p className="text-[10px] text-muted-foreground">{e.lines.length} split line items</p>
        </div>
      ),
      sortValue: (e) => e.narration,
    },
    {
      key: 'totalDebit',
      header: 'Debit (BDT)',
      cell: (e) => (
        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {formatBDT(e.totalDebit)}
        </span>
      ),
      sortValue: (e) => e.totalDebit,
    },
    {
      key: 'totalCredit',
      header: 'Credit (BDT)',
      cell: (e) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {formatBDT(e.totalCredit)}
        </span>
      ),
      sortValue: (e) => e.totalCredit,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (e) => (
        <Badge
          variant="outline"
          className={
            e.status === 'Posted'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200'
          }
        >
          {e.status}
        </Badge>
      ),
      sortValue: (e) => e.status,
    },
  ]

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEntry.narration.trim() || newEntry.amount <= 0) {
      toast.error('Please enter narration and valid amount')
      return
    }

    const debitAcc = mockAccounts.find((a) => a.code === newEntry.debitAccount)
    const creditAcc = mockAccounts.find((a) => a.code === newEntry.creditAccount)

    const created: JournalEntry = {
      id: `je-custom-${Date.now()}`,
      entryNumber: `JE-2026-${String(entries.length + 1).padStart(3, '0')}`,
      date: newEntry.date,
      reference: newEntry.reference || 'MANUAL-VOUCHER',
      narration: newEntry.narration,
      status: 'Draft',
      totalDebit: Number(newEntry.amount),
      totalCredit: Number(newEntry.amount),
      createdBy: 'Finance Admin (Demo)',
      lines: [
        {
          id: `jl-${Date.now()}-1`,
          accountCode: newEntry.debitAccount,
          accountName: debitAcc ? debitAcc.name : 'Expense Account',
          debit: Number(newEntry.amount),
          credit: 0,
          description: newEntry.narration,
        },
        {
          id: `jl-${Date.now()}-2`,
          accountCode: newEntry.creditAccount,
          accountName: creditAcc ? creditAcc.name : 'Bank Account',
          debit: 0,
          credit: Number(newEntry.amount),
          description: newEntry.narration,
        },
      ],
    }

    setEntries((prev) => [created, ...prev])
    setIsAddOpen(false)
    toast.success(`Journal Voucher ${created.entryNumber} drafted`)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <PageHeader
        title="Journal Entries"
        description="Double-entry general journal vouchers, balanced debit & credit records."
        actions={
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Journal Entry
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Debits (YTD)"
          value={formatBDT(totalDebits)}
          icon={Scale}
          tone="emerald"
          description="Sum of all debit lines"
        />
        <StatCard
          title="Total Credits (YTD)"
          value={formatBDT(totalCredits)}
          icon={Scale}
          tone="primary"
          description="Sum of all credit lines"
        />
        <StatCard
          title="Posted Vouchers"
          value={postedCount}
          icon={CheckCircle2}
          tone="violet"
          description="Approved & verified entries"
        />
        <StatCard
          title="Draft / Staging"
          value={draftCount}
          icon={Clock3}
          tone="amber"
          description="Unposted vouchers pending review"
        />
      </div>

      {/* Main DataTable */}
      <DataTable
        data={entries}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search journal vouchers by number, narration, or reference..."
        onRowClick={(e) => setSelectedEntry(e)}
        toolbar={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Journal records exported to CSV')}
            className="h-9 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export Journal
          </Button>
        }
        rowActions={(e) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Inspect voucher breakdown"
            onClick={(ev) => {
              ev.stopPropagation()
              setSelectedEntry(e)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      />

      {/* Journal Entry Line Items Dialog */}
      {selectedEntry && (
        <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <DialogTitle className="text-xl font-bold">
                    Journal Voucher: {selectedEntry.entryNumber}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Date: {selectedEntry.date} · Ref: {selectedEntry.reference} · Created by:{' '}
                    {selectedEntry.createdBy}
                  </DialogDescription>
                </div>
                <Badge variant="outline">{selectedEntry.status}</Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-lg border p-3 bg-muted/20 text-xs">
                <span className="font-semibold text-muted-foreground">Narration:</span>
                <p className="mt-0.5 text-foreground">{selectedEntry.narration}</p>
              </div>

              {/* Line items table */}
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs">Account</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs text-right">Debit (BDT)</TableHead>
                      <TableHead className="text-xs text-right">Credit (BDT)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEntry.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="text-xs">
                          <span className="font-mono font-bold text-primary mr-1.5">
                            {line.accountCode}
                          </span>
                          <span className="font-medium">{line.accountName}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {line.description || '—'}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-right font-semibold">
                          {line.debit > 0 ? formatBDT(line.debit) : '—'}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-right font-semibold">
                          {line.credit > 0 ? formatBDT(line.credit) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30 font-bold border-t-2">
                      <TableCell colSpan={2} className="text-xs text-right">
                        Total Balance:
                      </TableCell>
                      <TableCell className="font-mono text-xs text-right text-emerald-600 dark:text-emerald-400">
                        {formatBDT(selectedEntry.totalDebit)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-right text-foreground">
                        {formatBDT(selectedEntry.totalCredit)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedEntry(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Journal Entry Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Double-Entry Voucher</DialogTitle>
            <DialogDescription>
              Record a manual journal entry with balanced debit and credit accounts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="jeDate">Posting Date</Label>
                <Input
                  id="jeDate"
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jeRef">Reference / Invoice #</Label>
                <Input
                  id="jeRef"
                  placeholder="e.g. INV-2026-901"
                  value={newEntry.reference}
                  onChange={(e) => setNewEntry({ ...newEntry, reference: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jeNarration">Voucher Narration *</Label>
              <Input
                id="jeNarration"
                placeholder="e.g. Monthly internet service settlement for Dhaka HQ"
                value={newEntry.narration}
                onChange={(e) => setNewEntry({ ...newEntry, narration: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="jeDebitAcc">Debit Account *</Label>
                <Select
                  value={newEntry.debitAccount}
                  onValueChange={(val) => setNewEntry({ ...newEntry, debitAccount: val })}
                >
                  <SelectTrigger id="jeDebitAcc">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAccounts.map((a) => (
                      <SelectItem key={a.code} value={a.code}>
                        {a.code} - {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jeCreditAcc">Credit Account *</Label>
                <Select
                  value={newEntry.creditAccount}
                  onValueChange={(val) => setNewEntry({ ...newEntry, creditAccount: val })}
                >
                  <SelectTrigger id="jeCreditAcc">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAccounts.map((a) => (
                      <SelectItem key={a.code} value={a.code}>
                        {a.code} - {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jeAmount">Voucher Amount (BDT) *</Label>
              <Input
                id="jeAmount"
                type="number"
                min="1"
                value={newEntry.amount}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, amount: Number(e.target.value) || 0 })
                }
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="mr-1.5 h-4 w-4" />
                Draft Voucher
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
