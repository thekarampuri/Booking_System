'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  CalendarPlus,
  CalendarClock,
  History,
  CalendarDays,
  Bell,
  TrendingUp,
  Wallet,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { GlassCard } from '@/components/ui/glass-card';
import { StatCard } from '@/components/ui/stat-card';
import { StatCardSkeleton } from '@/components/ui/skeletons';
import { useBookings } from '@/hooks/use-bookings';
import { useReminders } from '@/hooks/use-reminders';
import { formatINR, formatDateLong, formatTime, countdownLabel, monthLabel } from '@/utils/format';
import {
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  format,
  parseISO,
} from 'date-fns';

export default function DashboardPage() {
  const { bookings, loading } = useBookings();
  const { reminders } = useReminders();

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const upcoming = bookings.filter((b) => b.status === 'upcoming' && b.eventDateTime >= Date.now());
    const past = bookings.filter(
      (b) => b.eventDateTime < Date.now() || b.status === 'completed' || b.status === 'cancelled',
    );

    const bookingsThisMonth = bookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      const d = parseISO(b.occasionDate);
      return isWithinInterval(d, { start: monthStart, end: monthEnd });
    }).length;

    const advanceThisMonth = bookings
      .filter((b) => {
        if (b.status === 'cancelled') return false;
        const d = parseISO(b.occasionDate);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      })
      .reduce((sum, b) => sum + b.advanceAmount, 0);

    const balancePending = upcoming.reduce((sum, b) => sum + b.balanceAmount, 0);

    return {
      upcomingCount: upcoming.length,
      previousCount: past.length,
      bookingsThisMonth,
      advanceThisMonth,
      balancePending,
    };
  }, [bookings]);

  const cards = [
    {
      href: '/bookings/new',
      icon: CalendarPlus,
      title: 'New Booking',
      desc: 'Add a new customer booking',
      accent: 'from-maroon to-maroon-600',
    },
    {
      href: '/bookings/upcoming',
      icon: CalendarClock,
      title: 'Upcoming Bookings',
      desc: `${stats.upcomingCount} scheduled`,
      badge: stats.upcomingCount,
      accent: 'from-gold-500 to-gold-600',
    },
    {
      href: '/bookings/previous',
      icon: History,
      title: 'Previous Bookings',
      desc: `${stats.previousCount} completed`,
      badge: stats.previousCount,
      accent: 'from-green-700 to-green-800',
    },
    {
      href: '/calendar',
      icon: CalendarDays,
      title: 'Booking Calendar',
      desc: 'Browse the full year',
      accent: 'from-maroon-700 to-maroon-900',
    },
  ];

  return (
    <AppShell>
      {/* Hero */}
      <div className="mb-8">
        <GlassCard variant="maroon" className="relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gold-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gold-300/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-gold-200 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              {monthLabel(new Date().getFullYear(), new Date().getMonth())}
            </div>
            <h1 className="mt-2 font-serif text-2xl font-bold text-cream-50 sm:text-3xl">
              Welcome to Mahalaxmi Beauty Salon & Academy
            </h1>
            <p className="mt-2 text-sm text-cream-100/80">
              Manage your makeup bookings and keep track of upcoming events all year round.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Action cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <GlassCard className="group h-full p-5" hover>
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} shadow-md`}>
                  <card.icon className="h-6 w-6 text-cream-50" />
                </div>
                {card.badge !== undefined && (
                  <span className="rounded-full bg-gold-400/20 px-2.5 py-0.5 text-xs font-bold text-gold-700">
                    {card.badge}
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-maroon group-hover:text-maroon-600 transition">
                {card.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
            </GlassCard>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Bookings This Month"
              value={stats.bookingsThisMonth}
              icon={<CalendarDays className="h-5 w-5" />}
              accent="maroon"
            />
            <StatCard
              label="Advance Collected"
              value={formatINR(stats.advanceThisMonth)}
              icon={<TrendingUp className="h-5 w-5" />}
              accent="gold"
              hint="This month so far"
            />
            <StatCard
              label="Balance Pending"
              value={formatINR(stats.balancePending)}
              icon={<Wallet className="h-5 w-5" />}
              accent="green"
              hint="On upcoming bookings"
            />
          </>
        )}
      </div>

      {/* Reminders */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-gold-600" />
          <h2 className="font-serif text-xl font-bold text-maroon">Reminders</h2>
          <span className="rounded-full bg-gold-400/20 px-2.5 py-0.5 text-xs font-bold text-gold-700">
            {reminders.length}
          </span>
        </div>

        {loading ? (
          <GlassCard className="p-5">
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-maroon/5" />
              ))}
            </div>
          </GlassCard>
        ) : reminders.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No upcoming bookings within 48 hours. You're all caught up.</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {reminders.map((b) => (
              <Link key={b.id} href={`/bookings/${b.id}`}>
                <GlassCard className="flex items-center gap-4 p-4" hover>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400/15">
                    <AlertCircle className="h-5 w-5 text-gold-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-maroon truncate">{b.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.serviceName} — {formatDateLong(b.occasionDate)} at {formatTime(b.time)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-gold-400/20 px-3 py-1 text-xs font-bold text-gold-700 animate-pulse-soft">
                    {countdownLabel(b.eventDateTime)}
                  </span>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}