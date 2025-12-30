
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Consumable } from "@/lib/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { SortableHeader } from "@/components/ui/sortable-header"

interface ColumnsProps {
  onEdit: (consumable: Consumable) => void;
  onDelete: (consumableId: string) => void;
}

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Consumable>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="İsim" />,
  },
  {
    accessorKey: "manufacturer",
    header: ({ column }) => <SortableHeader column={column} title="Üretici" />,
  },
  {
    accessorKey: "partNumber",
    header: ({ column }) => <SortableHeader column={column} title="Parça Numarası" />,
  },
   {
    accessorKey: "barcode",
    header: ({ column }) => <SortableHeader column={column} title="Barkod" />,
  },
  {
    accessorKey: "stock",
    header: ({ column }) => <SortableHeader column={column} title="Stok" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const consumable = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menüyü aç</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Eylemler</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(consumable)}>Düzenle</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(consumable.id)}>Sil</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
