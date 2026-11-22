import { Badge, type BadgeProps } from '@/components/ui/badge'

type Tone = NonNullable<BadgeProps['variant']>

const statusTones: Record<string, Tone> = {
  Active: 'success', Present: 'success', Approved: 'success', Paid: 'success', Completed: 'success',
  Open: 'success', Hired: 'success', 'On Track': 'success', Recovered: 'success',
  Pending: 'warning', 'On Leave': 'warning', Late: 'warning', 'Half Day': 'warning',
  Processing: 'warning', 'In Progress': 'info', 'On Hold': 'warning', 'At Risk': 'warning',
  Probation: 'info', Screening: 'info', Interview: 'info', Offer: 'info', Draft: 'secondary',
  Absent: 'destructive', Inactive: 'secondary', Rejected: 'destructive', Cancelled: 'secondary',
  Closed: 'secondary', Overdue: 'destructive',
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusTones[status] ?? 'outline'}>{status}</Badge>
}
