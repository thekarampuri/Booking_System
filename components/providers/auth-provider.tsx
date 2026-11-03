'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  setPersistence,
  browserLocalPersistence,
  type User,
} from 'firebase/auth';
import { auth, ADMIN_EMAIL, isConfigured } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    let unsub = () => {};
    setPersistence(auth, browserLocalPersistence)
      .catch(() => undefined)
      .finally(() => {
        if (!auth) {
          setLoading(false);
          return;
        }
        unsub = onAuthStateChanged(auth, (u) => {
          setUser(u);
          setLoading(false);
        });
      });
    return () => unsub();
  }, []);

  const login = async (username: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase is not configured. Add your credentials to .env.local');
    }
    const cleanUser = username.trim().toLowerCase();
    const email = cleanUser === 'admin' ? ADMIN_EMAIL : `${cleanUser}@mahalaxmi.com`;
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const changePassword = async (newPassword: string) => {
    if (!auth?.currentUser) throw new Error('Not signed in.');
    if (newPassword.length < 8) throw new Error('Password must be at least 8 characters.');
    await updatePassword(auth.currentUser, newPassword);
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
