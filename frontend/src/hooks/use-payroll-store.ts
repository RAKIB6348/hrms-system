import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { employees, payrollBatches, payrollRecords } from '@/mocks/data'
import { randomId } from '@/lib/utils'
import type { Employee, PayrollBatch, PayrollRecord } from '@/types'

export interface GeneratePayslipsInput {
  employeeIds: string[]
  month: string
}

export interface GeneratePayslipsResult {
  created: number
  batch: PayrollBatch | null
}

interface PayrollStoreState {
  records: PayrollRecord[]
  batches: PayrollBatch[]
  generatePayslips: (input: GeneratePayslipsInput) => GeneratePayslipsResult
  markBatchPaid: (batchId: string) => void
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
  return {
    id: randomId('pay'),
    employeeId: employee.employeeId,
    employee: `${employee.firstName} ${employee.lastName}`,
    department: employee.department,
    month,
    basic,
    allowances,
    deductions,
    netPay: basic + allowances - deductions,
    status: 'Processing',
    generated: true,
  }
}

/**
 * Single frontend data source for payroll. Seeded from mock data once, then
 * persisted to localStorage so generated demo payslips survive refreshes and
 * stay synchronized across the dashboard, batches, and payslip pages.
 */
export const usePayrollStore = create<PayrollStoreState>()(
  persist(
    (set, get) => ({
      records: payrollRecords,
      batches: payrollBatches,

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
        set((state) => ({
          batches: state.batches.map((batch) =>
            batch.id === batchId ? { ...batch, status: 'Paid' as const } : batch,
          ),
        }))
      },
    }),
    {
      name: 'hrms-payroll-store',
      version: 1,
      partialize: (state) => ({ records: state.records, batches: state.batches }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<PayrollStoreState> | undefined
        return {
          ...current,
          records: Array.isArray(saved?.records) && saved.records.length ? saved.records : current.records,
          batches: Array.isArray(saved?.batches) && saved.batches.length ? saved.batches : current.batches,
        }
      },
    },
  ),
)
