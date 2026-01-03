'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMarketplaceStore } from '@/stores/marketplace-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
    ArrowLeft, Check, Download, Info, Puzzle, ShieldCheck, Star, 
    Rocket, Zap, Globe, Image as ImageIcon,
    Activity, Hammer, Network, Users, LineChart, Box, Link,
    Building, BarChart, ShieldAlert, MonitorPlay, Cpu, ClipboardCheck, RefreshCw,
    LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Module } from '@/types';
import { useAuthStore } from '@/stores/auth-store';

const IconMap: Record<string, any> = {
  Activity, Hammer, Network, Users, LineChart, Box, Link,
  Building, BarChart, ShieldAlert, MonitorPlay, Cpu, ClipboardCheck, RefreshCw,
  LayoutDashboard
};

export default function AppDetailPage() {
    const params = useParams();
    const router = useRouter();
    const appId = params.appId as String;
    
    // Safety check for next build or undefined params
    const safeAppId = Array.isArray(appId) ? appId[0] : appId;

    const { modules, installedModules, installModule, uninstallModule, loading, isModuleInstalled, syncPurchases } = useMarketplaceStore();
    const { user } = useAuthStore();

    React.useEffect(() => {
        if (user) syncPurchases(user.uid);
    }, [user, syncPurchases]);

    if (!modules || modules.length === 0) {
        return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;
    }

    const appModule = modules.find(m => m.id === safeAppId);
    if (!appModule) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-bold">App Not Found</h2>
                <Button onClick={() => router.back()} variant="outline"> <ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
            </div>
        );
    }

    const addons = modules.filter(m => m.parentId === safeAppId);
    const isMainInstalled = isModuleInstalled(safeAppId);
    const Icon = IconMap[appModule.icon] || Puzzle;

    const handleAction = async (module: Module) => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (module.id !== safeAppId && !isMainInstalled && module.parentId === safeAppId) {
             alert(`You must install ${appModule.name} first.`);
             return;
        }

        const isInstalled = isModuleInstalled(module.id);
        if (isInstalled) {
            await uninstallModule(module.id, user.uid);
        } else {
            await installModule(module, user.uid);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 pb-20">
            {/* HER0 SECTION */}
            <div className="relative overflow-hidden bg-slate-900 border-b border-white/5">
                 {/* Background Effects */}
                 <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
                 <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-purple-500/20 blur-[128px] rounded-full pointer-events-none" />
                 
                 <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
                     <Button onClick={() => router.back()} variant="ghost" className="mb-12 text-white/50 hover:text-white hover:bg-white/5 pl-0">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
                     </Button>

                     <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <Icon className="w-12 h-12 text-indigo-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">{appModule.name}</h1>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                         <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">{appModule.category}</span>
                                         <span>v{appModule.version}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-xl text-slate-300 leading-relaxed font-light">
                                {appModule.longDescription || appModule.description}
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button 
                                    size="lg" 
                                    className={`text-lg px-8 h-14 rounded-xl shadow-2xl transition-all ${isMainInstalled ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'}`}
                                    onClick={() => handleAction(appModule)}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : isMainInstalled ? 'Uninstall Application' : `Install ${appModule.name}`}
                                </Button>
                                {appModule.url && (
                                    <Button size="lg" variant="outline" className="h-14 border-white/10 text-white hover:bg-white/5" onClick={() => window.open(appModule.url, '_blank')}>
                                        <Globe className="w-5 h-5 mr-2" /> Visit Website
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Hero Image / Preview */}
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 group">
                            {appModule.gallery && appModule.gallery.length > 0 ? (
                                // Placeholder for real image logic since we don't have files
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                    <div className="text-center space-y-4">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto ring-1 ring-white/10">
                                            <ImageIcon className="w-10 h-10 text-slate-500" />
                                        </div>
                                        <p className="text-slate-500 font-medium">Interactive Preview Unavailable</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-slate-900 flex items-center justify-center">
                                     <Icon className="w-32 h-32 text-white/5" />
                                </div>
                            )}
                            
                            {/* Overlay details */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950/90 to-transparent">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                        <ShieldCheck className="w-3 h-3 mr-1.5" /> Official Module
                                    </div>
                                    <div className="flex items-center text-xs font-medium text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                        <Star className="w-3 h-3 mr-1.5" /> Featured
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                 </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16 space-y-24">
                
                {/* Benefits Section */}
                {appModule.benefits && appModule.benefits.length > 0 && (
                    <div className="space-y-12">
                         <div className="text-center max-w-2xl mx-auto space-y-4">
                            <h2 className="text-3xl font-bold text-white">Why Choose {appModule.name}?</h2>
                            <p className="text-slate-400">Designed for enterprise scalability and ease of use.</p>
                         </div>
                         <div className="grid md:grid-cols-2 gap-6">
                            {appModule.benefits.map((benefit, i) => (
                                <Card key={i} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                                    <CardContent className="p-6 flex gap-4">
                                        <div className="p-3 rounded-lg bg-indigo-500/10 h-fit">
                                            <Zap className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            {/* Smart parsing for benefits formatted like "Title: Description" */}
                                            {benefit.includes(':') ? (
                                                <>
                                                    <h3 className="font-semibold text-white mb-1.5">{benefit.split(':')[0]}</h3>
                                                    <p className="text-slate-400 text-sm leading-relaxed">{benefit.split(':')[1]}</p>
                                                </>
                                            ) : (
                                                <p className="text-slate-300">{benefit}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                         </div>
                    </div>
                )}

                {/* Technical Specs & Features Split */}
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-b border-white/10 pb-6">
                            <h2 className="text-2xl font-bold text-white">Technical Capabilities</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {appModule.features.map((feat, i) => (
                                <div key={i} className="flex items-center p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                    <Check className="w-5 h-5 mr-3 text-emerald-500" />
                                    <span className="text-slate-300 font-mono text-sm">{feat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Addons Sidebar */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-900/10 to-slate-900 border border-white/10">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Puzzle className="w-5 h-5 text-indigo-400" /> Extension Packages
                            </h2>
                            <div className="space-y-4">
                                {addons.length > 0 ? (
                                    addons.map((addon) => {
                                        const isAddonInstalled = isModuleInstalled(addon.id);
                                        const AddonIcon = IconMap[addon.icon] || Box;
                                        return (
                                            <div key={addon.id} className="p-4 rounded-xl bg-slate-950 border border-white/10 hover:border-indigo-500/30 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <AddonIcon className="w-4 h-4 text-slate-400" />
                                                        <span className="font-medium text-slate-200 text-sm">{addon.name}</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-indigo-400">{addon.price === 0 ? 'Free' : `$${addon.price}`}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{addon.description}</p>
                                                <Button 
                                                    size="sm" 
                                                    variant={isAddonInstalled ? 'outline' : 'secondary'}
                                                    className={`w-full h-8 text-xs ${isAddonInstalled ? 'text-green-400 border-green-500/30' : ''}`}
                                                    onClick={() => handleAction(addon)}
                                                    disabled={!isMainInstalled || loading}
                                                >
                                                    {isAddonInstalled ? 'Installed' : 'Add to Package'}
                                                </Button>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center p-8 border border-dashed border-white/10 rounded-xl">
                                        <p className="text-sm text-slate-500">No extensions available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
