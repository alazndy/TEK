import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Upload, Sliders, Eye, Sparkles, Loader2, X,
  Blend, Layers, Pipette
} from 'lucide-react';
import { StyleTransferConfig } from '../../types/project';
import { cn } from '../../lib/utils';

interface StyleTransferPanelProps {
  sourceImageUrl: string;
  onTransfer: (config: StyleTransferConfig) => Promise<string>;
  onComplete: (newImageUrl: string) => void;
  onCancel: () => void;
}

export const StyleTransferPanel: React.FC<StyleTransferPanelProps> = ({
  sourceImageUrl,
  onTransfer,
  onComplete,
  onCancel
}) => {
  const [styleImageUrl, setStyleImageUrl] = useState<string>('');
  const [strength, setStrength] = useState(50);
  const [preserveColor, setPreserveColor] = useState(false);
  const [preserveStructure, setPreserveStructure] = useState(true);
  const [blendMode, setBlendMode] = useState<'normal' | 'overlay' | 'soft-light'>('normal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleStyleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setStyleImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransfer = async () => {
    if (!styleImageUrl) return;
    
    setIsProcessing(true);
    try {
      const result = await onTransfer({
        styleImageUrl,
        strength,
        preserveColor,
        preserveStructure,
        blendMode
      });
      setPreviewUrl(result);
    } catch (error) {
      console.error('Style transfer failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (previewUrl) {
      onComplete(previewUrl);
    }
  };

  const stylePresets = [
    { name: 'Van Gogh', image: '/presets/vangogh.jpg', color: 'from-yellow-500 to-blue-600' },
    { name: 'Monet', image: '/presets/monet.jpg', color: 'from-green-400 to-blue-400' },
    { name: 'Sketching', image: '/presets/sketch.jpg', color: 'from-gray-400 to-gray-600' },
    { name: 'Watercolor', image: '/presets/watercolor.jpg', color: 'from-pink-400 to-purple-400' },
    { name: 'Oil Paint', image: '/presets/oil.jpg', color: 'from-amber-600 to-orange-600' },
    { name: 'Pop Art', image: '/presets/popart.jpg', color: 'from-red-500 to-pink-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-400" />
          <h2 className="font-bold">Style Transfer</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm bg-slate-700 rounded-lg hover:bg-slate-600"
          >
            İptal
          </button>
          {previewUrl && (
            <button
              onClick={handleApply}
              className="px-4 py-1.5 text-sm bg-green-600 rounded-lg hover:bg-green-500"
            >
              Uygula
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Preview Area */}
        <div className="flex-1 p-4 flex gap-4 items-center justify-center bg-[#0a0a0a]">
          {/* Source Image */}
          <div className="text-center">
            <div className="w-64 h-64 bg-slate-800 rounded-xl overflow-hidden">
              <img 
                src={sourceImageUrl} 
                alt="Source" 
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Kaynak</p>
          </div>

          {/* Arrow */}
          <div className="text-slate-500 text-2xl">→</div>

          {/* Result Preview */}
          <div className="text-center">
            <div className="w-64 h-64 bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
              {isProcessing ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-xs text-slate-500 mt-2">Stil transfer ediliyor...</p>
                </div>
              ) : previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Result" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-500">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Önizleme</p>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">Sonuç</p>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-80 p-4 border-l border-slate-700 space-y-4 overflow-y-auto">
          {/* Style Image Upload */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              Stil Görüntüsü
            </label>
            {styleImageUrl ? (
              <div className="relative">
                <img 
                  src={styleImageUrl} 
                  alt="Style" 
                  className="w-full h-32 object-cover rounded-xl"
                />
                <button
                  onClick={() => setStyleImageUrl('')}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-xs text-slate-500">Stil resmi yükle</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStyleUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Style Presets */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              Hazır Stiller
            </label>
            <div className="grid grid-cols-3 gap-2">
              {stylePresets.map(preset => (
                <button
                  key={preset.name}
                  className={cn(
                    "p-2 rounded-xl text-center transition-all overflow-hidden relative",
                    "bg-slate-700/50 hover:bg-slate-700"
                  )}
                  onClick={() => setStyleImageUrl(preset.image)}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-50",
                    preset.color
                  )} />
                  <span className="relative text-[10px] font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Strength Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="w-3 h-3" /> Stil Yoğunluğu
              </label>
              <span className="text-xs font-mono">{strength}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
              className="w-full accent-purple-500 h-2 bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Hafif</span>
              <span>Orta</span>
              <span>Tam</span>
            </div>
          </div>

          {/* Blend Mode */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
              <Blend className="w-3 h-3" /> Karışım Modu
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'overlay', 'soft-light'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setBlendMode(mode)}
                  className={cn(
                    "p-2 rounded-xl text-xs font-medium transition-all capitalize",
                    blendMode === mode 
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/50" 
                      : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  {mode === 'normal' ? 'Normal' : mode === 'overlay' ? 'Overlay' : 'Soft Light'}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
              <span className="text-sm flex items-center gap-2">
                <Pipette className="w-4 h-4 text-slate-400" />
                Renkleri Koru
              </span>
              <button
                onClick={() => setPreserveColor(!preserveColor)}
                className={cn(
                  "w-10 h-6 rounded-full transition-colors relative",
                  preserveColor ? "bg-purple-500" : "bg-slate-600"
                )}
              >
                <motion.div
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  animate={{ left: preserveColor ? 20 : 4 }}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
              <span className="text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                Yapıyı Koru
              </span>
              <button
                onClick={() => setPreserveStructure(!preserveStructure)}
                className={cn(
                  "w-10 h-6 rounded-full transition-colors relative",
                  preserveStructure ? "bg-purple-500" : "bg-slate-600"
                )}
              >
                <motion.div
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  animate={{ left: preserveStructure ? 20 : 4 }}
                />
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleTransfer}
            disabled={!styleImageUrl || isProcessing}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Stili Transfer Et
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
