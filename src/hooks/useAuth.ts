// src/hooks/useAuth.ts

import { useContext } from 'react';
// Yeni dosyamızdan ve 'import type' kuralına uyarak import ediyoruz
import { AuthContext } from '../context/authContext';
import type { AuthContextType } from '../context/authContext';

export function useAuth() {
  const context = useContext<AuthContextType | undefined>(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}