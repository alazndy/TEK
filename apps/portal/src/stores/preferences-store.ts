import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'engineer' | 'manager' | 'logistics' | 'power_user' | null;

interface PortalPreferencesState {
  isOnboardingComplete: boolean;
  userRole: UserRole;
  enabledApps: string[]; // List of app IDs (e.g., 'weave', 'uph')
  
  completeOnboarding: (role: UserRole, apps: string[]) => void;
  resetOnboarding: () => void;
  toggleApp: (appId: string) => void;
}

export const usePortalPreferences = create<PortalPreferencesState>()(
  persist(
    (set) => ({
      isOnboardingComplete: false,
      userRole: null,
      enabledApps: [],

      completeOnboarding: (role, apps) => set({ 
        isOnboardingComplete: true, 
        userRole: role, 
        enabledApps: apps 
      }),

      resetOnboarding: () => set({ 
        isOnboardingComplete: false, 
        userRole: null, 
        enabledApps: [] 
      }),

      toggleApp: (appId) => set((state) => {
        const apps = state.enabledApps.includes(appId)
          ? state.enabledApps.filter(id => id !== appId)
          : [...state.enabledApps, appId];
        return { enabledApps: apps };
      }),
    }),
    {
      name: 'portal-preferences',
    }
  )
);
