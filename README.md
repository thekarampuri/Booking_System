# Mahalaxmi Beauty Salon & Academy

Production-ready booking manager for makeup appointments across the year. Staff sign in as a single admin, add bookings, and browse them on a glassmorphic month/year calendar with 48-hour reminders.

**Default login (change before going live)**

- Username: `admin`
- Password: `12345678`

The UI never shows an email address. Firebase Auth still needs one internally, so the username `admin` is mapped to `admin@mahalaxmi.com`.

> **Security warning:** Change the default password in **Settings** before deploying this app for real use.

---

## Stack

- Next.js 14 (App Router), React, TypeScript
- Tailwind CSS, lucide-react
- Firebase Authentication (Email/Password) and Cloud Firestore
- date-fns, react-hook-form, zod
- Deployable on Vercel

---

## 1. Firebase project setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create a **Cloud Firestore** database (start in production mode, then deploy the rules in this repo).
4. Register a **Web app** and copy the config values.
5. **Project Settings → Service accounts → Generate new private key** for the Admin SDK (seed script + cron).

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Client SDK (auth + Firestore) |
| `FIREBASE_ADMIN_PROJECT_ID` | Admin SDK |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Admin SDK |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Admin SDK (keep the `\n` escapes inside quotes) |
| `ADMIN_SEED_PASSWORD` | One-time admin user creation |
| `CRON_SECRET` | Protects `/api/cron/reminders` |
| `RESEND_API_KEY` / `RESEND_FROM` / `ADMIN_NOTIFY_EMAIL` | Optional email reminders |

Keep `.env.local` out of git. It is already listed in `.gitignore`.

### Firestore rules and indexes

From the project root (requires [Firebase CLI](https://firebase.google.com/docs/cli)):

```bash
firebase login
firebase use --add   # select your project
firebase deploy --only firestore:rules,firestore:indexes
```

Rules allow **read/write only for authenticated users**. Composite indexes cover:

- `status` + `eventDateTime` (list queries)
- `reminderSent` + `eventDateTime` (cron reminders)

You can also paste `firestore.rules` in the Firebase Console and let Firestore prompt you to create indexes when a query first runs.

---

## 2. Create the admin user

Install dependencies, then run the seed script once:

```bash
npm install
npm run seed:admin
```

This uses the Firebase Admin SDK to create `admin@mahalaxmi.com` with password `12345678` (or `ADMIN_SEED_PASSWORD` if set). If the user already exists, the script exits without changing the password.

---

## 3. Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login` until you sign in.

Place your salon logo at `public/logo.png`. Until that file exists, a styled icon fallback is shown next to **Mahalaxmi Beauty Salon & Academy**.

```bash
npm run typecheck
npm run build
```

---

## 4. Deploy to Firebase Hosting (Live)

Your project is configured with Firebase Web Frameworks for Next.js App Router support:

1. **Login to Firebase CLI:**
   ```bash
   npx firebase login
   ```
   *(This opens a browser window for Google authentication with the account that owns `bookings-a636c`)*

2. **Deploy rules, indexes, and web app:**
   ```bash
   npm run deploy
   ```
   Or deploy hosting only:
   ```bash
   npm run deploy:hosting
   ```

3. **Your Live URL:**
   - `https://bookings-a636c.web.app`
   - `https://bookings-a636c.firebaseapp.com`

> **Note on Firebase Plans:** Firebase Hosting for Next.js App Router utilizes Cloud Functions for server routes, which requires the **Blaze (Pay-As-You-Go)** plan (free tier includes 2 million requests/month). If you are on the free Spark plan, enable Blaze in your Firebase Console under **Usage and billing**.

---

## 5. Deploy on Vercel (Alternative)

1. Push this repository to GitHub (or import the folder in Vercel).
2. Create a Vercel project from the repo. Framework preset: **Next.js**.
3. Add the same environment variables from `.env.example` in **Project → Settings → Environment Variables**.
4. Deploy. After the first deploy, add `CRON_SECRET` and the Admin SDK keys if you want background reminders.

Vercel Cron is defined in `vercel.json` and runs **hourly**:

```
GET /api/cron/reminders
Authorization: Bearer <CRON_SECRET>
```

---

## 5. 48-hour reminder system

### In-app (always on)

- Dashboard **Reminders** list and a dismissible gold banner.
- Header bell with a live badge, refreshed every minute.
- Browser **Web Notifications** when the app is open and a booking first enters the next 48 hours. Permission is requested when the bell is opened. A local flag plus `reminderSent` on the booking document prevent repeats.

### Background (optional)

`app/api/cron/reminders/route.ts` finds upcoming bookings whose `eventDateTime` is **47–48 hours** away and `reminderSent` is `false`. It then:

1. Sends an email via [Resend](https://resend.com) if `RESEND_API_KEY` is set.
2. Sets `reminderSent = true`.

**Setup**

1. Create a Resend account and verify a sending domain.
2. Set `RESEND_API_KEY`, `RESEND_FROM` (must use that domain), `ADMIN_NOTIFY_EMAIL`, and a long random `CRON_SECRET`.
3. Deploy to Vercel (Hobby plans have limited cron frequency; Pro is recommended for hourly jobs).
4. Test locally:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/reminders
```

Firebase Cloud Messaging push is not wired in this version; email is the background channel. You can add FCM later using the same cron route.

---

## App map

| Route | Purpose |
| --- | --- |
| `/login` | Username + password admin login |
| `/` | Dashboard, stats, 48h reminders |
| `/bookings/new` | New booking (`?date=YYYY-MM-DD` pre-fills occasion date) |
| `/bookings/upcoming` | Future bookings |
| `/bookings/previous` | Past / completed / cancelled |
| `/bookings/[id]` | Detail, complete, delete, print/PDF receipt |
| `/bookings/[id]/edit` | Edit booking |
| `/calendar` | Month grid + year heat map |
| `/settings` | Change password |

Amounts display in INR (`en-IN`). Dates use **DD MMM YYYY** with 12-hour time.

---

## Recommended next improvements

- WhatsApp reminders (Twilio or Meta Cloud API) for the customer and the admin.
- Branded PDF invoices (jsPDF or a print CSS template with GST fields).
- A staff role in addition to admin, with scoped permissions in Firestore rules.
- Firebase Cloud Messaging for push when the browser is closed.
- Customer phone uniqueness and WhatsApp deep links from the booking card.

---

## License

Private salon software. All rights reserved by Mahalaxmi Beauty Salon & Academy.
