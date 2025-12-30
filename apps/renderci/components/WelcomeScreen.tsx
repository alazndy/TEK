import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  FolderOpen, 
  Clock, 
  Settings, 
  X, 
  ChevronRight,
  Box,
  Image,
  Palette,
  Sparkles,
  Layers,
  SunDim
} from 'lucide-react';

interface RecentRender {
  id: string;
  name: string;
  date: string;
  thumbnail?: string;
}

interface WelcomeScreenProps {
  onNewProject: () => void;
  onOpenFile: () => void;
  onOpenRecent?: (render: RecentRender) => void;
  onSettings?: () => void;
  onClose: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onNewProject, 
  onOpenFile, 
  onOpenRecent,
  onSettings,
  onClose 
}) => {
  const [recentRenders, setRecentRenders] = useState<RecentRender[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const savedRecents = localStorage.getItem('renderci_recent_renders');
    if (savedRecents) {
      setRecentRenders(JSON.parse(savedRecents));
    } else {
      // Mock data for demonstration
      setRecentRenders([
        { id: '1', name: 'Anakart PCB Render', date: '2024-01-15' },
        { id: '2', name: 'Mekanik Parça v3', date: '2024-01-12' },
        { id: '3', name: 'Ürün Vizualizasyon', date: '2024-01-10' },
      ]);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-4"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-orange-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-rose-500/10 rounded-full blur-[80px]" />
        </div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl w-full h-[600px] bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex relative overflow-hidden"
        >
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors z-50 hover:bg-white/5 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Side: Brand & Actions */}
          <div className="w-[40%] bg-black/30 p-10 flex flex-col justify-between border-r border-white/5">
            <div>
              {/* Brand */}
              <div className="mb-10">
                <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500 mb-2">
                  Rendercı Muhittin
                </h1>
                <p className="text-zinc-400 font-medium">Teknik Görselleştirme</p>
                <p className="text-xs text-zinc-600 mt-1">T-Ecosystem v1.0</p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button 
                  onClick={onNewProject}
                  className="w-full h-14 flex items-center justify-start pl-6 text-lg bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white border-0 rounded-2xl shadow-lg shadow-orange-500/20 group transition-all"
                >
                  <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" />
                  Yeni Render Başlat
                </button>

                <button 
                  onClick={onOpenFile}
                  className="w-full h-12 flex items-center justify-start pl-6 text-base hover:bg-white/10 text-zinc-200 rounded-xl group transition-all"
                >
                  <FolderOpen className="w-5 h-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform" />
                  Dosya Aç (DXF, STEP, GLB)
                </button>

                <button 
                  onClick={onOpenFile}
                  className="w-full h-12 flex items-center justify-start pl-6 text-base hover:bg-white/10 text-zinc-200 rounded-xl group transition-all"
                >
                  <Box className="w-5 h-5 mr-3 text-purple-400 group-hover:scale-110 transition-transform" />
                  3D Model Yükle
                </button>

                <button 
                  onClick={onOpenFile}
                  className="w-full h-12 flex items-center justify-start pl-6 text-base hover:bg-white/10 text-zinc-200 rounded-xl group transition-all"
                >
                  <Image className="w-5 h-5 mr-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                  Görsel İyileştirme
                </button>
              </div>

              {/* Features */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-zinc-400">AI Render</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-zinc-400">Çoklu Katman</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <SunDim className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-zinc-400">HDRI Aydınlatma</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-400" />
                  <span className="text-xs text-zinc-400">Materyal Lib.</span>
                </div>
              </div>
            </div>

            {/* Bottom Links */}
            <div className="flex gap-4 pt-6 border-t border-white/5">
              <button onClick={onSettings} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium">
                <Settings className="w-4 h-4" /> Ayarlar
              </button>
            </div>
          </div>

          {/* Right Side: Recent Renders */}
          <div className="flex-1 bg-zinc-900/50 p-10 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-200 flex items-center gap-2">
                <Clock className="w-5 h-5 text-zinc-500" />
                Son Renderlar
              </h2>
              <button className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors">
                Tümünü Gör
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
              {recentRenders.length > 0 ? (
                <div className="space-y-3">
                  {recentRenders.map((render, idx) => (
                    <motion.div 
                      key={render.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => onOpenRecent?.(render)}
                      className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Image className="w-6 h-6 text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-zinc-200 text-base truncate group-hover:text-white transition-colors">
                          {render.name}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {render.date}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                  <Image className="w-16 h-16 mb-4 stroke-1 opacity-30" />
                  <p className="text-sm">Henüz render oluşturmadınız</p>
                  <p className="text-xs mt-1 text-zinc-600">İlk renderınızı başlatmak için sol taraftaki butonu kullanın</p>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-orange-500/20">
                  T
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-300">Hoş Geldiniz</span>
                  <span className="text-xs text-zinc-500">T-Ecosystem Pro</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
