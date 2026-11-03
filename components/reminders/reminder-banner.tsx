'use client';

import { useState } from 'react';
import { Bell, X, AlertCircle } from 'lucide-react';
import { useReminders } from '@/hooks/use-reminders';
import { countdownLabel } from '@/utils/format';
import Link from 'next/link';

export function ReminderBanner() {
  const { reminders } = useReminders();
  const [dismissed, setDismissed] = useState(false);

  if (reminders.length === 0 || dismissed) return null;

  return (
    <div className="no-print">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="glass-gold flex items-start gap-3 rounded-2xl p-4 animate-fade-in">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-400/20">
            <Bell className="h-5 w-5 text-gold-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-maroon">
              {reminders.length} booking{reminders.length > 1 ? 's' : ''} in the next 48 hours
            </p>
            <ul className="mt-1.5 flex flex-wrap gap-2">
              {reminders.slice(0, 4).map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/bookings/${b.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-maroon transition hover:bg-white/80"
                  >
                    <AlertCircle className="h-3 w-3 text-gold-500" />
                    {b.customerName} — {countdownLabel(b.eventDateTime)}
                  </Link>
                </li>
              ))}
              {reminders.length > 4 && (
                <li className="inline-flex items-center rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-maroon">
                  +{reminders.length - 4} more
                </li>
              )}
            </ul>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded-lg p-1 text-maroon/60 transition hover:bg-white/40 hover:text-maroon"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}