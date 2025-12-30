'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  FolderOpen, 
  Clock, 
  Settings, 
  X, 
  ChevronRight,
  LayoutDashboard,
  Package,
  Receipt,
  Wrench,
  TrendingUp,
  AlertTriangle,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/stores/project-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface WelcomeScreenProps {
  onClose: () => void;
  onNewProject: () => void;
}

// Helper to safely parse dates
const safeParseDate = (dateValue: string | Date | undefined | null): Date => {
  if (!dateValue) return new Date();
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? new Date() : date;
};

const formatSafeDate = (dateValue: string | Date | undefined | null): string => {
  try {
    const date = safeParseDate(dateValue);
    return format(date, 'dd MMM yyyy', { locale: tr });
  } catch {
    return '-';
  }
};

export function WelcomeScreen({ onClose, onNewProject }: WelcomeScreenProps) {
  const router = useRouter();
  const { projects, fetchProjects } = useProjectStore();
  const { products, fetchInventory } = useInventoryStore();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchProjects();
    fetchInventory();
  }, [fetchProjects, fetchInventory]);

  // Stats
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = projects.reduce((acc, p) => acc + p.spent, 0);
  const budgetPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const lowStockItems = products.filter(p => p.stock <= (p.minStock || 5)).length;

  // Recent projects (last 5, sorted by date)
  const recentProjects = [...projects]
    .sort((a, b) => safeParseDate(b.updatedAt || b.createdAt).getTime() - safeParseDate(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const navigateTo = (path: string) => {
    handleClose();
    router.push(path);
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
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full blur-[80px]" />
        </div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl w-full h-[650px] bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex relative overflow-hidden"
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
                <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 mb-2">
                  UPH
                </h1>
                <p className="text-zinc-400 font-medium">Unified Project Hub</p>
                <p className="text-xs text-zinc-600 mt-1">T-Ecosystem v1.0</p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={onNewProject}
                  className="w-full h-14 justify-start pl-6 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 rounded-2xl shadow-lg shadow-purple-500/20 group"
                >
                  <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" />
                  Yeni Proje Oluştur
                </Button>

                <Button 
                  onClick={() => navigateTo('/projects')}
                  variant="ghost"
                  className="w-full h-12 justify-start pl-6 text-base hover:bg-white/10 text-zinc-200 rounded-xl group"
                >
                  <FolderOpen className="w-5 h-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform" />
                  Projelerime Git
                </Button>

                <Button 
                  onClick={() => navigateTo('/inventory')}
                  variant="ghost"
                  className="w-full h-12 justify-start pl-6 text-base hover:bg-white/10 text-zinc-200 rounded-xl group"
                >
                  <Package className="w-5 h-5 mr-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                  Envanter
                </Button>

                <Button 
                  onClick={() => navigateTo('/engineering/ecr')}
                  variant="ghost"
                  className="w-full h-12 justify-start pl-6 text-base hover:bg-white/10 text-zinc-200 rounded-xl group"
                >
                  <Wrench className="w-5 h-5 mr-3 text-amber-400 group-hover:scale-110 transition-transform" />
                  Mühendislik
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <TrendingUp className="w-3 h-3" /> Aktif Proje
                  </div>
                  <p className="text-2xl font-bold text-white">{activeProjects}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <Receipt className="w-3 h-3" /> Bütçe Kullanımı
                  </div>
                  <p className="text-2xl font-bold text-white">{budgetPercent}%</p>
                </div>
              </div>

              {lowStockItems > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">{lowStockItems} düşük stoklu ürün</p>
                    <p className="text-xs text-amber-500/70">Envanterde kontrol gerekiyor</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Links */}
            <div className="flex gap-4 pt-6 border-t border-white/5">
              <button 
                onClick={() => navigateTo('/settings')}
                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
              >
                <Settings className="w-4 h-4" /> Ayarlar
              </button>
              <button 
                onClick={() => navigateTo('/teams')}
                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
              >
                <Users className="w-4 h-4" /> Takımlar
              </button>
            </div>
          </div>

          {/* Right Side: Recent Projects */}
          <div className="flex-1 bg-zinc-900/50 p-10 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-200 flex items-center gap-2">
                <Clock className="w-5 h-5 text-zinc-500" />
                Son Projeler
              </h2>
              <button 
                onClick={() => navigateTo('/projects')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Tümünü Gör
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
              {recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map((project, idx) => (
                    <motion.div 
                      key={project.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => navigateTo(`/projects/${project.id}`)}
                      className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center gap-4"
                    >
                      <div 
                        className="w-12 h-12 rounded-lg border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${project.color}20` }}
                      >
                        <LayoutDashboard className="w-6 h-6" style={{ color: project.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-zinc-200 text-base truncate group-hover:text-white transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            project.status === 'Active' ? 'bg-emerald-500' :
                            project.status === 'Planning' ? 'bg-blue-500' :
                            project.status === 'On Hold' ? 'bg-amber-500' : 'bg-zinc-500'
                          }`} />
                          {project.status} • {formatSafeDate(project.updatedAt || project.createdAt)}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                  <FolderOpen className="w-16 h-16 mb-4 stroke-1 opacity-30" />
                  <p className="text-sm">Henüz proje oluşturmadınız</p>
                  <p className="text-xs mt-1 text-zinc-600">İlk projenizi oluşturmak için sol taraftaki butonu kullanın</p>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-purple-500/20">
                  T
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-300">Hoş Geldiniz</span>
                  <span className="text-xs text-zinc-500">T-Ecosystem Pro</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateTo('/dashboard')}
                className="text-zinc-500 hover:text-white"
              >
                Dashboard'a Git →
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
