import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

admin.initializeApp();

const db = admin.firestore();

// University and company domain allowlists (in production, store in Firestore config)
const UNIVERSITY_DOMAINS = ['edu', 'ac.uk', 'edu.au']; // Simplified - check TLD
const COMPANY_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com']; // Simplified - in production use actual allowlist

export const startEmailVerification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { email } = data;
  const uid = context.auth.uid;

  // Check if domain is already verified
  const userDoc = await db.collection('users').doc(uid).get();
  if (userDoc.exists && userDoc.data()?.domainVerified) {
    throw new functions.https.HttpsError('already-exists', 'Domain already verified');
  }

  // Generate verification code
  const code = crypto.randomInt(100000, 999999).toString();
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
  const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes

  // Store verification data
  await db.collection('verifications').doc(uid).set({
    codeHash: hashedCode,
    email,
    type: 'domain',
    expiresAt,
    attempts: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Send email (replace with your email service)
  console.log(`Verification code for ${email}: ${code}`);
  // TODO: Integrate with SendGrid/Resend

  return { success: true };
});

export const confirmEmailVerification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { code } = data;
  const uid = context.auth.uid;

  const verificationDoc = await db.collection('verifications').doc(uid).get();
  if (!verificationDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'No verification in progress');
  }

  const verification = verificationDoc.data()!;
  const now = admin.firestore.Timestamp.now();

  if (verification.expiresAt.toDate() < now.toDate()) {
    throw new functions.https.HttpsError('deadline-exceeded', 'Verification code expired');
  }

  if (verification.attempts >= 3) {
    throw new functions.https.HttpsError('resource-exhausted', 'Too many attempts');
  }

  const hashedInput = crypto.createHash('sha256').update(code).digest('hex');
  if (hashedInput !== verification.codeHash) {
    // Increment attempts
    await db.collection('verifications').doc(uid).update({
      attempts: admin.firestore.FieldValue.increment(1)
    });
    throw new functions.https.HttpsError('invalid-argument', 'Invalid verification code');
  }

  // Extract domain and determine type
  const domain = verification.email.split('@')[1];
  const isUniversity = UNIVERSITY_DOMAINS.some(tld => domain.endsWith(tld));
  const domainType = isUniversity ? 'university' : 'company';

  // Update user profile
  await db.collection('users').doc(uid).update({
    domainVerified: true,
    domainType,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Clean up verification
  await db.collection('verifications').doc(uid).delete();

  return { success: true, domainType };
});

export const upsertUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const uid = context.auth.uid;
  const profileData = data;

  // Validate required fields
  if (!profileData.role || !profileData.primaryEmail) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  // Additional validation based on role
  if (profileData.role === 'student') {
    if (!profileData.university || !profileData.program || !profileData.startDate || !profileData.endDate) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing student fields');
    }
  } else if (profileData.role === 'professional') {
    if (!profileData.company || !profileData.title) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing professional fields');
    }
  }

  // Upsert profile
  await db.collection('users').doc(uid).set({
    ...profileData,
    id: uid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return { success: true };
});
