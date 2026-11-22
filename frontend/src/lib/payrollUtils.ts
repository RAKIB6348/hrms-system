import { formatCurrency } from '@/lib/utils'

export function formatBDT(amount: number): string {
  return formatCurrency(amount, 'BDT')
}
