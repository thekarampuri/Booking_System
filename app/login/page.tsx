'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, LogIn, Loader2, Eye, EyeOff, User, Lock } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      await login(data.username, data.password);
      toast.success('Welcome back!');
      router.push('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
        toast.error('Incorrect username or password. Please try again.');
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-maroon-300/30 blur-3xl animate-pulse-soft" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gold-300/30 blur-3xl animate-pulse-soft" />

      <div className="glass-strong relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10 animate-scale-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-maroon to-maroon-700 shadow-lg shadow-maroon/30">
            <Sparkles className="h-8 w-8 text-gold-200" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-maroon">
            Mahalaxmi Beauty Salon
          </h1>
          <p className="font-serif text-sm text-gold-600 tracking-wide">& Academy</p>
          <p className="mt-3 text-sm text-muted-foreground">Sign in to manage your bookings</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-foreground">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                placeholder="admin"
                {...register('username')}
                className="w-full rounded-xl border border-border bg-white/50 backdrop-blur-sm py-3 pl-11 pr-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20 placeholder:text-muted-foreground/60"
              />
            </div>
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full rounded-xl border border-border bg-white/50 backdrop-blur-sm py-3 pl-11 pr-11 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20 placeholder:text-muted-foreground/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-maroon transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-maroon to-maroon-600 py-3 text-sm font-semibold text-cream-50 shadow-lg shadow-maroon/30 transition hover:shadow-xl hover:shadow-maroon/40 hover:from-maroon-600 hover:to-maroon-700 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4 transition group-hover:translate-x-0.5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Default credentials — username <span className="font-semibold text-maroon">admin</span>, password{' '}
          <span className="font-semibold text-maroon">12345678</span>
        </p>
      </div>
    </div>
  );
}