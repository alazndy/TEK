
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useVirtualizer } from '@tanstack/react-virtual'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Inbox, Loader2 } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onLoadMore?: () => void
  isLoading?: boolean
  hasMore?: boolean
  isSearchActive?: boolean
  onBulkDelete?: (ids: string[]) => void
  onBulkPrint?: (rows: TData[]) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onLoadMore,
  isLoading,
  hasMore,
  isSearchActive,
  onBulkDelete,
  onBulkPrint
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 65, // Adjust this based on your average row height
    overscan: 10,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0
  const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0

  // Infinite scroll trigger
  React.useEffect(() => {
    const lastItem = virtualRows[virtualRows.length - 1]
    if (lastItem && lastItem.index >= rows.length - 5 && hasMore && !isLoading && !isSearchActive && onLoadMore) {
      onLoadMore()
    }
  }, [virtualRows, rows.length, hasMore, isLoading, onLoadMore, isSearchActive])

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const isBulkActionsVisible = selectedRows.length > 0;

  return (
    <div>
      <div className="flex items-center py-4 justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} sonuç bulundu.
        </div>
        
        {isBulkActionsVisible ? (
             <div className="flex items-center gap-2 mr-4 bg-muted/50 p-2 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-top-2">
                <span className="text-sm font-medium mr-2 text-primary">{selectedRows.length} seçildi</span>
                {onBulkPrint && (
                    <Button size="sm" variant="secondary" onClick={() => onBulkPrint(selectedRows.map(r => r.original))}>
                        Etiket ({selectedRows.length})
                    </Button>
                )}
                {onBulkDelete && (
                    <Button size="sm" variant="destructive" onClick={() => onBulkDelete(selectedRows.map(r => r.original as any).map((i: any) => i.id))}>
                        Sil ({selectedRows.length})
                    </Button>
                )}
             </div>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Sütunlar <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border h-[60vh] overflow-auto -mx-4 sm:mx-0" ref={tableContainerRef}>
        <Table style={{ height: `${totalSize}px` }}>
          <TableHeader className="sticky top-0 bg-background z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {paddingTop > 0 && (
                <tr>
                    <td style={{ height: `${paddingTop}px` }} />
                </tr>
            )}
            {virtualRows.length > 0 ? (
              virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index]
                return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              )})
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <Inbox className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Sonuç Bulunamadı</h3>
                        <p className="text-sm text-muted-foreground">Filtrelerinizi değiştirmeyi deneyin.</p>
                    </div>
                </TableCell>
              </TableRow>
            )}
            {paddingBottom > 0 && (
                <tr>
                    <td style={{ height: `${paddingBottom}px` }} />
                </tr>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />}
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} /{" "}
          {table.getFilteredRowModel().rows.length} satır seçildi.
        </div>
      </div>
    </div>
  )
}
