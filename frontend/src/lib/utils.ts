import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD') {
  const isBDT = currency.toUpperCase() === 'BDT'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    // Bangladesh Taka uses the ৳ symbol rather than the "BDT" code prefix.
    ...(isBDT ? { currencyDisplay: 'narrowSymbol' as const } : {}),
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

/**
 * Timezone-aware date formatting. When `timeZone` is omitted the previous
 * behaviour (the viewer's local timezone) is preserved.
 */
export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions, timeZone?: string) {
  const date = typeof value === 'string' ? new Date(value) : value
  const formatOptions: Intl.DateTimeFormatOptions = {
    ...(options ?? { month: 'short', day: 'numeric', year: 'numeric' }),
    ...(timeZone ? { timeZone } : {}),
  }
  return new Intl.DateTimeFormat('en-US', formatOptions).format(date)
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function randomId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
