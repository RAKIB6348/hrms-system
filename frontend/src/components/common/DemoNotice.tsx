import { FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DemoNoticeProps {
  className?: string
  compact?: boolean
}

/** Clearly labels every screen as demonstration data. */
export function DemoNotice({ className, compact = false }: DemoNoticeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/[0.04] px-3 py-2 text-xs text-primary dark:text-primary',
        compact ? 'w-fit' : 'w-full',
        className,
      )}
    >
      <FlaskConical className="h-3.5 w-3.5 shrink-0" />
      <span>
        <strong className="font-semibold">Demo workspace.</strong> All data shown is fictional sample data for
        interface demonstration only — no backend is connected.
      </span>
    </div>
  )
}
