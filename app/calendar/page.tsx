'use client';

import { useMemo, useState } from 'react';
import { LayoutGrid, CalendarDays } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { CalendarGrid } from '@/components/calendar/calendar-grid';
import { YearView } from '@/components/calendar/year-view';
import { DaySheet } from '@/components/calendar/day-sheet';
import { CalendarSkeleton } from '@/components/ui/skeletons';
import { useBookings } from '@/hooks/use-bookings';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const { bookings, loading } = useBookings();
  const [view, setView] = useState<'month' | 'year'>('month');
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => current - 5 + i);
  }, []);

  return (
    <AppShell
      title="Booking Calendar"
      subtitle="Browse the full year of appointments"
      actions={
        <div className="flex items-center gap-2">
          {view === 'year' && (
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-xl border border-white/50 bg-white/40 backdrop-blur-md px-3 py-2 text-sm outline-none focus:border-maroon cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
          <div className="glass flex rounded-xl p-1">
            <button
              onClick={() => setView('month')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
                view === 'month' ? 'bg-maroon text-cream-50 shadow-sm' : 'text-maroon hover:bg-white/40',
              )}
            >
              <CalendarDays className="h-4 w-4" />
              Month
            </button>
            <button
              onClick={() => setView('year')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
                view === 'year' ? 'bg-maroon text-cream-50 shadow-sm' : 'text-maroon hover:bg-white/40',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Year
            </button>
          </div>
        </div>
      }
    >
      {loading ? (
        <CalendarSkeleton />
      ) : view === 'month' ? (
        <CalendarGrid
          key={monthCursor.toISOString()}
          bookings={bookings}
          initialDate={monthCursor}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setSheetOpen(true);
          }}
        />
      ) : (
        <YearView
          bookings={bookings}
          year={year}
          onMonthClick={(date) => {
            setMonthCursor(date);
            setView('month');
          }}
        />
      )}

      <DaySheet
        date={selectedDate}
        bookings={bookings}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </AppShell>
  );
}
