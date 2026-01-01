'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMarketplaceStore } from '@/stores/marketplace-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Download, Info, Puzzle, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketplaceModule } from '@/types/marketplace';
import { 
  Activity, Hammer, Network, Users, 
  LineChart, Box, Link,
  Building, BarChart, ShieldAlert, MonitorPlay, Cpu, ClipboardCheck, RefreshCw
} from 'lucide-react';

const IconMap: Record<string, any> = {
  Activity, Hammer, Network, Users, LineChart, Box, Link,
  Building, BarChart, ShieldAlert, MonitorPlay, Cpu, ClipboardCheck, RefreshCw
};

export default function AppDetailPage() {
    const params = useParams();
    const router = useRouter();
    const appId = params.appId as string;
    
    const { availableModules, installedModules, installModule, uninstallModule, loading } = useMarketplaceStore();

    const appModule = availableModules.find(m => m.id === appId);
    const addons = availableModules.filter(m => m.parentId === appId);
    const isMainInstalled = installedModules.some(m => m.moduleId === appId && m.status === 'active');

    if (!appModule) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <h2 className="text-2xl font-bold mb-4">Uygulama Bulunamadı</h2>
                <Button onClick={() => router.back()} variant="outline"> <ArrowLeft className="mr-2 h-4 w-4" /> Geri Dön</Button>
            </div>
        );
    }

    const Icon = IconMap[appModule.icon] || Puzzle;

    const handleAction = async (module: MarketplaceModule) => {
        if (module.id !== appId && !isMainInstalled && module.parentId === appId) {
             alert(`Önce ana uygulamayı (${appModule.name}) kurmalısınız.`);
             return;
        }

        const isInstalled = installedModules.some(m => m.moduleId === module.id && m.status === 'active');
        if (isInstalled) {
            await uninstallModule(module.id);
        } else {
            await installModule(module.id);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header / Hero */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-background to-muted/20 border border-border/50 p-8">
                 <Button onClick={() => router.back()} variant="ghost" className="absolute top-6 left-6 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Market
                 </Button>

                 <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mt-10 md:mt-2">
                    <div className="p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl border border-white/10 shadow-2xl">
                        <Icon className="w-20 h-20 text-indigo-400" />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                             <h1 className="text-4xl font-bold">{appModule.name}</h1>
                             {appModule.isPopular && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30">Popüler</Badge>}
                        </div>
                        <p className="text-xl text-muted-foreground max-w-2xl">{appModule.description}</p>
                        
                        <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                             <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-white/5">
                                <ShieldCheck className="w-4 h-4 mr-2 text-green-400" /> Resmi Modül
                             </div>
                             <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-white/5">
                                Sürüm {appModule.version}
                             </div>
                        </div>

                        <div className="pt-4 flex justify-center md:justify-start">
                             <Button 
                                size="lg" 
                                className={`text-lg px-8 py-6 rounded-2xl shadow-xl transition-all ${isMainInstalled ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/50' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                                onClick={() => handleAction(appModule)}
                                disabled={loading}
                             >
                                {loading ? 'İşleniyor...' : isMainInstalled ? 'Yüklü (Kaldır)' : 'Uygulamayı Yükle'}
                             </Button>
                        </div>
                    </div>
                 </div>
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Features Column */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" /> Özellikler
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {appModule.features.map((feat, i) => (
                            <div key={i} className="flex items-center p-4 rounded-xl bg-muted/30 border border-white/5">
                                <Check className="w-5 h-5 mr-3 text-indigo-500" />
                                <span>{feat}</span>
                            </div>
                        ))}
                         <div className="flex items-center p-4 rounded-xl bg-muted/30 border border-white/5 text-muted-foreground">
                                <Info className="w-5 h-5 mr-3" />
                                <span>Daha fazlası için dökümantasyona göz atın.</span>
                            </div>
                    </div>
                </div>

                {/* Addons / Packages Column */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-muted-foreground">
                        <Puzzle className="w-5 h-5" /> Eklenti Paketleri
                    </h2>
                    
                    <div className="space-y-4">
                        {addons.length === 0 ? (
                            <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-muted-foreground">
                                Bu uygulama için eklenti bulunmuyor.
                            </div>
                        ) : (
                            addons.map((addon) => {
                                const isAddonInstalled = installedModules.some(m => m.moduleId === addon.id && m.status === 'active');
                                const AddonIcon = IconMap[addon.icon] || Box;

                                return (
                                    <motion.div 
                                        key={addon.id} 
                                        whileHover={{ scale: 1.02 }}
                                        className={`p-4 rounded-xl border transition-all duration-300 ${isAddonInstalled ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-background/50 rounded-lg">
                                                    <AddonIcon className="w-5 h-5 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-sm">{addon.name}</h3>
                                                    <div className="text-xs text-muted-foreground font-semibold">
                                                        {addon.price === 0 ? 'Ücretsiz' : `$${addon.price}`}
                                                    </div>
                                                </div>
                                            </div>
                                            {addon.isNew && <Badge variant="secondary" className="text-[10px] h-5">YENİ</Badge>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                                            {addon.description}
                                        </p>
                                        <Button 
                                            variant={isAddonInstalled ? "outline" : "secondary"} 
                                            size="sm" 
                                            className="w-full text-xs h-8"
                                            disabled={!isMainInstalled || loading}
                                            onClick={() => handleAction(addon)}
                                        >
                                            {!isMainInstalled ? 'Ana Uygulama Gerekli' : isAddonInstalled ? 'Kaldır' : 'Paketi Yükle'}
                                        </Button>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
