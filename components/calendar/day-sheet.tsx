'use client';

import { format } from 'date-fns';
import { Plus, X, CalendarDays } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { BookingCard } from '@/components/booking-card';
import Link from 'next/link';
import type { Booking } from '@/types/booking';

interface DaySheetProps {
  date: Date | null;
  bookings: Booking[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DaySheet({ date, bookings, open, onOpenChange }: DaySheetProps) {
  const dayBookings = date
    ? bookings
        .filter((b) => b.occasionDate === format(date, 'yyyy-MM-dd'))
        .sort((a, b) => a.time.localeCompare(b.time))
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass-strong border-l border-white/50 w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-serif text-xl text-maroon">
            <CalendarDays className="h-5 w-5" />
            {date ? format(date, 'EEEE, dd MMM yyyy') : ''}
          </SheetTitle>
          <SheetDescription>
            {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''} on this day
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-3">
          {dayBookings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No bookings on this day.</p>
              <p className="mt-1 text-xs text-muted-foreground">Add one to get started.</p>
            </div>
          ) : (
            dayBookings.map((b) => <BookingCard key={b.id} booking={b} />)
          )}

          {date && (
            <Link
              href={`/bookings/new?date=${format(date, 'yyyy-MM-dd')}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-maroon to-maroon-600 py-3 text-sm font-semibold text-cream-50 shadow-lg shadow-maroon/30 transition hover:from-maroon-600 hover:to-maroon-700"
            >
              <Plus className="h-4 w-4" />
              Add booking on this date
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}