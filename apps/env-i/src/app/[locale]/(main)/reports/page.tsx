"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Calendar, Filter, TrendingUp, Package, DollarSign, BarChart3 } from "lucide-react";
import { useDataStore } from "@/stores/data-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { StockMovementReport } from "@/components/reports/stock-movement-report";
import { StockValuationReport } from "@/components/reports/stock-valuation-report";
import { CategoryAnalysisReport } from "@/components/reports/category-analysis-report";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { tr } from "date-fns/locale";
import { DateRange } from "react-day-picker";

export default function ReportsPage() {
  const { products, warehouses, fetchProducts, fetchWarehouses } = useDataStore();
  const [activeReport, setActiveReport] = useState("stock-movement");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  useEffect(() => {
    fetchProducts(true);
    fetchWarehouses();
  }, [fetchProducts, fetchWarehouses]);

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Envanter Raporu", 14, 22);
      doc.setFontSize(11);
      doc.text(`Tarih: ${format(new Date(), "d MMMM yyyy HH:mm", { locale: tr })}`, 14, 30);
      
      const tableColumn = ["Ürün Adı", "Kategori", "Marka", "Stok", "Birim"];
      const tableRows = products.map(product => [
        product.name,
        product.category,
        product.manufacturer,
        product.stock,
        "Adet"
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
      });

      doc.save(`envanter-raporu-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      
      const data = products.map(product => ({
        "Ürün Adı": product.name,
        "Kategori": product.category,
        "Marka": product.manufacturer,
        "Barkod": product.barcode,
        "Stok": product.stock,
        "Raf": product.shelf,
        "Fiyat": product.price,
        "Para Birimi": product.priceCurrency
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Envanter");
      
      XLSX.writeFile(workbook, `envanter-raporu-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    } catch (error) {
      console.error("Excel export failed:", error);
    }
  };

  const reportCards = [
    {
      id: "stock-movement",
      title: "Stok Hareketleri",
      description: "Ürün giriş-çıkış hareketlerini görüntüleyin",
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      id: "stock-valuation",
      title: "Stok Değerleme",
      description: "Depo bazlı stok değerini hesaplayın",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      id: "category-analysis",
      title: "Kategori Analizi",
      description: "Kategorilere göre dağılım analizi",
      icon: BarChart3,
      color: "text-purple-500",
    },
  ];

  return (
    <PageWrapper
      title="Raporlar"
      description="Envanter raporlarını görüntüleyin ve dışa aktarın"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Depo seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Depolar</SelectItem>
                {warehouses.map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "d MMM", { locale: tr })} -{" "}
                        {format(dateRange.to, "d MMM yyyy", { locale: tr })}
                      </>
                    ) : (
                      format(dateRange.from, "d MMMM yyyy", { locale: tr })
                    )
                  ) : (
                    <span>Tarih aralığı seçin</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => range && setDateRange(range)}
                  numberOfMonths={2}
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Report Selection Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {reportCards.map(report => (
            <Card
              key={report.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeReport === report.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setActiveReport(report.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <report.icon className={`h-5 w-5 ${report.color}`} />
                  <CardTitle className="text-base">{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{report.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Content */}
        <Card>
          <CardContent className="pt-6">
            {activeReport === "stock-movement" && (
              <StockMovementReport
                products={products}
                warehouseId={selectedWarehouse === "all" ? undefined : selectedWarehouse}
                dateRange={dateRange}
              />
            )}
            {activeReport === "stock-valuation" && (
              <StockValuationReport
                products={products}
                warehouses={warehouses}
                warehouseId={selectedWarehouse === "all" ? undefined : selectedWarehouse}
              />
            )}
            {activeReport === "category-analysis" && (
              <CategoryAnalysisReport
                products={products}
                warehouseId={selectedWarehouse === "all" ? undefined : selectedWarehouse}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}