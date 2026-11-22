import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Bell, ChevronDown, ChevronRight, CircleHelp, Home, LogOut, Moon, Search,
  Settings, Sun, UserRound, CheckCheck, Command,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { navigation, titleForPath } from '@/lib/navigation'
import { activities } from '@/mocks/data'
import { useUIStore } from '@/hooks/use-theme'

export function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [readIds, setReadIds] = useState<string[]>([])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const currentModule = navigation.find((item) =>
    pathname === item.href || pathname.startsWith(`${item.href}/`),
  )
  const pageTitle = titleForPath(pathname)
  const unread = activities.filter((a) => !readIds.includes(a.id)).length

  const results = [
    ...navigation.flatMap((item) => [
      { title: item.title, href: item.children?.[0]?.href ?? item.href, group: 'Modules' },
      ...(item.children ?? []).map((child) => ({ ...child, group: item.title })),
    ]),
  ].filter((r) => r.title.toLowerCase().includes(query.toLowerCase())).slice(0, 8)

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 pl-10 lg:pl-0">
          <div className="hidden min-w-0 flex-col sm:flex">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Home className="h-3.5 w-3.5" />
              <ChevronRight className="h-3 w-3" />
              <span>{currentModule?.title ?? 'Workspace'}</span>
              {currentModule && pageTitle !== currentModule.title && (
                <><ChevronRight className="h-3 w-3" /><span className="text-foreground">{pageTitle}</span></>
              )}
            </div>
            <h2 className="truncate text-base font-semibold tracking-tight">{pageTitle}</h2>
          </div>
          <span className="truncate text-sm font-semibold sm:hidden">{pageTitle}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-9 w-56 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent lg:flex xl:w-72"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search anything...</span>
            <kbd className="pointer-events-none inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px]">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-[18px] w-[18px]" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <button
                  type="button"
                  className="text-xs font-normal text-primary hover:underline"
                  onClick={() => { setReadIds(activities.map((a) => a.id)); toast.success('All notifications marked as read') }}
                >
                  Mark all read
                </button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {activities.slice(0, 5).map((activity) => {
                  const isRead = readIds.includes(activity.id)
                  return (
                    <DropdownMenuItem key={activity.id} className="flex flex-col items-start gap-0.5 py-2.5" onSelect={() => setReadIds((prev) => prev.includes(activity.id) ? prev : [...prev, activity.id])}>
                      <div className="flex w-full items-center gap-2">
                        <span className={('h-2 w-2 rounded-full ' + (isRead ? 'bg-muted-foreground/30' : 'bg-primary'))} />
                        <span className="flex-1 truncate text-sm font-medium">{activity.title}</span>
                        <span className="text-[10px] text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="pl-4 text-xs text-muted-foreground">{activity.description}</p>
                    </DropdownMenuItem>
                  )
                })}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-xs text-primary" onSelect={() => navigate('/dashboard')}>
                View all activity
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white">MN</AvatarFallback>
                </Avatar>
                <div className="hidden text-left xl:block">
                  <p className="text-xs font-semibold leading-tight">Meera Nair</p>
                  <p className="text-[10px] text-muted-foreground">HR Administrator</p>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground xl:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-sm">Meera Nair</p>
                <p className="text-xs font-normal text-muted-foreground">meera.nair@peopleflow.io</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/employees"><UserRound className="h-4 w-4" /> My profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/settings/general"><Settings className="h-4 w-4" /> Preferences</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/reports"><CircleHelp className="h-4 w-4" /> Help & support</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onSelect={() => toast.info('Demo mode — authentication is not connected')}>
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Dialog open={searchOpen} onOpenChange={(open) => { setSearchOpen(open); if (!open) setQuery('') }}>
        <DialogContent className="max-w-xl p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Global search</DialogTitle>
            <DialogDescription>Search across all HRMS modules and pages.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 border-b px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages and modules..."
              className="h-12 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
            <Badge variant="outline" className="shrink-0 text-[10px]">ESC</Badge>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Navigation</p>
            {results.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">No matching pages found.</p>
            ) : results.map((result, i) => (
              <button
                key={`${result.href}-${i}`}
                type="button"
                onClick={() => { navigate(result.href); setSearchOpen(false); setQuery('') }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 font-medium">{result.title}</span>
                <span className="text-xs text-muted-foreground">{result.group}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCheck className="h-3.5 w-3.5" /> Quick navigation</span>
            <span>Demo workspace</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
