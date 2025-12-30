import { create } from 'zustand';
import { BOMItem, BOMNode, BOMSummary } from '@/types/bom';
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
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';

interface BOMState {
  items: BOMItem[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;

  // Actions
  fetchItems: (projectId: string) => Promise<void>;
  subscribeToItems: (projectId: string) => void;
  unsubscribeAll: () => void;
  addItem: (item: Omit<BOMItem, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'level'>) => Promise<string>;
  updateItem: (id: string, updates: Partial<BOMItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  // Bulk operations
  importFromWeave: (projectId: string, weaveComponents: { id: string; name: string; quantity: number }[]) => Promise<number>;
  
  // Computed
  getTreeStructure: (projectId: string) => BOMNode[];
  getSummary: (projectId: string) => BOMSummary;
  getItemsByParent: (parentId: string | null) => BOMItem[];
}

// Helper: Convert Firestore doc to BOMItem
const convertItem = (docSnap: any): BOMItem => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Helper: Build tree from flat list
const buildTree = (items: BOMItem[], parentId: string | null = null): BOMNode[] => {
  return items
    .filter(item => (item.parentId || null) === parentId)
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      ...item,
      children: buildTree(items, item.id),
      expanded: true,
    }));
};

export const useBOMStore = create<BOMState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  unsubscribe: null,

  fetchItems: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const q = query(
        collection(db, 'bomItems'),
        where('projectId', '==', projectId),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(convertItem);
      set({ items, isLoading: false });
    } catch (error) {
      console.error('Error fetching BOM items:', error);
      set({ error: 'BOM verileri yüklenirken hata oluştu', isLoading: false });
    }
  },

  subscribeToItems: (projectId) => {
    const q = query(
      collection(db, 'bomItems'),
      where('projectId', '==', projectId),
      orderBy('order', 'asc')
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(convertItem);
        set({ items });
      },
      (error) => {
        console.error('BOM subscription error:', error);
        set({ error: 'BOM senkronizasyon hatası' });
      }
    );

    set({ unsubscribe: unsub });
  },

  unsubscribeAll: () => {
    const { unsubscribe } = get();
    if (unsubscribe) unsubscribe();
    set({ unsubscribe: null });
  },

  addItem: async (itemData) => {
    set({ isLoading: true, error: null });
    try {
      const { items } = get();
      const sameParentItems = items.filter(i => i.parentId === itemData.parentId);
      const maxOrder = Math.max(...sameParentItems.map(i => i.order), -1);
      
      // Calculate level
      let level = 0;
      if (itemData.parentId) {
        const parent = items.find(i => i.id === itemData.parentId);
        level = (parent?.level || 0) + 1;
      }

      const now = new Date();
      const docRef = await addDoc(collection(db, 'bomItems'), {
        ...itemData,
        order: maxOrder + 1,
        level,
        totalCost: (itemData.unitCost || 0) * itemData.quantity,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });

      set({ isLoading: false });
      return docRef.id;
    } catch (error) {
      console.error('Error adding BOM item:', error);
      set({ error: 'BOM öğesi eklenirken hata oluştu', isLoading: false });
      throw error;
    }
  },

  updateItem: async (id, updates) => {
    try {
      const updateData: Record<string, unknown> = { 
        ...updates, 
        updatedAt: Timestamp.fromDate(new Date()) 
      };

      // Recalculate total cost if quantity or unit cost changes
      if (updates.quantity !== undefined || updates.unitCost !== undefined) {
        const currentItem = get().items.find(i => i.id === id);
        const newQuantity = updates.quantity ?? currentItem?.quantity ?? 0;
        const newUnitCost = updates.unitCost ?? currentItem?.unitCost ?? 0;
        updateData.totalCost = newQuantity * newUnitCost;
      }

      await updateDoc(doc(db, 'bomItems', id), updateData);
    } catch (error) {
      console.error('Error updating BOM item:', error);
      set({ error: 'BOM öğesi güncellenirken hata oluştu' });
      throw error;
    }
  },

  deleteItem: async (id) => {
    try {
      // Also delete all children
      const { items } = get();
      const getAllChildIds = (parentId: string): string[] => {
        const children = items.filter(i => i.parentId === parentId);
        return children.flatMap(c => [c.id, ...getAllChildIds(c.id)]);
      };
      
      const idsToDelete = [id, ...getAllChildIds(id)];
      
      const batch = writeBatch(db);
      idsToDelete.forEach(itemId => {
        batch.delete(doc(db, 'bomItems', itemId));
      });
      await batch.commit();
    } catch (error) {
      console.error('Error deleting BOM item:', error);
      set({ error: 'BOM öğesi silinirken hata oluştu' });
      throw error;
    }
  },

  importFromWeave: async (projectId, weaveComponents) => {
    try {
      const now = new Date();
      let count = 0;
      
      for (const comp of weaveComponents) {
        await addDoc(collection(db, 'bomItems'), {
          projectId,
          parentId: null,
          level: 0,
          productName: comp.name,
          quantity: comp.quantity,
          unit: 'adet',
          source: 'stock',
          status: 'draft',
          weaveComponentId: comp.id,
          order: count,
          createdAt: Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now),
        });
        count++;
      }
      
      return count;
    } catch (error) {
      console.error('Error importing from Weave:', error);
      throw error;
    }
  },

  getTreeStructure: (projectId) => {
    const projectItems = get().items.filter(i => i.projectId === projectId);
    return buildTree(projectItems);
  },

  getSummary: (projectId) => {
    const projectItems = get().items.filter(i => i.projectId === projectId);
    
    return {
      totalItems: projectItems.length,
      totalCost: projectItems.reduce((sum, i) => sum + (i.totalCost || 0), 0),
      makeCount: projectItems.filter(i => i.source === 'make').length,
      buyCount: projectItems.filter(i => i.source === 'buy').length,
      stockCount: projectItems.filter(i => i.source === 'stock').length,
      pendingCount: projectItems.filter(i => !['received', 'installed'].includes(i.status)).length,
      completedCount: projectItems.filter(i => ['received', 'installed'].includes(i.status)).length,
    };
  },

  getItemsByParent: (parentId) => {
    return get().items.filter(i => (i.parentId || null) === parentId);
  },
}));
