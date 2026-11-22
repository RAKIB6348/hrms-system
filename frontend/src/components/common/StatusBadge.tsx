/** Centralized semantic status colors for the entire HRMS. */
export const statusColors: Record<string, string> = {
  // Success
  Active: '#15803D',
  Approved: '#15803D',
  Paid: '#15803D',
  Completed: '#15803D',
  Hired: '#15803D',
  Present: '#15803D',
  Recovered: '#15803D',
  Open: '#15803D',
  'On Track': '#15803D',

  // Warning
  Pending: '#B45309',
  'On Leave': '#B45309',
  'Awaiting Approval': '#B45309',
  Probation: '#B45309',
  Late: '#B45309',
  'Half Day': '#B45309',
  'On Hold': '#B45309',
  'At Risk': '#B45309',

  // Information
  Processing: '#1D4ED8',
  'In Progress': '#1D4ED8',
  Scheduled: '#1D4ED8',
  Applied: '#1D4ED8',
  Screening: '#1D4ED8',
  Interview: '#1D4ED8',
  Offer: '#1D4ED8',

  // Danger
  Rejected: '#B91C1C',
  Unpaid: '#B91C1C',
  Failed: '#B91C1C',
  Cancelled: '#B91C1C',
  Absent: '#B91C1C',
  Overdue: '#B91C1C',

  // Neutral
  Draft: '#475569',
  Inactive: '#475569',
  Closed: '#334155',

  // Published
  Published: '#6D28D9',
}

export const FALLBACK_STATUS_COLOR = '#334155'

export function getStatusColor(status: string) {
  return statusColors[status] ?? FALLBACK_STATUS_COLOR
}

interface StatusBadgeProps {
  status: string
  className?: string
}

/** Compact dark status badge with white text, used across all HRMS modules. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={
        'inline-flex items-center rounded-md border-0 px-2.5 py-1 text-xs font-semibold leading-none text-white shadow-sm ' +
        (className ?? '')
      }
      style={{ backgroundColor: getStatusColor(status), color: '#FFFFFF' }}
    >
      {status}
    </span>
  )
}
