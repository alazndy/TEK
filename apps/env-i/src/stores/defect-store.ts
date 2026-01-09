"use client"

import { create } from 'zustand';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  Timestamp,
  onSnapshot,
  Unsubscribe,
  where,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DefectReport, InspectedProduct } from '@/lib/types';
import { format } from 'date-fns';

interface DefectState {
  defects: DefectReport[];
  loading: boolean;
  error: string | null;
}

interface DefectActions {
  fetchDefects: () => Promise<void>;
  subscribeToDefects: () => Unsubscribe;
  addDefect: (defect: Omit<DefectReport, 'id' | 'formNumber' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateDefect: (id: string, data: Partial<DefectReport>) => Promise<void>;
  generateFormNumber: () => Promise<string>;
}

type DefectStore = DefectState & DefectActions;

/**
 * Form numarası oluştur: ATF-YYMMDD-XXX
 * Örnek: ATF-260106-001 (2026-01-06 tarihli ilk form)
 */
const generateFormNumberFromDate = (sequenceNumber: number): string => {
  const now = new Date();
  const yy = format(now, 'yy');
  const mm = format(now, 'MM');
  const dd = format(now, 'dd');
  const seq = String(sequenceNumber).padStart(3, '0');
  return `ATF-${yy}${mm}${dd}-${seq}`;
};

export const useDefectStore = create<DefectStore>((set, get) => ({
  defects: [],
  loading: false,
  error: null,

  generateFormNumber: async () => {
    // Bugünün başlangıcı
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Bugünkü son form numarasını bul
    const q = query(
      collection(db, 'defects'),
      where('createdAt', '>=', Timestamp.fromDate(today)),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return generateFormNumberFromDate(1);
    }
    
    const lastDoc = snapshot.docs[0].data();
    const lastFormNumber = lastDoc.formNumber as string;
    
    // Son numaradan sequence'ı çıkar: ATF-YYMMDD-XXX
    if (lastFormNumber) {
      const parts = lastFormNumber.split('-');
      if (parts.length === 3) {
        const lastSeq = parseInt(parts[2], 10);
        return generateFormNumberFromDate(lastSeq + 1);
      }
    }
    
    return generateFormNumberFromDate(1);
  },

  fetchDefects: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'defects'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const defects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        inspectorDate: doc.data().inspectorDate?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
      })) as DefectReport[];
      
      set({ defects, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching defects:', error);
    }
  },

  subscribeToDefects: () => {
    const q = query(
      collection(db, 'defects'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const defects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        inspectorDate: doc.data().inspectorDate?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
      })) as DefectReport[];
      
      set({ defects });
    });
  },

  addDefect: async (defectData) => {
    try {
      const now = new Date();
      const formNumber = await get().generateFormNumber();
      
      const docRef = await addDoc(collection(db, 'defects'), {
        ...defectData,
        formNumber,
        inspectorDate: Timestamp.fromDate(defectData.inspectorDate),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      
      // Speculative update for immediate UI feedback
      const newDefect: DefectReport = {
        id: docRef.id,
        formNumber,
        ...defectData,
        createdAt: now,
        updatedAt: now,
      };
      
      set(state => ({
        defects: [newDefect, ...state.defects]
      }));
      
      return docRef.id;
    } catch (error: any) {
      console.error('Error adding defect:', error);
      throw error;
    }
  },

  updateDefect: async (id, data) => {
    try {
      const now = new Date();
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.fromDate(now),
      };
      
      // Convert inspectorDate if present
      if (data.inspectorDate) {
        updateData.inspectorDate = Timestamp.fromDate(data.inspectorDate);
      }
      
      // If status becomes resolved, set resolvedAt if not provided
      if (data.status === 'resolved' && !data.resolvedAt) {
        updateData.resolvedAt = Timestamp.fromDate(now);
      }
      
      await updateDoc(doc(db, 'defects', id), updateData);
      
      set(state => ({
        defects: state.defects.map(d => 
          d.id === id 
            ? { 
                ...d, 
                ...data, 
                updatedAt: now, 
                ...(data.status === 'resolved' && !data.resolvedAt ? { resolvedAt: now } : {}) 
              } 
            : d
        )
      }));
    } catch (error: any) {
      console.error('Error updating defect:', error);
      throw error;
    }
  }
}));
