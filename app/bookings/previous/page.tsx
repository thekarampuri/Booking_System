'use client';

import { useMemo } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { BookingList } from '@/components/bookings/booking-list';
import { useBookings } from '@/hooks/use-bookings';

export default function PreviousBookingsPage() {
  const { bookings, loading } = useBookings();

  const previous = useMemo(() => {
    const now = Date.now();
    return bookings
      .filter(
        (b) =>
          b.eventDateTime < now || b.status === 'completed' || b.status === 'cancelled',
      )
      .filter((b, i, arr) => arr.findIndex((x) => x.id === b.id) === i)
      .sort((a, b) => b.eventDateTime - a.eventDateTime);
  }, [bookings]);

  return (
    <AppShell title="Previous Bookings" subtitle="Past, completed, and cancelled appointments">
      <BookingList
        bookings={previous}
        loading={loading}
        emptyMessage="No previous bookings yet."
      />
    </AppShell>
  );
}
