
// It seems I need to define local types or import from proper places.
// StockMovement was defined in the monolithic file. It is Inventory related.

// ============================================
// INVENTORY TYPES
// ============================================

export type StockMovement = {
  id: string;
  date: string;
  type: "Giriş" | "Satış" | "Sayım Düzeltme" | "İade";
  quantityChange: number;
  newStock: number;
  notes?: string;
};

export type Warehouse = {
  id: string;
  name: string;
  type: 'Depo' | 'Mağaza' | 'Araç' | 'Diğer';
  address?: string;
  isDefault?: boolean;
  zones?: WarehouseZone[];
  floorPlanWidth?: number;
  floorPlanHeight?: number;
};

// Item stored in a compartment
export type StorageItemType = 'box' | 'bag' | 'package' | 'empty';

export type StorageItem = {
  id: string;
  type: StorageItemType;
  label?: string;
  productId?: string;
  quantity?: number;
};

// Single compartment in a shelf
export type Compartment = {
  id: string;
  row: number;      // Which shelf level (0-indexed from bottom)
  column: number;   // Which section (0-indexed from left)
  item?: StorageItem;
};

// Storage unit (rack/shelving system)
export type StorageUnit = {
  id: string;
  name: string;           // e.g., "Ünite A1"
  rows: number;           // Vertical shelf count (1-10)
  columns: number;        // Horizontal compartment count (1-8)
  compartments: Compartment[];
};

// Zone in warehouse floor plan
export type WarehouseZone = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  storageUnits: StorageUnit[];  // Storage units in this zone
};

// Legacy type for backward compatibility (deprecated)
export type ShelfConfig = {
  id: string;
  name: string;
  rows: number;
  columns: number;
};

// Base type for all inventory items
export type InventoryItem = {
  id: string;
  name:string;
  description?: string;
  manufacturer: string;
  stock: number; // Total stock across all locations
  stockByLocation?: { [warehouseId: string]: number }; // Detailed stock breakdown
  price?: number;
  priceCurrency?: 'TRY' | 'EUR' | 'GBP' | 'USD'; // Source currency of the price
  room: string;
  shelf: string;
  barcode: string;
  guideUrl?: string;
  brochureUrl?: string;
  modelNumber?: string;
  partNumber?: string;
  productCategory?: string;
  isFaulty?: boolean;
  unit?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type Product = InventoryItem & {
  category: "Stok Malzemesi" | "Sarf Malzeme";
  minStock?: number;
  isDiscontinued?: boolean;
  history?: StockMovement[];
  // Weave Integration Fields
  imageUrl?: string;          // Product image URL for Weave templates
  images?: string[];          // Multiple gallery images
  externalId?: string;        // Unique ID shared across ecosystem (ENV-I, Weave, UPH)
  weaveTemplateId?: string;   // Reference to configured Weave template (if exists)
  weaveConfigured?: boolean;  // Whether ports are configured in Weave
  weaveFileUrl?: string;      // Link to the .weave or .tsproj library file
};

export type Equipment = InventoryItem & {
  category: "Demirbaş";
  purchaseDate?: string;
  warrantyEndDate?: string;
};

export type Consumable = InventoryItem & {
    category: "Sarf Malzeme";
    minStock?: number;
}

export type CatalogItem = {
    id: string; // SKU or generated
    manufacturer: string;
    model: string;
    description: string;
    price: number | null; 
    currency: string;
    sourceFile: string; // e.g. "Brigade_2024.csv"
};

// ============================================
// LOT / BATCH TRACKING TYPES
// ============================================

export type LotStatus = 'available' | 'reserved' | 'consumed' | 'expired' | 'quarantine';

export type Lot = {
  id: string;
  lotNumber: string; // e.g., "LOT-2025-001" or supplier batch number
  productId: string;
  productName?: string;
  warehouseId: string;
  zoneId?: string;
  shelfId?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number; // quantity - reservedQuantity
  serialNumbers?: string[]; // For serialized items
  manufactureDate?: Date;
  expiryDate?: Date;
  receivedDate: Date;
  costPerUnit: number;
  currency: 'TRY' | 'EUR' | 'GBP' | 'USD';
  poId?: string; // Link to purchase order
  supplierId?: string;
  status: LotStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LotMovement = {
  id: string;
  lotId: string;
  type: 'receive' | 'issue' | 'transfer' | 'adjust' | 'return';
  quantity: number;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  referenceType?: 'order' | 'po' | 'transfer' | 'manual';
  referenceId?: string;
  reason?: string;
  performedBy: string;
  createdAt: Date;
};

// ============================================
// STOCK TRANSFER TYPES
// ============================================

export type TransferStatus = 'pending' | 'in_transit' | 'completed' | 'cancelled';

export type StockTransfer = {
  id: string;
  transferNumber: string; // e.g., "TRF-2025-001"
  fromWarehouseId: string;
  fromWarehouseName?: string;
  toWarehouseId: string;
  toWarehouseName?: string;
  items: TransferItem[];
  status: TransferStatus;
  notes?: string;
  requestedBy: string;
  approvedBy?: string;
  shippedAt?: Date;
  receivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type TransferItem = {
  id: string;
  productId: string;
  productName: string;
  lotId?: string;
  lotNumber?: string;
  requestedQuantity: number;
  shippedQuantity: number;
  receivedQuantity: number;
};

// ============================================
// STOCK ALERT TYPES
// ============================================

export type AlertType = 
  | 'low_stock' 
  | 'out_of_stock' 
  | 'expiring_soon' 
  | 'expired' 
  | 'overstock'
  | 'reorder_point';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type StockAlert = {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  productId: string;
  productName: string;
  warehouseId?: string;
  warehouseName?: string;
  lotId?: string;
  lotNumber?: string;
  currentValue: number; // Current stock or days until expiry
  thresholdValue: number; // Configured threshold
  message: string;
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
};

export type AlertSettings = {
  lowStockEnabled: boolean;
  lowStockThreshold: number; // Global default, can be overridden per product
  outOfStockEnabled: boolean;
  expiryAlertEnabled: boolean;
  expiryDaysThreshold: number; // Alert X days before expiry
  overstockEnabled: boolean;
  overstockMultiplier: number; // Alert when stock > (minStock * multiplier)
  notificationChannels: {
    inApp: boolean;
    email: boolean;
    slack: boolean;
  };
};
