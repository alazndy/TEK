"use client"

import * as React from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Html, Environment } from "@react-three/drei"
import { WarehouseZone, Warehouse, StorageUnit, Compartment } from "@/lib/types"
import * as THREE from "three"
import { Box } from "lucide-react"

const ZONE_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#eab308",
  "#a855f7",
  "#f97316",
  "#14b8a6",
  "#ec4899",
  "#0ea5e9",
]

// 3D Storage Unit with shelves and compartments
interface StorageUnit3DProps {
  unit: StorageUnit
  position: [number, number, number]
  color: string
  onClick: () => void
}

function StorageUnit3D({ unit, position, color, onClick }: StorageUnit3DProps) {
  const [hovered, setHovered] = React.useState(false)
  
  // Dimensions
  const unitWidth = unit.columns * 0.35
  const unitHeight = unit.rows * 0.35
  const unitDepth = 0.4
  const shelfThickness = 0.02
  const columnThickness = 0.03
  
  return (
    <group position={position}>
      {/* Vertical columns (4 corners) */}
      {[0, unitWidth].map((xPos, i) => (
        [0, unitDepth].map((zPos, j) => (
          <mesh key={`col-${i}-${j}`} position={[xPos - unitWidth/2, unitHeight/2, zPos - unitDepth/2]}>
            <boxGeometry args={[columnThickness, unitHeight, columnThickness]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
          </mesh>
        ))
      ))}
      
      {/* Horizontal shelves */}
      {Array.from({ length: unit.rows + 1 }).map((_, rowIndex) => (
        <mesh 
          key={`shelf-${rowIndex}`} 
          position={[0, rowIndex * (unitHeight / unit.rows), 0]}
        >
          <boxGeometry args={[unitWidth, shelfThickness, unitDepth]} />
          <meshStandardMaterial 
            color={rowIndex === unit.rows ? color : "#94a3b8"} 
            metalness={0.4} 
            roughness={0.5}
          />
        </mesh>
      ))}
      
      {/* Back panel */}
      <mesh position={[0, unitHeight/2, -unitDepth/2 + 0.01]}>
        <boxGeometry args={[unitWidth, unitHeight, 0.01]} />
        <meshStandardMaterial color={color} transparent opacity={0.2} />
      </mesh>
      
      {/* Column dividers */}
      {Array.from({ length: unit.columns - 1 }).map((_, colIndex) => (
        <mesh 
          key={`divider-${colIndex}`}
          position={[(colIndex + 1) * (unitWidth / unit.columns) - unitWidth/2, unitHeight/2, 0]}
        >
          <boxGeometry args={[0.01, unitHeight, unitDepth]} />
          <meshStandardMaterial color={color} transparent opacity={0.3} />
        </mesh>
      ))}
      
      {/* Clickable area */}
      <mesh
        position={[0, unitHeight/2, 0]}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        visible={false}
      >
        <boxGeometry args={[unitWidth, unitHeight, unitDepth]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Unit label */}
      {hovered && (
        <Html position={[0, unitHeight + 0.2, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-lg border text-center whitespace-nowrap">
            <div className="font-bold text-xs">{unit.name}</div>
            <div className="text-xs text-muted-foreground">{unit.rows}×{unit.columns}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

interface Zone3DProps {
  zone: WarehouseZone
  index: number
  productCount: number
  onClick: () => void
  scale?: number
}

function Zone3D({ zone, index, productCount, onClick, scale = 5 }: Zone3DProps) {
  const [hovered, setHovered] = React.useState(false)
  const color = zone.color || ZONE_COLORS[index % ZONE_COLORS.length]
  
  const x = (zone.x / 100 - 0.5) * scale * 2
  const z = (zone.y / 100 - 0.5) * scale * 2
  const width = (zone.width / 100) * scale * 2
  const depth = (zone.height / 100) * scale * 2
  
  const storageUnits = zone.storageUnits || []
  const unitSpacing = width / (storageUnits.length + 1)
  
  return (
    <group position={[x, 0, z]}>
      {/* Zone floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[width/2, 0.02, depth/2]}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <planeGeometry args={[width * 0.95, depth * 0.95]} />
        <meshStandardMaterial color={color} transparent opacity={hovered ? 0.4 : 0.25} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Zone border */}
      <lineSegments position={[width/2, 0.03, depth/2]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width * 0.95, 0.01, depth * 0.95)]} />
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>
      
      {/* Storage units */}
      {storageUnits.map((unit, unitIndex) => (
        <StorageUnit3D
          key={unit.id}
          unit={unit}
          position={[(unitIndex + 1) * unitSpacing, 0, depth / 2]}
          color={color}
          onClick={onClick}
        />
      ))}
      
      {/* Zone label */}
      <Html position={[width/2, 0.1, depth/2]} center distanceFactor={8} style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-lg border text-center">
          <div className="font-bold text-sm" style={{ color }}>{zone.name}</div>
          <div className="text-xs text-muted-foreground">{productCount} ürün • {storageUnits.length} ünite</div>
        </div>
      </Html>
    </group>
  )
}

function Floor({ size = 10 }: { size?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#1a1a2e" metalness={0.1} roughness={0.8} />
    </mesh>
  )
}

function Grid({ size = 10 }: { size?: number }) {
  return <gridHelper args={[size, size * 2, "#334155", "#1e293b"]} position={[0, 0.01, 0]} />
}

interface Warehouse3DViewProps {
  warehouse: Warehouse
  onZoneClick: (zone: WarehouseZone) => void
  productCounts: Record<string, number>
}

export function Warehouse3DView({ warehouse, onZoneClick, productCounts }: Warehouse3DViewProps) {
  const zones = warehouse.zones || []
  
  if (zones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg bg-muted/20">
        <Box className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">3D Görünüm için Bölge Tanımlayın</h3>
        <p className="text-sm text-muted-foreground mt-1">Plan düzenleyiciye giderek bölge ekleyin.</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border bg-gradient-to-b from-slate-900 to-slate-950">
      <Canvas camera={{ position: [8, 6, 8], fov: 50 }} shadows dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 15, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-10, 10, -5]} intensity={0.5} color="#a5b4fc" />
        <Environment preset="city" />
        <Floor size={14} />
        <Grid size={14} />
        {zones.map((zone, index) => (
          <Zone3D
            key={zone.id}
            zone={zone}
            index={index}
            productCount={productCounts[zone.id] || 0}
            onClick={() => onZoneClick(zone)}
          />
        ))}
        <OrbitControls 
          enablePan enableZoom enableRotate
          minDistance={3} maxDistance={25}
          minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.2}
          panSpeed={0.5} rotateSpeed={0.5} zoomSpeed={0.8}
          target={[0, 0.5, 0]}
        />
      </Canvas>
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-muted-foreground">
        <div className="flex gap-4">
          <span>🖱️ Sol: Döndür</span>
          <span>🔄 Scroll: Zoom</span>
          <span>➡️ Sağ: Kaydır</span>
        </div>
      </div>
    </div>
  )
}
