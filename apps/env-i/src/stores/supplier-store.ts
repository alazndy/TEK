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
import type { Supplier, ProductSupplier } from '@/lib/types';

interface SupplierState {
  suppliers: Supplier[];
  productSuppliers: ProductSupplier[];
  loading: boolean;
  error: string | null;
}

interface SupplierActions {
  fetchSuppliers: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  
  fetchProductSuppliers: (productId?: string) => Promise<void>;
  addProductSupplier: (data: Omit<ProductSupplier, 'id'>) => Promise<string>;
  updateProductSupplier: (id: string, data: Partial<ProductSupplier>) => Promise<void>;
  deleteProductSupplier: (id: string) => Promise<void>;
  
  getSupplierById: (id: string) => Supplier | undefined;
  getSuppliersByProduct: (productId: string) => (ProductSupplier & { supplier?: Supplier })[];
  generateSupplierCode: () => string;
}

type SupplierStore = SupplierState & SupplierActions;

export const useSupplierStore = create<SupplierStore>((set, get) => ({
  suppliers: [],
  productSuppliers: [],
  loading: false,
  error: null,

  fetchSuppliers: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(collection(db, 'suppliers'), orderBy('name'));
      const snapshot = await getDocs(q);
      const suppliers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Supplier[];
      set({ suppliers, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching suppliers:', error);
    }
  },

  addSupplier: async (supplierData) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'suppliers'), {
        ...supplierData,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      
      const newSupplier: Supplier = {
        id: docRef.id,
        ...supplierData,
        createdAt: now,
        updatedAt: now,
      };
      
      set(state => ({
        suppliers: [...state.suppliers, newSupplier],
        loading: false,
      }));
      
      return docRef.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateSupplier: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      await updateDoc(doc(db, 'suppliers', id), {
        ...data,
        updatedAt: Timestamp.fromDate(now),
      });
      
      set(state => ({
        suppliers: state.suppliers.map(s => 
          s.id === id ? { ...s, ...data, updatedAt: now } : s
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteSupplier: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'suppliers', id));
      
      set(state => ({
        suppliers: state.suppliers.filter(s => s.id !== id),
        productSuppliers: state.productSuppliers.filter(ps => ps.supplierId !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchProductSuppliers: async (productId) => {
    set({ loading: true, error: null });
    try {
      let q;
      if (productId) {
        q = query(
          collection(db, 'productSuppliers'),
          where('productId', '==', productId)
        );
      } else {
        q = query(collection(db, 'productSuppliers'));
      }
      
      const snapshot = await getDocs(q);
      const productSuppliers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastPurchaseDate: doc.data().lastPurchaseDate?.toDate(),
      })) as ProductSupplier[];
      
      set({ productSuppliers, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error fetching product suppliers:', error);
    }
  },

  addProductSupplier: async (data) => {
    set({ loading: true, error: null });
    try {
      const docRef = await addDoc(collection(db, 'productSuppliers'), {
        ...data,
        lastPurchaseDate: data.lastPurchaseDate 
          ? Timestamp.fromDate(data.lastPurchaseDate) 
          : null,
      });
      
      const newProductSupplier: ProductSupplier = {
        id: docRef.id,
        ...data,
      };
      
      set(state => ({
        productSuppliers: [...state.productSuppliers, newProductSupplier],
        loading: false,
      }));
      
      return docRef.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProductSupplier: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updateData: any = { ...data };
      if (data.lastPurchaseDate) {
        updateData.lastPurchaseDate = Timestamp.fromDate(data.lastPurchaseDate);
      }
      
      await updateDoc(doc(db, 'productSuppliers', id), updateData);
      
      set(state => ({
        productSuppliers: state.productSuppliers.map(ps => 
          ps.id === id ? { ...ps, ...data } : ps
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteProductSupplier: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'productSuppliers', id));
      
      set(state => ({
        productSuppliers: state.productSuppliers.filter(ps => ps.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getSupplierById: (id) => {
    return get().suppliers.find(s => s.id === id);
  },

  getSuppliersByProduct: (productId) => {
    const { suppliers, productSuppliers } = get();
    return productSuppliers
      .filter(ps => ps.productId === productId)
      .map(ps => ({
        ...ps,
        supplier: suppliers.find(s => s.id === ps.supplierId),
      }));
  },

  generateSupplierCode: () => {
    const { suppliers } = get();
    const existingCodes = suppliers
      .map(s => s.code)
      .filter(c => c.startsWith('SUP-'))
      .map(c => parseInt(c.replace('SUP-', ''), 10))
      .filter(n => !isNaN(n));
    
    const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
    return `SUP-${String(maxCode + 1).padStart(3, '0')}`;
  },
}));
