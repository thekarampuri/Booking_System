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

export default function BookingDetailPage() {
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

        {/* Header */}
        <GlassCard variant="strong" className="mb-6 p-6 animate-fade-in">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-2xl font-bold text-maroon">{booking.customerName}</h1>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[booking.status]}`}>
                  {booking.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{booking.serviceName} — {booking.occasionType}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/bookings/${booking.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-maroon/5 px-3 py-2 text-sm font-medium text-maroon transition hover:bg-maroon/10"
              >
                <Pencil className="h-4 w-4" /> Edit
              </Link>
              {booking.status === 'upcoming' && (
                <button
                  onClick={() => setCompleteOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-green-600/10 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-600/20"
                >
                  <CheckCircle2 className="h-4 w-4" /> Complete
                </button>
              )}
              <button
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/20"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-maroon/5 px-3 py-2 text-sm font-medium text-maroon transition hover:bg-maroon/10"
              >
                <Printer className="h-4 w-4" /> Print / PDF
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Details */}
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
          <Row label="Time" value={formatTime(booking.time)} />
          <Row label="Address" value={booking.address} />
          {booking.phone && <Row label="Phone" value={booking.phone} />}
          <Row label="Status" value={booking.status} />
        </tbody>
      </table>

      <div className="mt-6 border-t-2 border-maroon pt-4">
        <table className="w-full text-sm">
          <tbody>
            <Row label="Total Amount" value={formatINR(booking.totalAmount)} />
            <Row label="Advance Paid" value={formatINR(booking.advanceAmount)} />
            <Row label="Balance Due" value={formatINR(booking.balanceAmount)} bold />
          </tbody>
        </table>
      </div>

      {booking.notes && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500">Notes</p>
          <p className="text-sm">{booking.notes}</p>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-gray-400">
        Thank you for choosing Mahalaxmi Beauty Salon & Academy!
      </p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 text-gray-500 w-1/2">{label}</td>
      <td className={`py-2 text-right ${bold ? 'font-bold text-maroon' : 'text-black'}`}>{value}</td>
    </tr>
  );
}