
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
    startAfter,
    limit,
    Timestamp,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Lot, LotMovement } from '@/types/inventory';

export const InventoryService = {
    async getLots(
        filters?: { productId?: string; warehouseId?: string },
        lastDoc?: QueryDocumentSnapshot,
        limitVal: number = 20
    ) {
        try {
            // Base query
            let q = query(
                collection(db, 'lots'), 
                orderBy('receivedDate', 'desc'),
            );
            
            // Apply filtering logic if needed (requires indexes for compound queries)
            // For MVP refactor, we usually sort first, then paginate. Client-side filtering breaks pagination
            // if we filter AFTER fetching. 
            // Ideally: we add 'where' clauses here.
             if (filters?.productId) {
                 q = query(q, where('productId', '==', filters.productId));
             }
             if (filters?.warehouseId) {
                 q = query(q, where('warehouseId', '==', filters.warehouseId));
             }

            // Pagination
            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }
            
            q = query(q, limit(limitVal));

            const snapshot = await getDocs(q);
            const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

            const items = snapshot.docs.map(doc => {
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
                } as Lot;
            });

            return { items, lastDoc: lastVisible };

        } catch (error) {
            console.error('Error fetching lots:', error);
            throw error;
        }
    },

    async addLot(lotData: Omit<Lot, 'id' | 'createdAt' | 'updatedAt' | 'availableQuantity'>) {
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
            return {
                id: docRef.id,
                ...lotData,
                availableQuantity,
                reservedQuantity: lotData.reservedQuantity || 0,
                createdAt: now,
                updatedAt: now,
            } as Lot;
        } catch (error) {
            console.error('Error adding lot:', error);
            throw error;
        }
    },

    async updateLot(id: string, data: Partial<Lot>, currentLot?: Lot) {
        try {
            const now = new Date();
            const updateData: any = {
                ...data,
                updatedAt: Timestamp.fromDate(now),
            };

            // Logic for available quantity calculation
            if (currentLot && (data.quantity !== undefined || data.reservedQuantity !== undefined)) {
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
            return updateData;
        } catch (error) {
            console.error('Error updating lot:', error);
            throw error;
        }
    },

    async deleteLot(id: string) {
        await deleteDoc(doc(db, 'lots', id));
    },

    async getLotMovements(lotId: string) {
        const q = query(
            collection(db, 'lotMovements'),
            where('lotId', '==', lotId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as LotMovement[];
    },

    async addLotMovement(movementData: Omit<LotMovement, 'id' | 'createdAt'>) {
        const now = new Date();
        const docRef = await addDoc(collection(db, 'lotMovements'), {
            ...movementData,
            createdAt: Timestamp.fromDate(now),
        });

        return {
            id: docRef.id,
            ...movementData,
            createdAt: now,
        } as LotMovement;
    },
    
    async getLotMovementsByReference(referenceId: string) {
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
    }
};
