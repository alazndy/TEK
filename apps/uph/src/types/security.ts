export type Permission = 
  | 'read:projects' | 'write:projects' | 'delete:projects'
  | 'read:inventory' | 'write:inventory'
  | 'read:engineering' | 'write:engineering' | 'approve:engineering'
  | 'read:risks' | 'write:risks'
  | 'read:audit' | 'manage:users';

export type ExtendedRole = 'owner' | 'admin' | 'manager' | 'engineer' | 'auditor' | 'viewer';
export type UserRole = ExtendedRole;

export interface RoleDefinition {
  name: ExtendedRole;
  permissions: Permission[];
  description: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  module: 'projects' | 'inventory' | 'engineering' | 'risk' | 'security' | 'auth';
  resourceId?: string;
  details: string;
  ipAddress?: string;
  hash: string; // SHA-256 for immutability verification
  previousHash: string; // Linked list of logs
}

export const ROLE_PERMISSIONS: Record<ExtendedRole, Permission[]> = {
  owner: [
    'read:projects', 'write:projects', 'delete:projects',
    'read:inventory', 'write:inventory',
    'read:engineering', 'write:engineering', 'approve:engineering',
    'read:risks', 'write:risks',
    'read:audit', 'manage:users'
  ],
  admin: [
    'read:projects', 'write:projects',
    'read:inventory', 'write:inventory',
    'read:engineering', 'write:engineering', 'approve:engineering',
    'read:risks', 'write:risks',
    'manage:users'
  ],
  manager: [
    'read:projects', 'write:projects',
    'read:inventory',
    'read:engineering',
    'read:risks', 'write:risks'
  ],
  engineer: [
    'read:projects',
    'read:inventory',
    'read:engineering', 'write:engineering',
    'read:risks'
  ],
  auditor: [
    'read:projects', 'read:inventory', 'read:engineering', 'read:risks', 'read:audit'
  ],
  viewer: [
    'read:projects', 'read:inventory', 'read:engineering', 'read:risks'
  ]
};
