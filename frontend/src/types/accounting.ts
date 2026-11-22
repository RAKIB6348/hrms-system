export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'

export interface Account {
  id: string
  code: string
  name: string
  type: AccountType
  category: string
  balance: number
  currency: string
  status: 'Active' | 'Inactive'
  description?: string
}

export interface JournalLine {
  id: string
  accountCode: string
  accountName: string
  debit: number
  credit: number
  description?: string
}

export interface JournalEntry {
  id: string
  entryNumber: string
  date: string
  reference: string
  narration: string
  status: 'Draft' | 'Posted' | 'Pending Approval'
  totalDebit: number
  totalCredit: number
  lines: JournalLine[]
  createdBy: string
}

export interface LedgerTransaction {
  id: string
  date: string
  accountCode: string
  accountName: string
  entryNumber: string
  reference: string
  description: string
  debit: number
  credit: number
  balance: number
}

export interface TrialBalanceItem {
  accountCode: string
  accountName: string
  type: AccountType
  debit: number
  credit: number
}

export interface BankAccount {
  id: string
  accountName: string
  bankName: string
  accountNumber: string
  branch: string
  type: 'Current' | 'Savings' | 'Petty Cash'
  balance: number
  currency: string
  status: 'Active' | 'Inactive'
}

export interface BankTransaction {
  id: string
  date: string
  bankAccountId: string
  bankAccountName: string
  type: 'Deposit' | 'Withdrawal' | 'Transfer'
  amount: number
  reference: string
  description: string
  status: 'Cleared' | 'Pending' | 'Reconciled'
}

export interface ExpenseClaim {
  id: string
  expenseNumber: string
  employeeName: string
  department: string
  category: string
  amount: number
  date: string
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected'
  description: string
  receiptAttached: boolean
}

export interface PayrollAccountingRecord {
  id: string
  payrollBatchId: string
  period: string
  totalGross: number
  netPayable: number
  taxDeductions: number
  providentFund: number
  otherDeductions: number
  status: 'Simulated' | 'Draft' | 'Ready for Mapping' | 'Posted'
  payrollReference: string
  mappedDebitAccount: string
  mappedCreditAccount: string
  dateProcessed: string
}

export interface PaymentTransaction {
  id: string
  transactionId: string
  date: string
  payee: string
  category: string
  paymentMethod: 'Bank Transfer' | 'Cheque' | 'Cash' | 'Corporate Card'
  amount: number
  status: 'Completed' | 'Pending' | 'Failed'
  reference: string
}

export interface FinancialStatementItem {
  category: string
  currentPeriod: number
  previousPeriod: number
  variance: number
}
