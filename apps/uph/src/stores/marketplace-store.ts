import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MarketplaceModule, InstalledModule } from '@/types/marketplace';
import { FEATURE_TO_MODULE_MAP } from '@/types/marketplace';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

interface MarketplaceState {
  availableModules: MarketplaceModule[];
  installedModules: InstalledModule[];
  loading: boolean;
  initialized: boolean;
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
      availableModules: [],
      installedModules: [], 
      loading: false,
      initialized: false,

      fetchModules: async () => {
         // Prevent redundant fetches if already have data? 
         // For now, let's fetch to ensure fresh data from API
         set({ loading: true });
         try {
             const res = await apiClient.get<MarketplaceModule[]>('/marketplace/products');
             set({ availableModules: res.data, loading: false, initialized: true });
         } catch (error) {
             console.error('Failed to fetch modules:', error);
             // Fallback to empty or keep existing?
             set({ loading: false });
         }
      },

      getModule: (moduleId) => get().availableModules.find(m => m.id === moduleId),

      installModule: async (moduleId) => {
        set({ loading: true });
        // TODO: Call API endpoint for install
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
        // Super Admin Bypass
        const user = useAuthStore.getState().user;
        if (user?.email === 'goktugt.brigade@adctasarim.com') return true;

        return get().installedModules.some(m => m.moduleId === moduleId && m.status === 'active');
      },

      checkAccess: (featureKey) => {
        // Super Admin Bypass
        const user = useAuthStore.getState().user;
        if (user?.email === 'goktugt.brigade@adctasarim.com') return true;

        const { installedModules } = get();
        const requiredModuleId = FEATURE_TO_MODULE_MAP[featureKey];
        if (!requiredModuleId) return true; 
        return installedModules.some(m => m.moduleId === requiredModuleId && m.status === 'active');
      }
    }),
    {
      name: 'uph-marketplace-v3', 
    }
  )
);
