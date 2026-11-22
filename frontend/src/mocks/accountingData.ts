import type {
  Account,
  JournalEntry,
  LedgerTransaction,
  TrialBalanceItem,
  BankAccount,
  BankTransaction,
  ExpenseClaim,
  PayrollAccountingRecord,
  PaymentTransaction,
} from '@/types/accounting'

export const mockAccounts: Account[] = [
  // Assets (1000s)
  { id: 'acc-1', code: '1010', name: 'Cash at Bank - City Bank Ltd', type: 'Asset', category: 'Current Assets', balance: 4850000, currency: 'BDT', status: 'Active', description: 'Main operational disbursement account' },
  { id: 'acc-2', code: '1020', name: 'Cash at Bank - BRAC Bank PLC', type: 'Asset', category: 'Current Assets', balance: 3200000, currency: 'BDT', status: 'Active', description: 'Payroll settlement account' },
  { id: 'acc-3', code: '1030', name: 'Petty Cash - Dhaka HQ', type: 'Asset', category: 'Current Assets', balance: 120000, currency: 'BDT', status: 'Active', description: 'Office operational expenses cash' },
  { id: 'acc-4', code: '1040', name: 'Accounts Receivable', type: 'Asset', category: 'Current Assets', balance: 1850000, currency: 'BDT', status: 'Active', description: 'Pending invoices from clients' },
  { id: 'acc-5', code: '1510', name: 'Office Equipment & Laptops', type: 'Asset', category: 'Non-Current Assets', balance: 2400000, currency: 'BDT', status: 'Active', description: 'Hardware assets at cost' },
  { id: 'acc-6', code: '1520', name: 'Accumulated Depreciation - Equipment', type: 'Asset', category: 'Non-Current Assets', balance: -450000, currency: 'BDT', status: 'Active', description: 'Depreciation contra account' },

  // Liabilities (2000s)
  { id: 'acc-7', code: '2010', name: 'Accounts Payable - Vendors', type: 'Liability', category: 'Current Liabilities', balance: 940000, currency: 'BDT', status: 'Active', description: 'Vendor invoices due within 30 days' },
  { id: 'acc-8', code: '2020', name: 'Salaries & Wages Payable', type: 'Liability', category: 'Current Liabilities', balance: 2850000, currency: 'BDT', status: 'Active', description: 'Accrued employee monthly salary liability' },
  { id: 'acc-9', code: '2030', name: 'Tax Deducted at Source (TDS) Payable', type: 'Liability', category: 'Current Liabilities', balance: 380000, currency: 'BDT', status: 'Active', description: 'Income tax deducted for NBR deposit' },
  { id: 'acc-10', code: '2040', name: 'Provident Fund (PF) Contribution Payable', type: 'Liability', category: 'Current Liabilities', balance: 220000, currency: 'BDT', status: 'Active', description: 'Employee and employer PF pool' },

  // Equity (3000s)
  { id: 'acc-11', code: '3010', name: 'Paid-up Share Capital', type: 'Equity', category: 'Equity', balance: 5000000, currency: 'BDT', status: 'Active', description: 'Initial paid-up equity' },
  { id: 'acc-12', code: '3020', name: 'Retained Earnings', type: 'Equity', category: 'Equity', balance: 1780000, currency: 'BDT', status: 'Active', description: 'Accumulated earnings retained' },

  // Revenue (4000s)
  { id: 'acc-13', code: '4010', name: 'Software Services Revenue', type: 'Revenue', category: 'Operating Revenue', balance: 6850000, currency: 'BDT', status: 'Active', description: 'Subscription and enterprise service fees' },
  { id: 'acc-14', code: '4020', name: 'Consulting & Implementation Revenue', type: 'Revenue', category: 'Operating Revenue', balance: 1250000, currency: 'BDT', status: 'Active', description: 'Implementation and onboarding services' },

  // Expenses (5000s)
  { id: 'acc-15', code: '5010', name: 'Salaries & Allowances Expense', type: 'Expense', category: 'Operating Expenses', balance: 3450000, currency: 'BDT', status: 'Active', description: 'Direct staff payroll expenses' },
  { id: 'acc-16', code: '5020', name: 'Office Rent & Facilities', type: 'Expense', category: 'Operating Expenses', balance: 650000, currency: 'BDT', status: 'Active', description: 'Gulshan Dhaka office lease' },
  { id: 'acc-17', code: '5030', name: 'Cloud Infrastructure & Software Licences', type: 'Expense', category: 'Operating Expenses', balance: 420000, currency: 'BDT', status: 'Active', description: 'AWS, Google Cloud, Figma, GitHub' },
  { id: 'acc-18', code: '5040', name: 'Utilities & Internet Service', type: 'Expense', category: 'Operating Expenses', balance: 95000, currency: 'BDT', status: 'Active', description: 'Electricity, fiber internet, facilities' },
  { id: 'acc-19', code: '5050', name: 'Travel & Conveyance Reimbursement', type: 'Expense', category: 'Operating Expenses', balance: 135000, currency: 'BDT', status: 'Active', description: 'Employee local travel and client visits' },
]

export const mockJournalEntries: JournalEntry[] = [
  {
    id: 'je-1',
    entryNumber: 'JE-2026-001',
    date: '2026-11-20',
    reference: 'PAY-BATCH-2026-11',
    narration: 'Payroll accrual entry for November 2026 (Demo)',
    status: 'Posted',
    totalDebit: 3450000,
    totalCredit: 3450000,
    createdBy: 'Meera Nair (Finance Admin)',
    lines: [
      { id: 'jl-1', accountCode: '5010', accountName: 'Salaries & Allowances Expense', debit: 3450000, credit: 0, description: 'November gross payroll expense' },
      { id: 'jl-2', accountCode: '2020', accountName: 'Salaries & Wages Payable', debit: 0, credit: 2850000, description: 'Net salary payable to staff' },
      { id: 'jl-3', accountCode: '2030', accountName: 'Tax Deducted at Source (TDS) Payable', debit: 0, credit: 380000, description: 'Withheld employee income tax' },
      { id: 'jl-4', accountCode: '2040', accountName: 'Provident Fund (PF) Contribution Payable', debit: 0, credit: 220000, description: 'Employee PF deduction' },
    ],
  },
  {
    id: 'je-2',
    entryNumber: 'JE-2026-002',
    date: '2026-11-18',
    reference: 'INV-2026-884',
    narration: 'Office Rent payment for Gulshan office - November',
    status: 'Posted',
    totalDebit: 650000,
    totalCredit: 650000,
    createdBy: 'Tanvir Hossain',
    lines: [
      { id: 'jl-5', accountCode: '5020', accountName: 'Office Rent & Facilities', debit: 650000, credit: 0, description: 'Monthly lease rental' },
      { id: 'jl-6', accountCode: '1010', accountName: 'Cash at Bank - City Bank Ltd', debit: 0, credit: 650000, description: 'Bank transfer payment' },
    ],
  },
  {
    id: 'je-3',
    entryNumber: 'JE-2026-003',
    date: '2026-11-15',
    reference: 'AWS-INV-9921',
    narration: 'AWS Cloud Hosting and Infrastructure settlement',
    status: 'Posted',
    totalDebit: 420000,
    totalCredit: 420000,
    createdBy: 'Tanvir Hossain',
    lines: [
      { id: 'jl-7', accountCode: '5030', accountName: 'Cloud Infrastructure & Software Licences', debit: 420000, credit: 0, description: 'AWS invoice Nov' },
      { id: 'jl-8', accountCode: '1020', accountName: 'Cash at Bank - BRAC Bank PLC', debit: 0, credit: 420000, description: 'Debit card settlement' },
    ],
  },
  {
    id: 'je-4',
    entryNumber: 'JE-2026-004',
    date: '2026-11-22',
    reference: 'EXP-CLAIM-042',
    narration: 'Staff travel reimbursement batch (Gulshan & Banani clients)',
    status: 'Draft',
    totalDebit: 45000,
    totalCredit: 45000,
    createdBy: 'Meera Nair',
    lines: [
      { id: 'jl-9', accountCode: '5050', accountName: 'Travel & Conveyance Reimbursement', debit: 45000, credit: 0, description: 'Reimbursement batch #42' },
      { id: 'jl-10', accountCode: '1030', accountName: 'Petty Cash - Dhaka HQ', debit: 0, credit: 45000, description: 'Disbursed via cash' },
    ],
  },
]

export const mockLedgerTransactions: LedgerTransaction[] = [
  { id: 'lt-1', date: '2026-11-01', accountCode: '1010', accountName: 'Cash at Bank - City Bank Ltd', entryNumber: 'OP-BAL', reference: 'Opening', description: 'Opening Balance for Month', debit: 5500000, credit: 0, balance: 5500000 },
  { id: 'lt-2', date: '2026-11-18', accountCode: '1010', accountName: 'Cash at Bank - City Bank Ltd', entryNumber: 'JE-2026-002', reference: 'INV-2026-884', description: 'Office Rent payment for Gulshan office', debit: 0, credit: 650000, balance: 4850000 },
  { id: 'lt-3', date: '2026-11-01', accountCode: '5010', accountName: 'Salaries & Allowances Expense', entryNumber: 'OP-BAL', reference: 'Opening', description: 'Opening Balance', debit: 0, credit: 0, balance: 0 },
  { id: 'lt-4', date: '2026-11-20', accountCode: '5010', accountName: 'Salaries & Allowances Expense', entryNumber: 'JE-2026-001', reference: 'PAY-BATCH-2026-11', description: 'Payroll accrual entry for November 2026', debit: 3450000, credit: 0, balance: 3450000 },
  { id: 'lt-5', date: '2026-11-20', accountCode: '2020', accountName: 'Salaries & Wages Payable', entryNumber: 'JE-2026-001', reference: 'PAY-BATCH-2026-11', description: 'Net salary payable to staff', debit: 0, credit: 2850000, balance: 2850000 },
  { id: 'lt-6', date: '2026-11-20', accountCode: '2030', accountName: 'Tax Deducted at Source (TDS) Payable', entryNumber: 'JE-2026-001', reference: 'PAY-BATCH-2026-11', description: 'Withheld employee income tax', debit: 0, credit: 380000, balance: 380000 },
  { id: 'lt-7', date: '2026-11-15', accountCode: '5030', accountName: 'Cloud Infrastructure & Software Licences', entryNumber: 'JE-2026-003', reference: 'AWS-INV-9921', description: 'AWS Cloud Hosting and Infrastructure', debit: 420000, credit: 0, balance: 420000 },
]

export const mockTrialBalance: TrialBalanceItem[] = [
  { accountCode: '1010', accountName: 'Cash at Bank - City Bank Ltd', type: 'Asset', debit: 4850000, credit: 0 },
  { accountCode: '1020', accountName: 'Cash at Bank - BRAC Bank PLC', type: 'Asset', debit: 3200000, credit: 0 },
  { accountCode: '1030', accountName: 'Petty Cash - Dhaka HQ', type: 'Asset', debit: 120000, credit: 0 },
  { accountCode: '1040', accountName: 'Accounts Receivable', type: 'Asset', debit: 1850000, credit: 0 },
  { accountCode: '1510', accountName: 'Office Equipment & Laptops', type: 'Asset', debit: 2400000, credit: 0 },
  { accountCode: '1520', accountName: 'Accumulated Depreciation - Equipment', type: 'Asset', debit: 0, credit: 450000 },
  { accountCode: '2010', accountName: 'Accounts Payable - Vendors', type: 'Liability', debit: 0, credit: 940000 },
  { accountCode: '2020', accountName: 'Salaries & Wages Payable', type: 'Liability', debit: 0, credit: 2850000 },
  { accountCode: '2030', accountName: 'Tax Deducted at Source (TDS) Payable', type: 'Liability', debit: 0, credit: 380000 },
  { accountCode: '2040', accountName: 'Provident Fund (PF) Payable', type: 'Liability', debit: 0, credit: 220000 },
  { accountCode: '3010', accountName: 'Paid-up Share Capital', type: 'Equity', debit: 0, credit: 5000000 },
  { accountCode: '3020', accountName: 'Retained Earnings', type: 'Equity', debit: 0, credit: 1780000 },
  { accountCode: '4010', accountName: 'Software Services Revenue', type: 'Revenue', debit: 0, credit: 6850000 },
  { accountCode: '4020', accountName: 'Consulting & Implementation Revenue', type: 'Revenue', debit: 0, credit: 1250000 },
  { accountCode: '5010', accountName: 'Salaries & Allowances Expense', type: 'Expense', debit: 3450000, credit: 0 },
  { accountCode: '5020', accountName: 'Office Rent & Facilities', type: 'Expense', debit: 650000, credit: 0 },
  { accountCode: '5030', accountName: 'Cloud Infrastructure & Software Licences', type: 'Expense', debit: 420000, credit: 0 },
  { accountCode: '5040', accountName: 'Utilities & Internet Service', type: 'Expense', debit: 95000, credit: 0 },
  { accountCode: '5050', accountName: 'Travel & Conveyance Reimbursement', type: 'Expense', debit: 135000, credit: 0 },
]

export const mockBankAccounts: BankAccount[] = [
  { id: 'bank-1', accountName: 'Main Corporate Current', bankName: 'The City Bank Ltd', accountNumber: '1102-9984-2101', branch: 'Gulshan Branch, Dhaka', type: 'Current', balance: 4850000, currency: 'BDT', status: 'Active' },
  { id: 'bank-2', accountName: 'Payroll Settlement Account', bankName: 'BRAC Bank PLC', accountNumber: '1501-4432-8876', branch: 'Banani Branch, Dhaka', type: 'Current', balance: 3200000, currency: 'BDT', status: 'Active' },
  { id: 'bank-3', accountName: 'Tax & Statutory Deposit', bankName: 'Dutch-Bangla Bank PLC', accountNumber: '1051-2299-1044', branch: 'Motijheel Branch, Dhaka', type: 'Savings', balance: 950000, currency: 'BDT', status: 'Active' },
  { id: 'bank-4', accountName: 'Dhaka HQ Petty Cash Vault', bankName: 'Cash on Hand (Vault)', accountNumber: 'PC-DHAKA-01', branch: 'Headquarters', type: 'Petty Cash', balance: 120000, currency: 'BDT', status: 'Active' },
]

export const mockBankTransactions: BankTransaction[] = [
  { id: 'bt-1', date: '2026-11-21', bankAccountId: 'bank-1', bankAccountName: 'The City Bank Ltd', type: 'Deposit', amount: 1250000, reference: 'CL-TXN-9021', description: 'Enterprise client invoice payment', status: 'Cleared' },
  { id: 'bt-2', date: '2026-11-18', bankAccountId: 'bank-1', bankAccountName: 'The City Bank Ltd', type: 'Withdrawal', amount: 650000, reference: 'RENT-NOV-26', description: 'Gulshan office rental payment', status: 'Reconciled' },
  { id: 'bt-3', date: '2026-11-15', bankAccountId: 'bank-2', bankAccountName: 'BRAC Bank PLC', type: 'Withdrawal', amount: 420000, reference: 'AWS-DEBIT-01', description: 'Cloud infrastructure automated debit', status: 'Cleared' },
  { id: 'bt-4', date: '2026-11-10', bankAccountId: 'bank-1', bankAccountName: 'The City Bank Ltd', type: 'Transfer', amount: 1000000, reference: 'TRF-BRAC-02', description: 'Inter-bank fund transfer to Payroll account', status: 'Reconciled' },
  { id: 'bt-5', date: '2026-11-05', bankAccountId: 'bank-4', bankAccountName: 'Cash on Hand (Vault)', type: 'Withdrawal', amount: 45000, reference: 'PC-VOUCHER-11', description: 'Petty cash office replenishment', status: 'Cleared' },
]

export const mockExpenses: ExpenseClaim[] = [
  { id: 'exp-1', expenseNumber: 'EXP-2026-081', employeeName: 'Aarav Sharma', department: 'Engineering', category: 'Software Subscriptions', amount: 35000, date: '2026-11-19', status: 'Approved', description: 'JetBrains IDE and Docker annual team seats', receiptAttached: true },
  { id: 'exp-2', expenseNumber: 'EXP-2026-082', employeeName: 'Diya Patel', department: 'Human Resources', category: 'Recruitment & Job Portals', amount: 28000, date: '2026-11-18', status: 'Approved', description: 'Bdjobs and LinkedIn recruiter posting pack', receiptAttached: true },
  { id: 'exp-3', expenseNumber: 'EXP-2026-083', employeeName: 'Vihaan Mehta', department: 'Sales', category: 'Client Entertainment & Meals', amount: 18500, date: '2026-11-17', status: 'Pending', description: 'Client meeting dinner with Apex Pharma tech team', receiptAttached: true },
  { id: 'exp-4', expenseNumber: 'EXP-2026-084', employeeName: 'Rohan Gupta', department: 'Design', category: 'Hardware & Accessories', amount: 42000, date: '2026-11-15', status: 'Paid', description: '4K monitor and ergonomic setup for design lab', receiptAttached: true },
  { id: 'exp-5', expenseNumber: 'EXP-2026-085', employeeName: 'Meera Nair', department: 'Operations', category: 'Office Supplies', amount: 12400, date: '2026-11-12', status: 'Paid', description: 'Stationery and printer cartridges replenishment', receiptAttached: true },
]

export const mockPayrollAccountingRecords: PayrollAccountingRecord[] = [
  {
    id: 'par-1',
    payrollBatchId: 'pb-1',
    period: 'Nov 2026',
    totalGross: 3450000,
    netPayable: 2850000,
    taxDeductions: 380000,
    providentFund: 220000,
    otherDeductions: 0,
    status: 'Ready for Mapping',
    payrollReference: 'PAY-BATCH-2026-11',
    mappedDebitAccount: '5010 (Salaries & Allowances Expense)',
    mappedCreditAccount: '2020 (Salaries & Wages Payable)',
    dateProcessed: '2026-11-20',
  },
  {
    id: 'par-2',
    payrollBatchId: 'pb-2',
    period: 'Oct 2026',
    totalGross: 3380000,
    netPayable: 2790000,
    taxDeductions: 375000,
    providentFund: 215000,
    otherDeductions: 0,
    status: 'Simulated',
    payrollReference: 'PAY-BATCH-2026-10',
    mappedDebitAccount: '5010 (Salaries & Allowances Expense)',
    mappedCreditAccount: '2020 (Salaries & Wages Payable)',
    dateProcessed: '2026-10-25',
  },
  {
    id: 'par-3',
    payrollBatchId: 'pb-3',
    period: 'Sep 2026',
    totalGross: 3310000,
    netPayable: 2735000,
    taxDeductions: 365000,
    providentFund: 210000,
    otherDeductions: 0,
    status: 'Simulated',
    payrollReference: 'PAY-BATCH-2026-09',
    mappedDebitAccount: '5010 (Salaries & Allowances Expense)',
    mappedCreditAccount: '2020 (Salaries & Wages Payable)',
    dateProcessed: '2026-09-25',
  },
]

export const mockPaymentTransactions: PaymentTransaction[] = [
  { id: 'pt-1', transactionId: 'TXN-BDT-2026-001', date: '2026-11-20', payee: 'Dhaka Electric Supply Co. (DESCO)', category: 'Utilities', paymentMethod: 'Bank Transfer', amount: 58000, status: 'Completed', reference: 'BILL-DESCO-11' },
  { id: 'pt-2', transactionId: 'TXN-BDT-2026-002', date: '2026-11-18', payee: 'Navana Real Estate (Lease)', category: 'Rent', paymentMethod: 'Bank Transfer', amount: 650000, status: 'Completed', reference: 'RENT-NOV-26' },
  { id: 'pt-3', transactionId: 'TXN-BDT-2026-003', date: '2026-11-15', payee: 'Link3 Technologies Ltd', category: 'Internet', paymentMethod: 'Corporate Card', amount: 37000, status: 'Completed', reference: 'FIBER-INV-441' },
  { id: 'pt-4', transactionId: 'TXN-BDT-2026-004', date: '2026-11-14', payee: 'National Board of Revenue (NBR)', category: 'Taxes', paymentMethod: 'Cheque', amount: 380000, status: 'Pending', reference: 'TDS-CHQ-99120' },
  { id: 'pt-5', transactionId: 'TXN-BDT-2026-005', date: '2026-11-10', payee: 'Ryans Computers Ltd', category: 'Hardware', paymentMethod: 'Bank Transfer', amount: 185000, status: 'Completed', reference: 'PO-HW-883' },
]

export const mockAccountingSettings = {
  companyName: 'PeopleFlow Bangladesh Ltd',
  legalEntityNumber: 'BIN-002998412-0101',
  currency: 'BDT (৳)',
  currencyCode: 'BDT',
  fiscalYearStart: 'July 01',
  fiscalYearEnd: 'June 30',
  accountingMethod: 'Accrual Basis',
  defaultBankAccountId: 'bank-1',
  autoPostingEnabled: false,
  payrollIntegrationMode: 'Draft Journal Staging (Simulated)',
  taxWithholdingTDSDefault: '10%',
  providentFundRate: '8.33%',
}
