'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/services/apiService';
import type { User } from '@/types'; // We need to add User to our types

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const router = useRouter();

  // This effect runs once on app load to check for an existing session
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      apiClient.get('/users/me')
        .then(response => setUser(response.data))
        .catch((error) => {
          console.error('Token validation failed:', error);
          // Token is invalid, log out
          localStorage.removeItem('authToken');
          setToken(null);
          delete apiClient.defaults.headers.common['Authorization'];
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false); // No token, stop loading
    }
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    // After login, fetch user data
    setIsLoading(true);
    apiClient.get('/users/me')
      .then(response => {
        setUser(response.data);
        console.log('User data fetched successfully:', response.data);
      })
      .catch(error => {
        console.error('Failed to fetch user data:', error);
        // Don't logout here, just log the error
      })
      .finally(() => setIsLoading(false));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    delete apiClient.defaults.headers.common['Authorization'];
    router.push('/login'); // Redirect to login page after logout
  };

  const value = {
    isAuthenticated: !!token,
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};