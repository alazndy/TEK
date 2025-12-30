
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Book, FileArchive, Trash2, Pencil, AlertTriangle, Layers } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SortableHeader } from "@/components/ui/sortable-header"
import { PriceCell } from "@/components/ui/price-cell"

type ColumnsConfig = {
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onPrintLabel?: (product: Product) => void;
}

import { Checkbox } from "@/components/ui/checkbox"

export const columns = ({ onView, onEdit, onDelete, onPrintLabel }: ColumnsConfig): ColumnDef<Product>[] => {
  
  const baseColumns: ColumnDef<Product>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Tümünü seç"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Satırı seç"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title="Ürün Adı" />,
      cell: ({ row }) => {
        const product = row.original;
        return (
            <div className="flex items-center gap-2">
                <Button variant="link" className="p-0 h-auto font-medium" onClick={() => onView?.(product)}>
                    {product.name}
                </Button>
                {product.isFaulty && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Arızalı Ürün</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                {product.weaveFileUrl && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Layers className="h-4 w-4 text-blue-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Weave Tasarımı Mevcut</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        )
      },
    },
    {
      accessorKey: "manufacturer",
      header: ({ column }) => <SortableHeader column={column} title="Üretici" />,
      cell: ({ row }) => <div className="hidden md:block">{row.getValue("manufacturer")}</div>,
    },
    {
      accessorKey: "category",
      header: ({ column }) => <SortableHeader column={column} title="Kategori" />,
      cell: ({ row }) => {
          const category: string = row.getValue("category");
          let variant: "default" | "secondary" | "outline" = "secondary";
          if (category === "Demirbaş") variant = "default";
          if (category === "Sarf Malzeme") variant = "outline";
          return <Badge variant={variant} className="whitespace-nowrap">{category}</Badge>
      }
    },
    {
      accessorKey: "productCategory",
      header: ({ column }) => <SortableHeader column={column} title="Ürün Tipi" />,
      cell: ({ row }) => {
          const type: string = row.getValue("productCategory") || "Diğer";
          return <Badge variant="outline" className="whitespace-nowrap bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 dark:border-blue-500/20">{type}</Badge>
      }
    },
    {
      accessorKey: "stock",
      header: ({ column }) => <SortableHeader column={column} title="Stok" />,
      cell: ({ row }) => {
          const stock: number = row.getValue("stock");
          const minStock: number = row.original.minStock ?? 0;
          
          let variant: "secondary" | "destructive" = "secondary";
          let className = "";

          if (stock === 0) {
            variant = "destructive";
          } else if (stock <= minStock) {
            className = "bg-amber-500 text-amber-900 hover:bg-amber-500/80";
          } else {
            className = "bg-green-500 text-green-900 hover:bg-green-500/80";
          }
  
          return <Badge variant={variant} className={className}>{stock} adet</Badge>;
      }
    },
    {
      accessorKey: "price",
      header: ({ column }) => <div className="text-right hidden md:block"><SortableHeader column={column} title="Fiyat" /></div>,
      cell: ({ row }) => {
        const amount = row.getValue("price") as number | undefined;
        const currency = row.original.priceCurrency || 'TRY';
        // PriceCell handles currency conversion based on selected currency
        return (
          <div className="text-right hidden md:block">
            <PriceCell price={amount} sourceCurrency={currency} />
          </div>
        );
      },
    },
    {
      accessorKey: "location",
      header: ({ column }) => <div className="hidden lg:block"><SortableHeader column={column} title="Konum" /></div>,
      cell: ({ row }) => {
          return <div className="hidden lg:block">{`${row.original.room} / ${row.original.shelf}`}</div>
      }
    },
  ];

  if (onEdit || onDelete || onPrintLabel) {
    baseColumns.push({
      id: "actions",
      cell: ({ row }) => {
        const product = row.original
   
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
              {onView && (
                 <DropdownMenuItem onClick={() => onView(product)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Görüntüle / Düzenle
                </DropdownMenuItem>
              )}
               {onPrintLabel && (
                <DropdownMenuItem onClick={() => onPrintLabel(product)}>
                  <MoreHorizontal className="mr-2 h-4 w-4" /> {/* Printer Icon ideally */}
                  Etiket Yazdır
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Hızlı Düzenle
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {product.guideUrl && (
                <DropdownMenuItem onClick={() => window.open(product.guideUrl, '_blank')}>
                  <Book className="mr-2 h-4 w-4" />
                  Kılavuzu Görüntüle
                </DropdownMenuItem>
              )}
               {product.brochureUrl && (
                <DropdownMenuItem onClick={() => window.open(product.brochureUrl, '_blank')}>
                  <FileArchive className="mr-2 h-4 w-4" />
                  Broşürü Görüntüle
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() => onDelete(product.id)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                    </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    });
  }

  return baseColumns;
}
