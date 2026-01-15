"use client"

import * as React from "react"
import { WarehouseZone, Warehouse, StorageUnit } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Package } from "lucide-react"

export type FloorPlanViewMode = 'topdown' | 'isometric'

interface WarehouseFloorPlanProps {
  warehouse: Warehouse
  onZoneClick?: (zone: WarehouseZone) => void
  selectedZoneId?: string
  productCounts?: Record<string, number>
  viewMode?: FloorPlanViewMode
}

const ZONE_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#eab308",
  "#a855f7",
  "#f97316",
  "#14b8a6",
  "#ec4899",
  "#0ea5e9",
];

// Isometric storage unit rendering
interface StorageUnitIsometricProps {
  unit: StorageUnit
  zoneColor: string
  index: number
  totalUnits: number
}

function StorageUnitIsometric({ unit, zoneColor, index, totalUnits }: StorageUnitIsometricProps) {
  const unitSpacing = 100 / (totalUnits + 1)
  const leftPos = (index + 1) * unitSpacing
  
  // Unit dimensions based on rows and columns
  const unitWidth = Math.max(28, unit.columns * 8)
  const unitHeight = unit.rows * 12
  
  return (
    <div
      className="absolute"
      style={{
        left: `${leftPos}%`,
        top: '50%',
        transform: `translate(-50%, -50%) rotateZ(45deg) rotateX(-60deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Storage unit rack */}
      <div
        className="relative"
        style={{
          width: `${unitWidth}px`,
          height: `${unitHeight}px`,
          border: `2px solid ${zoneColor}`,
          borderRadius: '3px',
          backgroundColor: `${zoneColor}15`,
          boxShadow: `0 4px 12px ${zoneColor}30`,
        }}
      >
        {/* Horizontal shelf levels */}
        {Array.from({ length: unit.rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="absolute left-0 right-0"
            style={{
              bottom: `${((rowIndex + 1) / (unit.rows + 1)) * 100}%`,
              height: '2px',
              backgroundColor: zoneColor,
              opacity: 0.7,
            }}
          />
        ))}
        
        {/* Vertical column dividers */}
        {Array.from({ length: unit.columns - 1 }).map((_, colIndex) => (
          <div
            key={`col-${colIndex}`}
            className="absolute top-0 bottom-0"
            style={{
              left: `${((colIndex + 1) / unit.columns) * 100}%`,
              width: '1px',
              backgroundColor: zoneColor,
              opacity: 0.5,
            }}
          />
        ))}
        
        {/* Unit label */}
        <div
          className="absolute -top-5 left-0 right-0 text-center whitespace-nowrap"
          style={{
            fontSize: '9px',
            color: zoneColor,
            fontWeight: 'bold',
          }}
        >
          {unit.name}
        </div>
        
        {/* Dimensions label */}
        <div
          className="absolute -bottom-4 left-0 right-0 text-center whitespace-nowrap"
          style={{
            fontSize: '7px',
            color: 'var(--muted-foreground)',
          }}
        >
          {unit.rows}×{unit.columns}
        </div>
      </div>
    </div>
  )
}

export function WarehouseFloorPlan({
  warehouse,
  onZoneClick,
  selectedZoneId,
  productCounts = {},
  viewMode = 'topdown'
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

  const isIsometric = viewMode === 'isometric';

  return (
    <div className={cn(
      "relative w-full",
      isIsometric && "perspective-[1200px] py-12"
    )}>
      <div 
        className={cn(
          "relative w-full aspect-[4/3] bg-muted/30 rounded-lg border-2 border-border transition-transform duration-500",
          isIsometric && "transform-gpu shadow-2xl overflow-visible"
        )}
        style={isIsometric ? {
          transform: 'rotateX(60deg) rotateZ(-45deg) scale(0.65)',
          transformStyle: 'preserve-3d',
        } : {
          overflow: 'hidden'
        }}
      >
        {/* Grid lines */}
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
          const storageUnits = zone.storageUnits || [];
          
          return (
            <div
              key={zone.id}
              className={cn(
                "absolute rounded-lg border-2 transition-all duration-200 cursor-pointer overflow-visible",
                !isIsometric && "flex flex-col items-center justify-center gap-1",
                isSelected 
                  ? "ring-4 ring-offset-2 ring-primary shadow-xl z-20" 
                  : "hover:z-20 hover:shadow-lg"
              )}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
                backgroundColor: `${zoneColor}25`,
                borderColor: zoneColor,
                transformStyle: isIsometric ? 'preserve-3d' : undefined,
              }}
              onClick={() => onZoneClick?.(zone)}
            >
              {/* Zone info */}
              <div 
                className={cn(
                  "flex flex-col items-center justify-center pointer-events-none",
                  isIsometric ? "absolute inset-x-0 bottom-1" : "flex-1"
                )}
              >
                <span 
                  className="font-bold text-sm truncate px-1"
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
                  {storageUnits.length} ünite
                </span>
              </div>
              
              {/* Isometric storage units */}
              {isIsometric && storageUnits.map((unit, unitIndex) => (
                <StorageUnitIsometric
                  key={unit.id}
                  unit={unit}
                  zoneColor={zoneColor}
                  index={unitIndex}
                  totalUnits={storageUnits.length}
                />
              ))}
            </div>
          );
        })}
        
        {/* Legend */}
        <div className="absolute bottom-2 right-2 bg-background/90 rounded-md px-2 py-1 text-xs text-muted-foreground">
          {zones.length} bölge
        </div>
      </div>
    </div>
  );
}
