export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'urgent';
export type NotificationActionType = 'task_assigned' | 'comment_added' | 'project_invite' | 'system_alert';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  actionType: NotificationActionType;
  entityId?: string; // ID of the related task, project, etc.
  link?: string; // URL to redirect
  read: boolean;
  createdAt: string; // ISO string for Firestore compatibility
}
