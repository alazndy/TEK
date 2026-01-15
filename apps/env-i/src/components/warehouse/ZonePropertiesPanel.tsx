import React from "react";
import { WarehouseZone, StorageUnit } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Box } from "lucide-react";

interface ZonePropertiesPanelProps {
  selectedZone: WarehouseZone | null;
  onUpdateZone: (id: string, updates: Partial<WarehouseZone>) => void;
  onDeleteZone: (id: string) => void;
  onAddStorageUnit: (id: string) => void;
  onUpdateStorageUnit: (zoneId: string, unitId: string, updates: Partial<StorageUnit>) => void;
  onDeleteStorageUnit: (zoneId: string, unitId: string) => void;
  constrainZone: (zone: WarehouseZone) => WarehouseZone;
  zonesOverlap: (z1: WarehouseZone, z2: WarehouseZone) => boolean;
  zones: WarehouseZone[];
}

export function ZonePropertiesPanel({
  selectedZone, onUpdateZone, onDeleteZone,
  onAddStorageUnit, onUpdateStorageUnit, onDeleteStorageUnit,
  constrainZone, zonesOverlap, zones
}: ZonePropertiesPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedZone ? `${selectedZone.name} Düzenle` : "Bölge Seçin"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedZone ? (
          <div className="space-y-4">
            {/* Zone Properties */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>İsim</Label>
                <Input
                  value={selectedZone.name}
                  onChange={(e) => onUpdateZone(selectedZone.id, { name: e.target.value })}
                />
              </div>
              <div>
                <Label>Renk</Label>
                <Input
                  type="color"
                  value={selectedZone.color}
                  onChange={(e) => onUpdateZone(selectedZone.id, { color: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label className="text-xs">X (%)</Label>
                <Input
                  type="number"
                  value={Math.round(selectedZone.x)}
                  onChange={(e) => {
                    const newZone = constrainZone({ ...selectedZone, x: Number(e.target.value) });
                    const hasOverlap = zones.filter(z => z.id !== selectedZone.id).some(z => zonesOverlap(newZone, z));
                    if (!hasOverlap) onUpdateZone(selectedZone.id, { x: newZone.x });
                  }}
                  min={0} max={100}
                />
              </div>
              <div>
                <Label className="text-xs">Y (%)</Label>
                <Input
                  type="number"
                  value={Math.round(selectedZone.y)}
                  onChange={(e) => {
                    const newZone = constrainZone({ ...selectedZone, y: Number(e.target.value) });
                    const hasOverlap = zones.filter(z => z.id !== selectedZone.id).some(z => zonesOverlap(newZone, z));
                    if (!hasOverlap) onUpdateZone(selectedZone.id, { y: newZone.y });
                  }}
                  min={0} max={100}
                />
              </div>
              <div>
                <Label className="text-xs">Genişlik</Label>
                <Input
                  type="number"
                  value={Math.round(selectedZone.width)}
                  onChange={(e) => {
                    const newZone = constrainZone({ ...selectedZone, width: Number(e.target.value) });
                    const hasOverlap = zones.filter(z => z.id !== selectedZone.id).some(z => zonesOverlap(newZone, z));
                    if (!hasOverlap) onUpdateZone(selectedZone.id, { width: newZone.width });
                  }}
                  min={5} max={100}
                />
              </div>
              <div>
                <Label className="text-xs">Yükseklik</Label>
                <Input
                  type="number"
                  value={Math.round(selectedZone.height)}
                  onChange={(e) => {
                    const newZone = constrainZone({ ...selectedZone, height: Number(e.target.value) });
                    const hasOverlap = zones.filter(z => z.id !== selectedZone.id).some(z => zonesOverlap(newZone, z));
                    if (!hasOverlap) onUpdateZone(selectedZone.id, { height: newZone.height });
                  }}
                  min={5} max={100}
                />
              </div>
            </div>

            {/* Storage Units */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-semibold flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  Depolama Üniteleri
                </Label>
                <Button size="sm" variant="outline" onClick={() => onAddStorageUnit(selectedZone.id)}>
                  <Plus className="h-3 w-3 mr-1" /> Ünite Ekle
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedZone.storageUnits.map((unit) => (
                  <div key={unit.id} className="p-3 border rounded bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Input
                        value={unit.name}
                        onChange={(e) => onUpdateStorageUnit(selectedZone.id, unit.id, { name: e.target.value })}
                        className="h-8 flex-1"
                        placeholder="Ünite adı"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onDeleteStorageUnit(selectedZone.id, unit.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 pl-6">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Dikey (Raf)</Label>
                        <Input
                          type="number"
                          value={unit.rows}
                          onChange={(e) => onUpdateStorageUnit(selectedZone.id, unit.id, { rows: Number(e.target.value) })}
                          className="h-8"
                          min={1} max={10}
                        />
                      </div>
                      <span className="text-muted-foreground mt-4">×</span>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Yatay (Bölme)</Label>
                        <Input
                          type="number"
                          value={unit.columns}
                          onChange={(e) => onUpdateStorageUnit(selectedZone.id, unit.id, { columns: Number(e.target.value) })}
                          className="h-8"
                          min={1} max={12}
                        />
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground pl-6">
                      Toplam {unit.rows * unit.columns} bölme
                    </div>
                  </div>
                ))}
                
                {selectedZone.storageUnits.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Henüz ünite eklenmedi
                  </p>
                )}
              </div>
            </div>

            {/* Delete Zone */}
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => onDeleteZone(selectedZone.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Bölgeyi Sil
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Düzenlemek için sol taraftaki kat planından bir bölge seçin veya yeni bölge ekleyin.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
