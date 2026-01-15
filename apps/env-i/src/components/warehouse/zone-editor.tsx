"use client"

import * as React from "react"
import { WarehouseZone, Warehouse } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { useZoneEditor } from "./hooks/useZoneEditor"
import { ZoneFloorPlan } from "./ZoneFloorPlan"
import { ZonePropertiesPanel } from "./ZonePropertiesPanel"

interface ZoneEditorProps {
  warehouse: Warehouse
  onSave: (zones: WarehouseZone[]) => void
  onCancel: () => void
}

export function ZoneEditor({ warehouse, onSave, onCancel }: ZoneEditorProps) {
  const {
    zones, selectedZoneId, isDragging, isResizing, containerRef,
    addZone, updateZone, deleteZone,
    addStorageUnit, updateStorageUnit, deleteStorageUnit,
    handleMouseDown, setSelectedZoneId,
    constrainZone, zonesOverlap
  } = useZoneEditor(warehouse);

  const selectedZone = zones.find(z => z.id === selectedZoneId) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Floor Plan Preview */}
      <ZoneFloorPlan 
        zones={zones}
        selectedZoneId={selectedZoneId}
        isDragging={isDragging}
        isResizing={isResizing}
        onAddZone={addZone}
        onSelectZone={setSelectedZoneId}
        onMouseDown={handleMouseDown}
        containerRef={containerRef}
      />

      {/* Zone Editor Panel */}
      <ZonePropertiesPanel 
        selectedZone={selectedZone}
        onUpdateZone={updateZone}
        onDeleteZone={deleteZone}
        onAddStorageUnit={addStorageUnit}
        onUpdateStorageUnit={updateStorageUnit}
        onDeleteStorageUnit={deleteStorageUnit}
        constrainZone={constrainZone}
        zonesOverlap={zonesOverlap}
        zones={zones}
      />

      {/* Action Buttons */}
      <div className="lg:col-span-2 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>İptal</Button>
        <Button onClick={() => onSave(zones)}>
          <Save className="h-4 w-4 mr-1" /> Planı Kaydet
        </Button>
      </div>
    </div>
  );
}
