// src/context/AuthProvider.tsx

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthContext, type User } from './authContext'; // <-- Yeni dosyadan import et

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const storedToken = (await window.electronStore.get('session-token')) as string | null;
        const storedUser = (await window.electronStore.get('user-data')) as User | null;
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Oturum kontrol edilirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserSession();
  }, []);

  const login = async (userData: User, token: string) => {
    await window.electronStore.set('session-token', token);
    await window.electronStore.set('user-data', userData);
    setToken(token);
    setUser(userData);
  };

  const logout = async () => {
    await window.electronStore.delete('session-token');
    await window.electronStore.delete('user-data');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}