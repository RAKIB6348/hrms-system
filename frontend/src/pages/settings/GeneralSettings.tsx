import { useState } from 'react'
import { toast } from 'sonner'
import { Bell, Database, Moon, Palette, Sun } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useUIStore } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

export default function GeneralSettings() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const [prefs, setPrefs] = useState({
    emailNotifications: true, pushNotifications: false, weeklyDigest: true,
    compactMode: false, showDemoBanner: true, twoFactor: false,
  })
  const toggle = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
    toast.success('Preference updated (demo)')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="General Settings" description="Customize your application appearance and preferences." />
      <DemoNotice compact />

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> Appearance</CardTitle><CardDescription>Choose how PeopleFlow looks on this device.</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['light', 'dark'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTheme(mode)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:border-primary/50',
                  theme === mode ? 'border-primary bg-primary/5 ring-1 ring-primary' : '',
                )}
              >
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', mode === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-slate-800 text-indigo-300')}>
                  {mode === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </div>
                <div><p className="font-medium capitalize">{mode} mode</p><p className="text-xs text-muted-foreground">{mode === 'light' ? 'Bright, clean interface' : 'Easy on the eyes at night'}</p></div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notifications</CardTitle><CardDescription>Control which updates you receive.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow label="Email notifications" description="Receive updates via email" checked={prefs.emailNotifications} onChange={() => toggle('emailNotifications')} />
          <Separator />
          <ToggleRow label="Push notifications" description="Browser push notifications for approvals" checked={prefs.pushNotifications} onChange={() => toggle('pushNotifications')} />
          <Separator />
          <ToggleRow label="Weekly digest" description="A summary of your team every Monday" checked={prefs.weeklyDigest} onChange={() => toggle('weeklyDigest')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4 text-primary" /> Data & Privacy</CardTitle><CardDescription>Workspace-level data preferences.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow label="Compact table mode" description="Show more rows per page" checked={prefs.compactMode} onChange={() => toggle('compactMode')} />
          <Separator />
          <ToggleRow label="Show demo banner" description="Display demonstration data notice" checked={prefs.showDemoBanner} onChange={() => toggle('showDemoBanner')} />
          <Separator />
          <ToggleRow label="Two-factor authentication" description="Require 2FA at sign-in (not connected in demo)" checked={prefs.twoFactor} onChange={() => toggle('twoFactor')} />
        </CardContent>
      </Card>

      <div className="flex justify-end"><Button onClick={() => toast.success('Settings saved (demo)')}>Save Preferences</Button></div>
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5"><Label>{label}</Label><p className="text-xs text-muted-foreground">{description}</p></div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
