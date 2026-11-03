'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, AlertTriangle, ArrowLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useBookings } from '@/hooks/use-bookings';
import { createBooking, updateBooking } from '@/lib/bookings';
import { combineDateAndTime, todayISO, formatINR } from '@/utils/format';
import { SERVICE_TYPES, OCCASION_TYPES, type Booking } from '@/types/booking';
import { toast } from 'sonner';

const schema = z
  .object({
    customerName: z.string().min(1, 'Customer name is required'),
    serviceName: z.string().min(1, 'Service is required'),
    bookingDate: z.string().min(1, 'Booking date is required'),
    occasionDate: z.string().min(1, 'Occasion date is required'),
    occasionType: z.string().min(1, 'Occasion type is required'),
    time: z.string().min(1, 'Time is required'),
    address: z.string().min(1, 'Address is required'),
    totalAmount: z.coerce.number().min(0, 'Must be 0 or more'),
    advanceAmount: z.coerce.number().min(0, 'Must be 0 or more'),
    phone: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['upcoming', 'completed', 'cancelled']),
  })
  .refine((data) => data.advanceAmount <= data.totalAmount, {
    message: 'Advance cannot exceed total amount',
    path: ['advanceAmount'],
  });

type FormValues = z.infer<typeof schema>;

interface BookingFormProps {
  booking?: Booking | null;
  prefillDate?: string;
  mode: 'create' | 'edit';
}

export function BookingForm({ booking, prefillDate, mode }: BookingFormProps) {
  const router = useRouter();
  const { bookings } = useBookings();
  const [submitting, setSubmitting] = useState(false);

  const defaultValues: FormValues = useMemo(
    () => ({
      customerName: booking?.customerName ?? '',
      serviceName: booking?.serviceName ?? '',
      bookingDate: booking?.bookingDate ?? todayISO(),
      occasionDate: booking?.occasionDate ?? prefillDate ?? todayISO(),
      occasionType: booking?.occasionType ?? '',
      time: booking?.time ?? '10:00',
      address: booking?.address ?? '',
      totalAmount: booking?.totalAmount ?? 0,
      advanceAmount: booking?.advanceAmount ?? 0,
      phone: booking?.phone ?? '',
      notes: booking?.notes ?? '',
      status: booking?.status ?? 'upcoming',
    }),
    [booking, prefillDate],
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  const totalAmount = watch('totalAmount');
  const advanceAmount = watch('advanceAmount');
  const occasionDate = watch('occasionDate');
  const time = watch('time');

  const balance = Math.max(0, (Number(totalAmount) || 0) - (Number(advanceAmount) || 0));

  // Double-booking check
  const conflictingBookings = useMemo(() => {
    if (!occasionDate || !time) return [];
    const ts = combineDateAndTime(occasionDate, time);
    return bookings.filter((b) => {
      if (booking && b.id === booking.id) return false;
      if (b.status === 'cancelled') return false;
      return b.eventDateTime === ts;
    });
  }, [bookings, occasionDate, time, booking]);

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const balance = Math.max(0, data.totalAmount - data.advanceAmount);
      const payload = {
        ...data,
        balanceAmount: balance,
      };
      if (mode === 'create') {
        const id = await createBooking(payload);
        toast.success('Booking created successfully.');
        router.push(`/bookings/${id}`);
        return;
      }
      if (booking) {
        await updateBooking(booking.id, payload);
        toast.success('Booking updated successfully.');
        router.push(`/bookings/${booking.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-maroon transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Customer Info */}
      <GlassCard variant="strong" className="p-6 animate-fade-in">
        <h3 className="mb-4 font-serif text-lg font-semibold text-maroon">Customer Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer Name" error={errors.customerName} required>
            <input {...register('customerName')} className={inputCls} placeholder="e.g. Priya Sharma" />
          </Field>
          <Field label="Phone (optional)" error={errors.phone}>
            <input {...register('phone')} className={inputCls} placeholder="+91 98765 43210" />
          </Field>
        </div>
      </GlassCard>

      {/* Service & Occasion */}
      <GlassCard variant="strong" className="p-6 animate-fade-in">
        <h3 className="mb-4 font-serif text-lg font-semibold text-maroon">Service & Occasion</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Service" error={errors.serviceName} required>
            <select {...register('serviceName')} className={selectCls}>
              <option value="">Select a service</option>
              {SERVICE_TYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Occasion Type" error={errors.occasionType} required>
            <select {...register('occasionType')} className={selectCls}>
              <option value="">Select occasion</option>
              {OCCASION_TYPES.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Booking Date" error={errors.bookingDate} required>
            <input type="date" {...register('bookingDate')} className={inputCls} />
          </Field>
          <Field label="Occasion Date" error={errors.occasionDate} required>
            <input type="date" {...register('occasionDate')} className={inputCls} />
          </Field>
          <Field label="Service Time" error={errors.time} required>
            <input type="time" {...register('time')} className={inputCls} />
          </Field>
          <Field label="Status" error={errors.status} required>
            <select {...register('status')} className={selectCls}>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address" error={errors.address} required>
              <textarea {...register('address')} className={inputCls + ' min-h-[60px] resize-y'} placeholder="Venue / home address" />
            </Field>
          </div>
        </div>

        {/* Double-booking warning */}
        {conflictingBookings.length > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50/60 border border-amber-200/60 p-3 animate-fade-in">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <p className="text-xs text-amber-700">
              Another booking exists at the same date and time:{' '}
              <span className="font-semibold">
                {conflictingBookings.map((b) => b.customerName).join(', ')}
              </span>
              . You can still save this booking.
            </p>
          </div>
        )}
      </GlassCard>

      {/* Payment */}
      <GlassCard variant="strong" className="p-6 animate-fade-in">
        <h3 className="mb-4 font-serif text-lg font-semibold text-maroon">Payment Details</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Total Amount (₹)" error={errors.totalAmount} required>
            <input type="number" min={0} step="1" {...register('totalAmount')} className={inputCls} placeholder="0" />
          </Field>
          <Field label="Advance Amount (₹)" error={errors.advanceAmount} required>
            <input type="number" min={0} step="1" {...register('advanceAmount')} className={inputCls} placeholder="0" />
          </Field>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Balance Amount</label>
            <div className="flex h-[46px] items-center rounded-xl bg-gold-50/60 border border-gold-200/40 px-4">
              <span className="font-semibold text-gold-700">{formatINR(balance)}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Notes */}
      <GlassCard variant="strong" className="p-6 animate-fade-in">
        <h3 className="mb-4 font-serif text-lg font-semibold text-maroon">Notes (optional)</h3>
        <textarea {...register('notes')} className={inputCls + ' min-h-[80px] resize-y'} placeholder="Any special requests or notes..." />
      </GlassCard>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-maroon to-maroon-600 px-6 py-3 text-sm font-semibold text-cream-50 shadow-lg shadow-maroon/30 transition hover:from-maroon-600 hover:to-maroon-700 disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4 transition group-hover:scale-110" />
              {mode === 'create' ? 'Create Booking' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  'w-full rounded-xl border border-border bg-white/50 backdrop-blur-sm py-3 px-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20 placeholder:text-muted-foreground/60';
const selectCls = inputCls + ' appearance-none cursor-pointer';

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: { message?: string };
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error?.message && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}