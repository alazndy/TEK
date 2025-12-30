import { create } from 'zustand';
import { 
  RAIDItem, 
  RAIDType, 
  RiskImpact, 
  RiskProbability,
  RAIDStatus,
  calculateRiskScore 
} from '@/types/raid';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';

interface RAIDState {
  items: RAIDItem[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;

  // Actions
  subscribeToItems: (projectId?: string) => void;
  unsubscribeAll: () => void;
  addItem: (item: Omit<RAIDItem, 'id' | 'createdAt' | 'updatedAt' | 'riskScore'>) => Promise<string>;
  updateItem: (id: string, updates: Partial<RAIDItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  // Getters
  getByType: (type: RAIDType) => RAIDItem[];
  getByProject: (projectId: string) => RAIDItem[];
  getOpenItems: () => RAIDItem[];
  getRiskMatrix: () => Map<string, RAIDItem[]>;
}

export const useRAIDStore = create<RAIDState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  unsubscribe: null,

  subscribeToItems: (projectId) => {
    set({ isLoading: true });

    let q;
    if (projectId) {
      q = query(collection(db, 'raid'), where('projectId', '==', projectId));
    } else {
      q = collection(db, 'raid');
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            identifiedDate: data.identifiedDate?.toDate() || new Date(),
            targetDate: data.targetDate?.toDate(),
            resolvedDate: data.resolvedDate?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as RAIDItem;
        });
        set({ items, isLoading: false });
      },
      (error) => {
        console.error('RAID subscription error:', error);
        set({ error: 'RAID verileri yüklenemedi', isLoading: false });
      }
    );

    set({ unsubscribe });
  },

  unsubscribeAll: () => {
    const { unsubscribe } = get();
    if (unsubscribe) unsubscribe();
    set({ unsubscribe: null });
  },

  addItem: async (item) => {
    try {
      let riskScore: number | undefined;
      if (item.type === 'risk' && item.impact && item.probability) {
        riskScore = calculateRiskScore(item.impact, item.probability);
      }

      const docRef = await addDoc(collection(db, 'raid'), {
        ...item,
        riskScore,
        identifiedDate: Timestamp.fromDate(item.identifiedDate),
        targetDate: item.targetDate ? Timestamp.fromDate(item.targetDate) : null,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding RAID item:', error);
      throw error;
    }
  },

  updateItem: async (id, updates) => {
    try {
      let riskScore: number | undefined;
      if (updates.impact || updates.probability) {
        const item = get().items.find(i => i.id === id);
        if (item) {
          const impact = updates.impact || item.impact;
          const probability = updates.probability || item.probability;
          if (impact && probability) {
            riskScore = calculateRiskScore(impact, probability);
          }
        }
      }

      await updateDoc(doc(db, 'raid', id), {
        ...updates,
        ...(riskScore !== undefined && { riskScore }),
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating RAID item:', error);
      throw error;
    }
  },

  deleteItem: async (id) => {
    try {
      await deleteDoc(doc(db, 'raid', id));
    } catch (error) {
      console.error('Error deleting RAID item:', error);
      throw error;
    }
  },

  getByType: (type) => {
    return get().items.filter(item => item.type === type);
  },

  getByProject: (projectId) => {
    return get().items.filter(item => item.projectId === projectId);
  },

  getOpenItems: () => {
    return get().items.filter(item => 
      item.status === 'open' || item.status === 'mitigating'
    );
  },

  getRiskMatrix: () => {
    const risks = get().items.filter(item => 
      item.type === 'risk' && item.impact && item.probability
    );
    
    const matrix = new Map<string, RAIDItem[]>();
    
    risks.forEach(risk => {
      const key = `${risk.impact}-${risk.probability}`;
      if (!matrix.has(key)) {
        matrix.set(key, []);
      }
      matrix.get(key)!.push(risk);
    });
    
    return matrix;
  },
}));
