/**
 * T-Ecosystem Shared SSO Service
 * Provides unified authentication across UPH, ENV-I, Weave, Renderci, and T-SA
 * 
 * This service can be copied to each application or published as a shared package.
 * All applications use the same Firebase project for authentication.
 */

import { 
  getAuth, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';

// Token storage keys (shared across apps via same domain or token exchange)
const SSO_TOKEN_KEY = 'teco_sso_token';
const SSO_USER_KEY = 'teco_sso_user';
const SSO_TIMESTAMP_KEY = 'teco_sso_timestamp';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// User info interface
export interface SSOUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerId: string;
  lastLoginAt?: string;
}

// SSO State
interface SSOState {
  user: SSOUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Auth methods
type AuthMethod = 'email' | 'google' | 'microsoft' | 'sso_token';

class SSOService {
  private state: SSOState = {
    user: null,
    token: null,
    loading: true,
    error: null,
  };
  private listeners: Set<(state: SSOState) => void> = new Set();
  private auth = getAuth();
  private googleProvider = new GoogleAuthProvider();
  private unsubscribeAuth: (() => void) | null = null;

  constructor() {
    // Check for existing SSO token on init
    this.initFromStorage();
    
    // Listen to Firebase auth state
    this.unsubscribeAuth = onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        await this.handleUserLogin(user);
      } else {
        // Check for SSO token before clearing
        const ssoToken = this.getSSOToken();
        if (!ssoToken) {
          this.clearState();
        }
      }
      this.state.loading = false;
      this.notifyListeners();
    });
  }

  /**
   * Initialize from localStorage SSO token
   */
  private initFromStorage(): void {
    try {
      const storedUser = localStorage.getItem(SSO_USER_KEY);
      const storedToken = localStorage.getItem(SSO_TOKEN_KEY);
      const timestamp = localStorage.getItem(SSO_TIMESTAMP_KEY);

      if (storedUser && storedToken && timestamp) {
        const tokenAge = Date.now() - parseInt(timestamp);
        if (tokenAge < TOKEN_EXPIRY_MS) {
          this.state.user = JSON.parse(storedUser);
          this.state.token = storedToken;
        } else {
          // Token expired, clear
          this.clearStorage();
        }
      }
    } catch (error) {
      console.error('SSO init from storage failed:', error);
      this.clearStorage();
    }
  }

  /**
   * Handle successful login
   */
  private async handleUserLogin(user: User): Promise<void> {
    try {
      const token = await user.getIdToken();
      
      const ssoUser: SSOUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        providerId: user.providerId,
        lastLoginAt: new Date().toISOString(),
      };

      // Update state
      this.state.user = ssoUser;
      this.state.token = token;
      this.state.error = null;

      // Persist for SSO
      this.persistToStorage(ssoUser, token);
    } catch (error) {
      console.error('SSO handleUserLogin failed:', error);
      this.state.error = 'Oturum başlatılamadı';
    }
  }

  /**
   * Persist SSO data to localStorage
   */
  private persistToStorage(user: SSOUser, token: string): void {
    try {
      localStorage.setItem(SSO_USER_KEY, JSON.stringify(user));
      localStorage.setItem(SSO_TOKEN_KEY, token);
      localStorage.setItem(SSO_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('SSO persist failed:', error);
    }
  }

  /**
   * Clear storage
   */
  private clearStorage(): void {
    localStorage.removeItem(SSO_USER_KEY);
    localStorage.removeItem(SSO_TOKEN_KEY);
    localStorage.removeItem(SSO_TIMESTAMP_KEY);
  }

  /**
   * Clear state
   */
  private clearState(): void {
    this.state.user = null;
    this.state.token = null;
    this.state.error = null;
    this.clearStorage();
  }

  /**
   * Notify listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  // === Public Methods ===

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    this.state.loading = true;
    this.state.error = null;
    this.notifyListeners();

    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      return result;
    } catch (error: any) {
      this.state.error = error.message || 'Giriş başarısız';
      this.state.loading = false;
      this.notifyListeners();
      throw error;
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<UserCredential> {
    this.state.loading = true;
    this.state.error = null;
    this.notifyListeners();

    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      return result;
    } catch (error: any) {
      this.state.error = error.message || 'Google ile giriş başarısız';
      this.state.loading = false;
      this.notifyListeners();
      throw error;
    }
  }

  /**
   * Sign in with SSO token (cross-app)
   */
  async signInWithSSOToken(token: string): Promise<boolean> {
    try {
      // Verify token with Firebase Admin SDK (would need Cloud Function)
      // For now, we trust localStorage token from same domain
      const storedToken = this.getSSOToken();
      if (storedToken === token) {
        const storedUser = localStorage.getItem(SSO_USER_KEY);
        if (storedUser) {
          this.state.user = JSON.parse(storedUser);
          this.state.token = token;
          this.state.loading = false;
          this.notifyListeners();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('SSO token login failed:', error);
      return false;
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.clearState();
      this.notifyListeners();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  /**
   * Get current SSO token
   */
  getSSOToken(): string | null {
    return this.state.token || localStorage.getItem(SSO_TOKEN_KEY);
  }

  /**
   * Get current user
   */
  getCurrentUser(): SSOUser | null {
    return this.state.user;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return !!this.state.user && !!this.state.token;
  }

  /**
   * Get current state
   */
  getState(): SSOState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: SSOState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener({ ...this.state });
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Generate cross-app SSO URL
   */
  generateSSOUrl(targetApp: 'uph' | 'envi' | 'weave' | 'renderci' | 'tsa', path = '/'): string {
    const token = this.getSSOToken();
    const baseUrls: Record<string, string> = {
      uph: 'http://localhost:3000',
      envi: 'http://localhost:3001',
      weave: 'http://localhost:5173',
      renderci: 'http://localhost:5174',
      tsa: 'http://localhost:5175',
    };
    
    const baseUrl = baseUrls[targetApp] || baseUrls.uph;
    const params = new URLSearchParams();
    if (token) params.set('sso_token', token);
    params.set('redirect', path);
    
    return `${baseUrl}/auth/sso?${params.toString()}`;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
    this.listeners.clear();
  }
}

// Export singleton
export const ssoService = new SSOService();

// React hook for SSO (optional, for React apps)
export function useSSOState() {
  const [state, setState] = React.useState(ssoService.getState());

  React.useEffect(() => {
    return ssoService.subscribe(setState);
  }, []);

  return state;
}

// Need to import React for the hook
import React from 'react';
