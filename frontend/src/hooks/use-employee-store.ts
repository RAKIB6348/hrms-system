import { create } from 'zustand'
import { employees as seedEmployees } from '@/mocks/data'
import { randomId } from '@/lib/utils'
import type { Employee } from '@/types'

interface EmployeeStoreState {
  employees: Employee[]
  addEmployee: (employee: Employee) => void
  updateEmployee: (id: string, patch: Partial<Employee>) => void
  deleteEmployee: (id: string) => void
}

/**
 * Session-only employee data source. Deliberately NOT persisted: identity and
 * banking details entered in the registration form must not be written to
 * localStorage until a secure backend is available.
 */
export const useEmployeeStore = create<EmployeeStoreState>((set) => ({
  employees: seedEmployees,
  addEmployee: (employee) => set((state) => ({ employees: [employee, ...state.employees] })),
  updateEmployee: (id, patch) => set((state) => ({
    employees: state.employees.map((employee) => employee.id === id ? { ...employee, ...patch } : employee),
  })),
  deleteEmployee: (id) => set((state) => ({ employees: state.employees.filter((employee) => employee.id !== id) })),
}))

/** Generates the next unique PF-style employee ID from the current records. */
export function generateEmployeeId(employees?: Employee[]) {
  const current = employees ?? useEmployeeStore.getState().employees
  const numbers = current
    .map((employee) => Number(employee.employeeId.replace(/\D/g, '')))
    .filter((value) => Number.isFinite(value))
  const next = Math.max(1000, ...numbers) + 1
  return `PF-${next}`
}

export function newEmployeeId() {
  return randomId('emp')
}
