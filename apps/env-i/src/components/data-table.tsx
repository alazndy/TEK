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
import { ChevronDown, Inbox, Loader2, RefreshCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
    estimateSize: () => 65,
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
    <div className="space-y-4">
      {/* Toolbar / Actions */}
      <div className="flex items-center justify-between">
         <div className="text-sm text-muted-foreground font-medium">
             {table.getFilteredRowModel().rows.length} kayıt listeleniyor
         </div>
         
         <div className="flex items-center gap-2">
            <AnimatePresence>
                {isBulkActionsVisible && (
                     <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-2 mr-2 bg-primary/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/20"
                     >
                        <span className="text-xs font-semibold mr-2 text-primary whitespace-nowrap">{selectedRows.length} seçildi</span>
                        <div className="h-4 w-px bg-primary/20 mx-1" />
                        {onBulkPrint && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs hover:bg-primary/20" onClick={() => onBulkPrint(selectedRows.map(r => r.original))}>
                                Etiket
                            </Button>
                        )}
                        {onBulkDelete && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs hover:bg-destructive/20 text-destructive hover:text-destructive" onClick={() => onBulkDelete(selectedRows.map(r => r.original as any).map((i: any) => i.id))}>
                                Sil
                            </Button>
                        )}
                     </motion.div>
                )}
            </AnimatePresence>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden lg:flex">
                  Görünüm <ChevronDown className="ml-2 h-4 w-4" />
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
      </div>

      {/* Main Glass Table Container */}
      <div className="glass-panel overflow-hidden rounded-xl border border-white/10 relative">
        <div className="h-[65vh] overflow-auto" ref={tableContainerRef}>
            <Table style={{ height: `${totalSize}px` }}>
              <TableHeader className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-sm">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent border-white/10">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="h-10 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
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
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      data-state={row.getIsSelected() && "selected"}
                      className="group transition-colors data-[state=selected]:bg-primary/5 border-b border-white/5 last:border-0 hover:bg-white/5"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-2.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </motion.tr>
                  )})
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 py-12">
                            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                                <Inbox className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-medium">Veri Bulunamadı</h3>
                                <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                                    Aramanla eşleşen sonuç yok. Filtreleri temizlemeyi veya yeni kayıt eklemeyi dene.
                                </p>
                            </div>
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
        
        {/* Loading Overlay */}
        <AnimatePresence>
            {isLoading && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 bottom-0 bg-background/50 h-10 flex items-center justify-center backdrop-blur-sm border-t border-white/10"
                >
                    <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                    <span className="text-xs font-medium text-muted-foreground">Yükleniyor...</span>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

       {/* Load More Button */}
       {hasMore && !isSearchActive && onLoadMore && (
         <div className="flex justify-center py-4 border-t border-white/10">
           <Button 
             variant="outline" 
             size="sm" 
             onClick={onLoadMore}
             disabled={isLoading}
             className="gap-2"
           >
             {isLoading ? (
               <>
                 <Loader2 className="h-4 w-4 animate-spin" />
                 Yükleniyor...
               </>
             ) : (
               <>
                 <RefreshCcw className="h-4 w-4" />
                 Daha Fazla Yükle
               </>
             )}
           </Button>
         </div>
       )}

       <div className="flex items-center justify-end px-2">
        <div className="text-xs text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span>{table.getFilteredSelectedRowModel().rows.length} satır seçildi</span>
          )}
        </div>
      </div>
    </div>
  )
}
