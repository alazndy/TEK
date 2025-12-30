// API Types

export interface APIKey {
  id: string;
  userId: string;
  name: string;
  key: string; // Only shown once at creation, stored as hash
  keyPrefix: string; // First 8 chars for identification
  permissions: APIPermission[];
  rateLimit: number; // requests per minute
  expiresAt?: Date;
  lastUsedAt?: Date;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
}

export type APIPermission = 
  | 'projects:read'
  | 'projects:write'
  | 'tasks:read'
  | 'tasks:write'
  | 'time:read'
  | 'time:write'
  | 'invoices:read'
  | 'invoices:write'
  | 'inventory:read'
  | 'inventory:write'
  | 'resources:read'
  | 'reports:read';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface APIRequestLog {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  statusCode: number;
  responseTime: number; // ms
  ipAddress?: string;
  userAgent?: string;
  requestBody?: any;
  errorMessage?: string;
  createdAt: Date;
}

export interface WebhookConfig {
  id: string;
  userId: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  isActive: boolean;
  lastTriggeredAt?: Date;
  failureCount: number;
  createdAt: Date;
}

export type WebhookEvent = 
  | 'project.created'
  | 'project.updated'
  | 'project.completed'
  | 'task.created'
  | 'task.completed'
  | 'invoice.created'
  | 'invoice.paid'
  | 'time.logged';

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: any;
  statusCode?: number;
  response?: string;
  success: boolean;
  deliveredAt: Date;
  retryCount: number;
}
