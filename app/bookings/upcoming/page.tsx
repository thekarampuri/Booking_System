'use client';

import { useMemo } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { BookingList } from '@/components/bookings/booking-list';
import { useBookings } from '@/hooks/use-bookings';

export default function UpcomingBookingsPage() {
  const { bookings, loading } = useBookings();

  const upcoming = useMemo(() => {
    const now = Date.now();
    return bookings
      .filter((b) => b.status === 'upcoming' && b.eventDateTime >= now)
      .sort((a, b) => a.eventDateTime - b.eventDateTime);
  }, [bookings]);

  return (
    <AppShell title="Upcoming Bookings" subtitle="Appointments that have not yet taken place">
      <BookingList
        bookings={upcoming}
        loading={loading}
        emptyMessage="No upcoming bookings yet."
      />
    </AppShell>
  );
}
