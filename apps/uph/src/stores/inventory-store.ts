import { create } from 'zustand';
import { Product, Equipment, Consumable, ProjectUsage } from '@/types/inventory';
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
  Timestamp,
  increment,
  writeBatch
} from 'firebase/firestore';

interface InventoryState {
  products: Product[];
  equipment: Equipment[];
  consumables: Consumable[];
  projectUsages: ProjectUsage[];
  
  isLoading: boolean;
  
  // Actions
  fetchInventory: () => Promise<void>;
  addProduct: (item: Omit<Product, 'id' | 'totalAllocated'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Project Assignment Actions
  assignToProject: (productId: string, projectId: string, projectName: string, quantity: number, user: string, itemType?: 'product' | 'equipment' | 'consumable') => Promise<void>;
  returnFromProject: (usageId: string, quantity: number) => Promise<void>;
  
  // Getters
  getProductUsages: (productId: string) => ProjectUsage[];
  getProjectInventory: (projectId: string) => ProjectUsage[];
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  equipment: [],
  consumables: [],
  projectUsages: [],
  isLoading: false,

  fetchInventory: async () => {
    set({ isLoading: true });
    try {
        const [productsSnap, equipmentSnap, consumablesSnap, usagesSnap] = await Promise.all([
            getDocs(collection(db, 'products')),
            getDocs(collection(db, 'equipment')),
            getDocs(collection(db, 'consumables')),
            getDocs(collection(db, 'project_usages'))
        ]);

        const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const equipment = equipmentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment));
        const consumables = consumablesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consumable));
        const projectUsages = usagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectUsage));

        set({ products, equipment, consumables, projectUsages });
    } catch (error) {
        console.error("Error fetching inventory:", error);
    } finally {
        set({ isLoading: false });
    }
  },

  addProduct: async (item) => {
    set({ isLoading: true });
    try {
        const docRef = await addDoc(collection(db, 'products'), {
            ...item,
            totalAllocated: 0,
            stock: Number(item.stock), // Ensure number
            price: Number(item.price) // Ensure number
        });
        
        const newItem = { id: docRef.id, ...item, totalAllocated: 0 } as Product;

        // Log Activity
        const { useActivityStore } = await import('./activity-store');
        useActivityStore.getState().addActivity({
          type: 'INVENTORY_ADDED',
          title: 'Inventory Item Added',
          description: `${item.name} added to stock.`,
          metadata: { productId: docRef.id }
        });

        set(state => ({ products: [...state.products, newItem] }));
    } catch (error) {
        console.error("Error adding product:", error);
    } finally {
        set({ isLoading: false });
    }
  },

  updateProduct: async (id, updates) => {
    try {
        const productRef = doc(db, 'products', id);
        await updateDoc(productRef, updates);
        
        set(state => ({
            products: state.products.map(p => (p.id === id ? { ...p, ...updates } : p))
        }));

        // Log Activity
        const { useActivityStore } = await import('./activity-store');
        useActivityStore.getState().addActivity({
          type: 'INVENTORY_UPDATED',
          title: 'Inventory Item Updated',
          description: `Item ${id} updated.`,
          metadata: { productId: id, updates }
        });
    } catch (error) {
        console.error("Error updating product:", error);
    }
  },

  deleteProduct: async (id) => {
    try {
        await deleteDoc(doc(db, 'products', id));
        set(state => ({
            products: state.products.filter(p => p.id !== id)
        }));
    } catch (error) {
        console.error("Error deleting product:", error);
    }
  },

  assignToProject: async (productId, projectId, projectName, quantity, user, itemType = 'product') => {
    try {
        const batch = writeBatch(db);
        
        // Determine collection name
        let collectionName = 'products';
        if (itemType === 'equipment') collectionName = 'equipment';
        if (itemType === 'consumable') collectionName = 'consumables';

        // Reference to the source item
        const itemRef = doc(db, collectionName, productId);
        
        // 1. Create Usage Record
        const usageRef = doc(collection(db, 'project_usages'));
        const newUsage: ProjectUsage = {
            id: usageRef.id,
            productId,
            productName: '', // Will be filled from local state for UI immediately, but let's try to get it right
            projectId,
            projectName,
            quantity,
            assignedDate: new Date().toISOString(),
            assignedBy: user,
            status: 'Active',
        };

        // Find item in local state to get name (optimistic)
        let localItem: any;
         if (itemType === 'equipment') localItem = get().equipment.find(p => p.id === productId);
         else if (itemType === 'consumable') localItem = get().consumables.find(p => p.id === productId);
         else localItem = get().products.find(p => p.id === productId);
        
        if (localItem) {
            newUsage.productName = localItem.name;
            if (localItem.stock < quantity) throw new Error("Yetersiz stok");
        }

        // Add usage to batch
        batch.set(usageRef, { ...newUsage, itemType });

        // Decrement stock in batch
        batch.update(itemRef, {
            stock: increment(-quantity),
            totalAllocated: increment(quantity)
        });

        // Commit batch
        await batch.commit();

        // Update Local State
        set(state => {
            const newState: Partial<InventoryState> = {
                projectUsages: [...state.projectUsages, newUsage]
            };

            if (itemType === 'product') {
                newState.products = state.products.map(p => p.id === productId ? { ...p, stock: p.stock - quantity, totalAllocated: (p.totalAllocated || 0) + quantity } : p);
            } else if (itemType === 'equipment') {
                newState.equipment = state.equipment.map(e => e.id === productId ? { ...e, stock: e.stock - quantity, totalAllocated: (e.totalAllocated || 0) + quantity } : e);
            } else if (itemType === 'consumable') {
                newState.consumables = state.consumables.map(c => c.id === productId ? { ...c, stock: c.stock - quantity, totalAllocated: (c.totalAllocated || 0) + quantity } : c);
            }

            return newState as InventoryState;
        });

    } catch (error) {
        console.error("Error assigning to project:", error);
        throw error;
    }
  },

  returnFromProject: async (usageId, quantity) => {
      try {
        const usage = get().projectUsages.find(u => u.id === usageId);
        if (!usage) return;

        const batch = writeBatch(db);

        // 1. Update Usage Status
        const usageRef = doc(db, 'project_usages', usageId);
        batch.update(usageRef, {
            status: 'Returned',
            notes: 'Returned to stock'
        });

        // 2. Restore Stock
        const productRef = doc(db, 'products', usage.productId);
        batch.update(productRef, {
            stock: increment(quantity),
            totalAllocated: increment(-quantity)
        });

        await batch.commit();

        // Update Local State directly
        set(state => ({
            projectUsages: state.projectUsages.map(u => 
                u.id === usageId ? { ...u, status: 'Returned' } : u
            ),
            products: state.products.map(p => {
                if (p.id === usage.productId) {
                     return {
                        ...p,
                        stock: p.stock + quantity,
                        totalAllocated: Math.max(0, (p.totalAllocated || 0) - quantity)
                    };
                }
                return p;
            })
        }));

      } catch (error) {
          console.error("Error returning item:", error);
      }
  },

  getProductUsages: (productId) => {
      return get().projectUsages.filter(u => u.productId === productId && u.status === 'Active');
  },

  getProjectInventory: (projectId) => {
      return get().projectUsages.filter(u => u.projectId === projectId && u.status === 'Active');
  }
}));
