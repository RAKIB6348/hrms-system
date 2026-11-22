import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Compass className="h-8 w-8" /></div>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">404 — Page not found</h1>
        <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist in this demo workspace.</p>
      </div>
      <Button asChild><Link to="/dashboard">Back to Dashboard</Link></Button>
    </div>
  )
}
