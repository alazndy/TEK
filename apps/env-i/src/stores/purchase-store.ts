import { create } from 'zustand';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PurchaseOrder, POItem, POStatus } from '@/lib/types';

interface PurchaseState {
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  error: string | null;
}

interface PurchaseActions {
  fetchPurchaseOrders: (status?: POStatus) => Promise<void>;
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePurchaseOrder: (id: string, data: Partial<PurchaseOrder>) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  
  updatePOStatus: (id: string, status: POStatus, approvedBy?: string) => Promise<void>;
  receivePOItems: (poId: string, receivedItems: { itemId: string; quantity: number }[]) => Promise<void>;
  
  getPOById: (id: string) => PurchaseOrder | undefined;
  getPOsBySupplier: (supplierId: string) => PurchaseOrder[];
  generatePONumber: () => string;
  calculatePOTotals: (items: POItem[], taxRate: number, shippingCost: number) => {
    subtotal: number;
    taxAmount: number;
    total: number;
  };
}

type PurchaseStore = PurchaseState & PurchaseActions;

export const usePurchaseStore = create<PurchaseStore>((set, get) => ({
  purchaseOrders: [],
  loading: false,
  error: null,

  fetchPurchaseOrders: async (status) => {
    set({ loading: true, error: null });
    try {
      let q;
      if (status) {
        q = query(
          collection(db, 'purchaseOrders'),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'purchaseOrders'),
          orderBy('createdAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      const purchaseOrders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expectedDate: data.expectedDate?.toDate(),
          receivedDate: data.receivedDate?.toDate(),
          approvedAt: data.approvedAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as PurchaseOrder[];
      
      set({ purchaseOrders, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching purchase orders:', error);
    }
  },

  addPurchaseOrder: async (poData) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const docData: any = {
        ...poData,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };
      
      if (poData.expectedDate) {
        docData.expectedDate = Timestamp.fromDate(poData.expectedDate);
      }
      
      const docRef = await addDoc(collection(db, 'purchaseOrders'), docData);
      
      const newPO: PurchaseOrder = {
        id: docRef.id,
        ...poData,
        createdAt: now,
        updatedAt: now,
      };
      
      set(state => ({
        purchaseOrders: [newPO, ...state.purchaseOrders],
        loading: false,
      }));
      
      return docRef.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updatePurchaseOrder: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.fromDate(now),
      };
      
      if (data.expectedDate) {
        updateData.expectedDate = Timestamp.fromDate(data.expectedDate);
      }
      if (data.receivedDate) {
        updateData.receivedDate = Timestamp.fromDate(data.receivedDate);
      }
      
      await updateDoc(doc(db, 'purchaseOrders', id), updateData);
      
      set(state => ({
        purchaseOrders: state.purchaseOrders.map(po => 
          po.id === id ? { ...po, ...data, updatedAt: now } : po
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deletePurchaseOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'purchaseOrders', id));
      
      set(state => ({
        purchaseOrders: state.purchaseOrders.filter(po => po.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updatePOStatus: async (id, status, approvedBy) => {
    const now = new Date();
    const updateData: Partial<PurchaseOrder> = { status };
    
    if (status === 'confirmed' && approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = now;
    }
    
    if (status === 'received') {
      updateData.receivedDate = now;
    }
    
    await get().updatePurchaseOrder(id, updateData);
  },

  receivePOItems: async (poId, receivedItems) => {
    set({ loading: true, error: null });
    try {
      const po = get().getPOById(poId);
      if (!po) throw new Error('Purchase order not found');
      
      const updatedItems = po.items.map(item => {
        const received = receivedItems.find(r => r.itemId === item.id);
        if (received) {
          return {
            ...item,
            receivedQuantity: item.receivedQuantity + received.quantity,
          };
        }
        return item;
      });
      
      // Determine new status
      const allReceived = updatedItems.every(
        item => item.receivedQuantity >= item.quantity
      );
      const someReceived = updatedItems.some(item => item.receivedQuantity > 0);
      
      let newStatus: POStatus = po.status;
      if (allReceived) {
        newStatus = 'received';
      } else if (someReceived) {
        newStatus = 'partially_received';
      }
      
      await get().updatePurchaseOrder(poId, {
        items: updatedItems,
        status: newStatus,
        receivedDate: allReceived ? new Date() : undefined,
      });
      
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getPOById: (id) => {
    return get().purchaseOrders.find(po => po.id === id);
  },

  getPOsBySupplier: (supplierId) => {
    return get().purchaseOrders.filter(po => po.supplierId === supplierId);
  },

  generatePONumber: () => {
    const { purchaseOrders } = get();
    const year = new Date().getFullYear();
    const prefix = `PO-${year}-`;
    
    const existingNumbers = purchaseOrders
      .map(po => po.poNumber)
      .filter(n => n.startsWith(prefix))
      .map(n => parseInt(n.replace(prefix, ''), 10))
      .filter(n => !isNaN(n));
    
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return `${prefix}${String(maxNumber + 1).padStart(4, '0')}`;
  },

  calculatePOTotals: (items, taxRate, shippingCost) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalCost, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount + shippingCost;
    
    return { subtotal, taxAmount, total };
  },
}));
