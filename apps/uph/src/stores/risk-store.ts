import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RAIDEntry, RAIDType, RAIDStatus } from '@/types/risk';

interface RiskStore {
  entries: RAIDEntry[];
  addEntry: (entry: Omit<RAIDEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, updates: Partial<RAIDEntry>) => void;
  deleteEntry: (id: string) => void;
  getProjectEntries: (projectId: string) => RAIDEntry[];
  getProjectRisks: (projectId: string) => RAIDEntry[];
}

export const useRiskStore = create<RiskStore>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) => set((state) => ({
        entries: [
          ...state.entries,
          {
            ...entry,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: entry.status || 'identified'
          }
        ]
      })),

      updateEntry: (id, updates) => set((state) => ({
        entries: state.entries.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
        )
      })),

      deleteEntry: (id) => set((state) => ({
        entries: state.entries.filter((e) => e.id !== id)
      })),

      getProjectEntries: (projectId) => {
        return get().entries.filter((e) => e.projectId === projectId);
      },

      getProjectRisks: (projectId) => {
        return get().entries.filter((e) => e.projectId === projectId && e.type === 'risk');
      }
    }),
    {
      name: 'uph-risk-store',
    }
  )
);
