import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Booking, BookingInput, BookingStatus } from '@/types/booking';
import { combineDateAndTime } from '@/utils/format';

const COLLECTION = 'bookings';

function normalize(data: DocumentData, id: string): Booking {
  const eventDateTime =
    data.eventDateTime instanceof Timestamp
      ? data.eventDateTime.toMillis()
      : typeof data.eventDateTime === 'number'
        ? data.eventDateTime
        : 0;

  return {
    id,
    customerName: data.customerName ?? '',
    serviceName: data.serviceName ?? '',
    bookingDate: data.bookingDate ?? '',
    occasionDate: data.occasionDate ?? '',
    occasionType: data.occasionType ?? '',
    time: data.time ?? '',
    eventDateTime,
    address: data.address ?? '',
    totalAmount: Number(data.totalAmount ?? 0),
    advanceAmount: Number(data.advanceAmount ?? 0),
    balanceAmount: Number(data.balanceAmount ?? 0),
    phone: data.phone ?? '',
    notes: data.notes ?? '',
    status: data.status ?? 'upcoming',
    reminderSent: data.reminderSent ?? false,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
  };
}

export function subscribeToBookings(
  cb: (bookings: Booking[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  if (!db) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, COLLECTION), orderBy('eventDateTime', 'desc'));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => normalize(d.data(), d.id))),
    (err) => onError?.(err as Error),
  );
}

export function subscribeToBookingsByStatus(
  status: BookingStatus,
  cb: (bookings: Booking[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  if (!db) {
    cb([]);
    return () => {};
  }
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', status),
    orderBy('eventDateTime', status === 'upcoming' ? 'asc' : 'desc'),
  );
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => normalize(d.data(), d.id))),
    (err) => onError?.(err as Error),
  );
}

export async function createBooking(input: BookingInput): Promise<string> {
  if (!db) throw new Error('Database not initialized. Check your Firebase configuration.');
  const payload = {
    ...input,
    eventDateTime: Timestamp.fromMillis(combineDateAndTime(input.occasionDate, input.time)),
    reminderSent: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COLLECTION), payload);
  return ref.id;
}

export async function updateBooking(id: string, input: Partial<BookingInput>): Promise<void> {
  if (!db) throw new Error('Database not initialized. Check your Firebase configuration.');
  const update: Record<string, unknown> = { ...input, updatedAt: serverTimestamp() };
  if (input.occasionDate && input.time) {
    update.eventDateTime = Timestamp.fromMillis(
      combineDateAndTime(input.occasionDate, input.time),
    );
  }
  await updateDoc(doc(db, COLLECTION, id), update as { [x: string]: any });
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
  if (!db) throw new Error('Database not initialized. Check your Firebase configuration.');
  await updateDoc(doc(db, COLLECTION, id), { status, updatedAt: serverTimestamp() });
}

export async function setReminderSent(id: string): Promise<void> {
  if (!db) throw new Error('Database not initialized. Check your Firebase configuration.');
  await updateDoc(doc(db, COLLECTION, id), {
    reminderSent: true,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBooking(id: string): Promise<void> {
  if (!db) throw new Error('Database not initialized. Check your Firebase configuration.');
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getBookingById(id: string): Promise<Booking | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return normalize(snap.data(), snap.id);
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to load booking.');
  }
}
