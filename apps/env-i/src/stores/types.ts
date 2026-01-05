import { StateCreator } from 'zustand';
import { Product, Equipment, Consumable, Order, Proposal, AuditLog, Warehouse, Settings } from "@/lib/types";

export interface ProductSlice {
    products: Product[];
    equipment: Equipment[];
    consumables: Consumable[];
    loadingProducts: boolean;
    loadingEquipment: boolean;
    loadingConsumables: boolean;
    hasMoreProducts: boolean;
    hasMoreEquipment: boolean;
    hasMoreConsumables: boolean;
    lastProduct: any;
    lastEquipment: any;
    lastConsumable: any;
    
    fetchProducts: (initial?: boolean) => Promise<void>;
    loadMoreProducts: () => void;
    addProduct: (productData: Omit<Product, 'id' | 'history'>) => Promise<void>; 
    updateProduct: (productId: string, productData: Partial<Product>) => Promise<void>;
    deleteProduct: (productId: string, productName: string) => Promise<void>;
    
    fetchEquipment: (initial?: boolean) => Promise<void>;
    loadMoreEquipment: () => void;
    addEquipment: (equipmentData: Omit<Equipment, 'id'>) => Promise<void>;
    updateEquipment: (equipmentId: string, equipmentData: Partial<Equipment>) => Promise<void>;
    deleteEquipment: (equipmentId: string, equipmentName: string) => Promise<void>;
    
    fetchConsumables: (initial?: boolean) => Promise<void>;
    loadMoreConsumables: () => void;
    addConsumable: (consumableData: Omit<Consumable, 'id'>) => Promise<void>;
    updateConsumable: (consumableId: string, consumableData: Partial<Consumable>) => Promise<void>;
    deleteConsumable: (consumableId: string, consumableName: string) => Promise<void>;

    // Search
    allProductsLoaded: boolean;
    searchResults: (Product | Equipment | Consumable)[];
    isSearching: boolean;
    fetchAllProductsForSearch: () => Promise<void>;
    searchProducts: (searchTerm: string, category?: string) => Promise<void>;
    clearSearch: () => void;
    syncProducts: (products: Product[]) => void;
    autoCategorizeAllProducts: () => Promise<void>;

    // Others
     finishPhysicalCount: (countedProducts: (Product & { countedStock?: number; initialStock: number })[]) => Promise<void>;
     syncPricesFromCatalog: (catalogItems: { model: string; price: number | null; currency: string }[]) => Promise<{ synced: number; notFound: number }>;
}

export interface OrderSlice {
    orders: Order[];
    proposals: Proposal[];
    loadingOrders: boolean;
    loadingProposals: boolean;
    hasMoreOrders: boolean;
    hasMoreProposals: boolean;
    lastOrder: any;
    lastProposal: any;

    syncOrders: (orders: Order[]) => void;

    fetchOrders: (initial?: boolean) => Promise<void>;
    loadMoreOrders: () => void;
    addOrder: (orderData: Omit<Order, 'id'>) => Promise<void>;
    
    fetchProposals: (initial?: boolean) => Promise<void>;
    loadMoreProposals: () => void;
    addProposal: (proposalData: Omit<Proposal, 'id' | 'pdfUrl'>, pdfFile: File) => Promise<void>;
}

export interface CommonSlice {
    logs: AuditLog[];
    loadingLogs: boolean;
    hasMoreLogs: boolean;
    lastLog: any;
    fetchLogs: (initial?: boolean) => Promise<void>;
    loadMoreLogs: () => void;

    settings: Settings | null;
    loadingSettings: boolean;
    fetchSettings: () => Promise<void>;
    updateSettings: (settings: Partial<Settings>) => Promise<void>;

    warehouses: Warehouse[];
    loadingWarehouses: boolean;
    fetchWarehouses: () => Promise<void>;
    addWarehouse: (warehouseData: Omit<Warehouse, 'id'>) => Promise<void>;
    updateWarehouse: (warehouseId: string, warehouseData: Partial<Warehouse>) => Promise<void>;
    deleteWarehouse: (warehouseId: string) => Promise<void>;
    migrateToDefaultWarehouse: () => Promise<void>;

    isSeeding: boolean;
    seedDatabase: () => Promise<void>;
}

export type DataStoreState = ProductSlice & OrderSlice & CommonSlice & {
    fetchAllData: () => void;
};

export type StoreSlice<T> = StateCreator<DataStoreState, [], [], T>;
