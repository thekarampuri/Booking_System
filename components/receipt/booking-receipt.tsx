'use client';

import React, { useState } from 'react';
import type { Booking } from '@/types/booking';
import { formatINR, formatDateLong, formatTime } from '@/utils/format';
import { MapPin, Phone, Mail, Instagram, Sparkles } from 'lucide-react';

interface BookingReceiptProps {
  booking: Booking;
}

export function BookingReceipt({ booking }: BookingReceiptProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  // If siders exist and price is set, compute base service price
  const hasSiders = Boolean(booking.sidersCount && booking.sidersCount > 0);
  const sidersPrice = Number(booking.sidersPrice || 0);
  const mainServiceAmount = hasSiders && sidersPrice > 0
    ? Math.max(0, booking.totalAmount - sidersPrice)
    : booking.totalAmount;

  return (
    <div
      className="receipt-container mx-auto w-full max-w-[800px] bg-white text-neutral-900 shadow-xl print:shadow-none print:max-w-none print:w-full print:m-0"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Decorative Top Accent Bar */}
      <div className="h-3 w-full bg-gradient-to-r from-[#7F1740] via-[#CC9F40] to-[#7F1740]" />

      <div className="p-8 sm:p-10 print:p-8">
        {/* ================= HEADER SECTION ================= */}
        <div className="receipt-header flex flex-col gap-6 border-b-2 border-[#7F1740]/15 pb-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand Info with proper logo alignment */}
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#CC9F40]/40 bg-[#7F1740] p-1 shadow-sm">
              {!logoFailed ? (
                <img
                  src="/logo.png"
                  alt="Mahalaxmi Beauty Salon & Academy"
                  className="h-full w-full object-contain rounded-xl"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <Sparkles className="h-10 w-10 text-[#CC9F40]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-2xl font-bold tracking-tight text-[#7F1740]"
                  style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                >
                  Mahalaxmi Beauty Salon
                </h1>
              </div>
              <p className="text-sm font-semibold tracking-wider uppercase text-[#CC9F40]">
                & Academy • Professional Makeup & Hair Artistry
              </p>

              {/* Address & Contact Info (Requested exact address) */}
              <div className="mt-2.5 space-y-1 text-xs text-neutral-600">
                <p className="flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#7F1740] mt-0.5" />
                  <span>
                    1434, Markandeya Rugnalaya Rd, Beside Mohan Medical, Datta Nagar, Solapur, Maharashtra 413005.
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#7F1740]" />
                    <a href="tel:9175085070" className="hover:underline font-medium text-neutral-800">
                      9175085070
                    </a>
                    ,{' '}
                    <a href="tel:8767029358" className="hover:underline font-medium text-neutral-800">
                      8767029358
                    </a>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-[#7F1740]" />
                    <a
                      href="mailto:mahalaxmibeautysalon01@gmail.com"
                      className="hover:underline font-medium text-neutral-800"
                    >
                      mahalaxmibeautysalon01@gmail.com
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Receipt Header Meta (ID & header balance badge removed as requested) */}
          <div className="flex flex-col sm:items-end text-left sm:text-right shrink-0">
            <div className="inline-block rounded-lg bg-[#7F1740] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#FFF8EE]">
              Booking Receipt
            </div>
            <p className="text-xs text-neutral-500 mt-2.5">
              Issued: {formatDateLong(new Date(booking.createdAt || Date.now()).toISOString().split('T')[0])}
            </p>
          </div>
        </div>

        {/* ================= BILLED TO & EVENT SCHEDULE ================= */}
        <div className="receipt-details my-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Customer Card */}
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7F1740]">
              Customer Details
            </p>
            <h3 className="mt-1 text-lg font-bold text-neutral-900">
              {booking.customerName}
            </h3>
            {booking.phone && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-700">
                <Phone className="h-3.5 w-3.5 text-[#CC9F40]" />
                <span className="font-medium">{booking.phone}</span>
              </p>
            )}
            {booking.address && (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-neutral-600">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#CC9F40] mt-0.5" />
                <span>{booking.address}</span>
              </p>
            )}
          </div>

          {/* Event Schedule Card */}
          <div className="rounded-xl border border-[#CC9F40]/30 bg-[#FFF8EE]/60 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C6A26]">
              Occasion & Schedule
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-base font-bold text-[#7F1740]">
                {booking.occasionType}
              </span>
              <span className="rounded-md bg-[#7F1740]/10 px-2 py-0.5 text-xs font-semibold text-[#7F1740]">
                {booking.serviceName}
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-neutral-500 block">Occasion Date:</span>
                <span className="font-semibold text-neutral-900">{formatDateLong(booking.occasionDate)}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Scheduled Time:</span>
                <span className="font-semibold text-neutral-900">{formatTime(booking.time)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= ITEMIZED SERVICES TABLE ================= */}
        <div className="receipt-table overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#7F1740] text-xs font-semibold uppercase tracking-wider text-[#FFF8EE]">
              <tr>
                <th className="py-3 px-4">Service Description</th>
                <th className="py-3 px-4">Event Date & Time</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {/* Main Service */}
              <tr className="page-break-inside-avoid">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-neutral-900">{booking.serviceName}</div>
                  <div className="text-xs text-neutral-500">Occasion: {booking.occasionType}</div>
                </td>
                <td className="py-3.5 px-4 text-xs">
                  <div>{formatDateLong(booking.occasionDate)}</div>
                  <div className="text-neutral-500">at {formatTime(booking.time)}</div>
                </td>
                <td className="py-3.5 px-4 text-right font-medium text-neutral-900">
                  {formatINR(mainServiceAmount)}
                </td>
              </tr>

              {/* Siders Makeups (if specified) */}
              {hasSiders && (
                <tr className="page-break-inside-avoid bg-neutral-50/40">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-neutral-900">
                      Sider Makeup ({booking.sidersCount} Person{Number(booking.sidersCount) > 1 ? 's' : ''})
                    </div>
                    <div className="text-xs text-neutral-500">Additional party / guest makeups</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <div>{formatDateLong(booking.occasionDate)}</div>
                    <div className="text-neutral-500">at {formatTime(booking.time)}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-neutral-900">
                    {formatINR(sidersPrice)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Financial Summary Box */}
          <div className="receipt-summary border-t border-neutral-200 bg-neutral-50/80 p-4 page-break-inside-avoid">
            <div className="flex flex-col items-end gap-2 text-sm">
              <div className="flex w-full max-w-xs justify-between text-neutral-600">
                <span>Total Amount:</span>
                <span className="font-medium text-neutral-900">{formatINR(booking.totalAmount)}</span>
              </div>
              <div className="flex w-full max-w-xs justify-between text-green-700">
                <span className="font-medium">Advance Paid:</span>
                <span className="font-semibold">(-) {formatINR(booking.advanceAmount)}</span>
              </div>
              <div className="mt-1 flex w-full max-w-xs justify-between border-t-2 border-[#7F1740] pt-2 text-base font-bold text-[#7F1740]">
                <span>Balance Due:</span>
                <span className="text-lg">{formatINR(booking.balanceAmount)}</span>
              </div>
              {booking.balanceAmount > 0 && (
                <p className="text-[11px] text-neutral-500 italic">
                  * Balance payable on or before occasion date
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Special Notes (if present) */}
        {booking.notes && (
          <div className="receipt-notes mt-4 rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 text-xs page-break-inside-avoid">
            <span className="font-semibold text-amber-900">Special Notes: </span>
            <span className="text-neutral-700 whitespace-pre-wrap">{booking.notes}</span>
          </div>
        )}

        {/* ================= TERMS & CONDITIONS + SIGNATURE + STAMP ================= */}
        <div className="receipt-footer mt-8 grid grid-cols-1 gap-6 border-t-2 border-[#7F1740]/15 pt-6 sm:grid-cols-12 page-break-inside-avoid">
          {/* Left: Terms & Conditions */}
          <div className="sm:col-span-7">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7F1740]">
              Terms & Conditions:
            </h4>
            <ul className="mt-2 space-y-1.5 text-xs text-neutral-600">
              <li className="flex items-start gap-1.5">
                <span className="text-[#CC9F40] font-bold">•</span>
                <span>A 50% advance is required.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#CC9F40] font-bold">•</span>
                <span>Travel and accommodation charges are additional.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#CC9F40] font-bold">•</span>
                <span className="font-medium text-neutral-700">Advance payment is non-refundable.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#CC9F40] font-bold">•</span>
                <span>Hair accessories (flowers charges are additional).</span>
              </li>
            </ul>
          </div>

          {/* Right: Circular Official Stamp & Signature Block */}
          <div className="flex flex-col justify-between sm:col-span-5 sm:items-end">
            {/* Circular Stamp & Signature Area */}
            <div className="flex flex-col items-center sm:items-end">
              {/* Circular Salon Stamp Design */}
              <div className="relative mb-2 flex items-center justify-center">
                <svg
                  width="105"
                  height="105"
                  viewBox="0 0 120 120"
                  className="select-none text-[#7F1740] drop-shadow-sm -rotate-6"
                >
                  {/* Outer double circle */}
                  <circle cx="60" cy="60" r="56" fill="none" stroke="#7F1740" strokeWidth="2.5" />
                  <circle cx="60" cy="60" r="51.5" fill="none" stroke="#7F1740" strokeWidth="1" strokeDasharray="3 2" />
                  <circle cx="60" cy="60" r="35" fill="none" stroke="#7F1740" strokeWidth="1.5" />

                  {/* Circular Text Paths */}
                  <defs>
                    <path
                      id="stampArcTop"
                      d="M 18,60 A 42,42 0 1,1 102,60"
                      fill="none"
                    />
                    <path
                      id="stampArcBottom"
                      d="M 102,60 A 42,42 0 0,1 18,60"
                      fill="none"
                    />
                  </defs>

                  <text fill="#7F1740" fontSize="7.8" fontWeight="800" letterSpacing="0.8">
                    <textPath href="#stampArcTop" startOffset="50%" textAnchor="middle">
                      MAHALAXMI BEAUTY SALON
                    </textPath>
                  </text>

                  <text fill="#7F1740" fontSize="7.2" fontWeight="800" letterSpacing="0.6">
                    <textPath href="#stampArcBottom" startOffset="50%" textAnchor="middle">
                      ★ & ACADEMY • SOLAPUR ★
                    </textPath>
                  </text>

                  {/* Center of stamp */}
                  <text x="60" y="54" textAnchor="middle" fill="#7F1740" fontSize="7" fontWeight="bold" letterSpacing="0.8">
                    OFFICIAL
                  </text>
                  <text x="60" y="66" textAnchor="middle" fill="#7F1740" fontSize="9" fontWeight="900" letterSpacing="1.2">
                    SEAL
                  </text>
                  <text x="60" y="75" textAnchor="middle" fill="#CC9F40" fontSize="6.5" fontWeight="bold">
                    ★ ★ ★
                  </text>
                </svg>
              </div>

              {/* Signature Line */}
              <div className="w-48 border-t border-neutral-400 pt-1 text-center sm:text-right">
                <p className="text-xs font-semibold text-neutral-800">Authorized Signature</p>
                <p className="text-[10px] text-neutral-500">Mahalaxmi Beauty Salon & Academy</p>
              </div>
            </div>

            {/* Instagram Follow Links in Bottom Right Corner (as requested) */}
            <div className="mt-6 rounded-xl border border-[#CC9F40]/30 bg-[#FFF8EE]/60 p-3 text-left sm:text-right w-full sm:w-auto">
              <p className="flex items-center gap-1.5 text-xs font-bold text-[#7F1740] sm:justify-end">
                <Instagram className="h-3.5 w-3.5 text-[#CC9F40]" />
                Follow us on:
              </p>
              <div className="mt-1.5 flex flex-col gap-1 text-xs sm:items-end">
                <a
                  href="https://www.instagram.com/mahalaxmi_beauty_salon__?igsh=eW8wYjBvbGpndW8y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#7F1740] hover:text-[#CC9F40] hover:underline transition"
                >
                  @mahalaxmi_beauty_salon__
                </a>
                <a
                  href="https://www.instagram.com/makeup_artist_shravani_?igsh=OGt3ZmR2enI1b2hu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#7F1740] hover:text-[#CC9F40] hover:underline transition"
                >
                  @makeup_artist_shravani_
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FINAL FOOTER BAR ================= */}
        <div className="mt-8 border-t border-neutral-100 pt-4 text-center text-[11px] text-neutral-400 page-break-inside-avoid">
          <p>
            Thank you for choosing <span className="font-semibold text-neutral-600">Mahalaxmi Beauty Salon & Academy</span>! We look forward to making your occasion extraordinary.
          </p>
        </div>
      </div>

      {/* Decorative Bottom Accent Bar */}
      <div className="h-1.5 w-full bg-[#7F1740]" />
    </div>
  );
}
