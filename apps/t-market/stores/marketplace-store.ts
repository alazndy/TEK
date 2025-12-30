import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Module, InstalledModule } from '@/types';
import { FEATURE_TO_MODULE_MAP } from '@/types';
import { apiClient } from '@/lib/api-client';

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
      modules: [],
      filteredModules: [],
      installedModules: [],
      loading: false,
      searchQuery: '',
      selectedCategory: null,

      fetchModules: async () => {
        set({ loading: true });
        try {
            const response = await apiClient.get<Module[]>('/marketplace/products');
            const modules = response.data;
            set({ modules, filteredModules: modules, loading: false });
            // Re-apply filter if needed
            get().filterModules();
        } catch (error) {
            console.error('Failed to fetch modules:', error);
            set({ loading: false });
        }
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
        // Mock purchases for now as API isn't ready
        set({ loading: true });
        
        // TODO: Call apiClient.get(`/marketplace/purchases?userId=${userId}`)
        
        setTimeout(() => {
            set({ loading: false });
        }, 500);
      },

      installModule: async (module: Module, userId: string) => {
        set({ loading: true });
        try {
            // TODO: Call apiClient.post('/marketplace/install', { moduleId: module.id })
            
            // NOTE: We are doing a hybrid approach for now:
            // 1. We removed Firebase logic to follow "refactor to Core API"
            // 2. But Core API lacks "Install" endpoint.
            // 3. We simulate success to allow testing the UI.
            
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
             // TODO: Call apiClient.post('/marketplace/uninstall', { moduleId })
             
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
