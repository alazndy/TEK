import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MarketplaceModule, InstalledModule } from '@/types/marketplace';
import { FEATURE_TO_MODULE_MAP } from '@/types/marketplace';

import { MARKETPLACE_CATALOG } from '@/config/marketplace-catalog';

interface MarketplaceState {
  availableModules: MarketplaceModule[];
  installedModules: InstalledModule[];
  loading: boolean;
}

interface MarketplaceActions {
  installModule: (moduleId: string) => Promise<void>;
  uninstallModule: (moduleId: string) => Promise<void>;
  checkAccess: (featureKey: string) => boolean;
  isModuleInstalled: (moduleId: string) => boolean;
  getModule: (moduleId: string) => MarketplaceModule | undefined;
}

export const useMarketplaceStore = create<MarketplaceState & MarketplaceActions>()(
  persist(
    (set, get) => ({
      availableModules: MARKETPLACE_CATALOG,
      installedModules: [], 
      loading: false,

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
      name: 'uph-marketplace-v3', // Bump version to clear old state and load new mock data
    }
  )
);
