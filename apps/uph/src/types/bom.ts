// BOM (Bill of Materials) Types for UPH

export interface BOMItem {
  id: string;
  projectId: string;
  parentId?: string; // For tree structure, null = top level
  level: number; // 0 = top level, increments for children
  
  // Product info
  productId?: string; // ENV-I product reference
  productName: string;
  partNumber?: string;
  description?: string;
  
  // Quantity
  quantity: number;
  unit: string; // adet, metre, kg, vb.
  
  // Cost
  unitCost?: number;
  currency?: string;
  totalCost?: number;
  
  // Sourcing
  source: 'make' | 'buy' | 'stock';
  supplier?: string;
  leadTimeDays?: number;
  
  // Status
  status: 'draft' | 'approved' | 'ordered' | 'received' | 'installed';
  
  // Weave reference
  weaveComponentId?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  revision?: string;
  notes?: string;
  order: number;
}

export interface BOMNode extends BOMItem {
  children: BOMNode[];
  expanded?: boolean;
}

export interface BOMSummary {
  totalItems: number;
  totalCost: number;
  makeCount: number;
  buyCount: number;
  stockCount: number;
  pendingCount: number;
  completedCount: number;
}

export interface BOMImportResult {
  success: boolean;
  itemsImported: number;
  errors: string[];
}

// Status colors
export const BOM_STATUS_COLORS: Record<string, string> = {
  'draft': '#64748b',
  'approved': '#3b82f6',
  'ordered': '#f59e0b',
  'received': '#22c55e',
  'installed': '#10b981',
};

// Source colors
export const BOM_SOURCE_COLORS: Record<string, string> = {
  'make': '#8b5cf6',
  'buy': '#3b82f6',
  'stock': '#22c55e',
};
