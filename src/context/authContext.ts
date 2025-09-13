// src/context/authContext.ts

import { createContext } from 'react';

// Tipleri buraya taşıdık
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  profileImagePublicId?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Context objesini burada oluşturup export ediyoruz
export const AuthContext = createContext<AuthContextType | undefined>(undefined);