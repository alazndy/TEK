import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, X, Image, FileImage, File, Layers,
  ZoomIn, Settings, Check, Loader2
} from 'lucide-react';
import { ExportConfig, ExportFormat, UpscaleConfig } from '../../types/project';
import { cn } from '../../lib/utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onExport: (config: ExportConfig) => Promise<void>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onExport
}) => {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(90);
  const [bitDepth, setBitDepth] = useState<8 | 16>(8);
  const [includeLayers, setIncludeLayers] = useState(false);
  const [colorProfile, setColorProfile] = useState<'srgb' | 'adobe-rgb' | 'p3'>('srgb');
  const [upscale, setUpscale] = useState<UpscaleConfig>({
    enabled: false,
    factor: 2,
    denoising: 30,
    sharpening: 20
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const formats: { format: ExportFormat; icon: React.ReactNode; name: string; desc: string }[] = [
    { format: 'png', icon: <Image className="w-5 h-5" />, name: 'PNG', desc: 'Kayıpsız, şeffaflık' },
    { format: 'jpg', icon: <FileImage className="w-5 h-5" />, name: 'JPG', desc: 'Küçük dosya' },
    { format: 'webp', icon: <FileImage className="w-5 h-5" />, name: 'WebP', desc: 'Web optimize' },
    { format: 'tiff', icon: <File className="w-5 h-5" />, name: 'TIFF', desc: 'Baskı kalitesi' },
    { format: 'psd', icon: <Layers className="w-5 h-5" />, name: 'PSD', desc: 'Katmanlı' },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport({
        format,
        quality,
        bitDepth,
        includeLayers,
        upscale,
        colorProfile
      });
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Görüntüyü Dışa Aktar</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex gap-6">
              {/* Preview */}
              <div className="w-1/3">
                <div className="aspect-square bg-slate-800 rounded-xl overflow-hidden">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <p className="text-xs text-slate-500 text-center mt-2">Önizleme</p>
              </div>

              {/* Options */}
              <div className="flex-1 space-y-5">
                {/* Format Selection */}
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                    Format
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {formats.map(f => (
                      <button
                        key={f.format}
                        onClick={() => setFormat(f.format)}
                        className={cn(
                          "p-3 rounded-xl text-center transition-all",
                          format === f.format 
                            ? "bg-primary/20 text-primary border border-primary/50" 
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        )}
                      >
                        <div className="flex justify-center mb-1">{f.icon}</div>
                        <span className="text-xs font-medium">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format-specific options */}
                {(format === 'jpg' || format === 'webp') && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-slate-400 uppercase">Kalite</label>
                      <span className="text-xs font-mono">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-slate-700 rounded-lg"
                    />
                  </div>
                )}

                {(format === 'png' || format === 'tiff') && (
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase mb-2 block">Bit Derinliği</label>
                    <div className="flex gap-2">
                      {([8, 16] as const).map(depth => (
                        <button
                          key={depth}
                          onClick={() => setBitDepth(depth)}
                          className={cn(
                            "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
                            bitDepth === depth
                              ? "bg-primary/20 text-primary border border-primary/50"
                              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                          )}
                        >
                          {depth}-bit
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {format === 'psd' && (
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                    <span className="text-sm">Katmanları Dahil Et</span>
                    <button
                      onClick={() => setIncludeLayers(!includeLayers)}
                      className={cn(
                        "w-10 h-6 rounded-full transition-colors relative",
                        includeLayers ? "bg-primary" : "bg-slate-600"
                      )}
                    >
                      <motion.div
                        className="absolute top-1 w-4 h-4 bg-white rounded-full"
                        animate={{ left: includeLayers ? 20 : 4 }}
                      />
                    </button>
                  </div>
                )}

                {/* Upscale Options */}
                <div className="p-4 bg-slate-800/50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <ZoomIn className="w-4 h-4 text-primary" />
                      AI Upscale
                    </span>
                    <button
                      onClick={() => setUpscale({ ...upscale, enabled: !upscale.enabled })}
                      className={cn(
                        "w-10 h-6 rounded-full transition-colors relative",
                        upscale.enabled ? "bg-primary" : "bg-slate-600"
                      )}
                    >
                      <motion.div
                        className="absolute top-1 w-4 h-4 bg-white rounded-full"
                        animate={{ left: upscale.enabled ? 20 : 4 }}
                      />
                    </button>
                  </div>
                  
                  {upscale.enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Büyütme</label>
                        <div className="grid grid-cols-4 gap-2">
                          {([1, 2, 4, 8] as const).map(factor => (
                            <button
                              key={factor}
                              onClick={() => setUpscale({ ...upscale, factor })}
                              className={cn(
                                "py-1.5 rounded-lg text-xs font-medium",
                                upscale.factor === factor
                                  ? "bg-primary text-white"
                                  : "bg-slate-700 text-slate-400"
                              )}
                            >
                              {factor}x
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Denoising</span>
                            <span>{upscale.denoising}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={upscale.denoising}
                            onChange={(e) => setUpscale({ ...upscale, denoising: Number(e.target.value) })}
                            className="w-full accent-primary h-1.5 bg-slate-700 rounded-lg"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Sharpening</span>
                            <span>{upscale.sharpening}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={upscale.sharpening}
                            onChange={(e) => setUpscale({ ...upscale, sharpening: Number(e.target.value) })}
                            className="w-full accent-primary h-1.5 bg-slate-700 rounded-lg"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Color Profile */}
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase mb-2 block flex items-center gap-1">
                    <Settings className="w-3 h-3" /> Renk Profili
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['srgb', 'adobe-rgb', 'p3'] as const).map(profile => (
                      <button
                        key={profile}
                        onClick={() => setColorProfile(profile)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-medium transition-all uppercase",
                          colorProfile === profile
                            ? "bg-primary/20 text-primary border border-primary/50"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        )}
                      >
                        {profile}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-slate-700 rounded-xl hover:bg-slate-600"
              >
                İptal
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-2 text-sm bg-primary rounded-xl hover:bg-primary/80 disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Dışa Aktarılıyor...
                  </>
                ) : exportSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Tamamlandı!
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Dışa Aktar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
