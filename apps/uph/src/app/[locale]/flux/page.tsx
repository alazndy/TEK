'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Activity, Wifi, WifiOff, Cpu, Thermometer, Zap, Server, Search, RefreshCw, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; // Standard button for the lock screen
import { useFluxStore } from '@/stores/flux-store';
import { AddDeviceDialog } from '@/components/flux/add-device-dialog';
import { BrokerConnectionDialog } from '@/components/flux/broker-connection-dialog';
import { FeatureGuard } from '@/components/common/feature-guard';
import { useMarketplaceStore } from '@/stores/marketplace-store';
import { useRouter } from 'next/navigation';
import type { FluxStatCard } from '@/types/flux';

export default function FluxPage() {
  const t = useTranslations('Common');
  const tFlux = useTranslations('Flux');
  const [filter, setFilter] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  
  const { 
    devices, stats, fetchDevices, refreshStats, loading,
    isBrokerConnected, disconnectFromBroker 
  } = useFluxStore();
  const router = useRouter();

  // We use this manually inside the render for the fallback UI
  const hasAnalytics = useMarketplaceStore(state => state.checkAccess('flux_charts'));

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(() => {
      refreshStats();
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  const statCards: FluxStatCard[] = [
    { title: tFlux('stats.online'), value: `${stats.onlineCount}/${stats.totalDevices}`, icon: Wifi, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: tFlux('stats.power'), value: `${stats.totalPower} kW`, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { title: tFlux('stats.temp'), value: `${stats.avgTemp}°C`, icon: Thermometer, color: 'text-red-500', bg: 'bg-red-500/10' },
    { title: tFlux('stats.load'), value: `%${stats.systemLoad}`, icon: Activity, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  ];

   const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(filter.toLowerCase()) || 
    d.location.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <FeatureGuard module="flux-core">
      <div className="space-y-8 p-8 max-w-7xl mx-auto pb-24 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <Activity className="w-8 h-8 text-cyan-500" />
              {tFlux('title')}
            </h1>
            <p className="text-muted-foreground mt-1">{tFlux('subtitle')}</p>
          </div>
          <div className="flex gap-2">
              <PremiumButton 
                  variant={isBrokerConnected ? "premium" : "glass"}
                  className={isBrokerConnected ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/50" : ""}
                  onClick={() => isBrokerConnected ? disconnectFromBroker() : setShowConnectionDialog(true)}
              >
                  {isBrokerConnected ? <Wifi className="w-4 h-4 mr-2 animate-pulse" /> : <WifiOff className="w-4 h-4 mr-2" />}
                  {isBrokerConnected ? "Bridge Online" : "Connect Bridge"}
              </PremiumButton>

              <PremiumButton variant="glass" onClick={() => fetchDevices()}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {tFlux('refresh')}
              </PremiumButton>
              <PremiumButton 
                  variant="premium" 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20"
                  onClick={() => setShowAddDialog(true)}
              >
                  <Server className="w-4 h-4 mr-2" />
                  {tFlux('newDevice')}
              </PremiumButton>
          </div>
        </div>

        {/* Stats Grid - GUARDED BY ANALYTICS PRO */}
        <div className="relative">
            {!hasAnalytics && (
                <div className="absolute inset-0 z-10 glass-panel border-white/5 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl text-center p-6 border border-white/10">
                    <div className="p-3 bg-cyan-500/20 rounded-full mb-4">
                        <Lock className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Analytics Pro Gerekli</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Detaylı enerji analizi ve anlık metrik takibi için <strong>Flux Analytics Pro</strong> eklentisini edinin.
                    </p>
                    <Button 
                        onClick={() => router.push('/marketplace')}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20"
                    >
                        Markete Git
                    </Button>
                </div>
            )}
            
            <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${!hasAnalytics ? 'opacity-20 pointer-events-none' : ''}`}>
                {statCards.map((stat, i) => (
                    <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    >
                    <Card className="glass-panel border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        </CardContent>
                    </Card>
                    </motion.div>
                ))}
            </div>
        </div>


         {/* Live Monitoring Section - Core Feature (Always Visible if permissions pass) */}
         <div className="grid gap-8 md:grid-cols-3">
            {/* Device List */}
            <Card className="glass-panel border-white/5 md:col-span-3 bg-zinc-900/40 backdrop-blur-xl">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>{tFlux('connectedDevices')}</CardTitle>
                  <CardDescription>{tFlux('connectedDevicesDesc')}</CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <Input 
                          placeholder={t('searchPlaceholder')} 
                          className="pl-9 bg-black/20 border-white/10" 
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                     />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                  {filteredDevices.length > 0 ? filteredDevices.map((dev, idx) => (
                    <motion.div
                      key={dev.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`
                          p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1
                          ${dev.status === 'Online' ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40' : ''}
                          ${dev.status === 'Warning' ? 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40' : ''}
                          ${dev.status === 'Offline' ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40 opacity-70' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-xl transition-colors ${
                              dev.status === 'Online' ? 'bg-green-500/10 text-green-500 group-hover:bg-green-500/20' :
                              dev.status === 'Warning' ? 'bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20' : 'bg-red-500/10 text-red-500 group-hover:bg-red-500/20'
                          }`}>
                              <Cpu className="w-6 h-6" />
                          </div>
                          <Badge variant="outline" className={`
                              ${dev.status === 'Online' ? 'text-green-500 border-green-500/20 bg-green-500/5' : ''}
                              ${dev.status === 'Warning' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' : ''}
                              ${dev.status === 'Offline' ? 'text-red-500 border-red-500/20 bg-red-500/5' : ''}
                          `}>
                              {dev.status === 'Online' ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                              {dev.status}
                          </Badge>
                      </div>

                      <h3 className="font-bold text-lg mb-1 text-foreground">{dev.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                          <Server className="w-3 h-3" /> {dev.location}
                      </p>
                    </motion.div>
                  )) : (
                       <div className="md:col-span-2 xl:col-span-4 text-center py-12 text-muted-foreground">
                          <p>Filtreye uygun cihaz bulunamadı.</p>
                      </div>
                  )}
                </div>
              </CardContent>
            </Card>
         </div>
         
         <AddDeviceDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
         <BrokerConnectionDialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog} />
      </div>
    </FeatureGuard>
  );
}
