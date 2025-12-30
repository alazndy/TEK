"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Order } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, FileText, Truck, Pencil } from "lucide-react"
import { SortableHeader } from "@/components/ui/sortable-header"

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: ({ column }) => <SortableHeader column={column} title="Sipariş No" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("orderNumber")}</div>,
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => <SortableHeader column={column} title="Müşteri" />,
  },
  {
    accessorKey: "date",
    header: ({ column }) => <SortableHeader column={column} title="Tarih" />,
    cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString('tr-TR'),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Durum" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
      if (status === "Teslim Edildi") variant = "default"
      if (status === "Kargolandı") variant = "outline"
      if (status === "İptal Edildi") variant = "destructive"
      
      const colorClass = status === 'Kargolandı' ? 'text-blue-600 dark:text-blue-400 border-blue-500' : ''
      
      return <Badge variant={variant} className={colorClass}>{status}</Badge>
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => <div className="text-right"><SortableHeader column={column} title="Tutar" /></div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"))
      const formatted = new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menüyü aç</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Siparişi Düzenle
            </DropdownMenuItem>
            {order.trackingNumber && (
                <DropdownMenuItem>
                    <Truck className="mr-2 h-4 w-4" />
                    Kargo Takip
                </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              Faturayı Görüntüle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
