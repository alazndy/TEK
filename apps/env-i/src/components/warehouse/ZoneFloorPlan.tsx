import React from "react";
import { WarehouseZone } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Move, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZoneFloorPlanProps {
  zones: WarehouseZone[];
  selectedZoneId: string | null;
  isDragging: boolean;
  isResizing: boolean;
  onAddZone: () => void;
  onSelectZone: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, id: string, action: 'drag' | 'resize') => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function ZoneFloorPlan({
  zones, selectedZoneId, isDragging, isResizing,
  onAddZone, onSelectZone, onMouseDown, containerRef
}: ZoneFloorPlanProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Kat Planı</span>
          <Button size="sm" onClick={onAddZone}>
            <Plus className="h-4 w-4 mr-1" /> Bölge Ekle
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className={cn(
            "relative w-full aspect-[4/3] bg-muted/30 rounded-lg border-2 border-dashed select-none",
            (isDragging || isResizing) && "cursor-grabbing"
          )}
        >
          {/* Grid */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '10% 10%'
            }}
          />
          
          {/* Zones */}
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={cn(
                "absolute rounded border-2 transition-shadow",
                "flex flex-col items-center justify-center text-xs font-medium",
                selectedZoneId === zone.id ? "ring-2 ring-primary ring-offset-2 shadow-lg z-20" : "z-10",
                isDragging && selectedZoneId === zone.id ? "cursor-grabbing" : "cursor-grab"
              )}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
                backgroundColor: `${zone.color}30`,
                borderColor: zone.color,
                color: zone.color
              }}
              onMouseDown={(e) => onMouseDown(e, zone.id, 'drag')}
              onClick={() => onSelectZone(zone.id)}
            >
              {/* Drag handle */}
              <Move className="h-4 w-4 mb-1 opacity-50" />
              <span className="truncate px-1">{zone.name}</span>
              
              {/* Resize handle */}
              <div
                className={cn(
                  "absolute bottom-0 right-0 w-4 h-4 cursor-se-resize",
                  "flex items-center justify-center",
                  "bg-background border rounded-tl hover:bg-muted"
                )}
                style={{ borderColor: zone.color }}
                onMouseDown={(e) => onMouseDown(e, zone.id, 'resize')}
              >
                <Maximize2 className="h-2.5 w-2.5" style={{ color: zone.color }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            Sürükle: taşı • Sağ alt köşe: boyutlandır
          </p>
          <p className="text-xs text-muted-foreground">
            {zones.length} bölge
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
