import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft, CalendarDays, Cake, Mail, MapPin, Phone, UserRound, Wallet, BriefcaseBusiness,
  FileText, Download, MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { DemoNotice } from '@/components/common/DemoNotice'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { employees, attendanceRecords } from '@/mocks/data'
import { formatCurrency, formatDate, initials } from '@/lib/utils'

export default function EmployeeProfile() {
  const { id } = useParams()
  const [tab, setTab] = useState('overview')
  const employee = employees.find((e) => e.id === id)

  if (!employee) {
    return <EmptyState icon={UserRound} title="Employee not found" description="This employee record does not exist in the demo data." actionLabel="Back to employees" onAction={() => window.history.back()} />
  }

  const name = `${employee.firstName} ${employee.lastName}`
  const attendance = attendanceRecords.filter((a) => a.employeeId === employee.id)

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild><Link to="/employees"><ArrowLeft className="h-4 w-4" /> Back to employees</Link></Button>
      <DemoNotice compact />

      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        <CardContent className="relative pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
                <AvatarFallback className="text-2xl" style={{ backgroundColor: employee.avatarColor, color: '#fff' }}>{initials(name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
                  <StatusBadge status={employee.status} />
                </div>
                <p className="text-sm text-muted-foreground">{employee.designation} · {employee.department}</p>
                <p className="font-mono text-xs text-muted-foreground">{employee.employeeId}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pb-1">
              <Button variant="outline" onClick={() => toast.info('Demo: profile editing is not connected')}><MoreHorizontal className="h-4 w-4" /> Actions</Button>
              <Button onClick={() => toast.success(`Message sent to ${name} (demo)`)}><Mail className="h-4 w-4" /> Send message</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Annual Salary" value={formatCurrency(employee.salary)} icon={Wallet} tone="primary" />
        <StatCard title="Department" value={employee.department} icon={BriefcaseBusiness} tone="violet" />
        <StatCard title="Work Location" value={employee.location} icon={MapPin} tone="sky" />
        <StatCard title="Joining Date" value={formatDate(employee.joinDate, { month: 'short', year: 'numeric' })} icon={CalendarDays} tone="emerald" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow icon={Mail} label="Email" value={employee.email} />
              <InfoRow icon={Phone} label="Phone" value={employee.phone} />
              <InfoRow icon={MapPin} label="Address" value={employee.address} />
              <InfoRow icon={UserRound} label="Reports to" value={employee.manager} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Employment Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow icon={BriefcaseBusiness} label="Employment Type" value={employee.employmentType} />
              <InfoRow icon={CalendarDays} label="Date of Joining" value={formatDate(employee.joinDate)} />
              <InfoRow icon={Wallet} label="Annual Salary" value={formatCurrency(employee.salary)} />
              <InfoRow icon={UserRound} label="Employee ID" value={employee.employeeId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={UserRound} label="Full Name" value={name} />
              <InfoRow icon={Cake} label="Date of Birth" value={formatDate(employee.dob)} />
              <InfoRow icon={UserRound} label="Gender" value={employee.gender} />
              <InfoRow icon={MapPin} label="Location" value={employee.location} />
              <InfoRow icon={Phone} label="Phone" value={employee.phone} />
              <InfoRow icon={Mail} label="Email" value={employee.email} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader><CardTitle className="text-base">Documents</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {['Employment Contract', 'Identity Verification', 'Tax Declaration', 'Offer Letter'].map((doc) => (
                <div key={doc} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4" /></div>
                  <div className="flex-1"><p className="text-sm font-medium">{doc}</p><p className="text-xs text-muted-foreground">Added {formatDate(employee.joinDate)}</p></div>
                  <Button variant="ghost" size="icon" onClick={() => toast.success(`${doc} download started (demo)`)}><Download className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Attendance</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {attendance.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No attendance records available for this employee in the demo data.</p>
              ) : attendance.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div><p className="font-medium">{formatDate(a.date)}</p><p className="text-xs text-muted-foreground">{a.shift} · {a.checkIn} – {a.checkOut}</p></div>
                  <div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">{a.hours}h</span><StatusBadge status={a.status} /></div>
                </div>
              ))}
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">Full history is available in the Attendance module.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate font-medium">{value}</p></div>
    </div>
  )
}
