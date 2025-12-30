export type ActivityType = 
  | 'PROJECT_CREATED' 
  | 'PROJECT_UPDATED' 
  | 'PROJECT_DELETED'
  | 'INVENTORY_ADDED'
  | 'INVENTORY_UPDATED'
  | 'INVENTORY_DELETED'
  | 'DESIGN_UPLOADED'
  | 'STOCK_ADJUSTMENT'
  | 'ENGINEERING_CHANGE'
  | 'SYSTEM';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date; // Firestore Timestamp converted to Date
  userId: string;
  userName: string;
  metadata?: Record<string, any>; // Flexible payload (e.g., related projectId, itemId)
}
