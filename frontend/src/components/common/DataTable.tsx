import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  className?: string
}

export interface TableFilter<T> {
  key: string
  label: string
  options: string[]
  value: (row: T) => string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  filters?: TableFilter<T>[]
  searchPlaceholder?: string
  pageSize?: number
  loading?: boolean
  onRowClick?: (row: T) => void
  rowActions?: (row: T) => ReactNode
  emptyTitle?: string
  toolbar?: ReactNode
  /** Optional controlled state, used when a page needs to share search/filters across views. */
  search?: string
  onSearchChange?: (value: string) => void
  filterValues?: Record<string, string>
  onFilterValuesChange?: (values: Record<string, string>) => void
}

export interface DataTableToolbarProps<T> {
  filters: TableFilter<T>[]
  search: string
  onSearchChange: (value: string) => void
  filterValues: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  searchPlaceholder?: string
  toolbar?: ReactNode
}

/** Search + filter controls shared by the table and alternate views. */
export function DataTableToolbar<T>({
  filters, search, onSearchChange, filterValues, onFilterChange,
  searchPlaceholder = 'Search records...', toolbar,
}: DataTableToolbarProps<T>) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder={searchPlaceholder} className="pl-9" />
        </div>
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filterValues[filter.key] ?? 'all'}
            onValueChange={(value) => onFilterChange(filter.key, value)}
          >
            <SelectTrigger className="w-full sm:w-40" aria-label={filter.label}>
              <span className="flex items-center gap-1.5 truncate">
                <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <SelectValue placeholder={filter.label} />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label.toLowerCase()}</SelectItem>
              {filter.options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
        ))}
      </div>
      {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
    </div>
  )
}

export function DataTable<T extends object>({
  data, columns, filters = [], searchPlaceholder = 'Search records...', pageSize = 8,
  loading, onRowClick, rowActions, emptyTitle = 'No records found', toolbar,
  search, onSearchChange, filterValues: controlledFilterValues, onFilterValuesChange,
}: DataTableProps<T>) {
  const [internalQuery, setInternalQuery] = useState('')
  const [internalFilterValues, setInternalFilterValues] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const [page, setPage] = useState(1)

  const query = search ?? internalQuery
  const activeFilterValues = controlledFilterValues ?? internalFilterValues

  const handleSearchChange = (value: string) => {
    if (onSearchChange) onSearchChange(value)
    else setInternalQuery(value)
    setPage(1)
  }

  const handleFilterChange = (key: string, value: string) => {
    const next = { ...activeFilterValues, [key]: value }
    if (onFilterValuesChange) onFilterValuesChange(next)
    else setInternalFilterValues(next)
    setPage(1)
  }

  const filtered = useMemo(() => {
    let result = data.filter((row) => {
      const matchesQuery = query.trim() === '' || JSON.stringify(row).toLowerCase().includes(query.trim().toLowerCase())
      const matchesFilters = filters.every((f) => {
        const selected = activeFilterValues[f.key]
        return !selected || selected === 'all' || f.value(row) === selected
      })
      return matchesQuery && matchesFilters
    })
    if (sort) {
      const column = columns.find((c) => c.key === sort.key)
      if (column?.sortValue) {
        result = [...result].sort((a, b) => {
          const av = column.sortValue!(a)
          const bv = column.sortValue!(b)
          const cmp = typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv))
          return sort.dir === 'asc' ? cmp : -cmp
        })
      }
    }
    return result
  }, [data, query, activeFilterValues, filters, sort, columns])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
    setPage(1)
  }

  if (loading) return <TableSkeleton columns={columns.length} />

  return (
    <div className="space-y-4">
      <DataTableToolbar
        filters={filters}
        search={query}
        onSearchChange={handleSearchChange}
        filterValues={activeFilterValues}
        onFilterChange={handleFilterChange}
        searchPlaceholder={searchPlaceholder}
        toolbar={toolbar}
      />

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((column) => (
                <TableHead key={column.key} className={cn(column.className)}>
                  {column.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                    >
                      {column.header}
                      {sort?.key === column.key
                        ? sort.dir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                        : <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />}
                    </button>
                  ) : column.header}
                </TableHead>
              ))}
              {rowActions && <TableHead className="w-12 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (rowActions ? 1 : 0)} className="p-0">
                  <EmptyState title={emptyTitle} />
                </TableCell>
              </TableRow>
            ) : rows.map((row, index) => (
              <TableRow
                key={index}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && 'cursor-pointer')}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={cn(column.className)}>{column.cell(row)}</TableCell>
                ))}
                {rowActions && (
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    {rowActions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span>
          {' – '}<span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, filtered.length)}</span>
          {' of '}<span className="font-semibold text-foreground">{filtered.length}</span> records
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-xs font-medium text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline" size="sm" disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="space-y-2 rounded-xl border bg-card p-4">
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
      <span className="sr-only">{columns} columns loading</span>
    </div>
  )
}
