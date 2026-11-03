'use client';

import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { BookingForm } from '@/components/bookings/booking-form';

export default function NewBookingPage() {
  const searchParams = useSearchParams();
  const prefillDate = searchParams.get('date') ?? undefined;

  return (
    <AppShell title="New Booking" subtitle="Add a new customer appointment">
      <div className="mx-auto max-w-3xl">
        <BookingForm mode="create" prefillDate={prefillDate} />
      </div>
    </AppShell>
  );
}