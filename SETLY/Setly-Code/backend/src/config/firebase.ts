import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

// Ensure env vars from .env are loaded before reading them
dotenv.config();

// Strategy (in order):
// 1) Explicit env vars FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY
// 2) GOOGLE_APPLICATION_CREDENTIALS pointing to a service account JSON file (ADC)
// 3) FIREBASE_SERVICE_ACCOUNT_JSON containing the full JSON string
// If none found, Admin SDK remains disabled.

const hasFirebaseCreds = !!(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);
const hasADC = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
const hasInlineJSON = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

let auth: admin.auth.Auth | null = null;
let db: admin.firestore.Firestore | null = null;

try {
  if (hasFirebaseCreds) {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n')
      })
    });
    auth = app.auth();
    db = app.firestore();
    console.log('[Firebase] Admin initialized from FIREBASE_* env vars');
  } else if (hasADC) {
    const app = admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    auth = app.auth();
    db = app.firestore();
    console.log('[Firebase] Admin initialized from GOOGLE_APPLICATION_CREDENTIALS (ADC)');
  } else if (hasInlineJSON) {
    const json = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
    const app = admin.initializeApp({
      credential: admin.credential.cert(json)
    });
    auth = app.auth();
    db = app.firestore();
    console.log('[Firebase] Admin initialized from FIREBASE_SERVICE_ACCOUNT_JSON');
  } else {
    console.warn('[Firebase] Admin SDK disabled (no credentials found). Features depending on admin will be unavailable.');
  }
} catch (e) {
  console.error('[Firebase] Failed to initialize Admin SDK:', e);
}

export { auth, db, hasFirebaseCreds };