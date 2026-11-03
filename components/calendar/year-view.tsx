'use client';

import { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getMonth,
  startOfWeek,
  endOfWeek,
  isToday,
  isSameMonth,
} from 'date-fns';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import type { Booking } from '@/types/booking';

interface YearViewProps {
  bookings: Booking[];
  onMonthClick?: (date: Date) => void;
  year?: number;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function YearView({ bookings, onMonthClick, year = new Date().getFullYear() }: YearViewProps) {
  const bookingsByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of bookings) {
      const key = b.occasionDate;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [bookings]);

  const maxCount = useMemo(() => Math.max(1, ...Array.from(bookingsByDay.values())), [bookingsByDay]);

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
      {months.map((month) => {
        const date = new Date(year, month, 1);
        const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
        const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
        const days = eachDayOfInterval({ start, end });

        return (
          <GlassCard
            key={month}
            className="p-3 cursor-pointer"
            hover
            onClick={() => onMonthClick?.(date)}
          >
            <h3 className="mb-2 text-center font-serif text-sm font-bold text-maroon">
              {MONTH_NAMES[month]} {year}
            </h3>
            <div className="grid grid-cols-7 gap-px">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[8px] font-medium text-muted-foreground/60">{d}</div>
              ))}
              {days.map((day) => {
                const inMonth = isSameMonth(day, date);
                const key = format(day, 'yyyy-MM-dd');
                const count = bookingsByDay.get(key) ?? 0;
                const intensity = count / maxCount;
                const today = isToday(day);

                return (
                  <div
                    key={key}
                    className={cn(
                      'aspect-square rounded text-center text-[8px] leading-none flex items-center justify-center transition',
                      !inMonth && 'opacity-30',
                      today && 'ring-1 ring-maroon',
                      count > 0 && inMonth
                        ? intensity > 0.66
                          ? 'bg-maroon text-cream-50 font-bold'
                          : intensity > 0.33
                            ? 'bg-maroon/40 text-maroon font-medium'
                            : 'bg-maroon/15 text-maroon'
                        : inMonth
                          ? 'bg-transparent text-muted-foreground hover:bg-maroon/5'
                          : 'bg-transparent',
                    )}
                    title={count > 0 ? `${count} booking${count > 1 ? 's' : ''} on ${format(day, 'dd MMM')}` : format(day, 'dd MMM')}
                  >
                    {format(day, 'd')}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}