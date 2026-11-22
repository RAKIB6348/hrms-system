import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { shifts as seedShifts } from '@/mocks/data'
import { randomId } from '@/lib/utils'
import type { Shift } from '@/types'

interface ShiftStoreState {
  shifts: Shift[]
  addShift: (shift: Shift) => void
  updateShift: (id: string, patch: Partial<Shift>) => void
  deleteShift: (id: string) => void
}

/** Shift definitions are demo data and safe to persist in localStorage. */
export const useShiftStore = create<ShiftStoreState>()(
  persist(
    (set) => ({
      shifts: seedShifts,
      addShift: (shift) => set((state) => ({ shifts: [shift, ...state.shifts] })),
      updateShift: (id, patch) => set((state) => ({
        shifts: state.shifts.map((shift) => shift.id === id ? { ...shift, ...patch } : shift),
      })),
      deleteShift: (id) => set((state) => ({ shifts: state.shifts.filter((shift) => shift.id !== id) })),
    }),
    {
      name: 'hrms-shift-store',
      version: 1,
      partialize: (state) => ({ shifts: state.shifts }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<ShiftStoreState> | undefined
        return { ...current, shifts: Array.isArray(saved?.shifts) && saved.shifts.length ? saved.shifts : current.shifts }
      },
    },
  ),
)

export function newShiftId() {
  return randomId('shift')
}
