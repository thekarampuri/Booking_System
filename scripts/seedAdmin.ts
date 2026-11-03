import { config } from 'dotenv';
import { resolve } from 'path';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

config({ path: resolve(process.cwd(), '.env.local') });

const ADMIN_EMAIL = 'admin@mahalaxmi.com';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || '12345678';

async function seedAdmin() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      'Missing Firebase Admin credentials. Add FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY to .env.local',
    );
    process.exit(1);
  }

  const app = getApps().length
    ? getApps()[0]!
    : initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });

  const auth = getAuth(app);

  try {
    const existing = await auth.getUserByEmail(ADMIN_EMAIL).catch(() => null);
    if (existing) {
      console.log(`Admin user already exists (${ADMIN_EMAIL}).`);
      console.log('Login with username: admin');
      process.exit(0);
    }

    const user = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: 'Mahalaxmi Admin',
      emailVerified: true,
    });

    console.log('Admin user created.');
    console.log(`  UID: ${user.uid}`);
    console.log('  Username: admin');
    console.log('  Mapped email (never shown in UI): admin@mahalaxmi.com');
    console.log('');
    console.log('WARNING: Change the default password in Settings before going live.');
  } catch (err) {
    console.error('Failed to seed admin user:', err);
    process.exit(1);
  }
}

seedAdmin();
