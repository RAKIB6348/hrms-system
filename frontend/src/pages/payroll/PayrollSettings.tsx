import { useState } from 'react'
import { toast } from 'sonner'
import {
  Save,
  Banknote,
  Calendar,
  Clock,
  ShieldCheck,
  Gift,
  CreditCard,
  Sliders,
  AlertTriangle,
  RotateCcw,
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
import { mockPayrollSettings } from '@/mocks/payrollData'

export default function PayrollSettings() {
  const [settings, setSettings] = useState(mockPayrollSettings)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Payroll configuration saved successfully (demo settings updated)')
  }

  const handleReset = () => {
    setSettings(mockPayrollSettings)
    toast.info('Settings restored to default corporate configuration')
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <PageHeader
        title="Payroll Settings"
        description="Configure enterprise payroll parameters, overtime multipliers, attendance deduction rules, and approval hierarchies."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Reset Defaults
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-1.5 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        }
      />

      <DemoNotice compact />

      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Default Currency"
          value={settings.defaultCurrency}
          icon={Banknote}
          tone="primary"
          description="Standard Bangladesh Taka"
        />
        <StatCard
          title="Pay Frequency"
          value={settings.payPeriod}
          icon={Calendar}
          tone="emerald"
          description={`Disbursement on day ${settings.payDay}th`}
        />
        <StatCard
          title="Overtime Multiplier"
          value={`${settings.overtimeRateMultiplier}x Base`}
          icon={Clock}
          tone="amber"
          description="Bangladesh labor law standard"
        />
        <StatCard
          title="Approval Workflow"
          value="Dual Role"
          icon={ShieldCheck}
          tone="violet"
          description={settings.approverRole}
        />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: General & Currency Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">General Payroll & Currency Configuration</CardTitle>
            </div>
            <CardDescription>
              Define the default currency, pay period schedules, and automatic batch generation policies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={settings.defaultCurrency}
                  onValueChange={(val) => setSettings({ ...settings, defaultCurrency: val })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BDT (৳)">BDT (৳) — Bangladeshi Taka</SelectItem>
                    <SelectItem value="USD ($)">USD ($) — US Dollar</SelectItem>
                    <SelectItem value="EUR (€)">EUR (€) — Euro</SelectItem>
                    <SelectItem value="GBP (£)">GBP (£) — British Pound</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Default currency used across all payslips and reporting.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payPeriod">Payroll Period</Label>
                <Select
                  value={settings.payPeriod}
                  onValueChange={(val) => setSettings({ ...settings, payPeriod: val })}
                >
                  <SelectTrigger id="payPeriod">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly (Calendar Month)">Monthly (Calendar Month)</SelectItem>
                    <SelectItem value="Bi-Weekly (Every 2 Weeks)">Bi-Weekly (Every 2 Weeks)</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Cycle period for regular monthly compensation calculation.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payDay">Monthly Pay Day</Label>
                <Input
                  id="payDay"
                  type="number"
                  min={1}
                  max={31}
                  value={settings.payDay}
                  onChange={(e) => setSettings({ ...settings, payDay: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Day of the calendar month salary batches are executed.</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">Automatic Batch Generation</Label>
                  <Badge variant="outline" className="text-xs">Automation</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically draft monthly payroll batch on the 25th of every month using active salary structures.
                </p>
              </div>
              <Switch
                checked={settings.autoGenerateBatch}
                onCheckedChange={(checked) => setSettings({ ...settings, autoGenerateBatch: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Salary Calculation Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Salary Calculation & Deduction Rules</CardTitle>
            </div>
            <CardDescription>
              Corporate breakdown rules according to Bangladesh Labor Law guidelines.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Standard Working Days / Month</Label>
                <Input defaultValue="30" type="number" />
                <p className="text-xs text-muted-foreground">Basis for per-day rate calculation.</p>
              </div>
              <div className="space-y-2">
                <Label>Daily Working Hours</Label>
                <Input defaultValue="8" type="number" />
                <p className="text-xs text-muted-foreground">Standard regular daily working schedule.</p>
              </div>
              <div className="space-y-2">
                <Label>Statutory Provident Fund Rate (%)</Label>
                <Input defaultValue="8.33" type="number" step="0.01" />
                <p className="text-xs text-muted-foreground">Employee deduction matched by corporate contribution.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-2">
              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="font-medium">Prorate Unpaid Leaves</Label>
                  <p className="text-xs text-muted-foreground">Deduct unapproved leave days from gross calculation automatically.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="font-medium">Automatic TDS Tax Withholding</Label>
                  <p className="text-xs text-muted-foreground">Compute monthly tax deductions based on NBR progressive income slabs.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Overtime Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Overtime Management Rules</CardTitle>
            </div>
            <CardDescription>
              Define multiplier rates for regular overtime hours, weekend duty, and public holiday shifts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="otRate">Regular Day OT Multiplier</Label>
                <Input
                  id="otRate"
                  type="number"
                  step="0.1"
                  value={settings.overtimeRateMultiplier}
                  onChange={(e) => setSettings({ ...settings, overtimeRateMultiplier: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Standard 1.5x of hourly basic rate.</p>
              </div>
              <div className="space-y-2">
                <Label>Weekend Shift OT Multiplier</Label>
                <Input defaultValue="2.0" type="number" step="0.1" />
                <p className="text-xs text-muted-foreground">Applied to Friday/Saturday approved overtime.</p>
              </div>
              <div className="space-y-2">
                <Label>Public Holiday Multiplier</Label>
                <Input defaultValue="2.5" type="number" step="0.1" />
                <p className="text-xs text-muted-foreground">Government holiday emergency attendance rate.</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="font-medium">Require Prior Department Head Pre-Approval</Label>
                <p className="text-xs text-muted-foreground">
                  Overtime entries exceeding 2 hours per day require supervisor authorization before inclusion in batch.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Late Deduction Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              <CardTitle className="text-lg">Late Attendance Deduction Rules</CardTitle>
            </div>
            <CardDescription>
              Configure grace periods and automated deduction penalties for late clock-ins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="graceMinutes">Daily Grace Period (Minutes)</Label>
                <Input
                  id="graceMinutes"
                  type="number"
                  value={settings.dailyLateGraceMinutes}
                  onChange={(e) => setSettings({ ...settings, dailyLateGraceMinutes: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Check-in within 15 mins of shift start incurs zero penalty.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="consecutiveDays">Consecutive Late Days Threshold</Label>
                <Input
                  id="consecutiveDays"
                  type="number"
                  value={settings.consecutiveLateDeductionDays}
                  onChange={(e) => setSettings({ ...settings, consecutiveLateDeductionDays: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  3 consecutive days late triggers 1 half-day basic deduction.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="font-medium">Allow Line Manager One-Click Penalty Waiver</Label>
                <p className="text-xs text-muted-foreground">
                  Permit HR or department heads to waive justifiable delays (traffic gridlock, client emergency).
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Bonus Policies & Payment Methods */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-lg">Bonus Policies</CardTitle>
              </div>
              <CardDescription>
                Tax withholding treatment for festival and performance disbursements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="font-medium">Tax Deductible Bonuses</Label>
                  <p className="text-xs text-muted-foreground">
                    Include festival bonuses in annual gross taxable income calculation.
                  </p>
                </div>
                <Switch
                  checked={settings.bonusTaxDeductible}
                  onCheckedChange={(checked) => setSettings({ ...settings, bonusTaxDeductible: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Eligible Minimum Service Period</Label>
                <Select defaultValue="6m">
                  <SelectTrigger>
                    <SelectValue placeholder="Service requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Minimum (Immediate)</SelectItem>
                    <SelectItem value="3m">3 Months Completed</SelectItem>
                    <SelectItem value="6m">6 Months Completed (Standard)</SelectItem>
                    <SelectItem value="1y">1 Year Completed</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Probationary tenure required for festival bonus allocation.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-lg">Disbursement Payment Methods</CardTitle>
              </div>
              <CardDescription>
                Active channels for salary payout transfers and payment confirmations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Default Payment Channel</Label>
                <Select
                  value={settings.defaultPaymentMethod}
                  onValueChange={(val) => setSettings({ ...settings, defaultPaymentMethod: val })}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payout method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer (BEFTN/RTGS)">Bank Transfer (BEFTN / RTGS / NPSB)</SelectItem>
                    <SelectItem value="Mobile Banking (bKash/Nagad)">Mobile Financial Services (bKash Corporate / Nagad)</SelectItem>
                    <SelectItem value="Corporate Cheque">Corporate Account Payee Cheque</SelectItem>
                    <SelectItem value="Cash Voucher">Cash Disbursement Voucher</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Preferred default transfer channel for bulk employee batches.</p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="font-medium">Generate BEFTN Batch Bank File</Label>
                  <p className="text-xs text-muted-foreground">
                    Produce standard bank-compliant CSV for direct upload to corporate portal.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 6: Approval Hierarchy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-violet-500" />
              <CardTitle className="text-lg">Payroll Approval & Governance</CardTitle>
            </div>
            <CardDescription>
              Assign signoff mandates and roles required before batches can transition to disbursed state.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="approverRole">Primary Approver Hierarchy</Label>
                <Input
                  id="approverRole"
                  value={settings.approverRole}
                  onChange={(e) => setSettings({ ...settings, approverRole: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Authorized roles eligible to execute final signoff.</p>
              </div>

              <div className="space-y-2">
                <Label>Audit Trail & Notification Email</Label>
                <Input defaultValue="payroll-audit@peopleflow.corp" type="email" />
                <p className="text-xs text-muted-foreground">Receives detailed compliance logs upon batch disbursement.</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="font-medium">Require Dual Sign-off (Two-Person Rule)</Label>
                <p className="text-xs text-muted-foreground">
                  Batches above ৳1,000,000 require independent approval from both HR Head and Chief Financial Officer.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Reset Defaults
          </Button>
          <Button type="submit">
            <Save className="mr-1.5 h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  )
}
