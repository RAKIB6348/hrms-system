import { Toaster as Sonner } from 'sonner'
import { useUIStore } from '@/hooks/use-theme'

type ToasterProps = React.ComponentProps<typeof Sonner>

function Toaster({ ...props }: ToasterProps) {
  const theme = useUIStore((state) => state.theme)
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'group toast !bg-card !text-card-foreground !border-border !shadow-lg rounded-lg',
          description: '!text-muted-foreground',
          actionButton: '!bg-primary !text-primary-foreground',
          cancelButton: '!bg-muted !text-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
