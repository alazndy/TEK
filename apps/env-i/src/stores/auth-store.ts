import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';
import { User, LoginCredentials } from '@t-ecosystem/core-types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<(() => void)>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post('/auth/login', credentials);
          const { access_token, user } = response.data;
          
          localStorage.setItem('access_token', access_token);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, isAuthenticated: false });
      },

      initializeAuth: async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const response = await apiClient.get('/users/profile');
            set({ user: response.data, isAuthenticated: true });
          } catch (error) {
            localStorage.removeItem('access_token');
            set({ user: null, isAuthenticated: false });
          }
        }
        set({ isLoading: false });
        return () => {}; // Cleanup function
      },
    }),
    {
      name: 'env-i-auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
