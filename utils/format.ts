import { format, parseISO, isWithinInterval, addHours } from 'date-fns';
import { enIN } from 'date-fns/locale';

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDate(date: string | number | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(d, 'dd MMM yyyy', { locale: enIN });
}

export function formatDateLong(date: string | number | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(d, 'EEE, dd MMM yyyy', { locale: enIN });
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return format(date, 'hh:mm a');
}

export function formatDateTime(ts: number): string {
  return format(new Date(ts), "dd MMM yyyy 'at' hh:mm a", { locale: enIN });
}

export function combineDateAndTime(dateStr: string, timeStr: string): number {
  const date = parseISO(dateStr);
  const [h, m] = timeStr.split(':').map(Number);
  date.setHours(h, m, 0, 0);
  return date.getTime();
}

export function isWithinNext48Hours(timestamp: number): boolean {
  const now = Date.now();
  return isWithinInterval(timestamp, {
    start: now,
    end: addHours(now, 48),
  });
}

export function hoursUntil(timestamp: number): number {
  return Math.round((timestamp - Date.now()) / (1000 * 60 * 60));
}

export function countdownLabel(timestamp: number): string {
  const diff = timestamp - Date.now();
  if (diff <= 0) return 'now';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days > 0) return `in ${days}d ${remainingHours}h`;
  if (remainingHours > 0) return `in ${remainingHours}h`;
  const mins = Math.floor(diff / (1000 * 60));
  return `in ${mins}m`;
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function monthLabel(year: number, month: number): string {
  return format(new Date(year, month, 1), 'MMMM yyyy', { locale: enIN });
}
