import { useState } from 'react'
import { toast } from 'sonner'
import {
  FolderTree,
  Plus,
  Search,
  Scale,
  DollarSign,
  Download,
  Eye,
  Pencil,
  CheckCircle2,
  Building2,
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
import { mockAccounts as initialAccounts } from '@/mocks/accountingData'
import { formatBDT } from './accountingUtils'
import type { Account, AccountType } from '@/types/accounting'

const accountTypes: AccountType[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']

const typeBadgeStyles: Record<AccountType, string> = {
  Asset: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200',
  Liability: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200',
  Equity: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200',
  Revenue: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200',
  Expense: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200',
}

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newAccount, setNewAccount] = useState({
    code: '',
    name: '',
    type: 'Asset' as AccountType,
    category: 'Current Assets',
    balance: 0,
    description: '',
  })

  // KPI Calculations
  const totalAssets = accounts
    .filter((a) => a.type === 'Asset')
    .reduce((sum, a) => sum + a.balance, 0)
  const totalLiabilities = accounts
    .filter((a) => a.type === 'Liability')
    .reduce((sum, a) => sum + a.balance, 0)
  const totalEquity = accounts
    .filter((a) => a.type === 'Equity')
    .reduce((sum, a) => sum + a.balance, 0)
  const totalRevenue = accounts
    .filter((a) => a.type === 'Revenue')
    .reduce((sum, a) => sum + a.balance, 0)

  const filters: TableFilter<Account>[] = [
    {
      key: 'type',
      label: 'Account Types',
      options: accountTypes,
      value: (a) => a.type,
    },
  ]

  const columns: Column<Account>[] = [
    {
      key: 'code',
      header: 'Account Code',
      cell: (a) => (
        <span className="font-mono text-xs font-bold text-primary">{a.code}</span>
      ),
      sortValue: (a) => a.code,
    },
    {
      key: 'name',
      header: 'Account Name',
      cell: (a) => (
        <div>
          <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
            {a.name}
          </p>
          {a.description && (
            <p className="text-xs text-muted-foreground truncate max-w-[280px]">
              {a.description}
            </p>
          )}
        </div>
      ),
      sortValue: (a) => a.name,
    },
    {
      key: 'type',
      header: 'Type',
      cell: (a) => (
        <Badge variant="outline" className={`text-xs px-2 py-0.5 ${typeBadgeStyles[a.type]}`}>
          {a.type}
        </Badge>
      ),
      sortValue: (a) => a.type,
    },
    {
      key: 'category',
      header: 'Category',
      cell: (a) => <span className="text-xs text-muted-foreground">{a.category}</span>,
      sortValue: (a) => a.category,
    },
    {
      key: 'balance',
      header: 'Balance (BDT)',
      cell: (a) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {formatBDT(a.balance)}
        </span>
      ),
      sortValue: (a) => a.balance,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (a) => (
        <Badge
          variant="outline"
          className={
            a.status === 'Active'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200'
              : 'bg-muted text-muted-foreground'
          }
        >
          {a.status}
        </Badge>
      ),
      sortValue: (a) => a.status,
    },
  ]

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAccount.code.trim() || !newAccount.name.trim()) {
      toast.error('Please enter account code and name')
      return
    }

    const created: Account = {
      id: `acc-custom-${Date.now()}`,
      code: newAccount.code.trim(),
      name: newAccount.name.trim(),
      type: newAccount.type,
      category: newAccount.category,
      balance: Number(newAccount.balance) || 0,
      currency: 'BDT',
      status: 'Active',
      description: newAccount.description,
    }

    setAccounts((prev) => [...prev, created])
    setIsAddOpen(false)
    toast.success(`Account ${created.code} — ${created.name} created`)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <PageHeader
        title="Chart of Accounts"
        description="Standard general ledger accounts, categories, codes, and balance sheets."
        actions={
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Account
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Assets"
          value={formatBDT(totalAssets)}
          icon={Building2}
          tone="emerald"
          description="Liquid & capital assets"
        />
        <StatCard
          title="Total Liabilities"
          value={formatBDT(totalLiabilities)}
          icon={Scale}
          tone="amber"
          description="Current & accrued obligations"
        />
        <StatCard
          title="Total Equity"
          value={formatBDT(totalEquity)}
          icon={DollarSign}
          tone="primary"
          description="Paid-up capital & reserves"
        />
        <StatCard
          title="Operating Revenue"
          value={formatBDT(totalRevenue)}
          icon={FolderTree}
          tone="sky"
          description="YTD recognized billings"
        />
      </div>

      {/* Main DataTable */}
      <DataTable
        data={accounts}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search account by code, name, or category..."
        onRowClick={(a) => setSelectedAccount(a)}
        toolbar={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Chart of accounts exported to CSV')}
            className="h-9 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export COA
          </Button>
        }
        rowActions={(a) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="View account ledger"
              onClick={() => setSelectedAccount(a)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      {/* Account Details Dialog */}
      {selectedAccount && (
        <Dialog open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <DialogTitle className="text-lg font-bold">
                    {selectedAccount.code} — {selectedAccount.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Category: {selectedAccount.category}
                  </DialogDescription>
                </div>
                <Badge
                  variant="outline"
                  className={typeBadgeStyles[selectedAccount.type]}
                >
                  {selectedAccount.type}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="flex justify-between rounded-lg border p-3 bg-muted/20">
                <span className="text-muted-foreground">Current Balance</span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {formatBDT(selectedAccount.balance)}
                </span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-semibold">{selectedAccount.currency} (Bangladeshi Taka)</span>
              </div>
              <div className="flex justify-between border-b py-1.5">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold">{selectedAccount.status}</span>
              </div>
              {selectedAccount.description && (
                <div className="space-y-1 pt-1">
                  <span className="text-muted-foreground">Description</span>
                  <p className="rounded-lg border p-2.5 bg-muted/10 leading-relaxed">
                    {selectedAccount.description}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedAccount(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Account Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add General Ledger Account</DialogTitle>
            <DialogDescription>
              Create a new account code in the general chart of accounts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="accCode">Account Code *</Label>
                <Input
                  id="accCode"
                  placeholder="e.g. 5060"
                  value={newAccount.code}
                  onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="accType">Account Type *</Label>
                <Select
                  value={newAccount.type}
                  onValueChange={(val) =>
                    setNewAccount({ ...newAccount, type: val as AccountType })
                  }
                >
                  <SelectTrigger id="accType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="accName">Account Name *</Label>
              <Input
                id="accName"
                placeholder="e.g. Marketing & Advertising Expenses"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="accCategory">Category</Label>
                <Input
                  id="accCategory"
                  placeholder="e.g. Operating Expenses"
                  value={newAccount.category}
                  onChange={(e) => setNewAccount({ ...newAccount, category: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="accBalance">Opening Balance (BDT)</Label>
                <Input
                  id="accBalance"
                  type="number"
                  value={newAccount.balance}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, balance: Number(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="accDesc">Description</Label>
              <Input
                id="accDesc"
                placeholder="Brief purpose of this account"
                value={newAccount.description}
                onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="mr-1.5 h-4 w-4" />
                Create Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
