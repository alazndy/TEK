import { create } from 'zustand';
import { InventoryService } from '@/services/inventory-service';
import type { Lot, LotMovement, LotStatus } from '@/types/inventory';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

interface LotState {
  lots: Lot[];
  lotMovements: LotMovement[];
  loading: boolean;
  error: string | null;
  // Pagination State
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

interface LotActions {
  fetchLots: (productId?: string, warehouseId?: string) => Promise<void>;
  loadMoreLots: (productId?: string, warehouseId?: string) => Promise<void>;
  
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
  lastDoc: null,
  hasMore: true,

  fetchLots: async (productId, warehouseId) => {
    set({ loading: true, error: null, lots: [], lastDoc: null, hasMore: true });
    try {
      const { items, lastDoc } = await InventoryService.getLots(
          { productId, warehouseId }, 
          undefined, // Initial load, no cursor
          20 // Limit
      );
      
      set({ 
          lots: items, 
          lastDoc, 
          hasMore: items.length === 20, // If we got full limit, likely more exists
          loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching lots:', error);
    }
  },

  loadMoreLots: async (productId, warehouseId) => {
      const { lastDoc, hasMore, loading } = get();
      if (!lastDoc || !hasMore || loading) return;

      set({ loading: true });
      try {
          const { items, lastDoc: newLastDoc } = await InventoryService.getLots(
              { productId, warehouseId },
              lastDoc,
              20
          );

          set(state => ({
              lots: [...state.lots, ...items],
              lastDoc: newLastDoc,
              hasMore: items.length === 20,
              loading: false
          }));
      } catch (error: any) {
          set({ error: error.message, loading: false });
      }
  },

  addLot: async (lotData) => {
    set({ loading: true, error: null });
    try {
        const newLot = await InventoryService.addLot(lotData);  
        set(state => ({
            lots: [newLot, ...state.lots],
            loading: false,
        }));
        return newLot.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateLot: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const currentLot = get().getLotById(id);
      
      // Use Service
      const updatedData = await InventoryService.updateLot(id, data, currentLot);
      
      set(state => ({
        lots: state.lots.map(l => 
          l.id === id ? { 
            ...l, 
            ...updatedData, 
            // updatedAt handled by service but we sync local state 
             // Note: Service returns Partial data, we merge carefully
          } : l
        ),
        loading: false,
      }));
      
      // Refresh to ensure full consistency if needed, or trust local merge
      // For now trust local merge + service return
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteLot: async (id) => {
    set({ loading: true, error: null });
    try {
      await InventoryService.deleteLot(id);
      
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
      const lotMovements = await InventoryService.getLotMovements(lotId);
      set({ lotMovements, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addLotMovement: async (movementData) => {
    try {
      const newMovement = await InventoryService.addLotMovement(movementData);
      set(state => ({
        lotMovements: [newMovement, ...state.lotMovements],
      }));
      return newMovement.id;
    } catch (error: any) {
      console.error('Error adding lot movement:', error);
      throw error;
    }
  },

  reserveFromLot: async (lotId, quantity) => {
    const lot = get().getLotById(lotId);
    if (!lot) throw new Error('Lot not found');
    if (lot.availableQuantity < quantity) throw new Error('Insufficient available quantity');
    
    // Logic remains in store or moves to service? 
    // For now, keeping business logic here, calling service for update
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
      return await InventoryService.getLotMovementsByReference(referenceId);
    } catch (error) {
       console.error('Error fetching lot movements by reference:', error);
       return [];
    }
  },
}));
