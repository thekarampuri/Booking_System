'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle2,
  Printer,
  Eye,
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  IndianRupee,
  User,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { GlassCard } from '@/components/ui/glass-card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BookingReceipt } from '@/components/receipt/booking-receipt';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getBookingById, deleteBooking, updateBookingStatus } from '@/lib/bookings';
import { formatINR, formatDateLong, formatTime, formatDateTime } from '@/utils/format';
import type { Booking } from '@/types/booking';
import { toast } from 'sonner';

export default function BookingViewPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getBookingById(id).then((b) => {
      setBooking(b);
      setLoading(false);
    });
  }, [id]);

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

  const handlePrint = () => {
    window.print();
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
          <Link href="/" className="mt-4 inline-block text-maroon hover:underline">
            Back to dashboard
          </Link>
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

        <GlassCard variant="strong" className="mb-6 p-6 animate-fade-in">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-2xl font-bold text-maroon">{booking.customerName}</h1>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[booking.status]}`}
                >
                  {booking.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {booking.serviceName} — {booking.occasionType}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/bookings/edit-booking?id=${booking.id}`}
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
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gold-400/15 px-3 py-2 text-sm font-medium text-gold-800 transition hover:bg-gold-400/25"
                title="Preview Receipt"
              >
                <Eye className="h-4 w-4" /> Preview
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl bg-maroon px-3 py-2 text-sm font-medium text-cream-50 shadow-md shadow-maroon/20 transition hover:bg-maroon-600"
              >
                <Printer className="h-4 w-4" /> Print / PDF
              </button>
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="p-5">
            <h3 className="mb-3 font-serif text-base font-semibold text-maroon">Event Details</h3>
            <DetailRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Occasion Date"
              value={formatDateLong(booking.occasionDate)}
            />
            <DetailRow icon={<Clock className="h-4 w-4" />} label="Time" value={formatTime(booking.time)} />
            <DetailRow icon={<User className="h-4 w-4" />} label="Service" value={booking.serviceName} />
            {Number(booking.sidersCount || 0) > 0 && (
              <DetailRow
                icon={<User className="h-4 w-4" />}
                label="Siders Included"
                value={`${booking.sidersCount} Sider${Number(booking.sidersCount) > 1 ? 's' : ''}${
                  booking.sidersPrice ? ` (${formatINR(booking.sidersPrice)})` : ''
                }`}
              />
            )}
            <DetailRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Occasion Type"
              value={booking.occasionType}
            />
            <DetailRow icon={<MapPin className="h-4 w-4" />} label="Address" value={booking.address} />
          </GlassCard>
          <GlassCard className="p-5">
            <h3 className="mb-3 font-serif text-base font-semibold text-maroon">Contact & Payment</h3>
            <DetailRow icon={<User className="h-4 w-4" />} label="Customer" value={booking.customerName} />
            {booking.phone && (
              <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={booking.phone} />
            )}
            <DetailRow
              icon={<IndianRupee className="h-4 w-4" />}
              label="Total"
              value={formatINR(booking.totalAmount)}
            />
            <DetailRow
              icon={<IndianRupee className="h-4 w-4" />}
              label="Advance Paid"
              value={formatINR(booking.advanceAmount)}
            />
            <DetailRow
              icon={<IndianRupee className="h-4 w-4" />}
              label="Balance Due"
              value={formatINR(booking.balanceAmount)}
              highlight={booking.balanceAmount > 0}
            />
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
          <p className="text-xs text-muted-foreground">
            Booking created on {formatDateTime(booking.createdAt)}
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated on {formatDateTime(booking.updatedAt)}
          </p>
        </GlassCard>
      </div>

      {/* Printable receipt container (rendered when printing) */}
      <div className="printable hidden print:block">
        <BookingReceipt booking={booking} />
      </div>

      {/* Interactive Modal Preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-neutral-100">
          <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <DialogTitle className="font-serif text-xl text-maroon">Receipt Preview</DialogTitle>
            <button
              onClick={() => {
                setPreviewOpen(false);
                setTimeout(() => window.print(), 250);
              }}
              className="mr-8 inline-flex items-center gap-1.5 rounded-xl bg-maroon px-3 py-1.5 text-xs font-semibold text-cream-50 hover:bg-maroon-600 transition"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
            </button>
          </DialogHeader>
          <div className="mt-4 overflow-hidden rounded-xl shadow-lg border border-neutral-300">
            <BookingReceipt booking={booking} />
          </div>
        </DialogContent>
      </Dialog>

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
        <p className={`text-sm font-medium ${highlight ? 'text-red-600' : 'text-foreground'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

