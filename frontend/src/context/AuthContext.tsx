'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'CUSTOMER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone?: string; address?: string }) => Promise<void>;
  googleLogin: (email: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name: string; phone: string; address: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check JWT on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') return;

      const storedToken = localStorage.getItem('kids_shop_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          // Fetch fresh user data from /me
          const userData = await api.get('/auth/me');
          setUser(userData);
        } catch (error) {
          console.error('Session validation failed:', error);
          // Token is invalid/expired
          localStorage.removeItem('kids_shop_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('kids_shop_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      throw err;
    }
  };

  const register = async (data: { email: string; password: string; name: string; phone?: string; address?: string }) => {
    try {
      const res = await api.post('/auth/register', data);
      localStorage.setItem('kids_shop_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      throw err;
    }
  };

  const googleLogin = async (email: string, name: string) => {
    try {
      const res = await api.post('/auth/google-login', { email, name });
      localStorage.setItem('kids_shop_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('kids_shop_token');
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const updateProfile = async (data: { name: string; phone: string; address: string }) => {
    try {
      const updatedUser = await api.put('/auth/profile', data);
      setUser(updatedUser);
    } catch (err: any) {
      throw err;
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        googleLogin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
