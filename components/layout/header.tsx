'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut, Settings, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useReminders } from '@/hooks/use-reminders';
import { countdownLabel } from '@/utils/format';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/layout/brand-logo';
import Link from 'next/link';

export function Header() {
  const { logout } = useAuth();
  const router = useRouter();
  const { reminders, requestNotificationPermission } = useReminders();
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'New Booking', href: '/bookings/new' },
    { label: 'Upcoming', href: '/bookings/upcoming' },
    { label: 'Previous', href: '/bookings/previous' },
    { label: 'Calendar', href: '/calendar' },
  ];

  return (
    <header className="sticky top-0 z-40 no-print">
      <div className="glass-strong border-b border-white/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo + Title */}
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div className="hidden sm:block">
              <h1 className="font-serif text-base font-bold leading-tight text-maroon">
                Mahalaxmi Beauty Salon
              </h1>
              <p className="font-serif text-xs text-gold-600 tracking-wide">& Academy</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition hover:bg-maroon/5 hover:text-maroon"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setBellOpen((s) => !s);
                  requestNotificationPermission();
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-maroon/5 text-maroon transition hover:bg-maroon/10"
                aria-label="Reminders"
              >
                <Bell className="h-5 w-5" />
                {reminders.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-white animate-pulse-soft">
                    {reminders.length}
                  </span>
                )}
              </button>

              {bellOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                  <div className="glass-strong absolute right-0 top-12 z-50 w-80 rounded-2xl p-4 shadow-glass animate-scale-in">
                    <h3 className="mb-3 text-sm font-semibold text-maroon">Upcoming Reminders</h3>
                    {reminders.length === 0 ? (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        No bookings in the next 48 hours.
                      </p>
                    ) : (
                      <ul className="space-y-2 max-h-80 overflow-auto">
                        {reminders.map((b) => (
                          <li key={b.id}>
                            <Link
                              href={`/bookings/${b.id}`}
                              onClick={() => setBellOpen(false)}
                              className="flex items-center justify-between rounded-xl bg-gold-50/60 border border-gold-200/40 px-3 py-2 transition hover:bg-gold-50"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-maroon">{b.customerName}</p>
                                <p className="text-xs text-muted-foreground">{b.serviceName}</p>
                              </div>
                              <span className="shrink-0 rounded-full bg-gold-400/20 px-2 py-1 text-xs font-semibold text-gold-700">
                                {countdownLabel(b.eventDateTime)}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Settings */}
            <button
              onClick={() => router.push('/settings')}
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-maroon/5 text-maroon transition hover:bg-maroon/10"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Logout */}
            <button
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-maroon/5 text-maroon transition hover:bg-maroon/10"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon/5 text-maroon transition hover:bg-maroon/10 lg:hidden"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="glass border-t border-white/30 px-4 py-3 lg:hidden animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 transition hover:bg-maroon/5 hover:text-maroon',
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => router.push('/settings')}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-maroon/5 py-2.5 text-sm font-medium text-maroon"
              >
                <Settings className="h-4 w-4" /> Settings
              </button>
              <button
                onClick={async () => {
                  await logout();
                  router.push('/login');
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-maroon/5 py-2.5 text-sm font-medium text-maroon"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}