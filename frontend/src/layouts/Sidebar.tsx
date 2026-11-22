import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronsLeft, Menu, PanelLeftClose, Sparkles, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { navigation } from '@/lib/navigation'
import { useUIStore } from '@/hooks/use-theme'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { pathname } = useLocation()
  const isMobile = useIsMobile()
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const mobileOpen = useUIStore((s) => s.mobileSidebarOpen)
  const setMobileOpen = useUIStore((s) => s.setMobileSidebarOpen)

  const [expanded, setExpanded] = useState<string[]>(() => {
    const active = navigation.find((item) => pathname.startsWith(item.href) && item.href !== '/dashboard')
    return active ? [active.title] : []
  })

  useEffect(() => {
    const active = navigation.find((item) =>
      item.children?.some((child) => child.href === pathname) || pathname.startsWith(`${item.href}/`),
    )
    if (active) setExpanded((prev) => (prev.includes(active.title) ? prev : [...prev, active.title]))
    if (isMobile) setMobileOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const isCollapsed = collapsed && !isMobile

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className={cn('flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-4', isCollapsed && 'justify-center px-2')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-lg shadow-indigo-950/40">
          <Sparkles className="h-5 w-5" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold tracking-tight text-white">PeopleFlow</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">HRMS Platform</p>
          </div>
        )}
        {isMobile ? (
          <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-sidebar-accent hover:text-white" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        ) : null}
      </div>

      {/* Navigation */}
      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!isCollapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
        )}
        {navigation.map((item) => {
          const Icon = item.icon
          const hasChildren = Boolean(item.children?.length)
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
          const anyChildActive = item.children?.some((child) => child.href === pathname)
          const isOpen = expanded.includes(item.title)

          const link = (
            <div
              className={cn(
                'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isCollapsed && 'justify-center px-2',
                isActive || anyChildActive
                  ? 'bg-sidebar-accent text-white shadow-sm'
                  : 'text-slate-400 hover:bg-sidebar-accent/60 hover:text-white',
              )}
            >
              {(isActive || anyChildActive) && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-indigo-400" />
              )}
              <Icon className={cn('h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110', isActive && 'text-indigo-300')} />
              {!isCollapsed && <span className="flex-1 truncate text-left">{item.title}</span>}
              {!isCollapsed && hasChildren && (
                <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-200', isOpen && 'rotate-180')} />
              )}
            </div>
          )

          return (
            <div key={item.title}>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={item.children?.[0]?.href ?? item.href} onClick={() => {
                      if (hasChildren) setExpanded((prev) => prev.includes(item.title) ? prev : [...prev, item.title])
                    }}>
                      {link}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              ) : (
                <Link to={hasChildren ? (item.children?.[0]?.href ?? item.href) : item.href} onClick={(e) => {
                  if (hasChildren) { e.preventDefault(); setExpanded((prev) => prev.includes(item.title) ? prev.filter((t) => t !== item.title) : [...prev, item.title]) }
                }}>
                  {link}
                </Link>
              )}
              {hasChildren && isOpen && !isCollapsed && (
                <div className="ml-5 mt-1 space-y-0.5 border-l border-sidebar-border pl-3 animate-in fade-in-0 slide-in-from-top-1">
                  {item.children!.map((child) => {
                    const childActive = pathname === child.href
                    return (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={cn(
                          'block rounded-md px-3 py-2 text-[13px] transition-colors',
                          childActive
                            ? 'bg-indigo-500/15 font-semibold text-indigo-200'
                            : 'text-slate-400 hover:bg-sidebar-accent/50 hover:text-slate-100',
                        )}
                      >
                        {child.title}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        {!isCollapsed && (
          <div className="mb-3 rounded-lg bg-sidebar-accent/60 p-3">
            <p className="text-xs font-semibold text-white">Demo workspace</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Explore the full HRMS experience with sample data.
            </p>
          </div>
        )}
        {!isMobile && (
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-sidebar-accent hover:text-white',
              isCollapsed && 'justify-center px-2',
            )}
          >
            {isCollapsed ? <PanelLeftClose className="h-[18px] w-[18px] rotate-180" /> : <ChevronsLeft className="h-[18px] w-[18px]" />}
            {!isCollapsed && <span>Collapse sidebar</span>}
          </button>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost" size="icon" className="fixed left-3 top-3 z-40 lg:hidden"
          onClick={() => setMobileOpen(true)} aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-2xl animate-in slide-in-from-left">
              {sidebarContent}
            </aside>
          </div>
        )}
      </>
    )
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-border transition-[width] duration-300 ease-in-out lg:block',
        collapsed ? 'w-[72px]' : 'w-[260px]',
      )}
    >
      {sidebarContent}
    </aside>
  )
}
