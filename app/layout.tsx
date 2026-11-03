import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mahalaxmi Beauty Salon & Academy',
  description:
    'Manage makeup bookings, view the calendar, and track upcoming events for Mahalaxmi Beauty Salon & Academy.',
  openGraph: {
    title: 'Mahalaxmi Beauty Salon & Academy',
    description: 'Booking management system for Mahalaxmi Beauty Salon & Academy.',
  },
};

export const viewport: Viewport = {
  themeColor: '#7F1740',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
