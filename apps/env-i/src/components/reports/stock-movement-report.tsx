"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { Product } from "@/lib/types";
import { DateRange } from "react-day-picker";
import { format, isWithinInterval } from "date-fns";
import { tr } from "date-fns/locale";

interface StockMovementReportProps {
  products: Product[];
  warehouseId?: string;
  dateRange?: DateRange;
}

export function StockMovementReport({ products, warehouseId, dateRange }: StockMovementReportProps) {
  const reportData = useMemo(() => {
    return products
      .filter(p => p.history && p.history.length > 0)
      .map(product => {
        let movements = product.history || [];
        
        // Filter by date range
        if (dateRange?.from && dateRange?.to) {
          movements = movements.filter(m => {
            const moveDate = new Date(m.date);
            return isWithinInterval(moveDate, { start: dateRange.from!, end: dateRange.to! });
          });
        }

        const totalIn = movements
          .filter(m => m.quantityChange > 0)
          .reduce((sum, m) => sum + m.quantityChange, 0);
        
        const totalOut = movements
          .filter(m => m.quantityChange < 0)
          .reduce((sum, m) => sum + Math.abs(m.quantityChange), 0);

        const openingStock = movements.length > 0 
          ? movements[movements.length - 1].newStock - movements[movements.length - 1].quantityChange
          : product.stock;
        
        return {
          productId: product.id,
          productName: product.name,
          barcode: product.barcode,
          movements,
          openingStock,
          closingStock: product.stock,
          totalIn,
          totalOut,
          netChange: totalIn - totalOut,
        };
      })
      .filter(p => p.movements.length > 0)
      .sort((a, b) => b.movements.length - a.movements.length);
  }, [products, warehouseId, dateRange]);

  const totals = useMemo(() => {
    return reportData.reduce(
      (acc, item) => ({
        totalIn: acc.totalIn + item.totalIn,
        totalOut: acc.totalOut + item.totalOut,
        movementCount: acc.movementCount + item.movements.length,
      }),
      { totalIn: 0, totalOut: 0, movementCount: 0 }
    );
  }, [reportData]);

  if (reportData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Seçilen dönemde stok hareketi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Toplam Giriş</div>
          <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
            <ArrowUp className="h-5 w-5" />
            {totals.totalIn}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Toplam Çıkış</div>
          <div className="text-2xl font-bold text-red-600 flex items-center gap-1">
            <ArrowDown className="h-5 w-5" />
            {totals.totalOut}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Net Değişim</div>
          <div className={`text-2xl font-bold ${totals.totalIn - totals.totalOut >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totals.totalIn - totals.totalOut >= 0 ? '+' : ''}{totals.totalIn - totals.totalOut}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Hareket Sayısı</div>
          <div className="text-2xl font-bold">{totals.movementCount}</div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ürün</TableHead>
              <TableHead className="text-center">Açılış Stok</TableHead>
              <TableHead className="text-center">Giriş</TableHead>
              <TableHead className="text-center">Çıkış</TableHead>
              <TableHead className="text-center">Kapanış Stok</TableHead>
              <TableHead className="text-center">Net Değişim</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map(item => (
              <TableRow key={item.productId}>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-xs text-muted-foreground">{item.barcode}</div>
                  </div>
                </TableCell>
                <TableCell className="text-center">{item.openingStock}</TableCell>
                <TableCell className="text-center">
                  {item.totalIn > 0 ? (
                    <span className="text-green-600 font-medium">+{item.totalIn}</span>
                  ) : (
                    <Minus className="h-4 w-4 mx-auto text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.totalOut > 0 ? (
                    <span className="text-red-600 font-medium">-{item.totalOut}</span>
                  ) : (
                    <Minus className="h-4 w-4 mx-auto text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell className="text-center font-medium">{item.closingStock}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={item.netChange >= 0 ? "default" : "destructive"}>
                    {item.netChange >= 0 ? '+' : ''}{item.netChange}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
