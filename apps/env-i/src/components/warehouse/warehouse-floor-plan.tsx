"use client"

import * as React from "react"
import { WarehouseZone, Warehouse } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Package } from "lucide-react"

interface WarehouseFloorPlanProps {
  warehouse: Warehouse
  onZoneClick?: (zone: WarehouseZone) => void
  selectedZoneId?: string
  productCounts?: Record<string, number> // zoneId -> product count
}

// Default colors for zones
const ZONE_COLORS = [
  "hsl(142, 76%, 36%)",   // Green
  "hsl(217, 91%, 60%)",   // Blue
  "hsl(47, 96%, 53%)",    // Yellow
  "hsl(262, 83%, 58%)",   // Purple
  "hsl(12, 76%, 61%)",    // Orange
  "hsl(173, 80%, 40%)",   // Teal
  "hsl(330, 81%, 60%)",   // Pink
  "hsl(199, 89%, 48%)",   // Sky
];

export function WarehouseFloorPlan({
  warehouse,
  onZoneClick,
  selectedZoneId,
  productCounts = {}
}: WarehouseFloorPlanProps) {
  const zones = warehouse.zones || [];

  if (zones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg bg-muted/20">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Depo Planı Tanımlanmamış</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Bu depo için henüz bir kat planı oluşturulmamış.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[4/3] bg-muted/30 rounded-lg border-2 border-border overflow-hidden">
      {/* Grid lines for reference */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '10% 10%'
        }}
      />
      
      {/* Zones */}
      {zones.map((zone, index) => {
        const isSelected = zone.id === selectedZoneId;
        const productCount = productCounts[zone.id] || 0;
        const zoneColor = zone.color || ZONE_COLORS[index % ZONE_COLORS.length];
        
        return (
          <button
            key={zone.id}
            className={cn(
              "absolute rounded-lg border-2 transition-all duration-200",
              "flex flex-col items-center justify-center gap-1",
              "hover:scale-[1.02] hover:shadow-lg cursor-pointer",
              isSelected 
                ? "ring-4 ring-offset-2 ring-primary shadow-xl z-10" 
                : "hover:z-10"
            )}
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
              backgroundColor: `${zoneColor}20`,
              borderColor: zoneColor,
            }}
            onClick={() => onZoneClick?.(zone)}
          >
            <span 
              className="font-bold text-sm md:text-base truncate px-1"
              style={{ color: zoneColor }}
            >
              {zone.name}
            </span>
            {productCount > 0 && (
              <span 
                className="text-xs px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: zoneColor }}
              >
                {productCount} ürün
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {zone.shelves.length} raf
            </span>
          </button>
        );
      })}
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-background/90 rounded-md px-2 py-1 text-xs text-muted-foreground">
        {zones.length} bölge
      </div>
    </div>
  );
}
