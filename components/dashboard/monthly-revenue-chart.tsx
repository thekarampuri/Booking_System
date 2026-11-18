'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Booking } from '@/types/booking';
import { GlassCard } from '@/components/ui/glass-card';
import { formatINR } from '@/utils/format';
import { TrendingUp, Wallet, IndianRupee, Calendar } from 'lucide-react';

interface MonthlyRevenueChartProps {
  bookings: Booking[];
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function MonthlyRevenueChart({ bookings }: MonthlyRevenueChartProps) {
  // Extract all available years from bookings, defaulting to current year
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsSet = new Set<number>([currentYear]);
    bookings.forEach((b) => {
      if (b.occasionDate) {
        const y = new Date(b.occasionDate).getFullYear();
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [bookings]);

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return availableYears[0] ?? new Date().getFullYear();
  });

  const [viewMode, setViewMode] = useState<'both' | 'chart' | 'table'>('both');

  // Compute monthly data for selected year
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, index) => ({
      monthIndex: index,
      month: MONTH_NAMES[index],
      fullName: FULL_MONTH_NAMES[index],
      year: selectedYear,
      totalIncome: 0,
      advanceReceived: 0,
      balancePending: 0,
      bookingsCount: 0,
    }));

    bookings.forEach((b) => {
      if (b.status === 'cancelled') return;
      if (!b.occasionDate) return;

      const date = new Date(b.occasionDate);
      if (isNaN(date.getTime())) return;

      if (date.getFullYear() === selectedYear) {
        const m = date.getMonth();
        if (m >= 0 && m < 12) {
          months[m].totalIncome += Number(b.totalAmount || 0);
          months[m].advanceReceived += Number(b.advanceAmount || 0);
          months[m].balancePending += Number(b.balanceAmount || 0);
          months[m].bookingsCount += 1;
        }
      }
    });

    return months;
  }, [bookings, selectedYear]);

  // Overall totals for the selected year
  const yearTotals = useMemo(() => {
    return monthlyData.reduce(
      (acc, curr) => ({
        totalIncome: acc.totalIncome + curr.totalIncome,
        advanceReceived: acc.advanceReceived + curr.advanceReceived,
        balancePending: acc.balancePending + curr.balancePending,
        totalBookings: acc.totalBookings + curr.bookingsCount,
      }),
      { totalIncome: 0, advanceReceived: 0, balancePending: 0, totalBookings: 0 }
    );
  }, [monthlyData]);

  const currentMonthIndex = new Date().getMonth();
  const currentYearNow = new Date().getFullYear();

  return (
    <GlassCard className="p-6">
      {/* Top Header & Year Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-maroon" />
            <h2 className="font-serif text-xl font-bold text-maroon">
              Monthly Revenue & Advance Collection
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Track total booking income and advance payments received across each month
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Year Selector */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-white/70 px-3 py-1.5 shadow-sm">
            <Calendar className="h-4 w-4 text-maroon/70" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-sm font-semibold text-maroon outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl border border-border bg-white/60 p-0.5 text-xs font-medium">
            <button
              onClick={() => setViewMode('both')}
              className={`rounded-lg px-2.5 py-1 transition ${
                viewMode === 'both' ? 'bg-maroon text-cream-50 font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`rounded-lg px-2.5 py-1 transition ${
                viewMode === 'chart' ? 'bg-maroon text-cream-50 font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Graph
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-lg px-2.5 py-1 transition ${
                viewMode === 'table' ? 'bg-maroon text-cream-50 font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Badges for Selected Year */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-white/60 p-3.5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Income ({selectedYear})</p>
          <p className="mt-1 font-serif text-xl font-bold text-maroon">
            {formatINR(yearTotals.totalIncome)}
          </p>
        </div>

        <div className="rounded-xl border border-gold-300/40 bg-gold-50/50 p-3.5 shadow-sm">
          <p className="text-xs font-medium text-gold-700">Advance Received ({selectedYear})</p>
          <p className="mt-1 font-serif text-xl font-bold text-gold-700">
            {formatINR(yearTotals.advanceReceived)}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-white/60 p-3.5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Balance Pending ({selectedYear})</p>
          <p className="mt-1 font-serif text-xl font-bold text-neutral-800">
            {formatINR(yearTotals.balancePending)}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-white/60 p-3.5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Bookings ({selectedYear})</p>
          <p className="mt-1 font-serif text-xl font-bold text-neutral-900">
            {yearTotals.totalBookings} <span className="text-xs font-normal text-muted-foreground">events</span>
          </p>
        </div>
      </div>

      {/* Bar Chart Section */}
      {(viewMode === 'both' || viewMode === 'chart') && (
        <div className="mt-6 pt-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(127, 23, 64, 0.04)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-border bg-white p-3 shadow-xl text-xs">
                          <p className="font-bold text-maroon font-serif text-sm border-b pb-1 mb-2">
                            {item.fullName} {selectedYear}
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-neutral-600">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#7F1740]" />
                                Total Income:
                              </span>
                              <span className="font-bold text-neutral-900">{formatINR(item.totalIncome)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-neutral-600">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#CC9F40]" />
                                Advance Paid:
                              </span>
                              <span className="font-bold text-[#8C6A26]">{formatINR(item.advanceReceived)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-neutral-600">
                                <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                                Balance Due:
                              </span>
                              <span className="font-semibold text-neutral-800">{formatINR(item.balancePending)}</span>
                            </div>
                            <div className="pt-1 text-[11px] text-muted-foreground border-t">
                              Bookings: <span className="font-semibold text-foreground">{item.bookingsCount}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                />
                <Bar
                  dataKey="totalIncome"
                  name="Total Income"
                  fill="#7F1740"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="advanceReceived"
                  name="Advance Received"
                  fill="#CC9F40"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly Numbers Breakdown Table */}
      {(viewMode === 'both' || viewMode === 'table') && (
        <div className="mt-6 overflow-hidden rounded-xl border border-border/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-maroon/5 font-semibold text-maroon uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">Month</th>
                  <th className="py-2.5 px-3.5 text-center">Bookings</th>
                  <th className="py-2.5 px-3.5 text-right">Total Income</th>
                  <th className="py-2.5 px-3.5 text-right">Advance Received</th>
                  <th className="py-2.5 px-3.5 text-right">Balance Due</th>
                  <th className="py-2.5 px-3.5 text-right">Collection Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-neutral-800 bg-white/40">
                {monthlyData.map((m) => {
                  const isCurrent = selectedYear === currentYearNow && m.monthIndex === currentMonthIndex;
                  const rate = m.totalIncome > 0 ? Math.round((m.advanceReceived / m.totalIncome) * 100) : 0;

                  return (
                    <tr
                      key={m.monthIndex}
                      className={`hover:bg-maroon/5 transition ${
                        isCurrent ? 'bg-gold-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-neutral-900">{m.fullName}</span>
                          {isCurrent && (
                            <span className="rounded-full bg-gold-400/20 px-1.5 py-0.2 text-[10px] font-bold text-gold-700">
                              Current
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-medium text-neutral-700">
                          {m.bookingsCount}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-semibold text-maroon">
                        {formatINR(m.totalIncome)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-semibold text-gold-700">
                        {formatINR(m.advanceReceived)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-medium text-neutral-700">
                        {formatINR(m.balancePending)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <span
                          className={`font-semibold ${
                            rate >= 100
                              ? 'text-green-700'
                              : rate >= 50
                              ? 'text-gold-700'
                              : 'text-neutral-500'
                          }`}
                        >
                          {m.totalIncome > 0 ? `${rate}%` : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-maroon/10 font-bold text-maroon border-t-2 border-maroon/20">
                <tr>
                  <td className="py-3 px-3.5">Total ({selectedYear})</td>
                  <td className="py-3 px-3.5 text-center">{yearTotals.totalBookings}</td>
                  <td className="py-3 px-3.5 text-right text-sm">{formatINR(yearTotals.totalIncome)}</td>
                  <td className="py-3 px-3.5 text-right text-sm text-gold-700">
                    {formatINR(yearTotals.advanceReceived)}
                  </td>
                  <td className="py-3 px-3.5 text-right text-sm">{formatINR(yearTotals.balancePending)}</td>
                  <td className="py-3 px-3.5 text-right">
                    {yearTotals.totalIncome > 0
                      ? `${Math.round((yearTotals.advanceReceived / yearTotals.totalIncome) * 100)}%`
                      : '—'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
