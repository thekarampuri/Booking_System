'use client';

import { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
  addMonths,
  addHours,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { formatTime } from '@/utils/format';
import type { Booking } from '@/types/booking';

interface CalendarGridProps {
  bookings: Booking[];
  onSelectDate?: (date: Date) => void;
  initialDate?: Date;
}

const statusColors: Record<Booking['status'], string> = {
  upcoming: 'bg-gold-400',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-400',
};

export function CalendarGrid({ bookings, onSelectDate, initialDate }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(initialDate ?? new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const key = b.occasionDate;
      const arr = map.get(key) ?? [];
      arr.push(b);
      map.set(key, arr);
    }
    return map;
  }, [bookings]);

  const goPrev = () => setCurrentDate((d) => addMonths(d, -1));
  const goNext = () => setCurrentDate((d) => addMonths(d, 1));
  const goToday = () => setCurrentDate(new Date());

  return (
    <GlassCard variant="strong" className="p-5 sm:p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon/10">
            <CalendarDays className="h-5 w-5 text-maroon" />
          </div>
          <h2 className="font-serif text-xl font-bold text-maroon">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="rounded-xl border border-maroon/20 bg-maroon/5 px-4 py-2 text-sm font-medium text-maroon transition hover:bg-maroon/10"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <select
              value={currentDate.getFullYear()}
              onChange={(e) => setCurrentDate(new Date(Number(e.target.value), currentDate.getMonth(), 1))}
              className="rounded-lg border border-border bg-white/50 px-2 py-2 text-sm outline-none cursor-pointer focus:border-maroon"
            >
              {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={goPrev}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white/50 text-maroon transition hover:bg-maroon/10"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goNext}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white/50 text-maroon transition hover:bg-maroon/10"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayBookings = bookingsByDay.get(key) ?? [];
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const now = new Date();
          const isReminder =
            inMonth &&
            endOfDay(day).getTime() >= now.getTime() &&
            startOfDay(day).getTime() <= addHours(now, 48).getTime();
          const multi = dayBookings.length >= 2;

          return (
            <button
              key={key}
              onClick={() => onSelectDate?.(day)}
              className={cn(
                'group relative min-h-[80px] sm:min-h-[96px] rounded-xl border p-2 text-left transition',
                inMonth ? 'bg-white/30 hover:bg-white/60' : 'bg-transparent opacity-40 hover:opacity-70',
                today ? 'border-maroon ring-1 ring-maroon/20' : 'border-transparent hover:border-maroon/20',
                isReminder && inMonth && 'bg-gold-50/40',
              )}
            >
              <span
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  today ? 'bg-maroon text-cream-50' : 'text-foreground',
                )}
              >
                {format(day, 'd')}
              </span>

              {isReminder && inMonth && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold-400 animate-pulse-soft" />
              )}

              {/* Booking dots/chips */}
              {dayBookings.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  {dayBookings.slice(0, 2).map((b) => (
                    <div
                      key={b.id}
                      className={cn(
                        'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium truncate',
                        b.status === 'upcoming' && 'bg-gold-400/20 text-gold-700',
                        b.status === 'completed' && 'bg-green-500/15 text-green-700',
                        b.status === 'cancelled' && 'bg-gray-400/15 text-gray-600',
                        multi && 'bg-maroon/15 text-maroon font-bold',
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', statusColors[b.status])} />
                      <span className="truncate">{b.customerName}</span>
                      <span className="shrink-0 opacity-70">{formatTime(b.time)}</span>
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="px-1.5 text-[10px] font-medium text-muted-foreground">
                      +{dayBookings.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-maroon/10 pt-4">
        <LegendItem color="bg-gold-400" label="Upcoming" />
        <LegendItem color="bg-green-500" label="Completed" />
        <LegendItem color="bg-gray-400" label="Cancelled" />
        <LegendItem color="bg-maroon" label="2+ bookings" />
        <LegendItem color="bg-gold-400 animate-pulse-soft" label="48h reminder" />
      </div>
    </GlassCard>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}