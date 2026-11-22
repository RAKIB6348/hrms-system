import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type ActionVariant = 'view' | 'edit' | 'delete'

const variantStyles: Record<ActionVariant, string> = {
  view: 'bg-[#1E40AF] text-white hover:bg-[#1D4ED8]',
  edit: 'bg-[#6D28D9] text-white hover:bg-[#7C3AED]',
  delete: 'bg-[#B91C1C] text-white hover:bg-[#991B1B]',
}

interface ActionIconButtonProps {
  variant: ActionVariant
  icon: LucideIcon
  label: string
  tooltip?: string
  onClick?: () => void
  /** Keeps the button clickable (for an explanatory message) while appearing inactive. */
  ariaDisabled?: boolean
  className?: string
}

/** Shared styling for table View / Edit / Delete icon buttons. */
export function ActionIconButton({
  variant, icon: Icon, label, tooltip, onClick, ariaDisabled, className,
}: ActionIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-disabled={ariaDisabled || undefined}
          onClick={onClick}
          className={cn(
            'h-8 w-8 rounded-md transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            variantStyles[variant],
            className,
          )}
        >
          <Icon className="h-4 w-4 text-white" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip ?? label}</TooltipContent>
    </Tooltip>
  )
}
