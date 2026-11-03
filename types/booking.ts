export const BOOKING_STATUSES = ['upcoming', 'completed', 'cancelled'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const SERVICE_TYPES = [
  'Bridal Makeup',
  'Party Makeup',
  'Engagement Makeup',
  'Reception Makeup',
  'Hairstyling',
  'Mehndi / Henna',
  'Nail Art',
  'Facial & Skincare',
  'Pre-Bridal Package',
  'Hair Spa',
  'Other',
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const OCCASION_TYPES = [
  'Wedding',
  'Engagement',
  'Reception',
  'Birthday',
  'Photoshoot',
  'Festival',
  'Corporate Event',
  'Baby Shower',
  'Other',
] as const;
export type OccasionType = (typeof OCCASION_TYPES)[number];

export interface Booking {
  id: string;
  customerName: string;
  serviceName: string;
  bookingDate: string;
  occasionDate: string;
  occasionType: string;
  time: string;
  eventDateTime: number;
  address: string;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  phone?: string;
  notes?: string;
  status: BookingStatus;
  reminderSent?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type BookingInput = Omit<
  Booking,
  'id' | 'createdAt' | 'updatedAt' | 'balanceAmount' | 'reminderSent' | 'eventDateTime'
> & {
  balanceAmount: number;
};

export interface BookingFormValues {
  customerName: string;
  serviceName: string;
  bookingDate: string;
  occasionDate: string;
  occasionType: string;
  time: string;
  address: string;
  totalAmount: number;
  advanceAmount: number;
  phone?: string;
  notes?: string;
  status: BookingStatus;
}
