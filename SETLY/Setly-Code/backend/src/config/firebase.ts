import * as admin from 'firebase-admin';

const hasFirebaseCreds = !!(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

let auth: admin.auth.Auth | null = null;
let db: admin.firestore.Firestore | null = null;

if (hasFirebaseCreds) {
  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
  auth = app.auth();
  db = app.firestore();
} else {
  console.warn('[Firebase] Admin SDK disabled (missing env vars). Features depending on admin will be unavailable.');
}

export { auth, db, hasFirebaseCreds };