"use client"

import React, { useState, useEffect } from "react";
import { useDataStore } from "@/stores/data-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, Warehouse as WarehouseIcon, Truck, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function WarehouseManager() {
  const warehouses = useDataStore((state) => state.warehouses);
  const fetchWarehouses = useDataStore((state) => state.fetchWarehouses);
  const addWarehouse = useDataStore((state) => state.addWarehouse);
  const deleteWarehouse = useDataStore((state) => state.deleteWarehouse);
  const migrateToDefaultWarehouse = useDataStore((state) => state.migrateToDefaultWarehouse);
  const loadingWarehouses = useDataStore((state) => state.loadingWarehouses);

  const [newWarehouseName, setNewWarehouseName] = useState("");
  const [newWarehouseType, setNewWarehouseType] = useState<"Depo" | "Mağaza" | "Araç" | "Diğer">("Depo");
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleAddWarehouse = async () => {
    if (!newWarehouseName.trim()) return;
    await addWarehouse({
      name: newWarehouseName,
      type: newWarehouseType,
      isDefault: false,
    });
    setNewWarehouseName("");
  };

  const handleMigrate = async () => {
      setIsMigrating(true);
      await migrateToDefaultWarehouse();
      setIsMigrating(false);
  }

  const getIcon = (type: string) => {
      switch (type) {
          case 'Depo': return <WarehouseIcon className="h-4 w-4" />;
          case 'Mağaza': return <Store className="h-4 w-4" />;
          case 'Araç': return <Truck className="h-4 w-4" />;
          default: return <WarehouseIcon className="h-4 w-4" />;
      }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Depo ve Lokasyon Yönetimi</CardTitle>
          <CardDescription>
            Stok takibi yapılacak depoları, mağazaları ve araçları buradan yönetebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end mb-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="name">Lokasyon Adı</Label>
              <Input
                id="name"
                placeholder="Örn: Merkez Depo, 34 ABC 123 Araç..."
                value={newWarehouseName}
                onChange={(e) => setNewWarehouseName(e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-[200px] items-center gap-1.5">
              <Label htmlFor="type">Tür</Label>
              <Select
                value={newWarehouseType}
                onValueChange={(val: any) => setNewWarehouseType(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tür Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Depo">Depo</SelectItem>
                  <SelectItem value="Mağaza">Mağaza</SelectItem>
                  <SelectItem value="Araç">Araç</SelectItem>
                  <SelectItem value="Diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddWarehouse} disabled={!newWarehouseName.trim()}>
              <Plus className="mr-2 h-4 w-4" /> Ekle
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                        {getIcon(warehouse.type)}
                        {warehouse.name}
                    </TableCell>
                    <TableCell>{warehouse.type}</TableCell>
                    <TableCell>
                      {warehouse.isDefault && (
                        <Badge variant="secondary">Varsayılan</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!warehouse.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteWarehouse(warehouse.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {warehouses.length === 0 && !loadingWarehouses && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            Henüz kayıtlı depo bulunmuyor.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
             <div className="text-sm text-muted-foreground">
                 Toplam {warehouses.length} lokasyon
             </div>
             {warehouses.length > 0 && (
                 <Button variant="outline" size="sm" onClick={handleMigrate} disabled={isMigrating || loadingWarehouses}>
                     {isMigrating ? "İşleniyor..." : "Veri Göçünü Başlat (Varsayılan Depoya)"}
                 </Button>
             )}
        </CardFooter>
      </Card>
      
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Dikkat</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Veri göçü işlemi, stoğu herhangi bir depoya atanmamış tüm ürünleri "Merkez Depo"ya (veya ilk bulunan varsayılan depoya) atar. 
                Bu işlem geri alınamaz, ancak daha sonra manuel olarak stokları transfer edebilirsiniz.
            </p>
        </div>
    </div>
  );
}
