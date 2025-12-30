'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Activity, Hammer, Network, Users, 
  Search, ShoppingBag, 
  LineChart, Box, Link, Puzzle, ArrowRight,
  Building, BarChart, ShieldAlert, MonitorPlay, Cpu, ClipboardCheck, RefreshCw,
  Sparkles, Grid, Layers, Shuffle, LayoutDashboard
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMarketplaceStore } from '@/stores/marketplace-store';
import { useAuthStore } from '@/stores/auth-store';
import { Module } from '@/types';

// Icons mapping
const IconMap: Record<string, any> = {
  Activity, Hammer, Network, Users, LineChart, Box, Link,
  Building, BarChart, ShieldAlert, MonitorPlay, Cpu, ClipboardCheck, RefreshCw, Shuffle,
  LayoutDashboard
};

export default function StorePage() {
  const [filter, setFilter] = useState('');
  const router = useRouter();
  
  const { modules, fetchModules, loading, installModule, uninstallModule, isModuleInstalled } = useMarketplaceStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const apps = modules.filter(m => m.type === 'app' && (
      m.name.toLowerCase().includes(filter.toLowerCase()) || 
      m.description.toLowerCase().includes(filter.toLowerCase())
  ));

  const integrations = modules.filter(m => m.type === 'integration' && (
      m.name.toLowerCase().includes(filter.toLowerCase()) || 
      m.description.toLowerCase().includes(filter.toLowerCase())
  ));

  const handleIntegrationAction = async (module: Module) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (isModuleInstalled(module.id)) {
        await uninstallModule(module.id, user.uid);
    } else {
        await installModule(module, user.uid);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col space-y-12 animate-in fade-in duration-500 pb-24">
      
      {/* Header / Nav */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
           <div className="container mx-auto px-4 py-4 flex justify-between items-center">
               <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                   <div className="bg-indigo-600 rounded-lg p-1.5"><ShoppingBag className="w-5 h-5 text-white" /></div> 
                   T-Market
               </div>
               <div className="flex gap-4">
                   <Button variant="ghost" onClick={() => router.push('/')}>Home</Button>
                   <Button variant="secondary" onClick={() => router.push('/account')}>My Account</Button>
               </div>
           </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl mx-4 bg-gradient-to-b from-slate-900 to-slate-950 border border-white/5 py-16 md:py-24">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative container mx-auto px-4 text-center z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-8">
                 <Sparkles className="w-4 h-4" /> Official T-Ecosystem Store
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                Expand Your Ecosystem
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Discover powerful modules, add-ons, and integrations to supercharge your Unified Project Hub.
            </p>
            
            <div className="max-w-xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative flex items-center bg-slate-900 rounded-xl border border-white/10 shadow-2xl">
                    <Search className="ml-5 w-5 h-5 text-slate-500" />
                    <Input 
                        placeholder="Search apps, modules, and integrations..." 
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-7 text-lg placeholder:text-slate-600 text-white" 
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
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Grid className="w-6 h-6 text-indigo-500" />
                    Core Applications
                </h2>
                <p className="text-slate-400">The foundational platforms of the ecosystem.</p>
             </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {apps.map((app, idx) => {
                const Icon = IconMap[app.icon] || Puzzle;
                const installed = isModuleInstalled(app.id);
                // Count addons for this app
                const addonCount = modules.filter(m => m.parentId === app.id).length;

                return (
                <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    onClick={() => router.push(`/store/${app.id}`)}
                    className="cursor-pointer group h-full"
                >
                    <div className={`relative h-full rounded-3xl p-6 border transition-all duration-300 overflow-visible flex flex-col group
                        ${installed 
                            ? 'bg-gradient-to-br from-indigo-900/40 to-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-900/20' 
                            : 'bg-white/[0.02] border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04]'
                        }
                    `}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl shadow-lg transition-all duration-300 ${installed ? 'bg-indigo-600 text-white shadow-indigo-500/30' : 'bg-white/5 text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400'}`}>
                                <Icon className="w-8 h-8" />
                            </div>
                            {installed && (
                                <Badge className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-indigo-500/30 px-3">Installed</Badge>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{app.name}</h3>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-1 leading-relaxed">
                            {app.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                            <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-xs font-normal text-slate-400 border border-white/5">
                                {addonCount} Modules
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-indigo-400 transition-all" />
                        </div>
                    </div>
                </motion.div>
                );
            })}
        </div>
      </div>

      {/* System Integrations Section */}
      <div className="container mx-auto px-4">
         <div className="bg-gradient-to-br from-emerald-950/30 to-slate-900 rounded-3xl p-8 border border-emerald-500/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Shuffle className="w-6 h-6 text-emerald-500" />
                        System Integrations
                    </h2>
                    <p className="text-slate-400">Bridge your apps for seamless data synchronicity.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {integrations.map((integration, idx) => {
                    const Icon = IconMap[integration.icon] || Link;
                    const installed = isModuleInstalled(integration.id);

                    return (
                        <motion.div
                            key={integration.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (idx * 0.1) }}
                        >
                            <Card className={`h-full border transition-all duration-300 ${installed ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-slate-900/50 border-white/5 hover:border-white/10 hover:bg-slate-900/80'}`}>
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <div className={`p-2.5 rounded-xl ${installed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg text-white">{integration.name}</CardTitle>
                                        <CardDescription className="text-xs mt-1 text-slate-500 font-medium uppercase tracking-wider">Cross-App</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                                        {integration.description}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-4 flex justify-between items-center border-t border-white/5 mt-auto">
                                    <div className="text-sm font-semibold text-white">
                                        {integration.price === 0 ? 'Free' : `$${integration.price}`}
                                    </div>
                                    <Button 
                                        size="sm" 
                                        className={installed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20" : "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500"}
                                        onClick={() => handleIntegrationAction(integration)}
                                        disabled={loading}
                                    >
                                        {loading ? '...' : installed ? 'Remove' : 'Add to Cart'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
         </div>
      </div>
    </div>
  );
}
