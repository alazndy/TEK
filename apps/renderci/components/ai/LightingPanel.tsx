import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, Moon, Sunrise, Sunset, CloudSun, 
  ThermometerSun, Eye, EyeOff, RotateCcw
} from 'lucide-react';
import { LightingConfig, TimePreset, TIME_PRESETS, SunDirection } from '../../types/project';
import { cn } from '../../lib/utils';

interface LightingPanelProps {
  config: LightingConfig;
  onChange: (config: LightingConfig) => void;
}

export const LightingPanel: React.FC<LightingPanelProps> = ({ config, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleTimePreset = (preset: TimePreset) => {
    const presetConfig = TIME_PRESETS[preset];
    onChange({
      ...config,
      sunDirection: { azimuth: presetConfig.azimuth, elevation: presetConfig.elevation },
      colorTemperature: presetConfig.temperature,
      timeOfDay: preset,
    });
  };

  const handleSphereClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Convert to spherical coordinates
    const azimuth = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;
    const distance = Math.sqrt(x * x + y * y);
    const maxRadius = rect.width / 2;
    const elevation = Math.max(0, Math.min(90, 90 - (distance / maxRadius) * 90));
    
    onChange({
      ...config,
      sunDirection: { azimuth, elevation },
      timeOfDay: undefined, // Clear preset when manually adjusting
    });
  }, [config, onChange]);

  const getTemperatureColor = (temp: number): string => {
    if (temp < 3500) return '#ff9329';
    if (temp < 4500) return '#ffb866';
    if (temp < 5500) return '#ffd9a6';
    if (temp < 6500) return '#fff4e5';
    return '#e5f0ff';
  };

  const getSunPosition = (): { x: number; y: number } => {
    const radius = 45; // percentage from center
    const elevationFactor = 1 - (config.sunDirection.elevation / 90);
    const r = radius * elevationFactor;
    const x = 50 + r * Math.sin(config.sunDirection.azimuth * Math.PI / 180);
    const y = 50 - r * Math.cos(config.sunDirection.azimuth * Math.PI / 180);
    return { x, y };
  };

  const sunPos = getSunPosition();

  const timePresets: { preset: TimePreset; icon: React.ReactNode; label: string }[] = [
    { preset: 'dawn', icon: <Sunrise className="w-4 h-4" />, label: 'Şafak' },
    { preset: 'morning', icon: <Sun className="w-4 h-4" />, label: 'Sabah' },
    { preset: 'noon', icon: <Sun className="w-4 h-4" />, label: 'Öğlen' },
    { preset: 'afternoon', icon: <CloudSun className="w-4 h-4" />, label: 'Öğleden Sonra' },
    { preset: 'sunset', icon: <Sunset className="w-4 h-4" />, label: 'Gün Batımı' },
    { preset: 'night', icon: <Moon className="w-4 h-4" />, label: 'Gece' },
  ];

  return (
    <div className="space-y-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold">Aydınlatma Kontrolü</h3>
        </div>
        <button
          onClick={() => onChange({ ...config, enabled: !config.enabled })}
          className={cn(
            "p-2 rounded-lg transition-colors",
            config.enabled ? "bg-primary/20 text-primary" : "bg-slate-700 text-slate-400"
          )}
        >
          {config.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {config.enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {/* Time Presets */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              Zaman Preset
            </label>
            <div className="grid grid-cols-6 gap-1">
              {timePresets.map(({ preset, icon, label }) => (
                <button
                  key={preset}
                  onClick={() => handleTimePreset(preset)}
                  className={cn(
                    "p-2 rounded-xl flex flex-col items-center gap-1 transition-all",
                    config.timeOfDay === preset 
                      ? "bg-primary/20 text-primary border border-primary/50" 
                      : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  {icon}
                  <span className="text-[10px]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sun Direction Sphere */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              Güneş Yönü
            </label>
            <div className="flex gap-4">
              {/* Sphere Controller */}
              <div 
                className="relative w-32 h-32 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 cursor-crosshair"
                onClick={handleSphereClick}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                {/* Compass lines */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="absolute w-full h-px bg-slate-500" />
                  <div className="absolute w-px h-full bg-slate-500" />
                </div>
                
                {/* Direction labels */}
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">K</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">G</span>
                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">B</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">D</span>
                
                {/* Sun indicator */}
                <motion.div
                  className="absolute w-5 h-5 rounded-full shadow-lg -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    left: `${sunPos.x}%`, 
                    top: `${sunPos.y}%`,
                    background: getTemperatureColor(config.colorTemperature),
                    boxShadow: `0 0 20px ${getTemperatureColor(config.colorTemperature)}80`
                  }}
                  animate={{
                    scale: isDragging ? 1.2 : 1
                  }}
                />
              </div>

              {/* Values */}
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Azimut</span>
                  <span className="font-mono">{Math.round(config.sunDirection.azimuth)}°</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Yükseklik</span>
                  <span className="font-mono">{Math.round(config.sunDirection.elevation)}°</span>
                </div>
                <button
                  onClick={() => handleTimePreset('noon')}
                  className="w-full flex items-center justify-center gap-1 p-1.5 text-xs bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Sıfırla
                </button>
              </div>
            </div>
          </div>

          {/* Intensity */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Yoğunluk
              </label>
              <span className="text-xs font-mono">{config.intensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={config.intensity}
              onChange={(e) => onChange({ ...config, intensity: Number(e.target.value) })}
              className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Color Temperature */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ThermometerSun className="w-3 h-3" /> Renk Sıcaklığı
              </label>
              <span className="text-xs font-mono">{config.colorTemperature}K</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="2700"
                max="10000"
                value={config.colorTemperature}
                onChange={(e) => onChange({ ...config, colorTemperature: Number(e.target.value), timeOfDay: undefined })}
                className="w-full h-2 bg-gradient-to-r from-orange-500 via-white to-blue-300 rounded-lg appearance-none cursor-pointer"
                style={{
                  accentColor: getTemperatureColor(config.colorTemperature)
                }}
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>2700K (Sıcak)</span>
                <span>6500K (Doğal)</span>
                <span>10000K (Soğuk)</span>
              </div>
            </div>
          </div>

          {/* Shadow Type */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              Gölge Tipi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['soft', 'hard', 'none'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => onChange({ ...config, shadowType: type })}
                  className={cn(
                    "p-2 rounded-xl text-xs font-medium transition-all capitalize",
                    config.shadowType === type 
                      ? "bg-primary/20 text-primary border border-primary/50" 
                      : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  {type === 'soft' ? 'Yumuşak' : type === 'hard' ? 'Sert' : 'Yok'}
                </button>
              ))}
            </div>
          </div>

          {/* Ambient Occlusion Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
            <span className="text-sm">Ambient Occlusion</span>
            <button
              onClick={() => onChange({ ...config, ambientOcclusion: !config.ambientOcclusion })}
              className={cn(
                "w-10 h-6 rounded-full transition-colors relative",
                config.ambientOcclusion ? "bg-primary" : "bg-slate-600"
              )}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
                animate={{ left: config.ambientOcclusion ? 20 : 4 }}
              />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
