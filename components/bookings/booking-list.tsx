'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { BookingCard } from '@/components/bookings/booking-card';
import { BookingCardSkeleton, Skeleton } from '@/components/ui/skeletons';
import { SERVICE_TYPES, OCCASION_TYPES, type Booking } from '@/types/booking';

interface BookingListProps {
  bookings: Booking[];
  loading: boolean;
  emptyMessage?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function BookingList({ bookings, loading, emptyMessage = 'No bookings found.' }: BookingListProps) {
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [occasionFilter, setOccasionFilter] = useState<string>('all');

  const years = useMemo(() => {
    const set = new Set(bookings.map((b) => new Date(b.occasionDate).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [bookings]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (search && !b.customerName.toLowerCase().includes(search.toLowerCase())) return false;
      if (monthFilter !== 'all' && new Date(b.occasionDate).getMonth() !== Number(monthFilter)) return false;
      if (yearFilter !== 'all' && new Date(b.occasionDate).getFullYear() !== Number(yearFilter)) return false;
      if (serviceFilter !== 'all' && b.serviceName !== serviceFilter) return false;
      if (occasionFilter !== 'all' && b.occasionType !== occasionFilter) return false;
      return true;
    });
  }, [bookings, search, monthFilter, yearFilter, serviceFilter, occasionFilter]);

  const hasFilters = search || monthFilter !== 'all' || yearFilter !== 'all' || serviceFilter !== 'all' || occasionFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setMonthFilter('all');
    setYearFilter('all');
    setServiceFilter('all');
    setOccasionFilter('all');
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <BookingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-white/50 backdrop-blur-sm py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="rounded-xl border border-border bg-white/50 px-3 py-2.5 text-sm outline-none focus:border-maroon cursor-pointer"
            >
              <option value="all">All months</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="rounded-xl border border-border bg-white/50 px-3 py-2.5 text-sm outline-none focus:border-maroon cursor-pointer"
            >
              <option value="all">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="rounded-xl border border-border bg-white/50 px-3 py-2.5 text-sm outline-none focus:border-maroon cursor-pointer"
            >
              <option value="all">All services</option>
              {SERVICE_TYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={occasionFilter}
              onChange={(e) => setOccasionFilter(e.target.value)}
              className="rounded-xl border border-border bg-white/50 px-3 py-2.5 text-sm outline-none focus:border-maroon cursor-pointer"
            >
              <option value="all">All occasions</option>
              {OCCASION_TYPES.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-xl border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 transition"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</span>
        {hasFilters && <span className="flex items-center gap-1"><Filter className="h-3.5 w-3.5" /> Filtered</span>}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      )}
    </div>
  );
}