import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { formatCurrency, formatDate } from '@/lib/utils'

export interface CompanySettings {
  name: string
  legalName: string
  email: string
  phone: string
  website: string
  address: string
  timezone: string
  currency: string
  fiscalYear: string
}

/** Defaults used only when no saved company preferences exist. */
export const companySettingsDefaults: CompanySettings = {
  name: 'PeopleFlow Technologies',
  legalName: 'PeopleFlow Technologies Inc.',
  email: 'hello@peopleflow.io',
  phone: '+1 (555) 100-2000',
  website: 'https://peopleflow.io',
  address: '100 Market Street, New York, NY 10001',
  timezone: 'Asia/Dhaka',
  currency: 'BDT',
  fiscalYear: 'Calendar Year',
}

export const CURRENCY_OPTIONS = [
  { value: 'BDT', label: 'BDT — Bangladeshi Taka (৳)' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'INR', label: 'INR' },
  { value: 'SGD', label: 'SGD' },
]

export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Dhaka', label: 'Asia/Dhaka (UTC+06:00)' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore' },
]

interface CompanySettingsState {
  settings: CompanySettings
  save: (settings: CompanySettings) => void
}

/**
 * Frontend-only persistence for company preferences. Rehydration merges saved
 * values over the defaults, so an existing user's saved currency/timezone (and
 * every other field) is never overwritten. Writes happen only on explicit save.
 */
export const useCompanyStore = create<CompanySettingsState>()(
  persist(
    (set) => ({
      settings: companySettingsDefaults,
      save: (settings) => set({ settings }),
    }),
    {
      name: 'hrms-company-settings',
      version: 1,
      partialize: (state) => ({ settings: state.settings }),
      merge: (persisted, current) => {
        const saved = (persisted as Partial<CompanySettingsState> | undefined)?.settings
        return {
          ...current,
          settings: { ...companySettingsDefaults, ...(saved ?? {}) },
        }
      },
    },
  ),
)

/** Formatting helpers bound to the saved company currency and timezone. */
export function useCompanyFormatter() {
  const { currency, timezone } = useCompanyStore((state) => state.settings)

  return {
    currency,
    timezone,
    formatMoney: (amount: number) => formatCurrency(amount, currency),
    formatCompanyDateTime: (value: string | Date) =>
      formatDate(value, { dateStyle: 'medium', timeStyle: 'short' }, timezone),
  }
}
