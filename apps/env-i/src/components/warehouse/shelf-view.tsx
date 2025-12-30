"use client"

import * as React from "react"
import { WarehouseZone, ShelfConfig, Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Package, ChevronLeft, Box } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ShelfViewProps {
  zone: WarehouseZone
  shelfIndex?: number
  onBack?: () => void
  products?: Product[]  // Products in this zone
}

export function ShelfView({ zone, shelfIndex = 0, onBack, products = [] }: ShelfViewProps) {
  const [activeShelfIndex, setActiveShelfIndex] = React.useState(shelfIndex);
  const shelf = zone.shelves[activeShelfIndex];

  if (!shelf) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/20">
        <Package className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Bu bölgede raf tanımlı değil</p>
      </div>
    );
  }

  // Get products for this specific shelf
  const shelfProducts = products.filter(p => p.shelf === shelf.name);
  
  // Create grid for shelf - fill positions with products in order
  const rows = Array.from({ length: shelf.rows }, (_, i) => shelf.rows - i); // Top to bottom (10, 9, 8...)
  const cols = Array.from({ length: shelf.columns }, (_, i) => i + 1);
  
  // Distribute products across grid positions
  const productGrid: Record<string, Product> = {};
  shelfProducts.forEach((product, index) => {
    if (index < shelf.rows * shelf.columns) {
      const row = shelf.rows - Math.floor(index / shelf.columns);
      const col = (index % shelf.columns) + 1;
      productGrid[`${row}-${col}`] = product;
    }
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h3 className="text-lg font-semibold">{zone.name}</h3>
            <p className="text-sm text-muted-foreground">Karşıdan Görünüm • {shelfProducts.length} ürün</p>
          </div>
        </div>
        
        {/* Shelf selector tabs */}
        {zone.shelves.length > 1 && (
          <div className="flex gap-1">
            {zone.shelves.map((s, i) => {
              const count = products.filter(p => p.shelf === s.name).length;
              return (
                <Button
                  key={s.id}
                  variant={i === activeShelfIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveShelfIndex(i)}
                  className="relative"
                >
                  {s.name}
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Shelf Grid */}
      <div className="border-2 rounded-lg p-4 bg-gradient-to-b from-muted/50 to-muted/20">
        <div className="text-center mb-3 font-semibold">{shelf.name}</div>
        
        <div className="grid gap-1" style={{ 
          gridTemplateColumns: `auto repeat(${shelf.columns}, 1fr)`,
          gridTemplateRows: `repeat(${shelf.rows}, minmax(56px, 1fr))`
        }}>
          {rows.map((rowNum) => (
            <React.Fragment key={rowNum}>
              {/* Row label */}
              <div className="flex items-center justify-center text-xs font-medium text-muted-foreground w-8">
                {rowNum}
              </div>
              
              {/* Cells in this row */}
              {cols.map((colNum) => {
                const product = productGrid[`${rowNum}-${colNum}`];
                const hasProduct = !!product;
                
                return (
                  <TooltipProvider key={`${rowNum}-${colNum}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "border rounded-md flex flex-col items-center justify-center p-1 min-h-[56px] transition-all",
                            hasProduct 
                              ? "bg-primary/20 border-primary hover:bg-primary/30 cursor-pointer" 
                              : "bg-muted/30 border-dashed hover:bg-muted/50"
                          )}
                        >
                          {hasProduct ? (
                            <div className="text-center w-full overflow-hidden">
                              <Box className="h-4 w-4 mx-auto text-primary mb-0.5" />
                              <span className="text-[10px] line-clamp-2 leading-tight px-0.5">
                                {product?.name}
                              </span>
                              <Badge variant="secondary" className="mt-0.5 h-4 text-[9px] px-1">
                                {product?.stock || 0}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">
                              {rowNum}-{colNum}
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        {hasProduct ? (
                          <div className="space-y-1">
                            <div className="font-semibold">{product?.name}</div>
                            <div className="text-xs text-muted-foreground">{product?.manufacturer}</div>
                            <div className="flex gap-2 text-xs">
                              <span>Stok: <strong>{product?.stock}</strong></span>
                              {product?.price && (
                                <span>Fiyat: <strong>₺{product?.price}</strong></span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">Barkod: {product?.barcode}</div>
                          </div>
                        ) : (
                          <span>Boş konum (Sıra {rowNum}, Sütun {colNum})</span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </React.Fragment>
          ))}
          
          {/* Column labels at bottom */}
          <div></div> {/* Empty corner */}
          {cols.map((colNum) => (
            <div key={colNum} className="text-center text-xs font-medium text-muted-foreground">
              {colNum}
            </div>
          ))}
        </div>
      </div>

      {/* Product List */}
      {shelfProducts.length > 0 && (
        <div className="border rounded-lg p-3">
          <div className="text-sm font-medium mb-2">Bu raftaki ürünler ({shelfProducts.length})</div>
          <ScrollArea className="max-h-40">
            <div className="space-y-1">
              {shelfProducts.map(product => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.manufacturer}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">{product.stock} adet</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <Badge variant="outline">
          {shelf.rows} sıra × {shelf.columns} kolon
        </Badge>
        <Badge variant="secondary">
          {shelfProducts.length} / {shelf.rows * shelf.columns} dolu
        </Badge>
      </div>
    </div>
  );
}
