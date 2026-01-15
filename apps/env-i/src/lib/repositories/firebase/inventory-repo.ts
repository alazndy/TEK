
import { db } from '@/lib/firebase';
import { 
    collection, 
    getDocs, 
    getDoc, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    limit,
    startAfter,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { IInventoryRepository } from '../interfaces';
import { Product, Equipment, Consumable, Warehouse, Order, Proposal, AuditLog, Settings } from '@/lib/types';

export class FirebaseInventoryRepository implements IInventoryRepository {
    // Products
    async getProducts(limitCount = 50, lastDoc?: any): Promise<{ data: Product[], lastDoc: any }> {
        let q = query(collection(db, 'products'), limit(limitCount));
        if (lastDoc) {
            q = query(collection(db, 'products'), startAfter(lastDoc), limit(limitCount));
        }
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ ...doc.data(), originalId: doc.data().id, id: doc.id } as unknown as Product));
        return { data, lastDoc: snap.docs[snap.docs.length - 1] || null };
    }

    async getProductById(id: string): Promise<Product | null> {
        const snap = await getDoc(doc(db, 'products', id));
        return snap.exists() ? { ...snap.data(), id: snap.id } as Product : null;
    }

    async getAllProductsForSearch(): Promise<Product[]> {
        const q = query(collection(db, "products"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ ...doc.data(), originalId: doc.data().id, id: doc.id } as unknown as Product));
    }

    async addProduct(data: Omit<Product, 'id' | 'history'>): Promise<string> {
        const ref = await addDoc(collection(db, 'products'), data);
        return ref.id;
    }

    async updateProduct(id: string, data: Partial<Product>): Promise<void> {
        await setDoc(doc(db, 'products', id), data, { merge: true });
    }

    async deleteProduct(id: string): Promise<void> {
        await deleteDoc(doc(db, 'products', id));
    }

    // Equipment
    async getEquipment(limitCount = 50, lastDoc?: any): Promise<{ data: Equipment[], lastDoc: any }> {
        let q = query(collection(db, 'equipment'), limit(limitCount));
        if (lastDoc) {
            q = query(collection(db, 'equipment'), startAfter(lastDoc), limit(limitCount));
        }
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Equipment));
        return { data, lastDoc: snap.docs[snap.docs.length - 1] || null };
    }

    async addEquipment(data: Omit<Equipment, 'id'>): Promise<string> {
        const ref = await addDoc(collection(db, 'equipment'), data);
        return ref.id;
    }

    async updateEquipment(id: string, data: Partial<Equipment>): Promise<void> {
        await setDoc(doc(db, 'equipment', id), data, { merge: true });
    }

    async deleteEquipment(id: string): Promise<void> {
        await deleteDoc(doc(db, 'equipment', id));
    }

    // Consumables
    async getConsumables(limitCount = 50, lastDoc?: any): Promise<{ data: Consumable[], lastDoc: any }> {
        let q = query(collection(db, 'consumables'), limit(limitCount));
        if (lastDoc) {
            q = query(collection(db, 'consumables'), startAfter(lastDoc), limit(limitCount));
        }
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Consumable));
        return { data, lastDoc: snap.docs[snap.docs.length - 1] || null };
    }

    async addConsumable(data: Omit<Consumable, 'id'>): Promise<string> {
        const ref = await addDoc(collection(db, 'consumables'), data);
        return ref.id;
    }

    async updateConsumable(id: string, data: Partial<Consumable>): Promise<void> {
        await setDoc(doc(db, 'consumables', id), data, { merge: true });
    }

    async deleteConsumable(id: string): Promise<void> {
        await deleteDoc(doc(db, 'consumables', id));
    }

    // Warehouses
    async getWarehouses(): Promise<Warehouse[]> {
        const q = query(collection(db, 'warehouses'), orderBy('name'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Warehouse));
    }

    async addWarehouse(data: Omit<Warehouse, 'id'>): Promise<string> {
        const ref = await addDoc(collection(db, 'warehouses'), data);
        return ref.id;
    }

    async updateWarehouse(id: string, data: Partial<Warehouse>): Promise<void> {
        await setDoc(doc(db, 'warehouses', id), data, { merge: true });
    }

    async deleteWarehouse(id: string): Promise<void> {
        await deleteDoc(doc(db, 'warehouses', id));
    }

    // Audit Logs
    async getAuditLogs(limitCount = 50, lastDoc?: any): Promise<{ data: AuditLog[], lastDoc: any }> {
        let q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(limitCount));
        if (lastDoc) {
            q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), startAfter(lastDoc), limit(limitCount));
        }
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => {
            const d = doc.data();
            const timestamp = d.timestamp ? d.timestamp.toDate() : new Date();
            return {
                id: doc.id,
                ...d,
                timestamp,
                date: timestamp.toLocaleString('tr-TR')
            } as AuditLog;
        });
        return { data, lastDoc: snap.docs[snap.docs.length - 1] || null };
    }

    async addAuditLog(log: Omit<AuditLog, 'id'>): Promise<void> {
        await addDoc(collection(db, 'audit_logs'), {
            ...log,
            timestamp: serverTimestamp()
        });
    }

    // Settings
    async getSettings(): Promise<Settings | null> {
        const snap = await getDocs(collection(db, 'settings'));
        if (snap.empty) return null;
        return { ...snap.docs[0].data(), id: snap.docs[0].id } as Settings;
    }

    async updateSettings(id: string, data: Partial<Settings>): Promise<void> {
        await setDoc(doc(db, 'settings', id), data, { merge: true });
    }

    async createSettings(data: Settings): Promise<string> {
        const ref = await addDoc(collection(db, 'settings'), data);
        return ref.id;
    }

    // Orders & Proposals
    async getOrders(limitCount = 25, lastDoc?: any): Promise<{ data: Order[], lastDoc: any }> {
        let q = query(collection(db, 'orders'), orderBy('date', 'desc'), limit(limitCount));
        if (lastDoc) {
            q = query(collection(db, 'orders'), orderBy('date', 'desc'), startAfter(lastDoc), limit(limitCount));
        }
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
        return { data, lastDoc: snap.docs[snap.docs.length - 1] || null };
    }

    async addOrder(data: Omit<Order, 'id'>): Promise<string> {
        const ref = await addDoc(collection(db, 'orders'), data);
        return ref.id;
    }

    async getProposals(limitCount = 25, lastDoc?: any): Promise<{ data: Proposal[], lastDoc: any }> {
        let q = query(collection(db, 'proposals'), orderBy('date', 'desc'), limit(limitCount));
        if (lastDoc) {
            q = query(collection(db, 'proposals'), orderBy('date', 'desc'), startAfter(lastDoc), limit(limitCount));
        }
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Proposal));
        return { data, lastDoc: snap.docs[snap.docs.length - 1] || null };
    }

    async addProposal(data: Omit<Proposal, 'id'>): Promise<string> {
        const ref = await addDoc(collection(db, 'proposals'), data);
        return ref.id;
    }
}
