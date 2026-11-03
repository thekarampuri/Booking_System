'use client';

import { useEffect, useState, useCallback } from 'react';
import { subscribeToBookings, setReminderSent } from '@/lib/bookings';
import { isWithinNext48Hours } from '@/utils/format';
import type { Booking } from '@/types/booking';

export function useReminders() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const unsub = subscribeToBookings((data) => {
      setBookings(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Fire browser notification when a booking enters the 48h window
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    bookings
      .filter((b) => !b.reminderSent && isWithinNext48Hours(b.eventDateTime) && b.status === 'upcoming')
      .forEach((b) => {
        const hours = Math.round((b.eventDateTime - now) / (1000 * 60 * 60));
        const n = new Notification('Mahalaxmi — Upcoming Booking', {
          body: `${b.customerName} — ${b.serviceName} in ${hours}h on ${new Date(b.eventDateTime).toLocaleString('en-IN')}`,
        });
        setTimeout(() => n.close(), 8000);
        setReminderSent(b.id).catch(() => {});
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, now]);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const reminders = bookings.filter(
    (b) => b.status === 'upcoming' && isWithinNext48Hours(b.eventDateTime) && b.eventDateTime > now,
  );

  return { reminders, loading, requestNotificationPermission };
}