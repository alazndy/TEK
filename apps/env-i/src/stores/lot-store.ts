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
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Lot, LotMovement, LotStatus } from '@/lib/types';

interface LotState {
  lots: Lot[];
  lotMovements: LotMovement[];
  loading: boolean;
  error: string | null;
}

interface LotActions {
  fetchLots: (productId?: string, warehouseId?: string) => Promise<void>;
  addLot: (lot: Omit<Lot, 'id' | 'createdAt' | 'updatedAt' | 'availableQuantity'>) => Promise<string>;
  updateLot: (id: string, data: Partial<Lot>) => Promise<void>;
  deleteLot: (id: string) => Promise<void>;
  
  fetchLotMovements: (lotId: string) => Promise<void>;
  addLotMovement: (movement: Omit<LotMovement, 'id' | 'createdAt'>) => Promise<string>;
  
  reserveFromLot: (lotId: string, quantity: number) => Promise<void>;
  releaseFromLot: (lotId: string, quantity: number) => Promise<void>;
  consumeFromLot: (lotId: string, quantity: number, userId: string, reason?: string) => Promise<void>;
  
  getLotById: (id: string) => Lot | undefined;
  getLotsByProduct: (productId: string) => Lot[];
  getLotsByWarehouse: (warehouseId: string) => Lot[];
  getExpiringLots: (daysThreshold: number) => Lot[];
  generateLotNumber: (productId: string) => string;
  
  // FIFO/LIFO helpers
  getAvailableLotsFIFO: (productId: string, warehouseId?: string) => Lot[];
  allocateStockFIFO: (productId: string, quantity: number, warehouseId?: string) => { lotId: string; quantity: number }[];
  getLotMovementsByReferenceId: (referenceId: string) => Promise<LotMovement[]>;
}

type LotStore = LotState & LotActions;

export const useLotStore = create<LotStore>((set, get) => ({
  lots: [],
  lotMovements: [],
  loading: false,
  error: null,

  fetchLots: async (productId, warehouseId) => {
    set({ loading: true, error: null });
    try {
      let q = query(collection(db, 'lots'), orderBy('receivedDate', 'desc'));
      
      // Note: Firestore doesn't support multiple where clauses on different fields without composite index
      // For now, we filter client-side
      const snapshot = await getDocs(q);
      let lots = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          manufactureDate: data.manufactureDate?.toDate(),
          expiryDate: data.expiryDate?.toDate(),
          receivedDate: data.receivedDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          availableQuantity: (data.quantity || 0) - (data.reservedQuantity || 0),
        };
      }) as Lot[];
      
      // Client-side filtering
      if (productId) {
        lots = lots.filter(l => l.productId === productId);
      }
      if (warehouseId) {
        lots = lots.filter(l => l.warehouseId === warehouseId);
      }
      
      set({ lots, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching lots:', error);
    }
  },

  addLot: async (lotData) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const availableQuantity = lotData.quantity - (lotData.reservedQuantity || 0);
      
      const docData: any = {
        ...lotData,
        availableQuantity,
        reservedQuantity: lotData.reservedQuantity || 0,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        receivedDate: Timestamp.fromDate(lotData.receivedDate),
      };
      
      if (lotData.manufactureDate) {
        docData.manufactureDate = Timestamp.fromDate(lotData.manufactureDate);
      }
      if (lotData.expiryDate) {
        docData.expiryDate = Timestamp.fromDate(lotData.expiryDate);
      }
      
      const docRef = await addDoc(collection(db, 'lots'), docData);
      
      const newLot: Lot = {
        id: docRef.id,
        ...lotData,
        availableQuantity,
        reservedQuantity: lotData.reservedQuantity || 0,
        createdAt: now,
        updatedAt: now,
      };
      
      set(state => ({
        lots: [newLot, ...state.lots],
        loading: false,
      }));
      
      return docRef.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateLot: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.fromDate(now),
      };
      
      // Recalculate available quantity if quantity or reserved changes
      const currentLot = get().getLotById(id);
      if (currentLot) {
        const newQuantity = data.quantity ?? currentLot.quantity;
        const newReserved = data.reservedQuantity ?? currentLot.reservedQuantity;
        updateData.availableQuantity = newQuantity - newReserved;
      }
      
      if (data.manufactureDate) {
        updateData.manufactureDate = Timestamp.fromDate(data.manufactureDate);
      }
      if (data.expiryDate) {
        updateData.expiryDate = Timestamp.fromDate(data.expiryDate);
      }
      if (data.receivedDate) {
        updateData.receivedDate = Timestamp.fromDate(data.receivedDate);
      }
      
      await updateDoc(doc(db, 'lots', id), updateData);
      
      set(state => ({
        lots: state.lots.map(l => 
          l.id === id ? { 
            ...l, 
            ...data, 
            availableQuantity: updateData.availableQuantity,
            updatedAt: now 
          } : l
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteLot: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'lots', id));
      
      set(state => ({
        lots: state.lots.filter(l => l.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchLotMovements: async (lotId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'lotMovements'),
        where('lotId', '==', lotId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const lotMovements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as LotMovement[];
      
      set({ lotMovements, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching lot movements:', error);
    }
  },

  addLotMovement: async (movementData) => {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'lotMovements'), {
        ...movementData,
        createdAt: Timestamp.fromDate(now),
      });
      
      const newMovement: LotMovement = {
        id: docRef.id,
        ...movementData,
        createdAt: now,
      };
      
      set(state => ({
        lotMovements: [newMovement, ...state.lotMovements],
      }));
      
      return docRef.id;
    } catch (error: any) {
      console.error('Error adding lot movement:', error);
      throw error;
    }
  },

  reserveFromLot: async (lotId, quantity) => {
    const lot = get().getLotById(lotId);
    if (!lot) throw new Error('Lot not found');
    if (lot.availableQuantity < quantity) throw new Error('Insufficient available quantity');
    
    await get().updateLot(lotId, {
      reservedQuantity: lot.reservedQuantity + quantity,
    });
  },

  releaseFromLot: async (lotId, quantity) => {
    const lot = get().getLotById(lotId);
    if (!lot) throw new Error('Lot not found');
    if (lot.reservedQuantity < quantity) throw new Error('Cannot release more than reserved');
    
    await get().updateLot(lotId, {
      reservedQuantity: lot.reservedQuantity - quantity,
    });
  },

  consumeFromLot: async (lotId, quantity, userId, reason) => {
    const lot = get().getLotById(lotId);
    if (!lot) throw new Error('Lot not found');
    if (lot.quantity < quantity) throw new Error('Insufficient quantity');
    
    const newQuantity = lot.quantity - quantity;
    const newReserved = Math.max(0, lot.reservedQuantity - quantity);
    const newStatus: LotStatus = newQuantity === 0 ? 'consumed' : lot.status;
    
    await get().updateLot(lotId, {
      quantity: newQuantity,
      reservedQuantity: newReserved,
      status: newStatus,
    });
    
    // Record movement
    await get().addLotMovement({
      lotId,
      type: 'issue',
      quantity: -quantity,
      reason,
      performedBy: userId,
    });
  },

  getLotById: (id) => {
    return get().lots.find(l => l.id === id);
  },

  getLotsByProduct: (productId) => {
    return get().lots.filter(l => l.productId === productId);
  },

  getLotsByWarehouse: (warehouseId) => {
    return get().lots.filter(l => l.warehouseId === warehouseId);
  },

  getExpiringLots: (daysThreshold) => {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
    
    return get().lots.filter(l => 
      l.expiryDate && 
      l.expiryDate <= thresholdDate && 
      l.status === 'available' &&
      l.quantity > 0
    );
  },

  generateLotNumber: (productId) => {
    const lots = get().getLotsByProduct(productId);
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const prefix = `LOT-${year}${month}-`;
    
    const existingNumbers = lots
      .map(l => l.lotNumber)
      .filter(n => n.startsWith(prefix))
      .map(n => parseInt(n.replace(prefix, ''), 10))
      .filter(n => !isNaN(n));
    
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return `${prefix}${String(maxNumber + 1).padStart(4, '0')}`;
  },

  getAvailableLotsFIFO: (productId, warehouseId) => {
    let lots = get().getLotsByProduct(productId)
      .filter(l => l.status === 'available' && l.availableQuantity > 0);
    
    if (warehouseId) {
      lots = lots.filter(l => l.warehouseId === warehouseId);
    }
    
    // Sort by received date (oldest first for FIFO)
    return lots.sort((a, b) => 
      new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime()
    );
  },

  allocateStockFIFO: (productId, quantity, warehouseId) => {
    const availableLots = get().getAvailableLotsFIFO(productId, warehouseId);
    const allocations: { lotId: string; quantity: number }[] = [];
    let remainingQuantity = quantity;
    
    for (const lot of availableLots) {
      if (remainingQuantity <= 0) break;
      
      const allocateQty = Math.min(lot.availableQuantity, remainingQuantity);
      allocations.push({ lotId: lot.id, quantity: allocateQty });
      remainingQuantity -= allocateQty;
    }
    
    return allocations;
  },

  getLotMovementsByReferenceId: async (referenceId) => {
    try {
      const q = query(
        collection(db, 'lotMovements'),
        where('referenceId', '==', referenceId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as LotMovement[];
    } catch (error) {
      console.error('Error fetching lot movements by reference:', error);
      return [];
    }
  },
}));
