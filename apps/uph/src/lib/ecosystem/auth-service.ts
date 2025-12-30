// Merkezi Auth Service - Ekosistem Paylaşımlı Servis
// Bu dosya tüm uygulamalar tarafından kullanılabilir

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';
export type Permission = 
  // Projects
  | 'projects:read' | 'projects:write' | 'projects:delete'
  // Inventory
  | 'inventory:read' | 'inventory:write' | 'inventory:delete'
  // Time Tracking
  | 'time:read' | 'time:write' | 'time:delete' | 'time:approve'
  // Invoices
  | 'invoices:read' | 'invoices:write' | 'invoices:delete' | 'invoices:send'
  // Templates
  | 'templates:read' | 'templates:write' | 'templates:delete' | 'templates:share'
  // Settings
  | 'settings:read' | 'settings:write'
  // Users/Teams
  | 'users:read' | 'users:write' | 'users:delete' | 'users:invite'
  // Weave specific
  | 'weave:read' | 'weave:write' | 'weave:export' | 'weave:share'
  // Admin
  | 'admin:all';

export interface UserWithRoles {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  role: UserRole;
  permissions: Permission[];
  organizationId?: string;
  teamIds?: string[];
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface RBACConfig {
  rolePermissions: Record<UserRole, Permission[]>;
  customPermissions?: Permission[];
}

// Default role-permission mapping
const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: ['admin:all'],
  manager: [
    'projects:read', 'projects:write', 'projects:delete',
    'inventory:read', 'inventory:write',
    'time:read', 'time:write', 'time:approve',
    'invoices:read', 'invoices:write', 'invoices:send',
    'templates:read', 'templates:write', 'templates:share',
    'settings:read', 'settings:write',
    'users:read', 'users:write', 'users:invite',
    'weave:read', 'weave:write', 'weave:export', 'weave:share',
  ],
  user: [
    'projects:read', 'projects:write',
    'inventory:read',
    'time:read', 'time:write',
    'invoices:read',
    'templates:read',
    'settings:read',
    'users:read',
    'weave:read', 'weave:write',
  ],
  viewer: [
    'projects:read',
    'inventory:read',
    'time:read',
    'invoices:read',
    'templates:read',
    'users:read',
    'weave:read',
  ],
};

// Storage key
const AUTH_CONFIG_KEY = 'ecosystem_auth_config';
const CURRENT_USER_KEY = 'ecosystem_current_user';

// Get RBAC config
export function getRBACConfig(): RBACConfig {
  try {
    const stored = localStorage.getItem(AUTH_CONFIG_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  
  return { rolePermissions: DEFAULT_ROLE_PERMISSIONS };
}

// Update RBAC config
export function updateRBACConfig(config: Partial<RBACConfig>): RBACConfig {
  const current = getRBACConfig();
  const updated = {
    ...current,
    ...config,
    rolePermissions: {
      ...current.rolePermissions,
      ...config.rolePermissions,
    },
  };
  localStorage.setItem(AUTH_CONFIG_KEY, JSON.stringify(updated));
  return updated;
}

// Get permissions for a role
export function getPermissionsForRole(role: UserRole): Permission[] {
  const config = getRBACConfig();
  return config.rolePermissions[role] || [];
}

// Check if user has permission
export function hasPermission(user: UserWithRoles, permission: Permission): boolean {
  // Admin has all permissions
  if (user.role === 'admin' || user.permissions.includes('admin:all')) {
    return true;
  }
  
  // Check direct user permissions
  if (user.permissions.includes(permission)) {
    return true;
  }
  
  // Check role permissions
  const rolePermissions = getPermissionsForRole(user.role);
  return rolePermissions.includes(permission);
}

// Check multiple permissions (all required)
export function hasAllPermissions(user: UserWithRoles, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(user, p));
}

// Check multiple permissions (any required)
export function hasAnyPermission(user: UserWithRoles, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(user, p));
}

// Get current user from storage
export function getCurrentUser(): UserWithRoles | null {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Set current user
export function setCurrentUser(user: UserWithRoles | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Permission middleware for API routes (Next.js)
export function createPermissionMiddleware(requiredPermissions: Permission[]) {
  return async (req: any, res: any, next: () => void) => {
    const user = getCurrentUser();
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ error: 'User account is disabled' });
    }
    
    if (!hasAllPermissions(user, requiredPermissions)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        required: requiredPermissions,
        missing: requiredPermissions.filter(p => !hasPermission(user, p)),
      });
    }
    
    next();
  };
}

// Higher-order function for protecting actions
export function withPermission<T extends (...args: any[]) => any>(
  permission: Permission,
  action: T
): (...args: Parameters<T>) => ReturnType<T> | { error: string } {
  return (...args: Parameters<T>) => {
    const user = getCurrentUser();
    
    if (!user) {
      return { error: 'Unauthorized' };
    }
    
    if (!hasPermission(user, permission)) {
      return { error: `Missing permission: ${permission}` };
    }
    
    return action(...args);
  };
}

// Role hierarchy (higher role can do everything lower roles can)
const ROLE_HIERARCHY: UserRole[] = ['viewer', 'user', 'manager', 'admin'];

export function isRoleAtLeast(userRole: UserRole, requiredRole: UserRole): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return userIndex >= requiredIndex;
}

// Get role display name
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    admin: 'Yönetici',
    manager: 'Müdür',
    user: 'Kullanıcı',
    viewer: 'Görüntüleyici',
  };
  return names[role] || role;
}

// Get permission category
export function getPermissionCategory(permission: Permission): string {
  const [category] = permission.split(':');
  const names: Record<string, string> = {
    projects: 'Projeler',
    inventory: 'Envanter',
    time: 'Zaman Takibi',
    invoices: 'Faturalar',
    templates: 'Şablonlar',
    settings: 'Ayarlar',
    users: 'Kullanıcılar',
    weave: 'Weave',
    admin: 'Yönetim',
  };
  return names[category] || category;
}

// Get all permission categories
export function getAllPermissionCategories(): string[] {
  return [
    'projects', 'inventory', 'time', 'invoices', 
    'templates', 'settings', 'users', 'weave', 'admin'
  ];
}

// Get permissions by category
export function getPermissionsByCategory(category: string): Permission[] {
  const allPermissions: Permission[] = [
    'projects:read', 'projects:write', 'projects:delete',
    'inventory:read', 'inventory:write', 'inventory:delete',
    'time:read', 'time:write', 'time:delete', 'time:approve',
    'invoices:read', 'invoices:write', 'invoices:delete', 'invoices:send',
    'templates:read', 'templates:write', 'templates:delete', 'templates:share',
    'settings:read', 'settings:write',
    'users:read', 'users:write', 'users:delete', 'users:invite',
    'weave:read', 'weave:write', 'weave:export', 'weave:share',
    'admin:all',
  ];
  
  return allPermissions.filter(p => p.startsWith(`${category}:`));
}

// SSO configuration placeholder
export interface SSOConfig {
  enabled: boolean;
  provider: 'google' | 'microsoft' | 'okta' | 'auth0';
  clientId: string;
  domain?: string;
  allowedDomains?: string[];
}

export function getSSOConfig(): SSOConfig | null {
  try {
    const stored = localStorage.getItem('ecosystem_sso_config');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function updateSSOConfig(config: SSOConfig): void {
  localStorage.setItem('ecosystem_sso_config', JSON.stringify(config));
}

// Audit log for permission changes
export interface PermissionAuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: 'grant' | 'revoke' | 'role_change';
  targetUserId: string;
  details: {
    permission?: Permission;
    oldRole?: UserRole;
    newRole?: UserRole;
  };
}

const AUDIT_LOG_KEY = 'ecosystem_permission_audit';

export function logPermissionChange(log: Omit<PermissionAuditLog, 'id' | 'timestamp'>): void {
  try {
    const stored = localStorage.getItem(AUDIT_LOG_KEY);
    const logs: PermissionAuditLog[] = stored ? JSON.parse(stored) : [];
    
    logs.unshift({
      ...log,
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
    });
    
    // Keep last 500 entries
    if (logs.length > 500) logs.splice(500);
    
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
  } catch {}
}

export function getPermissionAuditLogs(limit: number = 100): PermissionAuditLog[] {
  try {
    const stored = localStorage.getItem(AUDIT_LOG_KEY);
    const logs: PermissionAuditLog[] = stored ? JSON.parse(stored) : [];
    return logs.slice(0, limit);
  } catch {
    return [];
  }
}
