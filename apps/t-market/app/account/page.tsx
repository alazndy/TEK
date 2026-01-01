'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useMarketplaceStore } from '@/stores/marketplace-store';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Purchase, Module } from '@/types';
import { User, CreditCard, Package, LogOut, Settings, ExternalLink, Save, Loader2, BarChart, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountPage() {
  const router = useRouter();
  const { user, signOut, loading } = useAuthStore();
  const { modules } = useMarketplaceStore();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  
  // Profile State by syncing with firestore user
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
        setDisplayName(user.displayName || '');
        setPhotoURL(user.photoURL || '');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchPurchases();
  }, [user]);

  const fetchPurchases = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'purchases'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const purchaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Purchase[];
      setPurchases(purchaseData);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleUpdateProfile = async () => {
      if (!user || !auth.currentUser) return;
      setUpdatingProfile(true);
      try {
          await updateProfile(auth.currentUser, {
              displayName,
              photoURL: photoURL || null
          });
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { displayName, photoURL: photoURL || null });
          window.location.reload(); 
      } catch (error) {
          console.error("Failed to update profile", error);
      } finally {
          setUpdatingProfile(false);
      }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const activePurchases = purchases.filter(p => p.status === 'active');
  const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);

  const getModuleUrl = (moduleId: string) => {
      return modules.find(m => m.id === moduleId)?.url;
  };

  // Animation Variants
  const tabContentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-20">
      
      {/* Dynamic Header Background */}
      <div className="h-64 bg-gradient-to-r from-indigo-900 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="container mx-auto px-6 h-full flex flex-col justify-end pb-8 relative z-10"
          >
              <div className="flex justify-between items-end">
                  <div className="flex items-end gap-6">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="p-1 bg-slate-950 rounded-full"
                      >
                           <Avatar className="h-32 w-32 border-4 border-slate-950 shadow-2xl">
                                <AvatarImage src={user.photoURL || undefined} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-4xl font-bold">
                                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                      </motion.div>
                      <div className="mb-4 space-y-1">
                          <h1 className="text-4xl font-bold text-white drop-shadow-md">{user.displayName || 'User'}</h1>
                          <p className="text-indigo-200 font-medium flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4" /> 
                              Enterprise Admin
                          </p>
                      </div>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10 mb-4"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign Out
                  </Button>
              </div>
          </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-slate-900/50 backdrop-blur border border-white/5 p-1 h-auto rounded-xl">
                {['Overview', 'Settings', 'Billing'].map(tab => (
                    <TabsTrigger 
                        key={tab.toLowerCase()} 
                        value={tab.toLowerCase()}
                        className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-6 py-2.5 transition-all text-slate-400 hover:text-white"
                    >
                        {tab}
                    </TabsTrigger>
                ))}
            </TabsList>

            <AnimatePresence mode="wait">
                 <TabsContent value="overview" className="space-y-8 focus-visible:outline-none">
                    <motion.div variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                                <Card className="bg-white/5 border-white/5 backdrop-blur-sm overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-3 opacity-10">
                                        <Package className="w-24 h-24 text-white" />
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-400">Active Modules</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-4xl font-bold text-white">{activePurchases.length}</div>
                                        <p className="text-xs text-emerald-400 mt-1 flex items-center">
                                            <BarChart className="w-3 h-3 mr-1" /> All systems operational
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                                <Card className="bg-white/5 border-white/5 backdrop-blur-sm overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-3 opacity-10">
                                        <CreditCard className="w-24 h-24 text-emerald-500" />
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-400">Lifetime Investment</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-4xl font-bold text-white">${totalSpent}</div>
                                        <p className="text-xs text-slate-500 mt-1">USD Currency</p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                                <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-none shadow-xl text-white">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-indigo-100">Membership Tier</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">Enterprise</div>
                                        <p className="text-xs text-indigo-200 mt-1 opacity-80">Since {new Date(user.createdAt).getFullYear()}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Active Subscriptions List */}
                        <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-xl text-white flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" /> Active Installations
                                </CardTitle>
                                <CardDescription className="text-slate-400">Control center for your installed ecosystem modules.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingPurchases ? (
                                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
                                ) : activePurchases.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl">
                                        <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-white mb-2">No active modules</h3>
                                        <p className="text-slate-400 mb-6 max-w-sm mx-auto">Enhance your workflow by exploring our marketplace of powerful tools.</p>
                                        <Button onClick={() => router.push('/')} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                            Browse Marketplace
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {activePurchases.map((purchase, i) => {
                                            const url = getModuleUrl(purchase.moduleId);
                                            return (
                                                <motion.div
                                                    key={purchase.id}
                                                    variants={listItemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    transition={{ delay: i * 0.05 }}
                                                    className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all"
                                                >
                                                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                                                        <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                                            <Package className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                                                {purchase.moduleName}
                                                                {purchase.type === 'addon' && <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 text-[10px] pointer-events-none">ADD-ON</Badge>}
                                                            </h3>
                                                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                                                <span>version 2.0</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                                <span>Auto-update on</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 pl-14 md:pl-0">
                                                        {url ? (
                                                            <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-200 font-semibold shadow-lg shadow-white/5" onClick={() => window.open(url, '_blank')}>
                                                                Launch App <ExternalLink className="w-3 h-3 ml-2" />
                                                            </Button>
                                                        ) : (
                                                            <Button size="sm" variant="outline" disabled className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
                                                                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" /> Live
                                                            </Button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                 </TabsContent>

                 <TabsContent value="settings" className="focus-visible:outline-none">
                    <motion.div variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                        <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm max-w-2xl">
                            <CardHeader>
                                <CardTitle className="text-white">Profile Settings</CardTitle>
                                <CardDescription className="text-slate-400">Update your public profile information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="displayName" className="text-slate-300">Display Name</Label>
                                    <Input 
                                        type="text" 
                                        id="displayName" 
                                        value={displayName} 
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="bg-black/20 border-white/10 text-white h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="photoURL" className="text-slate-300">Avatar URL</Label>
                                    <Input 
                                        type="url" 
                                        id="photoURL" 
                                        value={photoURL}
                                        onChange={(e) => setPhotoURL(e.target.value)}
                                        className="bg-black/20 border-white/10 text-white h-12"
                                    />
                                    <p className="text-xs text-slate-500">Paste a direct link to an image (png/jpg).</p>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end border-t border-white/5 pt-6">
                                <Button onClick={handleUpdateProfile} disabled={updatingProfile} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                                    {updatingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                 </TabsContent>

                 <TabsContent value="billing" className="focus-visible:outline-none">
                    <motion.div variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                        <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white">Billing & Savings</CardTitle>
                                <CardDescription className="text-slate-400">View your payment history and enterprise savings.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-center py-20">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CreditCard className="w-10 h-10 text-slate-500" />
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">Enterprise Plan Active</h3>
                                <p className="text-slate-400 max-w-md mx-auto mb-8">
                                    Your organization is covering all module costs under the Enterprise License Agreement.
                                </p>
                                <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5">
                                    Message Admin
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                 </TabsContent>
            </AnimatePresence>

        </Tabs>
      </div>
    </div>
  );
}
