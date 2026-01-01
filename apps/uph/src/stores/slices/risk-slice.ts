
import { StateCreator } from 'zustand';
import { Risk, RAIDEntry } from '@/types/risk';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface RiskSlice {
  risks: Risk[];
  raidEntries: RAIDEntry[];
  isLoadingRisk: boolean;
  
  fetchProjectRisks: (projectId: string) => Promise<void>;
  addRisk: (risk: Omit<Risk, 'id' | 'createdAt' | 'updatedAt' | 'severity'>) => Promise<string>;
  updateRisk: (id: string, updates: Partial<Risk>) => Promise<void>;
  deleteRisk: (id: string) => Promise<void>;
  
  // Generic RAID
  addRAIDEntry: (entry: Omit<RAIDEntry, 'id' | 'createdAt'>) => Promise<string>;
  updateRAIDEntry: (id: string, updates: Partial<RAIDEntry>) => Promise<void>;
  deleteRAIDEntry: (id: string) => Promise<void>;
}

export const createRiskSlice: StateCreator<RiskSlice> = (set, get) => ({
  risks: [],
  raidEntries: [],
  isLoadingRisk: false,

  fetchProjectRisks: async (projectId: string) => {
    set({ isLoadingRisk: true });
    try {
      // Fetch Risks
      const riskQuery = query(collection(db, 'risks'), where('projectId', '==', projectId));
      const riskSnap = await getDocs(riskQuery);
      const risks = riskSnap.docs.map(d => ({ id: d.id, ...d.data() } as Risk));

      // Fetch RAID Log
      const raidQuery = query(collection(db, 'raid_log'), where('projectId', '==', projectId));
      const raidSnap = await getDocs(raidQuery);
      const raidEntries = raidSnap.docs.map(d => ({ id: d.id, ...d.data() } as RAIDEntry));

      set({ risks, raidEntries, isLoadingRisk: false });
    } catch (error) {
      console.error('Failed to fetch risks:', error);
      set({ isLoadingRisk: false });
    }
  },

  addRisk: async (riskData) => {
    set({ isLoadingRisk: true });
    try {
      const severity = riskData.probability * riskData.impact;
      const now = new Date().toISOString();
      
      const newRisk = {
        ...riskData,
        severity,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, 'risks'), newRisk);
      const riskWithId = { ...newRisk, id: docRef.id } as Risk;

      set(state => ({
        risks: [...state.risks, riskWithId],
        isLoadingRisk: false
      }));
      
      return docRef.id;
    } catch (error) {
      console.error('Failed to add risk:', error);
      set({ isLoadingRisk: false });
      throw error;
    }
  },

  updateRisk: async (id, updates) => {
    try {
      const currentRisk = get().risks.find(r => r.id === id);
      if (!currentRisk) return;

      const updatedSeverity = (updates.probability || currentRisk.probability) * (updates.impact || currentRisk.impact);
      
      const finalUpdates = {
        ...updates,
        severity: updatedSeverity,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'risks', id), finalUpdates);

      set(state => ({
        risks: state.risks.map(r => r.id === id ? { ...r, ...finalUpdates } : r)
      }));
    } catch (error) {
      console.error('Failed to update risk:', error);
      throw error;
    }
  },

  deleteRisk: async (id) => {
    try {
      await deleteDoc(doc(db, 'risks', id));
      set(state => ({
        risks: state.risks.filter(r => r.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete risk:', error);
      throw error;
    }
  },

  addRAIDEntry: async (entryData) => {
    try {
        const now = new Date().toISOString();
        const newEntry = { ...entryData, createdAt: now };
        const docRef = await addDoc(collection(db, 'raid_log'), newEntry);
        
        set(state => ({
            raidEntries: [...state.raidEntries, { ...newEntry, id: docRef.id } as RAIDEntry]
        }));
        return docRef.id;
    } catch (error) {
        console.error('Failed to add RAID entry:', error);
        throw error;
    }
  },

  updateRAIDEntry: async (id, updates) => {
      try {
          await updateDoc(doc(db, 'raid_log', id), updates);
          set(state => ({
              raidEntries: state.raidEntries.map(e => e.id === id ? { ...e, ...updates } : e)
          }));
      } catch (error) {
          console.error('Failed to update RAID entry:', error);
          throw error;
      }
  },

  deleteRAIDEntry: async (id) => {
      try {
          await deleteDoc(doc(db, 'raid_log', id));
          set(state => ({
              raidEntries: state.raidEntries.filter(e => e.id !== id)
          }));
      } catch (error) {
          console.error('Failed to delete RAID entry:', error);
          throw error;
      }
  }
});
