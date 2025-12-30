import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  displayName: string;
  email: string;
  avatarUrl?: string;
  jobTitle?: string;
  companyName?: string;
}

export interface SystemSettings {
  theme: 'light' | 'dark' | 'system';
  lowStockThreshold: number;
  currency: string;
  enableNotifications: boolean;
  language: 'en' | 'tr';
  integrations: {
    weave: boolean;
    envInventory: boolean;
    googleDrive: boolean;
    slack: boolean;
    github: boolean;
  };
  slackWebhookUrl?: string;
  githubToken?: string;
}

interface SettingsState {
  profile: UserProfile;
  system: SystemSettings;
  
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      profile: {
        displayName: 'Demo User',
        email: 'user@example.com',
        jobTitle: 'Engineer',
        companyName: 'ACME Corp'
      },
      system: {
        theme: 'system',
        lowStockThreshold: 5,
        currency: 'TRY',
        enableNotifications: true,
        language: 'tr',
        integrations: {
          weave: true,
          envInventory: true,
          googleDrive: false,
          slack: false,
          github: false
        }
      },

      updateProfile: (updates) => 
        set((state) => ({ profile: { ...state.profile, ...updates } })),

      updateSystemSettings: (updates) =>
        set((state) => ({ system: { ...state.system, ...updates } })),
    }),
    {
      name: 'uph-settings', // unique name
    }
  )
);
