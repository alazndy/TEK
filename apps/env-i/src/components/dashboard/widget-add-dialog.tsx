import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Package, PackageX, Truck, BarChart2, PieChart, Clock, List, LayoutGrid, Layers, ShoppingBag, BarChart } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { WidgetType, WidgetCategory } from "@/lib/types";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function WidgetAddDialog() {
  const { addWidget, widgets } = useDashboardStore();
  const t = useTranslations('Dashboard');

  const availableWidgets: { type: WidgetType; title: string, icon: any, description: string, category: WidgetCategory }[] = [
    // General
    { type: 'stat-inventory-value', title: t('totalInventoryValue'), icon: DollarSign, description: 'Toplam envanter maliyeti', category: 'general' },
    { type: 'stat-product-types', title: t('totalProductTypes'), icon: Package, description: 'Kayıtlı ürün sayısı', category: 'general' },
    
    // Inventory
    { type: 'stat-low-stock', title: t('lowStockProducts'), icon: PackageX, description: 'Kritik seviyedeki ürünler', category: 'inventory' },
    { type: 'list-low-stock', title: t('lowStockItems'), icon: PackageX, description: 'Kritik ürün listesi', category: 'inventory' },
    { type: 'stat-warehouse-count', title: t('totalWarehouses'), icon: LayoutGrid, description: 'Kayıtlı depo sayısı', category: 'inventory' },
    { type: 'list-recent-orders', title: t('recentProducts'), icon: Plus, description: 'Son eklenen ürünler', category: 'inventory' },

    // Commercial
    { type: 'stat-pending-orders', title: t('pendingOrders'), icon: Truck, description: 'Onay bekleyen siparişler', category: 'commercial' },
    { type: 'stat-total-proposals', title: t('totalProposals'), icon: Plus, description: 'Toplam teklif sayısı', category: 'commercial' },
    { type: 'chart-order-status', title: t('orderStatuses'), icon: PieChart, description: 'Sipariş durum dağılımı', category: 'commercial' },

    // Analysis
    { type: 'chart-sales-trend', title: t('salesTrends'), icon: BarChart2, description: 'Aylık satış performansı', category: 'analysis' },
    { type: 'chart-category-dist', title: t('categoryDistribution'), icon: PieChart, description: 'Kategorilere göre stok dağılımı', category: 'analysis' },
    { type: 'list-recent-activities', title: t('recentActivities'), icon: Clock, description: 'Son işlem geçmişi', category: 'analysis' },
  ];

  const categories: { id: WidgetCategory; label: string; icon: any }[] = [
    { id: 'general', label: 'Genel', icon: LayoutGrid },
    { id: 'inventory', label: 'Envanter', icon: Layers },
    { id: 'commercial', label: 'Ticari', icon: ShoppingBag },
    { id: 'analysis', label: 'Analiz', icon: BarChart },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-dashed border-white/10 hover:bg-white/5 gap-2">
          <Plus className="h-4 w-4" />
          Widget Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Widget Ekle</DialogTitle>
          <DialogDescription>
            Dashboard'unuza yeni veri kartları veya grafikler ekleyin.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                <cat.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {availableWidgets
                .filter(w => w.category === cat.id && !widgets.some(ex => ex.type === w.type))
                .map((widget) => (
                  <Button
                    key={widget.type}
                    variant="ghost"
                    className="h-auto flex flex-col items-start gap-2 p-4 border border-white/5 hover:bg-white/5 hover:border-emerald-500/50 text-left transition-all"
                    onClick={() => addWidget(widget.type, widget.title, widget.category)}
                  >
                    <div className="flex items-center gap-2 text-emerald-400">
                      <widget.icon className="h-5 w-5" />
                      <span className="font-semibold">{widget.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{widget.description}</span>
                  </Button>
                ))
              }
              {availableWidgets.filter(w => w.category === cat.id && !widgets.some(ex => ex.type === w.type)).length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  Bu kategorideki tüm widget'lar zaten ekli.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
