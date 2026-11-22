import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/layouts/Sidebar'
import { Header } from '@/layouts/Header'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

export function MainLayout() {
  const { pathname } = useLocation()
  const collapsed = useUIStore((s) => s.sidebarCollapsed)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn('flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out lg:pl-[260px]', collapsed && 'lg:pl-[72px]')}>
        <Header />
        <main className="flex-1 animate-fade-in">
          <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
        <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
          PeopleFlow HRMS · Frontend demonstration · Fictional data only · No backend connected
        </footer>
      </div>
    </div>
  )
}

function PageFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}
