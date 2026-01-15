
import type { Timestamp } from "firebase/firestore";
import type { StockMovement } from './inventory';

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

export type SalesData = {
  month: string;
  sales: number;
};

export type TopProductData = {
  name: string;
  sales: number;
};

// ============================================
// AUDIT LOG TYPES
// ============================================

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

export type AuditLog = {
    id: string;
    timestamp: Timestamp | Date; // Firestore timestamp on write, Date on read
    date: string; // This will be the formatted string for display
    user: string;
    action: AuditLogAction;
    details: string;
};

// ============================================
// DEFECTIVE PRODUCTS
// ============================================

export type DefectStatus = 'new' | 'investigating' | 'resolved' | 'discarded';

// İncelenen ürün bilgisi (çoklu ürün desteği için)
export type InspectedProduct = {
  id: string;           // Unique ID for each product in the report
  productType: string;  // "Essential Monitor", "Camera", "Sensor" etc.
  brand: string;        // "Brigade", "Orlaco" etc.
  model: string;        // "VBV-670M-M"
  partNumber: string;   // "5775"
  serialNumber: string; // "2406M01257"
};

export type DefectReport = {
  id: string;
  formNumber: string;                     // Otomatik: "ATF-260106-001"
  inspectedProducts: InspectedProduct[];  // Çoklu ürün listesi
  inspectorName: string;                  // İnspektör adı
  inspectorDate: Date;                    // İnceleme tarihi
  customerName: string;
  reason: string;                         // Genel arıza başlığı
  customerStatement: string;
  inspectionResult?: string;
  status: DefectStatus;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  reportedBy: string;
  resolvedAt?: Date;
  resolvedBy?: string;
};
