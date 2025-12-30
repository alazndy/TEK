"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import type { Product } from "@/lib/types";

interface CategoryAnalysisReportProps {
  products: Product[];
  warehouseId?: string;
}

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export function CategoryAnalysisReport({ products, warehouseId }: CategoryAnalysisReportProps) {
  const analysisData = useMemo(() => {
    const filteredProducts = warehouseId
      ? products.filter(p => p.stockByLocation && p.stockByLocation[warehouseId] > 0)
      : products;

    // Group by category
    const byCategory: Record<string, {
      category: string;
      itemCount: number;
      totalStock: number;
      avgStock: number;
      lowStockItems: number;
      outOfStockItems: number;
      totalValue: number;
    }> = {};

    filteredProducts.forEach(product => {
      const category = product.productCategory || "Kategorisiz";
      const stock = warehouseId && product.stockByLocation
        ? product.stockByLocation[warehouseId] || 0
        : product.stock;
      const minStock = product.minStock || 10;
      const price = product.price || 0;

      if (!byCategory[category]) {
        byCategory[category] = {
          category,
          itemCount: 0,
          totalStock: 0,
          avgStock: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          totalValue: 0,
        };
      }

      byCategory[category].itemCount++;
      byCategory[category].totalStock += stock;
      byCategory[category].totalValue += stock * price;

      if (stock === 0) {
        byCategory[category].outOfStockItems++;
      } else if (stock <= minStock) {
        byCategory[category].lowStockItems++;
      }
    });

    // Calculate averages and sort
    const categories = Object.values(byCategory)
      .map(c => ({
        ...c,
        avgStock: c.itemCount > 0 ? Math.round(c.totalStock / c.itemCount) : 0,
      }))
      .sort((a, b) => b.itemCount - a.itemCount);

    const totalItems = categories.reduce((sum, c) => sum + c.itemCount, 0);
    const totalLowStock = categories.reduce((sum, c) => sum + c.lowStockItems, 0);
    const totalOutOfStock = categories.reduce((sum, c) => sum + c.outOfStockItems, 0);

    return {
      categories,
      totalItems,
      totalLowStock,
      totalOutOfStock,
    };
  }, [products, warehouseId]);

  const chartData = useMemo(() => {
    return analysisData.categories.slice(0, 8).map((c, i) => ({
      name: c.category.length > 15 ? c.category.substring(0, 15) + "..." : c.category,
      count: c.itemCount,
      stock: c.totalStock,
      fill: COLORS[i % COLORS.length],
    }));
  }, [analysisData]);

  if (analysisData.categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Analiz edilecek ürün bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Kategori Sayısı</div>
          <div className="text-2xl font-bold">{analysisData.categories.length}</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Toplam Ürün</div>
          <div className="text-2xl font-bold">{analysisData.totalItems}</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Düşük Stok</div>
          <div className="text-2xl font-bold text-orange-500">{analysisData.totalLowStock}</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Stokta Yok</div>
          <div className="text-2xl font-bold text-red-500">{analysisData.totalOutOfStock}</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))' 
              }}
            />
            <Bar dataKey="count" name="Ürün Sayısı" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Ürün Sayısı</TableHead>
              <TableHead className="text-right">Toplam Stok</TableHead>
              <TableHead className="text-right">Ort. Stok</TableHead>
              <TableHead>Stok Durumu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analysisData.categories.map((category, i) => {
              const healthyPercentage = category.itemCount > 0
                ? ((category.itemCount - category.lowStockItems - category.outOfStockItems) / category.itemCount) * 100
                : 0;

              return (
                <TableRow key={category.category}>
                  <TableCell className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="font-medium">{category.category}</span>
                  </TableCell>
                  <TableCell className="text-right">{category.itemCount}</TableCell>
                  <TableCell className="text-right">{category.totalStock.toLocaleString("tr-TR")}</TableCell>
                  <TableCell className="text-right">{category.avgStock}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={healthyPercentage} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-12">
                        {Math.round(healthyPercentage)}%
                      </span>
                    </div>
                    {(category.lowStockItems > 0 || category.outOfStockItems > 0) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {category.outOfStockItems > 0 && (
                          <span className="text-red-500">{category.outOfStockItems} stokta yok</span>
                        )}
                        {category.outOfStockItems > 0 && category.lowStockItems > 0 && " • "}
                        {category.lowStockItems > 0 && (
                          <span className="text-orange-500">{category.lowStockItems} düşük stok</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
