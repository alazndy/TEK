'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Activity, Hammer, Network, Users, 
  Search, ShoppingBag, 
  LineChart, Box, Link, Puzzle, ArrowRight,
  Building, BarChart, ShieldAlert, MonitorPlay, Cpu, ClipboardCheck, RefreshCw,
  Sparkles, Grid, Layers, Shuffle, Plug
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMarketplaceStore } from '@/stores/marketplace-store';
import { MarketplaceModule } from '@/types/marketplace';

// Icons mapping
const IconMap: Record<string, any> = {
  Activity, Hammer, Network, Users, LineChart, Box, Link,
  Building, BarChart, ShieldAlert, MonitorPlay, Cpu, ClipboardCheck, RefreshCw, Shuffle, Plug
};

export default function MarketplacePage() {
  const [filter, setFilter] = React.useState('');
  const router = useRouter();
  
  const { availableModules, installedModules, installModule, uninstallModule, loading } = useMarketplaceStore();

  const isInstalled = (id: string) => installedModules.some(m => m.moduleId === id && m.status === 'active');

  const apps = availableModules.filter(m => m.type === 'app' && (
      m.name.toLowerCase().includes(filter.toLowerCase()) || 
      m.description.toLowerCase().includes(filter.toLowerCase())
  ));

  const integrations = availableModules.filter(m => m.type === 'integration' && (
    m.name.toLowerCase().includes(filter.toLowerCase()) || 
    m.description.toLowerCase().includes(filter.toLowerCase())
  ));

  const handleIntegrationAction = async (module: MarketplaceModule) => {
    // For integrations, we often just want to "Enable" them directly without a detail page
    if (isInstalled(module.id)) {
        await uninstallModule(module.id);
    } else {
        await installModule(module.id);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-12 animate-in fade-in duration-500 pb-24">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-b-[3rem] bg-gradient-to-b from-indigo-950 to-background pt-16 pb-12 md:pt-24 md:pb-20 border-b border-indigo-500/10">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
          
          <div className="relative container mx-auto px-4 text-center z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
                 <Sparkles className="w-3 h-3" /> T-Ecosystem V3 Store
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-br from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent mb-6">
                Ecosystem Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                İşletim sisteminizi özelleştirin. Entegre uygulamalar ve güçlü bağlantı paketleri ile verimliliğinizi artırın.
            </p>
            
            <div className="max-w-xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative flex items-center bg-background/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                    <Search className="ml-5 w-5 h-5 text-muted-foreground" />
                    <Input 
                        placeholder="Modül, uygulama veya entegrasyon ara..." 
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-6 text-lg placeholder:text-muted-foreground/50" 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>
          </div>
      </div>

      {/* Core Applications Section */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
             <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
                    <Grid className="w-6 h-6 text-indigo-500" />
                    Ana Uygulamalar
                </h2>
                <p className="text-sm text-muted-foreground">Ekosistemin temel yapı taşları.</p>
             </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {apps.map((app, idx) => {
                const Icon = IconMap[app.icon] || Puzzle;
                const installed = isInstalled(app.id);
                const addonCount = availableModules.filter(m => m.parentId === app.id).length;

                return (
                <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    onClick={() => router.push(`/marketplace/${app.id}`)}
                    className="cursor-pointer group h-full"
                >
                    <div className={`relative h-full rounded-3xl p-6 border transition-all duration-300 overflow-visible flex flex-col group
                        ${installed 
                            ? 'bg-gradient-to-br from-indigo-500/5 to-purple-900/10 border-indigo-500/30' 
                            : 'bg-gradient-to-br from-white/5 to-white/0 border-white/5 hover:border-indigo-500/30 hover:bg-white/5'
                        }
                    `}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl shadow-lg transition-all duration-300 ${installed ? 'bg-indigo-500 text-white shadow-indigo-500/25' : 'bg-muted text-muted-foreground group-hover:bg-white/10 group-hover:text-indigo-400'}`}>
                                <Icon className="w-8 h-8" />
                            </div>
                            {installed && (
                                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Yüklü</Badge>
                            )}
                        </div>

                        <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors">{app.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                            {app.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                            <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-xs font-normal text-muted-foreground">
                                {addonCount} Eklenti
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </motion.div>
                );
            })}
        </div>
      </div>

      {/* System Integrations Section */}
      <div className="container mx-auto px-4 bg-white/2 rounded-3xl p-8 border border-white/5">
         <div className="flex items-center justify-between mb-8">
             <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
                    <Shuffle className="w-6 h-6 text-emerald-500" />
                    Sistem Entegrasyonları
                </h2>
                <p className="text-sm text-muted-foreground">Uygulamaları birbirine bağlayan güçlendirici paketler.</p>
             </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration, idx) => {
                const Icon = IconMap[integration.icon] || Link;
                const installed = isInstalled(integration.id);

                return (
                    <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (idx * 0.1) }}
                    >
                         <Card className={`h-full border transition-all duration-300 ${installed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className={`p-2 rounded-lg ${installed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-muted-foreground'}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-base">{integration.name}</CardTitle>
                                    <CardDescription className="text-xs mt-1">Sistem Genelinde</CardDescription>
                                </div>
                                {installed && <Check className="w-5 h-5 text-emerald-500" />}
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                    {integration.description}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-2 flex justify-between items-center border-t border-white/5">
                                <div className="text-sm font-semibold">
                                    {integration.price === 0 ? 'Ücretsiz' : `$${integration.price}`}
                                </div>
                                <Button 
                                    size="sm" 
                                    variant={installed ? "outline" : "default"}
                                    className={installed ? "" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                                    onClick={() => handleIntegrationAction(integration)}
                                    disabled={loading}
                                >
                                    {loading ? '...' : installed ? 'Paketi Kaldır' : 'Sepete Ekle'}
                                </Button>
                            </CardFooter>
                         </Card>
                    </motion.div>
                );
            })}
        </div>
      </div>
    </div>
  );
}
