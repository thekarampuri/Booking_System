'use client';

import { useEffect, useState } from 'react';
import { subscribeToBookings } from '@/lib/bookings';
import type { Booking } from '@/types/booking';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToBookings(
      (data) => {
        setBookings(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  return { bookings, loading, error };
}