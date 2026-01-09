'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Package, 
  Clock, 
  Settings, 
  X, 
  ChevronRight,
  LayoutDashboard,
  Warehouse,
  BarChart3,
  AlertTriangle,
  QrCode,
  ShoppingCart,
  Wrench,
  Boxes
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/stores/data-store';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface WelcomeScreenProps {
  onClose: () => void;
  onAddProduct: () => void;
}

export function WelcomeScreen({ onClose, onAddProduct }: WelcomeScreenProps) {
  const router = useRouter();
  const { products, equipment, consumables, warehouses, fetchAllData, loadingProducts } = useDataStore();
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchAllData();
      setIsLoading(false);
    };
    loadData();
  }, [fetchAllData]);

  // Stats
  const totalProducts = products.length;
  const totalEquipment = equipment.length;
  const totalConsumables = consumables.length;
  const totalWarehouses = warehouses.length;
  const lowStockProducts = products.filter(p => p.stock <= (p.minStock || 5)).length;
  const totalValue = products.reduce((acc, p) => acc + (p.stock * (p.price || 0)), 0);

  // Recent products (last 5, sorted by date)
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
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
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-teal-500/10 rounded-full blur-[80px]" />
        </div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl w-full h-[650px] bg-card/80 backdrop-blur-2xl border border-border rounded-3xl shadow-2xl flex relative overflow-hidden"
        >
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-50 hover:bg-muted/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Side: Brand & Actions */}
          <div className="w-[40%] bg-muted/30 p-10 flex flex-col justify-between border-r border-border">
            <div>
              {/* Brand */}
              <div className="mb-10">
                <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-teal-300 to-cyan-500 mb-2">
                  ENV-I
                </h1>
                <p className="text-muted-foreground font-medium">Envanter Yönetim Sistemi</p>
                <p className="text-xs text-muted-foreground/80 mt-1">T-Ecosystem v1.0</p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={onAddProduct}
                  className="w-full h-14 justify-start pl-6 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0 rounded-2xl shadow-lg shadow-emerald-500/20 group"
                >
                  <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" />
                  Yeni Ürün Ekle
                </Button>

                <Button 
                  onClick={() => navigateTo('/inventory')}
                  variant="ghost"
                  className="w-full h-12 justify-start pl-6 text-base hover:bg-accent hover:text-accent-foreground text-foreground rounded-xl group"
                >
                  <Package className="w-5 h-5 mr-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                  Stok Listesi
                </Button>

                <Button 
                  onClick={() => navigateTo('/warehouses')}
                  variant="ghost"
                  className="w-full h-12 justify-start pl-6 text-base hover:bg-accent hover:text-accent-foreground text-foreground rounded-xl group"
                >
                  <Warehouse className="w-5 h-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform" />
                  Depolar ({totalWarehouses})
                </Button>

                <Button 
                  onClick={() => navigateTo('/orders')}
                  variant="ghost"
                  className="w-full h-12 justify-start pl-6 text-base hover:bg-accent hover:text-accent-foreground text-foreground rounded-xl group"
                >
                  <ShoppingCart className="w-5 h-5 mr-3 text-amber-400 group-hover:scale-110 transition-transform" />
                  Siparişler
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Boxes className="w-3 h-3" /> Toplam Ürün
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? <span className="animate-pulse">...</span> : totalProducts}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <BarChart3 className="w-3 h-3" /> Envanter Değeri
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {isLoading ? <span className="animate-pulse">...</span> : `₺${totalValue.toLocaleString('tr-TR')}`}
                  </p>
                </div>
              </div>

              {lowStockProducts > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">{lowStockProducts} düşük stoklu ürün</p>
                    <p className="text-xs text-amber-500/70">Stok kontrolü gerekiyor</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Links */}
            <div className="flex gap-4 pt-6 border-t border-border">
              <button 
                onClick={() => navigateTo('/settings')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                <Settings className="w-4 h-4" /> Ayarlar
              </button>
              <button 
                onClick={() => navigateTo('/reports')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                <BarChart3 className="w-4 h-4" /> Raporlar
              </button>
            </div>
          </div>

          {/* Right Side: Recent Products & Categories */}
          <div className="flex-1 bg-card/50 p-10 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Son Ürünler
              </h2>
              <button 
                onClick={() => navigateTo('/inventory')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Tümünü Gör
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
              {recentProducts.length > 0 ? (
                <div className="space-y-3">
                  {recentProducts.map((product, idx) => (
                    <motion.div 
                      key={`${product.id}-${idx}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => navigateTo(`/inventory/${product.id}`)}
                      className="group p-4 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 hover:border-border/80 transition-all cursor-pointer flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-base truncate group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            product.stock <= (product.minStock || 5) ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          Stok: {product.stock} {product.unit || 'adet'}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Package className="w-16 h-16 mb-4 stroke-1 opacity-30" />
                  <p className="text-sm">Henüz ürün eklenmedi</p>
                  <p className="text-xs mt-1 text-muted-foreground/80">İlk ürününüzü eklemek için sol taraftaki butonu kullanın</p>
                </div>
              )}
            </div>

            {/* Category Quick Access */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Kategoriler</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateTo('/inventory')}
                  className="border-border hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg gap-2"
                >
                  <Package className="w-4 h-4 text-emerald-400" />
                  Ürünler ({totalProducts})
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateTo('/equipment')}
                  className="border-border hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg gap-2"
                >
                  <Wrench className="w-4 h-4 text-blue-400" />
                  Ekipman ({totalEquipment})
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateTo('/consumables')}
                  className="border-border hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg gap-2"
                >
                  <Boxes className="w-4 h-4 text-amber-400" />
                  Sarf ({totalConsumables})
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
