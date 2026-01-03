'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Grid, Layers, Shuffle, ShoppingBag, LogIn, UserPlus, Search,
  ArrowRight, Shield, Zap, Globe, Users, Activity, Hammer, Network, Cpu, Layout, ArrowUpRight, Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMarketplaceStore } from '@/stores/marketplace-store';
import { useAuthStore } from '@/stores/auth-store';
import { Module } from '@/types';
import { ModuleCard } from '@/components/module-card';
import { CatalogSearch } from '@/components/catalog-search';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useCartStore } from '@/stores/cart-store';
import { OnboardingWizard } from '@/components/onboarding-wizard';
import { useOnboardingStore } from '@/stores/onboarding-store';

export default function Home() {
  const { items, toggleCart } = useCartStore();
  const { user, initAuth } = useAuthStore();
  const { isComplete: onboardingComplete } = useOnboardingStore();
  const [showWizard, setShowWizard] = useState(false);
  const router = useRouter();
  
  // Market Store for Data
  const { modules, filteredModules, fetchModules, loading, isModuleInstalled } = useMarketplaceStore();

  useEffect(() => {
    initAuth();
    fetchModules();
  }, [fetchModules, initAuth]);

  // Show wizard for logged-in users who haven't completed onboarding
  useEffect(() => {
    if (user && !onboardingComplete) {
      setShowWizard(true);
    }
  }, [user, onboardingComplete]);

  // Featured Apps for Bento Grid
  const uphCore = modules.find(m => m.id === 'uph-core');
  const fluxCore = modules.find(m => m.id === 'flux-core');
  const enviCore = modules.find(m => m.id === 'envi-core');
  const weaveCore = modules.find(m => m.id === 'weave-core');


  // Scroll Animations
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  const handleAction = async (module: Module) => {
    if (!user) {
        router.push('/login');
        return;
    }

    if (isModuleInstalled(module.id)) {
        // Handle uninstall or showing settings
        return; 
    }

    if (module.price > 0) {
        useCartStore.getState().addToCart(module);
    } else {
        // Free install
        await useMarketplaceStore.getState().installModule(module, user.uid);
    }
  };


  return (
    // ...
    <div className="min-h-screen bg-slate-950 selection:bg-indigo-500/30">
      {/* Onboarding Wizard Modal */}
      {showWizard && (
        <OnboardingWizard onComplete={() => {
          setShowWizard(false);
          router.push('https://localhost:4000'); // Redirect to Portal
        }} />
      )}

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2 font-bold text-xl tracking-tighter" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
               <div className="bg-indigo-600 rounded-lg p-1.5"><ShoppingBag className="w-5 h-5 text-white" /></div> 
               <span>T-Ecosystem</span>
           </div>
           <div className="flex items-center gap-6">
               <button onClick={() => toggleCart(true)} className="relative group p-2">
                    <ShoppingBag className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                    {items.length > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full">
                            {items.length}
                        </span>
                    )}
               </button>
               <a href="#ecosystem" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Ecosystem</a>
               <a href="#integrations" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Integrations</a>
               {user ? (
                   <Button onClick={() => router.push('/account')} size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0">
                       Dashboard
                   </Button>
               ) : (
                   <Button onClick={() => router.push('/login')} size="sm" className="bg-white text-slate-950 hover:bg-slate-200">
                       Sign In
                   </Button>
               )}
           </div>
        </div>
      </nav>
      {/* HERO SECTION */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Ambient Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[128px]" />
              <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[128px]" />
          </div>

          <div className="container mx-auto px-6 relative z-10 text-center">
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-8"
              >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" /> The Future of Work
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6">
                     One Hub.<br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Limitless Potential.</span>
                  </h1>
                  
                  <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                      The T-Ecosystem brings Project Management, IoT, Manufacturing, and Supply Chain together into a single, unified operating system.
                  </p>

                  <div className="flex items-center justify-center gap-4 pt-4">
                      <Button size="lg" className="h-12 px-8 text-lg bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-500/25" onClick={() => document.getElementById('ecosystem')?.scrollIntoView({ behavior: 'smooth' })}>
                          Explore Ecosystem
                      </Button>
                      <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-white/10 text-white hover:bg-white/5 rounded-full">
                          View Documentation
                      </Button>
                  </div>
              </motion.div>

              {/* Orbital Visualization */}
              <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="relative mt-24 h-[400px] md:h-[600px] w-full max-w-5xl mx-auto"
              >
                  {/* Center Hub */}
                  <motion.div style={{ y: y1 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center">
                      <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/50 border border-white/20 backdrop-blur-xl">
                          <Layout className="w-16 h-16 text-white" />
                      </div>
                      <div className="mt-4 font-bold text-2xl text-white">UPH Core</div>
                      <div className="text-slate-400">Central OS</div>
                  </motion.div>

                  {/* Satellite 1: Flux */}
                  <motion.div style={{ y: y2 }} className="absolute left-[10%] top-[20%] z-10 hidden md:block">
                       <div className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-md hover:border-indigo-500/50 transition-colors cursor-pointer group" onClick={() => router.push('/store/flux-core')}>
                           <Activity className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                           <div className="font-bold text-white">Flux</div>
                           <div className="text-xs text-slate-400">IoT & Energy</div>
                       </div>
                  </motion.div>

                  {/* Satellite 2: Forge */}
                  <motion.div style={{ y: y2 }} className="absolute right-[10%] top-[30%] z-10 hidden md:block">
                       <div className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-md hover:border-indigo-500/50 transition-colors cursor-pointer group" onClick={() => router.push('/store/forge-core')}>
                           <Hammer className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
                           <div className="font-bold text-white">Forge</div>
                           <div className="text-xs text-slate-400">Manufacturing</div>
                       </div>
                  </motion.div>

                   {/* Satellite 3: Weave */}
                  <motion.div style={{ y: y1 }} className="absolute left-[20%] bottom-[20%] z-10 hidden md:block">
                       <div className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-md hover:border-indigo-500/50 transition-colors cursor-pointer group" onClick={() => router.push('/store/weave-core')}>
                           <Network className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                           <div className="font-bold text-white">Weave</div>
                           <div className="text-xs text-slate-400">Supply Chain</div>
                       </div>
                  </motion.div>

                  {/* Connecting Lines (SVG) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: 0 }}>
                      <line x1="50%" y1="50%" x2="15%" y2="25%" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
                      <line x1="50%" y1="50%" x2="85%" y2="35%" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
                      <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
                      <circle cx="50%" cy="50%" r="300" stroke="url(#orbitGradient)" strokeWidth="1" fill="none" />
                      <defs>
                          <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgba(99, 102, 241, 0)" />
                              <stop offset="50%" stopColor="rgba(99, 102, 241, 0.3)" />
                              <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                          </linearGradient>
                      </defs>
                  </svg>
              </motion.div>
          </div>
      </div>

      {/* BENTO GRID SHOWCASE */}
      <div id="ecosystem" className="py-24 bg-slate-950 relative z-20">
          <div className="container mx-auto px-6">
              <div className="flex items-end justify-between mb-12">
                   <div>
                       <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">The Collection</h2>
                       <p className="text-slate-400 max-w-xl text-lg">Powerful standalone applications that work even better together.</p>
                   </div>
                   <div className="hidden md:flex gap-2">
                       <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">Filter by Industry</Button>
                       <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">Latest Updates</Button>
                   </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[300px]">
                  
                  {/* UPH: Large Feature */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="md:col-span-2 lg:col-span-2 row-span-2 rounded-3xl overflow-hidden relative cursor-pointer group"
                    onClick={() => router.push('/store/uph-core')}
                  >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900" />
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                      <div className="absolute inset-0 p-8 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                  <Layout className="w-8 h-8 text-white" />
                              </div>
                              <ArrowUpRight className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                          </div>
                          <div>
                              <h3 className="text-3xl font-bold text-white mb-2">{uphCore?.name}</h3>
                              <p className="text-indigo-200 text-lg line-clamp-2">{uphCore?.description}</p>
                          </div>
                      </div>
                  </motion.div>

                  {/* Flux */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="md:col-span-1 lg:col-span-1 rounded-3xl bg-slate-900 border border-white/5 overflow-hidden relative cursor-pointer group"
                    onClick={() => router.push('/store/flux-core')}
                  >
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-900/50 to-transparent" />
                        <div className="p-6 h-full flex flex-col justify-between relative z-10">
                            <Activity className="w-8 h-8 text-emerald-400" />
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{fluxCore?.name}</h3>
                                <p className="text-sm text-slate-400">IoT Monitoring</p>
                            </div>
                        </div>
                  </motion.div>

                  {/* Weave */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="md:col-span-1 lg:col-span-1 rounded-3xl bg-slate-900 border border-white/5 overflow-hidden relative cursor-pointer group"
                    onClick={() => router.push('/store/weave-core')}
                  >
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-900/50 to-transparent" />
                        <div className="p-6 h-full flex flex-col justify-between relative z-10">
                            <Network className="w-8 h-8 text-blue-400" />
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{weaveCore?.name}</h3>
                                <p className="text-sm text-slate-400">Supply Chain</p>
                            </div>
                        </div>
                   </motion.div>

                   {/* ENV-I: Wide */}
                   <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="md:col-span-2 lg:col-span-2 rounded-3xl bg-slate-900 border border-white/5 overflow-hidden relative cursor-pointer group"
                    onClick={() => router.push('/store/envi-core')}
                   >
                        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-orange-900/20 to-transparent" />
                        <div className="p-8 h-full flex flex-col justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <Building className="w-8 h-8 text-orange-400" />
                                <span className="text-orange-400 font-medium">Construction OS</span>
                            </div>
                            <div className="max-w-xs">
                                <h3 className="text-2xl font-bold text-white mb-2">{enviCore?.name}</h3>
                                <p className="text-slate-400">{enviCore?.description}</p>
                            </div>
                        </div>
                   </motion.div>

              </div>
          </div>
      </div>

      {/* FULL CATALOG GRID */}
      <div id="catalog" className="py-24 bg-slate-950 border-t border-white/5">
          <div className="container mx-auto px-6">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                  <Grid className="w-6 h-6 text-slate-400" />
                  Full Catalog
              </h2>

              <CatalogSearch />
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {filteredModules.map((module) => (
                      <motion.div key={module.id} whileHover={{ y: -5 }}>
                           <ModuleCard 
                                module={module}
                                isInstalled={isModuleInstalled(module.id)}
                                parentInstalled={true}
                                onAction={handleAction}
                                loading={loading}
                           />
                      </motion.div>
                  ))}
              </div>
          </div>
      </div>

      <footer className="py-12 bg-slate-950 border-t border-white/5 text-center">
          <p className="text-slate-500">© 2024 T-Ecosystem. Building the future of enterprise software.</p>
      </footer>

    </div>
  );
}
