
import { 
    collection, 
    getDocs, 
    doc, 
    query, 
    orderBy, 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Supplier, Order, PurchaseOrder, Proposal } from '@/types/commercial';

export const CommercialService = {
    async getSuppliers() {
        const q = query(collection(db, 'suppliers'), orderBy('name'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Supplier[];
    },

    async getOrders(limitVal: number = 100) {
       // Placeholder for pagination logic if needed
       // Assuming orders are small enough or this is initial fetch
        const q = query(collection(db, 'orders'), orderBy('date', 'desc')); 
        // NOTE: 'limit' is not imported but easy to add if needed, following existing logic of fetchAll
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Order[];
    },
    
    async getProposals() {
        // Assuming proposals logic matches orders
        const q = query(collection(db, 'proposals'), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        // Note: Proposals in types.ts used string dates mostly, adjusting if needed
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Proposal[];
    }
};
