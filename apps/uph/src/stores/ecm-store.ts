import { create } from 'zustand';
import { ECR, ECO, ECRStatus, ECOStatus } from '@/types/engineering';
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
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';

interface ECMState {
  ecrs: ECR[];
  ecos: ECO[];
  isLoading: boolean;
  error: string | null;
  unsubscribeECRs: Unsubscribe | null;
  unsubscribeECOs: Unsubscribe | null;
  
  // Selectors
  getProjectECRs: (projectId: string) => ECR[];
  getProjectECOs: (projectId: string) => ECO[];
  
  // Actions
  fetchECMData: () => Promise<void>;
  subscribeToECRs: () => void;
  subscribeToECOs: () => void;
  unsubscribeAll: () => void;
  addECR: (ecr: Omit<ECR, 'id' | 'createdAt' | 'updatedAt' | 'identifier'>) => Promise<void>;
  updateECR: (id: string, data: Partial<ECR>) => Promise<void>;
  updateECRStatus: (id: string, status: ECRStatus) => Promise<void>;
  deleteECR: (id: string) => Promise<void>;
  addECO: (eco: Omit<ECO, 'id' | 'createdAt' | 'updatedAt' | 'identifier' | 'approvalStatus'>) => Promise<void>;
  updateECO: (id: string, data: Partial<ECO>) => Promise<void>;
  updateECOStatus: (id: string, status: ECOStatus) => Promise<void>;
  approveECO: (id: string) => Promise<void>;
  deleteECO: (id: string) => Promise<void>;
}

// Helper: Convert Firestore Timestamp to Date
const convertTimestamps = <T extends Record<string, unknown>>(data: T): T => {
  const result = { ...data };
  for (const key in result) {
    const value = result[key];
    if (value instanceof Timestamp) {
      (result as Record<string, unknown>)[key] = value.toDate();
    } else if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
      (result as Record<string, unknown>)[key] = (value as { toDate: () => Date }).toDate();
    }
  }
  return result;
};

// Generate ECR/ECO identifier
const generateIdentifier = (type: 'ECR' | 'ECO', count: number): string => {
  const year = new Date().getFullYear();
  return `${type}-${year}-${(count + 1).toString().padStart(3, '0')}`;
};

export const useECMStore = create<ECMState>((set, get) => ({
  ecrs: [],
  ecos: [],
  isLoading: false,
  error: null,
  unsubscribeECRs: null,
  unsubscribeECOs: null,

  // Selectors
  getProjectECRs: (projectId: string) => get().ecrs.filter(e => e.projectId === projectId),
  getProjectECOs: (projectId: string) => get().ecos.filter(e => e.projectId === projectId),

  // Fetch all ECM data (one-time)
  fetchECMData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch ECRs
      const ecrsQuery = query(collection(db, 'ecrs'), orderBy('createdAt', 'desc'));
      const ecrsSnapshot = await getDocs(ecrsQuery);
      const ecrs = ecrsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as ECR[];

      // Fetch ECOs
      const ecosQuery = query(collection(db, 'ecos'), orderBy('createdAt', 'desc'));
      const ecosSnapshot = await getDocs(ecosQuery);
      const ecos = ecosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as ECO[];

      set({ ecrs, ecos, isLoading: false });
    } catch (error) {
      console.error('Error fetching ECM data:', error);
      set({ error: 'ECM verileri yüklenirken hata oluştu', isLoading: false });
    }
  },

  // Subscribe to ECRs (real-time)
  subscribeToECRs: () => {
    const ecrsQuery = query(collection(db, 'ecrs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(ecrsQuery, 
      (snapshot) => {
        const ecrs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...convertTimestamps(doc.data())
        })) as ECR[];
        set({ ecrs });
      },
      (error) => {
        console.error('ECR subscription error:', error);
        set({ error: 'ECR senkronizasyon hatası' });
      }
    );
    set({ unsubscribeECRs: unsubscribe });
  },

  // Subscribe to ECOs (real-time)
  subscribeToECOs: () => {
    const ecosQuery = query(collection(db, 'ecos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(ecosQuery, 
      (snapshot) => {
        const ecos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...convertTimestamps(doc.data())
        })) as ECO[];
        set({ ecos });
      },
      (error) => {
        console.error('ECO subscription error:', error);
        set({ error: 'ECO senkronizasyon hatası' });
      }
    );
    set({ unsubscribeECOs: unsubscribe });
  },

  // Unsubscribe from all listeners
  unsubscribeAll: () => {
    const { unsubscribeECRs, unsubscribeECOs } = get();
    if (unsubscribeECRs) unsubscribeECRs();
    if (unsubscribeECOs) unsubscribeECOs();
    set({ unsubscribeECRs: null, unsubscribeECOs: null });
  },

  // Add ECR
  addECR: async (ecrData) => {
    set({ isLoading: true, error: null });
    try {
      const identifier = generateIdentifier('ECR', get().ecrs.length);
      const now = new Date();
      
      const docRef = await addDoc(collection(db, 'ecrs'), {
        ...ecrData,
        identifier,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      });

      // Log Activity
      const { useActivityStore } = await import('./activity-store');
      useActivityStore.getState().addActivity({
        type: 'ENGINEERING_CHANGE',
        title: 'Yeni ECR Oluşturuldu',
        description: `${identifier}: ${ecrData.title}`,
        metadata: { ecrId: docRef.id }
      });

      set({ isLoading: false });
    } catch (error) {
      console.error('Error adding ECR:', error);
      set({ error: 'ECR eklenirken hata oluştu', isLoading: false });
      throw error;
    }
  },

  // Update ECR
  updateECR: async (id, data) => {
    try {
      const docRef = doc(db, 'ecrs', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating ECR:', error);
      set({ error: 'ECR güncellenirken hata oluştu' });
      throw error;
    }
  },

  // Update ECR Status
  updateECRStatus: async (id, status) => {
    await get().updateECR(id, { status });
  },

  // Delete ECR
  deleteECR: async (id) => {
    try {
      await deleteDoc(doc(db, 'ecrs', id));
    } catch (error) {
      console.error('Error deleting ECR:', error);
      set({ error: 'ECR silinirken hata oluştu' });
      throw error;
    }
  },

  // Add ECO
  addECO: async (ecoData) => {
    set({ isLoading: true, error: null });
    try {
      const identifier = generateIdentifier('ECO', get().ecos.length);
      const now = new Date();
      
      await addDoc(collection(db, 'ecos'), {
        ...ecoData,
        identifier,
        approvalStatus: 'not_submitted',
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      });

      set({ isLoading: false });
    } catch (error) {
      console.error('Error adding ECO:', error);
      set({ error: 'ECO eklenirken hata oluştu', isLoading: false });
      throw error;
    }
  },

  // Update ECO
  updateECO: async (id, data) => {
    try {
      const docRef = doc(db, 'ecos', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating ECO:', error);
      set({ error: 'ECO güncellenirken hata oluştu' });
      throw error;
    }
  },

  // Update ECO Status
  updateECOStatus: async (id, status) => {
    await get().updateECO(id, { status });
  },

  // Approve ECO
  approveECO: async (id) => {
    await get().updateECO(id, { approvalStatus: 'approved' });
  },

  // Delete ECO
  deleteECO: async (id) => {
    try {
      await deleteDoc(doc(db, 'ecos', id));
    } catch (error) {
      console.error('Error deleting ECO:', error);
      set({ error: 'ECO silinirken hata oluştu' });
      throw error;
    }
  }
}));
