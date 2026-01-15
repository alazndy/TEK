import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MarketplaceModule, InstalledModule } from '@/types/marketplace';
import { FEATURE_TO_MODULE_MAP } from '@/types/marketplace';

import { MARKETPLACE_CATALOG } from '@/config/marketplace-catalog';

// API Base URL - defaults to local core-api
const API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:4000';

interface MarketplaceState {
  availableModules: MarketplaceModule[];
  installedModules: InstalledModule[];
  loading: boolean;
  error: string | null;
  dataSource: 'api' | 'local'; // Track where data came from
}

interface MarketplaceActions {
  fetchModules: () => Promise<void>;
  installModule: (moduleId: string) => Promise<void>;
  uninstallModule: (moduleId: string) => Promise<void>;
  checkAccess: (featureKey: string) => boolean;
  isModuleInstalled: (moduleId: string) => boolean;
  getModule: (moduleId: string) => MarketplaceModule | undefined;
}

export const useMarketplaceStore = create<MarketplaceState & MarketplaceActions>()(
  persist(
    (set, get) => ({
      availableModules: MARKETPLACE_CATALOG, // Initial local data
      installedModules: [], 
      loading: false,
      error: null,
      dataSource: 'local',

      fetchModules: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/marketplace/products`);
          
          if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
          }
          
          const data = await response.json();
          
          // Map API response to MarketplaceModule format
          // The core-api returns Module[] with slightly different structure
          const modules: MarketplaceModule[] = data.map((item: Record<string, unknown>) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            icon: item.icon || 'Box',
            category: item.category || 'Operations',
            type: item.type || 'app',
            parentId: item.parentId,
            price: item.price || 0,
            isPopular: item.isPopular || false,
            isNew: item.isNew || false,
            features: item.features || [],
            version: item.version || '1.0.0',
          }));
          
          set({ 
            availableModules: modules,
            loading: false,
            dataSource: 'api'
          });
          
          console.log(`✅ Marketplace: Loaded ${modules.length} modules from API`);
        } catch (error) {
          console.warn('⚠️ Marketplace API unavailable, using local catalog:', error);
          set({ 
            availableModules: MARKETPLACE_CATALOG,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch',
            dataSource: 'local'
          });
        }
      },

      getModule: (moduleId) => get().availableModules.find(m => m.id === moduleId),

      installModule: async (moduleId) => {
        set({ loading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newInstall: InstalledModule = {
          moduleId,
          installedAt: new Date().toISOString(),
          status: 'active',
          autoRenew: true
        };

        set(state => ({
          installedModules: [...state.installedModules, newInstall],
          loading: false
        }));
      },

      uninstallModule: async (moduleId) => {
         set({ loading: true });
         await new Promise(resolve => setTimeout(resolve, 300));
         set(state => ({
            installedModules: state.installedModules.filter(m => m.moduleId !== moduleId),
            loading: false
         }));
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
      name: 'uph-marketplace-v4', // Bump version for new API-enabled store
    }
  )
);
