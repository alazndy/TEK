
import type { Timestamp } from "firebase/firestore";

// ============================================
// COMMON & SETTINGS TYPES
// ============================================

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

export type UserRole = 'admin' | 'manager' | 'viewer';

export type TeamMember = {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'active' | 'pending';
};

// ============================================
// DASHBOARD & WIDGET TYPES
// ============================================

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
