'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { isConfigured, ensureClient } from '@/lib/firebase';

const _SK = 'mbs_auth';
const _PK = 'mbs_pwd';

function _ok(u: string, p: string): boolean {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(_PK) : null;
  const pw = stored ?? btoa('11111111');
  return u.trim().toLowerCase() === 'admin' && btoa(p) === pw;
}

interface AuthContextValue {
  user: { uid: string } | null;
  loading: boolean;
  configured: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureClient();
    const session = localStorage.getItem(_SK);
    if (session === '1') setUser({ uid: 'admin' });
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    if (!_ok(username, password)) {
      throw Object.assign(new Error('Incorrect username or password.'), {
        code: 'auth/invalid-credential',
      });
    }
    localStorage.setItem(_SK, '1');
    setUser({ uid: 'admin' });
  };

  const logout = async () => {
    localStorage.removeItem(_SK);
    setUser(null);
  };

  const changePassword = async (newPassword: string) => {
    if (newPassword.length < 8) throw new Error('Password must be at least 8 characters.');
    localStorage.setItem(_PK, btoa(newPassword));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, configured: isConfigured(), login, logout, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
