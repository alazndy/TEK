
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
        // Validation check
        apiClient.get('/users/profile').then(res => {
            setUser(res.data);
        }).catch(() => {
            logout();
        }).finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    const res = await apiClient.post('/auth/login', credentials);
    const { access_token, user } = res.data;
    localStorage.setItem('access_token', access_token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
