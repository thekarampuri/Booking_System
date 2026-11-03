import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { Resend } from 'resend';
import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const querySecret = request.nextUrl.searchParams.get('secret');

  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
  }

  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (bearer !== secret && querySecret !== secret) {
    return unauthorized();
  }

  const now = Date.now();
  const windowStart = now + 47 * 60 * 60 * 1000;
  const windowEnd = now + 48 * 60 * 60 * 1000;

  try {
    const db = getAdminDb();
    const snap = await db
      .collection('bookings')
      .where('reminderSent', '==', false)
      .where('eventDateTime', '>=', Timestamp.fromMillis(windowStart))
      .where('eventDateTime', '<=', Timestamp.fromMillis(windowEnd))
      .get();

    const due = snap.docs.filter((doc) => doc.data().status === 'upcoming');

    if (due.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: 'No reminders due' });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || 'Mahalaxmi Salon <noreply@mahalaxmi.local>';
    const to = process.env.ADMIN_NOTIFY_EMAIL || 'admin@mahalaxmi.com';
    const resend = resendKey ? new Resend(resendKey) : null;

    let sent = 0;
    const errors: string[] = [];

    for (const doc of due) {
      const data = doc.data();
      const eventMs =
        data.eventDateTime instanceof Timestamp
          ? data.eventDateTime.toMillis()
          : Number(data.eventDateTime);

      if (resend) {
        try {
          await resend.emails.send({
            from,
            to,
            subject: `Reminder: ${data.customerName} in ~48 hours`,
            html: `
              <h2>Upcoming booking at Mahalaxmi Beauty Salon & Academy</h2>
              <p><strong>Customer:</strong> ${data.customerName}</p>
              <p><strong>Service:</strong> ${data.serviceName}</p>
              <p><strong>Occasion:</strong> ${data.occasionType}</p>
              <p><strong>When:</strong> ${new Date(eventMs).toLocaleString('en-IN')}</p>
              <p><strong>Address:</strong> ${data.address ?? ''}</p>
              <p><strong>Phone:</strong> ${data.phone ?? '—'}</p>
            `,
          });
        } catch (err) {
          errors.push(err instanceof Error ? err.message : String(err));
        }
      }

      await doc.ref.update({ reminderSent: true, updatedAt: Timestamp.now() });
      sent += 1;
    }

    return NextResponse.json({
      ok: true,
      sent,
      emailed: Boolean(resend),
      errors,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cron failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
