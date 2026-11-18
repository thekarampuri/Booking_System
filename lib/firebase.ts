import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
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

export function ensureClient(): void {
  if (!isConfigured()) return;
  if (app && db) return;

  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      isSupported()
        .then((supported) => {
          if (supported && app) {
            analytics = getAnalytics(app);
          }
        })
        .catch(() => {});
    }
  } catch (err) {
    console.error('[Firebase] Initialization error:', err);
  }
}

// Initialize on module load so db/auth are populated
ensureClient();

export function getDb(): Firestore | null {
  if (!db) {
    ensureClient();
  }
  return db;
}

export { app, auth, db, analytics };
export const ADMIN_EMAIL = 'admin@mahalaxmi.com';
export const ADMIN_USERNAME = 'admin';
