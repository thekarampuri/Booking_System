'use client';

import Link from 'next/link';
import { CalendarDays, Clock, MapPin, Phone, IndianRupee, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { formatINR, formatDateLong, formatTime, countdownLabel } from '@/utils/format';
import { isWithinNext48Hours } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { Booking } from '@/types/booking';

const statusStyles: Record<Booking['status'], string> = {
  upcoming: 'bg-gold-400/15 text-gold-700 border-gold-200/50',
  completed: 'bg-green-500/10 text-green-700 border-green-200/50',
  cancelled: 'bg-gray-400/10 text-gray-600 border-gray-200/50',
};

export function BookingCard({ booking }: { booking: Booking }) {
  const isReminder = booking.status === 'upcoming' && isWithinNext48Hours(booking.eventDateTime);
  const hasBalance = booking.balanceAmount > 0;

  return (
    <Link href={`/bookings/${booking.id}`} className="block">
      <GlassCard className="p-5" hover>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-semibold text-maroon truncate">{booking.customerName}</h3>
              {isReminder && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/20 px-2 py-0.5 text-[10px] font-bold text-gold-700 animate-pulse-soft">
                  <AlertCircle className="h-2.5 w-2.5" />
                  {countdownLabel(booking.eventDateTime)}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{booking.serviceName}</p>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
              statusStyles[booking.status],
            )}
          >
            {booking.status}
          </span>
        </div>

        <div className="mt-3 grid gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-maroon/60" />
            <span>{formatDateLong(booking.occasionDate)}</span>
            <Clock className="ml-2 h-3.5 w-3.5 text-maroon/60" />
            <span>{formatTime(booking.time)}</span>
          </div>
          {booking.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-maroon/60" />
              <span className="truncate">{booking.address}</span>
            </div>
          )}
          {booking.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-maroon/60" />
              <span>{booking.phone}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3 border-t border-maroon/5 pt-3">
          <div className="flex items-center gap-1 text-xs">
            <IndianRupee className="h-3 w-3 text-maroon/60" />
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold text-maroon">{formatINR(booking.totalAmount)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground">Adv:</span>
            <span className="font-semibold text-foreground">{formatINR(booking.advanceAmount)}</span>
          </div>
          {hasBalance && (
            <span className="ml-auto inline-flex items-center rounded-full bg-red-50/70 border border-red-200/50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
              Bal: {formatINR(booking.balanceAmount)}
            </span>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}