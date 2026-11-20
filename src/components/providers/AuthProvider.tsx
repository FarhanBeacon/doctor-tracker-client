'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { AdminUser } from '@/types';
import { authService } from '@/services/auth.service';
import { AUTH_TOKEN_KEY } from '@/lib/api';

interface AuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  login: (token: string, admin: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .getMe()
      .then((admin) => setUser(admin))
      .catch(() => {
        Cookies.remove(AUTH_TOKEN_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((token: string, admin: AdminUser) => {
    Cookies.set(AUTH_TOKEN_KEY, token, { expires: 7, sameSite: 'lax' });
    setUser(admin);
  }, []);

  const logout = useCallback(() => {
    Cookies.remove(AUTH_TOKEN_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
