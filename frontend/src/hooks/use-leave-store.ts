import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { leaveRequests as seedRequests } from '@/mocks/data'
import { randomId } from '@/lib/utils'
import type { LeaveRequest } from '@/types'

interface LeaveStoreState {
  requests: LeaveRequest[]
  addRequest: (request: LeaveRequest) => void
  updateStatus: (id: string, status: 'Approved' | 'Rejected') => void
}

/** Single frontend data source for leave requests; safe demo data only. */
export const useLeaveStore = create<LeaveStoreState>()(
  persist(
    (set) => ({
      requests: seedRequests,
      addRequest: (request) => set((state) => ({ requests: [request, ...state.requests] })),
      updateStatus: (id, status) => set((state) => ({
        requests: state.requests.map((request) => request.id === id ? { ...request, status } : request),
      })),
    }),
    {
      name: 'hrms-leave-store',
      version: 1,
      partialize: (state) => ({ requests: state.requests }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<LeaveStoreState> | undefined
        return { ...current, requests: Array.isArray(saved?.requests) && saved.requests.length ? saved.requests : current.requests }
      },
    },
  ),
)

export function newLeaveRequestId() {
  return randomId('lv')
}
