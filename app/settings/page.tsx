'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { AppShell } from '@/components/layout/app-shell';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { changePassword, logout } = useAuth();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(newPassword);
      toast.success('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Settings" subtitle="Manage your account and security">
      <div className="mx-auto max-w-lg">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-maroon transition"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="glass-strong rounded-2xl p-6 sm:p-8 animate-fade-in">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-maroon/10">
              <Lock className="h-5 w-5 text-maroon" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-maroon">Change Password</h2>
              <p className="text-sm text-muted-foreground">Update your admin password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-border bg-white/50 backdrop-blur-sm py-3 px-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-border bg-white/50 backdrop-blur-sm py-3 px-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-maroon to-maroon-600 py-3 text-sm font-semibold text-cream-50 shadow-lg shadow-maroon/30 transition hover:from-maroon-600 hover:to-maroon-700 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-gold-50/50 border border-gold-200/50 p-4">
            <p className="text-xs text-gold-800 leading-relaxed">
              <strong>Security note:</strong> The default password <code className="font-mono">12345678</code> must be
              changed before going live. After changing it, the new password takes effect immediately for future logins.
            </p>
          </div>

          <button
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            className="mt-6 w-full rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-maroon transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </AppShell>
  );
}