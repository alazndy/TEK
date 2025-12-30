import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/types';
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true, // Initially true to check session
      error: null,

      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          // 1. Login to get token
          // Note: our mock AuthController expects "username", we map email to it
          // Also, sending a fake userId for the mock
          const loginRes = await apiClient.post('/auth/login', { 
              username: email, 
              password,
              userId: 'mock-user-id', // Mock ID required by our simplistic AuthService
              roles: ['member']
          });
          
          const { access_token } = loginRes.data;
          localStorage.setItem('access_token', access_token);

          // 2. Fetch Profile or use mock
          // In real app: const userRes = await apiClient.get('/users/profile');
          // For now, construct a user from the login info
          const user: User = {
              uid: 'mock-user-id', 
              email, 
              displayName: email.split('@')[0],
              createdAt: new Date().toISOString()
          };

          set({ user, loading: false });
        } catch (error: any) {
          console.error('Login error:', error);
          set({ error: error.response?.data?.message || 'Login failed', loading: false });
          throw error;
        }
      },

      signUp: async (email, password, displayName) => {
        set({ loading: true, error: null });
        try {
          // 1. Create User
          await apiClient.post('/users', { email, displayName });

          // 2. Auto Login (optional, or redirect to login)
          // For now calling signIn
          await get().signIn(email, password);
        } catch (error: any) {
           console.error('SignUp error:', error);
           set({ error: error.response?.data?.message || 'Signup failed', loading: false });
           throw error;
        }
      },

      signInWithGoogle: async () => {
         set({ loading: true, error: null });
         try {
             // Use Firebase Google Auth
             const provider = new GoogleAuthProvider();
             const result = await signInWithPopup(auth, provider);
             const firebaseUser = result.user;
             
             // Map Firebase User to App User
             const appUser: User = {
                 uid: firebaseUser.uid,
                 email: firebaseUser.email || '',
                 displayName: firebaseUser.displayName || 'Google User',
                 photoURL: firebaseUser.photoURL || undefined,
                 createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
             };

             const token = await firebaseUser.getIdToken();
             localStorage.setItem('access_token', token);
             set({ user: appUser, loading: false });
         } catch (error: any) {
             console.error('Google login error:', error);
             set({ error: error.message || 'Google login failed', loading: false });
         }
      },

      signInWithGithub: async () => {
         set({ loading: true, error: null });
         try {
             const provider = new GithubAuthProvider();
             const result = await signInWithPopup(auth, provider);
             const firebaseUser = result.user;

             const appUser: User = {
                 uid: firebaseUser.uid,
                 email: firebaseUser.email || '',
                 displayName: firebaseUser.displayName || 'GitHub User',
                 photoURL: firebaseUser.photoURL || undefined,
                 createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
             };

             const token = await firebaseUser.getIdToken();
             localStorage.setItem('access_token', token);
             set({ user: appUser, loading: false });
         } catch (error: any) {
             console.error('GitHub login error:', error);
             set({ error: error.message || 'GitHub login failed', loading: false });
         }
      },

      signOut: async () => {
        try {
            await firebaseSignOut(auth);
        } catch(e) { /* ignore */ }
        localStorage.removeItem('access_token');
        set({ user: null });
      },

      initAuth: async () => {
         const token = localStorage.getItem('access_token');
         if (token) {
             try {
                 // Verify token by fetching profile
                 // const res = await apiClient.get('/users/profile');
                 // set({ user: res.data, loading: false });
                 
                 // Mock restoration
                 set({ 
                     user: { 
                         uid: 'mock-user-id', 
                         email: 'restored@example.com', 
                         displayName: 'Restored User',
                         createdAt: new Date().toISOString()
                     }, 
                     loading: false 
                 });
             } catch (err) {
                 localStorage.removeItem('access_token');
                 set({ user: null, loading: false });
             }
         } else {
             set({ user: null, loading: false });
         }
      },
    }),
    {
      name: 't-market-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
