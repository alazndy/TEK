import React, { useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductFormSectionProps } from "./schema";
import { Warehouse } from "@/lib/types";

interface StockSectionProps extends ProductFormSectionProps {
  warehouses: Warehouse[];
}

export function StockSection({ form, warehouses }: StockSectionProps) {
  
  // Logic to update total stock
  const stockByLocation = form.watch("stockByLocation");
  
  useEffect(() => {
    if (stockByLocation) {
        const total = Object.values(stockByLocation).reduce((sum, val) => sum + (Number(val) || 0), 0);
        if (total !== form.getValues("stock")) {
           form.setValue("stock", total);
        }
    }
  }, [stockByLocation, form]);

  return (
    <div className="space-y-4">
      <div className="space-y-2 border rounded-md p-4 bg-muted/20">
          <FormLabel className="font-semibold text-primary">Stok Dağılımı</FormLabel>
           {warehouses.length > 0 ? (
               <div className="grid grid-cols-2 gap-4">
                   {warehouses.map(w => (
                       <FormField
                            key={w.id}
                            control={form.control}
                            name={`stockByLocation.${w.id}`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">{w.name}</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            placeholder="0"
                                            value={field.value ?? 0}
                                            onChange={e => {
                                                field.onChange(e.target.value === '' ? 0 : Number(e.target.value));
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                       />
                   ))}
               </div>
           ) : (
               <div className="text-sm text-yellow-600">
                   Kayıtlı depo bulunamadı. Lütfen ayarlardan depo ekleyin.
               </div>
           )}
           <div className="pt-2 border-t mt-2 flex justify-between items-center">
                <span className="text-sm font-medium">Toplam Stok:</span>
                <div className="font-bold text-lg">{form.watch("stock") || 0}</div>
           </div>
      </div>

       {/* Hidden Stock Input to satisfy schema validation logic if needed explicitly */}
       <FormField
        control={form.control}
        name="stock"
        render={({ field }) => (
          <FormItem className="hidden">
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Minimum Stok</FormLabel>
                <FormControl>
                <Input type="number" placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Barkod</FormLabel>
                <FormControl>
                <Input placeholder="8691234567890" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
            control={form.control}
            name="room"
            render={({ field }) => {
            // Get all zones from all warehouses
            const allZones = warehouses.flatMap(w => 
                (w.zones || []).map(z => ({ 
                warehouseName: w.name,
                warehouseId: w.id,
                zoneName: z.name,
                zoneId: z.id,
                storageUnits: z.storageUnits
                }))
            );
            
            return (
                <FormItem>
                <FormLabel>Bölge (Lokasyon)</FormLabel>
                <Select 
                    onValueChange={(value) => {
                    field.onChange(value);
                    // Reset shelf when zone changes
                    form.setValue('shelf', '');
                    }} 
                    value={field.value || ''}
                >
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Bölge seçin" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {allZones.length > 0 ? (
                        allZones.map((zone) => (
                        <SelectItem key={`${zone.warehouseId}-${zone.zoneId}`} value={zone.zoneName}>
                            {zone.warehouseName} → {zone.zoneName}
                        </SelectItem>
                        ))
                    ) : (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Henüz bölge tanımlı değil. Depo Haritası'ndan bölge ekleyin.
                        </div>
                    )}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            );
            }}
        />
        <FormField
            control={form.control}
            name="shelf"
            render={({ field }) => {
            // Get storage units for selected zone
            const selectedZoneName = form.watch('room');
            const allZones = warehouses.flatMap(w => 
                (w.zones || []).map(z => ({ zoneName: z.name, storageUnits: z.storageUnits }))
            );
            const currentZone = allZones.find(z => z.zoneName === selectedZoneName);
            const storageUnits = currentZone?.storageUnits || [];
            
            return (
                <FormItem>
                <FormLabel>Raf / Ünite</FormLabel>
                <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ''}
                    disabled={!selectedZoneName}
                >
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder={selectedZoneName ? "Raf seçin" : "Önce bölge seçin"} />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {storageUnits.length > 0 ? (
                        storageUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.name}>
                            {unit.name} ({unit.rows} sıra × {unit.columns} kolon)
                        </SelectItem>
                        ))
                    ) : (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        {selectedZoneName ? "Bu bölgede raf yok" : "Önce bölge seçin"}
                        </div>
                    )}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            );
            }}
        />
      </div>
    </div>
  );
}
