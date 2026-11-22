import { useState } from 'react'
import { toast } from 'sonner'
import {
  Calendar,
  CalendarCheck,
  Eye,
  Hash,
  Palette,
  Pencil,
  RotateCcw,
  Trash2,
  Users,
} from 'lucide-react'
import { CrudPage, type FormFieldDef } from '@/components/common/CrudPage'
import { ActionIconButton } from '@/components/common/ActionIconButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { leaveRequests, leaveTypes } from '@/mocks/data'
import type { LeaveType } from '@/types'

const fields: FormFieldDef[] = [
  {
    key: 'name',
    label: 'Leave Name',
    required: true,
    placeholder: 'e.g. Casual Leave',
    colSpan: 1,
    icon: CalendarCheck,
  },
  {
    key: 'code',
    label: 'Code',
    required: true,
    placeholder: 'e.g. CL, SL',
    colSpan: 1,
    icon: Hash,
  },
  {
    key: 'annualAllowance',
    label: 'Annual Allowance (days)',
    type: 'number',
    required: true,
    placeholder: '12',
    colSpan: 1,
    icon: Calendar,
  },
  {
    key: 'carryForward',
    label: 'Carry Forward',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
    colSpan: 1,
    icon: RotateCcw,
  },
  {
    key: 'color',
    label: 'Color (hex)',
    required: true,
    placeholder: '#6366f1',
    colSpan: 2,
    icon: Palette,
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Brief explanation of when this leave category applies...',
    colSpan: 2,
  },
]

export default function LeaveTypes() {
  const [viewing, setViewing] = useState<LeaveType | null>(null)

  return (
    <>
      <CrudPage
        title="Leave Types"
        description="Configure leave categories, allowances and carry-forward rules."
        data={leaveTypes}
        entityName="Leave Type"
        entityIcon={CalendarCheck}
        fields={fields}
        searchPlaceholder="Search leave types..."
        actionsHeaderClassName="w-[132px] text-right"
        actionsHeaderLabel="Actions"
        onView={(leaveType) => setViewing(leaveType)}
        renderRowActions={(leaveType, handlers) => {
          const inUseCount = leaveRequests.filter((r) => r.leaveType === leaveType.name).length
          const isInUse = inUseCount > 0

          return (
            <div className="flex items-center justify-end gap-1.5">
              <ActionIconButton
                variant="view"
                icon={Eye}
                label={`View ${leaveType.name}`}
                tooltip="View leave type details"
                onClick={handlers.onView}
              />
              <ActionIconButton
                variant="edit"
                icon={Pencil}
                label={`Edit ${leaveType.name}`}
                tooltip="Edit leave type"
                onClick={handlers.onEdit}
              />
              <ActionIconButton
                variant="delete"
                icon={Trash2}
                label={`Delete ${leaveType.name}`}
                tooltip={
                  isInUse
                    ? `Cannot delete: ${inUseCount} leave request${inUseCount === 1 ? '' : 's'} assigned`
                    : 'Delete leave type'
                }
                ariaDisabled={isInUse}
                onClick={() => {
                  if (isInUse) {
                    toast.warning(
                      `${leaveType.name} is in use by ${inUseCount} leave request${inUseCount === 1 ? '' : 's'} — deletion is not allowed`,
                    )
                    return
                  }
                  handlers.onDelete()
                }}
              />
            </div>
          )
        }}
        columns={[
          {
            key: 'name',
            header: 'Leave Type',
            cell: (l) => (
              <span className="flex items-center gap-2.5 font-medium text-[#0F172A] dark:text-slate-100">
                <span
                  className="h-3 w-3 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: l.color }}
                />
                {l.name}
              </span>
            ),
            sortValue: (l) => l.name,
          },
          {
            key: 'code',
            header: 'Code',
            cell: (l) => (
              <Badge variant="outline" className="font-mono text-xs font-semibold">
                {l.code}
              </Badge>
            ),
          },
          {
            key: 'annualAllowance',
            header: 'Allowance',
            cell: (l) => (
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {l.annualAllowance} days
              </span>
            ),
            sortValue: (l) => l.annualAllowance,
          },
          {
            key: 'carryForward',
            header: 'Carry Forward',
            cell: (l) => (
              <Badge
                variant={l.carryForward ? 'default' : 'secondary'}
                className={l.carryForward ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
              >
                {l.carryForward ? 'Yes' : 'No'}
              </Badge>
            ),
          },
          {
            key: 'description',
            header: 'Description',
            cell: (l) => (
              <span className="line-clamp-1 text-slate-500 dark:text-slate-400 text-xs">
                {l.description}
              </span>
            ),
          },
        ]}
        toValues={(l: LeaveType) => ({
          name: l.name,
          code: l.code,
          annualAllowance: String(l.annualAllowance),
          carryForward: l.carryForward ? 'Yes' : 'No',
          color: l.color,
          description: l.description,
        })}
        fromValues={(v, id): LeaveType => ({
          id,
          name: v.name!,
          code: v.code!,
          annualAllowance: Number(v.annualAllowance),
          carryForward: v.carryForward === 'Yes',
          color: v.color!,
          description: v.description ?? '',
        })}
      />

      {/* View Leave Type Modal */}
      <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1"
                style={{
                  backgroundColor: viewing ? `${viewing.color}15` : '#4F46E515',
                  color: viewing?.color ?? '#4F46E5',
                  borderColor: viewing ? `${viewing.color}30` : '#4F46E530',
                }}
              >
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
                  {viewing?.name}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
                  Category code: {viewing?.code} · Leave policy details
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {viewing && (
            <div className="space-y-4 py-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail
                  icon={Calendar}
                  label="Annual Allowance"
                  value={`${viewing.annualAllowance} days / year`}
                />
                <Detail
                  icon={RotateCcw}
                  label="Carry Forward"
                  value={viewing.carryForward ? 'Allowed' : 'Not Allowed'}
                />
                <Detail
                  icon={Palette}
                  label="Theme Color"
                  value={viewing.color}
                  indicatorColor={viewing.color}
                />
                <Detail
                  icon={Users}
                  label="Active Requests"
                  value={`${leaveRequests.filter((r) => r.leaveType === viewing.name).length} recorded`}
                />
              </div>

              {viewing.description && (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50 space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Policy Description
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {viewing.description}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewing(null)}
              className="h-[42px] px-5 rounded-lg text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Detail({
  icon: Icon,
  label,
  value,
  indicatorColor,
}: {
  icon: typeof Calendar
  label: string
  value: string
  indicatorColor?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#4F46E5] ring-1 ring-indigo-500/10 dark:bg-indigo-950/50 dark:text-indigo-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {indicatorColor && (
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: indicatorColor }}
            />
          )}
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}
