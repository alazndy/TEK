import { useState, useRef, useCallback, useEffect } from "react";
import { WarehouseZone, StorageUnit, Warehouse } from "@/lib/types";

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Default colors for zones
const ZONE_COLORS = [
  "#22c55e", "#3b82f6", "#eab308", "#a855f7", 
  "#f97316", "#14b8a6", "#ec4899", "#0ea5e9"
];

// Check if two zones overlap
const zonesOverlap = (zone1: WarehouseZone, zone2: WarehouseZone): boolean => {
  const leftOf = zone1.x + zone1.width <= zone2.x;
  const rightOf = zone1.x >= zone2.x + zone2.width;
  const above = zone1.y + zone1.height <= zone2.y;
  const below = zone1.y >= zone2.y + zone2.height;
  
  return !(leftOf || rightOf || above || below);
};

// Constrain zone to bounds
const constrainZone = (zone: WarehouseZone): WarehouseZone => {
  return {
    ...zone,
    x: Math.max(0, Math.min(100 - zone.width, zone.x)),
    y: Math.max(0, Math.min(100 - zone.height, zone.y)),
    width: Math.max(5, Math.min(100 - zone.x, zone.width)),
    height: Math.max(5, Math.min(100 - zone.y, zone.height)),
  };
};

export function useZoneEditor(initialWarehouse: Warehouse) {
  const [zones, setZones] = useState<WarehouseZone[]>(initialWarehouse.zones || []);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalZone, setOriginalZone] = useState<WarehouseZone | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addZone = () => {
    let newX = 5;
    let newY = 5;
    let attempts = 0;
    
    while (attempts < 20) {
      const testZone: WarehouseZone = {
        id: 'test', name: '', x: newX, y: newY, width: 18, height: 22, storageUnits: []
      };
      
      const overlaps = zones.some(z => zonesOverlap(testZone, z));
      if (!overlaps && newX + 18 <= 100 && newY + 22 <= 100) break;
      
      newX += 20;
      if (newX + 18 > 95) {
        newX = 5;
        newY += 25;
      }
      attempts++;
    }
    
    const newZone: WarehouseZone = {
      id: generateId(),
      name: `Bölge ${zones.length + 1}`,
      x: newX,
      y: newY,
      width: 18,
      height: 22,
      color: ZONE_COLORS[zones.length % ZONE_COLORS.length],
      storageUnits: [{
        id: generateId(),
        name: `Ünite 1`,
        rows: 4,
        columns: 3,
        compartments: []
      }]
    };
    setZones([...zones, newZone]);
    setSelectedZoneId(newZone.id);
  };

  const updateZone = (zoneId: string, updates: Partial<WarehouseZone>) => {
    setZones(zones.map(z => z.id === zoneId ? { ...z, ...updates } : z));
  };

  const deleteZone = (zoneId: string) => {
    setZones(zones.filter(z => z.id !== zoneId));
    if (selectedZoneId === zoneId) setSelectedZoneId(null);
  };

  // Storage Unit operations
  const addStorageUnit = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;
    
    const newUnit: StorageUnit = {
      id: generateId(),
      name: `Ünite ${zone.storageUnits.length + 1}`,
      rows: 4,
      columns: 3,
      compartments: []
    };
    
    updateZone(zoneId, { storageUnits: [...zone.storageUnits, newUnit] });
  };

  const updateStorageUnit = (zoneId: string, unitId: string, updates: Partial<StorageUnit>) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;
    
    const updatedUnits = zone.storageUnits.map(u => 
      u.id === unitId ? { ...u, ...updates } : u
    );
    updateZone(zoneId, { storageUnits: updatedUnits });
  };

  const deleteStorageUnit = (zoneId: string, unitId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;
    
    updateZone(zoneId, { storageUnits: zone.storageUnits.filter(u => u.id !== unitId) });
  };

  const handleMouseDown = (e: React.MouseEvent, zoneId: string, action: 'drag' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;
    
    setSelectedZoneId(zoneId);
    setOriginalZone({ ...zone });
    setDragStart({ x: e.clientX, y: e.clientY });
    
    if (action === 'drag') {
      setIsDragging(true);
    } else {
      setIsResizing(true);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if ((!isDragging && !isResizing) || !containerRef.current || !originalZone || !selectedZoneId) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;
    
    let updatedZone: WarehouseZone;
    
    if (isDragging) {
      updatedZone = constrainZone({
        ...originalZone,
        x: originalZone.x + deltaX,
        y: originalZone.y + deltaY,
      });
    } else {
      updatedZone = constrainZone({
        ...originalZone,
        width: Math.max(8, originalZone.width + deltaX),
        height: Math.max(8, originalZone.height + deltaY),
      });
    }
    
    const otherZones = zones.filter(z => z.id !== selectedZoneId);
    const hasOverlap = otherZones.some(z => zonesOverlap(updatedZone, z));
    
    if (!hasOverlap) {
      setZones(zones.map(z => z.id === selectedZoneId ? updatedZone : z));
    }
  }, [isDragging, isResizing, dragStart, originalZone, selectedZoneId, zones]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setOriginalZone(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  return {
    zones, setZones,
    selectedZoneId, setSelectedZoneId,
    isDragging, isResizing,
    containerRef,
    addZone, updateZone, deleteZone,
    addStorageUnit, updateStorageUnit, deleteStorageUnit,
    handleMouseDown,
    constrainZone, zonesOverlap
  };
}
