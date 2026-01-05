import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Expand, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Move, CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight,
  Sparkles, Loader2
} from 'lucide-react';
import { OutpaintConfig, OutpaintDirection, CanvasState } from '../../types/project';
import { cn } from '../../lib/utils';

interface OutpaintingCanvasProps {
  imageUrl: string;
  onOutpaint: (config: OutpaintConfig) => Promise<string>;
  onComplete: (newImageUrl: string) => void;
  onCancel: () => void;
}

export const OutpaintingCanvas: React.FC<OutpaintingCanvasProps> = ({
  imageUrl,
  onOutpaint,
  onComplete,
  onCancel
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [directions, setDirections] = useState<OutpaintDirection[]>([]);
  const [expandSize, setExpandSize] = useState(256);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [canvasState, setCanvasState] = useState<CanvasState | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Load image dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setCanvasState({
        width: img.width,
        height: img.height,
        offsetX: 0,
        offsetY: 0,
        originalBounds: { x: 0, y: 0, width: img.width, height: img.height }
      });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const toggleDirection = (dir: OutpaintDirection) => {
    setDirections(prev => 
      prev.includes(dir) 
        ? prev.filter(d => d !== dir)
        : [...prev, dir]
    );
  };

  const getExpandedDimensions = () => {
    if (!canvasState) return { width: 0, height: 0 };
    
    let width = canvasState.width;
    let height = canvasState.height;
    
    if (directions.includes('left')) width += expandSize;
    if (directions.includes('right')) width += expandSize;
    if (directions.includes('top')) height += expandSize;
    if (directions.includes('bottom')) height += expandSize;
    
    return { width, height };
  };

  const handleOutpaint = async () => {
    if (directions.length === 0) return;
    
    setIsProcessing(true);
    try {
      const result = await onOutpaint({
        directions,
        expandSize,
        prompt,
        seamBlending: 50
      });
      onComplete(result);
    } catch (error) {
      console.error('Outpaint failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const directionButtons: { dir: OutpaintDirection; icon: React.ReactNode; label: string; position: string }[] = [
    { dir: 'top', icon: <ChevronUp className="w-5 h-5" />, label: 'Yukarı', position: 'top-0 left-1/2 -translate-x-1/2' },
    { dir: 'bottom', icon: <ChevronDown className="w-5 h-5" />, label: 'Aşağı', position: 'bottom-0 left-1/2 -translate-x-1/2' },
    { dir: 'left', icon: <ChevronLeft className="w-5 h-5" />, label: 'Sol', position: 'left-0 top-1/2 -translate-y-1/2' },
    { dir: 'right', icon: <ChevronRight className="w-5 h-5" />, label: 'Sağ', position: 'right-0 top-1/2 -translate-y-1/2' },
  ];

  const expanded = getExpandedDimensions();
  const scale = Math.min(600 / expanded.width, 400 / expanded.height, 1);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Expand className="w-5 h-5 text-primary" />
          <h2 className="font-bold">Outpainting - Canvas Genişletme</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm bg-slate-700 rounded-lg hover:bg-slate-600"
          >
            İptal
          </button>
          <button
            onClick={handleOutpaint}
            disabled={directions.length === 0 || isProcessing}
            className="px-4 py-1.5 text-sm bg-primary rounded-lg hover:bg-primary/80 disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Genişlet
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Canvas Area */}
        <div className="flex-1 p-8 flex items-center justify-center bg-[#0a0a0a]">
          <div 
            ref={canvasRef}
            className="relative"
            style={{
              width: expanded.width * scale,
              height: expanded.height * scale
            }}
          >
            {/* Expand zones */}
            {directions.includes('top') && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: expandSize * scale }}
                className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary/20 to-transparent border-2 border-dashed border-primary/50 rounded-t-xl flex items-center justify-center"
                style={{ 
                  marginLeft: directions.includes('left') ? expandSize * scale : 0,
                  marginRight: directions.includes('right') ? expandSize * scale : 0
                }}
              >
                <span className="text-xs text-primary/70">+{expandSize}px</span>
              </motion.div>
            )}
            
            {directions.includes('bottom') && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: expandSize * scale }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/20 to-transparent border-2 border-dashed border-primary/50 rounded-b-xl flex items-center justify-center"
                style={{ 
                  marginLeft: directions.includes('left') ? expandSize * scale : 0,
                  marginRight: directions.includes('right') ? expandSize * scale : 0
                }}
              >
                <span className="text-xs text-primary/70">+{expandSize}px</span>
              </motion.div>
            )}
            
            {directions.includes('left') && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: expandSize * scale }}
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-primary/20 to-transparent border-2 border-dashed border-primary/50 rounded-l-xl flex items-center justify-center"
              >
                <span className="text-xs text-primary/70 -rotate-90">+{expandSize}px</span>
              </motion.div>
            )}
            
            {directions.includes('right') && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: expandSize * scale }}
                className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-primary/20 to-transparent border-2 border-dashed border-primary/50 rounded-r-xl flex items-center justify-center"
              >
                <span className="text-xs text-primary/70 rotate-90">+{expandSize}px</span>
              </motion.div>
            )}

            {/* Original Image */}
            <div 
              className="relative bg-slate-800 rounded-lg overflow-hidden shadow-2xl"
              style={{
                width: imageDimensions.width * scale,
                height: imageDimensions.height * scale,
                marginTop: directions.includes('top') ? expandSize * scale : 0,
                marginLeft: directions.includes('left') ? expandSize * scale : 0,
              }}
            >
              <img 
                src={imageUrl} 
                alt="Source" 
                className="w-full h-full object-contain"
              />
              
              {/* Direction buttons overlay */}
              {directionButtons.map(({ dir, icon, position }) => (
                <button
                  key={dir}
                  onClick={() => toggleDirection(dir)}
                  className={cn(
                    "absolute p-2 rounded-full transition-all transform",
                    position,
                    directions.includes(dir)
                      ? "bg-primary text-white scale-110 shadow-lg shadow-primary/50"
                      : "bg-slate-700/80 text-slate-300 hover:bg-slate-600"
                  )}
                  style={{
                    transform: position.includes('translate') 
                      ? undefined 
                      : `${position.includes('top') ? 'translateY(-50%)' : ''} ${position.includes('left') ? 'translateX(-50%)' : ''}`
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-72 p-4 border-l border-slate-700 space-y-4">
          {/* Direction Selection */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              Genişletme Yönleri
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div /> {/* Empty for layout */}
              <button
                onClick={() => toggleDirection('top')}
                className={cn(
                  "p-2 rounded-xl flex flex-col items-center gap-1 transition-all",
                  directions.includes('top') 
                    ? "bg-primary/20 text-primary border border-primary/50" 
                    : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                )}
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <div />
              
              <button
                onClick={() => toggleDirection('left')}
                className={cn(
                  "p-2 rounded-xl flex flex-col items-center gap-1 transition-all",
                  directions.includes('left') 
                    ? "bg-primary/20 text-primary border border-primary/50" 
                    : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="p-2 bg-slate-800 rounded-xl flex items-center justify-center">
                <Move className="w-5 h-5 text-slate-500" />
              </div>
              <button
                onClick={() => toggleDirection('right')}
                className={cn(
                  "p-2 rounded-xl flex flex-col items-center gap-1 transition-all",
                  directions.includes('right') 
                    ? "bg-primary/20 text-primary border border-primary/50" 
                    : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <div />
              <button
                onClick={() => toggleDirection('bottom')}
                className={cn(
                  "p-2 rounded-xl flex flex-col items-center gap-1 transition-all",
                  directions.includes('bottom') 
                    ? "bg-primary/20 text-primary border border-primary/50" 
                    : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                )}
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <div />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              {directions.length} yön seçildi
            </p>
          </div>

          {/* Expand Size */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Genişletme Boyutu
              </label>
              <span className="text-xs font-mono">{expandSize}px</span>
            </div>
            <input
              type="range"
              min="64"
              max="512"
              step="64"
              value={expandSize}
              onChange={(e) => setExpandSize(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>64px</span>
              <span>256px</span>
              <span>512px</span>
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              Genişletme Prompt (Opsiyonel)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Genişletilecek alanda neler olsun..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Preview Info */}
          <div className="p-3 bg-slate-800/50 rounded-xl space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Orijinal</span>
              <span className="font-mono">{imageDimensions.width} × {imageDimensions.height}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Yeni Boyut</span>
              <span className="font-mono text-primary">{expanded.width} × {expanded.height}</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              Hızlı Seçim
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDirections(['left', 'right'])}
                className="p-2 text-xs bg-slate-700 rounded-lg hover:bg-slate-600 flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" />
                <ChevronRight className="w-3 h-3" />
                Yatay
              </button>
              <button
                onClick={() => setDirections(['top', 'bottom'])}
                className="p-2 text-xs bg-slate-700 rounded-lg hover:bg-slate-600 flex items-center justify-center gap-1"
              >
                <ChevronUp className="w-3 h-3" />
                <ChevronDown className="w-3 h-3" />
                Dikey
              </button>
              <button
                onClick={() => setDirections(['top', 'bottom', 'left', 'right'])}
                className="col-span-2 p-2 text-xs bg-slate-700 rounded-lg hover:bg-slate-600 flex items-center justify-center gap-1"
              >
                <Expand className="w-3 h-3" />
                Tüm Yönler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
