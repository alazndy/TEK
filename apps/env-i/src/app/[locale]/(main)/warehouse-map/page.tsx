"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useDataStore } from "@/stores/data-store"
import { WarehouseZone, Warehouse } from "@/lib/types"
import { WarehouseFloorPlan } from "@/components/warehouse/warehouse-floor-plan"
import { ShelfView } from "@/components/warehouse/shelf-view"
import { ZoneEditor } from "@/components/warehouse/zone-editor"
import { ViewModeToggle, ViewMode } from "@/components/warehouse/view-mode-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Map, Settings, Package, ChevronLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Dynamic import for 3D view to avoid SSR issues with Three.js
const Warehouse3DView = dynamic(
  () => import("@/components/warehouse/warehouse-3d-view").then(mod => ({ default: mod.Warehouse3DView })),
  { ssr: false, loading: () => <div className="h-[500px] flex items-center justify-center bg-muted/30 rounded-lg">3D Yükleniyor...</div> }
)

export default function WarehouseMapPage() {
  const { warehouses, fetchWarehouses, products, updateWarehouse } = useDataStore();
  const { toast } = useToast();
  const [selectedWarehouseId, setSelectedWarehouseId] = React.useState<string>("");
  const [selectedZone, setSelectedZone] = React.useState<WarehouseZone | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>('topdown');
  const [highlightedProductId, setHighlightedProductId] = React.useState<string | null>(null);

  // Read URL query params for zone highlighting
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const zoneParam = params.get('zone');
    const productParam = params.get('product');
    
    if (zoneParam) {
      // Find warehouse and zone matching the zone name
      for (const warehouse of warehouses) {
        const zone = warehouse.zones?.find(z => z.name === zoneParam);
        if (zone) {
          setSelectedWarehouseId(warehouse.id);
          setSelectedZone(zone);
          if (productParam) {
            setHighlightedProductId(productParam);
          }
          // Clear URL params after processing
          window.history.replaceState({}, '', window.location.pathname);
          toast({
            title: "Ürün konumu",
            description: `${zoneParam} bölgesinde gösteriliyor`,
          });
          break;
        }
      }
    }
  }, [warehouses, toast]);

  React.useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // Auto-select first warehouse
  React.useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0].id);
    }
  }, [warehouses, selectedWarehouseId]);

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);

  // Calculate product counts per zone
  const productCounts = React.useMemo(() => {
    if (!selectedWarehouse?.zones) return {};
    
    const counts: Record<string, number> = {};
    selectedWarehouse.zones.forEach(zone => {
      counts[zone.id] = products.filter(p => p.room === zone.name).length;
    });
    return counts;
  }, [selectedWarehouse, products]);

  // Products in selected zone
  const zoneProducts = React.useMemo(() => {
    if (!selectedZone) return [];
    return products.filter(p => p.room === selectedZone.name);
  }, [selectedZone, products]);

  const handleSaveZones = async (zones: WarehouseZone[]) => {
    if (!selectedWarehouse) return;
    
    try {
      await updateWarehouse(selectedWarehouse.id, { zones });
      toast({ title: "Başarılı", description: "Depo planı kaydedildi!" });
      setIsEditing(false);
    } catch (error) {
      toast({ title: "Hata", description: "Plan kaydedilemedi", variant: "destructive" });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {selectedZone && !isEditing && (
            <Button variant="ghost" size="icon" onClick={() => setSelectedZone(null)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Map className="h-8 w-8" />
              {selectedZone ? selectedZone.name : "Depo Haritası"}
            </h2>
            <p className="text-muted-foreground">
              {selectedZone ? "Raf görünümü - ürünleri görmek için tıklayın" : "Depo planını görüntüle ve düzenle"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          {!isEditing && !selectedZone && selectedWarehouse && (
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          )}

          {/* Warehouse Selector */}
          <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Depo seçin" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map(w => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!isEditing && !selectedZone && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Planı Düzenle
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!selectedWarehouse ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Depo Seçin</h3>
            <p className="text-muted-foreground mt-1">
              Yukarıdaki listeden bir depo seçin veya ayarlardan yeni depo ekleyin.
            </p>
          </CardContent>
        </Card>
      ) : isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedWarehouse.name} - Plan Düzenleyici</CardTitle>
            <CardDescription>
              Bölgeleri ekleyin, konumlandırın ve raf yapısını tanımlayın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ZoneEditor
              warehouse={selectedWarehouse}
              onSave={handleSaveZones}
              onCancel={() => setIsEditing(false)}
            />
          </CardContent>
        </Card>
      ) : selectedZone ? (
        <Card>
          <CardContent className="pt-6">
            <ShelfView
              zone={selectedZone}
              products={zoneProducts}
              onBack={() => setSelectedZone(null)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Floor Plan / 3D View - Large */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{selectedWarehouse.name}</CardTitle>
              <CardDescription>
                {viewMode === '3d' 
                  ? 'Sol tık döndür, scroll zoom, sağ tık kaydır' 
                  : 'Bölgeye tıklayarak raf detaylarını görüntüleyin'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewMode === '3d' ? (
                <Warehouse3DView
                  warehouse={selectedWarehouse}
                  onZoneClick={setSelectedZone}
                  productCounts={productCounts}
                />
              ) : (
                <WarehouseFloorPlan
                  warehouse={selectedWarehouse}
                  onZoneClick={setSelectedZone}
                  productCounts={productCounts}
                  viewMode={viewMode}
                />
              )}
            </CardContent>
          </Card>

          {/* Stats Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Özet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Toplam Bölge</span>
                  <span className="font-bold">{selectedWarehouse.zones?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Toplam Ünite</span>
                  <span className="font-bold">
                    {selectedWarehouse.zones?.reduce((sum, z) => sum + (z.storageUnits?.length || 0), 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ürün Sayısı</span>
                  <span className="font-bold">
                    {products.filter(p => 
                      selectedWarehouse.zones?.some(z => z.name === p.room)
                    ).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Bölgeler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedWarehouse.zones?.map(zone => (
                    <button
                      key={zone.id}
                      className="w-full flex items-center justify-between p-2 rounded hover:bg-muted transition-colors"
                      onClick={() => setSelectedZone(zone)}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: zone.color }}
                        />
                        <span className="text-sm">{zone.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {productCounts[zone.id] || 0} ürün
                      </span>
                    </button>
                  ))}
                  {(!selectedWarehouse.zones || selectedWarehouse.zones.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Henüz bölge tanımlı değil
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
