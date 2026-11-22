import { useState } from 'react'
import { toast } from 'sonner'
import {
  Settings,
  Save,
  Building2,
  Calendar,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Sliders,
  Layers,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { mockAccountingSettings } from '@/mocks/accountingData'

export default function AccountingSettings() {
  const [settings, setSettings] = useState(mockAccountingSettings)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Accounting configuration updated successfully (demo)')
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <PageHeader
        title="Accounting Settings"
        description="Corporate financial preferences, fiscal year schedule, statutory tax rules, and currency configurations."
        actions={
          <Button onClick={handleSave}>
            <Save className="mr-1.5 h-4 w-4" />
            Save Preferences
          </Button>
        }
      />

      <DemoNotice compact />

      {/* Top 4 Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Default Currency"
          value={settings.currency}
          icon={DollarSign}
          tone="primary"
          description="Bangladeshi Taka standard"
        />
        <StatCard
          title="Fiscal Year Cycle"
          value="July – June"
          icon={Calendar}
          tone="emerald"
          description="Bangladesh standard tax year"
        />
        <StatCard
          title="Accounting Basis"
          value={settings.accountingMethod}
          icon={Layers}
          tone="violet"
          description="Matching revenues and expenses"
        />
        <StatCard
          title="Payroll Sandbox Mode"
          value="Staging Only"
          icon={ShieldCheck}
          tone="sky"
          description="Simulated journal vouchers"
        />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company & Legal Entity Info */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Corporate Entity & Registration
            </CardTitle>
            <CardDescription className="text-xs">
              Entity information printed on statutory financial vouchers and statements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Legal Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="legalEntity">Business Identification Number (BIN / TIN)</Label>
                <Input
                  id="legalEntity"
                  value={settings.legalEntityNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, legalEntityNumber: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency & Financial Calendar */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Fiscal Year & Currency Standard
            </CardTitle>
            <CardDescription className="text-xs">
              Core reporting currency and annual financial closing dates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={settings.currencyCode}
                  onValueChange={(val) => setSettings({ ...settings, currencyCode: val })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BDT">BDT — Bangladeshi Taka (৳)</SelectItem>
                    <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                    <SelectItem value="GBP">GBP — British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fiscalStart">Fiscal Year Start</Label>
                <Input
                  id="fiscalStart"
                  value={settings.fiscalYearStart}
                  onChange={(e) => setSettings({ ...settings, fiscalYearStart: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fiscalEnd">Fiscal Year End</Label>
                <Input
                  id="fiscalEnd"
                  value={settings.fiscalYearEnd}
                  onChange={(e) => setSettings({ ...settings, fiscalYearEnd: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="accMethod">Accounting Basis</Label>
                <Select
                  value={settings.accountingMethod}
                  onValueChange={(val) => setSettings({ ...settings, accountingMethod: val })}
                >
                  <SelectTrigger id="accMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Accrual Basis">Accrual Basis (Recognize when earned/incurred)</SelectItem>
                    <SelectItem value="Cash Basis">Cash Basis (Recognize when cash transfers)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="defaultBank">Default Operating Account</Label>
                <Select
                  value={settings.defaultBankAccountId}
                  onValueChange={(val) =>
                    setSettings({ ...settings, defaultBankAccountId: val })
                  }
                >
                  <SelectTrigger id="defaultBank">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank-1">The City Bank Ltd (Main Operating)</SelectItem>
                    <SelectItem value="bank-2">BRAC Bank PLC (Payroll Settlement)</SelectItem>
                    <SelectItem value="bank-3">Dutch-Bangla Bank PLC (Tax Reserve)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statutory Taxes & Withholding Rates */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              Statutory Withholding & Benefit Deductions
            </CardTitle>
            <CardDescription className="text-xs">
              Configured default deduction schedules for payroll and vendor billing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tdsRate">Default Tax Deducted at Source (TDS)</Label>
                <Input
                  id="tdsRate"
                  value={settings.taxWithholdingTDSDefault}
                  onChange={(e) =>
                    setSettings({ ...settings, taxWithholdingTDSDefault: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pfRate">Provident Fund (PF) Employee Contribution</Label>
                <Input
                  id="pfRate"
                  value={settings.providentFundRate}
                  onChange={(e) =>
                    setSettings({ ...settings, providentFundRate: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Controls */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Payroll Integration Sandbox Safeguards
            </CardTitle>
            <CardDescription className="text-xs">
              Ensures demo data does not accidentally post to active financial records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border p-4 bg-muted/10">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  Staging Sandbox Mode (Safe Simulation)
                </p>
                <p className="text-xs text-muted-foreground">
                  Keeps confirmed payroll batches in staging without creating finalized financial entries.
                </p>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                Active & Enforced
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg">
            <Save className="mr-1.5 h-4 w-4" />
            Save Accounting Settings
          </Button>
        </div>
      </form>
    </div>
  )
}
