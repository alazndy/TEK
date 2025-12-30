import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../../lib/api-client';
import { User, LoginCredentials } from '@t-ecosystem/core-types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await apiClient.get('/users/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    const { access_token, user } = response.data;
    localStorage.setItem('access_token', access_token);
    setUser(user);
  };

  const loginWithGoogle = async () => {
      // Mock Google Login for prototype
      // Real implementation would redirect to OAuth endpoint or pop up a Google Sign-In window
      // For now, we simulate a successful login with a mock user.
      const mockGoogleUser: User = {
          id: 'google-user-123',
          email: 'demo@google.com',
          name: 'Google Demo User',
          role: 'user', // Assuming 'user' role exists
          avatar: 'https://lh3.googleusercontent.com/a/ACg8ocIq8d...=s96-c' // Generic google avatar placeholder
      };
      
      const mockToken = 'mock-google-access-token';
      localStorage.setItem('access_token', mockToken);
      setUser(mockGoogleUser);
      
      // In real scenario:
      // window.location.href = 'http://localhost:3001/api/auth/google';
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading: loading,
      login,
      loginWithGoogle,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
