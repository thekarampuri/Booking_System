'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle2,
  Printer,
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  IndianRupee,
  User,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { GlassCard } from '@/components/ui/glass-card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getBookingById, deleteBooking, updateBookingStatus } from '@/lib/bookings';
import { formatINR, formatDateLong, formatTime, formatDateTime } from '@/utils/format';
import type { Booking } from '@/types/booking';
import { toast } from 'sonner';

export default function BookingDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    const unsub = getBookingById(params.id).then((b) => {
      setBooking(b);
      setLoading(false);
    });
    return () => { void unsub; };
  }, [params.id]);

  const handleDelete = async () => {
    if (!booking) return;
    try {
      await deleteBooking(booking.id);
      toast.success('Booking deleted.');
      router.push('/bookings/upcoming');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete.');
    }
  };

  const handleComplete = async () => {
    if (!booking) return;
    try {
      await updateBookingStatus(booking.id, 'completed');
      toast.success('Booking marked as completed.');
      setCompleteOpen(false);
      setBooking({ ...booking, status: 'completed' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update.');
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-maroon border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!booking) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Booking not found.</p>
          <Link href="/" className="mt-4 inline-block text-maroon hover:underline">Back to dashboard</Link>
        </div>
      </AppShell>
    );
  }

  const statusStyles = {
    upcoming: 'bg-gold-400/15 text-gold-700 border-gold-200/50',
    completed: 'bg-green-500/10 text-green-700 border-green-200/50',
    cancelled: 'bg-gray-400/10 text-gray-600 border-gray-200/50',
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl no-print">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-maroon transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Top Header Card */}
        <GlassCard variant="strong" className="mb-6 p-6 animate-fade-in">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-2xl font-bold text-maroon">{booking.customerName}</h1>
                <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${statusStyles[booking.status]}`}>
                  {booking.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gold-700 font-medium">{booking.serviceName} • {booking.occasionType}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {booking.status === 'upcoming' && (
                <button
                  onClick={() => setCompleteOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-green-600/30 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 transition"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Complete
                </button>
              )}
              <Link
                href={`/bookings/${booking.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white/60 px-3 py-2 text-xs font-medium text-foreground hover:bg-white transition"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white/60 px-3 py-2 text-xs font-medium text-foreground hover:bg-white transition"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Receipt
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Details Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="p-5">
            <h3 className="mb-3 font-serif text-base font-semibold text-maroon">Event Details</h3>
            <DetailRow icon={<CalendarDays className="h-4 w-4" />} label="Occasion Date" value={formatDateLong(booking.occasionDate)} />
            <DetailRow icon={<Clock className="h-4 w-4" />} label="Time" value={formatTime(booking.time)} />
            <DetailRow icon={<User className="h-4 w-4" />} label="Service" value={booking.serviceName} />
            <DetailRow icon={<CalendarDays className="h-4 w-4" />} label="Occasion Type" value={booking.occasionType} />
            <DetailRow icon={<MapPin className="h-4 w-4" />} label="Address" value={booking.address} />
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="mb-3 font-serif text-base font-semibold text-maroon">Contact & Payment</h3>
            <DetailRow icon={<User className="h-4 w-4" />} label="Customer" value={booking.customerName} />
            {booking.phone && <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={booking.phone} />}
            <DetailRow icon={<IndianRupee className="h-4 w-4" />} label="Total" value={formatINR(booking.totalAmount)} />
            <DetailRow icon={<IndianRupee className="h-4 w-4" />} label="Advance Paid" value={formatINR(booking.advanceAmount)} />
            <DetailRow icon={<IndianRupee className="h-4 w-4" />} label="Balance Due" value={formatINR(booking.balanceAmount)} highlight={booking.balanceAmount > 0} />
          </GlassCard>
        </div>

        {booking.notes && (
          <GlassCard className="mt-4 p-5">
            <h3 className="mb-2 font-serif text-base font-semibold text-maroon">Notes</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{booking.notes}</p>
          </GlassCard>
        )}

        <GlassCard className="mt-4 p-5">
          <h3 className="mb-2 font-serif text-base font-semibold text-maroon">Metadata</h3>
          <p className="text-xs text-muted-foreground">Booking created on {formatDateTime(booking.createdAt)}</p>
          <p className="text-xs text-muted-foreground">Last updated on {formatDateTime(booking.updatedAt)}</p>
        </GlassCard>
      </div>

      {/* Printable receipt */}
      <div className="printable hidden">
        <Receipt booking={booking} />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Booking"
        description={`Are you sure you want to delete the booking for ${booking.customerName}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
      <ConfirmDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="Mark as Completed"
        description="This will change the booking status to completed. You can still edit it later."
        confirmLabel="Mark Complete"
        onConfirm={handleComplete}
      />
    </AppShell>
  );
}

function DetailRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="mt-0.5 text-maroon/60">{icon}</span>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium ${highlight ? 'text-red-600' : 'text-foreground'}`}>{value}</p>
      </div>
    </div>
  );
}

function Receipt({ booking }: { booking: Booking }) {
  return (
    <div className="p-8 font-sans text-black bg-white" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="flex items-center justify-between border-b-2 border-maroon pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-maroon" />
          <div>
            <h1 className="font-serif text-xl font-bold text-maroon">Mahalaxmi Beauty Salon & Academy</h1>
            <p className="text-xs text-gray-500">Booking Receipt</p>
          </div>
        </div>
        <p className="text-xs text-gray-500">{formatDateTime(booking.createdAt)}</p>
      </div>

      <table className="w-full text-sm">
        <tbody>
          <Row label="Customer Name" value={booking.customerName} />
          <Row label="Service" value={booking.serviceName} />
          <Row label="Occasion Type" value={booking.occasionType} />
          <Row label="Occasion Date" value={formatDateLong(booking.occasionDate)} />
          <Row label="Service Time" value={formatTime(booking.time)} />
          {booking.phone && <Row label="Phone" value={booking.phone} />}
          <Row label="Address" value={booking.address} />
        </tbody>
      </table>

      <div className="my-6 border-t border-b border-gray-200 py-4">
        <div className="flex justify-between py-1 text-sm">
          <span>Total Amount</span>
          <span className="font-semibold">{formatINR(booking.totalAmount)}</span>
        </div>
        <div className="flex justify-between py-1 text-sm text-green-700">
          <span>Advance Paid</span>
          <span className="font-semibold">{formatINR(booking.advanceAmount)}</span>
        </div>
        <div className="flex justify-between py-1 text-base font-bold text-maroon border-t border-gray-200 mt-2 pt-2">
          <span>Balance Due</span>
          <span>{formatINR(booking.balanceAmount)}</span>
        </div>
      </div>

      {booking.notes && (
        <div className="mb-6 rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-semibold text-gray-600 mb-1">Notes</p>
          <p className="text-xs text-gray-600 whitespace-pre-wrap">{booking.notes}</p>
        </div>
      )}

      <div className="text-center text-xs text-gray-400 mt-8 border-t border-gray-100 pt-4">
        <p>Thank you for choosing Mahalaxmi Beauty Salon & Academy!</p>
        <p className="mt-1">For queries, please contact the salon.</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 text-gray-500 font-medium w-1/3">{label}</td>
      <td className="py-2 text-gray-900 font-medium">{value}</td>
    </tr>
  );
}

