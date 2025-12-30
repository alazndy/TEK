
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AuditLog } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { SortableHeader } from "@/components/ui/sortable-header"

export const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "action",
    header: ({ column }) => <SortableHeader column={column} title="Eylem" />,
    cell: ({ row }) => {
      const action = row.getValue("action") as string
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"

      if (action.includes("Eklendi")) variant = "default"
      if (action.includes("Güncellendi")) variant = "outline"
      if (action.includes("Silindi")) variant = "destructive"
      if (action.includes("Oluşturuldu")) variant = "default"

      return <Badge variant={variant}>{action}</Badge>
    },
  },
  {
    accessorKey: "details",
    header: ({ column }) => <SortableHeader column={column} title="Detaylar" />,
  },
  {
    accessorKey: "user",
    header: ({ column }) => <SortableHeader column={column} title="Kullanıcı" />,
  },
  {
    accessorKey: "date",
    header: ({ column }) => <SortableHeader column={column} title="Tarih" />,
  },
]
