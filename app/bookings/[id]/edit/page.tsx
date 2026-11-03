'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { BookingForm } from '@/components/bookings/booking-form';
import { getBookingById } from '@/lib/bookings';
import type { Booking } from '@/types/booking';
import { Loader2 } from 'lucide-react';

export default function EditBookingPage() {
  const params = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    getBookingById(params.id)
      .then((b) => setBooking(b))
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <AppShell title="Edit Booking" subtitle="Update appointment details">
      <div className="mx-auto max-w-3xl">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-maroon" />
          </div>
        ) : !booking ? (
          <p className="text-center text-muted-foreground py-20">Booking not found.</p>
        ) : (
          <BookingForm booking={booking} mode="edit" />
        )}
      </div>
    </AppShell>
  );
}