import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { employees, payrollBatches, payrollRecords } from '@/mocks/data'
import { mockPayrollPayments } from '@/mocks/payrollData'
import { randomId } from '@/lib/utils'
import type { Employee, PayrollBatch, PayrollRecord, PayrollStatus, PayslipPaymentItem } from '@/types'
import type { PayrollPaymentRecord } from '@/types/payroll'

export interface GeneratePayslipsInput {
  employeeIds: string[]
  month: string
}

export interface GeneratePayslipsResult {
  created: number
  batch: PayrollBatch | null
}

export interface RecordPayslipPaymentInput {
  recordId: string
  amount: number
  paymentDate: string
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Mobile Banking'
  paymentReference: string
  note?: string
}

interface PayrollStoreState {
  records: PayrollRecord[]
  batches: PayrollBatch[]
  payments: PayrollPaymentRecord[]
  generatePayslips: (input: GeneratePayslipsInput) => GeneratePayslipsResult
  markBatchPaid: (batchId: string) => void
  markRecordPaid: (recordId: string) => void
  recordPayslipPayment: (input: RecordPayslipPaymentInput) => PayrollPaymentRecord
  addPayment: (payment: PayrollPaymentRecord) => void
}

/** Short period label used to link generated payslips to their batch. */
function periodLabel(month: string) {
  const [name = 'Month', year = new Date().getFullYear()] = month.split(' ')
  return `${name.slice(0, 3)} ${year}`
}

/**
 * Builds a demo payslip from the sample employee and salary data. The same
 * rates as the seeded mock records are used so generated records are visually
 * consistent with the existing demonstration data.
 */
function buildDemoRecord(employee: Employee, month: string): PayrollRecord {
  const basic = Math.round(employee.salary / 12)
  const allowances = Math.round(basic * 0.28)
  const deductions = Math.round(basic * 0.16)
  const netPay = basic + allowances - deductions
  return {
    id: randomId('pay'),
    employeeId: employee.employeeId,
    employee: `${employee.firstName} ${employee.lastName}`,
    department: employee.department,
    month,
    basic,
    allowances,
    deductions,
    netPay,
    paidAmount: 0,
    remainingBalance: netPay,
    status: 'Processing',
    generated: true,
    paymentHistory: [],
  }
}

/**
 * Single frontend data source for payroll. Seeded from mock data once, then
 * persisted to localStorage so generated demo payslips and payment disbursements
 * survive refreshes and stay synchronized across the dashboard, batches, payslips,
 * and payroll payments pages.
 */
export const usePayrollStore = create<PayrollStoreState>()(
  persist(
    (set, get) => ({
      records: payrollRecords,
      batches: payrollBatches,
      payments: mockPayrollPayments,

      generatePayslips: ({ employeeIds, month }) => {
        const state = get()
        const uniqueIds = [...new Set(employeeIds)]
        const existing = new Set(
          state.records.filter((r) => r.month === month).map((r) => r.employeeId),
        )
        const newRecords = uniqueIds
          .filter((id) => !existing.has(id))
          .map((id) => employees.find((employee) => employee.employeeId === id))
          .filter((employee): employee is Employee => Boolean(employee))
          .map((employee) => buildDemoRecord(employee, month))

        if (newRecords.length === 0) return { created: 0, batch: null }

        const batch: PayrollBatch = {
          id: randomId('pb'),
          name: `${month} — Demo Payslips`,
          period: periodLabel(month),
          employees: newRecords.length,
          totalAmount: newRecords.reduce((sum, record) => sum + record.netPay, 0),
          status: 'Processing',
          processedOn: new Date().toISOString().slice(0, 10),
        }

        set({
          records: [...newRecords, ...state.records],
          batches: [batch, ...state.batches],
        })
        return { created: newRecords.length, batch }
      },

      markBatchPaid: (batchId) => {
        const targetBatch = get().batches.find((b) => b.id === batchId)
        set((state) => ({
          batches: state.batches.map((batch) =>
            batch.id === batchId ? { ...batch, status: 'Paid' as const } : batch,
          ),
          records: targetBatch
            ? state.records.map((r) =>
                r.month.includes(targetBatch.period.split(' ')[0]!) || targetBatch.name.includes(r.month)
                  ? { ...r, status: 'Paid' as const, paidAmount: r.netPay, remainingBalance: 0 }
                  : r
              )
            : state.records,
        }))
      },

      markRecordPaid: (recordId) => {
        const state = get()
        const target = state.records.find((r) => r.id === recordId)
        if (!target) return

        const currentPaid =
          target.paidAmount !== undefined
            ? target.paidAmount
            : target.status === 'Paid'
              ? target.netPay
              : 0
        const payAmount = Math.max(0, target.netPay - currentPaid) || target.netPay
        const paymentDate = new Date().toISOString().slice(0, 10)
        const paymentReference = `BEFTN-${Date.now().toString().slice(-6)}`

        const paymentRecord: PayrollPaymentRecord = {
          id: `pmt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          employeeId: target.employeeId,
          employee: target.employee,
          department: target.department,
          batchName: `${target.month} — Monthly`,
          payslipReference: `PS-${target.id.toUpperCase()}-PAY`,
          netSalary: target.netPay,
          paidAmount: payAmount,
          remainingBalance: 0,
          paymentDate,
          paymentMethod: 'Bank Transfer',
          paymentReference,
          status: 'Paid',
        }

        const paymentItem: PayslipPaymentItem = {
          id: paymentRecord.id,
          paymentDate,
          amount: payAmount,
          paymentMethod: 'Bank Transfer',
          paymentReference,
          status: 'Paid',
          note: 'Direct salary disbursement',
        }

        set({
          records: state.records.map((r) =>
            r.id === recordId
              ? {
                  ...r,
                  paidAmount: target.netPay,
                  remainingBalance: 0,
                  status: 'Paid' as const,
                  paymentHistory: [paymentItem, ...(r.paymentHistory || [])],
                }
              : r
          ),
          payments: [paymentRecord, ...state.payments],
        })
      },

      recordPayslipPayment: ({
        recordId,
        amount,
        paymentDate,
        paymentMethod,
        paymentReference,
        note,
      }) => {
        const state = get()
        const target = state.records.find((r) => r.id === recordId)
        if (!target) throw new Error(`Payslip record ${recordId} not found`)

        const currentPaid =
          target.paidAmount !== undefined
            ? target.paidAmount
            : target.status === 'Paid' || target.status === 'Completed'
              ? target.netPay
              : 0

        const newPaid = Math.min(target.netPay, currentPaid + amount)
        const remaining = Math.max(0, target.netPay - newPaid)
        const newStatus: PayrollStatus =
          remaining === 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : 'Unpaid'

        const ref = paymentReference.trim() || `TXN-${Date.now().toString().slice(-6)}`
        const date = paymentDate || new Date().toISOString().slice(0, 10)

        const paymentRecord: PayrollPaymentRecord = {
          id: `pmt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          employeeId: target.employeeId,
          employee: target.employee,
          department: target.department,
          batchName: `${target.month} — Monthly`,
          payslipReference: `PS-${target.id.toUpperCase()}-PAY`,
          netSalary: target.netPay,
          paidAmount: amount,
          remainingBalance: remaining,
          paymentDate: date,
          paymentMethod,
          paymentReference: ref,
          status: remaining === 0 ? 'Paid' : 'Partially Paid',
        }

        const paymentItem: PayslipPaymentItem = {
          id: paymentRecord.id,
          paymentDate: date,
          amount,
          paymentMethod,
          paymentReference: ref,
          status: remaining === 0 ? 'Paid' : 'Partially Paid',
          note,
        }

        const existingHistory = target.paymentHistory || []

        set({
          records: state.records.map((r) =>
            r.id === recordId
              ? {
                  ...r,
                  paidAmount: newPaid,
                  remainingBalance: remaining,
                  status: newStatus,
                  paymentHistory: [paymentItem, ...existingHistory],
                }
              : r
          ),
          payments: [paymentRecord, ...state.payments],
        })

        return paymentRecord
      },

      addPayment: (payment) => {
        set((state) => ({
          payments: [payment, ...state.payments],
        }))
      },
    }),
    {
      name: 'hrms-payroll-store',
      version: 1,
      partialize: (state) => ({
        records: state.records,
        batches: state.batches,
        payments: state.payments,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<PayrollStoreState> | undefined
        return {
          ...current,
          records:
            Array.isArray(saved?.records) && saved.records.length ? saved.records : current.records,
          batches:
            Array.isArray(saved?.batches) && saved.batches.length ? saved.batches : current.batches,
          payments:
            Array.isArray(saved?.payments) && saved.payments.length
              ? saved.payments
              : current.payments,
        }
      },
    },
  ),
)
