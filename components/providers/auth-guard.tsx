'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  useEffect(() => {
    if (loading) return;
    if (!configured) return;
    if (!user && !isLogin) {
      router.replace('/login');
    }
    if (user && isLogin) {
      router.replace('/');
    }
  }, [user, loading, pathname, router, configured, isLogin]);

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-strong max-w-md rounded-2xl p-8 text-center animate-fade-in">
          <h2 className="text-xl font-semibold text-maroon mb-3">Firebase Setup Required</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Add your Firebase credentials to{' '}
            <code className="text-gold-600 font-mono">.env.local</code> to use this app. See{' '}
            <code className="text-gold-600 font-mono">.env.example</code> for the variables needed,
            then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (isLogin) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-maroon" />
      </div>
    );
  }

  return <>{children}</>;
}
