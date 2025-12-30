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
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { Product, Warehouse } from "@/lib/types";

interface StockValuationReportProps {
  products: Product[];
  warehouses: Warehouse[];
  warehouseId?: string;
}

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function StockValuationReport({ products, warehouses, warehouseId }: StockValuationReportProps) {
  const valuationData = useMemo(() => {
    const filteredProducts = warehouseId
      ? products.filter(p => p.stockByLocation && p.stockByLocation[warehouseId] > 0)
      : products;

    // Group by category
    const byCategory: Record<string, { category: string; itemCount: number; quantity: number; value: number }> = {};

    filteredProducts.forEach(product => {
      const category = product.productCategory || "Kategorisiz";
      const stock = warehouseId && product.stockByLocation
        ? product.stockByLocation[warehouseId] || 0
        : product.stock;
      const price = product.price || 0;
      const value = stock * price;

      if (!byCategory[category]) {
        byCategory[category] = {
          category,
          itemCount: 0,
          quantity: 0,
          value: 0,
        };
      }

      byCategory[category].itemCount++;
      byCategory[category].quantity += stock;
      byCategory[category].value += value;
    });

    const categories = Object.values(byCategory).sort((a, b) => b.value - a.value);

    const totalItems = categories.reduce((sum, c) => sum + c.itemCount, 0);
    const totalQuantity = categories.reduce((sum, c) => sum + c.quantity, 0);
    const totalValue = categories.reduce((sum, c) => sum + c.value, 0);

    return {
      categories,
      totalItems,
      totalQuantity,
      totalValue,
    };
  }, [products, warehouseId]);

  const chartData = useMemo(() => {
    return valuationData.categories.slice(0, 6).map((c, i) => ({
      name: c.category,
      value: c.value,
      color: COLORS[i % COLORS.length],
    }));
  }, [valuationData]);

  const formatCurrency = (value: number) => {
    return `₺ ${value.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
  };

  if (valuationData.categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Stok verisi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Toplam Ürün Çeşidi</div>
          <div className="text-2xl font-bold">{valuationData.totalItems}</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Toplam Stok Miktarı</div>
          <div className="text-2xl font-bold">{valuationData.totalQuantity.toLocaleString("tr-TR")}</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Toplam Stok Değeri</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(valuationData.totalValue)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))' 
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Ürün</TableHead>
                <TableHead className="text-right">Adet</TableHead>
                <TableHead className="text-right">Değer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {valuationData.categories.map((category, i) => (
                <TableRow key={category.category}>
                  <TableCell className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    {category.category}
                  </TableCell>
                  <TableCell className="text-right">{category.itemCount}</TableCell>
                  <TableCell className="text-right">{category.quantity.toLocaleString("tr-TR")}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(category.value)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/50">
                <TableCell>Toplam</TableCell>
                <TableCell className="text-right">{valuationData.totalItems}</TableCell>
                <TableCell className="text-right">{valuationData.totalQuantity.toLocaleString("tr-TR")}</TableCell>
                <TableCell className="text-right">{formatCurrency(valuationData.totalValue)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
