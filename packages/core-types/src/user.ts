// User Types - Shared authentication types

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: UserRole;
  tenantId?: string;
}

export type UserRole = 'admin' | 'manager' | 'editor' | 'member' | 'viewer';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
