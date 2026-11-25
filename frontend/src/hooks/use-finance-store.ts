import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loans as seedLoans, advances as seedAdvances } from '@/mocks/data'
import { randomId } from '@/lib/utils'
import type { Loan, Advance, LoanInstallment } from '@/types'

// Helper to generate full installment schedule for a loan
export function generateInstallmentSchedule(
  amount: number,
  totalInstallments: number,
  startDateStr: string,
  paidCount = 0
): LoanInstallment[] {
  const installments: LoanInstallment[] = []
  const baseAmount = totalInstallments > 0 ? Math.round(amount / totalInstallments) : amount

  const start = new Date(startDateStr || '2026-11-22')

  for (let i = 1; i <= totalInstallments; i++) {
    const dueDate = new Date(start)
    dueDate.setMonth(dueDate.getMonth() + i)
    const dueDateStr = dueDate.toISOString().slice(0, 10)
    const isPaid = i <= paidCount

    installments.push({
      id: `inst-${i}-${Date.now().toString().slice(-4)}`,
      number: i,
      dueDate: dueDateStr,
      amount: i === totalInstallments ? amount - baseAmount * (totalInstallments - 1) : baseAmount,
      status: isPaid ? 'Paid' : 'Pending',
      paidDate: isPaid ? dueDateStr : undefined,
      paymentMethod: isPaid ? 'Salary Deduction' : undefined,
      paymentReference: isPaid ? `EMI-AUTO-${1000 + i}` : undefined,
    })
  }

  return installments
}

// Enhance seed loans with installment data if missing
const enhancedSeedLoans: Loan[] = seedLoans.map((l) => {
  const totalInst = l.emi > 0 ? Math.round(l.amount / l.emi) : 12
  const paidAmt = Math.max(0, l.amount - l.outstanding)
  const paidInst = l.emi > 0 ? Math.min(totalInst, Math.round(paidAmt / l.emi)) : 0

  return {
    ...l,
    totalInstallments: totalInst,
    paidInstallments: paidInst,
    installments: generateInstallmentSchedule(l.amount, totalInst, l.startDate, paidInst),
  }
})

interface FinanceStoreState {
  loans: Loan[]
  advances: Advance[]
  addLoan: (loan: Loan) => void
  updateLoanStatus: (id: string, status: 'Active' | 'Completed' | 'Pending') => void
  recordLoanInstallment: (
    loanId: string,
    installmentAmount?: number,
    paymentReference?: string,
    paymentMethod?: string
  ) => void
  addAdvance: (advance: Advance) => void
  updateAdvanceStatus: (
    id: string,
    status: 'Pending' | 'Approved' | 'Rejected' | 'Recovered'
  ) => void
}

export const useFinanceStore = create<FinanceStoreState>()(
  persist(
    (set) => ({
      loans: enhancedSeedLoans,
      advances: seedAdvances,

      addLoan: (loan) =>
        set((state) => ({
          loans: [loan, ...state.loans],
        })),

      updateLoanStatus: (id, status) =>
        set((state) => ({
          loans: state.loans.map((loan) =>
            loan.id === id ? { ...loan, status } : loan
          ),
        })),

      recordLoanInstallment: (loanId, installmentAmount, paymentReference, paymentMethod) =>
        set((state) => ({
          loans: state.loans.map((loan) => {
            if (loan.id !== loanId) return loan

            const payAmt = installmentAmount || loan.emi
            const newOutstanding = Math.max(0, loan.outstanding - payAmt)
            const currentPaidInst = loan.paidInstallments || 0
            const newPaidInst = currentPaidInst + 1
            const totalInst = loan.totalInstallments || Math.round(loan.amount / loan.emi)
            const newStatus: Loan['status'] = newOutstanding === 0 ? 'Completed' : 'Active'

            const updatedInstallments = (loan.installments || []).map((inst) => {
              if (inst.number === newPaidInst) {
                return {
                  ...inst,
                  status: 'Paid' as const,
                  paidDate: new Date().toISOString().slice(0, 10),
                  paymentMethod: paymentMethod || 'Salary Deduction',
                  paymentReference: paymentReference || `EMI-PAY-${Date.now().toString().slice(-5)}`,
                }
              }
              return inst
            })

            return {
              ...loan,
              outstanding: newOutstanding,
              paidInstallments: newPaidInst,
              status: newStatus,
              installments: updatedInstallments,
            }
          }),
        })),

      addAdvance: (advance) =>
        set((state) => ({
          advances: [advance, ...state.advances],
        })),

      updateAdvanceStatus: (id, status) =>
        set((state) => ({
          advances: state.advances.map((advance) =>
            advance.id === id ? { ...advance, status } : advance
          ),
        })),
    }),
    {
      name: 'hrms-finance-store-v2',
      version: 2,
      partialize: (state) => ({
        loans: state.loans,
        advances: state.advances,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<FinanceStoreState> | undefined
        return {
          ...current,
          loans:
            Array.isArray(saved?.loans) && saved.loans.length
              ? saved.loans
              : current.loans,
          advances:
            Array.isArray(saved?.advances) && saved.advances.length
              ? saved.advances
              : current.advances,
        }
      },
    }
  )
)

export function newLoanId() {
  return randomId('ln')
}

export function newAdvanceId() {
  return randomId('adv')
}
