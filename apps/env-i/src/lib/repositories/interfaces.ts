
import { Product, Equipment, Consumable, Warehouse, Order, Proposal, AuditLog, Settings } from '@/lib/types';

export interface IInventoryRepository {
    // Products
    getProducts(limitCount?: number, lastDoc?: any): Promise<{ data: Product[], lastDoc: any }>;
    getProductById(id: string): Promise<Product | null>;
    getAllProductsForSearch(): Promise<Product[]>;
    addProduct(data: Omit<Product, 'id' | 'history'>): Promise<string>;
    updateProduct(id: string, data: Partial<Product>): Promise<void>;
    deleteProduct(id: string): Promise<void>;

    // Equipment
    getEquipment(limitCount?: number, lastDoc?: any): Promise<{ data: Equipment[], lastDoc: any }>;
    addEquipment(data: Omit<Equipment, 'id'>): Promise<string>;
    updateEquipment(id: string, data: Partial<Equipment>): Promise<void>;
    deleteEquipment(id: string): Promise<void>;

    // Consumables
    getConsumables(limitCount?: number, lastDoc?: any): Promise<{ data: Consumable[], lastDoc: any }>;
    addConsumable(data: Omit<Consumable, 'id'>): Promise<string>;
    updateConsumable(id: string, data: Partial<Consumable>): Promise<void>;
    deleteConsumable(id: string): Promise<void>;

    // Warehouses
    getWarehouses(): Promise<Warehouse[]>;
    addWarehouse(data: Omit<Warehouse, 'id'>): Promise<string>;
    updateWarehouse(id: string, data: Partial<Warehouse>): Promise<void>;
    deleteWarehouse(id: string): Promise<void>;
    
    // Audit Logs
    getAuditLogs(limitCount?: number, lastDoc?: any): Promise<{ data: AuditLog[], lastDoc: any }>;
    addAuditLog(log: Omit<AuditLog, 'id'>): Promise<void>;

    // Settings
    getSettings(): Promise<Settings | null>;
    updateSettings(id: string, data: Partial<Settings>): Promise<void>;
    createSettings(data: Settings): Promise<string>;

    // Orders & Proposals
    getOrders(limitCount?: number, lastDoc?: any): Promise<{ data: Order[], lastDoc: any }>;
    addOrder(data: Omit<Order, 'id'>): Promise<string>;
    getProposals(limitCount?: number, lastDoc?: any): Promise<{ data: Proposal[], lastDoc: any }>;
    addProposal(data: Omit<Proposal, 'id'>): Promise<string>;
}
