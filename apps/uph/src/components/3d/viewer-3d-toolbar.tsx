'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Ruler, 
  MessageSquare,
  Eye,
  Grid3X3,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Viewer3DToolbarProps {
  onResetView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitToScreen?: () => void;
  measureMode: boolean;
  onMeasureModeToggle: () => void;
  annotationMode: boolean;
  onAnnotationModeToggle: () => void;
  showGrid: boolean;
  onGridToggle: () => void;
  showAxes: boolean;
  onAxesToggle: () => void;
}

export function Viewer3DToolbar({
  onResetView,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  measureMode,
  onMeasureModeToggle,
  annotationMode,
  onAnnotationModeToggle,
  showGrid,
  onGridToggle,
  showAxes,
  onAxesToggle,
}: Viewer3DToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 bg-zinc-900/80 backdrop-blur-sm rounded-lg p-1 border border-zinc-700">
      {/* View Controls */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onResetView}
        title="Reset View"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onZoomIn}
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onZoomOut}
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onFitToScreen}
        title="Fit to Screen"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      
      <div className="h-px bg-zinc-700 my-1" />
      
      {/* Measurement Mode */}
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", measureMode && "bg-purple-600/30 text-purple-400")}
        onClick={onMeasureModeToggle}
        title="Measure (Click two points)"
      >
        <Ruler className="h-4 w-4" />
      </Button>
      
      {/* Annotation Mode */}
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", annotationMode && "bg-blue-600/30 text-blue-400")}
        onClick={onAnnotationModeToggle}
        title="Add Annotation"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
      
      <div className="h-px bg-zinc-700 my-1" />
      
      {/* Display Options */}
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", showGrid && "bg-zinc-700/50")}
        onClick={onGridToggle}
        title="Toggle Grid"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", showAxes && "bg-zinc-700/50")}
        onClick={onAxesToggle}
        title="Toggle Axes"
      >
        <Sun className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface Annotation3D {
  id: string;
  position: [number, number, number];
  text: string;
}

interface Viewer3DControllerProps {
  children: React.ReactNode;
  initialAnnotations?: Annotation3D[];
  onAnnotationsChange?: (annotations: Annotation3D[]) => void;
}

export function Viewer3DController({ 
  children,
  initialAnnotations = [],
  onAnnotationsChange 
}: Viewer3DControllerProps) {
  const [measureMode, setMeasureMode] = useState(false);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation3D[]>(initialAnnotations);
  const [measurePoints, setMeasurePoints] = useState<[number, number, number][]>([]);
  const [measurement, setMeasurement] = useState<number | null>(null);

  const handleMeasureClick = (point: [number, number, number]) => {
    if (!measureMode) return;
    
    const newPoints = [...measurePoints, point];
    setMeasurePoints(newPoints);
    
    if (newPoints.length === 2) {
      // Calculate distance
      const dx = newPoints[1][0] - newPoints[0][0];
      const dy = newPoints[1][1] - newPoints[0][1];
      const dz = newPoints[1][2] - newPoints[0][2];
      const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
      setMeasurement(distance);
      // Reset points after showing measurement
      setTimeout(() => {
        setMeasurePoints([]);
        setMeasurement(null);
      }, 3000);
    }
  };

  const handleAnnotationClick = (point: [number, number, number]) => {
    if (!annotationMode) return;
    
    const text = prompt('Enter annotation text:');
    if (text) {
      const newAnnotation: Annotation3D = {
        id: Math.random().toString(36).substring(7),
        position: point,
        text,
      };
      const newAnnotations = [...annotations, newAnnotation];
      setAnnotations(newAnnotations);
      onAnnotationsChange?.(newAnnotations);
    }
  };

  return (
    <div className="relative w-full h-full">
      <Viewer3DToolbar
        measureMode={measureMode}
        onMeasureModeToggle={() => {
          setMeasureMode(!measureMode);
          setAnnotationMode(false);
          setMeasurePoints([]);
        }}
        annotationMode={annotationMode}
        onAnnotationModeToggle={() => {
          setAnnotationMode(!annotationMode);
          setMeasureMode(false);
        }}
        showGrid={showGrid}
        onGridToggle={() => setShowGrid(!showGrid)}
        showAxes={showAxes}
        onAxesToggle={() => setShowAxes(!showAxes)}
      />
      
      {/* Measurement display */}
      {measurement !== null && (
        <div className="absolute top-4 right-4 z-10 bg-purple-600/90 text-white px-4 py-2 rounded-lg">
          Distance: {measurement.toFixed(2)} units
        </div>
      )}
      
      {/* Mode indicator */}
      {(measureMode || annotationMode) && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-zinc-900/80 text-white px-4 py-2 rounded-lg text-sm">
          {measureMode && 'Click two points to measure distance'}
          {annotationMode && 'Click to add annotation'}
        </div>
      )}
      
      {children}
    </div>
  );
}
