import 'dotenv/config';
import { auth } from '../src/config/firebase';

async function main() {
  if (!auth) {
    console.error('Firebase Admin is not configured. Ensure FIREBASE_* env vars or ADC are set.');
    process.exit(1);
  }
  const limitArg = process.argv.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;
  let pageToken: string | undefined = undefined;
  let count = 0;
  const rows: any[] = [];
  do {
    const res = await auth.listUsers(1000, pageToken);
    for (const u of res.users) {
      const row = {
        uid: u.uid,
        email: u.email || undefined,
        displayName: u.displayName || undefined,
        phoneNumber: u.phoneNumber || undefined,
        providerIds: u.providerData.map(p => p.providerId),
        disabled: u.disabled || false,
        creationTime: u.metadata.creationTime,
        lastSignInTime: u.metadata.lastSignInTime,
      };
      rows.push(row);
      count++;
      if (typeof limit === 'number' && count >= limit) break;
    }
    if (typeof limit === 'number' && count >= limit) break;
    pageToken = res.pageToken || undefined;
  } while (pageToken);

  // Sort by lastSignInTime desc if available
  rows.sort((a, b) => {
    const ta = a.lastSignInTime ? new Date(a.lastSignInTime).getTime() : 0;
    const tb = b.lastSignInTime ? new Date(b.lastSignInTime).getTime() : 0;
    return tb - ta;
  });

  console.log(JSON.stringify({ total: rows.length, users: rows }, null, 2));
}

main().catch(err => {
  console.error('Error listing auth users:', err);
  process.exit(1);
});
