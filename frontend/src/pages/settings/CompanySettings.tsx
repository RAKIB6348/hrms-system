import { useState } from 'react'
import { toast } from 'sonner'
import { Building2, Save, Upload } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DemoNotice } from '@/components/common/DemoNotice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function CompanySettings() {
  const [company, setCompany] = useState({
    name: 'PeopleFlow Technologies', legalName: 'PeopleFlow Technologies Inc.',
    email: 'hello@peopleflow.io', phone: '+1 (555) 100-2000',
    website: 'https://peopleflow.io', address: '100 Market Street, New York, NY 10001',
    timezone: 'America/New_York', currency: 'USD', fiscalYear: 'Calendar Year',
  })

  const update = (key: keyof typeof company, value: string) => setCompany((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="space-y-6">
      <PageHeader title="Company Settings" description="Manage your organization's profile and policies." />
      <DemoNotice compact />

      <form onSubmit={(e) => { e.preventDefault(); toast.success('Company settings saved (demo)') }} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Company Profile</CardTitle><CardDescription>Basic information used across the platform.</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16"><AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-xl text-white"><Building2 className="h-7 w-7" /></AvatarFallback></Avatar>
              <div><Button type="button" variant="outline" size="sm" onClick={() => toast.info('Logo upload is not connected in demo mode')}><Upload className="h-4 w-4" /> Upload Logo</Button><p className="mt-1 text-xs text-muted-foreground">PNG or JPG, max 2MB.</p></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Company Name</Label><Input value={company.name} onChange={(e) => update('name', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Legal Name</Label><Input value={company.legalName} onChange={(e) => update('legalName', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={company.email} onChange={(e) => update('email', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={company.phone} onChange={(e) => update('phone', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Website</Label><Input value={company.website} onChange={(e) => update('website', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Timezone</Label>
                <Select value={company.timezone} onValueChange={(v) => update('timezone', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['America/New_York', 'Europe/London', 'Asia/Kolkata', 'Asia/Singapore'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Currency</Label>
                <Select value={company.currency} onValueChange={(v) => update('currency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['USD', 'EUR', 'GBP', 'INR', 'SGD'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Fiscal Year</Label>
                <Select value={company.fiscalYear} onValueChange={(v) => update('fiscalYear', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Calendar Year', 'April – March', 'July – June'].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2"><Label>Address</Label><Textarea value={company.address} onChange={(e) => update('address', e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end"><Button type="submit"><Save className="h-4 w-4" /> Save Changes</Button></div>
      </form>
    </div>
  )
}
