import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Module, InstalledModule } from '@/types';
import { FEATURE_TO_MODULE_MAP } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { MOCK_MODULES } from '@/lib/mock-data';

interface MarketplaceState {
  modules: Module[];
  installedModules: InstalledModule[];
  loading: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  filteredModules: Module[];
}

interface MarketplaceActions {
  fetchModules: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  filterModules: () => void;
  getModuleById: (id: string) => Module | undefined;
  installModule: (module: Module, userId: string) => Promise<void>;
  uninstallModule: (moduleId: string, userId: string) => Promise<void>;
  checkAccess: (featureKey: string) => boolean;
  isModuleInstalled: (moduleId: string) => boolean;
  syncPurchases: (userId: string) => Promise<void>;
}

export const useMarketplaceStore = create<MarketplaceState & MarketplaceActions>()(
  persist(
    (set, get) => ({
      modules: MOCK_MODULES,
      filteredModules: MOCK_MODULES,
      installedModules: [],
      loading: false,
      searchQuery: '',
      selectedCategory: null,

      fetchModules: async () => {
        set({ loading: true });
        // In production, fetch from Firestore
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ modules: MOCK_MODULES, filteredModules: MOCK_MODULES, loading: false });
      },

      setSearchQuery: (q) => {
        set({ searchQuery: q });
        get().filterModules();
      },

      setSelectedCategory: (c) => {
        set({ selectedCategory: c });
        get().filterModules();
      },

      filterModules: () => {
        const { modules, searchQuery, selectedCategory } = get();
        let filtered = modules;

        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            filtered = filtered.filter(m => 
                m.name.toLowerCase().includes(lowerQ) || 
                m.description.toLowerCase().includes(lowerQ)
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(m => m.category === selectedCategory);
        }

        set({ filteredModules: filtered });
      },

      getModuleById: (id: string) => {
        return get().modules.find(m => m.id === id);
      },

      syncPurchases: async (userId: string) => {
        set({ loading: true });
        try {
          const q = query(collection(db, 'purchases'), where('userId', '==', userId), where('status', '==', 'active'));
          const snapshot = await getDocs(q);
          const installed = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              moduleId: data.moduleId || data.id, // Fallback
              installedAt: data.purchaseDate,
              status: 'active',
              autoRenew: true
            } as InstalledModule;
          });
          
          set({ installedModules: installed, loading: false });
        } catch (error) {
          console.error("Failed to sync purchases", error);
          set({ loading: false });
        }
      },

      installModule: async (module: Module, userId: string) => {
        set({ loading: true });
        try {
            // Check if already purchased but inactive
            const q = query(
                collection(db, 'purchases'), 
                where('userId', '==', userId),
                where('moduleId', '==', module.id)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                // Reactivate
                const docRef = doc(db, 'purchases', snapshot.docs[0].id);
                await updateDoc(docRef, { status: 'active', purchaseDate: new Date().toISOString() });
            } else {
                // Create new purchase
                await addDoc(collection(db, 'purchases'), {
                    userId,
                    moduleId: module.id,
                    moduleName: module.name,
                    amount: module.price,
                    currency: module.currency,
                    purchaseDate: new Date().toISOString(),
                    status: 'active',
                    type: module.type
                });
            }

            // Update local state
            const newInstall: InstalledModule = {
                moduleId: module.id,
                installedAt: new Date().toISOString(),
                status: 'active',
                autoRenew: true
            };

            set(state => ({
                installedModules: [...state.installedModules.filter(m => m.moduleId !== module.id), newInstall],
                loading: false
            }));

        } catch (error) {
            console.error("Install failed", error);
            set({ loading: false });
            throw error;
        }
      },

      uninstallModule: async (moduleId: string, userId: string) => {
        set({ loading: true });
        try {
            const q = query(
                collection(db, 'purchases'), 
                where('userId', '==', userId),
                where('moduleId', '==', moduleId),
                where('status', '==', 'active')
            );
            const snapshot = await getDocs(q);
            
            // Mark as inactive in DB
            const updates = snapshot.docs.map(d => updateDoc(doc(db, 'purchases', d.id), { status: 'inactive' }));
            await Promise.all(updates);

            set(state => ({
                installedModules: state.installedModules.filter(m => m.moduleId !== moduleId),
                loading: false
            }));
        } catch (error) {
            console.error("Uninstall failed", error);
            set({ loading: false });
            throw error;
        }
      },

      isModuleInstalled: (moduleId) => {
        return get().installedModules.some(m => m.moduleId === moduleId && m.status === 'active');
      },

      checkAccess: (featureKey) => {
        const { installedModules } = get();
        const requiredModuleId = FEATURE_TO_MODULE_MAP[featureKey];
        if (!requiredModuleId) return true;
        return installedModules.some(m => m.moduleId === requiredModuleId && m.status === 'active');
      }
    }),
    {
      name: 't-market-storage-v1',
    }
  )
);
