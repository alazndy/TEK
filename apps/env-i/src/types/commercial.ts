
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
