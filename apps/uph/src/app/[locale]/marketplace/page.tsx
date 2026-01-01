'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  Activity, Hammer, Network, Users, 
  Search, ShoppingBag, Check, Download, Star,
  LineChart, Box, Link, Puzzle, ArrowRight,
  Building, BarChart, ShieldAlert, MonitorPlay, Cpu, ClipboardCheck, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarketplaceStore } from '@/stores/marketplace-store';
import { MarketplaceModule, ModuleType } from '@/types/marketplace';

// Icons
const IconMap: Record<string, any> = {
  Activity, Hammer, Network, Users, LineChart, Box, Link,
  Building, BarChart, ShieldAlert, MonitorPlay, Cpu, ClipboardCheck, RefreshCw
};

export default function MarketplacePage() {
  const [filter, setFilter] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  
  const { availableModules, installedModules, installModule, uninstallModule, loading } = useMarketplaceStore();

  const isInstalled = (id: string) => installedModules.some(m => m.moduleId === id && m.status === 'active');

  const handleAction = async (module: MarketplaceModule) => {
    // Check dependency if it's an addon
    if (module.type === 'addon' && module.parentId && !isInstalled(module.parentId)) {
        alert(`Bu eklentiyi kurmak için önce ana uygulamayı (${module.parentId}) kurmalısınız.`);
        return;
    }

    if (isInstalled(module.id)) {
      await uninstallModule(module.id);
    } else {
      await installModule(module.id);
    }
  };

  const filteredModules = availableModules.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(filter.toLowerCase()) || m.description.toLowerCase().includes(filter.toLowerCase());
    const matchesTab = activeTab === 'all' || m.type === activeTab || (activeTab === 'apps' && m.type === 'app'); // simplified mapping
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-indigo-500" />
            Feature Store
          </h1>
          <p className="text-muted-foreground mt-1">Sisteminizi özelleştirmek için modül ve eklentiler.</p>
        </div>
        <div className="relative w-full md:w-72">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input 
                placeholder="Özellik ara..." 
                className="pl-9 bg-black/20 border-white/10" 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
             />
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="app">Uygulamalar</TabsTrigger>
            <TabsTrigger value="addon">Eklentiler</TabsTrigger>
            <TabsTrigger value="integration">Entegrasyonlar</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Modules Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredModules.map((module, idx) => {
            const Icon = IconMap[module.icon] || Puzzle;
            const installed = isInstalled(module.id);
            const parentInstalled = module.parentId ? isInstalled(module.parentId) : true;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`h-full border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 flex flex-col ${installed ? 'border-green-500/30 bg-green-500/5' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                        <div className={`p-3 rounded-xl ${installed ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-muted-foreground'}`}>
                            <Icon className="w-8 h-8" />
                        </div>
                        <div className="flex gap-2">
                            {module.type === 'addon' && <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">Add-on</Badge>}
                            {module.type === 'integration' && <Badge variant="outline" className="border-purple-500/30 text-purple-400">Integration</Badge>}
                        </div>
                    </div>
                    <CardTitle className="text-xl">{module.name}</CardTitle>
                    <CardDescription>{module.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-foreground/80 mb-4 h-12 line-clamp-2">
                        {module.description}
                    </p>
                    {module.parentId && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 p-2 rounded bg-black/20 border border-white/5">
                            <ArrowRight className="w-3 h-3" />
                            Gereksinim: <span className="font-mono text-foreground">{module.parentId}</span>
                            {!parentInstalled && <span className="text-red-400">(Eksik)</span>}
                        </div>
                    )}
                    <div className="space-y-2">
                        {module.features.slice(0, 3).map((feat, i) => (
                            <div key={i} className="flex items-center text-xs text-muted-foreground">
                                <Check className="w-3 h-3 mr-2 text-indigo-500" />
                                {feat}
                            </div>
                        ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t border-white/5 pt-4">
                     <div className="text-sm font-bold">
                        {module.price === 0 ? 'Ücretsiz' : `$${module.price}`}
                     </div>
                     <Button 
                        variant={installed ? "outline" : "default"}
                        className={`
                            ${installed ? 'border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
                        `}
                        onClick={() => handleAction(module)}
                        disabled={loading || (module.type === 'addon' && !parentInstalled)}
                     >
                        {loading ? '...' : installed ? 'Kaldır' : 'Yükle'}
                     </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
        })}
      </div>
    </div>
  );
}
