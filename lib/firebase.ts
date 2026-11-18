import { initializeApp, getApps, deleteApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function isConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.authDomain &&
      firebaseConfig.appId,
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

/**
 * Initializes Firebase client-side services.
 * Must be called inside a useEffect (client-only) — never at module level.
 * Safe to call multiple times; subsequent calls are no-ops once initialized.
 */
export function ensureClient(): void {
  if (typeof window === 'undefined') return;
  if (!isConfigured()) return;
  if (app) return;

  try {
    // In dev (HMR), stale app instances can exist. Always create a fresh one
    // to avoid "Service firestore is not available" from corrupted app state.
    const existing = getApps();
    if (existing.length > 0) {
      try {
        // Try to reuse — if Firestore init fails we'll delete and re-create below
        app = existing[0];
        auth = getAuth(app);
        db = getFirestore(app);
      } catch {
        // Stale app — delete it and re-initialize fresh
        deleteApp(existing[0]).catch(() => {});
        app = null;
        auth = null;
        db = null;
        const fresh = initializeApp(firebaseConfig);
        app = fresh;
        auth = getAuth(fresh);
        db = getFirestore(fresh);
      }
    } else {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    }

    if (firebaseConfig.measurementId) {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app!);
        }
      });
    }
  } catch (err) {
    console.error('[Firebase] Initialization failed:', err);
    // Reset so next call retries
    app = null;
    auth = null;
    db = null;
  }
}

export { app, auth, db, analytics };
export const ADMIN_EMAIL = 'admin@mahalaxmi.com';
export const ADMIN_USERNAME = 'admin';
