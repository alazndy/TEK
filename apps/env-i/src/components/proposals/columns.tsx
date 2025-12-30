
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Proposal } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Trash2, Pencil } from "lucide-react"
import { SortableHeader } from "@/components/ui/sortable-header"

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    "Gönderildi": "outline",
    "Kabul Edildi": "default",
    "Reddedildi": "destructive",
    "Taslak": "secondary",
}

const statusColorMap: { [key: string]: string } = {
    "Gönderildi": "text-blue-600 dark:text-blue-400 border-blue-500",
    "Kabul Edildi": "bg-green-600 border-green-600",
}


export const columns: ColumnDef<Proposal>[] = [
  {
    accessorKey: "proposalNumber",
    header: ({ column }) => <SortableHeader column={column} title="Teklif No" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("proposalNumber")}</div>,
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
      const variant = statusVariantMap[status] || "secondary";
      const colorClass = statusColorMap[status] || ""
      
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
      const proposal = row.original
 
      return (
        <div className="text-center">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menüyü aç</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => window.open(proposal.pdfUrl, '_blank')}>
                    <Eye className="mr-2 h-4 w-4" />
                    Teklifi Görüntüle
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    Teklifi Düzenle
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      )
    },
  },
]
