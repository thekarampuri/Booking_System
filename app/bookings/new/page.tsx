'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { BookingForm } from '@/components/bookings/booking-form';
import { Loader2 } from 'lucide-react';

function NewBookingInner() {
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

export default function NewBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-maroon" />
        </div>
      }
    >
      <NewBookingInner />
    </Suspense>
  );
}
