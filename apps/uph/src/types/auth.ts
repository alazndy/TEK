export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: import('./security').UserRole;
  department?: string;
  settings?: UserSettings;
}
