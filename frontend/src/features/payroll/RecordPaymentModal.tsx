import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  CreditCard,
  Banknote,
  Smartphone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatBDT } from '@/lib/payrollUtils'
import { usePayrollStore } from '@/hooks/use-payroll-store'
import type { PayrollRecord } from '@/types'
import type { PayrollPaymentRecord } from '@/types/payroll'

interface RecordPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: PayrollRecord | null
  onPaymentSuccess?: (payment: PayrollPaymentRecord) => void
}

export function RecordPaymentModal({
  open,
  onOpenChange,
  record,
  onPaymentSuccess,
}: RecordPaymentModalProps) {
  const recordPayslipPayment = usePayrollStore((state) => state.recordPayslipPayment)

  // Current payment calculation numbers
  const currentPaid = record
    ? record.paidAmount !== undefined
      ? record.paidAmount
      : record.status === 'Paid' || record.status === 'Completed'
        ? record.netPay
        : 0
    : 0

  const remainingBalance = record ? Math.max(0, record.netPay - currentPaid) : 0
  const payslipRef = record ? `PS-${record.id.toUpperCase()}-PAY` : ''

  // Form states
  const [amount, setAmount] = useState<number>(0)
  const [paymentDate, setPaymentDate] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Cash' | 'Mobile Banking'>('Bank Transfer')
  const [paymentReference, setPaymentReference] = useState<string>('')
  const [note, setNote] = useState<string>('')

  // UI flow states
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when record changes or modal opens
  useEffect(() => {
    if (record && open) {
      const today = new Date().toISOString().slice(0, 10)
      const currentDue = Math.max(0, record.netPay - (record.paidAmount ?? (record.status === 'Paid' ? record.netPay : 0)))
      setAmount(currentDue)
      setPaymentDate(today)
      setPaymentMethod('Bank Transfer')
      setPaymentReference(`BEFTN-2026-${record.employeeId}`)
      setNote(`Disbursement for ${record.month}`)
      setStep('form')
      setErrors({})
      setIsSubmitting(false)
    }
  }, [record, open])

  // Method change helper: update placeholder / reference suggestion
  const handleMethodChange = (val: 'Bank Transfer' | 'Cash' | 'Mobile Banking') => {
    setPaymentMethod(val)
    if (!record) return

    if (val === 'Bank Transfer') {
      setPaymentReference(`BEFTN-2026-${record.employeeId}`)
    } else if (val === 'Mobile Banking') {
      setPaymentReference(`BKASH-${Date.now().toString().slice(-6)}`)
    } else {
      setPaymentReference(`CASH-VCHR-${Date.now().toString().slice(-4)}`)
    }
    // Clear reference error if any
    setErrors((prev) => ({ ...prev, reference: '' }))
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!amount || amount <= 0) {
      newErrors.amount = 'Payment amount must be greater than zero.'
    } else if (amount > remainingBalance) {
      newErrors.amount = `Payment amount cannot exceed the remaining balance (${formatBDT(remainingBalance)}).`
    }

    if (!paymentDate) {
      newErrors.date = 'Payment date is required.'
    }

    if ((paymentMethod === 'Bank Transfer' || paymentMethod === 'Mobile Banking') && !paymentReference.trim()) {
      newErrors.reference = `Payment reference is required for ${paymentMethod}.`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setStep('confirm')
    }
  }

  const handleConfirmDisbursement = () => {
    if (!record || isSubmitting) return

    setIsSubmitting(true)

    try {
      const paymentRecord = recordPayslipPayment({
        recordId: record.id,
        amount: Number(amount),
        paymentDate,
        paymentMethod,
        paymentReference: paymentReference.trim(),
        note: note.trim() || undefined,
      })

      const isFull = amount >= remainingBalance
      toast.success(
        `Disbursement of ${formatBDT(amount)} recorded for ${record.employee}`,
        {
          description: `Method: ${paymentMethod} · Ref: ${paymentReference} · New Status: ${isFull ? 'Paid' : 'Partially Paid'}`,
        }
      )

      onPaymentSuccess?.(paymentRecord)
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to record payment transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!record) return null

  const remainingAfterPayment = Math.max(0, remainingBalance - amount)
  const isFullSettlement = remainingAfterPayment === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {step === 'form' ? 'Disburse Employee Salary' : 'Confirm Salary Payment'}
              </DialogTitle>
              <DialogDescription>
                {step === 'form'
                  ? 'Record full or partial salary payment with verifiable transaction details.'
                  : 'Review the disbursement breakdown before recording this demo transaction.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Demo Notice Banner */}
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary dark:text-primary">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            <strong>Demo Transaction:</strong> This simulates instant salary disbursement in the PeopleFlow HRMS demo store. No actual bank transfer is executed.
          </span>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleReview} className="space-y-5 py-1">
            {/* Readonly Payslip Summary Grid */}
            <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Payslip & Beneficiary Details (Read-only)
                </span>
                <Badge variant="outline" className="font-mono text-[11px]">
                  {payslipRef}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">Employee Name</span>
                  <span className="font-semibold text-foreground text-sm block truncate">
                    {record.employee}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Employee ID</span>
                  <span className="font-mono font-medium text-foreground text-sm block">
                    {record.employeeId}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Payroll Month</span>
                  <span className="font-medium text-foreground text-sm block">
                    {record.month}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Department</span>
                  <span className="font-medium text-foreground text-sm block truncate">
                    {record.department}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t text-xs">
                <div>
                  <span className="text-muted-foreground block">Net Salary</span>
                  <span className="font-mono font-semibold text-foreground text-sm block">
                    {formatBDT(record.netPay)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Already Paid</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-sm block">
                    {formatBDT(currentPaid)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Remaining Balance</span>
                  <span className="font-mono font-bold text-primary text-sm block">
                    {formatBDT(remainingBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              {/* Payment Amount */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pay-amount" className="font-medium text-sm">
                    Disbursement Amount <span className="text-rose-500">*</span>
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-[11px]"
                      onClick={() => setAmount(remainingBalance)}
                    >
                      Full Balance ({formatBDT(remainingBalance)})
                    </Button>
                    {remainingBalance > 1000 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-[11px]"
                        onClick={() => setAmount(Math.round(remainingBalance / 2))}
                      >
                        50% Advance
                      </Button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">
                    ৳
                  </span>
                  <Input
                    id="pay-amount"
                    type="number"
                    min={1}
                    max={remainingBalance}
                    step="1"
                    value={amount || ''}
                    onChange={(e) => {
                      setAmount(Number(e.target.value))
                      if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }))
                    }}
                    placeholder="Enter amount to disburse"
                    className={`pl-8 font-mono text-base font-semibold ${
                      errors.amount ? 'border-rose-500 ring-rose-500' : ''
                    }`}
                  />
                </div>
                {errors.amount ? (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.amount}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Remaining after this payment:{' '}
                    <strong className="text-foreground font-mono">
                      {formatBDT(remainingAfterPayment)}
                    </strong>{' '}
                    ({isFullSettlement ? 'Fully Settled' : 'Partial Balance Pending'})
                  </p>
                )}
              </div>

              {/* Payment Date & Method Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pay-date" className="font-medium text-sm">
                    Payment Date <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="pay-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => {
                      setPaymentDate(e.target.value)
                      if (errors.date) setErrors((prev) => ({ ...prev, date: '' }))
                    }}
                    className={errors.date ? 'border-rose-500 ring-rose-500' : ''}
                  />
                  {errors.date && (
                    <p className="text-xs text-rose-500 font-medium">{errors.date}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pay-method" className="font-medium text-sm">
                    Payment Method <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(val: 'Bank Transfer' | 'Cash' | 'Mobile Banking') =>
                      handleMethodChange(val)
                    }
                  >
                    <SelectTrigger id="pay-method">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-emerald-600" />
                          <span>Bank Transfer (BEFTN / RTGS)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Mobile Banking">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-violet-600" />
                          <span>Mobile Banking (bKash / Nagad)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Cash">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-amber-600" />
                          <span>Cash Disbursement</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Payment Reference */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pay-ref" className="font-medium text-sm">
                    Payment Reference{' '}
                    {paymentMethod !== 'Cash' ? (
                      <span className="text-rose-500">*</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">(Optional)</span>
                    )}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                    onClick={() => handleMethodChange(paymentMethod)}
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Generate New Ref
                  </Button>
                </div>
                <Input
                  id="pay-ref"
                  value={paymentReference}
                  onChange={(e) => {
                    setPaymentReference(e.target.value)
                    if (errors.reference) setErrors((prev) => ({ ...prev, reference: '' }))
                  }}
                  placeholder="e.g. BEFTN-2026-9901 or BKASH-4412"
                  className={`font-mono text-sm ${
                    errors.reference ? 'border-rose-500 ring-rose-500' : ''
                  }`}
                />
                {errors.reference && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.reference}
                  </p>
                )}
              </div>

              {/* Payment Note */}
              <div className="space-y-1.5">
                <Label htmlFor="pay-note" className="font-medium text-sm">
                  Payment Note / Remarks <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Textarea
                  id="pay-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional reference, bank voucher details, or special instructions..."
                  className="text-xs resize-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Review & Proceed
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Step 2: Confirmation Screen */
          <div className="space-y-5 py-1">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="h-5 w-5" />
                <span>Confirm Salary Payment Details</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Please verify the transaction summary below before recording this disbursement.
              </p>

              <div className="divide-y text-xs">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Beneficiary</span>
                  <span className="font-semibold text-foreground">
                    {record.employee} ({record.employeeId})
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Pay Period</span>
                  <span className="font-medium text-foreground">{record.month}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Payment Amount</span>
                  <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {formatBDT(amount)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium text-foreground">{paymentMethod}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Transaction Reference</span>
                  <span className="font-mono font-semibold text-foreground">
                    {paymentReference}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Payment Date</span>
                  <span className="font-medium text-foreground">{paymentDate}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Resulting Payslip Status</span>
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold ${
                      isFullSettlement
                        ? 'bg-emerald-600 text-white border-0'
                        : 'bg-amber-600 text-white border-0'
                    }`}
                  >
                    {isFullSettlement ? 'Paid (Fully Settled)' : 'Partially Paid'}
                  </Badge>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Remaining Balance</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatBDT(remainingAfterPayment)}
                  </span>
                </div>
                {note && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Note</span>
                    <span className="text-foreground max-w-xs text-right truncate">{note}</span>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('form')}
                disabled={isSubmitting}
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDisbursement}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isSubmitting ? 'Recording Payment...' : 'Confirm & Record Payment'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
