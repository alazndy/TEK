
export type StockMovement = {
  id: string;
  date: string;
  type: "Giriş" | "Satış" | "Sayım Düzeltme" | "İade" | "Proje Kullanımı";
  quantityChange: number;
  newStock: number;
  notes?: string;
  projectId?: string; // Optional: link movement to a project
};

export type Warehouse = {
  id: string;
  name: string;
  type: 'Depo' | 'Mağaza' | 'Araç' | 'Diğer';
  address?: string;
  isDefault?: boolean;
};

// Base type for all inventory items
export type InventoryItem = {
  id: string;
  name: string;
  description?: string;
  manufacturer: string;
  stock: number; // Total available stock
  stockByLocation?: { [warehouseId: string]: number }; 
  price?: number;
  room?: string;
  shelf?: string;
  barcode?: string;
  guideUrl?: string;
  brochureUrl?: string;
  modelNumber?: string;
  partNumber?: string;
  isFaulty?: boolean;
  
  // New computed fields for project tracking
  totalAllocated?: number; // Total quantity currently assigned to active projects
};

export type Product = InventoryItem & {
  category: "Stok Malzemesi" | "Sarf Malzeme";
  minStock?: number;
  isDiscontinued?: boolean;
  history?: StockMovement[];
};

export type Equipment = InventoryItem & {
  category: "Demirbaş";
  purchaseDate?: string;
  warrantyEndDate?: string;
  assignedToUser?: string; // If equipment is assigned to a specific person
};

export type Consumable = InventoryItem & {
    category: "Sarf Malzeme";
    minStock?: number;
}

// New Type: Tracks which project is using which item
export type ProjectUsage = {
    id: string;
    projectId: string; // Relation to Project ID
    projectName: string; // Cached name for display
    productId: string; // Relation to InventoryItem ID
    productName: string; // Cached name
    quantity: number;
    assignedDate: string; // ISO String
    assignedBy: string; // User ID or Name
    status: 'Active' | 'Consumed' | 'Returned';
    notes?: string;
};
