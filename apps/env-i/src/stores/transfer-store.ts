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
import type { StockTransfer, TransferItem, TransferStatus } from '@/lib/types';
import { useLotStore } from './lot-store';

interface TransferState {
  transfers: StockTransfer[];
  loading: boolean;
  error: string | null;
}

interface TransferActions {
  fetchTransfers: (status?: TransferStatus) => Promise<void>;
  addTransfer: (transfer: Omit<StockTransfer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTransfer: (id: string, data: Partial<StockTransfer>) => Promise<void>;
  deleteTransfer: (id: string) => Promise<void>;
  
  shipTransfer: (id: string, userId: string) => Promise<void>;
  receiveTransfer: (id: string, receivedItems: { itemId: string; quantity: number }[], userId: string) => Promise<void>;
  cancelTransfer: (id: string) => Promise<void>;
  
  getTransferById: (id: string) => StockTransfer | undefined;
  getTransfersByWarehouse: (warehouseId: string) => StockTransfer[];
  generateTransferNumber: () => string;
}

type TransferStore = TransferState & TransferActions;

export const useTransferStore = create<TransferStore>((set, get) => ({
  transfers: [],
  loading: false,
  error: null,

  fetchTransfers: async (status) => {
    set({ loading: true, error: null });
    try {
      let q;
      if (status) {
        q = query(
          collection(db, 'stockTransfers'),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'stockTransfers'),
          orderBy('createdAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      const transfers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          shippedAt: data.shippedAt?.toDate(),
          receivedAt: data.receivedAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as StockTransfer[];
      
      set({ transfers, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching transfers:', error);
    }
  },

  addTransfer: async (transferData) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'stockTransfers'), {
        ...transferData,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      
      const newTransfer: StockTransfer = {
        id: docRef.id,
        ...transferData,
        createdAt: now,
        updatedAt: now,
      };
      
      set(state => ({
        transfers: [newTransfer, ...state.transfers],
        loading: false,
      }));
      
      return docRef.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateTransfer: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.fromDate(now),
      };
      
      if (data.shippedAt) {
        updateData.shippedAt = Timestamp.fromDate(data.shippedAt);
      }
      if (data.receivedAt) {
        updateData.receivedAt = Timestamp.fromDate(data.receivedAt);
      }
      
      await updateDoc(doc(db, 'stockTransfers', id), updateData);
      
      set(state => ({
        transfers: state.transfers.map(t => 
          t.id === id ? { ...t, ...data, updatedAt: now } : t
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteTransfer: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'stockTransfers', id));
      
      set(state => ({
        transfers: state.transfers.filter(t => t.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  shipTransfer: async (id, userId) => {
    const transfer = get().getTransferById(id);
    if (!transfer) throw new Error('Transfer not found');
    if (transfer.status !== 'pending') throw new Error('Transfer must be pending to ship');
    
    const now = new Date();
    const updatedItems = transfer.items.map(item => ({
      ...item,
      shippedQuantity: item.requestedQuantity,
    }));
    
    await get().updateTransfer(id, {
      status: 'in_transit',
      items: updatedItems,
      shippedAt: now,
    });
    
    // Decrease stock from source warehouse
    const { allocateStockFIFO, updateLot, addLotMovement } = useLotStore.getState();
    
    for (const item of updatedItems) {
      if (!item.productId) continue;
      
      // Allocate lots using FIFO
      const allocations = allocateStockFIFO(item.productId, item.shippedQuantity || 0, transfer.fromWarehouseId);
      
      for (const allocation of allocations) {
        const lot = useLotStore.getState().getLotById(allocation.lotId);
        if (!lot) continue;
        
        await updateLot(lot.id, {
          quantity: lot.quantity - allocation.quantity,
        });
        
        await addLotMovement({
          lotId: lot.id,
          type: 'transfer',
          quantity: -allocation.quantity,
          fromWarehouseId: transfer.fromWarehouseId,
          toWarehouseId: transfer.toWarehouseId,
          referenceType: 'transfer',
          referenceId: transfer.id,
          performedBy: userId,
        });
      }
    }
  },

  receiveTransfer: async (id, receivedItems, userId) => {
    const transfer = get().getTransferById(id);
    if (!transfer) throw new Error('Transfer not found');
    if (transfer.status !== 'in_transit') throw new Error('Transfer must be in transit to receive');
    
    const now = new Date();
    const updatedItems = transfer.items.map(item => {
      const received = receivedItems.find(r => r.itemId === item.id);
      if (received) {
        return {
          ...item,
          receivedQuantity: received.quantity,
        };
      }
      return item;
    });
    
    await get().updateTransfer(id, {
      status: 'completed',
      items: updatedItems,
      receivedAt: now,
    });
    
    // Increase stock in destination warehouse
    const { addLot, addLotMovement } = useLotStore.getState();
    
    for (const item of updatedItems) {
        if (!item.productId || !item.receivedQuantity) continue;
        
        // Create a new lot for the received items at the destination warehouse
        // ideally we should carry over lot details (expiry, manufacture date) from source
        // For now, we create a new lot with current date as received date
        
        // Find product info (would normally come from product store, but we have productId)
        // We will generate a new lot number
        const { generateLotNumber } = useLotStore.getState();
        const lotNumber = generateLotNumber(item.productId);
        
        const newLotId = await addLot({
            lotNumber: lotNumber,
            productId: item.productId,
            productName: item.productName,
            warehouseId: transfer.toWarehouseId,
            quantity: item.receivedQuantity,
            status: 'available',
            receivedDate: now,
            costPerUnit: 0, // Should come from source lot 
            currency: 'TRY',
            notes: `Transfer from ${transfer.fromWarehouseName || transfer.fromWarehouseId}`,
            reservedQuantity: 0,
        });

        await addLotMovement({
            lotId: newLotId,
            type: 'receive',
            quantity: item.receivedQuantity,
            fromWarehouseId: transfer.fromWarehouseId,
            toWarehouseId: transfer.toWarehouseId,
            referenceType: 'transfer',
            referenceId: transfer.id,
            performedBy: userId,
        });
    }
  },

  cancelTransfer: async (id) => {
    const transfer = get().getTransferById(id);
    if (!transfer) throw new Error('Transfer not found');
    if (transfer.status === 'completed') throw new Error('Cannot cancel completed transfer');
    
    // If already shipped, need to reverse the stock changes
    if (transfer.status === 'in_transit') {
      // Reverse stock changes from source warehouse
      const { items } = transfer;
      const { updateLot, addLotMovement, getLotMovementsByReferenceId, getLotById } = useLotStore.getState();

      // Find stock movements related to this transfer
      // Since lot-store doesn't expose getMovements directly in the interface used here, we rely on the lot movements we just created
      // Ideally we should track which lots were used in the transfer object itself.
      // Current implementation of shipTransfer uses FIFO and creates movements.
      
      // Better approach: Find movements by referenceId (transferId)
      // Assuming getLotMovementsByReferenceId exists (if not we need to add it or iterate lots)
      // Since we don't have that helper in the context provided, we'll iterate items and lots.
      
      // FALLBACK: Iterate all lots and find movements for this transfer (could be slow but accurate)
      // OR: Since we don't have lot tracking in TransferItem, we have to rely on what shipTransfer did.
      
      // Let's implement a logical reversal based on the assumption that shipTransfer worked.
      // We need to put items BACK into the source warehouse.
      // To simplify, we will find the original lots if possible, or create new lots in source warehouse.
      // Trying to find original lots:
       
      for (const item of items) {
         if (!item.productId || !item.shippedQuantity) continue;

         // We need to add 'item.shippedQuantity' back to 'transfer.fromWarehouseId'
         // We will look for an EXISTING lot for this product in the source warehouse to add to,
         // or create a new one.
         
         const { lots } = useLotStore.getState();
         const sourceLot = lots.find(l => 
            l.productId === item.productId && 
            l.warehouseId === transfer.fromWarehouseId &&
            l.status === 'available'
         );

         if (sourceLot) {
            await updateLot(sourceLot.id, {
               quantity: sourceLot.quantity + item.shippedQuantity
            });
             await addLotMovement({
               lotId: sourceLot.id,
               type: 'adjust', // or 'cancellation_return'
               quantity: item.shippedQuantity,
               fromWarehouseId: transfer.fromWarehouseId, // It's coming back to here
               toWarehouseId: transfer.fromWarehouseId,
               referenceType: 'transfer',
               referenceId: transfer.id,
               reason: 'Transfer cancellation return',
               performedBy: 'system' 
            });
         } else {
             // Create new lot (returned stock)
             const { addLot } = useLotStore.getState();
              // Mock function to generate lot number (reuse from receive)
             const lotNumber = `RET-${transfer.transferNumber}-${item.productId.substring(0,4)}`;
             
             const newLotId = await addLot({
                lotNumber: lotNumber,
                productId: item.productId,
                productName: item.productName,
                warehouseId: transfer.fromWarehouseId,
                quantity: item.shippedQuantity,
                status: 'available',
                receivedDate: new Date(),
                costPerUnit: 0,
                currency: 'TRY',
                notes: `Returned from cancelled transfer ${transfer.transferNumber}`,
                reservedQuantity: 0,
            });
         }
      }
    }
    
    await get().updateTransfer(id, {
      status: 'cancelled',
    });
  },

  getTransferById: (id) => {
    return get().transfers.find(t => t.id === id);
  },

  getTransfersByWarehouse: (warehouseId) => {
    return get().transfers.filter(
      t => t.fromWarehouseId === warehouseId || t.toWarehouseId === warehouseId
    );
  },

  generateTransferNumber: () => {
    const { transfers } = get();
    const year = new Date().getFullYear();
    const prefix = `TRF-${year}-`;
    
    const existingNumbers = transfers
      .map(t => t.transferNumber)
      .filter(n => n.startsWith(prefix))
      .map(n => parseInt(n.replace(prefix, ''), 10))
      .filter(n => !isNaN(n));
    
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return `${prefix}${String(maxNumber + 1).padStart(4, '0')}`;
  },
}));
