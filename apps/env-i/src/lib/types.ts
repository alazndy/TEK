
import type { Timestamp } from "firebase/firestore";

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
  zones?: WarehouseZone[];      // Layout zones for floor plan
  floorPlanWidth?: number;      // Reference dimensions in meters
  floorPlanHeight?: number;
};

// Zone in warehouse floor plan
export type WarehouseZone = {
  id: string;
  name: string;               // e.g., "A Bölgesi", "Raf 1"
  x: number;                  // Position on floor plan (0-100%)
  y: number;
  width: number;              // Size on floor plan (0-100%)
  height: number;
  color?: string;             // Zone highlight color
  shelves: ShelfConfig[];     // Shelves in this zone
};

// Shelf configuration
export type ShelfConfig = {
  id: string;
  name: string;               // e.g., "Raf A1"
  rows: number;               // Number of rows (up to 10)
  columns: number;            // Number of columns (horizontal positions)
};

export type Settings = {
  id?: string;
  companyName: string;
  logoUrl?: string;
  currency: string;
  googleDriveIntegration?: boolean;
  slackIntegration?: boolean;
  slackWebhookUrl?: string;
  uphIntegration?: boolean;
  weaveIntegration?: boolean;
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

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  status: "Beklemede" | "Kargolandı" | "Teslim Edildi" | "İptal Edildi";
  total: number;
  itemCount: number;
  items: { productId: string; quantity: number, price: number }[];
  invoiceUrl?: string;
  trackingNumber?: string;
};

export type ProposalItem = {
    productId: string;
    quantity: number;
    price: number;
};

export type Proposal = {
  id: string;
  proposalNumber: string;
  customerName: string;
  date: string;
  status: "Taslak" | "Gönderildi" | "Kabul Edildi" | "Reddedildi";
  total: number;
  items: ProposalItem[];
  pdfUrl: string;
};

export type AuditLogAction = 
  | "Ürün Eklendi" 
  | "Ürün Güncellendi" 
  | "Ürün Silindi" 
  | "Sipariş Durumu Değişti" 
  | "Stok Sayımı Yapıldı" 
  | "Sipariş Oluşturuldu" 
  | "Teklif Oluşturuldu"
  | "Ekipman Eklendi"
  | "Ekipman Güncellendi"
  | "Ekipman Silindi"
  | "Sarf Malzeme Eklendi"
  | "Sarf Malzeme Güncellendi"
  | "Sarf Malzeme Silindi"
  | "Fiyat Senkronizasyonu";

export type AuditLog = {
    id: string;
    timestamp: Timestamp | Date; // Firestore timestamp on write, Date on read
    date: string; // This will be the formatted string for display
    user: string;
    action: AuditLogAction;
    details: string;
};

export type SalesData = {
  month: string;
  sales: number;
};

export type TopProductData = {
  name: string;
  sales: number;
};



export type UserRole = 'admin' | 'manager' | 'viewer';

export type TeamMember = {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'active' | 'pending';
};

export type WidgetType = 
  | 'stat-inventory-value'
  | 'stat-product-types'
  | 'stat-low-stock'
  | 'stat-pending-orders'
  | 'stat-total-proposals'
  | 'stat-warehouse-count'
  | 'chart-sales-trend'
  | 'chart-category-dist'
  | 'chart-order-status'
  | 'list-recent-activities'
  | 'list-low-stock'
  | 'list-recent-orders';

export type WidgetCategory = 'general' | 'inventory' | 'commercial' | 'analysis';

export type Widget = {
  id: string;
  type: WidgetType;
  title: string;
  visible: boolean;
  order: number;
  category: WidgetCategory;
  config?: any;
};

export type DashboardConfig = {
  widgets: Widget[];
};

// ============================================
// SUPPLIER MANAGEMENT TYPES
// ============================================

export type Supplier = {
  id: string;
  name: string;
  code: string; // Unique supplier code (e.g., "SUP-001")
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  taxId?: string;
  paymentTerms?: string; // e.g., "Net 30", "Net 60"
  currency?: 'TRY' | 'EUR' | 'GBP' | 'USD';
  rating?: number; // 1-5 stars
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductSupplier = {
  id: string;
  productId: string;
  supplierId: string;
  supplierSku?: string; // Supplier's own SKU for this product
  unitCost: number;
  currency: 'TRY' | 'EUR' | 'GBP' | 'USD';
  leadTimeDays?: number; // Days to deliver
  moq?: number; // Minimum Order Quantity
  isPreferred: boolean; // Primary supplier for this product
  lastPurchaseDate?: Date;
  notes?: string;
};

// ============================================
// PURCHASE ORDER TYPES
// ============================================

export type POStatus = 
  | 'draft' 
  | 'sent' 
  | 'confirmed' 
  | 'partially_received' 
  | 'received' 
  | 'cancelled';

export type PurchaseOrder = {
  id: string;
  poNumber: string; // Auto-generated PO number (e.g., "PO-2025-001")
  supplierId: string;
  supplierName?: string; // Denormalized for quick display
  warehouseId: string;
  warehouseName?: string;
  status: POStatus;
  items: POItem[];
  subtotal: number;
  taxRate: number; // Percentage (e.g., 18 for 18%)
  taxAmount: number;
  shippingCost: number;
  total: number;
  currency: 'TRY' | 'EUR' | 'GBP' | 'USD';
  expectedDate?: Date;
  receivedDate?: Date;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type POItem = {
  id: string;
  productId: string;
  productName: string; // Denormalized
  sku?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity: number;
  lotId?: string; // Link to created lot when received
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

// ============================================
// REPORT TYPES
// ============================================

export type ReportType = 
  | 'stock_movement' 
  | 'stock_valuation' 
  | 'category_analysis'
  | 'supplier_performance'
  | 'expiry_report'
  | 'purchase_summary';

export type ReportDateRange = {
  startDate: Date;
  endDate: Date;
};

export type StockMovementReport = {
  productId: string;
  productName: string;
  movements: StockMovement[];
  openingStock: number;
  closingStock: number;
  totalIn: number;
  totalOut: number;
};

export type StockValuationReport = {
  warehouseId?: string;
  warehouseName?: string;
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  currency: string;
  byCategory: {
    category: string;
    itemCount: number;
    quantity: number;
    value: number;
  }[];
};

// ============================================
// AUDIT LOG EXTENSIONS
// ============================================

export type AuditLogActionExtended = AuditLogAction
  | "Tedarikçi Eklendi"
  | "Tedarikçi Güncellendi"
  | "Tedarikçi Silindi"
  | "Satın Alma Siparişi Oluşturuldu"
  | "Satın Alma Siparişi Güncellendi"
  | "Satın Alma Teslim Alındı"
  | "Lot Oluşturuldu"
  | "Lot Güncellendi"
  | "Transfer Oluşturuldu"
  | "Transfer Tamamlandı"
  | "Stok Uyarısı";
