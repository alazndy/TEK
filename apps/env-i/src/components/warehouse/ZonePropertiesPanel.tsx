import React from "react";
import { WarehouseZone, ShelfConfig } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface ZonePropertiesPanelProps {
  selectedZone: WarehouseZone | null;
  onUpdateZone: (id: string, updates: Partial<WarehouseZone>) => void;
  onDeleteZone: (id: string) => void;
  onAddShelf: (id: string) => void;
  onUpdateShelf: (zoneId: string, shelfId: string, updates: Partial<ShelfConfig>) => void;
  onDeleteShelf: (zoneId: string, shelfId: string) => void;
  constrainZone: (zone: WarehouseZone) => WarehouseZone;
  zonesOverlap: (z1: WarehouseZone, z2: WarehouseZone) => boolean;
  zones: WarehouseZone[];
}

export function ZonePropertiesPanel({
  selectedZone, onUpdateZone, onDeleteZone,
  onAddShelf, onUpdateShelf, onDeleteShelf,
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

            {/* Shelves */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-semibold">Raflar</Label>
                <Button size="sm" variant="outline" onClick={() => onAddShelf(selectedZone.id)}>
                  <Plus className="h-3 w-3 mr-1" /> Raf Ekle
                </Button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedZone.shelves.map((shelf) => (
                  <div key={shelf.id} className="flex items-center gap-2 p-2 border rounded bg-muted/20">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Input
                      value={shelf.name}
                      onChange={(e) => onUpdateShelf(selectedZone.id, shelf.id, { name: e.target.value })}
                      className="h-8 flex-1"
                      placeholder="Raf adı"
                    />
                    <Input
                      type="number"
                      value={shelf.rows}
                      onChange={(e) => onUpdateShelf(selectedZone.id, shelf.id, { rows: Number(e.target.value) })}
                      className="h-8 w-16"
                      placeholder="Sıra"
                      min={1} max={10}
                    />
                    <span className="text-xs text-muted-foreground">×</span>
                    <Input
                      type="number"
                      value={shelf.columns}
                      onChange={(e) => onUpdateShelf(selectedZone.id, shelf.id, { columns: Number(e.target.value) })}
                      className="h-8 w-16"
                      placeholder="Kolon"
                      min={1} max={20}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => onDeleteShelf(selectedZone.id, shelf.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
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
